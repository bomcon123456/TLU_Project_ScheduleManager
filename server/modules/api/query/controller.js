const Classroom = require("../classrooms/model");
const Room = require("../rooms/model");

const shifts = require("../../common/constants/shifts");
const days = require("../../common/constants/days");

const {
  getNearbyGroupSem,
  genPerdiodFromShift
} = require("../../common/util/query-util");

const getTeacherFreeShifts = (req, res, next) => {
  const { year, group, semester, day, teacherId } = req.query;
  dates = getNearbyGroupSem(group, semester);
  orQueries = dates.map(each => {
    return {
      "date.group": each.group,
      "date.semesters": each.semester
    };
  });
  // Classroom.find({ "date.year": year, "date.day": day, teacherId: teacherId })
  //   .or(orQueries)
  //   .select({ "date.shift": 1, _id: 0 })
  Classroom.aggregate([
    {
      $match: {
        "date.year": year,
        "date.day": day,
        teacherId: teacherId,
        $or: orQueries
      }
    },
    {
      $project: {
        shift: "$date.shift",
        _id: "1"
      }
    },
    {
      $group: {
        _id: "1",
        shifts: { $push: "$shift" }
      }
    },
    {
      $project: {
        _id: 0
      }
    }
  ])
    .then(data => {
      let usedPeriods = new Set();
      console.log(data);
      data[0].shifts.map(each => {
        genPerdiodFromShift(each).forEach(item => usedPeriods.add(item));
      });
      let result = [];
      let temp = [];
      for (let i = 1; i < 14; i++) {
        if (usedPeriods.has(i)) {
          if (temp.length > 1) {
            result.push(temp);
          }
          temp = [];
          continue;
        }
        temp.push(i);
      }
      result.push(temp);
      res.status(200).json(result);
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

// @TODO: RE DO THIS SHIT, WTF IS THIS GARBAGE?
const getFreeShifts = (req, res, next) => {
  const { year, group, semester, day, roomId, teacherId } = req.query;
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semesters": semester,
    "date.day": day,
    roomId: roomId
  })
    .select({ date: 1, _id: 0 })
    .then(data => {
      let usedShifts = new Set();
      let allShifts = new Set(shifts);
      data.map(each => {
        usedShifts.add(each.data.shift);
      });
      let result = new Set([...allShifts]).filter(x => !usedShifts.has(x));
      if (!teacherId) {
        res.status(200).json({
          message: "fetched_freeshifts_successfully",
          data: result
        });
      } else {
        // @TODO: Find again in classroom for that teacher's used shifts
      }
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
      let allDays = new Set(days);
      data.map(each => {
        usedDays.add(each.data.day);
      });
      let result = new Set([...allDays]).filter(x => !usedDays.has(x));
      res.status(200).json({
        message: "fetched_freeday_successfully",
        data: result
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
