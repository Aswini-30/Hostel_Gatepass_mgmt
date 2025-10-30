import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configure your backend URL
const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // State Management
  const [securityList, setSecurityList] = useState([]);
  const [wardenList, setWardenList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Page State
  const [activePage, setActivePage] = useState("overview");

  // Filter states for pages
  const [genderFilter, setGenderFilter] = useState("All");
  const [leaveFromDate, setLeaveFromDate] = useState("");
  const [leaveToDate, setLeaveToDate] = useState("");
  const [leaveGenderFilter, setLeaveGenderFilter] = useState("All");

  // Form states
  const [securityForm, setSecurityForm] = useState({
    name: "",
    shift: "Morning",
    phone: "",
    email: "",
    password: "",
  });

  const [wardenForm, setWardenForm] = useState({
    name: "",
    gender: "Male",
    assignedHostel: "Boys Hostel",
    phone: "",
    email: "",
    password: "",
  });

  // Validation errors state
  const [wardenErrors, setWardenErrors] = useState({
    phone: "",
    email: "",
    password: "",
  });

  const [securityErrors, setSecurityErrors] = useState({
    phone: "",
    email: "",
    password: "",
  });

  // Fetch Leave List from Backend
  const fetchLeaveList = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert("Admin authentication required. Please login again.");
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveList(response.data);
    } catch (error) {
      console.error("Error fetching leave list:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to load leave data";
      alert(`Failed to load leave data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Student List from Backend
  const fetchStudentList = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert("Admin authentication required. Please login again.");
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentList(response.data);
    } catch (error) {
      console.error("Error fetching student list:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to load student data";
      alert(`Failed to load student data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount - Only security and wardens for now
  useEffect(() => {
    fetchSecurityList();
    fetchWardenList();
    fetchStudentList();
    fetchLeaveList();
  }, []);

  // Fetch Security List from Backend
  const fetchSecurityList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/security`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setSecurityList(response.data);
    } catch (error) {
      console.error("Error fetching security list:", error);
      alert("Failed to load security staff data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Warden List from Backend
  const fetchWardenList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/wardens`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setWardenList(response.data);
    } catch (error) {
      console.error("Error fetching warden list:", error);
      alert("Failed to load warden data");
    } finally {
      setLoading(false);
    }
  };

  // Students and leaves will remain empty arrays until warden dashboard is implemented
  // No API calls for students and leaves for now

  // Security edit
  const handleEditSecurity = (sec) => {
    setSecurityForm({
      _id: sec._id,  // store id for update
      name: sec.name,
      shift: sec.shift,
      phone: sec.phone,
      email: sec.email,
      password: "",  // optional: leave empty for password reset
    });
  };

  // Warden edit
  const handleEditWarden = (war) => {
    setWardenForm({
      _id: war._id,
      name: war.name,
      gender: war.gender,
      assignedHostel: war.assignedHostel,
      phone: war.phone,
      email: war.email,
      password: "", // optional
    });
  };

  // Security update
  const updateSecurity = async (e) => {
    e.preventDefault();
    if (!securityForm._id) return;

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/security/${securityForm._id}`, securityForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        alert("✅ Security Updated Successfully!");
        setSecurityForm({ name: "", shift: "Morning", phone: "", email: "", password: "" });
        fetchSecurityList();
      }
    } catch (error) {
      console.error("Error updating security:", error);
      alert("❌ Failed to update security");
    } finally {
      setLoading(false);
    }
  };

  // Warden update
  const updateWarden = async (e) => {
    e.preventDefault();
    if (!wardenForm._id) return;

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/wardens/${wardenForm._id}`, wardenForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        alert("✅ Warden Updated Successfully!");
        setWardenForm({ name: "", gender: "Male", assignedHostel: "Boys Hostel", phone: "", email: "", password: "" });
        fetchWardenList();
      }
    } catch (error) {
      console.error("Error updating warden:", error);
      alert("❌ Failed to update warden");
    } finally {
      setLoading(false);
    }
  };

  // Delete Security with backend integration
  const deleteSecurity = async (id) => {
    if (window.confirm("Are you sure you want to delete this security staff?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_URL}/security/${id}`);
        if (response.data.success) {
          alert("✅ Security Staff Deleted Successfully!");
          setSecurityList(securityList.filter((sec) => sec._id !== id));
        }
      } catch (error) {
        console.error("Error deleting security:", error);
        alert("❌ Failed to delete security staff");
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete Warden with backend integration
  const deleteWarden = async (id) => {
    if (window.confirm("Are you sure you want to delete this warden?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_URL}/wardens/${id}`);
        if (response.data.success) {
          alert("✅ Warden Deleted Successfully!");
          setWardenList(wardenList.filter((war) => war._id !== id));
        }
      } catch (error) {
        console.error("Error deleting warden:", error);
        alert("❌ Failed to delete warden");
      } finally {
        setLoading(false);
      }
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit phone number";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!password) return "Password is required";
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters, include an uppercase letter, a number, and a special character";
    }
    return "";
  };

  // Excel Download Function
  const handleDownload = async (data, fileName, headers) => {
    if (data.length === 0) {
      alert("No data available to download!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    worksheet.addRow(headers);

    data.forEach((item) => {
      const row = headers.map((header) => {
        const key = header.toLowerCase().replace(/\s+/g, "");
        return item[key] || "";
      });
      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF667EEA" },
    };

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  };

  // Register Security Staff (with Backend API)
  const registerSecurity = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const phoneError = validatePhone(securityForm.phone);
    const emailError = validateEmail(securityForm.email);
    const passwordError = validatePassword(securityForm.password);

    setSecurityErrors({
      phone: phoneError,
      email: emailError,
      password: passwordError,
    });

    // Check if any errors exist
    if (phoneError || emailError || passwordError || !securityForm.name) {
      if (!securityForm.name) alert("Please enter the name");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/security`, securityForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });

      if (response.data.success) {
        alert("✅ Security Staff Registered Successfully!");
        
        // Reset form
        setSecurityForm({
          name: "",
          shift: "Morning",
          phone: "",
          email: "",
          password: "",
        });
        
        setSecurityErrors({
          phone: "",
          email: "",
          password: "",
        });

        // Refresh the list
        fetchSecurityList();
      }
    } catch (error) {
      console.error("Error registering security:", error);
      const errorMsg = error.response?.data?.message || "Failed to register security staff";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Register Warden (with Backend API)
  const registerWarden = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const phoneError = validatePhone(wardenForm.phone);
    const emailError = validateEmail(wardenForm.email);
    const passwordError = validatePassword(wardenForm.password);

    setWardenErrors({
      phone: phoneError,
      email: emailError,
      password: passwordError,
    });

    // Check if any errors exist
    if (phoneError || emailError || passwordError || !wardenForm.name) {
      if (!wardenForm.name) alert("Please enter the name");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare warden data with assignedHostel based on gender
      const wardenData = {
        ...wardenForm,
        assignedHostel: wardenForm.gender === "Male" ? "Boys Hostel" : "Girls Hostel"
      };
      
      const response = await axios.post(`${API_URL}/wardens`, wardenData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      if (response.data.success) {
        alert("✅ Warden Registered Successfully!");
        
        // Reset form
        setWardenForm({
          name: "",
          gender: "Male",
          assignedHostel: "Boys Hostel",
          phone: "",
          email: "",
          password: "",
        });
        
        setWardenErrors({
          phone: "",
          email: "",
          password: "",
        });

        // Refresh the list
        fetchWardenList();
      }
    } catch (error) {
      console.error("Error registering warden:", error);
      const errorMsg = error.response?.data?.message || "Failed to register warden";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Update wardenForm when gender changes
  const handleGenderChange = (e) => {
    const gender = e.target.value;
    setWardenForm({
      ...wardenForm,
      gender: gender,
      assignedHostel: gender === "Male" ? "Boys Hostel" : "Girls Hostel"
    });
  };

  // Get statistics
  const maleStudents = studentList.filter(s => s.gender === "Male").length;
  const femaleStudents = studentList.filter(s => s.gender === "Female").length;

  // Handle form submission based on whether we're editing or creating
  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityForm._id) {
      updateSecurity(e);
    } else {
      registerSecurity(e);
    }
  };

  const handleWardenSubmit = (e) => {
    e.preventDefault();
    if (wardenForm._id) {
      updateWarden(e);
    } else {
      registerWarden(e);
    }
  };

  // Render Dashboard Overview
  const renderOverview = () => (
    <div className="overview-container">
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Welcome to GATEX Admin Panel</p>

      <div className="stats-grid">
        <div className="stat-card stat-security">
          <div className="stat-icon">👮</div>
          <div className="stat-content">
            <h3>Security Staff</h3>
            <p className="stat-number">{securityList.length}</p>
            <p className="stat-label">Total Registered</p>
          </div>
        </div>

        <div className="stat-card stat-warden">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Wardens</h3>
            <p className="stat-number">{wardenList.length}</p>
            <p className="stat-label">Total Registered</p>
          </div>
        </div>

        <div className="stat-card stat-students">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-number">{studentList.length}</p>
            <p className="stat-label">Registered by Wardens</p>
          </div>
        </div>

        <div className="stat-card stat-boys">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Male Students</h3>
            <p className="stat-number">{maleStudents}</p>
            <p className="stat-label">Students</p>
          </div>
        </div>

        <div className="stat-card stat-girls">
          <div className="stat-icon">👩‍🎓</div>
          <div className="stat-content">
            <h3>Female Students</h3>
            <p className="stat-number">{femaleStudents}</p>
            <p className="stat-label">Students</p>
          </div>
        </div>

        <div className="stat-card stat-leaves">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Leave Applications</h3>
            <p className="stat-number">{leaveList.length}</p>
            <p className="stat-label">Total Leaves</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Security Page (Same as before)
  const renderSecurityPage = () => (
    <div className="page-container">
      <h1 className="page-title">Security Staff Management</h1>
      
      <div className="section-card">
        <h2 className="section-title">
          {securityForm._id ? "Update Security Staff" : "Register New Security Staff"}
        </h2>
        <form onSubmit={handleSecuritySubmit} className="registration-form">
          {/* ... Security form content (same as before) ... */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={securityForm.name}
                onChange={(e) =>
                  setSecurityForm({ ...securityForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Shift *</label>
              <select
                value={securityForm.shift}
                onChange={(e) =>
                  setSecurityForm({ ...securityForm, shift: e.target.value })
                }
                required
              >
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={securityForm.phone}
                onChange={(e) => {
                  setSecurityForm({ ...securityForm, phone: e.target.value });
                  setSecurityErrors({ ...securityErrors, phone: "" });
                }}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  setSecurityErrors({ ...securityErrors, phone: error });
                }}
                className={securityErrors.phone ? "error-input" : ""}
                required
              />
              {securityErrors.phone && (
                <div className="error-message">⚠️ {securityErrors.phone}</div>
              )}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={securityForm.email}
                onChange={(e) => {
                  setSecurityForm({ ...securityForm, email: e.target.value });
                  setSecurityErrors({ ...securityErrors, email: "" });
                }}
                onBlur={(e) => {
                  const error = validateEmail(e.target.value);
                  setSecurityErrors({ ...securityErrors, email: error });
                }}
                className={securityErrors.email ? "error-input" : ""}
                required
              />
              {securityErrors.email && (
                <div className="error-message">⚠️ {securityErrors.email}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password {!securityForm._id && "*"}</label>
              <input
                type="password"
                placeholder={securityForm._id ? "Leave blank to keep current password" : "Min 8 chars, 1 uppercase, 1 number, 1 special char"}
                value={securityForm.password}
                onChange={(e) => {
                  setSecurityForm({ ...securityForm, password: e.target.value });
                  setSecurityErrors({ ...securityErrors, password: "" });
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    const error = validatePassword(e.target.value);
                    setSecurityErrors({ ...securityErrors, password: error });
                  }
                }}
                className={securityErrors.password ? "error-input" : ""}
                required={!securityForm._id}
              />
              {securityErrors.password && (
                <div className="error-message">⚠️ {securityErrors.password}</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {securityForm._id ? "Update Security" : "Register Security Staff"}
          </button>

          {securityForm._id && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setSecurityForm({ name: "", shift: "Morning", phone: "", email: "", password: "" })}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="section-card">
        <div className="list-header">
          <h2 className="section-title">
            Registered Security Staff ({securityList.length})
          </h2>
          {securityList.length > 0 && (
            <button
              className="btn-download"
              onClick={() =>
                handleDownload(
                  securityList,
                  "SecurityStaffList",
                  ["Name", "Shift", "Phone", "Email", "Registered Date"]
                )
              }
            >
              ⬇️ Download Excel
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        ) : securityList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👮</div>
            <p>No security staff registered yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Shift</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {securityList.map((sec) => (
                  <tr key={sec._id}>
                    <td className="name-cell">{sec.name}</td>
                    <td>
                      <span className={`badge badge-${sec.shift.toLowerCase()}`}>
                        {sec.shift}
                      </span>
                    </td>
                    <td>{sec.phone}</td>
                    <td>{sec.email}</td>
                    <td>{new Date(sec.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-update-small"
                          onClick={() => handleEditSecurity(sec)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => deleteSecurity(sec._id)}
                        >
                          🗑️
                        </button>
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
  );

  // Render Warden Page (Same as before)
  const renderWardenPage = () => (
    <div className="page-container">
      <h1 className="page-title">Warden Management</h1>
      
      <div className="section-card">
        <h2 className="section-title">
          {wardenForm._id ? "Update Warden" : "Register New Warden"}
        </h2>
        <form onSubmit={handleWardenSubmit} className="registration-form">
          {/* ... Warden form content (same as before) ... */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={wardenForm.name}
                onChange={(e) =>
                  setWardenForm({ ...wardenForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select
                value={wardenForm.gender}
                onChange={handleGenderChange}
                required
              >
                <option value="Male">Male (Boys Hostel)</option>
                <option value="Female">Female (Girls Hostel)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={wardenForm.phone}
                onChange={(e) => {
                  setWardenForm({ ...wardenForm, phone: e.target.value });
                  setWardenErrors({ ...wardenErrors, phone: "" });
                }}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  setWardenErrors({ ...wardenErrors, phone: error });
                }}
                className={wardenErrors.phone ? "error-input" : ""}
                required
              />
              {wardenErrors.phone && (
                <div className="error-message">⚠️ {wardenErrors.phone}</div>
              )}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={wardenForm.email}
                onChange={(e) => {
                  setWardenForm({ ...wardenForm, email: e.target.value });
                  setWardenErrors({ ...wardenErrors, email: "" });
                }}
                onBlur={(e) => {
                  const error = validateEmail(e.target.value);
                  setWardenErrors({ ...wardenErrors, email: error });
                }}
                className={wardenErrors.email ? "error-input" : ""}
                required
              />
              {wardenErrors.email && (
                <div className="error-message">⚠️ {wardenErrors.email}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password {!wardenForm._id && "*"}</label>
              <input
                type="password"
                placeholder={wardenForm._id ? "Leave blank to keep current password" : "Min 8 chars, 1 uppercase, 1 number, 1 special char"}
                value={wardenForm.password}
                onChange={(e) => {
                  setWardenForm({ ...wardenForm, password: e.target.value });
                  setWardenErrors({ ...wardenErrors, password: "" });
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    const error = validatePassword(e.target.value);
                    setWardenErrors({ ...wardenErrors, password: error });
                  }
                }}
                className={wardenErrors.password ? "error-input" : ""}
                required={!wardenForm._id}
              />
              {wardenErrors.password && (
                <div className="error-message">⚠️ {wardenErrors.password}</div>
              )}
            </div>
            <div className="form-group">
              <label>Assigned Hostel</label>
              <input
                type="text"
                value={wardenForm.assignedHostel}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {wardenForm._id ? "Update Warden" : "Register Warden"}
          </button>

          {wardenForm._id && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setWardenForm({ name: "", gender: "Male", assignedHostel: "Boys Hostel", phone: "", email: "", password: "" })}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="section-card">
        <div className="list-header">
          <h2 className="section-title">
            Registered Wardens ({wardenList.length})
          </h2>
          {wardenList.length > 0 && (
            <button
              className="btn-download"
              onClick={() =>
                handleDownload(
                  wardenList,
                  "WardenList",
                  ["Name", "Gender", "Assigned Hostel", "Phone", "Email", "Registered Date"]
                )
              }
            >
              ⬇️ Download Excel
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        ) : wardenList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No wardens registered yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Assigned Hostel</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wardenList.map((war) => (
                  <tr key={war._id}>
                    <td className="name-cell">{war.name}</td>
                    <td>
                      <span className={`badge badge-${war.gender.toLowerCase()}`}>
                        {war.gender}
                      </span>
                    </td>
                    <td>
                      <span className="hostel-badge">
                        {war.assignedHostel}
                      </span>
                    </td>
                    <td>{war.phone}</td>
                    <td>{war.email}</td>
                    <td>{new Date(war.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-update-small"
                          onClick={() => handleEditWarden(war)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => deleteWarden(war._id)}
                        >
                          🗑️
                        </button>
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
  );

  // Render Students Page with Gender Filter
  const renderStudentsPage = () => {
    const filteredStudents = genderFilter === "All"
      ? studentList
      : studentList.filter(student => student.gender === genderFilter);

    return (
      <div className="page-container">
        <h1 className="page-title">Student Records</h1>
        
        <div className="filter-bar">
          <div className="filter-group">
            <label>Filter by Gender:</label>
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Students</option>
              <option value="Male">Male Students</option>
              <option value="Female">Female Students</option>
            </select>
          </div>
          <br />
          {filteredStudents.length > 0 && (
            <button
              className="btn-download"
              onClick={() =>
                handleDownload(
                  filteredStudents,
                  `StudentList_${genderFilter}`,
                  ["Name", "Roll No", "Gender", "Hostel", "Room No", "Phone", "Email", "Registered Date"]
                )
              }
            >
              ⬇️ Download Excel
            </button>
          )}
        </div>

        <div className="section-card">
          <div className="list-header">
            <h2 className="section-title">
              {genderFilter === "All" ? "All" : genderFilter} Students ({filteredStudents.length})
            </h2>
          </div>

          {studentList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <p>No students registered yet</p>
              <p className="empty-subtitle">
                Students will appear here after wardens start registering them through the warden dashboard.
              </p>
              <div className="info-tip">
                <strong>Next Steps:</strong> Create warden dashboard first, then wardens can add students.
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <p>No {genderFilter.toLowerCase()} students found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Reg No</th>
                    <th>Gender</th>
                    <th>Hostel</th>
                    <th>Room No</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td className="name-cell">{student.fullName}</td>
                      <td>{student.registerNumber}</td>
                      <td>
                        <span className={`badge badge-${student.gender.toLowerCase()}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td>{student.hostel}</td>
                      <td>{student.roomNumber}</td>
                      <td>{student.phoneNumber}</td>
                      <td>{student.email}</td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Leave List Page with Date and Gender Filters
  const renderLeaveListPage = () => {
    const filteredLeaves = leaveList.filter((leave) => {
      const leaveDate = new Date(leave.startDate);
      const afterFrom = leaveFromDate ? leaveDate >= new Date(leaveFromDate) : true;
      const beforeTo = leaveToDate ? leaveDate <= new Date(leaveToDate) : true;
      const matchesGender = leaveGenderFilter === "All" || leave.studentId?.gender === leaveGenderFilter;

      return afterFrom && beforeTo && matchesGender;
    });

    return (
      <div className="page-container">
        <h1 className="page-title">Student Leave Applications</h1>
        
        <div className="filter-bar">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={leaveFromDate}
              onChange={(e) => setLeaveFromDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={leaveToDate}
              onChange={(e) => setLeaveToDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Gender:</label>
            <select
              value={leaveGenderFilter}
              onChange={(e) => setLeaveGenderFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <br />

          {filteredLeaves.length > 0 && (
            <button
              className="btn-download"
              onClick={() =>
                handleDownload(
                  filteredLeaves,
                  `LeaveList_${leaveFromDate || 'all'}_to_${leaveToDate || 'all'}`,
                  ["Name", "Roll No", "Gender", "Date", "Reason", "Status", "Applied Date"]
                )
              }
            >
              ⬇️ Download Excel
            </button>
          )}
        </div>

        <div className="section-card">
          <div className="list-header">
            <h2 className="section-title">
              Leave Applications ({filteredLeaves.length})
            </h2>
          </div>

          {leaveList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No leave applications yet</p>
              <p className="empty-subtitle">
                Leave applications will appear here after students apply through the warden portal.
              </p>
              <div className="info-tip">
                <strong>Workflow:</strong> Students → Apply to Warden → Warden Approves → Appears here
              </div>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No leave applications match your filters</p>
              <p className="empty-subtitle">
                Try adjusting the date range or gender filter.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Gender</th>
                    <th>Leave Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="name-cell">{leave.studentId?.fullName || 'N/A'}</td>
                      <td>{leave.studentId?.registerNumber || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${leave.studentId?.gender?.toLowerCase() || 'unknown'}`}>
                          {leave.studentId?.gender || 'N/A'}
                        </span>
                      </td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar open">
        <div className="sidebar-header">
          <h2>🏢 Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === "overview" ? "active" : ""}`}
            onClick={() => setActivePage("overview")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </button>

          <button
            className={`nav-item ${activePage === "security" ? "active" : ""}`}
            onClick={() => setActivePage("security")}
          >
            <span className="nav-icon">👮</span>
            <span className="nav-text">Security Staff</span>
            <span className="nav-badge">{securityList.length}</span>
          </button>

          <button
            className={`nav-item ${activePage === "warden" ? "active" : ""}`}
            onClick={() => setActivePage("warden")}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Wardens</span>
            <span className="nav-badge">{wardenList.length}</span>
          </button>

          <button
            className={`nav-item ${activePage === "students" ? "active" : ""}`}
            onClick={() => setActivePage("students")}
          >
            <span className="nav-icon">🎓</span>
            <span className="nav-text">Students</span>
            <span className="nav-badge">{studentList.length}</span>
          </button>

          <button
            className={`nav-item ${activePage === "leaves" ? "active" : ""}`}
            onClick={() => setActivePage("leaves")}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Leave Applications</span>
            <span className="nav-badge">{leaveList.length}</span>
          </button>

          <div className="nav-divider"></div>

    
          <button
  className="nav-item logout"
  onClick={() => {
    localStorage.removeItem("adminToken"); // Clear token
    navigate("/"); // Redirect to home page
  }}
>
  <span className="nav-text">Logout</span>
</button>

        </nav>
      </aside>

      <main className="main-content">
        {activePage === "overview" && renderOverview()}
        {activePage === "security" && renderSecurityPage()}
        {activePage === "warden" && renderWardenPage()}
        {activePage === "students" && renderStudentsPage()}
        {activePage === "leaves" && renderLeaveListPage()}
      </main>
    </div>
  );
}
