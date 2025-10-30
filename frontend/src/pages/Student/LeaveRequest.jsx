// src/pages/Student/LeaveRequest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LeaveRequest.css";

const API = import.meta.env.VITE_API_URL;

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState("holiday");
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    destination: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const leaveData = {
        type: leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        destination: form.destination,
        emergencyContact: form.emergencyContact
      };

      const response = await fetch('${API}/api/students/leave-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leaveData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Leave request submitted successfully!');
        navigate("/student-dashboard");
      } else {
        setError(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-request-container">
      <div className="leave-request-header">
        <h1>Request Leave</h1>
        <p>Submit your leave application</p>
      </div>

      <div className="leave-request-content">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="leave-form">
          {/* Leave Type Selection */}
          <div className="form-section">
            <h2>Leave Type</h2>
            <div className="leave-type-selector">
              <label className={`type-option ${leaveType === 'holiday' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="leaveType"
                  value="holiday"
                  checked={leaveType === 'holiday'}
                  onChange={(e) => setLeaveType(e.target.value)}
                />
                <div className="option-content">
                  <h3>Normal Holiday</h3>
                  <p>Regular holidays and vacations</p>
                </div>
              </label>

              <label className={`type-option ${leaveType === 'emergency' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="leaveType"
                  value="emergency"
                  checked={leaveType === 'emergency'}
                  onChange={(e) => setLeaveType(e.target.value)}
                />
                <div className="option-content">
                  <h3>Emergency Leave</h3>
                  <p>Urgent situations requiring immediate leave</p>
                </div>
              </label>
            </div>
          </div>

          {/* Leave Details */}
          <div className="form-section">
            <h2>Leave Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">START DATE *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">END DATE *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="destination">DESTINATION</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="Where are you going?"
                  value={form.destination}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact">EMERGENCY CONTACT</label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Emergency contact number"
                  value={form.emergencyContact}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">REASON FOR LEAVE *</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Please provide detailed reason for your leave..."
                value={form.reason}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/student-dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'SUBMIT LEAVE REQUEST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;
