const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    length: {
      type: {
        theory: {
          type: Number
        },
        practice: {
          type: Number
        },
        combined: {
          type: Number
        }
      },
      required: true
    },
    coursePrerequisites: {
      type: [{ type: String, ref: "Course" }],
      default: []
    },
    creditPrerequisites: {
      type: Number,
      default: 0
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

courseSchema.index({ name: "text" });

module.exports = mongoose.model("Course", courseSchema);
