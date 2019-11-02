const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../../common/middleware/is-auth");
const userController = require("./controller");

const router = express.Router();

router.get("/", userController.getAll);

router.get("/:userId", userController.get);

router.put("/:id", userController.put);

module.exports = router;
