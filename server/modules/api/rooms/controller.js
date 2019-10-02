const Room = require("./model");

const getAll = (req, res, next) => {
  const page = req.query.page || 1;
  const size = parseInt(req.query.size) || 5;
  let total = -1;
  let { filter } = req.query;
  let query = {};
  if (filter) {
    filter = JSON.parse(filter);
    if (filter.location) {
      if (filter.location.building) {
        query["location.building"] = filter.location.building;
      }
      if (filter.location.floor) {
        query["location.floor"] = filter.location.floor;
      }
    }
    if (filter.capacity) {
      query.capacity = { $lte: filter.capacity.max, $gte: filter.capacity.min };
    }
  }
  let rooms = [];
  console.log(query);
  Room.find(query)
    .skip((page - 1) * size)
    .limit(size)
    .then(data => {
      rooms = data;
      return Room.count(query);
    })
    .then(data => {
      console.log("Rooms: " + data);
      res.status(200).json({
        message: "fetched_rooms_successfully",
        data: rooms,
        size: data
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
        const err = new Error("fetch_room_failed");
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
