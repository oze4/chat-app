import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import { sessionService } from "@/server/db/services/index.js";
import { generateSessionToken } from "@/server/generateTokens.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

export default function useJwtSession({ onError = (_req: Request, _res: Response, _next: NextFunction) => {} } = {}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { session } = req.cookies;
      if (!session) {
        return onError(req, res, next);
      }

      const decodedToken = await verifyJwtAsync(session, process.env.JWT_SIGNATURE || "");
      if (decodedToken) {
        return next();
      }

      // Here session is expired. Check DB to see if it matches with current session, if it does, refresh it.
      if (await handleSessionRefresh(session, req, res)) {
        return next();
      }
      return onError(req, res, next);
    } catch (e) {
      return onError(req, res, next);
    }
  };
}

async function verifyJwtAsync(token: string, secret: string) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return resolve(null);
        }
        return reject(err);
      } else {
        return resolve(decoded);
      }
    });
  });
}

async function handleSessionRefresh(receivedSessionToken: string, req: Request, res: Response) {
  const { db, release } = await req.databasePool.getConnection();
  try {
    const decodedToken = jsonwebtoken.decode(receivedSessionToken) as SessionToken;
    if (!decodedToken.id) {
      console.log(`[useJwt][ERROR] no id found in decoded session token`);
      release();
      return false;
    }

    console.log(`[useJwt][INFO][id:${decodedToken?.id}] session token is expired. session token has id. Checking if received session token is the same as sessionToken we have in database.`);
    // Get existing session token from db.
    const existingSession = await sessionService.selectByUserId(db, decodedToken.id);
    console.log({ from: "useJwtSession", "String(existingSession.token)": String(existingSession.token) });
    // If no existing token, or existing token missing "token" column, or mismatch force user to reauth.
    if (!existingSession || !existingSession.token || String(existingSession.token) !== receivedSessionToken) {
      console.log(`[useJwt][ERROR] either no existing session token is stored in our DB or there is a token mismatch!`, { existing: existingSession?.token, received: receivedSessionToken });
      release();
      return false;
    }

    console.log(`[useJwt][INFO][id:${decodedToken?.id}] it is the same, generating new token`);
    // Now we have the "OK" to generate a new token..
    const sessionToken = generateSessionToken(decodedToken.name, decodedToken.id, decodedToken.email);

    // Update refresh token in db to newly generated refresh token.
    await sessionService.update(db, decodedToken.id, sessionToken);
    req.databasePool.releaseConnection(db);

    // Update client side cookie
    res.cookie("session", sessionToken, { maxAge: ONE_DAY, httpOnly: true });

    return true;
  } catch (e) {
    console.log(`[jwtSession][error] `, e);
    return false;
  }
}
