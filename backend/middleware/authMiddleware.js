import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Warden from "../models/Warden.js";
import Parent from "../models/Parent.js";
import Security from "../models/Security.js";

// Authenticate student
export const authenticateStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.studentId = decoded.id;
    req.student = student;
    next();
  } catch (error) {
    console.error("Student authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticate warden
export const authenticateWarden = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'warden') {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    const warden = await Warden.findById(decoded.id);
    if (!warden) {
      return res.status(404).json({ message: "Warden not found" });
    }

    req.wardenId = decoded.id;
    req.warden = warden;
    next();
  } catch (error) {
    console.error("Warden authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticate parent
export const authenticateParent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'parent') {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    const parent = await Parent.findById(decoded.id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    req.parentId = decoded.id;
    req.parent = parent;
    next();
  } catch (error) {
    console.error("Parent authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticate admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    req.adminId = decoded.email; // Admin uses email as ID
    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticate security
export const authenticateSecurity = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'security') {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    const security = await Security.findById(decoded.id);
    if (!security) {
      return res.status(404).json({ message: "Security staff not found" });
    }

    req.securityId = decoded.id;
    req.security = security;
    next();
  } catch (error) {
    console.error("Security authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
