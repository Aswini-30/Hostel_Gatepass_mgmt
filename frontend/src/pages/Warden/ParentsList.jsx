// src/pages/Warden/ParentsList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ParentsList.css";
import { FaEdit, FaTrash, FaSearch, FaUserCircle } from "react-icons/fa";

const ParentsList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Fetch parents from API
  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('wardenToken');
      const response = await axios.get('http://localhost:5000/api/wardens/parents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setParents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch parents:', error);
      alert('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Filter parents based on search
  const filteredParents = parents.filter(parent => {
    const matchesSearch = parent.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (parent.studentId && parent.studentId.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         parent.studentRegisterNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (parentId) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        const token = localStorage.getItem('wardenToken');
        await axios.delete(`http://localhost:5000/api/wardens/parents/${parentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await fetchParents(); // Refresh the list
        alert('Parent deleted successfully');
      } catch (error) {
        console.error('Failed to delete parent:', error);
        alert('Failed to delete parent. Please try again.');
      }
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setEditForm({
      name: parent.parentName,
      email: parent.email,
      phone: parent.phoneNumber,
      address: parent.address
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('wardenToken');
      await axios.put(`http://localhost:5000/api/wardens/parents/${editingParent._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShowEditModal(false);
      setEditingParent(null);
      await fetchParents(); // Refresh the list
      alert('Parent updated successfully');
    } catch (error) {
      console.error('Failed to update parent:', error);
      alert('Failed to update parent. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="parents-list-container">
        <div className="loading">Loading parents...</div>
      </div>
    );
  }

  return (
    <div className="parents-list-container">
      <div className="parents-header">
        <h1>Parents Management</h1>
        <p>View and manage all registered parents</p>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by parent name, email, or student details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Parents Count */}
      <div className="parents-count">
        Total Parents: {filteredParents.length}
      </div>

      {/* Parents Table */}
      <div className="parents-table-container">
        {filteredParents.length === 0 ? (
          <div className="empty-state">
            <FaUserCircle size={48} color="#bdc3c7" />
            <h3>No Parents Found</h3>
            <p>No parents match your search criteria</p>
          </div>
        ) : (
          <table className="parents-table">
            <thead>
              <tr>
                <th>Parent Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Student Name</th>
                <th>Student Register No.</th>
                <th>Department</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent._id}>
                  <td className="parent-name">{parent.parentName}</td>
                  <td className="email">{parent.email}</td>
                  <td className="phone">{parent.phoneNumber}</td>
                  <td className="student-name">{parent.studentId ? parent.studentId.fullName : 'N/A'}</td>
                  <td className="register-number">{parent.studentRegisterNumber}</td>
                  <td className="department">{parent.studentId ? parent.studentId.department : 'N/A'}</td>
                  <td className="year">{parent.studentId ? `${parent.studentId.year} Year` : 'N/A'}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(parent)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(parent._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Parent</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentsList;
