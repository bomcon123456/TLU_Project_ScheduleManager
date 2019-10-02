const express = require("express");
const router = express.Router();

const Controller = require("./controller");

router.get("/free-rooms", Controller.getFreeRooms);

module.exports = router;
