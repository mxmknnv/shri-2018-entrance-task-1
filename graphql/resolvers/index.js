const GraphQLDate = require('graphql-date');

const query = require('./query');
const mutation = require('./mutation');

module.exports = {
  Query: query,
  Mutation: mutation,
  Event: {
    users: event => event.users || event.getUsers(),
    room: event => event.room || event.getRoom(),
  },
  Date: GraphQLDate,
};
