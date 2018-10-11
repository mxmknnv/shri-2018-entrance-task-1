const Sequelize = require('sequelize');
const scheme = require('./scheme');

const storage = process.env.NODE_ENV === 'test' ? 'db-test.sqlite3' : 'db.sqlite3';

const sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',
  storage,
  operatorsAliases: false,
  logging: false,
});

scheme(sequelize);
sequelize.sync();

module.exports = {
  sequelize,
  models: sequelize.models,
};
