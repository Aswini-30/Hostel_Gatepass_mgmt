import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityProfile.css";
import { FaShieldAlt, FaUser, FaEnvelope, FaPhone, FaIdBadge } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const SecurityProfile = () => {
  const navigate = useNavigate();
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityProfile();
  }, []);

  const fetchSecurityProfile = async () => {
    try {
      const token = localStorage.getItem('securityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('${API}/api/security/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityData(data.data);
      } else {
        console.error('Failed to fetch security profile');
      }
    } catch (error) {
      console.error('Error fetching security profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="security-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="security-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        {securityData ? (
          <div className="profile-card">
            <div className="profile-avatar">
              <FaShieldAlt />
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <div>
                  <label>Name</label>
                  <p>{securityData.name}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaIdBadge className="detail-icon" />
                <div>
                  <label>Employee ID</label>
                  <p>{securityData._id}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div>
                  <label>Email</label>
                  <p>{securityData.email}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <div>
                  <label>Phone</label>
                  <p>{securityData.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaShieldAlt className="detail-icon" />
                <div>
                  <label>Role</label>
                  <p>Security Personnel</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-state">
            <p>Unable to load profile information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityProfile;
