import mongoose from "mongoose";

const WardenSchema = new mongoose.Schema({
  name: String,
  gender: String,
  assignedHostel: String,
  phone: String,
  email: String,
  password: String,
  photo: String, // URL or path to the uploaded photo
}, { timestamps: true });

const Warden = mongoose.model("Warden", WardenSchema);
export default Warden;
