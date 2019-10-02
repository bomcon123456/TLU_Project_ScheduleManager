const Classroom = require("../classrooms/model");
const Room = require("../rooms/model");

const getFreeRooms = (req, res, next) => {
  const { year, group, semester, day, shift } = req.query;
  console.log(req.query);
  let numbers = shift.split("-");
  let start = parseInt(numbers[0]);
  let end = parseInt(numbers[1]);
  let str = "[" + numbers[0] + ",";
  for (let i = start + 1; i < end + 1; i++) {
    str += i.toString();
    if (i !== end) {
      str += ",";
    } else {
      str += "]";
    }
  }
  let shiftQuery = new RegExp(str, "i");
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semesters": semester,
    "date.day": day,
    "date.shift": shiftQuery
  })
    .select({ roomId: 1, _id: 0 })
    .then(data => {
      let rooms = [];
      data.map(each => {
        rooms.push(each.roomId);
      });
      console.log("Used rooms: " + rooms);
      return Room.find({ _id: { $nin: rooms } }).select({ name: 1 });
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_freerooms_successfully",
        data: data
      });
    })
    .catch(err => next(err));
};

module.exports = { getFreeRooms };
