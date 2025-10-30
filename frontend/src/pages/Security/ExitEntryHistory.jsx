import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ExitEntryHistory.css";

const API = import.meta.env.VITE_API_URL;

const ExitEntryHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchExitEntryHistory();
  }, []);

  const fetchExitEntryHistory = async () => {
    try {
      const token = localStorage.getItem('securityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('${API}/api/security/exit-entry-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching exit entry history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(record => {
    const matchesSearch = record.studentId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId?.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      exited: '#f39c12',
      returned: '#27ae60'
    };

    return {
      backgroundColor: statusColors[status] || '#95a5a6'
    };
  };

  if (loading) {
    return (
      <div className="exit-entry-history">
        <div className="loading">Loading exit entry history...</div>
      </div>
    );
  }

  return (
    <div className="exit-entry-history">
      <div className="history-header">
        <h1>Exit & Entry History</h1>
        <p>Track all student exit and entry records with timestamps</p>
      </div>

      <div className="history-content">
        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by student name or register number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="status-filter">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-select"
            >
              <option value="all">All Status</option>
              <option value="exited">Exited</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="table-container">
          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              <p>No exit entry records found</p>
            </div>
          ) : (
            <table className="history-table">
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
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(record => (
                  <tr key={record._id}>
                    <td>{record.studentId?.fullName}</td>
                    <td>{record.studentId?.registerNumber}</td>
                    <td>{record.studentId?.department} - {record.studentId?.year}</td>
                    <td>{record.studentId?.roomNumber}</td>
                    <td>{record.type.charAt(0).toUpperCase() + record.type.slice(1)} Leave</td>
                    <td>{record.securityApproval?.exitTime ? formatDateTime(record.securityApproval.exitTime) : 'N/A'}</td>
                    <td>{record.securityApproval?.returnTime ? formatDateTime(record.securityApproval.returnTime) : 'Not returned'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={getStatusBadge(record.status)}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{record.securityApproval?.approvedBy?.name || 'N/A'}</td>
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

export default ExitEntryHistory;
