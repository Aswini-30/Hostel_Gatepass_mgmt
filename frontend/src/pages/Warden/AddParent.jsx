 // src/pages/Warden/AddParent.jsx
import React, { useState } from "react";
import axios from "axios";
import "./AddParent.css";

const API = import.meta.env.VITE_API_URL;

const AddParent = () => {
  const [form, setForm] = useState({
    parentName: "",
    studentRegisterNumber: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    occupation: "",
    address: "",
    emergencyContact: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem('wardenToken');
      if (!token) {
        setMessage('Authentication required. Please log in as warden.');
        setLoading(false);
        return;
      }

      const response = await axios.post('${API}/api/wardens/parents', form, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessage('Parent added successfully!');
        // Reset form after successful submission
        setForm({
          parentName: "",
          studentRegisterNumber: "",
          relationship: "",
          phoneNumber: "",
          email: "",
          occupation: "",
          address: "",
          emergencyContact: "",
          password: ""
        });
      }
    } catch (error) {
      console.error('Error adding parent:', error);
      setMessage(error.response?.data?.message || 'Failed to add parent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-parent-container">
      <div className="add-parent-header">
        <h1>Parent Management</h1>
        <p>Register New Parent/Guardian</p>
      </div>

      {/* Display success/error message */}
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="add-parent-content">
        <form onSubmit={handleSubmit} className="parent-form">
          <div className="form-section">
            <h2>Parent/Guardian Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parentName">PARENT/GUARDIAN NAME *</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  placeholder="Enter parent/guardian full name"
                  value={form.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="studentRegisterNumber">STUDENT REGISTER NUMBER *</label>
                <input
                  type="text"
                  id="studentRegisterNumber"
                  name="studentRegisterNumber"
                  placeholder="Enter student register number"
                  value={form.studentRegisterNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="relationship">RELATIONSHIP TO STUDENT *</label>
                <select
                  id="relationship"
                  name="relationship"
                  value={form.relationship}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">PHONE NUMBER *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="occupation">OCCUPATION</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  placeholder="Enter occupation"
                  value={form.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact">EMERGENCY CONTACT *</label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Enter emergency contact number"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">PASSWORD *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">RESIDENTIAL ADDRESS *</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete residential address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding Parent...' : 'REGISTER PARENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParent;