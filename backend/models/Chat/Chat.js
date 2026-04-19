const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

chatSchema.index({ roomId: 1, createdAt: -1 });
chatSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
chatSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
