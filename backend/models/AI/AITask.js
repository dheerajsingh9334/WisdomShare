const mongoose = require("mongoose");

const aiTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestSessionId: {
      type: String,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "blog_writer",
        "edit_refine",
        "semantic_search",
        "guest_chat",
        "summarize_blog",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    planTier: {
      type: String,
      enum: ["free", "premium", "pro", "guest"],
      default: "guest",
    },
    request: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

aiTaskSchema.index({ status: 1, createdAt: -1 });
aiTaskSchema.index({ userId: 1, type: 1, createdAt: -1 });
aiTaskSchema.index({ guestSessionId: 1, createdAt: -1 });

module.exports = mongoose.model("AITask", aiTaskSchema);
