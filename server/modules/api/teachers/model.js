const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Teacher", teacherSchema);
