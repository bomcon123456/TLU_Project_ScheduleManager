const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shifts = require("../../common/constants/shifts");
const days = require("../../common/constants/days");
const groups = require("../../common/constants/groups");
const semesters = require("../../common/constants/semesters");
const years = require("../../common/constants/years");

const classroomSchema = new Schema(
  {
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
      type: String,
      ref: "Teacher"
    },
    date: {
      type: {
        shift: { type: String, required: true, enum: shifts },
        day: { type: String, required: true, enum: days },
        group: { type: String, required: true, enum: groups },
        semesters: { type: String, required: true, enum: semesters },
        year: { type: String, required: true, enum: years }
      },
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
