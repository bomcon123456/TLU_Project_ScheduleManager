const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { groups } = require("../../common/constants/groups");

const departmentSchema = new Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: String, required: true, unique: true }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Department", departmentSchema);
