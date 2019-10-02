const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const shifts = require("../../common/constants/shifts");
const days = require("../../common/constants/days");
const groups = require("../../common/constants/groups");
const semesters = require("../../common/constants/semesters");
const years = require("../../common/constants/years");

const customDateSchema = new Schema({
  shift: { type: String, required: true, enum: shifts },
  day: { type: String, required: true, enum: days },
  group: { type: String, required: true, enum: groups },
  semesters: { type: String, required: true, enum: semesters },
  year: { type: String, required: true, enum: years }
});

module.exports = { customDateSchema };
