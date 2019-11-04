const bcrypt = require("bcryptjs");
const { validat1ionResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");

const User = require("./model");

const getAll = (req, res, next) => {
  return User.find()
    .then(data => {
      let usernames = data.map(each => {
        return {
          _id: each._id,
          username: each.username,
          name: each.name,
          gender: each.gender,
          role: each.role,
          department: each.department,
          birthday: each.birthday
        };
      });
      res.status(200).json(usernames);
    })
    .catch(err => {
      next(err);
    });
};

const get = (req, res, next) => {
  const userId = req.params.userId;
  return User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 404;
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

const post = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("user_validation_faied");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  let resUser = null;
  let token = null;
  const { email, name, password, department } = req.body;
  let username = null;
  let atIndex = email.indexOf("@");
  username = email.substring(0, atIndex);

  const user = new User({
    name: name,
    username: username,
    password: password,
    email: email
  });
  if (department) {
    user.department = department;
  }
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
      res.status(200).json({
        message: "create_user_successfully",
        user: resUser,
        token: token
      });
    })
    .catch(error => {
      next(error);
    });
};

const put = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then(user => {
      if (!user) {
        const error = new Error("account_not_found");
        error.statusCode = 404;
        throw error;
      }
      const { name, description, gender, birthday, username, role, department } = req.body;
      user.name = name || user.name;
      user.description = description || user.description;
      user.gender = gender || user.gender;
      user.birthday = birthday || user.birthday;
      user.username = username || user.username;
      user.role = role || user.role;
      user.department = department || user.department;
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

module.exports = { getAll, get, post, put };
