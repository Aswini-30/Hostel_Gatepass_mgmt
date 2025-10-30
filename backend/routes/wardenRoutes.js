import express from "express";
import {
  authenticateWarden,
  authenticateAdmin
} from "../middleware/authMiddleware.js";

import {
  // Warden Management
  getAllWardens,
  createWarden,
  updateWarden,
  deleteWarden,

  // Student Management
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,

  // Parent Management
  addParent,
  getParents,
  updateParent,
  deleteParent,

  // Notice Management
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,

  // Leave Management
  getLeaveRequests,
  updateLeaveStatus,
  getLeaveHistory,
  handleTutorApproval,
  handleParentApproval,

  // Dashboard + Analytics
  getDashboardCounts,
  getLeaveAnalytics,

  // Warden Profile
  getWardenProfile,
  updateWardenProfile
} from "../controllers/wardenController.js";

const router = express.Router();

// ---------------------- WARDEN MANAGEMENT ----------------------
router.get("/", authenticateAdmin, getAllWardens);
router.post("/", authenticateAdmin, createWarden);
router.put("/:id", authenticateAdmin, updateWarden);
router.delete("/:id", authenticateAdmin, deleteWarden);

// ---------------------- STUDENT MANAGEMENT ----------------------
router.post("/students", authenticateWarden, addStudent);
router.get("/students", authenticateWarden, getStudents);
router.put("/students/:id", authenticateWarden, updateStudent);
router.delete("/students/:id", authenticateWarden, deleteStudent);

// ---------------------- PARENT MANAGEMENT ----------------------
router.post("/parents", authenticateWarden, addParent);
router.get("/parents", authenticateWarden, getParents);
router.put("/parents/:id", authenticateWarden, updateParent);
router.delete("/parents/:id", authenticateWarden, deleteParent);

// ---------------------- NOTICE MANAGEMENT ----------------------
router.post("/notices", authenticateWarden, createNotice);
router.get("/notices", authenticateWarden, getNotices);
router.put("/notices/:id", authenticateWarden, updateNotice);
router.delete("/notices/:id", authenticateWarden, deleteNotice);

// ---------------------- LEAVE MANAGEMENT ----------------------
router.get("/leaves", authenticateWarden, getLeaveRequests);
router.put("/leaves/:id", authenticateWarden, updateLeaveStatus);
router.put("/leaves/:id/tutor-approval", authenticateWarden, handleTutorApproval);
router.put("/leaves/:id/parent-approval", authenticateWarden, handleParentApproval);
router.get("/leave-history", authenticateWarden, getLeaveHistory);

// ---------------------- DASHBOARD ----------------------
router.get("/dashboard-counts", authenticateWarden, getDashboardCounts);
router.get("/leave-analytics", authenticateWarden, getLeaveAnalytics);

// ---------------------- PROFILE ----------------------
router.get("/profile", authenticateWarden, getWardenProfile);
router.put("/profile", authenticateWarden, updateWardenProfile);

export default router;