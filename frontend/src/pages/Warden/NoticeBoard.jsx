// src/pages/Warden/NoticeBoard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NoticeBoard.css";
import { FaEdit, FaTrash, FaPlus, FaBell } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    expiryDate: ""
  });

  // Fetch notices from API
  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('wardenToken');
      const response = await axios.get('${API}/api/wardens/notices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        setNotices(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      alert('Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load notices on component mount
  useEffect(() => {
    fetchNotices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('wardenToken');

      if (editingNotice) {
        // Update existing notice
        await axios.put(`${API}/api/wardens/notices/${editingNotice._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Create new notice
        await axios.post('${API}/api/wardens/notices', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Refresh notices
      await fetchNotices();
      resetForm();
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('Failed to save notice. Please try again.');
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      expiryDate: notice.expiryDate || ""
    });
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        const token = localStorage.getItem('wardenToken');
        await axios.delete(`${API}/api/wardens/notices/${noticeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await fetchNotices(); // Refresh notices
      } catch (error) {
        console.error('Failed to delete notice:', error);
        alert('Failed to delete notice. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      expiryDate: ""
    });
    setEditingNotice(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#3498db';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="notice-board-container">
      <div className="notice-board-header">
        <div className="header-left">
          <h1>Notice Board Management</h1>
        </div>
        <button 
          className="add-notice-btn"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Add New Notice
        </button>
      </div>

      {/* Notice Form */}
      {showForm && (
        <div className="notice-form-overlay">
          <div className="notice-form-container">
            <div className="form-header">
              <h2>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="notice-form">
              <div className="form-group">
                <label htmlFor="title">NOTICE TITLE *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter notice title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">NOTICE DESCRIPTION *</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter detailed notice description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">PRIORITY LEVEL *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">EXPIRY DATE (OPTIONAL)</label>
                  <input
                    type="datetime-local"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="notices-section">
        <h2>Active Notices ({notices.length})</h2>
        
        {notices.length === 0 ? (
          <div className="empty-state">
            <FaBell size={48} color="#bdc3c7" />
            <h3>No Notices Yet</h3>
            <p>Create your first notice to display to students</p>
          </div>
        ) : (
          <div className="notices-grid">
            {notices.map(notice => (
              <div key={notice._id} className="notice-card">
                <div 
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(notice.priority) }}
                ></div>
                <div className="notice-content">
                  <div className="notice-header">
                    <h3>{notice.title}</h3>
                    <span className={`priority-badge ${notice.priority}`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="notice-description">{notice.description}</p>
                  <div className="notice-meta">
                    <span>Created: {formatDate(notice.createdAt)}</span>
                    {notice.expiryDate && (
                      <span>Expires: {formatDate(notice.expiryDate)}</span>
                    )}
                  </div>
                </div>
                <div className="notice-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(notice)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(notice._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;