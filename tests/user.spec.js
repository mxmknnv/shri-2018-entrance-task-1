const { graphqlQuery, convertRawSample } = require('./tools');
const { models } = require('../models');

/* Definitions */

const USER_ID_TO_QUERY = 1;
const USER_ID_TO_UPDATE = 2;
let USER_ID_TO_REMOVE;

const USER_TO_CREATE = {
  login: 'login',
  floor: 10,
  avatar: 'avatar',
};

const USER_TO_UPDATE = {
  login: 'updated login',
  floor: 15,
  avatar: 'updated avatar',
};

const USER_QUERY_BODY = `{
  id,
  login,
  floor,
  avatar
}`;

/* Tests */

describe('User Resolvers', () => {
  test('Query: users', async () => {
    const QUERY = `query { users ${USER_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.users;

    const rawSample = await models.User.findAll();
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Query: user', async () => {
    const QUERY = `query { user(id: ${USER_ID_TO_QUERY}) ${USER_QUERY_BODY} }`;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.user;

    const rawSample = await models.User.findById(USER_ID_TO_QUERY);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);
  });

  test('Mutation: createUser', async () => {
    const QUERY = `
      mutation {
        createUser(input: {
          login: "${USER_TO_CREATE.login}",
          floor: ${USER_TO_CREATE.floor},
          avatar: "${USER_TO_CREATE.avatar}"
        }) ${USER_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.createUser;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.User.findById(data.id);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);

    // Сохраняем идентификатор нового пользователя

    USER_ID_TO_REMOVE = data.id;
    delete data.id;

    // Проверяем, соответствуют ли полученные данные оригинальному образу USER_TO_CREATE

    expect(data).toEqual(USER_TO_CREATE);
  });

  test('Mutation: updateUser', async () => {
    const QUERY = `
      mutation {
        updateUser(
          id: ${USER_ID_TO_UPDATE},
          input: {
            login: "${USER_TO_UPDATE.login}",
            floor: ${USER_TO_UPDATE.floor},
            avatar: "${USER_TO_UPDATE.avatar}"
          }
        ) ${USER_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.updateUser;

    // Проверяем, есть ли соответствующая запись в базе данных

    const rawSample = await models.User.findById(USER_ID_TO_UPDATE);
    const sample = convertRawSample(rawSample);

    expect(data).toEqual(sample);

    // Проверяем, соответствуют ли полученные данные оригинальному образу USER_TO_UPDATE

    delete data.id;
    expect(data).toEqual(USER_TO_UPDATE);
  });

  test('Mutation: removeUser', async () => {
    const QUERY = `
      mutation {
        removeUser(id: ${USER_ID_TO_REMOVE})
        ${USER_QUERY_BODY}
      }
    `;

    const rawData = await graphqlQuery(QUERY);
    const data = rawData.data.removeUser;

    // Проверяем, что соответствующая запись отсутствует в базе данных

    const rawSample = await models.User.findById(USER_ID_TO_REMOVE);
    expect(rawSample).toBeNull();

    // Проверяем, соответствуют ли полученные данные оригинальному образу USER_TO_CREATE

    delete data.id;
    expect(data).toEqual(USER_TO_CREATE);
  });
});
