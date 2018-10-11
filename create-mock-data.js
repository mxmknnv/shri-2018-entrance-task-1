const { models, sequelize } = require('./models');

function createData() {
  // Элемент массива обозначает кол-во сотрудников на каждом этаже
  const usersMask = [5, 5, 5, 5, 5];

  // Элемент массива обозначает этаж, элемент подмассива обозначает вместимость переговорки
  const roomsMask = [
    [10],
    [5, 10, 10],
    [15, 20],
    [10, 5, 15],
    [20, 10],
  ];

  const numberOfUsers = getNumberOfUsers(usersMask);
  const roomsMaskNormalized = normalizeRoomsMask(roomsMask);
  const numberOfRooms = roomsMaskNormalized.length;
  const { res: eventsArray, mask: eventsMask } = createEvents(1, numberOfRooms);

  const usersPromise = models.User.bulkCreate(createUsers(usersMask));
  const roomsPromise = models.Room.bulkCreate(createRooms(roomsMask));
  const eventsPromise = models.Event.bulkCreate(eventsArray);

  Promise.all([usersPromise, roomsPromise, eventsPromise])
    .then(() => Promise.all([
      models.User.findAll(),
      models.Room.findAll(),
      models.Event.findAll(),
    ]))
    .then(([users, rooms, events]) => {
      const promises = [];

      for (let i = 0; i < eventsMask.length; i++) {
        const roomId = eventsMask[i];
        promises.push(events[i].setRoom(rooms[roomId]));
      }

      for (let i = 0; i < eventsMask.length; i++) {
        const roomId = eventsMask[i];
        const capacity = roomsMaskNormalized[roomId];
        const userIdsArray = generateUserIdsForEvent(capacity, numberOfUsers);
        const usersArray = generateUsersForEvent(userIdsArray, users);

        promises.push(events[i].setUsers(usersArray));
      }

      return Promise.all(promises);
    });
}

sequelize.sync({ force: true })
  .then(createData);

/* Utility functions */

// Random avatars http://pravatar.cc/
// from 1 to 70

function createUsers(mask) {
  const res = [];
  let counter = 0;

  for (let i = 0; i < mask.length; i++) {
    for (let j = 0; j < mask[i]; j++) {
      counter += 1;

      res.push({
        login: `User ${counter}`,
        avatar: `http://i.pravatar.cc/150?img=${counter}`,
        floor: i,
      });
    }
  }

  return res;
}

function createRooms(mask) {
  const res = [];
  let counter = 0;

  for (let i = 0; i < mask.length; i++) {
    for (let j = 0; j < mask[i].length; j++) {
      counter += 1;

      res.push({
        title: `Room ${counter}`,
        capacity: mask[i][j],
        floor: i,
      });
    }
  }

  return res;
}

function createEvents(numberOfDays, numberOfRooms) {
  const days = generateDays(numberOfDays, new Date());

  const range = {
    event: [1, 12], // [min, max], продолжительность встречи (1 = 15 min)
    break: [0, 12], // [min, max], продолжительность перерыва (1 = 15 min)
  };

  // Время встречи должно быть кратно 15 минутам

  const module = 15 * 60 * 1000;

  const res = [];
  const mask = [];
  let eventsCounter = 0;

  for (let i = 0; i <= numberOfDays * 2; i++) {
    const { dayStart, dayEnd } = days[i];

    for (let k = 0; k < numberOfRooms; k++) {
      let t1 = 0;
      let t2 = dayStart;

      for (;;) {
        t1 = t2 + (module * getRandom(...range.break));
        t2 = t1 + (module * getRandom(...range.event));

        if (t2 < dayEnd) {
          mask[eventsCounter] = k;
          eventsCounter += 1;

          res.push({
            title: `Event ${eventsCounter}`,
            dateStart: t1,
            dateEnd: t2,
          });
        } else {
          break;
        }
      }
    }
  }

  return { res, mask };
}

function getRandom(min, max) {
  return Math.floor(Math.random() * ((max + 1) - min)) + min;
}

function generateUserIdsForEvent(capacity, numberOfUsers) {
  const res = [];

  if (capacity >= numberOfUsers) {
    return Array.from(Array(numberOfUsers).keys());
  }

  for (let counter = capacity; counter > 0;) {
    const userId = getRandom(0, numberOfUsers - 1);

    if (!res.includes(userId)) {
      res.push(userId);
      counter -= 1;
    }
  }

  return res;
}

function generateUsersForEvent(userIdsArray, users) {
  const res = [];

  for (let i = 0; i < userIdsArray.length; i++) {
    const userId = userIdsArray[i];
    const user = users[userId];

    res.push(user);
  }

  return res;
}

function getNumberOfUsers(mask) {
  let counter = 0;

  for (let i = 0; i < mask.length; i++) {
    counter += mask[i];
  }

  return counter;
}

function normalizeRoomsMask(mask) {
  let res = [];

  for (let i = 0; i < mask.length; i++) {
    res = res.concat(mask[i]);
  }

  return res;
}

function generateDays(number, centralDay) {
  const days = [];

  let date = centralDay.getDate();
  date -= number;

  for (let i = 0; i <= number * 2; i++) {
    const day = new Date(centralDay.setDate(date));
    date += 1;

    days.push({
      dayStart: day.setHours(8, 0, 0, 0),
      dayEnd: day.setHours(23, 0, 0, 0),
    });
  }

  return days;
}
