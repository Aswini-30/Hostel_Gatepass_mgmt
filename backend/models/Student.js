import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  year: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hostel: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String
  },
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  address: {
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
const Student = mongoose.model("Student", studentSchema);
export default Student;