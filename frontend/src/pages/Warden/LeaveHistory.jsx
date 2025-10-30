// src/pages/Warden/LeaveHistory.jsx
import React, { useState, useEffect } from "react";
import "./LeaveHistory.css";

const API = import.meta.env.VITE_API_URL;

const LeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchRegisterNumber, setSearchRegisterNumber] = useState("");

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async (startDate = "", endDate = "", registerNumber = "") => {
    try {
      const token = localStorage.getItem('wardenToken');
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      let url = '${API}/api/wardens/leave-history';
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (registerNumber) params.append('registerNumber', registerNumber);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaveHistory(Array.isArray(data.data) ? data.data : []);
      } else {
        setError("Failed to fetch leave history");
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let startDate = "";
    let endDate = "";

    if (searchDate) {
      startDate = searchDate;
      endDate = searchDate;
    }

    fetchLeaveHistory(startDate, endDate, searchRegisterNumber);
  };

  const handleClearSearch = () => {
    setSearchDate("");
    setSearchRegisterNumber("");
    fetchLeaveHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#27ae60';
      case 'exited': return '#3498db';
      case 'returned': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="leave-history"><p>Loading leave history...</p></div>;
  }

  if (error) {
    return <div className="leave-history"><p className="error">{error}</p></div>;
  }

  return (
    <div className="leave-history">
      <div className="header-section">
        <h2>Leave History</h2>
        <div className="search-section">
          <div className="search-inputs">
            <div className="input-group">
              <label>Date:</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
            <div className="input-group">
              <label>Register Number:</label>
              <input
                type="text"
                value={searchRegisterNumber}
                onChange={(e) => setSearchRegisterNumber(e.target.value)}
                placeholder="Enter register number"
              />
            </div>
          </div>
          <div className="search-buttons">
            <button className="search-btn" onClick={handleSearch}>Search</button>
            <button className="clear-btn" onClick={handleClearSearch}>Clear</button>
          </div>
        </div>
      </div>

      {leaveHistory.length === 0 ? (
        <div className="empty-state">
          <p>No leave history found</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Register No.</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Exit Time</th>
                <th>Return Time</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map(leave => (
                <tr key={leave._id}>
                  <td className="register-number">{leave.studentId?.registerNumber}</td>
                  <td className="student-name">{leave.studentId?.fullName}</td>
                  <td className="department">{leave.studentId?.department}</td>
                  <td className="year">{leave.studentId?.year} Year</td>
                  <td className="leave-type">{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}</td>
                  <td className="duration">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td className="status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(leave.status) }}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="applied-date">{formatDateTime(leave.createdAt)}</td>
                  <td className="exit-time">
                    {leave.securityApproval?.exitTime ? formatDateTime(leave.securityApproval.exitTime) : 'N/A'}
                  </td>
                  <td className="return-time">
                    {leave.securityApproval?.returnTime ? formatDateTime(leave.securityApproval.returnTime) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
