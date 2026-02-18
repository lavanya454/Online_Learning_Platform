import React, { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/courses/create", {
        ...form,
        instructor: user.id
      });
      setForm({ title: "", description: "" });
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
    } catch (err) {
      alert("Error creating course");
    }
  };

  return (
    <div className="dashboard">
      <h2>Available Courses</h2>
      {courses.map((course) => (
        <div key={course._id} style={{ marginBottom: "10px" }}>
          <h4>{course.title}</h4>
          <p>{course.description}</p>
          <p><i>Instructor: {course.instructor?.name}</i></p>
        </div>
      ))}

      {user?.role === "instructor" && (
        <form onSubmit={handleSubmit}>
          <h3>Create New Course</h3>
          <input
            type="text"
            placeholder="Course Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button type="submit">Create Course</button>
        </form>
      )}
    </div>
  );
}

export default Courses;
