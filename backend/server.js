import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wardenRoutes from "./routes/wardenRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3001",              // local React
      "https://gatepass-frontend.vercel.app" // deployed React
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wardens", wardenRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/parents", parentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
