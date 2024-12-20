const wsapp = new WebSocketApp(WEBSOCKET_URL);

wsapp.catch((error) => {
  console.error(`[wsapp][ERROR]`, error);
});

wsapp.on(EventType.SEND_MESSAGE, (_socket, { userId, userName, messageText }) => {
  handleMessage(userName, messageText, userId);
});

/**
 *
 * @event {ENTER_ROOM}
 *
 */
wsapp.on(EventType.ENTER_ROOM, (_, { error, members, messages }) => {
  if (error) {
    throw error;
  }
  handleEnteredRoom(members, messages);
});

/**
 *
 * @event {LIST_ROOMS}
 *
 */
wsapp.on(EventType.LIST_ROOMS, (_socket, { error, rooms }) => {
  if (error) {
    throw error;
  }
  handleRooms(roomsContainer, rooms);
});

/**
 *
 * @event {JOIN_ROOM}
 *
 */
wsapp.on(EventType.JOIN_ROOM, (_socket, { error, rooms }) => {
  if (error) {
    throw error;
  }
  handleJoinedRoom(rooms);
});

/**
 *
 * @event {UNJOIN_ROOM}
 *
 */
wsapp.on(EventType.UNJOIN_ROOM, (_socket, { error, rooms }) => {
  if (error) {
    throw error;
  }
  handleUnjoined(rooms);
});

/**
 *
 * @event {LIST_JOINABLE_ROOMS}
 *
 */
wsapp.on(EventType.LIST_JOINABLE_ROOMS, (_socket, { error, rooms }) => {
  if (error) {
    throw error;
  }
  handleJoinableEntity(joinRoomModalRoomsContainer, rooms);
});

/**
 *
 * @event {CREATE_ROOM}
 *
 */
wsapp.on(EventType.CREATE_ROOM, (_socket, { error, id, rooms }) => {
  if (error) {
    throw error;
  }
  handleCreatedRoom(rooms, id);
});

/**
 *
 * @event {LIST_ROOM_MEMBERS}
 *
 */
wsapp.on(EventType.LIST_ROOM_MEMBERS, (_socket, { error, members }) => {
  if (error) {
    throw error;
  }
  handleRoomMembers(membersContainer, members);
});

/**
 *
 * @event {MEMBER_ENTERED_ROOM}
 *
 */
wsapp.on(EventType.MEMBER_ENTERED_ROOM, (_socket, { id }) => {
  handleMemberEntered(id);
});

/**
 *
 * @event {MEMBER_LEFT_ROOM}
 *
 */
wsapp.on(EventType.MEMBER_LEFT_ROOM, (_socket, { id }) => {
  handleMemberLeft(id);
});

/**
 *
 * @event {LIST_DIRECT_CONVERSATIONS}
 *
 */
wsapp.on(EventType.LIST_DIRECT_CONVERSATIONS, (_socket, { error, directConversations }) => {
  if (error) {
    throw error;
  }
  handleDirectConversations(directConversations, directMessagesDrawerContainer);
});

/**
 *
 * @event {LIST_DIRECT_MESSAGES}
 *
 */
wsapp.on(EventType.LIST_DIRECT_MESSAGES, (_socket, { messages, error }) => {
  if (error) {
    throw error;
  }
  handleDirectMessages(messages);
});

/**
 *
 * @event {LIST_INVITABLE_USERS}
 *
 */
wsapp.on(EventType.LIST_INVITABLE_USERS, (_socket, { error, users }) => {
  if (error) {
    throw error;
  }
  handleJoinableEntity(joinDirectConvoModalPeopleContainer, users);
});
