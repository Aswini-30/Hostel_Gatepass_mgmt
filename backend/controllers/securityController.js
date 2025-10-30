import Security from "../models/Security.js";
import Student from "../models/Student.js";
import Leave from "../models/Leave.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Security login
export const securityLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const security = await Security.findOne({ email });
    if (!security) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, security.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: security._id, role: 'security' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      security: {
        id: security._id,
        name: security.name,
        email: security.email
      }
    });
  } catch (error) {
    console.error("Security login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Get security profile
export const getSecurityProfile = async (req, res) => {
  try {
    const securityId = req.securityId;
    const security = await Security.findById(securityId).select('-password');

    if (!security) {
      return res.status(404).json({ message: "Security profile not found" });
    }

    res.json({ success: true, data: security });
  } catch (error) {
    console.error("Error fetching security profile:", error);
    res.status(500).json({ message: "Failed to fetch security profile" });
  }
};

// Get approved students for exit/entry
export const getApprovedStudents = async (req, res) => {
  try {
    // Get all approved leaves
    const approvedLeaves = await Leave.find({
      status: 'approved'
    })
    .populate('studentId', 'fullName registerNumber department year gender hostel roomNumber parentName parentPhone')
    .sort({ createdAt: -1 });

    res.json(approvedLeaves);
  } catch (error) {
    console.error("Error fetching approved students:", error);
    res.status(500).json({ message: "Failed to fetch approved students" });
  }
};

// Get exited students for entry management
export const getExitedStudents = async (req, res) => {
  try {
    // Get all exited leaves (students who have exited but not returned)
    const exitedLeaves = await Leave.find({
      status: 'exited'
    })
    .populate('studentId', 'fullName registerNumber department year gender hostel roomNumber parentName parentPhone')
    .sort({ 'securityApproval.exitTime': -1 });

    res.json(exitedLeaves);
  } catch (error) {
    console.error("Error fetching exited students:", error);
    res.status(500).json({ message: "Failed to fetch exited students" });
  }
};

// Mark student exit
export const markStudentExit = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const securityId = req.securityId;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== 'approved') {
      return res.status(400).json({ message: "Leave is not approved for exit" });
    }

    // Update security approval for exit
    leave.securityApproval = {
      approved: true,
      approvedAt: new Date(),
      approvedBy: securityId,
      exitTime: new Date(),
      currentStatus: 'exited'
    };
    leave.status = 'exited';

    await leave.save();

    res.json({
      success: true,
      message: "Student exit recorded successfully",
      data: leave
    });
  } catch (error) {
    console.error("Error marking student exit:", error);
    res.status(500).json({ message: "Failed to record exit" });
  }
};

// Mark student return
export const markStudentReturn = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const securityId = req.securityId;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== 'exited') {
      return res.status(400).json({ message: "Student has not exited yet" });
    }

    // Update security approval for return
    leave.securityApproval.returnTime = new Date();
    leave.securityApproval.currentStatus = 'returned';
    leave.status = 'returned';

    await leave.save();

    res.json({
      success: true,
      message: "Student return recorded successfully",
      data: leave
    });
  } catch (error) {
    console.error("Error marking student return:", error);
    res.status(500).json({ message: "Failed to record return" });
  }
};

// Get student by register number for quick search
export const getStudentByRegisterNumber = async (req, res) => {
  try {
    const { registerNumber } = req.params;

    const student = await Student.findOne({ registerNumber })
      .select('fullName registerNumber department year gender hostel roomNumber parentName parentPhone');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get current leave status
    const currentLeave = await Leave.findOne({
      studentId: student._id,
      status: { $in: ['approved', 'exited'] }
    }).sort({ createdAt: -1 });

    res.json({
      student,
      currentLeave: currentLeave ? {
        id: currentLeave._id,
        type: currentLeave.type,
        startDate: currentLeave.startDate,
        endDate: currentLeave.endDate,
        status: currentLeave.status,
        securityStatus: currentLeave.securityApproval?.currentStatus || 'in_hostel'
      } : null
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

// SECURITY MANAGEMENT FUNCTIONS (Admin only)

// Get all security staff
export const getAllSecurity = async (req, res) => {
  try {
    const securityList = await Security.find();
    res.json(securityList);
  } catch (error) {
    console.error("Error fetching security staff:", error);
    res.status(500).json({ message: "Failed to fetch security staff" });
  }
};

// Create new security staff
export const createSecurity = async (req, res) => {
  try {
    const securityData = { ...req.body };
    if (securityData.password) {
      securityData.password = await bcrypt.hash(securityData.password, 10);
    }
    const newSecurity = new Security(securityData);
    await newSecurity.save();
    res.json({ success: true, message: "Security staff created", data: newSecurity });
  } catch (error) {
    console.error("Error creating security staff:", error);
    res.status(500).json({ message: "Failed to create security staff" });
  }
};

// Update security staff
export const updateSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedSecurity = await Security.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, message: "Security staff updated", data: updatedSecurity });
  } catch (error) {
    console.error("Error updating security staff:", error);
    res.status(500).json({ message: "Failed to update security staff" });
  }
};

// Delete security staff
export const deleteSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    await Security.findByIdAndDelete(id);
    res.json({ success: true, message: "Security staff deleted" });
  } catch (error) {
    console.error("Error deleting security staff:", error);
    res.status(500).json({ message: "Failed to delete security staff" });
  }
};

// Get exit and entry history
export const getExitEntryHistory = async (req, res) => {
  try {
    const history = await Leave.find({
      status: { $in: ['exited', 'returned'] }
    })
    .populate('studentId', 'fullName registerNumber department year gender hostel roomNumber parentName parentPhone')
    .populate('securityApproval.approvedBy', 'name')
    .sort({ 'securityApproval.exitTime': -1 });

    res.json(history);
  } catch (error) {
    console.error("Error fetching exit entry history:", error);
    res.status(500).json({ message: "Failed to fetch exit entry history" });
  }
};

// Get dashboard counts for security overview
export const getDashboardCounts = async (req, res) => {
  try {
    const approvedCount = await Leave.countDocuments({ status: 'approved' });
    const exitedCount = await Leave.countDocuments({ status: 'exited' });
    const returnedCount = await Leave.countDocuments({ status: 'returned' });

    res.json({
      success: true,
      approvedCount,
      exitedCount,
      returnedCount
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({ message: "Failed to fetch dashboard counts" });
  }
};
