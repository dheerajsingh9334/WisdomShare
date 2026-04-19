const { Worker } = require("bullmq");
const redisConnection = require("../utils/redis");
const Notification = require("../models/Notification/Notification");

const notificationWorker = new Worker(
  "notification-queue",
  async (job) => {
    console.log(`🔔 Notification worker processing job ${job.id}: ${job.name}`);

    if (job.name === "create-notification") {
      const { userId, postId, title, message, type, metadata } = job.data;

      // Save to database
      const notification = await Notification.create({
        userId,
        postId,
        title,
        message,
        type,
        metadata,
      });

      // Push real-time notification via Socket.IO
      try {
        const { sendToUser } = require("../utils/socket");
        sendToUser(userId.toString(), "notification", {
          _id: notification._id,
          title,
          message,
          type,
          postId,
          isRead: false,
          createdAt: notification.createdAt,
        });
      } catch (socketErr) {
        // Socket push is best-effort – don't fail the job if socket isn't available
        console.warn("⚠️  Socket push skipped:", socketErr.message);
      }

      return { notificationId: notification._id };
    }

    if (job.name === "create-bulk-notifications") {
      const { notifications } = job.data;
      const created = await Notification.insertMany(notifications);
      console.log(`✅ Bulk notifications created: ${created.length}`);

      // Try to push each via socket
      try {
        const { sendToUser } = require("../utils/socket");
        for (const n of created) {
          sendToUser(n.userId.toString(), "notification", {
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            postId: n.postId,
            isRead: false,
            createdAt: n.createdAt,
          });
        }
      } catch (socketErr) {
        console.warn("⚠️  Bulk socket push skipped:", socketErr.message);
      }

      return { count: created.length };
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

notificationWorker.on("completed", (job, result) => {
  console.log(`✅ Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Notification job ${job.id} failed: ${err.message}`);
});

module.exports = notificationWorker;
