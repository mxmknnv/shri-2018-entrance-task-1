const Sequelize = require('sequelize');

const validateSTRING = { len: [3, 255] };
const validateTINYINT = { min: 0, max: 255 };
const validateSMALLINT = { min: 0, max: 65535 };

function schema(sequelize) {
  const User = sequelize.define('User', {
    login: {
      type: Sequelize.STRING,
      validate: validateSTRING,
    },
    floor: {
      type: Sequelize.TINYINT.UNSIGNED,
      validate: validateTINYINT,
    },
    avatar: {
      type: Sequelize.STRING,
      validate: validateSTRING,
    },
  });

  const Room = sequelize.define('Room', {
    title: {
      type: Sequelize.STRING,
      validate: validateSTRING,
    },
    capacity: {
      type: Sequelize.SMALLINT.UNSIGNED,
      validate: validateSMALLINT,
    },
    floor: {
      type: Sequelize.TINYINT.UNSIGNED,
      validate: validateTINYINT,
    },
  });

  const Event = sequelize.define('Event', {
    title: {
      type: Sequelize.STRING,
      validate: validateSTRING,
    },
    dateStart: Sequelize.DATE,
    dateEnd: Sequelize.DATE,
  });

  Event.belongsToMany(User, { through: 'Events_Users' });
  User.belongsToMany(Event, { through: 'Events_Users' });
  Event.belongsTo(Room);
}

module.exports = schema;
