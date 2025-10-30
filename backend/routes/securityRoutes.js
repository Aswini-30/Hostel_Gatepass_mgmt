import express from "express";
import { authenticateSecurity, authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  securityLogin,
  getSecurityProfile,
  getApprovedStudents,
  getExitedStudents,
  markStudentExit,
  markStudentReturn,
  getStudentByRegisterNumber,
  getAllSecurity,
  createSecurity,
  updateSecurity,
  deleteSecurity,
  getExitEntryHistory,
  getDashboardCounts
} from "../controllers/securityController.js";

const router = express.Router();

// SECURITY MANAGEMENT ROUTES (Admin only)
// Get all security staff
router.get("/", authenticateAdmin, getAllSecurity);

// Create new security staff
router.post("/", authenticateAdmin, createSecurity);

// Update security staff
router.put("/:id", authenticateAdmin, updateSecurity);

// Delete security staff
router.delete("/:id", authenticateAdmin, deleteSecurity);

// Security login (no authentication required)
router.post("/login", securityLogin);

// All other routes require authentication
router.use(authenticateSecurity);

// Get approved students for exit/entry
router.get("/approved-students", getApprovedStudents);

// Get exited students for entry management
router.get("/exited-students", getExitedStudents);

// Get student by register number
router.get("/student/:registerNumber", getStudentByRegisterNumber);

// Mark student exit
router.put("/exit/:leaveId", markStudentExit);

// Mark student return
router.put("/return/:leaveId", markStudentReturn);

// Get exit and entry history
router.get("/exit-entry-history", getExitEntryHistory);

// Get dashboard counts
router.get("/dashboard-counts", getDashboardCounts);

// Get security profile
router.get("/profile", getSecurityProfile);

export default router;
