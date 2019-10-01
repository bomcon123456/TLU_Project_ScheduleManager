const Classroom = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  Classroom.estimatedDocumentCount()
    .then(data => {
      total = data;
      return Classroom.find()
        .skip((page - 1) * size)
        .limit(size);
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_classrooms_successfully",
        data: data,
        size: total
      });
    })
    .catch(err => {
      next(err);
    });
};

const getAllBackup = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  Classroom.estimatedDocumentCount()
    .then(data => {
      total = data;
      return Classroom.find()
        .skip((page - 1) * size)
        .limit(size);
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_classrooms_successfully",
        data: data,
        size: total
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const id = req.params.id;
  Classroom.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_classroom_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetched_classroom_successfully",
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
  Classroom.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        const error = new Error("delete_classroom_failed");
        error.statusCode = 406;
        throw error;
      }
      res.status(200).json({
        message: "delete_classroom_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = { getAll, get, post, put, deleteOne };
