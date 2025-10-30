import express from "express";
import { authenticateParent } from "../middleware/authMiddleware.js";
import {
  parentLogin,
  getParentProfile,
  approveLeave,
  getStudentLeaves
} from "../controllers/parentController.js";

const router = express.Router();

// Parent login (no authentication required)
router.post("/login", parentLogin);

// All other routes require authentication
router.use(authenticateParent);

// Get parent profile
router.get("/profile", getParentProfile);

// Get student's leave requests
router.get("/student-leaves", getStudentLeaves);

// Approve emergency leave
router.put("/approve-leave/:leaveId", approveLeave);

export default router;
