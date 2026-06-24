process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from "dotenv";
dotenv.config(); // MUST stay at the very top

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

/* =====================================================
   ENV CHECK (TEMPORARY – IMPORTANT)
===================================================== */
console.log("ENV CHECK:", {
  ALERT_EMAIL: process.env.ALERT_EMAIL,
  ALERT_EMAIL_PASSWORD: process.env.ALERT_EMAIL_PASSWORD
    ? "LOADED"
    : "MISSING",
});

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// MongoDB Connection
// ==========================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ==========================
// Routes
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API Running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================
// Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

