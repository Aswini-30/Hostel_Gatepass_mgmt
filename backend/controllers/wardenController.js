import Warden from "../models/Warden.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import Notice from "../models/Notice.js";
import Leave from "../models/Leave.js";
import bcrypt from "bcryptjs";

// ==========================
// WARDEN MANAGEMENT (ADMIN ACCESS)
// ==========================

export const getAllWardens = async (req, res) => {
  try {
    const wardens = await Warden.find();
    res.json(wardens);
  } catch (error) {
    console.error("Error fetching wardens:", error);
    res.status(500).json({ message: "Failed to fetch wardens" });
  }
};

export const createWarden = async (req, res) => {
  try {
    const warden = new Warden(req.body);
    await warden.save();
    res.status(201).json({ success: true, message: "Warden created successfully", data: warden });
  } catch (error) {
    console.error("Error creating warden:", error);
    res.status(500).json({ message: "Failed to create warden" });
  }
};

export const updateWarden = async (req, res) => {
  try {
    const warden = await Warden.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json({ success: true, message: "Warden updated successfully", data: warden });
  } catch (error) {
    console.error("Error updating warden:", error);
    res.status(500).json({ message: "Failed to update warden" });
  }
};

export const deleteWarden = async (req, res) => {
  try {
    const warden = await Warden.findByIdAndDelete(req.params.id);
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json({ success: true, message: "Warden deleted successfully" });
  } catch (error) {
    console.error("Error deleting warden:", error);
    res.status(500).json({ message: "Failed to delete warden" });
  }
};

// ==========================
// STUDENT MANAGEMENT
// ==========================

export const addStudent = async (req, res) => {
  try {
    const { fullName, registerNumber, department, year, gender, password, phoneNumber, email, roomNumber, parentName, parentPhone, address } = req.body;

    if (!fullName || !registerNumber || !department || !year || !gender || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Student.findOne({ registerNumber });
    if (existing) {
      return res.status(400).json({ message: "Student with this register number already exists" });
    }

    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    const student = new Student({
      fullName,
      registerNumber,
      department,
      year,
      gender: normalizedGender,
      phoneNumber,
      email,
      hostel: warden.assignedHostel,
      roomNumber,
      parentName,
      parentPhone,
      address,
      password: hashedPassword,
      wardenId: req.wardenId
    });
    await student.save();
    res.status(201).json({ success: true, message: "Student added successfully", data: student });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Failed to add student" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender to match student gender format
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Find all students with matching gender (not restricted to wardenId)
    const students = await Student.find({ gender: wardenGender });

    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true, message: "Student updated successfully", data: student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

// ==========================
// PARENT MANAGEMENT
// ==========================

export const addParent = async (req, res) => {
  try {
    const { parentName, studentRegisterNumber, relationship, phoneNumber, email, occupation, address, emergencyContact, password } = req.body;

    if (!parentName || !studentRegisterNumber || !relationship || !phoneNumber || !address || !emergencyContact || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate required fields are not empty strings
    if (parentName.trim() === '' || studentRegisterNumber.trim() === '' || relationship.trim() === '' ||
        phoneNumber.trim() === '' || address.trim() === '' || emergencyContact.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const student = await Student.findOne({ registerNumber: studentRegisterNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existing = await Parent.findOne({ studentRegisterNumber });
    if (existing) {
      return res.status(400).json({ message: "Parent already exists for this student" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parent = new Parent({
      parentName,
      studentRegisterNumber,
      studentId: student._id,
      relationship,
      phoneNumber,
      email,
      occupation,
      address,
      emergencyContact,
      password: hashedPassword,
      wardenId: req.wardenId
    });

    await parent.save();
    res.status(201).json({ success: true, message: "Parent added successfully", data: parent });
  } catch (error) {
    console.error("Error adding parent:", error);
    res.status(500).json({ message: "Failed to add parent" });
  }
};

export const getParents = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender to match student gender format
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Find all students with matching gender
    const students = await Student.find({ gender: wardenGender }).select("_id");

    // Find parents whose studentId is in the matching students
    const parents = await Parent.find({ studentId: { $in: students.map(s => s._id) } }).populate({
      path: 'studentId',
      select: "fullName registerNumber department year gender"
    });

    // Format the response
    const parentsWithStudentInfo = parents.map(parent => ({
      _id: parent._id,
      parentName: parent.parentName,
      studentRegisterNumber: parent.studentRegisterNumber,
      relationship: parent.relationship,
      phoneNumber: parent.phoneNumber,
      email: parent.email,
      occupation: parent.occupation,
      address: parent.address,
      emergencyContact: parent.emergencyContact,
      studentId: parent.studentId, // Now includes student info
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt
    }));

    res.json({ success: true, data: parentsWithStudentInfo });
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ message: "Failed to fetch parents" });
  }
};

export const updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    res.json({ success: true, message: "Parent updated successfully", data: parent });
  } catch (error) {
    console.error("Error updating parent:", error);
    res.status(500).json({ message: "Failed to update parent" });
  }
};

export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    res.json({ success: true, message: "Parent deleted successfully" });
  } catch (error) {
    console.error("Error deleting parent:", error);
    res.status(500).json({ message: "Failed to delete parent" });
  }
};

// ==========================
// NOTICE MANAGEMENT
// ==========================

export const createNotice = async (req, res) => {
  try {
    const { title, description, priority, expiryDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const notice = new Notice({
      title,
      description,
      priority: priority || "medium",
      expiryDate,
      createdBy: req.wardenId
    });

    await notice.save();
    res.status(201).json({ success: true, message: "Notice created successfully", data: notice });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Failed to create notice" });
  }
};

export const getNotices = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Find all wardens with the same gender
    const wardensWithSameGender = await Warden.find({ gender: wardenGender }).select("_id");

    // Fetch notices created by wardens of the same gender
    const notices = await Notice.find({ createdBy: { $in: wardensWithSameGender.map(w => w._id) } }).sort({ createdAt: -1 });

    res.json({ success: true, data: notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Failed to fetch notices" });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ success: true, message: "Notice updated successfully", data: notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: "Failed to update notice" });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Failed to delete notice" });
  }
};

// ==========================
// LEAVE MANAGEMENT
// ==========================

export const getLeaveRequests = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Find all students with matching gender (not restricted to wardenId)
    const students = await Student.find({ gender: wardenGender }).select("_id");

    const leaves = await Leave.find({ studentId: { $in: students.map(s => s._id) } })
      .populate("studentId", "fullName registerNumber department year parentName parentPhone")
      .sort({ createdAt: -1 });

    // Format the response with required fields
    const formattedLeaves = leaves.map(leave => {
      const baseData = {
        _id: leave._id,
        studentName: leave.studentId.fullName,
        registerNumber: leave.studentId.registerNumber,
        department: leave.studentId.department,
        year: leave.studentId.year,
        parentName: leave.studentId.parentName,
        parentPhone: leave.studentId.parentPhone,
        leaveType: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        parentApproval: leave.parentApproval,
        tutorApproval: leave.wardenApproval, // Assuming tutor approval is warden approval
        createdAt: leave.createdAt,
        wardenApprovedAt: leave.wardenApproval?.approvedAt || null
      };

      if (leave.type === "emergency") {
        return {
          ...baseData,
          emergencyContact: leave.emergencyContact,
          destination: leave.destination
        };
      }

      return baseData;
    });

    res.json({ success: true, data: formattedLeaves });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    let updateData = {};

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    // Map action to status
    switch (action) {
      case 'approve':
        // Check if all required approvals are given before warden can approve
        if (leave.type === 'emergency') {
          // For emergency leave: require both tutor and parent approval before warden can approve
          if (!leave.wardenApproval.approved) {
            return res.status(400).json({ message: "Tutor approval required before warden approval" });
          }
          if (!leave.parentApproval.approved) {
            return res.status(400).json({ message: "Parent approval required before warden approval" });
          }
        } else if (leave.type === 'holiday') {
          // For holiday leave: require parent approval before warden can approve
          if (!leave.parentApproval.approved) {
            return res.status(400).json({ message: "Parent approval required before warden approval" });
          }
        }

        // Set warden approval
        updateData['wardenApproval.approved'] = true;
        updateData['wardenApproval.approvedAt'] = new Date();
        updateData['wardenApproval.approvedBy'] = req.wardenId;
        updateData.status = 'approved';
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData['wardenApproval.approved'] = false;
        updateData['wardenApproval.approvedAt'] = new Date();
        updateData['wardenApproval.approvedBy'] = req.wardenId;
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Leave request not found" });
    res.json({ success: true, message: "Leave status updated successfully" });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ message: "Failed to update leave" });
  }
};

// ==========================
// DASHBOARD + ANALYTICS
// ==========================

export const getDashboardCounts = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Count students in the warden's hostel with matching gender
    const studentCount = await Student.countDocuments({ hostel: warden.assignedHostel, gender: wardenGender });

    // Count notices created by wardens of the same gender
    const wardensWithSameGender = await Warden.find({ gender: wardenGender }).select("_id");
    const noticeCount = await Notice.countDocuments({ createdBy: { $in: wardensWithSameGender.map(w => w._id) } });

    // Count pending leaves for students in the warden's hostel with matching gender
    const students = await Student.find({ hostel: warden.assignedHostel, gender: wardenGender }).select("_id");
    const leaveCount = await Leave.countDocuments({ studentId: { $in: students.map(s => s._id) }, status: "pending" });

    res.json({ success: true, studentCount, noticeCount, leaveCount });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getLeaveAnalytics = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    // Normalize warden gender
    const wardenGender = warden.gender.charAt(0).toUpperCase() + warden.gender.slice(1).toLowerCase();

    // Find all students with matching gender
    const students = await Student.find({ gender: wardenGender }).select("_id");

    // Aggregate exited students by startDate (when they left)
    const leaveData = await Leave.aggregate([
      {
        $match: {
          studentId: { $in: students.map(s => s._id) },
          "securityApproval.currentStatus": "exited"
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 } // Sort by date ascending
      }
    ]);

    // Format the data for the table
    const tableData = leaveData.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.json({ success: true, tableData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch leave analytics" });
  }
};

// ==========================
// WARDEN PROFILE
// ==========================

export const getWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json({ success: true, data: warden });
  } catch (error) {
    console.error("Error fetching warden profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateWardenProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle photo upload if present
    if (req.file) {
      updateData.photo = req.file.path; // Assuming multer is used for file upload
    }

    const warden = await Warden.findByIdAndUpdate(req.wardenId, updateData, { new: true });
    if (!warden) return res.status(404).json({ message: "Warden not found" });
    res.json({ success: true, message: "Profile updated successfully", data: warden });
  } catch (error) {
    console.error("Error updating warden profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ==========================
// LEAVE HISTORY
// ==========================

export const getLeaveHistory = async (req, res) => {
  try {
    const warden = await Warden.findById(req.wardenId);
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    const students = await Student.find({ hostel: warden.assignedHostel }).select("_id");

    let query = { studentId: { $in: students.map(s => s._id) } };

    // Add date filtering if provided
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date

      query.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { $and: [{ startDate: { $lte: startDate } }, { endDate: { $gte: endDate } }] }
      ];
    }

    // Add register number filtering if provided
    if (req.query.registerNumber) {
      const student = await Student.findOne({ registerNumber: req.query.registerNumber });
      if (student) {
        query.studentId = student._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const leaves = await Leave.find(query)
      .populate("studentId", "fullName registerNumber department year")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.status(500).json({ message: "Failed to fetch leave history" });
  }
};

// Add these to your warden controller

// Handle Tutor Approval
export const handleTutorApproval = async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Update tutor approval
    leave.wardenApproval = {
      approved: approved,
      approvedAt: new Date(),
      approvedBy: req.wardenId
    };

    if (!approved && rejectionReason) {
      leave.rejectionReason = rejectionReason;
      leave.status = 'rejected';
    } else if (approved) {
      // If tutor approves and parent has already approved, mark as fully approved
      if (leave.parentApproval.approved) {
        leave.status = 'approved';
      } else {
        leave.status = 'warden_approved';
      }
    }

    await leave.save();
    res.json({ success: true, message: `Tutor approval ${approved ? 'granted' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Error updating tutor approval:', error);
    res.status(500).json({ message: "Failed to update tutor approval" });
  }
};

// Handle Parent Approval
export const handleParentApproval = async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Update parent approval
    leave.parentApproval = {
      approved: approved,
      approvedAt: new Date()
    };

    if (!approved && rejectionReason) {
      leave.rejectionReason = rejectionReason;
      leave.status = 'rejected';
    } else if (approved) {
      // If parent approves and tutor has already approved, mark as fully approved
      if (leave.wardenApproval.approved) {
        leave.status = 'approved';
      } else {
        leave.status = 'parent_approved';
      }
    }

    await leave.save();
    res.json({ success: true, message: `Parent approval ${approved ? 'granted' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Error updating parent approval:', error);
    res.status(500).json({ message: "Failed to update parent approval" });
  }
};