const { graphqlQuery, convertRawEventSample } = require('./tools');
const { models } = require('../models');

/* Definitions */

const EVENT_ID_TO_QUERY = 1;
const EVENT_ID_TO_UPDATE = 2;
const EVENT_USER_IDS_TO_CREATE = [1, 2];
const EVENT_USER_ID_TO_ADD = 3;
const EVENT_ROOM_ID_TO_CREATE = 2;
const EVENT_ROOM_ID_TO_CHANGE = 1;
let EVENT_ID_TO_TEST;

const HOUR = 60 * 60 * 1000;
const DATE_1 = new Date();
const DATE_2 = new Date(DATE_1.getTime() + HOUR);
const DATE_3 = new Date(DATE_2.getTime() + HOUR);
const DATE_4 = new Date(DATE_3.getTime() + HOUR);

const EVENT_TO_CREATE = {
  title: 'event',
  dateStart: DATE_1.toJSON(),
  dateEnd: DATE_2.toJSON(),
};

const EVENT_TO_UPDATE = {
  title: 'new event',
  dateStart: DATE_3.toJSON(),
  dateEnd: DATE_4.toJSON(),
};

const EVENT_QUERY_BODY = `{
  id,
  title,
  dateStart,
  dateEnd,
  users {
    id,
    login,
    floor,
    avatar

  },
  room {
    id,
    title,
    capacity,
    floor
  }
}`;

/* Tests */

describe('Event Resolvers', () => {
  test('Query: events', async () => {
    const QUERY = `query { events ${EVENT_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.events;

    const rawSample = await models.Event.findAll();
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Query: event', async () => {
    const QUERY = `query { event(id: ${EVENT_ID_TO_QUERY}) ${EVENT_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.event;

    const rawSample = await models.Event.findById(EVENT_ID_TO_QUERY);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Mutation: createEvent', async () => {
    const QUERY = `
      mutation {
        createEvent(
          input: {
            title: "${EVENT_TO_CREATE.title}",
            dateStart: "${EVENT_TO_CREATE.dateStart}",
            dateEnd: "${EVENT_TO_CREATE.dateEnd}"
          },
          usersIds: [${EVENT_USER_IDS_TO_CREATE}],
          roomId: ${EVENT_ROOM_ID_TO_CREATE}
        ) ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.createEvent;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Event.findById(data.id);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем соответствие id для users and room
    // Другие поля будем игнорировать

    const USER_IDS_TO_COMPARE = data.users.map(user => Number(user.id));
    expect(USER_IDS_TO_COMPARE).toEqual(EVENT_USER_IDS_TO_CREATE);

    const ROOM_ID_TO_COMPARE = Number(data.room.id);
    expect(ROOM_ID_TO_COMPARE).toEqual(EVENT_ROOM_ID_TO_CREATE);

    // Проверяем, соответствуют ли полученные данные оригинальному образу EVENT_TO_CREATE

    EVENT_ID_TO_TEST = data.id;

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_CREATE);
  });

  test('Mutation: updateEvent', async () => {
    const QUERY = `
      mutation {
        updateEvent(
          id: ${EVENT_ID_TO_UPDATE},
          input: {
            title: "${EVENT_TO_UPDATE.title}",
            dateStart: "${EVENT_TO_UPDATE.dateStart}",
            dateEnd: "${EVENT_TO_UPDATE.dateEnd}"
          }
        ) ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.updateEvent;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Event.findById(EVENT_ID_TO_UPDATE);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем, соответствуют ли полученные данные оригинальному образу EVENT_TO_UPDATE

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_UPDATE);
  });

  test('Mutation: addUserToEvent', async () => {
    const QUERY = `
      mutation {
        addUserToEvent(
          id: ${EVENT_ID_TO_TEST},
          userId: ${EVENT_USER_ID_TO_ADD}
        ) ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.addUserToEvent;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Event.findById(EVENT_ID_TO_TEST);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем соответствие id для users and room
    // Другие поля будем игнорировать

    const USER_IDS_TO_EXPECT = [...EVENT_USER_IDS_TO_CREATE, EVENT_USER_ID_TO_ADD]
      .sort((a, b) => a - b);

    const USER_IDS_TO_COMPARE = data.users.map(user => Number(user.id));

    expect(USER_IDS_TO_COMPARE).toEqual(USER_IDS_TO_EXPECT);

    const ROOM_ID_TO_COMPARE = Number(data.room.id);
    expect(ROOM_ID_TO_COMPARE).toEqual(EVENT_ROOM_ID_TO_CREATE);

    // Проверяем, соответствуют ли полученные данные оригинальному образу EVENT_TO_CREATE

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_CREATE);
  });

  test('Mutation: removeUserFromEvent', async () => {
    const QUERY = `
      mutation {
        removeUserFromEvent(
          id: ${EVENT_ID_TO_TEST},
          userId: ${EVENT_USER_ID_TO_ADD}
        ) ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.removeUserFromEvent;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Event.findById(EVENT_ID_TO_TEST);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем соответствие id для users and room
    // Другие поля будем игнорировать

    const USER_IDS_TO_COMPARE = data.users.map(user => Number(user.id));
    expect(USER_IDS_TO_COMPARE).toEqual(EVENT_USER_IDS_TO_CREATE);

    const ROOM_ID_TO_COMPARE = Number(data.room.id);
    expect(ROOM_ID_TO_COMPARE).toEqual(EVENT_ROOM_ID_TO_CREATE);

    // Проверяем, соответствуют ли полученные данные оригинальному образу EVENT_TO_CREATE

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_CREATE);
  });

  test('Mutation: changeEventRoom', async () => {
    const QUERY = `
      mutation {
        changeEventRoom(
          id: ${EVENT_ID_TO_TEST},
          roomId: ${EVENT_ROOM_ID_TO_CHANGE}
        ) ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.changeEventRoom;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Event.findById(EVENT_ID_TO_TEST);
    const sample = await convertRawEventSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем соответствие id для users and room
    // Другие поля будем игнорировать

    const USER_IDS_TO_COMPARE = data.users.map(user => Number(user.id));
    expect(USER_IDS_TO_COMPARE).toEqual(EVENT_USER_IDS_TO_CREATE);

    const ROOM_ID_TO_COMPARE = Number(data.room.id);
    expect(ROOM_ID_TO_COMPARE).toEqual(EVENT_ROOM_ID_TO_CHANGE);

    // Проверяем, соответствуют ли полученные данные оригинальному образу EVENT_TO_CREATE

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_CREATE);
  });

  test('Mutation: removeEvent', async () => {
    const QUERY = `
      mutation {
        removeEvent(id: ${EVENT_ID_TO_TEST}) 
        ${EVENT_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.removeEvent;

    // Проверяем, что соответствующая запись отсутствует в базе данных

    const rawSample = await models.Event.findById(EVENT_ID_TO_TEST);
    expect(rawSample).toBeNull();

    // Проверяем соответствие id для users and room
    // Другие поля будем игнорировать

    const USER_IDS_TO_COMPARE = data.users.map(user => Number(user.id));
    expect(USER_IDS_TO_COMPARE).toEqual(EVENT_USER_IDS_TO_CREATE);

    const ROOM_ID_TO_COMPARE = Number(data.room.id);
    expect(ROOM_ID_TO_COMPARE).toEqual(EVENT_ROOM_ID_TO_CHANGE);

    // Проверяем соответствуют ли полученные данные оригинальному образу EVENT_TO_CREATE

    delete data.id;
    delete data.users;
    delete data.room;

    expect(data).toEqual(EVENT_TO_CREATE);
  });
});
