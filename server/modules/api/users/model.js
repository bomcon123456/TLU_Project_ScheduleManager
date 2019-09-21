const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: {
      type: String,
      required: false,
      unique: true,
      validate: {
        validator: function(value) {
          const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return regex.test(value);
        },
        message: "{Value} is not a valid email address!"
      }
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "UNSPECIFIED", "NULL"],
      default: "NULL"
    },
    description: {
      type: String,
      default: ""
    },
    avatarURL: {
      type: String,
      default: `${process.env.ASSET_DIR}/1_0_100_v0.jpg`
    },
    role: {
      type: Number,
      min: 0
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division"
    },
    birthday: { type: Date, default: "2/9/1990" }
  },
  { timestamps: { createdAt: "createdAt" } }
);

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }

  bcrypt
    .genSalt(12)
    .then(salt => bcrypt.hash(this.password, salt))
    .then(hash => {
      this.password = hash;
      next();
    })
    .catch(err => next(err));
});

module.exports = mongoose.model("User", userSchema);
