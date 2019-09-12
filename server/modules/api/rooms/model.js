const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomModel = new Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  // If capacity = -1 => multiple class can be hosted here.
  location: {
    type: {
      building: {
        type: String,
        enum: ["A", "B", "BENHVIEN", "GIANGDUONG", "NHATC"]
      },
      floor: {
        type: Number,
        min: 1,
        max: 10
      }
    }
  },
  division: {
    type: Schema.Types.ObjectId,
    ref: "Division"
  },
  timestamps: { createdAt: "createdAt" }
});

module.exports = mongoose.model("Room", roomModel);