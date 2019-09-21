const Course = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = req.query.size || 5;
  return Course.find()
    .skip((page - 1) * size)
    .limit(size)
    .populate("department", "name")
    .then(data => {
      res.status(200).json({
        message: "fetch_courses_successful",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {};

const post = (req, res, next) => {};

const put = (req, res, next) => {};

const deleteOne = (req, res, next) => {};

module.exports = { getAll, get, post, put, deleteOne };
