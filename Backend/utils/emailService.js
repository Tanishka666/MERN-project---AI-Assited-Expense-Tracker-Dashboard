import nodemailer from "nodemailer";

export const sendBudgetAlertEmail = async (to, totalSpent, limit) => {
  try {
    console.log("📧 Attempting to send email to:", to);

    const transporter = nodemailer.createTransport({
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

    const info = await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to,
      subject: "🚨 Budget Alert!",
      text: `Budget Alert!

You have exceeded your alert budget.

Limit: ₹${limit}
Spent: ₹${totalSpent}`,
    });

    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

