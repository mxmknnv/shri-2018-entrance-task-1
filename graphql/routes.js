const express = require('express');
const graphqlHTTP = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { models } = require('../models');

const router = express.Router();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

router.use(graphqlHTTP({
  schema,
  graphiql: true,
  context: models,
}));

module.exports = router;
