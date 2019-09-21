const Teacher = require("./model");
const Department = require("../departments/model");
const { generateTeacherId } = require("../../common/util/generateId");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = req.query.size || 5;
  return Teacher.find()
    .skip((page - 1) * size)
    .limit(size)
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

const get = (req, res, next) => {
  const id = req.params.id;
  return Teacher.findById(id)
    .populate("department", "name")
    .then(data => {
      // console.log( data);
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

// @TODO: Create new User after add teacher.
const post = (req, res, next) => {
  const { name, department } = req.body;
  generateTeacherId(department)
    .then(id => {
      console.log(id);
      teacher = new Teacher({ _id: id, name: name, department: department });
      return teacher.save();
    })
    .then(data => {
      res.status(200).json({
        message: "add_teacher_successfully",
        id: data._id
      });
    })
    .catch(err => next(err));
};

const put = (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body;
  Teacher.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_teacher_failed");
        err.statusCode = 404;
        throw err;
      }
      data.name = name;
      return data.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_teacher_successfully",
        id: data._id
      });
    })
    .catch(err => next(err));
};

const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Teacher.findOneAndDelete({ _id: id })
    .then(data => {
      res.status(200).json({
        message: "delete_teacher_successfully",
        id: id
      });
    })
    .catch(err => next(err));
};

module.exports = { getAll, get, post, put, deleteOne };
