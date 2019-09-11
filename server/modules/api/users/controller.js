const bcrypt = require("bcryptjs");
const { validat1ionResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");

const User = require("./model");

exports.createUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("user_validation_faied");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  let resUser = null;
  let token = null;
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  let username = null;
  let atIndex = email.indexOf("@");
  username = email.substring(0, atIndex);

  const user = new User({
    name: name,
    username: username,
    password: password,
    email: email
  });
  return user
    .save()
    .then(result => {
      const loadedUser = result.toObject();
      token = jwt.sign(
        {
          username: loadedUser.username,
          userId: loadedUser._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      resUser = omit(loadedUser, ["password", "createdAt", "updatedAt"]);
      const myToken = crypto.randomBytes(16).toString("hex");
      let verifyToken = new VerifyToken({
        _userId: resUser._id,
        token: myToken
      });
      return verifyToken.save();
    })
    .then(() => {
      res.status(200).json({
        message: "user_created",
        user: resUser,
        token: token
      });
    })
    .catch(error => {
      console.log(error);
      next(error);
    });
};

exports.getUserNames = (req, res, next) => {
  return User.find()
    .then(data => {
      let usernames = data.map(each => {
        each.username, each._id;
      });
      res.status(200).json(usernames);
    })
    .catch(err => {
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  const userId = req.params.userId;
  return User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 400;
        throw error;
      }
      res.status(200).json({
        message: "user_info_retrieved",
        user: user
      });
    })
    .catch(error => {
      console.log(error);
      next(error);
    });
};
