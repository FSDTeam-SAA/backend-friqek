import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  // If email credentials are not configured (local/dev), just log OTP to console
  // instead of failing the request.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | Body: ${html}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: subject ? subject : "SafeMed Rx Notification",
    html,
  });
};
