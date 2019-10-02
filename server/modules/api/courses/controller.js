const Course = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let { filter } = req.query;
  let query = {};
  if (filter) {
    filter = JSON.parse(filter);
    if (filter._id) {
      idQuery = new RegExp(filter._id, "i");
      query._id = idQuery;
    }
    if (filter.name) {
      query["$text"] = { $search: filter.name };
    }
    if (filter.credits) {
      query.credits = {
        $lte: filter.credits.max,
        $gte: filter.credits.min
      };
    }
    if (filter.creditPrerequisites) {
      query.creditPrerequisites = {
        $lte: filter.creditPrerequisites.max,
        $gte: filter.creditPrerequisites.min
      };
    }
    if (filter.department) {
      query.department = filter.department;
    }
  }
  let courses = [];
  console.log(query);
  Course.find(query)
    .skip((page - 1) * size)
    .limit(size)
    .populate("department", "name")
    .then(data => {
      courses = data;
      return Course.count(query);
    })
    .then(data => {
      console.log("Courses:" + " " + data);
      res.status(200).json({
        message: "fetched_courses_successfully",
        data: courses,
        size: data
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
