import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Expense from "../models/Expense.js";
import { categorizeExpense} from "../config/aiService.js";
import { sendBudgetAlertEmail } from "../utils/emailService.js";


// ==========================
// Create Expense
// ==========================
export const createExpense = async (req, res) => {
  try {
    const { description, amount, category, date, type } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const finalType = (type || "expense").toLowerCase().trim();

    let finalCategory = category;
    let aiCategorized = false;

    if (!category || category.trim() === "") {
      finalCategory = await categorizeExpense(description);
      aiCategorized = true;
    }

    const expense = await Expense.create({
      userId: req.user._id,
      description,
      amount,
      category: finalCategory,
      type: finalType,
      date: date || Date.now(),
      aiCategorized,
    });

    const expenses = await Expense.find({
      userId: req.user._id,
      type: "expense",
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const user = await User.findById(req.user._id);

    const BUDGET_LIMIT = Number(user.alertBudget || user.monthlyBudget || 0);

    if (!user.alertEmailCount) {
      user.alertEmailCount = 0;
    }

    if (totalSpent > BUDGET_LIMIT && user.alertEmailCount < 5) {
      await Notification.create({
        userId: user._id,
        message: `🚨 Budget exceeded. You spent ₹${totalSpent} out of ₹${BUDGET_LIMIT}`,
      });

      await sendBudgetAlertEmail(user.email, totalSpent, BUDGET_LIMIT);

      user.alertEmailCount += 1;
      await user.save();
    }

    return res.status(201).json(expense);

  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ==========================
// Get All Expenses
// ==========================
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ==========================
// Delete Expense
// ==========================
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await expense.deleteOne();

    return res.json({ message: "Expense deleted" });

  } catch (error) {
    console.error("Delete expense error:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ==========================
// Dashboard Stats
// ==========================
export const getDashboardStats = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });

    const expenseList = expenses.filter(
      (e) => e.type && e.type.toLowerCase().trim() === "expense"
    );

    const totalSpent = expenseList.reduce((sum, e) => sum + Number(e.amount), 0);

    const totalIncome = expenses
      .filter((e) => e.type && e.type.toLowerCase().trim() === "income")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryBreakdown = expenseList.reduce((acc, e) => {
      const category = e.category?.trim().toLowerCase();
      if (!category) return acc;

      acc[category] = (acc[category] || 0) + Number(e.amount);
      return acc;
    }, {});

    const BUDGET_LIMIT = Number(req.user.monthlyBudget || 0);

    const insights = generateInsights(expenseList, req.user);

    return res.json({
      totalSpent,
      totalIncome,
      monthlyBudget: BUDGET_LIMIT,
      budgetRemaining: BUDGET_LIMIT - totalSpent,
      categoryBreakdown,
      recentTransactions: expenses.slice(0, 10),
      insights,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: error.message });
  }
};
