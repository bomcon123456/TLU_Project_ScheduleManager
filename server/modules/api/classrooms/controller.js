const Classroom = require("./model");
const Schedule = require("../schedules/model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let { filter } = req.query;
  let query = {};
  if (filter) {
    console.log("Classroom Client filter:" + filter);
    filter = JSON.parse(filter);
    if (filter.department) {
      query["department"] = filter.department;
    }
    if (filter.verified != null) {
      query["verified"] = filter.verified;
    }
    if (filter.date) {
      if (filter.date.group) {
        query["date.group"] = filter.date.group;
      }
      if (filter.date.semesters) {
        query["date.semesters"] = filter.date.semesters;
      }
      if (filter.date.year) {
        query["date.year"] = filter.date.year;
      }
    }
  }
  let classrooms = [];
  console.log(query);
  Classroom.find(query)
    .skip((page - 1) * size)
    .limit(size)
    .populate("courseId", "name")
    .populate("roomId", "name")
    .populate("teacherId", "name")
    .then(data => {
      classrooms = data;
      return Classroom.count(query);
    })
    .then(data => {
      console.log("Classrooms:" + " " + data);
      res.status(200).json({
        message: "fetched_classrooms_successfully",
        data: classrooms,
        size: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const id = req.params.id;
  Classroom.findById(id)
    .populate("courseId", "name")
    .populate("roomId", "name")
    .populate("teacherId", "name")
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

const post = (req, res, next) => {
  const { data } = req.body;
  promises = [];
  data.map(each => {
    classroom = new Classroom({ ...each });
    promises.push(classroom.save());
  });
  Promise.all(promises)
    .then(data => {
      res.status(200).json({
        message: "create_classroom_successfully"
      });
    })
    .catch(err => next(err));
};

const put = (req, res, next) => {
  const { id } = req.params;
  const { students, teacherId, roomId, date, verified } = req.body;
  let group, semesters, year;
  Classroom.findById(id)
    .then(data => {
      data.students = students || data.students;
      data.roomId = roomId || data.roomId;
      data.teacherId = teacherId || data.teacherId;
      data.date = date || data.date;
      if (verified) {
        data.verified = verified;
      }
      group = data.date.group;
      semesters = data.date.semeseters;
      year = data.date.year;

      return data.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_classroom_successfully",
        id: id
      });
      return Schedule.findOne({
        group: group,
        semeseters: semesters,
        year: year
      });
    })
    .then(schedule => {
      if (!schedule && verified == true) {
        schedule = new Schedule({
          group: group,
          semesters: semesters,
          year: year,
          timetable: [id]
        });
      } else if (schedule && verified == true) {
        schedule.timetable.push(id);
      } else if (schedule && verified == false) {
        schedule.timtable.filter(x => x != id);
      }
      return schedule.save();
    })
    .catch(err => {
      next(err);
    });
};

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
