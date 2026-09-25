import express from "express";

import {
  register,
  login,
  getProfile,
  verifyEmail
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, getProfile);

// Email verification
router.get("/verify-email/:token", verifyEmail);

export default router;