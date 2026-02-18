import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from "./pages/CourseDetail";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
