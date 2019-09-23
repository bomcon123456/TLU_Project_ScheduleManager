const Department = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  Department.find()
    .skip((page - 1) * size)
    .limit(size)
    .then(data => {
      res.status(200).json({
        message: "fetched_departments_successfully",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const id = req.params.id;
  Department.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_department_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetched_department_successfully",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

// @TODO: support file
const post = (req, res, next) => {
  const { name, schoolId } = req.body;
  department = new Room({
    name: name,
    schoolId: schoolId
  });
  Department.save()
    .then(data => {
      res.status(200).json({
        message: "create_department_successfully",
        id: data._id
      });
    })
    .catch(err => {
      next(err);
    });
};

const put = (req, res, next) => {
  const { name, schoolId } = req.body;
  const id = req.params.id;
  Department.findById(id)
    .then(data => {
      data.name = name || data.name;
      data.schoolId = schoolId || data.schoolId;
      return data.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_department_successfully",
        id: data._id
      });
    })
    .catch(err => {
      next(err);
    });
};

const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Department.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        const error = new Error("delete_department_failed");
        error.statusCode = 406;
        throw error;
      }
      res.status(200).json({
        message: "delete_department_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = { getAll, get, post, put, deleteOne };
