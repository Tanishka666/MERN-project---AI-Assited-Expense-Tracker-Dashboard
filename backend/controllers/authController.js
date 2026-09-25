import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailService.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ==========================
// Register User
// ==========================
export const register = async (req, res) => {
  try {
    const { name, email, password, monthlyBudget } = req.body;

    // Required fields check
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 15 minutes
    const verificationTokenExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      ...(monthlyBudget && {
        monthlyBudget: Number(monthlyBudget),
      }),

      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      // If email could not be sent, remove the newly created user
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          "Account could not be created because verification email could not be sent",
      });
    }

    // Do NOT generate JWT here
    // User must verify email first

    res.status(201).json({
      message:
        "Account created successfully. Please check your email and verify your account before signing in.",
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================
// Login User
// ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Check email verification
    // Only explicitly false is blocked so older
    // users created before this feature are not broken.
    if (user.emailVerified === false) {
      return res.status(403).json({
        message:
          "Please verify your email address before signing in.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================
// Verify Email
// ==========================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired.",
      });
    }

    // Mark email as verified
    user.emailVerified = true;

    // Remove verification token after successful verification
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    res.json({
      message: "Email verified successfully. You can now sign in.",
    });

  } catch (error) {
    console.error("Email verification error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================
// Get User Profile
// ==========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================
// Update Monthly Budget
// ==========================
export const updateMonthlyBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (!monthlyBudget) {
      return res.status(400).json({
        message: "Monthly budget is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.monthlyBudget = Number(monthlyBudget);

    await user.save();

    res.json({
      message: "Monthly budget updated successfully",
      monthlyBudget: user.monthlyBudget,
    });

  } catch (error) {
    console.error("Update budget error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};