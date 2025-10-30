import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./WardenProfile.css";
import { FaUser, FaEnvelope, FaVenus, FaMars, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const WardenProfile = () => {
  const navigate = useNavigate();
  const [wardenProfile, setWardenProfile] = useState({
    name: "",
    gender: "",
    email: "",
    hostel: "",
    phoneNumber: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load warden profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('wardenToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get warden profile from localStorage first
        const savedProfile = localStorage.getItem('wardenProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setWardenProfile(profile);
        }

        // Fetch updated profile from API
        const response = await axios.get('${API}/api/wardens/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setWardenProfile(response.data.data);
          localStorage.setItem('wardenProfile', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // If API fails, use localStorage data
        const savedProfile = localStorage.getItem('wardenProfile');
        if (savedProfile) {
          setWardenProfile(JSON.parse(savedProfile));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWardenProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('wardenToken');
      const response = await axios.put('${API}/api/wardens/profile', wardenProfile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setWardenProfile(response.data.data);
        localStorage.setItem('wardenProfile', JSON.stringify(response.data.data));
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload profile from localStorage to discard changes
    const savedProfile = localStorage.getItem('wardenProfile');
    if (savedProfile) {
      setWardenProfile(JSON.parse(savedProfile));
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="warden-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="warden-profile-container">
      <div className="profile-header">
        <h1>Warden Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {wardenProfile.gender === 'Female' ? <FaVenus size={60} /> : <FaMars size={60} />}
            </div>
            <h2>{wardenProfile.name}</h2>
            <p className="warden-role">{wardenProfile.gender === 'Female' ? 'Female Warden' : 'Male Warden'}</p>
            <p className="warden-hostel">{wardenProfile.assignedHostel}</p>
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
                  name="name"
                  value={wardenProfile.name}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{wardenProfile.name}</p>
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
                  name="email"
                  value={wardenProfile.email}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{wardenProfile.email}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaUser className="detail-icon" />
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={wardenProfile.gender}
                  onChange={handleInputChange}
                  className="profile-input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              ) : (
                <p>{wardenProfile.gender === 'Female' ? 'Female' : 'Male'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaUser className="detail-icon" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={wardenProfile.phone || ''}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Enter phone number"
                />
              ) : (
                <p>{wardenProfile.phone || 'Not provided'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <FaUser className="detail-icon" />
                Assigned Hostel
              </label>
              <p>{wardenProfile.assignedHostel || 'Not assigned'}</p>
            </div>


          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FaSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <FaTimes />
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenProfile;
