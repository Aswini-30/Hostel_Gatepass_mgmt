import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import axios from "axios";
import "./Home.css";

// Background images
import hostelBg from "../../assets/images/hostel2-bg.jpg";
import hostel1Bg from "../../assets/images/hostel-bg.jpg";
import hostel2Bg from "../../assets/images/hostel1-bg.jpg";

const backgrounds = [hostelBg, hostel1Bg, hostel2Bg];

const Home = () => {
  const [currentBg, setCurrentBg] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Email/password login
  const handleLogin = async () => {
    if (!role) return alert("Please select a role!");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role,
      });

      const userRole = res.data.user.role.toLowerCase();

      // Store user data in localStorage for dashboard use
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userData', JSON.stringify(res.data.user));

      switch (userRole) {
        case "admin":
          localStorage.setItem('adminToken', res.data.token);
          window.location.href = "/admin-dashboard";
          break;
        case "warden":
          // Store warden profile for dashboard
          localStorage.setItem('wardenToken', res.data.token);
          localStorage.setItem('wardenProfile', JSON.stringify({
            name: res.data.user.name,
            gender: res.data.user.gender,
            email: res.data.user.email,
            hostel: res.data.user.gender === 'Female' ? 'Girls Hostel' : 'Boys Hostel'
          }));
          window.location.href = "/warden-dashboard";
          break;
        case "security":
          localStorage.setItem('securityToken', res.data.token);
          window.location.href = "/security-dashboard";
          break;
        case "student":
          localStorage.setItem('studentToken', res.data.token);
          window.location.href = "/student-dashboard";
          break;
        case "parent":
          localStorage.setItem('parentToken', res.data.token);
          window.location.href = "/parent-dashboard";
          break;
        default:
          alert("Invalid role or route not found!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your email for reset link!");
    if (!role) return alert("Please select your role first!");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email, role }
      );
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending reset link!");
    }
  };

  // Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    const userData = jwt_decode(credentialResponse.credential);
    if (!role) return alert("Please select a role!");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", {
        email: userData.email,
        name: userData.name,
        role,
      });

      const userRole = res.data.user.role.toLowerCase();

      switch (userRole) {
        case "admin":
          localStorage.setItem('adminToken', res.data.token);
          window.location.href = "/admin-dashboard";
          break;
        case "warden":
          // Store warden profile for dashboard
          localStorage.setItem('wardenToken', res.data.token);
          localStorage.setItem('wardenProfile', JSON.stringify({
            name: res.data.user.name,
            gender: res.data.user.gender,
            email: res.data.user.email,
            hostel: res.data.user.gender === 'Female' ? 'Girls Hostel' : 'Boys Hostel'
          }));
          window.location.href = "/warden-dashboard";
          break;
        case "security":
          localStorage.setItem('securityToken', res.data.token);
          window.location.href = "/security-dashboard";
          break;
        case "student":
          localStorage.setItem('studentToken', res.data.token);
          window.location.href = "/student-dashboard";
          break;
        case "parent":
          localStorage.setItem('parentToken', res.data.token);
          window.location.href = "/parent-dashboard";
          break;
        default:
          alert("Invalid role or route not found!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Google login failed!");
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed!");
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">WELCOME TO GATEX</h2>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Home Section with Background */}
      <section
        className="home-section"
        id="home"
        style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
      >
        <div className="login-box">
          <h3>Login</h3>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="forgot-password" onClick={handleForgotPassword}>
            Forgot Password?
          </p>

          <select
            className="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select your role</option>
            <option value="admin">Admin</option>
            <option value="warden">Warden</option>
            <option value="security">Security</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <p>or</p>

          <div className="google-login-container" style={{ marginTop: "15px" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <h2>About Hostel Gatepass System</h2>
        <p>
          The Hostel Gatepass System is a modern digital solution designed to
          automate and manage student gatepass permissions efficiently.
        </p>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <h2>Contact Us</h2>
        <p>Email: nec@gatex.com</p>
        <p>Phone: +91 9876543210</p>
        <p>Address: Hostel, National Engineering College</p>
      </section>
    </div>
  );
};

export default Home;
