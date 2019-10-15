const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groups = require("../../common/constants/groups");
const semesters = require("../../common/constants/semesters");
const years = require("../../common/constants/years");

const calendarSchema = new Schema(
  {
    group: { type: String, required: true, enum: groups },
    semesters: { type: String, required: true, enum: semesters },
    year: { type: String, required: true, enum: years },
    startDate: { type: Date, default: "2/9/1990" },
    endDate: { type: Date, default: "2/9/1990" }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Calendar", calendarSchema);
