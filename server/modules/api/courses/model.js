const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  _id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  department: { type: Schema.Types.ObjectId, ref: "Department" },
  length: {
    type: {
      theory: {
        type: Number,
        required: true
      },
      practice: {
        type: Number
      }
    },
    required: true
  },
  coursePrerequisites: {
    type: [{ type: { type: Schema.Types.ObjectId, ref: "Course" } }],
    default: []
  },
  creditPrerequisites: {
    type: Number,
    default: 0
  },
  timestamps: { createdAt: "createdAt" }
});

module.exports = mongoose.model("Course", courseSchema);
