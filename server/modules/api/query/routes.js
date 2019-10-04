const express = require("express");
const router = express.Router();

const Controller = require("./controller");

router.get("/free-rooms", Controller.getFreeRooms);
router.get("/free-shifts", Controller.getFreeShifts);
router.get("/free-days", Controller.getFreeDays);

module.exports = router;
