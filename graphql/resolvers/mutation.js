const Mutation = {
  createUser(root, { input }, { User }) {
    return User.create(input);
  },

  updateUser(root, { id, input }, { User }) {
    return User.findById(id)
      .then(user => user.update(input));
  },

  removeUser(root, { id }, { User }) {
    return User.findById(id)
      .then(user => user.destroy());
  },

  createRoom(root, { input }, { Room }) {
    return Room.create(input);
  },

  updateRoom(root, { id, input }, { Room }) {
    return Room.findById(id)
      .then(room => room.update(input));
  },

  removeRoom(root, { id }, { Room }) {
    return Room.findById(id)
      .then(room => room.destroy());
  },

  createEvent(root, { input, usersIds, roomId }, { Event }) {
    return Event.create(input)
      .then(event => Promise.all([
        event.setUsers(usersIds),
        event.setRoom(roomId),
      ])
        .then(() => event));
  },

  updateEvent(root, { id, input, usersIds, roomId }, { Event }) {
    return Event.findById(id)
      .then(event => event.update(input))
      .then(event => Promise.all([
        event.setUsers(usersIds),
        event.setRoom(roomId),
      ])
        .then(() => event));
  },

  removeEvent(root, { id }, { Event }) {
    return Event.findById(id)
      .then(event => Promise.all([
        event.getUsers(),
        event.getRoom(),
      ])
        .then(([users, room]) => {
          const result = event.get({ plain: true });
          result.users = users;
          result.room = room;

          event.destroy();

          return result;
        }));
  },

  addUserToEvent(root, { id, userId }, { Event }) {
    return Event.findById(id)
      .then(event => event.addUser(userId)
        .then(() => event));
  },

  removeUserFromEvent(root, { id, userId }, { Event }) {
    return Event.findById(id)
      .then(event => event.removeUser(userId)
        .then(() => event));
  },

  changeEventRoom(root, { swap }, { Event }) {
    const promises = [];

    swap.forEach((pair) => {
      promises.push(Event.findById(pair.eventId)
        .then(event => event.setRoom(pair.roomId)
          .then(() => event)));
    });

    return Promise.all(promises);
  },
};

module.exports = Mutation;
