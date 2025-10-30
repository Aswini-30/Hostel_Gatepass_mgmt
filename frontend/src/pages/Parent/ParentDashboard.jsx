// src/pages/Parent/ParentDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ParentDashboard.css";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentLeaves();
  }, []);

  const fetchStudentLeaves = async () => {
    try {
      const token = localStorage.getItem('parentToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/parents/student-leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentInfo(data.student);
        setStudentLeaves(data.leaves);
      } else {
        console.error('Failed to fetch student leaves');
      }
    } catch (error) {
      console.error('Error fetching student leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (leaveId) => {
    try {
      const token = localStorage.getItem('parentToken');
      const response = await fetch(`http://localhost:5000/api/parents/approve-leave/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Leave approved successfully');
        fetchStudentLeaves(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to approve leave');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f39c12';
      case 'parent_approved': return '#3498db';
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'exited': return '#9b59b6';
      case 'returned': return '#1abc9c';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return <div className="parent-dashboard"><p>Loading...</p></div>;
  }

  return (
    <div className="parent-dashboard">
      <div className="parent-header">
        <div>
          <h1>Parent Dashboard</h1>
          <p>Monitor your child's leave requests</p>
        </div>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('parentToken');
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>

      {studentInfo && (
        <div className="student-info-card">
          <h2>Student Information</h2>
          <div className="student-details">
            <p><strong>Name:</strong> {studentInfo.fullName}</p>
            <p><strong>Register Number:</strong> {studentInfo.registerNumber}</p>
            <p><strong>Department:</strong> {studentInfo.department}</p>
            <p><strong>Year:</strong> {studentInfo.year}</p>
          </div>
        </div>
      )}

      <div className="leaves-section">
        <h2>Leave Requests</h2>
        {studentLeaves.length === 0 ? (
          <div className="empty-state">
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="leaves-list">
            {studentLeaves.map(leave => (
              <div key={leave.id} className="leave-card">
                <div className="leave-header">
                  <h3>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(leave.status) }}
                  >
                    {leave.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="leave-details">
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reason:</span>
                    <span className="value">{leave.reason}</span>
                  </div>
                  {leave.emergencyContact && (
                    <div className="detail-row">
                      <span className="label">Emergency Contact:</span>
                      <span className="value">{leave.emergencyContact}</span>
                    </div>
                  )}
                  {leave.destination && (
                    <div className="detail-row">
                      <span className="label">Destination:</span>
                      <span className="value">{leave.destination}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Requested:</span>
                    <span className="value">{formatDate(leave.createdAt)}</span>
                  </div>
                </div>

                {/* Parent approval button for emergency leaves */}
                {leave.type === 'emergency' && leave.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={() => approveLeave(leave.id)}
                    >
                      Approve Emergency Leave
                    </button>
                  </div>
                )}

                {/* Security status */}
                {leave.securityStatus && leave.securityStatus !== 'in_hostel' && (
                  <div className="security-status">
                    <p><strong>Current Status:</strong> {leave.securityStatus.replace('_', ' ').toUpperCase()}</p>
                    {leave.exitTime && (
                      <p><strong>Exit Time:</strong> {new Date(leave.exitTime).toLocaleString()}</p>
                    )}
                    {leave.returnTime && (
                      <p><strong>Return Time:</strong> {new Date(leave.returnTime).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
