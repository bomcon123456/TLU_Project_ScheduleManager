const Department = require("../../api/departments/model");
const User = require("../../api/users/model");

const createUserForDep = () => {
  Department.find().then(data => {
    data.map(each => {
      const newUser = new User({
        username: each.schoolId.toLowerCase(),
        password: "123456",
        name: each.schoolId,
        department: each._id,
        role: 1
      });
      newUser
        .save()
        .then(data => data)
        .catch(err => console.log(err));
    });
  });
};

module.exports = { createUserForDep };
