import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getAllStudents,
  getAllLeaves,
  getDashboardStats
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Get all students
router.get("/students", getAllStudents);

// Get all leaves
router.get("/leaves", getAllLeaves);

// Get dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

export default router;
