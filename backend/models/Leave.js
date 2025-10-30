import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['holiday', 'emergency']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: function() {
      return this.type === 'emergency';
    }
  },
  destination: {
    type: String
  },

  // Overall status of the leave
  status: {
    type: String,
    enum: [
      'pending',
      'parent_approved',
      'warden_approved',
      'approved',
      'rejected',
      'exited',
      'returned'
    ],
    default: 'pending'
  },

  // ✅ Fixed: approval fields now default to null (not false)
  parentApproval: {
    approved: {
      type: Boolean,
      default: null // null = no action yet
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent'
    }
  },

  wardenApproval: {
    approved: {
      type: Boolean,
      default: null // null = no action yet
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warden'
    }
  },

  securityApproval: {
    approved: {
      type: Boolean,
      default: null // null = not checked yet
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Security'
    },
    exitTime: Date,
    returnTime: Date,
    currentStatus: {
      type: String,
      enum: ['in_hostel', 'exited', 'returned'],
      default: 'in_hostel'
    }
  },

  rejectionReason: {
    type: String
  },

  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
leaveSchema.index({ studentId: 1, createdAt: -1 });
leaveSchema.index({ wardenId: 1, status: 1 });
leaveSchema.index({ status: 1 });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
