import nodeFs from "node:fs";
import { backupDatabase, BACKUP_FILE_PATH, DATABASE_PATH } from "./database";
import { updateGist } from "./gist";
import dotenv from "dotenv";
dotenv.config();

const { log, error } = console;

if (require.main === module) {
  (async () => {
    await backupDatabaseToGist();
  })();
}

export default async function backupDatabaseToGist() {
  if (!process.env.GH_GISTS_API_KEY) {
    return error("[backupDbAndUploadGist] gists api key not found.");
  }
  if (!process.env.GIST_ID) {
    return error("[backupDbAndUploadGist] gist id not found");
  }

  try {
    log("[backupDbAndUploadGist][BEGIN]");

    // Backup db to file
    log(" -> Database backup started");
    await backupDatabase(DATABASE_PATH, BACKUP_FILE_PATH);
    log("  -> Database backup complete");

    log(" -> Uploading gist.");
    // Update our gist with new data
    await updateGist(process.env.GH_GISTS_API_KEY, process.env.GIST_ID, [BACKUP_FILE_PATH]);
    log("  -> Uploaded gist.");

    // Delete local backup file after uploading gist
    log("-> Removing backup file.");
    nodeFs.unlinkSync(BACKUP_FILE_PATH);

    log("\n[backupDbAndUploadGist][SUCCESS] Done.\n");
  } catch (e) {
    if (nodeFs.existsSync(BACKUP_FILE_PATH)) {
      nodeFs.unlinkSync(BACKUP_FILE_PATH);
    }
    error(`[backupDbAndUploadGist][ERROR]`, e);
  }
}
