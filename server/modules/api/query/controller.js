const Classroom = require("../classrooms/model");
const Teacher = require("../teachers/model");
const Room = require("../rooms/model");

const shifts = require("../../common/constants/shifts");
const days = require("../../common/constants/days");

const {
  getNearbyGroupSem,
  getTeacherFreeShiftsPromise
} = require("../../common/util/query-util");

const getTeacherFreeShifts = (req, res, next) => {
  const { year, group, semester, day, teacherId } = req.query;
  Teacher.findById(teacherId)
    .then(teach => {
      if (!teach) {
        let error = new Error("teacher_not_exists");
        error.statusCode = 404;
        throw error;
      }
      return getTeacherFreeShiftsPromise(year, group, semester, day, teacherId);
    })
    .then(data => {
      res
        .status(200)
        .json({ message: "fetch_teacher_freeshifts_successfully", data: data });
    })
    .catch(err => next(err));
};

const getFreeRooms = (req, res, next) => {
  const { year, group, semester, day, shift } = req.query;
  console.log(getNearbyGroupSem(group, semester));
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
  let used = [];
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semesters": semester,
    "date.day": day,
    "date.shift": shiftQuery
  })
    .select({ roomId: 1, _id: 0 })
    .populate("roomId", "name") // remove this for more performance
    .then(data => {
      used = data;
      let rooms = [];
      data.map(each => {
        rooms.push(each.roomId._id);
      });
      console.log("Used rooms: " + rooms);
      return Room.find({ _id: { $nin: rooms } }).select({ name: 1 });
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_freerooms_successfully",
        data: data,
        used: used
      });
    })
    .catch(err => next(err));
};

const getFreeShifts = (req, res, next) => {
  const { year, group, semester, day, roomId, teacherId } = req.query;
  let teacherFreeShifts;
  let roomFreeShifts;
  getTeacherFreeShiftsPromise(year, group, semester, day, teacherId)
    .then(data => {
      if (!data) {
        let error = new Error("cant_find_teacher_freeshifts");
        error.statusCode = 500;
        throw error;
      }
      teacherFreeShifts = new Set(data);
      return getRoomFreeShiftsPromise(year, group, semester, day, roomId);
    })
    .then(data => {
      if (!data) {
        let error = new Error("cant_find_room_freeshifts");
        error.statusCode = 500;
        throw error;
      }
      roomFreeShifts = new Set(data);
      let intersection = new Set(
        [...roomFreeShifts].filter(x => teacherFreeShifts.has(x))
      );
      let result = Array.from(intersection);
      res.status(200).json({
        message: "fetch_teacher_freeshifts_successfully",
        data: result
      });
    })
    .catch(err => next(err));
};

const getFreeDays = (req, res, next) => {
  const { year, group, semester, shift, roomId } = req.query;
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semesters": semester,
    "date.shift": shift,
    roomId: roomId
  })
    .select({ date: 1, _id: 0 })
    .then(data => {
      let usedDays = new Set();
      let allDays = new Set(days.days);
      data.map(each => {
        usedDays.add(each.data.day);
      });
      // let result = new Set([...allDays]).filter(x => !usedDays.has(x));
      let intersection = new Set([...allDays].filter(x => !usedDays.has(x)));
      res.status(200).json({
        message: "fetched_freeday_successfully",
        data: Array.from(intersection)
      });
    })
    .catch(err => next(err));
};

module.exports = {
  getFreeRooms,
  getFreeShifts,
  getFreeDays,
  getTeacherFreeShifts
};
