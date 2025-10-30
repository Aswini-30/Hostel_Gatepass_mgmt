import Warden from "../models/Warden.js";
import Security from "../models/Security.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "aswiniganesan30@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Aswin!2006";

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // --- ADMIN LOGIN ---
    if (role === "admin") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Admin login successful!", token, user: { name: "Admin", email, role: "admin" } });
      }
      return res.status(401).json({ message: "Invalid admin credentials!" });
    }

    let user;

    // --- STUDENT LOGIN ---
    if (role === "student") {
      user = await Student.findOne({ email });
      if (!user) return res.status(404).json({ message: "Student not found! Please contact your warden for registration." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid password!" });

      const token = jwt.sign({ id: user._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Student login successful!", token, user: { id: user._id, fullName: user.fullName, email: user.email, role: "student", registerNumber: user.registerNumber } });
    }

    // --- PARENT LOGIN ---
    if (role === "parent") {
      user = await Parent.findOne({ email });
      if (!user) return res.status(404).json({ message: "Parent not found! Please contact your warden for registration." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid password!" });

      const token = jwt.sign({ id: user._id, role: "parent" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Parent login successful!", token, user: { id: user._id, parentName: user.parentName, email: user.email, role: "parent", studentRegisterNumber: user.studentRegisterNumber } });
    }

    // --- SECURITY LOGIN ---
    if (role === "security") {
      user = await Security.findOne({ email });
      if (!user) return res.status(404).json({ message: "Security not found!" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid password!" });

      const token = jwt.sign({ id: user._id, role: "security" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Security login successful!", token, user: { id: user._id, name: user.name, email: user.email, role: "security" } });
    }

    // --- WARDEN LOGIN ---
    if (role === "warden") {
      user = await Warden.findOne({ email });
      if (!user) return res.status(404).json({ message: "Warden not found!" });
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Fallback for plain text passwords (backward compatibility)
        if (password === user.password) {
          isMatch = true;
        }
      }
      if (!isMatch) return res.status(401).json({ message: "Invalid password!" });

      const token = jwt.sign({ id: user._id, role: "warden", gender: user.gender }, process.env.JWT_SECRET, { expiresIn: "1d" });
      const dashboard = user.gender.toLowerCase() === "male" ? "/warden-male-dashboard" : "/warden-female-dashboard";

      return res.json({ message: "Warden login successful!", token, user: { id: user._id, name: user.name, email: user.email, role: "warden", gender: user.gender, dashboard } });
    }

    return res.status(400).json({ message: "Invalid role!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  const { email, name, role } = req.body;

  try {
    // --- ADMIN GOOGLE LOGIN ---
    if (role === "admin") {
      if (email === ADMIN_EMAIL) {
        const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Admin Google login successful!", token, user: { name: "Admin", email, role: "admin" } });
      }
      return res.status(403).json({ message: "Only admin can login!" });
    }

    let user;

    // --- STUDENT GOOGLE LOGIN ---
    if (role === "student") {
      user = await Student.findOne({ email });
      if (!user) return res.status(403).json({ message: "This email is not registered as student! Please contact your warden." });

      const token = jwt.sign({ id: user._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Student Google login successful!", token, user: { id: user._id, fullName: user.fullName, email: user.email, role: "student", registerNumber: user.registerNumber } });
    }

    // --- PARENT GOOGLE LOGIN ---
    if (role === "parent") {
      user = await Parent.findOne({ email });
      if (!user) return res.status(403).json({ message: "This email is not registered as parent! Please contact your warden." });

      const token = jwt.sign({ id: user._id, role: "parent" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Parent Google login successful!", token, user: { id: user._id, parentName: user.parentName, email: user.email, role: "parent", studentRegisterNumber: user.studentRegisterNumber } });
    }

    // --- SECURITY GOOGLE LOGIN ---
    if (role === "security") {
      user = await Security.findOne({ email });
      if (!user) return res.status(403).json({ message: "This email is not registered as security!" });

      const token = jwt.sign({ id: user._id, role: "security" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Security Google login successful!", token, user: { id: user._id, name: user.name, email: user.email, role: "security" } });
    }

    // --- WARDEN GOOGLE LOGIN ---
    if (role === "warden") {
      user = await Warden.findOne({ email });
      if (!user) return res.status(403).json({ message: "This email is not registered as warden!" });

      const token = jwt.sign({ id: user._id, role: "warden", gender: user.gender }, process.env.JWT_SECRET, { expiresIn: "1d" });
      const dashboard = user.gender === "male" ? "/warden-male-dashboard" : "/warden-female-dashboard";

      return res.json({ message: "Warden Google login successful!", token, user: { id: user._id, name: user.name, email: user.email, role: "warden", gender: user.gender, dashboard } });
    }

    return res.status(400).json({ message: "Invalid role!" });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    let user;

    if (role === "student") user = await Student.findOne({ email });
    else if (role === "parent") user = await Parent.findOne({ email });
    else if (role === "security") user = await Security.findOne({ email });
    else if (role === "warden") user = await Warden.findOne({ email });
    else if (role === "admin") {
      if (email !== ADMIN_EMAIL) return res.status(404).json({ message: "Admin email not found!" });
    } else {
      return res.status(400).json({ message: "Invalid role!" });
    }

    if (!user && role !== "admin") return res.status(404).json({ message: `${role} not found!` });

    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Get client URL from request headers or use default
    const clientUrl = req.headers.origin || req.headers.referer || "http://localhost:3001";
    const resetLink = `${clientUrl}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "GateX Password Reset",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, role } = decoded;

    let user;
    let updateResult;

    if (role === "student") {
      user = await Student.findOne({ email });
      if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateResult = await Student.updateOne({ email }, { password: hashedPassword });
      }
    } else if (role === "parent") {
      user = await Parent.findOne({ email });
      if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateResult = await Parent.updateOne({ email }, { password: hashedPassword });
      }
    } else if (role === "security") {
      user = await Security.findOne({ email });
      if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateResult = await Security.updateOne({ email }, { password: hashedPassword });
      }
    } else if (role === "warden") {
      user = await Warden.findOne({ email });
      if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateResult = await Warden.updateOne({ email }, { password: hashedPassword });
      }
    } else if (role === "admin") {
      // For admin, we can't update the password in DB as it's in env, but we can acknowledge
      if (email === ADMIN_EMAIL) {
        return res.json({ message: "Admin password reset not supported. Please contact system administrator." });
      }
    }

    if (!user && role !== "admin") return res.status(404).json({ message: `${role} not found!` });

    if (updateResult && updateResult.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to update password" });
    }

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
    }
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// ================= ADMIN REGISTER USER =================
export const registerUserByAdmin = async (req, res) => {
  const { email, password, name, gender, assignedHostel, phone, role, shift } = req.body;

  try {
    // Check admin authorization
    const adminToken = req.headers.authorization;
    if (!adminToken) return res.status(403).json({ message: "Admin token missing!" });

    const token = adminToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "admin") return res.status(403).json({ message: "Only admin can register users!" });

    // Validate role
    if (!["warden", "security"].includes(role)) return res.status(400).json({ message: "Invalid role!" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "warden") {
      const existingWarden = await Warden.findOne({ email });
      if (existingWarden) return res.status(400).json({ message: "Warden already exists!" });

      const warden = new Warden({ name, gender, assignedHostel, phone, email, password: hashedPassword });
      await warden.save();
      return res.status(201).json({ message: "Warden registered successfully!", warden });
    }

    if (role === "security") {
      const existingSecurity = await Security.findOne({ email });
      if (existingSecurity) return res.status(400).json({ message: "Security already exists!" });

      const security = new Security({ name, shift, phone, email, password: hashedPassword });
      await security.save();
      return res.status(201).json({ message: "Security registered successfully!", security });
    }

  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
