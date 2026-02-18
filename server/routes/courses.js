const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { sendEnrollmentEmail } = require("../utils/mailer");

// ✅ Get all courses
router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name");
    res.json(courses);
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Create a course
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, materials } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newCourse = new Course({
      title,
      description,
      instructor: req.user._id,
      materials: materials || [],
      studentsEnrolled: [],
      comments: [],
      progress: [],
      liveSessions: []
    });

    const saved = await newCourse.save();
    res.json(saved);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Enroll in a course
router.post("/enroll/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const studentId = req.user._id.toString();
    const alreadyEnrolled = course.studentsEnrolled.map(id => id.toString()).includes(studentId);

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.studentsEnrolled.push(req.user._id);
    course.progress.push({ studentId: req.user._id });

    await course.save();

    const user = await User.findById(req.user._id);
    try {
      await sendEnrollmentEmail(user.email, course.title);
    } catch (emailErr) {
      console.warn("Email sending failed:", emailErr.message);
    }

    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ message: "Server error during enrollment" });
  }
});

// ✅ Get specific course details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name").lean();
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add comment to a course
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const course = await Course.findById(req.params.id);
    const user = req.user;

    const comment = {
      user: {
        _id: user._id,
        name: user.name
      },
      text
    };

    course.comments.push(comment);
    await course.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get instructor's courses
router.get("/instructor/courses", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add Live Virtual Session (Instructor only)
router.post("/:id/live", authMiddleware, async (req, res) => {
  try {
    const { title, date, meetingLink } = req.body;
    if (!title || !date || !meetingLink) {
      return res.status(400).json({ message: "All fields are required for live session" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the instructor can add sessions" });
    }

    course.liveSessions.push({ title, date, meetingLink });
    await course.save();

    res.json({ message: "Live session added successfully", session: { title, date, meetingLink } });
  } catch (err) {
    console.error("Add live session error:", err);
    res.status(500).json({ message: "Failed to add session" });
  }
});

// ✅ Get Live Sessions of a Course
router.get("/:id/live", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.liveSessions || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// ✅ Update Course Progress (Student only)
router.put("/:id/progress", authMiddleware, async (req, res) => {
  try {
    const { completed, percentage } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const progressEntry = course.progress.find(p => p.studentId.toString() === req.user._id.toString());
    if (!progressEntry) return res.status(404).json({ message: "Progress not found for student" });

    if (typeof completed === "boolean") progressEntry.completed = completed;
    if (typeof percentage === "number") progressEntry.percentage = percentage;

    await course.save();
    res.json({ message: "Progress updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update progress" });
  }
});

// ✅ Get Instructor Dashboard Analytics
router.get("/instructor/analytics/summary", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const summary = courses.map((course) => {
      const totalStudents = course.studentsEnrolled.length;
      const avgProgress =
        course.progress.length > 0
          ? course.progress.reduce((sum, p) => sum + (p.percentage || 0), 0) / course.progress.length
          : 0;
      const totalSessions = course.liveSessions.length;

      return {
        courseId: course._id,
        courseTitle: course.title,
        totalStudents,
        averageProgress: avgProgress.toFixed(2),
        totalLiveSessions: totalSessions
      };
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

module.exports = router;
