const Classroom = require("../../api/classrooms/model");

const shifts = require("../../common/constants/shifts");

const getNearbyGroupSem = (group, semester) => {
  let res = [];
  res.push({
    group: group,
    semester: semester
  });
  if (group === "Group 1") {
    switch (semester) {
      case "Semester 2":
        res.push({
          group: "Group 3",
          semester: "Semester 1"
        });
        break;
      case "Semester 3":
        res.push({
          group: "Group 3",
          semester: "Semester 2"
        });
        break;
      default:
        break;
    }
  } else if (group === "Group 2") {
    res.push({
      group: "Group 1",
      semester: semester
    });
  } else if (group === "Group 3") {
    res.push({
      group: "Group 2",
      semester: semester
    });
  }
  return res;
};

const genPerdiodFromShift = shift => {
  let numbers = shift.split("-");
  let start = parseInt(numbers[0]);
  let end = parseInt(numbers[1]);
  let res = [];
  for (let i = start; i < end + 1; i++) {
    res.push(i);
  }
  return res;
};

const getFreeShiftsFromUsedShifts = data => {
  let usedPeriods = new Set();
  data.map(each => {
    genPerdiodFromShift(each).forEach(item => usedPeriods.add(item));
  });
  let freePeriods = [];
  let temp = [];
  for (let i = 1; i < 14; i++) {
    if (usedPeriods.has(i)) {
      if (temp.length > 1) {
        freePeriods.push(temp);
      }
      temp = [];
      continue;
    }
    temp.push(i);
  }
  freePeriods.push(temp);
  let freeShifts = new Set();
  freePeriods.map(each => {
    for (let i = 0; i < each.length; i++) {
      if (i === 0 && each[i] > 10) {
        return;
      }
      for (let j = i; j < each.length; j++) {
        let shift = each[i].toString() + "-" + each[j].toString();
        freeShifts.add(shift);
      }
    }
  });
  let allShifts = new Set(shifts.shifts);
  let intersection = new Set([...allShifts].filter(x => freeShifts.has(x)));
  return Array.from(intersection);
};

const getTeacherFreeShiftsPromise = (year, group, semester, day, teacherId) => {
  return new Promise((resolve, reject) => {
    dates = getNearbyGroupSem(group, semester);
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
        if (data.length === 0) {
          resolve(shifts.shifts);
        }
        let result = getFreeShiftsFromUsedShifts(data[0].shifts);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

const getRoomFreeShiftsPromise = (year, group, semester, day, roomId) => {
  return new Promise((resolve, reject) => {
    dates = getNearbyGroupSem(group, semester);
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
          "date.day": day,
          roomId: roomId,
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
        if (data.length === 0) {
          let error = new Error("room_not_exists");
          error.statusCode = 404;
          throw error;
        }
        let result = getFreeShiftsFromUsedShifts(data[0].shifts);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

module.exports = {
  getNearbyGroupSem,
  genPerdiodFromShift,
  getFreeShiftsFromUsedShifts,
  getTeacherFreeShiftsPromise,
  getRoomFreeShiftsPromise
};
