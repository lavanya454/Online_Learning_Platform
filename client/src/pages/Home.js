import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Header title="Welcome to Online Learning" />
      <div className="home-container">
        <h1>Learn Anything. Anytime. Anywhere.</h1>
        <p>Your gateway to knowledge — Join now as a Student or Instructor!</p>
        <div className="home-buttons">
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
