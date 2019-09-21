const { csvReader, csvParser } = require("./csv-parser.js");
const course_dep = {
  AC: "BMKQ",
  BA: "BMKQ",
  BK: "BMKQ",
  EC: "BMKQ",
  FN: "BMKQ",
  MK: "BMKQ",
  SB: "BMKQ",
  SC: "BMKQ",
  AE: "BMTA",
  EL: "BMTA",
  ES: "BMTA",
  GE: "BMTA",
  SM421: "BMTA",
  GF: "BMTP",
  GI: "BMTP",
  AJ: "BMTN",
  GJ: "BMTN",
  PJ: "BMTN",
  VJ: "BMTN",
  IJ: "BMTN",
  TJ: "BMTN",
  AK: "BMTH",
  GK: "BMTH",
  PK: "BMTH",
  TK: "BMTH",
  AZ: "BMTT",
  GZ: "BMTT",
  PZ: "BMTT",
  TZ: "BMTT",
  AN: "BMAN",
  AD213: "BMAN",
  AD214: "BMAN",
  CF: "BMTI",
  CS: "BMTI",
  IM: "BMTI",
  IN: "BMTI",
  IP: "BMTI",
  IS: "BMTI",
  MI: "BMTI",
  NW: "BMTI",
  SE: "BMTI",
  TC: "BMTI",
  AD215: "BMTI",
  MA: "BMTM",
  NS: "BMSD",
  NF: "BMSD",
  HM: "BMSN",
  NR: "BMSN",
  PH315: "BMSN",
  NP: "BMSN",
  PG: "BMTC",
  PS: "BMXW",
  SK: "BMXW",
  SO: "BMXW",
  SH: "BMXV",
  VC: "BMXV",
  VP: "BMXV",
  VL: "BMXV",
  TR: "BMDL",
  AD204: "BMDL",
  ML: "BMCS",
  SM: "BMCS",
  AD: "BMCS",
  NA: "BMYT",
  NC: "BMYT",
  PH: "BMYT",
  HB: "BMYT",
  ND: "BMYT",
  SF: "BMYT"
};

const coursesCSV = () => {
  const Course = require("../../api/courses/model");
  const Department = require("../../api/departments/model");
  csvReader("../data/Datasheets/CSV/Courses.csv", data => {
    data.map(each => {
      let departmentsId;
      let head = each.schoolId.substr(0, 2);

      // Handle Department ID
      if (course_dep[each.schoolId] !== undefined) {
        departmentsId = course_dep[each.schoolId];
      } else if (course_dep[head] !== undefined) {
        departmentsId = course_dep[head];
      } else {
        departmentsId = "BMTI";
      }
      let coursePrerequisites = [];
      let creditPrerequisites = 0;
      // Handle Prerequisites
      let arr = each.prerequisites.trim().split(",");
      for (i = 0; i < arr.length; i++) {
        if (arr[i] && !isNaN(arr[i])) {
          creditPrerequisites = arr[i];
        } else {
          coursePrerequisites.push(arr[i]);
        }
      }
      console.log(each.schoolId, creditPrerequisites, coursePrerequisites);

      Department.findOne({ schoolId: departmentsId })
        .then(data => {
          if (!data) {
            const error = new Error("wrong_department_id");
            error.status = 404;
            throw error;
          }
          course = new Course({
            _id: each.schoolId,
            name: each.name,
            credits: parseInt(each.credits),
            department: data._id,
            length: {
              theory: parseInt(each.theory) || 0,
              practice: parseInt(each.practice) || 0
            },
            coursePrerequisites: coursePrerequisites,
            creditPrerequisites: parseInt(creditPrerequisites)
          });

          course.save().then(data => {});
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    });
  });
};

module.exports = { coursesCSV };
