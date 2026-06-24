import express from "express";
import {
  createExpense,
  getExpenses,
  deleteExpense,        // ✅ must exist in controller
  getDashboardStats
} from "../controllers/expenseController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protect all routes
router.use(authMiddleware);

// ==========================
// Routes
// ==========================
router.post("/", createExpense);        // Create expense
router.get("/", getExpenses);           // Get all expenses
router.delete("/:id", deleteExpense);   // Delete expense
router.get("/stats", getDashboardStats); // Dashboard stats + insights

export default router;
