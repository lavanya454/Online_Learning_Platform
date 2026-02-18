const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  text: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const materialSchema = new mongoose.Schema({
  title: String,
  link: String
});

const progressSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  completed: {
    type: Boolean,
    default: false
  },
  percentage: {
    type: Number,
    default: 0
  }
});

const liveSessionSchema = new mongoose.Schema({
  title: String,
  date: Date,
  meetingLink: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  materials: [materialSchema],
  comments: [commentSchema],
  progress: [progressSchema],
  liveSessions: [liveSessionSchema]
});

module.exports = mongoose.model("Course", courseSchema);
