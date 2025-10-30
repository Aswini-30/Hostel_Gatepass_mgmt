import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EntryManagement.css";
import { FaArrowLeft, FaSignInAlt, FaSearch } from "react-icons/fa";

const EntryManagement = () => {
  const navigate = useNavigate();
  const [exitedStudents, setExitedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExitedStudents();
  }, []);

  const fetchExitedStudents = async () => {
    try {
      const token = localStorage.getItem('securityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/security/exited-students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExitedStudents(data);
      }
    } catch (error) {
      console.error('Error fetching exited students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (leaveId) => {
    try {
      const token = localStorage.getItem('securityToken');
      const response = await fetch(`http://localhost:5000/api/security/return/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Student entry recorded successfully');
        fetchExitedStudents(); // Refresh the list
        setSelectedStudent(null); // Close details if open
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to record entry');
      }
    } catch (error) {
      console.error('Error recording entry:', error);
      alert('Failed to record entry');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      exited: '#f39c12'
    };

    return {
      backgroundColor: statusColors[status] || '#95a5a6'
    };
  };

  const filteredStudents = exitedStudents.filter(leave =>
    leave.studentId?.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="entry-management">
        <div className="loading">Loading exited students...</div>
      </div>
    );
  }

  return (
    <div className="entry-management">
      <div className="entry-header">
        <h1>Entry Management</h1>
        <p>Manage student entries for those who have exited</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="entry-count">
        Total Exited Students: {filteredStudents.length}
      </div>

      <div className="entry-content">
        {/* Entry Management Table */}
        <div className="table-container">
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <p>No students match your search criteria</p>
            </div>
          ) : (
            <table className="entry-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Register Number</th>
                  <th>Department</th>
                  <th>Room</th>
                  <th>Leave Type</th>
                  <th>Exit Time</th>
                  <th>Return Time</th>
                  <th>Status</th>
                  <th>Security Staff</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(leave => (
                  <tr key={leave._id}>
                    <td>{leave.studentId?.fullName}</td>
                    <td>{leave.studentId?.registerNumber}</td>
                    <td>{leave.studentId?.department} - {leave.studentId?.year}</td>
                    <td>{leave.studentId?.roomNumber}</td>
                    <td>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave</td>
                    <td>{leave.securityApproval?.exitTime ? formatDateTime(leave.securityApproval.exitTime) : 'N/A'}</td>
                    <td>Not returned</td>
                    <td>
                      <span
                        className="status-badge"
                        style={getStatusBadge(leave.status)}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{leave.securityApproval?.approvedBy?.name || 'N/A'}</td>
                    <td>
                      <button
                        className="entry-btn"
                        onClick={() => handleEntry(leave._id)}
                      >
                        <FaSignInAlt /> Mark Entry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryManagement;
