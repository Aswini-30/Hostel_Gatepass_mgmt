// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 🏠 Common Pages
import Home from "./pages/Home/Home";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// 👩‍💼 Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";

// 🧑‍🏫 Warden pages
import WardenDashboard from "./pages/Warden/WardenDashboard";
import AddStudent from "./pages/Warden/AddStudent";
import AddParent from "./pages/Warden/AddParent";
import StudentsList from "./pages/Warden/StudentsList";
import ParentsList from "./pages/Warden/ParentsList";
import LeaveRequests from "./pages/Warden/LeaveRequests";
import NoticeBoard from "./pages/Warden/NoticeBoard";
import WardenProfile from "./pages/Warden/WardenProfile";
import LeaveHistory from "./pages/Warden/LeaveHistory";

// 🧑‍🎓 Student pages
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentProfile from "./pages/Student/StudentProfile";
import LeaveRequest from "./pages/Student/LeaveRequest";

// 👨‍👩‍👧‍👦 Parent pages
import ParentDashboard from "./pages/Parent/ParentDashboard";

// 🛡️ Security pages
import SecurityDashboard from "./pages/Security/SecurityDashboard";
import EntryManagement from "./pages/Security/EntryManagement";
import ExitEntryHistory from "./pages/Security/ExitEntryHistory";
import SecurityProfile from "./pages/Security/SecurityProfile";

function App() {
  return (
    <GoogleOAuthProvider clientId="530275936983-fvr1r4hvjecg85vk2qmcgl8ja6iho3ie.apps.googleusercontent.com">
      <Router>
        <div className="App">
          <Routes>
            {/* Default Page */}
            <Route path="/" element={<Home />} />

            {/* Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Dashboard */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Warden Dashboards */}
            <Route path="/warden-dashboard" element={<WardenDashboard />} />

            {/* Warden Subpages */}
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/add-parent" element={<AddParent />} />
            <Route path="/students-list" element={<StudentsList />} />
            <Route path="/students-list-container" element={<StudentsList />} />
            <Route path="/parents-list" element={<ParentsList />} />
            <Route path="/leave-requests" element={<LeaveRequests />} />
            <Route path="/notice-board" element={<NoticeBoard />} />
            <Route path="/warden-profile" element={<WardenProfile />} />
            <Route path="/leave-history" element={<LeaveHistory />} />

            {/* Student Dashboard */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/leave-request" element={<LeaveRequest />} />

            {/* Parent Dashboard */}
            <Route path="/parent-dashboard" element={<ParentDashboard />} />

            {/* Security Dashboard */}
            <Route path="/security-dashboard" element={<SecurityDashboard />} />
            <Route path="/security/entry-management" element={<EntryManagement />} />
            <Route path="/security/exit-entry-history" element={<ExitEntryHistory />} />
            <Route path="/security/profile" element={<SecurityProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
