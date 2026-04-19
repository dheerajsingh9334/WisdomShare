const emailQueue = require("./emailQueue");

const sendAccVerificationEmail = async (to, token) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    await emailQueue.add("send-verification", {
      to,
      subject: "Account Verification - WisdomShare",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
          <p>Thank you for registering with WisdomShare!</p>
          <p>To complete your registration and verify your email address, please click on the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard/account-verification/${token}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify My Account
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
            ${baseUrl}/dashboard/account-verification/${token}
          </p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Important:</strong> This verification link will expire in 10 minutes for security reasons.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent from WisdomShare. Please do not reply to this email.
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Account verification email job added to queue for ${to}`);
  } catch (error) {
    console.error("❌ Failed to add verification email job to queue:", error);
    throw new Error("Failed to queue account verification email");
  }
};

module.exports = sendAccVerificationEmail;

