const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Register routes properly
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log("Server running on port 5000")
  );
}).catch(err => console.error("MongoDB connection error:", err));
