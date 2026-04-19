const emailQueue = require("./emailQueue");

const sendNotificatiomMsg = async (to, postId) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:5173";
    
    await emailQueue.add("send-notification", {
      to,
      subject: "New Post Created",
      html: `
        <p>A new post has been created on our site WisdomShare</p>
        <p>Click <a href="${baseUrl}/posts/${postId}">here</a> to view the post.</p>
      `,
    });
    
    console.log(`✅ Notification job added to queue for ${to}`);
  } catch (error) {
    console.error("❌ Failed to add notification job to queue:", error);
    throw new Error("Failed to queue notification email");
  }
};

module.exports = sendNotificatiomMsg;

