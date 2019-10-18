const Calendar = require("./modules/api/calendar/model");
const { groups } = require("./modules/common/constants/groups");
const { semesters } = require("./modules/common/constants/semesters");
const { years } = require("./modules/common/constants/years");
years.map(year => {
  semesters.map(semester => {
    groups.map(group => {
      let cal = new Calendar({
        year: year,
        semesters: semester,
        group: group
      });
      cal
        .save()
        .then(data => data)
        .catch(err => console.log(err));
    });
  });
});
