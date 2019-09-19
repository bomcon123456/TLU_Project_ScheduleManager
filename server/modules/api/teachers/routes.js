const express = require("express");
const router = express.Router();

const Controller = require("./controller");

router.get("/", Controller.getTeachers);
router.get("/:teacherID", Controller.getTeacher);

module.exports = router;
