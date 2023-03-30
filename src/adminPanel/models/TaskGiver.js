const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    taskGiverId: {
      type: String,
      default: "",
    },
    priority: {
      type: Number,
      default: 0,
    },
    totalTasks : {
        type: Number,
        default : 0
    }
  },
  { timestamps: true }
);

schema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("TaskGivers", schema);