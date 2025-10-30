import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Forgot Password</h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ padding: "10px", width: "300px", marginBottom: "20px" }}
      >
        <option value="student">Student</option>
        <option value="parent">Parent</option>
        <option value="warden">Warden</option>
        <option value="security">Security</option>
        <option value="admin">Admin</option>
      </select>
      <br />
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", width: "300px", marginBottom: "20px" }}
      />
      <br />
      <button
        onClick={handleReset}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#1d0be2",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </div>
  );
};

export default ForgotPassword;
