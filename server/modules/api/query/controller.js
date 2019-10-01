const Classroom = require("../classrooms/controller");

const getFreeRooms = (req, res, next) => {
  const { year, group, semester, day, shift, roomId } = req.query;
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semester": semester,
    "date.day": day,
    "date.shift": shift,
    roomId: roomId
  })
    .then(data => {
      if (roomId === null) {
        // Returns rooms
      } else if (shift === null) {
        // Returns shifts
      } else if (day === null) {
        // Returns days
      }
    })
    .catch(err => next(err));
};

module.exports = {};
