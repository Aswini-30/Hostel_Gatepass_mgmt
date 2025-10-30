import express from "express";
import { authenticateStudent } from "../middleware/authMiddleware.js";
import {
  submitLeaveRequest,
  getStudentLeaves,
  getStudentProfile,
  updateStudentProfile,
  getStudentNotices,
  getStudentLeaveStatus
} from "../controllers/studentController.js";

const router = express.Router();

// All student routes require authentication
router.use(authenticateStudent);

// Leave management
router.post("/leave-request", submitLeaveRequest);
router.get("/leaves", getStudentLeaves);

// Profile and notices
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/notices", getStudentNotices);

// Parent access to student leave status
router.get("/leave-status/:studentRegisterNumber", getStudentLeaveStatus);

export default router;
