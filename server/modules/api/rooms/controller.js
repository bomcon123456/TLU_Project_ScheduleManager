const Room = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  Room.estimatedDocumentCount()
    .then(data => {
      total = data;
      return Room.find()
        .skip((page - 1) * size)
        .limit(size);
    })
    .then(data => {
      res.status(200).json({
        message: "fetched_rooms_successfully",
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
  Room.findById(id)
    .then(data => {
      if (!data) {
        const err = new Error("fetch_teacher_failed");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "fetched_room_successfully",
        data: data
      });
    })
    .catch(err => {
      next(err);
    });
};

// @TODO: support file
const post = (req, res, next) => {
  const { name, capacity, location, roomType } = req.body;
  room = new Room({
    name: name,
    capacity: capacity,
    location: location,
    roomType: roomType
  });
  room
    .save()
    .then(data => {
      res.status(200).json({
        message: "create_room_successfully",
        id: data._id
      });
    })
    .catch(err => {
      next(err);
    });
};

const put = (req, res, next) => {
  const id = req.params.id;
  const { name, capacity, location, roomType } = req.body;
  Room.findById(id)
    .then(theRoom => {
      theRoom.name = name || theRoom.name;
      theRoom.capacity = capacity || theRoom.capacity;
      theRoom.location = location || theRoom.location;
      theRoom.roomType = roomType || theRoom.roomType;
      theRoom.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_room_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

const deleteOne = (req, res, next) => {
  const id = req.params.id;
  Room.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        const error = new Error("delete_room_failed");
        error.statusCode = 406;
        throw error;
      }
      res.status(200).json({
        message: "delete_room_successfully",
        id: id
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = { getAll, get, post, put, deleteOne };
