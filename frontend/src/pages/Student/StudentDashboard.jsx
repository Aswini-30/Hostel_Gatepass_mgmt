// src/pages/Student/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaUser,
  FaClipboardList,
  FaCalendarAlt,
  FaHistory,
  FaBell
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [studentProfile, setStudentProfile] = useState({
    name: "John Student",
    registerNumber: "2023001",
    department: "CSE",
    year: "3rd Year",
    hostel: "Boys Hostel",
    roomNumber: "A-101"
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [notices, setNotices] = useState([]);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Request Leave", icon: <FaCalendarAlt /> },
    { name: "My Profile", icon: <FaUser /> },
    { name: "Logout", icon: <FaSignOutAlt /> }
  ];

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
    switch(menuItem) {
      case "Dashboard":
        navigate("/student-dashboard");
        break;
      case "Request Leave":
        navigate("/leave-request");
        break;
      case "My Profile":
        navigate("/student-profile");
        break;
      case "Logout":
        localStorage.removeItem('studentToken');
        navigate("/login");
        break;
      default:
        break;
    }
  };

  // Fetch real data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch student profile
        const profileResponse = await fetch('${API}/api/students/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setStudentProfile({
            name: profileData.fullName,
            registerNumber: profileData.registerNumber,
            department: profileData.department,
            year: profileData.year,
            hostel: profileData.hostel,
            roomNumber: profileData.roomNumber
          });
        }

        // Fetch leave history
        const leavesResponse = await fetch('${API}/api/students/leaves', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json();
          setLeaveHistory(leavesData.map(leave => {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            const startDay = String(startDate.getDate()).padStart(2, '0');
            const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
            const startYear = startDate.getFullYear();
            const endDay = String(endDate.getDate()).padStart(2, '0');
            const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
            const endYear = endDate.getFullYear();
            return {
              id: leave._id,
              type: leave.type === 'holiday' ? 'Holiday' : 'Emergency',
              startDate: `${startDay}-${startMonth}-${startYear}`,
              endDate: `${endDay}-${endMonth}-${endYear}`,
              status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
              reason: leave.reason
            };
          }));
        }

        // Fetch notices
        const noticesResponse = await fetch('${API}/api/students/notices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (noticesResponse.ok) {
          const noticesData = await noticesResponse.json();
          setNotices(noticesData.map(notice => {
            const date = new Date(notice.createdAt);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return {
              id: notice._id,
              title: notice.title,
              description: notice.description,
              priority: notice.priority,
              date: `${day}-${month}-${year}`
            };
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return '#27ae60';
      case 'Pending': return '#f39c12';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#3498db';
    }
  };

  return (
    <div className="student-dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Student Panel</h2>
          <div className="student-info">
            <div className="student-avatar">
              <FaUser />
            </div>
            <div className="student-details">
              <h4>{studentProfile.name}</h4>
              <p>{studentProfile.registerNumber}</p>
              <p>{studentProfile.department}</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {studentProfile.name}</p>
        </div>

        <div className="divider"></div>

        {/* Quick Stats */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{leaveHistory.length}</div>
              <div className="stat-label">Total Leaves</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {leaveHistory.filter(leave => leave.status === 'Approved').length}
              </div>
              <div className="stat-label">Approved Leaves</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {leaveHistory.filter(leave => leave.status === 'Pending').length}
              </div>
              <div className="stat-label">Pending Leaves</div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {/* Leave History */}
          <div className="content-card">
            <h2>Recent Leave History</h2>
            {leaveHistory.length === 0 ? (
              <div className="empty-state">
                <p>No leave history found</p>
              </div>
            ) : (
              <div className="leave-list">
                {leaveHistory.map(leave => (
                  <div key={leave.id} className="leave-item">
                    <div className="leave-info">
                      <h4>{leave.type} Leave</h4>
                      <p>{leave.startDate} to {leave.endDate}</p>
                      <p className="leave-reason">{leave.reason}</p>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(leave.status) }}
                    >
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              className="view-all-btn"
              onClick={() => navigate("/leave-request")}
            >
              Request New Leave
            </button>
          </div>

          {/* Notices */}
          <div className="content-card">
            <h2>Recent Notices</h2>
            {notices.length === 0 ? (
              <div className="empty-state">
                <p>No notices available</p>
              </div>
            ) : (
              <div className="notices-list">
                {notices.map(notice => (
                  <div key={notice.id} className="notice-item">
                    <div className="notice-header">
                      <h4>{notice.title}</h4>
                      <span
                        className="priority-dot"
                        style={{ backgroundColor: getPriorityColor(notice.priority) }}
                      ></span>
                    </div>
                    <p>{notice.description}</p>
                    <span className="notice-date">{notice.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
