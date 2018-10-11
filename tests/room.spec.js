const { graphqlQuery, convertRawSample } = require('./tools');
const { models } = require('../models');

/* Definitions */

const ROOM_ID_TO_QUERY = 1;
const ROOM_ID_TO_UPDATE = 2;
let ROOM_ID_TO_REMOVE;

const ROOM_TO_CREATE = {
  title: 'room',
  capacity: 10,
  floor: 1,
};

const ROOM_TO_UPDATE = {
  title: 'updated room',
  capacity: 15,
  floor: 5,
};

const ROOM_QUERY_BODY = `{
  id,
  title,
  capacity,
  floor
}`;

/* Tests */

describe('Room Resolvers', () => {
  test('Query: rooms', async () => {
    const QUERY = `query { rooms ${ROOM_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.rooms;

    const rawSample = await models.Room.findAll();
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Query: room', async () => {
    const QUERY = `query { room(id: ${ROOM_ID_TO_QUERY}) ${ROOM_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.room;

    const rawSample = await models.Room.findById(ROOM_ID_TO_QUERY);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Mutation: createRoom', async () => {
    const QUERY = `
      mutation {
        createRoom(input: {
          title: "${ROOM_TO_CREATE.title}",
          capacity: ${ROOM_TO_CREATE.capacity},
          floor: ${ROOM_TO_CREATE.floor}
        }) ${ROOM_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.createRoom;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Room.findById(data.id);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);

    // Сохраняем идентификатор новой переговорки

    ROOM_ID_TO_REMOVE = data.id;
    delete data.id;

    // Проверяем, соответствуют ли полученные данные оригинальному образу ROOM_TO_CREATE

    expect(data).toEqual(ROOM_TO_CREATE);
  });

  test('Mutation: updateRoom', async () => {
    const QUERY = `
      mutation {
        updateRoom(
          id: ${ROOM_ID_TO_UPDATE},
          input: {
            title: "${ROOM_TO_UPDATE.title}",
            capacity: ${ROOM_TO_UPDATE.capacity},
            floor: ${ROOM_TO_UPDATE.floor}
          }
        ) ${ROOM_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.updateRoom;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.Room.findById(ROOM_ID_TO_UPDATE);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем, соответствуют ли полученные данные оригинальному образу ROOM_TO_UPDATE

    delete data.id;
    expect(data).toEqual(ROOM_TO_UPDATE);
  });

  test('Mutation: removeRoom', async () => {
    const QUERY = `
      mutation {
        removeRoom(id: ${ROOM_ID_TO_REMOVE})
        ${ROOM_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.removeRoom;

    // Проверяем, что соответствующая запись отсутствует в базе данных

    const rawSample = await models.Room.findById(ROOM_ID_TO_REMOVE);
    expect(rawSample).toBeNull();

    // Проверяем, соответствуют ли полученные данные оригинальному образу ROOM_TO_UPDATE

    delete data.id;
    expect(data).toEqual(ROOM_TO_CREATE);
  });
});
