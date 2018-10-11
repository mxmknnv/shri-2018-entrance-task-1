const request = require('request-promise-native');

function graphqlQuery(query) {
  return request({
    method: 'POST',
    url: 'http://localhost:3000/graphql',
    headers: {
      'content-type': 'application/json',
    },
    json: true,
    body: {
      query,
    },
  });
}

function convertRawSample(rawSample) {
  function convert(element) {
    const res = element.get({ plain: true });

    res.id = String(res.id);

    delete res.createdAt;
    delete res.updatedAt;
    delete res.Events_Users;

    return res;
  }

  return Array.isArray(rawSample) ? rawSample.map(convert) : convert(rawSample);
}

function convertRawEventSample(rawSample) {
  function convert(element) {
    return Promise.all([
      element.getUsers(),
      element.getRoom(),
    ]).then(([users, room]) => {
      const res = element.get({ plain: true });

      res.users = convertRawSample(users);
      res.room = convertRawSample(room);

      res.id = String(res.id);
      res.dateStart = new Date(res.dateStart).toJSON();
      res.dateEnd = new Date(res.dateEnd).toJSON();

      delete res.createdAt;
      delete res.updatedAt;
      delete res.RoomId;

      return res;
    });
  }

  return Array.isArray(rawSample) ? Promise.all(rawSample.map(convert)) : convert(rawSample);
}

module.exports = {
  graphqlQuery,
  convertRawSample,
  convertRawEventSample,
};
