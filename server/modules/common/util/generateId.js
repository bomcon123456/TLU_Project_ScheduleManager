const Teacher = require("../../api/teachers/model");
const Department = require("../../api/departments/model");

const dep_teacher = {
  BMAN: "CAN",
  BMDL: "CDL",
  BMTC: "CGP",
  BMCS: "CGS",
  BMTA: "CNE",
  BMTP: "CNF",
  BMTN: "CNJ",
  BMTH: "CNK",
  BMTT: "CNZ",
  BMKQ: "CQA",
  BMKQ: "CBQ",
  BMKQ: "CQE",
  BMKQ: "CQH",
  BMKQ: "CQM",
  BMSD: "CSD",
  BMSN: "CSN",
  BMYT: "CSP",
  BMTI: "CTI",
  BMTM: "CTM",
  BMXV: "CXV",
  BMXW: "CXW"
};

const generateTeacherId = departmentId => {
  return Department.findById(departmentId)
    .then(department => {
      if (!department) {
        const error = new Error("department_not_found");
        error.statusCode = 404;
        throw error;
      }
      // const head = dep_teacher[department.schoolId];
      // console.log("HEAD:" + head);
      return Teacher.findOne({ department: departmentId })
        .sort({ createdAt: -1 })
        .limit(1);
    })
    .then(data => {
      if (!data) {
        const error = new Error("department_not_found");
        error.statusCode = 404;
        throw error;
      }
      const head = data._id.substr(1, 2);
      const tail = data._id.substr(3, 3);
      let number = parseInt(tail);
      number += 1;
      let strnum = number.toString();
      if (number < 100) {
        strnum = "0" + number;
      }
      const newId = "C" + head + strnum;
      return newId;
    })
    .catch(err => {
      throw err;
    });
};

module.exports = { generateTeacherId };
