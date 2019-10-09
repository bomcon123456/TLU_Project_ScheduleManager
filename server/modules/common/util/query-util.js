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
