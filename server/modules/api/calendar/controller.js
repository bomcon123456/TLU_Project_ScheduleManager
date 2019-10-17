const Calendar = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  Calendar.find()
    .skip((page - 1) * size)
    .limit(size)
    .then(data => {
      calendars = data;
      return calendar.count(query);
    })
    .then(data => {
      console.log("calendars: " + data);
      res.status(200).json({
        message: "fetched_calendars_successfully",
        data: calendars,
        size: data
      });
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const id = req.params.id;
  Calendar.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_calendar_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetched_calendar_successfully",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

// @TODO: support file
const post = (req, res, next) => {
  const { group, semester, year, startDate, endDate } = req.body;
  calendar = new calendar({
    group: group,
    semester: semester,
    year: year,
    startDate: startDate,
    endDate: endDate
  });
  Calendar.save()
    .then(data => {
      res.status(200).json({
        message: "create_calendar_successfully",
        id: data._id
      });
    })
    .catch(err => {
      next(err);
    });
};

const put = (req, res, next) => {
  const id = req.params.id;
  const { startDate, endDate, openForOffering } = req.body;
  Calendar.findById(id)
    .then(thecalendar => {
      thecalendar.startDate = startDate || thecalendar.startDate;
      thecalendar.endDate = endDate || thecalendar.endDate;
      thecalendar.openForOffering =
        openForOffering || thecalendar.openForOffering;
      thecalendar.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_calendar_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Calendar.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        const error = new Error("delete_calendar_failed");
        error.statusCode = 406;
        throw error;
      }
      res.status(200).json({
        message: "delete_calendar_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = { getAll, get, post, put, deleteOne };
