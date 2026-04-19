const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, trim: true }, // Made optional since it's redundant with description
    // URL-friendly identifier; not enforced unique to avoid conflicts in legacy data
    slug: { type: String, trim: true, lowercase: true },
    image: {
      type: Object,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nextEarningDate: {
      type: Date,
      default: () =>
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Default to the first day of the next month
    },
    lastCalculatedViewsCount: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Tags for better organization and discovery
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 20,
      },
    ],
    // Short summary for previews/SEO
    excerpt: { type: String, trim: true, maxlength: 500 },
    // Optional settings grouped under options
    options: {
      commentsEnabled: { type: Boolean, default: true },
      reactionsEnabled: { type: Boolean, default: true },
      allowSharing: { type: Boolean, default: true },
      pinToProfile: { type: Boolean, default: false },
      featured: { type: Boolean, default: false },
      nsfw: { type: Boolean, default: false },
      visibility: {
        type: String,
        enum: ["public", "unlisted", "private"],
        default: "public",
      },
    },
    // Post status and scheduling
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "published", // Changed from 'draft' to 'published'
      validate: {
        validator: function (v) {
          return ["draft", "published", "scheduled", "archived"].includes(v);
        },
        message: (props) => `${props.value} is not a valid status!`,
      },
    },
    publishedAt: {
      type: Date,
      default: () => new Date(), // Default to current date
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true, // Changed from false to true
    },
    // Basic SEO fields
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 120 },
      metaDescription: { type: String, trim: true, maxlength: 200 },
      canonicalUrl: { type: String, trim: true },
    },
    // Estimated reading time in minutes
    readingTimeMinutes: { type: Number, default: 0 },
    // Denormalized body length for fast plan-gating checks in feed queries
    contentLength: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    // Interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Flag for moderation
    isBlocked: { type: Boolean, default: false },
    // Flag for admin management - when true, user can't see in their analytics
    adminManaged: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for better search performance
postSchema.index(
  { title: "text", description: "text", content: "text" },
  {
    weights: { title: 8, description: 4, content: 2 },
    name: "post_text_search",
  },
);
postSchema.index({ status: 1, isBlocked: 1, publishedAt: -1 }); // feed ordering
postSchema.index({ scheduledFor: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ slug: 1 });
// Compound indexes for targeted queries
postSchema.index({ category: 1, status: 1, isBlocked: 1, publishedAt: -1 }); // category-filtered feed
postSchema.index({ author: 1, status: 1, publishedAt: -1 }); // user post listing
postSchema.index({ isBlocked: 1, status: 1 }); // moderation
postSchema.index({ status: 1, isBlocked: 1, tags: 1, publishedAt: -1 }); // tag-filtered feed

module.exports = mongoose.model("Post", postSchema);
