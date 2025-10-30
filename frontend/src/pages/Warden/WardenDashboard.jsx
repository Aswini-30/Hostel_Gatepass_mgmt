import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WardenDashboard.css";
import {
  FaUserGraduate,
  FaClipboardList,
  FaBell,
  FaSignOutAlt,
  FaUserPlus,
  FaUsers,
  FaUserCircle,
  FaStickyNote,
  FaTachometerAlt,
  FaUser,
  FaVenus,
  FaMars,
  FaHistory
} from "react-icons/fa";

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  
  // State for dynamic counts
  const [studentCount, setStudentCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  
  // Warden profile state
  const [wardenProfile, setWardenProfile] = useState({
    name: "",
    gender: "", // 'male' or 'female'
    email: "",
    hostel: ""
  });

  // Table data
  const [tableData, setTableData] = useState([]);

  // Load warden profile and data from localStorage
  useEffect(() => {
    // Load warden profile
    const savedWardenProfile = localStorage.getItem('wardenProfile');
    if (savedWardenProfile) {
      const profile = JSON.parse(savedWardenProfile);
    // Ensure gender-based hostel assignment and consistency
    if (profile.hostel === 'Girls Hostel') {
      profile.gender = 'female';
    } else if (profile.hostel === 'Boys Hostel') {
      profile.gender = 'male';
    } else {
      // Default to female if not set
      profile.gender = 'female';
      profile.hostel = 'Girls Hostel';
    }
      localStorage.setItem('wardenProfile', JSON.stringify(profile));
      setWardenProfile(profile);
    } else {
      // Default profile if not set (you can remove this after implementing login)
      const defaultProfile = {
        name: "Asmitha",
        gender: "female",
        email: "asmithaganesan10@gmail.com",
        hostel: "Girls Hostel"
      };
      setWardenProfile(defaultProfile);
      localStorage.setItem('wardenProfile', JSON.stringify(defaultProfile));
    }

    // Load counts from API
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('wardenToken');
        if (token) {
          const response = await fetch('http://localhost:5000/api/wardens/dashboard-counts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setStudentCount(data.studentCount);
            setNoticeCount(data.noticeCount);
            setLeaveCount(data.leaveCount);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        // Fallback to localStorage
        const savedStudentCount = localStorage.getItem('wardenStudentCount');
        const savedNoticeCount = localStorage.getItem('wardenNoticeCount');
        const savedLeaveCount = localStorage.getItem('wardenLeaveCount');

        if (savedStudentCount) setStudentCount(parseInt(savedStudentCount));
        if (savedNoticeCount) setNoticeCount(parseInt(savedNoticeCount));
        if (savedLeaveCount) setLeaveCount(parseInt(savedLeaveCount));
      }
    };

    fetchCounts();
  }, []);

  // Fetch leave analytics data based on actual leave data
  useEffect(() => {
    const fetchLeaveAnalytics = async () => {
      try {
        const token = localStorage.getItem('wardenToken');
        if (token) {
          const response = await fetch('http://localhost:5000/api/wardens/leave-analytics', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setTableData(data.tableData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching leave analytics:', error);
      }
    };

    fetchLeaveAnalytics();
  }, []);

  const handleMenuClick = (menuItem) => {
    setActiveMenu(menuItem);
    switch(menuItem) {
      case "Dashboard":
        navigate("/warden-dashboard");
        break;
      case "Add Student":
        navigate("/add-student");
        break;
      case "Add Parent":
        navigate("/add-parent");
        break;
      case "Leave Requests":
        navigate("/leave-requests");
        break;
      case "Leave History":
        navigate("/leave-history");
        break;
      case "Notice Board":
        navigate("/notice-board");
        break;
      case "Students List":
        navigate("/students-list");
        break;
      case "Parents List":
        navigate("/parents-list");
        break;
      case "My Profile":
        navigate("/warden-profile");
        break;
      case "Logout":
        localStorage.removeItem('wardenToken');
        localStorage.removeItem('wardenProfile');
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Add Student", icon: <FaUserPlus /> },
    { name: "Add Parent", icon: <FaUserCircle /> },
    { name: "Students List", icon: <FaUsers /> },
    { name: "Parents List", icon: <FaUser /> },
    { name: "Leave Requests", icon: <FaClipboardList /> },
    { name: "Leave History", icon: <FaHistory /> },
    { name: "Notice Board", icon: <FaStickyNote /> },
    { name: "My Profile", icon: <FaUser /> },
    { name: "Logout", icon: <FaSignOutAlt /> }
  ];

  return (
    <div className="warden-dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Warden Panel</h2>
          <div className="warden-profile-sidebar">
            <div className="warden-avatar">
              {wardenProfile.gender === 'female' ? <FaVenus /> : <FaMars />}
            </div>
            <div className="warden-info">
              <h4>{wardenProfile.name}</h4>
              <p>{wardenProfile.gender === 'female' ? 'Female Warden' : 'Male Warden'}</p>
              <p>{wardenProfile.hostel}</p>
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
          <h1 className="dashboard-title">Warden Dashboard</h1>
          <p className="welcome-text">
            Welcome {wardenProfile.name} 👋
          </p>
        </div>

        <div className="divider"></div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="section-title">WARDEN OVERVIEW - {wardenProfile.gender === 'female' ? 'GIRLS HOSTEL' : 'BOYS HOSTEL'}</h2>

          <div className="stats-grid">
            <div className="stat-card stat-students">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <h3>Total {wardenProfile.gender === 'female' ? 'Female' : 'Male'} Students</h3>
                <p className="stat-number">{studentCount}</p>
                <p className="stat-label">Registered Students</p>
              </div>
            </div>

            <div className="stat-card stat-notices">
              <div className="stat-icon">📢</div>
              <div className="stat-content">
                <h3>Notices</h3>
                <p className="stat-number">{noticeCount}</p>
                <p className="stat-label">Active Notices</p>
              </div>
            </div>

            <div className="stat-card stat-leaves">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Leave Requests</h3>
                <p className="stat-number">{leaveCount}</p>
                <p className="stat-label">Pending Approvals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2 className="section-title">Student Leave Analytics</h2>

          <div className="table-container">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Number of Students Left</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => {
                    const date = new Date(item.date);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return (
                      <tr key={index}>
                        <td>{`${day}-${month}-${year}`}</td>
                        <td>{item.count}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="2">No leave data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;