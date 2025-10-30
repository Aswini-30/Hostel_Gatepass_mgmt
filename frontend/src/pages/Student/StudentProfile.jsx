// src/pages/Student/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaIdCard, FaGraduationCap, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaBuilding, FaDoorOpen, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "./StudentProfile.css";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
        setEditedProfile(data);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(studentProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch('http://localhost:5000/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setStudentProfile(updatedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="student-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="student-profile-container">
        <div className="error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <div className="profile-header">
         <h1 style={{ color: 'black' }}>My Profile</h1>
        <p>View and manage your personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <h2>{studentProfile.fullName}</h2>
            <p className="student-info">{studentProfile.registerNumber}</p>
            <p className="student-dept">{studentProfile.department} - {studentProfile.year}</p>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <label>
                <FaUser className="detail-icon" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={editedProfile.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <p>{studentProfile.fullName}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaIdCard className="detail-icon" />
                Register Number
              </label>
              <p>{studentProfile.registerNumber}</p>
            </div>

            <div className="detail-group">
              <label>
                <FaGraduationCap className="detail-icon" />
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={editedProfile.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              ) : (
                <p>{studentProfile.department}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaCalendarAlt className="detail-icon" />
                Year
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={editedProfile.year || ''}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                />
              ) : (
                <p>{studentProfile.year}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaVenusMars className="detail-icon" />
                Gender
              </label>
              <p>{studentProfile.gender}</p>
            </div>

            <div className="detail-group">
              <label>
                <FaPhone className="detail-icon" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={editedProfile.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              ) : (
                <p>{studentProfile.phoneNumber}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaEnvelope className="detail-icon" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="profile-input"
                  value={editedProfile.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <p>{studentProfile.email}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaBuilding className="detail-icon" />
                Hostel
              </label>
              <p>{studentProfile.hostel}</p>
            </div>

            <div className="detail-group">
              <label>
                <FaDoorOpen className="detail-icon" />
                Room Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={editedProfile.roomNumber || ''}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                />
              ) : (
                <p>{studentProfile.roomNumber}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaMapMarkerAlt className="detail-icon" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  className="profile-input profile-textarea"
                  value={editedProfile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <p>{studentProfile.address}</p>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave}>
                  <FaSave />
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  <FaTimes />
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={handleEdit}>
                <FaEdit />
                Update Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
