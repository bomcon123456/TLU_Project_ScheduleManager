const Course = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  Course.estimatedDocumentCount(data => {
    total = data;
    return Course.find()
      .skip((page - 1) * size)
      .limit(size)
      .populate("department", "name");
  })
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

const get = (req, res, next) => {
  const id = req.params.id;
  return Course.findById(id)
    .populate("department", "name")
    .then(data => {
      // console.log( data);
      if (!data) {
        const err = new Error("fetch_course_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetch_course_successful",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const post = (req, res, next) => {
  const {
    id,
    name,
    credits,
    department,
    length,
    coursePrerequisites,
    creditPrerequisites
  } = req.body;
  course = new Course({
    _id: id,
    name: name,
    credits: credits,
    department: department,
    length: length,
    coursePrerequisites: coursePrerequisites,
    creditPrerequisites: creditPrerequisites
  });
  course
    .save()
    .then(data => {
      res.status(200).json({
        message: "create_course_successfully",
        id: data._id
      });
    })
    .catch(err => {
      next(err);
    });
};

const put = (req, res, next) => {
  const id = req.params.id;
  const {
    name,
    credits,
    department,
    length,
    coursePrerequisites,
    creditPrerequisites
  } = req.body;
  Course.findById(id)
    .then(course => {
      course.name = name || course.name;
      course.credits = credits || course.name;
      course.department = department || course.department;
      course.length = length || course.length;
      course.coursePrerequisites =
        coursePrerequisites || course.coursePrerequisites;
      course.creditPrerequisites =
        creditPrerequisites || course.creditPrerequisites;

      course.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_course_successfully",
        id: id
      });
    })
    .catch(err => next(err));
};
const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Course.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        const error = new Error("delete_course_failed");
        error.statusCode = 406;
        throw error;
      }
      res.status(200).json({
        message: "delete_course_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = { getAll, get, post, put, deleteOne };
