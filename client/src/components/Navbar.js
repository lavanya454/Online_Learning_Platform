import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';


function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>Online Learning</h2>
      <div>
        {/* <Link to="/">Home</Link> */}
        {!user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} style={{background:"#388e3c"}}>Logout</button>
          </>
          // style={{ marginLeft: "1rem" }}
        )}
      </div>
    </nav>
  );
}

export default Navbar;
