import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import Leave from "../models/Leave.js";
import jwt from "jsonwebtoken";

// Parent login
export const parentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent || parent.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: parent._id, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      parent: {
        id: parent._id,
        parentName: parent.parentName,
        email: parent.email,
        studentRegisterNumber: parent.studentRegisterNumber
      }
    });
  } catch (error) {
    console.error("Parent login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Get parent profile
export const getParentProfile = async (req, res) => {
  try {
    const parentId = req.parentId;
    const parent = await Parent.findById(parentId).select('-password');
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.json(parent);
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Approve emergency leave
export const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const parentId = req.parentId;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Verify parent has permission for this student
    const parent = await Parent.findById(parentId);
    const student = await Student.findById(leave.studentId);

    if (!parent || !student || parent.studentRegisterNumber !== student.registerNumber) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only emergency leaves need parent approval
    if (leave.type !== 'emergency') {
      return res.status(400).json({ message: "Only emergency leaves require parent approval" });
    }

    // Update parent approval
    leave.parentApproval = {
      approved: true,
      approvedAt: new Date(),
      approvedBy: parentId
    };
    leave.status = 'parent_approved';

    await leave.save();

    res.json({
      success: true,
      message: "Leave approved successfully",
      data: leave
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ message: "Failed to approve leave" });
  }
};

// Get student's leave requests for parent
export const getStudentLeaves = async (req, res) => {
  try {
    const parentId = req.parentId;
    const parent = await Parent.findById(parentId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Find student
    const student = await Student.findOne({ registerNumber: parent.studentRegisterNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get leave requests
    const leaves = await Leave.find({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.json({
      student: {
        fullName: student.fullName,
        registerNumber: student.registerNumber,
        department: student.department,
        year: student.year
      },
      leaves: leaves.map(leave => ({
        id: leave._id,
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        emergencyContact: leave.emergencyContact,
        destination: leave.destination,
        createdAt: leave.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching student leaves:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};
