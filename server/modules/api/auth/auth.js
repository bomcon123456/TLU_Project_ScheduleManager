const User = require("../users/model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const omit = require("lodash/omit");

const { validationResult } = require("express-validator/check");

exports.getAuthenUser = (req, res, next) => {
  const userId = req.user.id;
  return User.findById(userId)
    .select(
      "_id avatarUrl birthday description email gender name role username department"
    )
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json(user);
    })
    .catch(error => {
      next(error);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  return User.findOne({ username: username })
    .lean()
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error("wrong_password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          username: loadedUser.username,
          department: loadedUser.department,
          role: loadedUser.role,
          userId: loadedUser._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      let resUser = omit(loadedUser, ["createdAt", "updatedAt"]);
      console.log(resUser);
      res.status(200).json({
        message: "login_succeed",
        token: token
        // user: resUser
      });
    })
    .catch(error => {
      next(error);
    });
};

exports.update = (req, res, next) => {
  let id = req.user.id;
  User.findById(id)
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 404;
        throw error;
      }
      const { email, name, description, gender, avatarURL } = req.body;
      user.email = email || user.email;
      user.name = name || user.name;
      user.description = description || user.description;
      user.gender = gender || user.gender;
      user.avatarURL = avatarURL || user.avatarURL;
      return user.save();
    })
    .then(data => {
      res.status(200).json({
        message: "update_user_successfully",
        id: id
      });
    })
    .catch(error => {
      next(error);
    });
};

exports.changePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  let id = req.user.id;
  return User.findById(id)
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.compare(currentPassword, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error("wrong_password");
        error.statusCode = 401;
        throw error;
      }
      user.password = newPassword;
      return user.save();
    })
    .then(data => {
      res.status(200).json({
        message: "password_changed"
      });
    })
    .catch(error => {
      next(error);
    });
};
