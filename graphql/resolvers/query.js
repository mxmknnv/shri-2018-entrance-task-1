const Sequelize = require('sequelize');

const { Op } = Sequelize;

const Query = {
  user: (root, { id }, { User }) => User.findById(id),
  users: (root, args, { User }) => User.findAll(),
  room: (root, { id }, { Room }) => Room.findById(id),
  rooms: (root, args, { Room }) => Room.findAll(),
  event: (root, { id }, { Event }) => Event.findById(id),
  events: (root, args, { Event }) => Event.findAll(),
  eventsByDate: (root, { date }, { Event }) => {
    const start = new Date(date);
    const end = new Date(date);

    start.setHours(0, 0, 0, 0);
    end.setHours(24, 0, 0, 0);

    return Event.findAll({
      where: {
        dateStart: {
          [Op.between]: [start, end],
        },
        dateEnd: {
          [Op.between]: [start, end],
        },
      },
    });
  },
};

module.exports = Query;
