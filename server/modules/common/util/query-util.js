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

module.exports = { getNearbyGroupSem, genPerdiodFromShift };
