const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../../common/middleware/is-auth");
const userController = require("./controller");

const router = express.Router();

const createUserBodyValidator = [
  body("username")
    .withMessage("Please enter a valid username.")
    .custom((value, { req }) => {
      return User.findOne({ username: value }).then(user => {
        if (user) {
          return Promise.reject("account_existed");
        }
      });
    })
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 6 })
];

router.get("/", userController.getAll);

router.get("/:userId", userController.get);

router.post("/", createUserBodyValidator, userController.post);

router.post("/:id", userController.put);

module.exports = router;
