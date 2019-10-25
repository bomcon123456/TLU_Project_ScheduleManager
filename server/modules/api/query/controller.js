const Classroom = require("../classrooms/model");
const Teacher = require("../teachers/model");
const Room = require("../rooms/model");
const Calendar = require("../calendar/model");
const mongoose = require("mongoose");

const shifts = require("../../common/constants/shifts");
const days = require("../../common/constants/days");

const {
  genPerdiodFromShift,
  getNearbyGroupSem,
  getTeacherFreeShiftsPromise,
  getRoomFreeShiftsPromise
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
  const { year, group, semester, day, shift, students } = req.query;
  dates = getNearbyGroupSem(group, semester);
  orQueries = dates.map(each => {
    return {
      "date.group": each.group,
      "date.semesters": each.semester
    };
  });

  let numbers = shift.split("-");
  let start = parseInt(numbers[0]);
  let end = parseInt(numbers[1]);
  let str = "[" + numbers[0] + ",";
  if (start === end) {
    str += numbers[0] + "]";
  } else {
    for (let i = start + 1; i < end + 1; i++) {
      str += i.toString();
      if (i !== end) {
        str += ",";
      } else {
        str += "]";
      }
    }
  }

  let shiftQuery = new RegExp(str, "i");
  let used = [];
  Classroom.find({
    "date.year": year,
    "date.day": day,
    "date.shift": shiftQuery
  })
    .or(orQueries)
    .select({ roomId: 1, _id: 0 })
    .populate("roomId", "name") // remove this for more performance
    .then(data => {
      used = data;
      let rooms = [];
      data.map(each => {
        rooms.push(each.roomId._id);
      });
      console.log("Used rooms: " + rooms);
      return Room.find({
        _id: { $nin: rooms },
        capacity: { $gte: students }
      }).select({ name: 1 });
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
        message: "fetch_freeshifts_successfully",
        data: result
      });
    })
    .catch(err => next(err));
};

const getFreeDays = (req, res, next) => {
  const { year, group, semester, shift, roomId } = req.query;
  periods = genPerdiodFromShift(shift);
  let shiftQuery = "[";
  if (periods.length === 1) {
    shiftQuery += periods[0].toString() + "," + periods[0].toString() + "]";
  } else {
    periods.forEach((value, index) => {
      if (index !== periods.length - 1) {
        shiftQuery += value.toString() + ",";
      } else {
        shiftQuery += value.toString() + "]";
      }
    });
  }
  let shiftRegex = new RegExp(shiftQuery, "i");
  console.log(shiftQuery);
  Classroom.find({
    "date.year": year,
    "date.group": group,
    "date.semesters": semester,
    "date.shift": shiftRegex,
    roomId: roomId
  })
    .select({ date: 1, _id: 0 })
    .then(data => {
      let usedDays = new Set();
      let allDays = new Set(days.days);
      data.map(each => {
        usedDays.add(each.date.day);
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

const isOpenForOffer = (req, res, next) => {
  const { year, group, semesters } = req.query;
  Calendar.find({ year: year, group: group, semesters: semesters })
    .then(data => {
      if (!data) {
        error = new Error("This custom date is not created yet");
        error.status_code = 404;
        throw error;
      }
      res.status(200).json({
        message: "query_date_completed",
        verified: data.verified
      });
    })
    .catch(err => next(err));
};

const getTeacherSchedule = (req, res, next) => {
  const { year, semester, group, teacherId } = req.query;

  dates = getNearbyGroupSem(group, semester);
  console.log(dates);

  orQueries = dates.map(each => {
    return {
      "date.group": each.group,
      "date.semesters": each.semester
    };
  });
  Classroom.aggregate([
    {
      $match: {
        "date.year": year,
        teacherId: teacherId,
        verified: true,
        $or: orQueries
      }
    },
    {
      $project: {
        name: 1,
        shift: "$date.shift",
        day: "$date.day"
      }
    }
  ])
    .then(data => {
      res.status(200).json({
        message: "fetch_teacher_schedule",
        data: data
      });
    })
    .catch(err => next(err));
};

const getDepartmentSchedule = (req, res, next) => {
  const { year, semester, group, department } = req.query;
  console.log(year, semester, group, department);

  dates = getNearbyGroupSem(group, semester);
  console.log(dates);

  orQueries = dates.map(each => {
    return {
      "date.group": each.group,
      "date.semesters": each.semester
    };
  });
  Classroom.aggregate([
    {
      $match: {
        "date.year": year,
        department: mongoose.Types.ObjectId(department),
        verified: true,
        $or: orQueries
      }
    },
    {
      $project: {
        name: 1,
        shift: "$date.shift",
        day: "$date.day",
        teacherId: 1
      }
    },
    {
      $lookup: {
        from: "teachers",
        localField: "teacherId",
        foreignField: "_id",
        as: "teacher"
      }
    },
    {
      $project: {
        name: 1,
        shift: 1,
        day: 1,
        teacher: "$teacher.name"
      }
    },
    { $unwind: "$teacher" }
  ])
    .then(data => {
      res.status(200).json({
        message: "fetch_department_schedule",
        data: data
      });
    })
    .catch(err => next(err));
};

const getSchedule = (req, res, next) => {
  const { group, semester, year } = req.query;

  Classroom.find({
    "date.group": group,
    "date.semesters": semester,
    "date.year": year,
    verified: true
  })
    .populate("teacherId", "name")
    .then(data => {
      if (!data) {
        let error = new Error("Cant find schedule");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "fetch_schedule_successfully",
        data: newData
      });
    })
    .catch(err => next(err));
};
module.exports = {
  getFreeRooms,
  getFreeShifts,
  getFreeDays,
  getTeacherFreeShifts,
  isOpenForOffer,
  getTeacherSchedule,
  getSchedule,
  getDepartmentSchedule
};
