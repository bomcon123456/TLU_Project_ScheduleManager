const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const groups = require("../../common/constants/groups");
const semesters = require("../../common/constants/semesters");
const years = require("../../common/constants/years");

const scheduleSchema = new Schema(
  {
    group: { type: String, required: true, enum: groups },
    semesters: { type: String, required: true, enum: semesters },
    year: { type: String, required: true, enum: years },
    timetable: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Classroom"
        }
      ],
      default: []
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
