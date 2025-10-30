// src/pages/Warden/StudentsList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentsList.css";
import { FaEdit, FaTrash, FaSearch, FaUserGraduate, FaTimes } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    registerNumber: "",
    department: "",
    year: "",
    phoneNumber: "",
    email: "",
    roomNumber: "",
    parentName: "",
    parentPhone: "",
    address: ""
  });

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('wardenToken');
      const response = await axios.get('${API}/api/wardens/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Backend now filters students by warden's gender, so no need for frontend filtering
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      alert('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;
    const matchesYear = !filterYear || student.year === filterYear;
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      fullName: student.fullName,
      registerNumber: student.registerNumber,
      department: student.department,
      year: student.year,
      phoneNumber: student.phoneNumber || "",
      email: student.email || "",
      roomNumber: student.roomNumber || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      address: student.address || ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('wardenToken');
      await axios.put(`${API}/api/wardens/students/${editingStudent._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await fetchStudents(); // Refresh the list
      setShowEditModal(false);
      setEditingStudent(null);
      alert('Student updated successfully');
    } catch (error) {
      console.error('Failed to update student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const token = localStorage.getItem('wardenToken');
        await axios.delete(`${API}/api/wardens/students/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await fetchStudents(); // Refresh the list
        alert('Student deleted successfully');
      } catch (error) {
        console.error('Failed to delete student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="students-list-container">
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="students-list-container">
      <div className="students-header">
        <h1>Students Management</h1>
        <p>View and manage all registered students</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">Mechanical</option>
            <option value="CIVIL">Civil</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Students Count */}
      <div className="students-count">
        Total Students: {filteredStudents.length}
      </div>

      {/* Students Table */}
      <div className="students-table-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <FaUserGraduate size={48} color="#bdc3c7" />
            <h3>No Students Found</h3>
            <p>No students match your search criteria</p>
          </div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Register No.</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Gender</th>
                <th>Hostel</th>
                <th>Room No.</th>
                <th>Student Phone</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="register-number">{student.registerNumber}</td>
                  <td className="student-name">{student.fullName}</td>
                  <td className="department">{student.department}</td>
                  <td className="year">{student.year} Year</td>
                  <td className="gender">
                    <span className={`gender-badge ${student.gender.toLowerCase()}`}>
                      {student.gender}
                    </span>
                  </td>
                  <td className="hostel">{student.hostel}</td>
                  <td className="room">{student.roomNumber || 'N/A'}</td>
                  <td className="phone">{student.phoneNumber}</td>
                  <td className="parent-name">{student.parentName || 'N/A'}</td>
                  <td className="parent-phone">{student.parentPhone || 'N/A'}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(student)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(student._id)}
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
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Register Number</label>
                  <input
                    type="text"
                    value={editForm.registerNumber}
                    onChange={(e) => setEditForm({...editForm, registerNumber: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">Mechanical</option>
                    <option value="CIVIL">Civil</option>
                    <option value="IT">IT</option>
                    <option value="AIDS">AIDS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({...editForm, roomNumber: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Parent Name</label>
                  <input
                    type="text"
                    value={editForm.parentName}
                    onChange={(e) => setEditForm({...editForm, parentName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Parent Phone</label>
                  <input
                    type="text"
                    value={editForm.parentPhone}
                    onChange={(e) => setEditForm({...editForm, parentPhone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
