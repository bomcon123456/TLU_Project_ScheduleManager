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

module.exports = {
  getNearbyGroupSem,
  genPerdiodFromShift,
  getFreeShiftsFromUsedShifts
};
