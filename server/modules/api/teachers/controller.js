const Teacher = require("./model");
const Department = require("../departments/model");

const getTeachers = (req, res, next) => {
  return Teacher.find()
    .populate("department", "name")
    .then(data => {
      res.status(200).json({
        message: "fetch_teachers_successful",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const getTeacher = (req, res, next) => {
  const teacherId = req.params.teacherId;
  return Teacher.findById(teacherId)
    .populate("department", "name")
    .then(data => {
      if (!data) {
        const err = new Error("fetch_teacher_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetch_teacher_successful",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

// @TODO: System for generate ID
const createTeacher = (req, res, next) => {
  const { name, department } = req.body;
  return Teacher.findById(teacherId)
    .populate("department", "name")
    .then(data => {
      res.status(200).json({
        message: "fetch_teacher_successful",
        data: data
      });
    });
};

module.exports = { getTeachers, getTeacher };
