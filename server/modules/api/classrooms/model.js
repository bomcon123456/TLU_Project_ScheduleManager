const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customDateSchema = require("../customDate/schema");

const classroomSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    students: { type: Number, required: true },
    courseId: {
      type: String,
      ref: "Course"
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room"
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher"
    },
    date: {
      type: customDateSchema,
      require: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Classroom", classroomSchema);
