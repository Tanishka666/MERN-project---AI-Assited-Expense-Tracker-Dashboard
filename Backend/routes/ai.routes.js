import express from "express";
import { categorizeExpense } from "../config/aiService.js";

const router = express.Router();

router.post("/categorize", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.json({ category: "Others" });
    }

    const category = await categorizeExpense(description);
    res.json({ category });
  } catch (err) {
    console.error("AI categorize error:", err);
    res.status(500).json({ category: "Others" });
  }
});

export default router;

