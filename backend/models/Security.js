import mongoose from "mongoose";

const SecuritySchema = new mongoose.Schema({
  name: String,
  shift: String,
  phone: String,
  email: String,
  password: String,
  gender: String,
  address: String,
  phoneNumber: String,
}, { timestamps: true });

const Security = mongoose.model("Security", SecuritySchema);
export default Security;
