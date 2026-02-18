import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import "../styles/CourseDetail.css";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(res.data);

        if (user?.role === "student") {
          const myProgress = res.data.progress?.find(p => p.studentId === user._id || p.studentId === user.id);
          if (myProgress) {
            setProgress(myProgress.percentage || 0);
            setCompleted(myProgress.completed || false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLiveSessions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}/live`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiveSessions(res.data);
      } catch (err) {
        console.error("Live session fetch error:", err);
      }
    };

    fetchCourse();
    fetchLiveSessions();
  }, [id, token, user]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/courses/${id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleAddLiveSession = async () => {
    if (!liveTitle || !liveDate || !liveLink) {
      alert("Please fill in all live session fields");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/courses/${id}/live`,
        { title: liveTitle, date: liveDate, meetingLink: liveLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Live session added successfully");
      setLiveSessions((prev) => [...prev, res.data.session]);
      setLiveTitle("");
      setLiveDate("");
      setLiveLink("");
    } catch (err) {
      console.error("Add live session error:", err);
      alert("Failed to update live session");
    }
  };

  const handleProgressUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/courses/${id}/progress`,
        { completed, percentage: progress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Progress updated successfully");
    } catch (err) {
      console.error("Progress update error:", err);
      alert("Failed to update progress");
    }
  };

  const isStudentEnrolled = () => {
    if (!course || !user || user.role !== "student") return false;
    return course.studentsEnrolled?.some(id => id.toString() === user._id || id.toString() === user.id);
  };

  if (!course) return <p>Loading...</p>;

  return (
    <>
      <Header title="Course Details" />
      <div className="course-details-container">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <p><strong>Instructor:</strong> {course.instructor?.name}</p>

        <h3>Materials</h3>
        <ul>
          {course.materials.map((mat, idx) => (
            <li key={idx}>
              <a href={mat.link} target="_blank" rel="noreferrer">{mat.title}</a>
            </li>
          ))}
        </ul>

        <h3>Discussion</h3>
        <div className="comments-section">
          {course.comments.map((comment, idx) => (
            <div key={idx} className="comment">
              <strong>{comment.user.name}:</strong> {comment.text}
            </div>
          ))}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
          />
          <button onClick={handleComment}>Post</button>
        </div>

        {(user?.role === "instructor" || isStudentEnrolled()) && (
          <>
            <h3>Live Sessions</h3>
            {liveSessions.length === 0 ? (
              <p>No sessions scheduled yet.</p>
            ) : (
              <div className="live-sessions-list">
                {liveSessions.map((session, idx) => (
                  <div key={idx} className="live-session-card">
                    <h4>{session.title}</h4>
                    <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="join-button"
                    >
                      Join Session
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {user?.role === "student" && isStudentEnrolled() && (
          <div style={{ marginTop: "30px" }}>
            <h3>📊 Your Course Progress</h3>
            <label>
              Completion Percentage: {progress}%
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              /> Mark as Completed
            </label>
            <button onClick={handleProgressUpdate} style={{ marginTop: "10px" }}>Update Progress</button>
          </div>
        )}

        {user?.role === "instructor" && (
          <div className="live-session-form" style={{ marginTop: "20px" }}>
            <h4>Add Live Session</h4>
            <input
              type="text"
              placeholder="Session Title"
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
            />
            <input
              type="datetime-local"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Meeting Link"
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
            />
            <button onClick={handleAddLiveSession} style={{ marginTop: "10px" }}>
              Add Session
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CourseDetail;