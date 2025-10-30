import Student from "../models/Student.js";
import Leave from "../models/Leave.js";
import Parent from "../models/Parent.js";
import Notice from "../models/Notice.js";
import Warden from "../models/Warden.js";

// Submit leave request
export const submitLeaveRequest = async (req, res) => {
  try {
    const {
      type,
      startDate,
      endDate,
      reason,
      emergencyContact,
      destination
    } = req.body;

    // Get student from token
    const studentId = req.studentId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create leave request
    const leave = new Leave({
      studentId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      emergencyContact: type === 'emergency' ? emergencyContact : undefined,
      destination: type === 'emergency' ? destination : undefined,
      status: 'pending',
      wardenId: student.wardenId,
      parentApproval: { approved: null },
      wardenApproval: { approved: null }
    });

    await leave.save();

    res.json({
      success: true,
      message: "Leave request submitted successfully",
      data: leave
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ message: "Failed to submit leave request" });
  }
};

// Get student's leave history
export const getStudentLeaves = async (req, res) => {
  try {
    const studentId = req.studentId;
    const leaves = await Leave.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('studentId', 'fullName registerNumber department year gender');

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching student leaves:", error);
    res.status(500).json({ message: "Failed to fetch leave history" });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId;
    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Failed to fetch student profile" });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId;
    const updates = req.body;

    // Fields that can be updated by student
    const allowedUpdates = ['fullName', 'department', 'year', 'phoneNumber', 'email', 'roomNumber', 'address'];

    // Filter updates to only allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const student = await Student.findByIdAndUpdate(
      studentId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ message: "Failed to update student profile" });
  }
};

// Get notices for student
export const getStudentNotices = async (req, res) => {
  try {
    const studentId = req.studentId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get notices from the student's warden
    const notices = await Notice.find({
      createdBy: student.wardenId,
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    console.error("Error fetching student notices:", error);
    res.status(500).json({ message: "Failed to fetch notices" });
  }
};

// Get student leave status for parents
export const getStudentLeaveStatus = async (req, res) => {
  try {
    const { studentRegisterNumber } = req.params;

    // Find student by register number
    const student = await Student.findOne({ registerNumber: studentRegisterNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all leaves for this student
    const leaves = await Leave.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .populate('studentId', 'fullName registerNumber department year gender hostel roomNumber');

    res.json({
      student: {
        fullName: student.fullName,
        registerNumber: student.registerNumber,
        department: student.department,
        year: student.year,
        hostel: student.hostel,
        roomNumber: student.roomNumber
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
        securityStatus: leave.securityApproval?.currentStatus || 'in_hostel',
        exitTime: leave.securityApproval?.exitTime,
        returnTime: leave.securityApproval?.returnTime,
        createdAt: leave.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching student leave status:", error);
    res.status(500).json({ message: "Failed to fetch leave status" });
  }
};
