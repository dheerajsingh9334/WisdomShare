const emailQueue = require("./emailQueue");

const sendPasswordEmail = async (to, token) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    await emailQueue.add("send-password-reset", {
      to,
      subject: "Password Reset Request",
      html: `
        <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p>${baseUrl}/reset-password/${token}</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    });
    
    console.log(`✅ Password reset email job added to queue for ${to}`);
  } catch (error) {
    console.error("❌ Failed to add password reset email job to queue:", error);
    throw new Error("Failed to queue password reset email");
  }
};

module.exports = sendPasswordEmail;

