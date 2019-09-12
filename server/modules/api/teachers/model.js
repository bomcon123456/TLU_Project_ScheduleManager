const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherModel = new Schema({
  name: { type: String, required: true },
  division: {
    type: Schema.Types.ObjectId,
    ref: "Division"
  },
  timestamps: { createdAt: "createdAt" }
});

module.exports = mongoose.model("Teacher", teacherModel);
