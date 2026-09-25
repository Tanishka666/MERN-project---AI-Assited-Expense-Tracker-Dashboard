import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendBudgetAlertEmail = async (to, totalSpent, limit) => {
  try {
    console.log("📧 Attempting to send budget alert to:", to);

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to,
      subject: "🚨 Budget Alert!",
      text: `Budget Alert!

You have exceeded your alert budget.

Limit: ₹${limit}
Spent: ₹${totalSpent}`,
    });

    console.log("✅ Budget alert email sent:", info.response);
  } catch (error) {
    console.error("❌ Budget alert email failed:", error.message);
  }
};

export const sendVerificationEmail = async (to, token) => {
  try {
    console.log("📧 Sending verification email to:", to);

    const transporter = createTransporter();

    const frontendURL =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const verificationLink =
      `${frontendURL}/verify-email/${token}`;

    const info = await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to,
      subject: "Verify your Expense Tracker account",

      text: `Hello,

Thank you for creating an Expense Tracker account.

Please verify your email address using the link below:

${verificationLink}

This verification link will expire in 15 minutes.

If you did not create this account, you can ignore this email.

Regards,
Expense Tracker`,
    });

    console.log("✅ Verification email sent:", info.response);
  } catch (error) {
    console.error("❌ Verification email failed:", error.message);
    throw error;
  }
};