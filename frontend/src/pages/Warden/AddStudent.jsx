import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddStudent.css";

const AddStudent = () => {
  const [form, setForm] = useState({
    fullName: "",
    registerNumber: "",
    department: "",
    gender: "",
    year: "",
    phoneNumber: "",
    email: "",
    hostel: "",
    password: "",
    parentName: "",
    parentPhone: "",
    address: ""
  });

  const [wardenGender, setWardenGender] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch warden profile to get gender
  useEffect(() => {
    const fetchWardenProfile = async () => {
      try {
        const token = localStorage.getItem('wardenToken');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.user) {
          setWardenGender(response.data.user.gender);
        }
      } catch (error) {
        console.error('Error fetching warden profile:', error);
      }
    };

    fetchWardenProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Auto-assign hostel based on gender
    if (name === 'gender') {
      const hostel = value === 'male' ? 'Boys Hostel' : value === 'female' ? 'Girls Hostel' : '';
      setForm(prev => ({ ...prev, hostel }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem('wardenToken');
      if (!token) {
        setMessage('Authentication required. Please log in as warden.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/wardens/students', form, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessage('Student registered successfully!');
        // Reset form after successful submission
        setForm({
          fullName: "",
          registerNumber: "",
          department: "",
          gender: "",
          year: "",
          phoneNumber: "",
          email: "",
          hostel: "",
          password: "",
          parentName: "",
          parentPhone: "",
          address: ""
        });
      }
    } catch (error) {
      console.error('Error registering student:', error);
      setMessage(error.response?.data?.message || 'Failed to register student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-container">
      <div className="add-student-header">
        <h1>Student Management</h1>
        <p>Register New Student</p>
      </div>

      {/* Display success/error message */}
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="add-student-content">
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-section">
            <h2>Student Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">FULL NAME *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registerNumber">REGISTER NUMBER *</label>
                <input
                  type="text"
                  id="registerNumber"
                  name="registerNumber"
                  placeholder="Enter register number"
                  value={form.registerNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">DEPARTMENT *</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="ECE">Electronics and Communication</option>
                  <option value="EEE">Electrical and Electronics</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="IT">Information technology</option>
                  <option value="AIDS">AIDS</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="year">YEAR *</label>
                <select
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
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
                <label htmlFor="gender">GENDER *</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  {wardenGender === 'female' ? (
                    <option value="female">Female (Girls Hostel)</option>
                  ) : wardenGender === 'male' ? (
                    <option value="male">Male (Boys Hostel)</option>
                  ) : (
                    <>
                      <option value="male">Male (Boys Hostel)</option>
                      <option value="female">Female (Girls Hostel)</option>
                    </>
                  )}
                </select>
                {wardenGender && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    You can only add {wardenGender.toLowerCase()} students
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">PHONE NUMBER *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">EMAIL *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">PASSWORD *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hostel">ASSIGNED HOSTEL</label>
                <input
                  type="text"
                  id="hostel"
                  name="hostel"
                  placeholder="Boys Hostel / Girls Hostel"
                  value={form.hostel}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="roomNumber">ROOM NUMBER</label>
                <input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  placeholder="Enter room number"
                  value={form.roomNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Parent/Guardian Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parentName">PARENT/GUARDIAN NAME *</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  placeholder="Enter parent/guardian name"
                  value={form.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentPhone">PARENT PHONE *</label>
                <input
                  type="tel"
                  id="parentPhone"
                  name="parentPhone"
                  placeholder="Enter parent phone number"
                  value={form.parentPhone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">ADDRESS *</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'REGISTERING...' : 'REGISTER STUDENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;