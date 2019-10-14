const express = require("express");

const authController = require("./auth");

const isAuth = require("../../common/middleware/is-auth");

const router = express.Router();

router.post("/", authController.login);

router.put("/", authController.update);

router.get("/", isAuth, authController.getAuthenUser);

module.exports = router;
