import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialLink, setMaterialLink] = useState("");
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Fetching courses error:", err);
      }
    };

    const fetchMyCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses/instructor/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyCourses(res.data);
      } catch (err) {
        console.error("Fetching instructor courses error:", err);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses/instructor/analytics/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        console.error("Fetching analytics error:", err);
      }
    };

    fetchCourses();
    if (user?.role === "instructor") {
      fetchMyCourses();
      fetchAnalytics();
    }
  }, [navigate, user]);

  const handleCreate = async () => {
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/create",
        { title, description, materials },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Course created!");
      setCourses((prev) => [...prev, res.data]);
      setMyCourses((prev) => [...prev, res.data]);
      setShowForm(false);
      setTitle("");
      setDescription("");
      setMaterials([]);
    } catch (err) {
      console.error("Create course error:", err.response?.data || err.message);
      alert("Error creating course");
    }
  };

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/courses/enroll/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Enrolled successfully");
      window.location.reload();
    } catch (err) {
      console.error("Enroll error:", err);
      alert("Error enrolling in course");
    }
  };

  const handleAddMaterial = () => {
    if (materialTitle && materialLink) {
      setMaterials((prev) => [...prev, { title: materialTitle, link: materialLink }]);
      setMaterialTitle("");
      setMaterialLink("");
    } else {
      alert("Please fill both material title and link");
    }
  };

  const studentId = (user?._id || user?.id)?.toString();

  const enrolledCourses = courses.filter((course) =>
    course.studentsEnrolled.some((id) => id.toString() === studentId)
  );

  const availableCourses = courses.filter((course) =>
    !course.studentsEnrolled.some((id) => id.toString() === studentId)
  );

  const renderMaterials = (materials) => {
    return (
      materials?.length > 0 && (
        <div>
          <strong>Materials:</strong>
          <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
            {materials.map((mat, idx) => (
              <li key={idx}>
                <a href={mat.link} target="_blank" rel="noreferrer">
                  {mat.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )
    );
  };

  return (
    <>
      <Header title={`Dashboard (${user?.role})`} />
      <div className="dashboard-container">
        <h2 className="welcome-text">Welcome, {user?.name}</h2>

        {/* Instructor Section */}
        {user?.role === "instructor" && (
          <div className="instructor-section">
            <button className="toggle-button" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Create Course"}
            </button>

            {showForm && (
              <div className="course-form">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Course Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Material Title"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Material Link"
                  value={materialLink}
                  onChange={(e) => setMaterialLink(e.target.value)}
                />
                <button onClick={handleAddMaterial}>Add Material</button>
                <button onClick={handleCreate}>Submit</button>
              </div>
            )}

            <h3>My Created Courses</h3>
            <div className="course-grid">
              {myCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <Link to={`/course/${course._id}`}><h4>{course.title}</h4></Link>
                  <p>{course.description}</p>
                  <p className="subtext">Enrolled Students: {course.studentsEnrolled.length}</p>
                  {renderMaterials(course.materials)}
                </div>
              ))}
            </div>

            <h3>📊 Analytics Summary</h3>
            <div className="course-grid">
              {analytics.map((item) => (
                <div key={item.courseId} className="course-card">
                  <h4>{item.courseTitle}</h4>
                  <p>Total Students: {item.totalStudents}</p>
                  <p>Average Progress: {item.averageProgress}%</p>
                  <p>Live Sessions: {item.totalLiveSessions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Section */}
        {user?.role === "student" && (
          <div className="student-section">
            <h3>✅ Enrolled Courses</h3>
            <div className="course-grid">
              {enrolledCourses.length === 0 ? (
                <p>You have not enrolled in any courses yet.</p>
              ) : (
                enrolledCourses.map((course) => (
                  <div key={course._id} className="course-card">
                    <Link to={`/course/${course._id}`}><h4>{course.title}</h4></Link>
                    <p>{course.description}</p>
                    <p className="subtext">Instructor: {course.instructor?.name}</p>
                    {renderMaterials(course.materials)}
                    {course.liveSessions?.length > 0 && (
                      <ul className="dashboard-live-sessions">
                        {course.liveSessions.map((session, idx) => (
                          <li key={idx}>
                            <strong>{session.title}</strong><br />
                            {new Date(session.date).toLocaleString()}<br />
                            <a href={session.meetingLink} className="join-button" target="_blank" rel="noreferrer">
                              Join
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>

            <h3>🆕 Available Courses</h3>
            <div className="course-grid">
              {availableCourses.length === 0 ? (
                <p>No available courses to enroll.</p>
              ) : (
                availableCourses.map((course) => (
                  <div key={course._id} className="course-card">
                    <Link to={`/course/${course._id}`}><h4>{course.title}</h4></Link>
                    <p>{course.description}</p>
                    <p className="subtext">Instructor: {course.instructor?.name}</p>
                    {renderMaterials(course.materials)}
                    <button onClick={() => handleEnroll(course._id)}>Enroll</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
