import "dotenv/config";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Expense from "./models/Expense.js";
import User from "./models/User.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BUDGET_LIMIT = 20000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // 🔴 Get ALL users
    const users = await User.find();

    for (const user of users) {
      // 🔴 Get THIS user's expenses
      const expenses = await Expense.find({
        userId: user._id.toString(),
        type: "expense",
      });

      const totalSpent = expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      );

      if (totalSpent <= BUDGET_LIMIT) continue;

      await transporter.sendMail({
        from: process.env.ALERT_EMAIL,
        to: user.email,
        subject: "🚨 Budget Alert!",
        text: `Budget Alert!

You have exceeded your monthly budget.

Limit: ₹${BUDGET_LIMIT}
Spent: ₹${totalSpent}`,
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

run();

