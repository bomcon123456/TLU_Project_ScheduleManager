const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

teacherSchema.index({ name: "text" });

module.exports = mongoose.model("Teacher", teacherSchema);
