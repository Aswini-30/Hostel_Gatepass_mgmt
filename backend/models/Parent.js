import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  parentName: {
    type: String,
    required: true
  },
  studentRegisterNumber: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  occupation: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    required: true
  }
}, {
  timestamps: true
});

// Change to default export
const Parent = mongoose.model("Parent", parentSchema);
export default Parent;