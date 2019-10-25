const express = require("express");
const router = express.Router();

const Controller = require("./controller");

router.get("/free-rooms", Controller.getFreeRooms);
router.get("/teacher-free-shifts", Controller.getTeacherFreeShifts);
router.get("/free-shifts", Controller.getFreeShifts);
router.get("/free-days", Controller.getFreeDays);
router.get("/check-is-offer", Controller.isOpenForOffer);
router.get("/teacher-schedule", Controller.getTeacherSchedule);
router.get("/department-schedule", Controller.getDepartmentSchedule);
router.get("/get-schedule", Controller.getSchedule);
router.get("/number-of-class", Controller.getNumberOfClass);

module.exports = router;
