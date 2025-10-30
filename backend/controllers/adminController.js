import Student from "../models/Student.js";
import Leave from "../models/Leave.js";
import Warden from "../models/Warden.js";
import Security from "../models/Security.js";
import Notice from "../models/Notice.js";

// Get all students for admin
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select('-password')
      .populate('wardenId', 'name gender assignedHostel');
    res.json(students);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// Get all leaves for admin
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('studentId', 'fullName registerNumber department year gender hostel roomNumber parentName parentPhone')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
};

// Get dashboard statistics for admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const maleStudents = await Student.countDocuments({ gender: 'Male' });
    const femaleStudents = await Student.countDocuments({ gender: 'Female' });
    const totalWardens = await Warden.countDocuments();
    const totalSecurity = await Security.countDocuments();
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: { $in: ['pending', 'parent_approved'] } });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const totalNotices = await Notice.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        maleStudents,
        femaleStudents,
        totalWardens,
        totalSecurity,
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        totalNotices
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
