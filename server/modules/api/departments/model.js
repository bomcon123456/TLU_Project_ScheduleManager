const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { groups } = require("../../common/constants/groups");

const departmentSchema = new Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: String, required: true, unique: true },
    requestedCourses: {
      type: [
        {
          group: {
            type: String,
            enum: groups,
            required: true
          },
          courses: {
            type: [
              {
                type: Schema.Types.ObjectId,
                ref: "Course"
              }
            ],
            default: []
          }
        }
      ],
      default: [
        {
          group: "Group 1",
          courses: []
        },
        {
          group: "Group 2",
          courses: []
        },
        {
          group: "Group 3",
          courses: []
        }
      ]
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Department", departmentSchema);
