// src/pages/Security/SecurityDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityDashboard.css";
import {
  FaShieldAlt,
  FaSignOutAlt,
  FaHistory,
  FaTachometerAlt,
  FaUser,
  FaUserTimes,
  FaUserClock,
  FaSignInAlt
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [searchRegisterNumber, setSearchRegisterNumber] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState(null);



  useEffect(() => {
    fetchApprovedStudents();
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
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      const token = localStorage.getItem('securityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('${API}/api/security/approved-students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApprovedStudents(data);
      }
    } catch (error) {
      console.error('Error fetching approved students:', error);
    }
  };

  const searchStudent = async () => {
    if (!searchRegisterNumber.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('securityToken');
      const response = await fetch(`${API}/api/security/student/${searchRegisterNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchedStudent(data);
      } else {
        setSearchedStudent(null);
        alert('Student not found');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      alert('Error searching student');
    } finally {
      setLoading(false);
    }
  };

  const handleExitEntry = async (leaveId, action) => {
    try {
      const token = localStorage.getItem('securityToken');
      const endpoint = action === 'exit' ? 'exit' : 'return';

      const response = await fetch(`${API}/api/security/${endpoint}/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`Student ${action} recorded successfully`);
        fetchApprovedStudents();
        if (searchedStudent) {
          searchStudent(); // Refresh searched student data
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to record ${action}`);
      }
    } catch (error) {
      console.error(`Error recording ${action}:`, error);
      alert(`Failed to record ${action}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      approved: '#27ae60',
      exited: '#f39c12',
      returned: '#3498db',
      in_hostel: '#95a5a6'
    };

    return {
      backgroundColor: statusColors[status] || '#95a5a6'
    };
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
    switch(menuItem) {
      case "Dashboard":
        navigate("/security-dashboard");
        break;
      case "Entry Management":
        navigate("/security/entry-management");
        break;
      case "Exit/Entry History":
        navigate("/security/exit-entry-history");
        break;
      case "My Profile":
        navigate("/security/profile");
        break;
      case "Logout":
        localStorage.removeItem('securityToken');
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Entry Management", icon: <FaSignInAlt /> },
    { name: "Exit/Entry History", icon: <FaHistory /> },
    { name: "My Profile", icon: <FaUser /> },
    { name: "Logout", icon: <FaSignOutAlt /> }
  ];

  return (
    <div className="warden-dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Security Panel</h2>
          <div className="warden-profile-sidebar">
            <div className="warden-avatar">
              <FaShieldAlt />
            </div>
            <div className="warden-info">
              <h4>{securityData ? securityData.name : 'Security'}</h4>
              <p>Gate Management</p>
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

      {/* Main Content Area */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Security Dashboard</h1>
          <p className="welcome-text">Manage student exit and entry</p>
        </div>

        <div className="divider"></div>

        {/* Quick Search */}
        <div className="search-section">
          <h2>Quick Student Search</h2>
          <div className="search-form">
            <input
              type="text"
              placeholder="Enter Register Number"
              value={searchRegisterNumber}
              onChange={(e) => setSearchRegisterNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
            />
            <button onClick={searchStudent} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchedStudent && (
            <div className="student-card">
              <div className="student-info">
                <h3>{searchedStudent.student.fullName}</h3>
                <p>Reg No: {searchedStudent.student.registerNumber}</p>
                <p>{searchedStudent.student.department} - {searchedStudent.student.year}</p>
                <p>Room: {searchedStudent.student.roomNumber}</p>
              </div>

              {searchedStudent.currentLeave ? (
                <div className="leave-info">
                  <p><strong>Leave Type:</strong> {searchedStudent.currentLeave.type}</p>
                  <p><strong>Duration:</strong> {(() => {
                    const startDate = new Date(searchedStudent.currentLeave.startDate);
                    const endDate = new Date(searchedStudent.currentLeave.endDate);
                    const startDay = String(startDate.getDate()).padStart(2, '0');
                    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
                    const startYear = startDate.getFullYear();
                    const endDay = String(endDate.getDate()).padStart(2, '0');
                    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                    const endYear = endDate.getFullYear();
                    return `${startDay}-${startMonth}-${startYear} - ${endDay}-${endMonth}-${endYear}`;
                  })()}</p>
                  <span
                    className="status-badge"
                    style={getStatusBadge(searchedStudent.currentLeave.securityStatus)}
                  >
                    {searchedStudent.currentLeave.securityStatus.replace('_', ' ').toUpperCase()}
                  </span>

                  <div className="action-buttons">
                    {searchedStudent.currentLeave.securityStatus === 'in_hostel' && (
                      <button
                        className="exit-btn"
                        onClick={() => handleExitEntry(searchedStudent.currentLeave.id, 'exit')}
                      >
                        Mark Exit
                      </button>
                    )}

                    {searchedStudent.currentLeave.securityStatus === 'exited' && (
                      <button
                        className="return-btn"
                        onClick={() => handleExitEntry(searchedStudent.currentLeave.id, 'return')}
                      >
                        Mark Return
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="no-leave">No active leave found</p>
              )}
            </div>
          )}
        </div>

        {/* Approved Students List */}
        <div className="approved-students-section">
          <h2>Approved Students for Exit</h2>
          {approvedStudents.length === 0 ? (
            <div className="empty-state">
              <p>No approved students found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Register Number</th>
                    <th>Department</th>
                    <th>Room</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedStudents.map(leave => (
                    <tr key={leave._id}>
                      <td>{leave.studentId?.fullName}</td>
                      <td>{leave.studentId?.registerNumber}</td>
                      <td>{leave.studentId?.department} - {leave.studentId?.year}</td>
                      <td>{leave.studentId?.roomNumber}</td>
                      <td>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave</td>
                      <td>{(() => {
                        const startDate = new Date(leave.startDate);
                        const endDate = new Date(leave.endDate);
                        const startDay = String(startDate.getDate()).padStart(2, '0');
                        const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
                        const startYear = startDate.getFullYear();
                        const endDay = String(endDate.getDate()).padStart(2, '0');
                        const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                        const endYear = endDate.getFullYear();
                        return `${startDay}-${startMonth}-${startYear} - ${endDay}-${endMonth}-${endYear}`;
                      })()}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={getStatusBadge(leave.securityApproval?.currentStatus || 'approved')}
                        >
                          {(leave.securityApproval?.currentStatus || 'approved').replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(!leave.securityApproval || leave.securityApproval.currentStatus === 'in_hostel') && (
                            <button
                              className="exit-btn"
                              onClick={() => handleExitEntry(leave._id, 'exit')}
                            >
                              Mark Exit
                            </button>
                          )}

                          {leave.securityApproval?.currentStatus === 'exited' && (
                            <button
                              className="return-btn"
                              onClick={() => handleExitEntry(leave._id, 'return')}
                            >
                              Mark Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
