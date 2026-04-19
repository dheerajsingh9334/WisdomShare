const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS,
  },
});

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`📧 Email worker processing job ${job.id}: ${job.name}`);

    // ─── Single notification email ───────────────────────────────────────────
    if (job.name === "send-notification" || job.name === "send-email") {
      const { to, subject, html } = job.data;
      await transporter.sendMail({
        from: `WisdomShare <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
      return { sent: to };
    }

    // ─── Admin broadcast (sends to a list of emails) ─────────────────────────
    if (job.name === "admin-broadcast") {
      const { recipients, subject, html } = job.data;
      const errors = [];
      for (const to of recipients) {
        try {
          await transporter.sendMail({
            from: `WisdomShare Admin <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
          });
          console.log(`✅ Broadcast email sent to ${to}`);
        } catch (err) {
          console.error(`❌ Broadcast email failed for ${to}:`, err.message);
          errors.push({ to, error: err.message });
        }
      }
      return { sent: recipients.length - errors.length, failed: errors.length, errors };
    }

    // ─── Account verification email ──────────────────────────────────────────
    if (job.name === "account-verification") {
      const { to, verificationLink } = job.data;
      await transporter.sendMail({
        from: `WisdomShare <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to,
        subject: "Verify your WisdomShare account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Welcome to WisdomShare! 🎉</h2>
            <p>Please verify your email address to get started.</p>
            <a href="${verificationLink}" 
               style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Verify Email
            </a>
            <p style="color:#666;font-size:12px;margin-top:24px;">Link expires in 10 minutes.</p>
          </div>
        `,
      });
      console.log(`✅ Verification email sent to ${to}`);
      return { sent: to };
    }

    // ─── Password reset email ─────────────────────────────────────────────────
    if (job.name === "password-reset") {
      const { to, resetLink } = job.data;
      await transporter.sendMail({
        from: `WisdomShare <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to,
        subject: "Reset your WisdomShare password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Password Reset Request</h2>
            <p>Click the button below to reset your password. This link expires in 10 minutes.</p>
            <a href="${resetLink}" 
               style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
            <p style="color:#666;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
      console.log(`✅ Password reset email sent to ${to}`);
      return { sent: to };
    }

    console.warn(`⚠️  Unknown email job name: ${job.name}`);
  },
  {
    connection: redisConnection,
    concurrency: 5, // Handle 5 emails at once
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Email job ${job.id} (${job.name}) completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job ${job.id} (${job.name}) failed: ${err.message}`);
});

module.exports = emailWorker;
