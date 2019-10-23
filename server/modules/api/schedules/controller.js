const Schedule = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  let schedules = [];
  Schedule.find()
    .skip((page - 1) * size)
    .limit(size)
    .then(data => {
      schedules = data;
      return Schedule.count(query);
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_schedules_successfully",
        data: schedules,
        size: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const id = req.params.id;
  return Schedule.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_schedule_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetch_schedule_successful",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const post = (req, res, next) => {};

const put = (req, res, next) => {};

const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Schedule.findOneAndDelete({ _id: id })
    .then(data => {
      res.status(200).json({
        message: "delete_schedule_successfully",
        id: id
      });
    })
    .catch(err => next(err));
};

module.exports = { getAll, get, post, put, deleteOne };
