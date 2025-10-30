import express from "express";
import {
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// POST routes
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
