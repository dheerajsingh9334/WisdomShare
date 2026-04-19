const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    title: { type: String, required: true }, // Add title field
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: [
        "post_like",
        "post_comment",
        "new_follower",
        "new_post_from_following",
        "post_approved",
        "post_rejected",
        "account_verified",
        "account_banned",
        "plan_upgrade",
        "plan_expiry",
        "admin",
        "system",
        "system_announcement",
        "update",
        "announcement",
      ],
      required: true,
    },
    metadata: {
      actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who triggered the notification
      actorName: String,
      actorAvatar: String,
      action: String, // What action was performed
      targetType: String, // Type of content (post, comment, etc.)
      targetId: mongoose.Schema.Types.ObjectId, // ID of the target content
      additionalData: mongoose.Schema.Types.Mixed, // Any additional data
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
