import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Online Learning Platform. All rights reserved.</p>
    </footer>
  );
}

export default Footer;