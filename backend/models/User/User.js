const mongoose = require("mongoose");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    // Basic user information
    username: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: Object,
      default: null,
    },
    email: {
      type: String,
      required: false, // Set to false if email is not mandatory
    },
    password: {
      type: String,
      required: false, // Set to false if password is not mandatory
    },
    googleId: {
      type: String,
      required: false, // Required only for users logging in with Google
    },
    authMethod: {
      type: String,
      enum: ["google", "local", "facebook", "github"],
      required: true,
      default: "local",
    },

    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    accountVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    totalPosts: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    nextEarningDate: {
      type: Date,
      default: () =>
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Sets to the first day of the next month
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    hasSelectedPlan: { type: Boolean, default: false },
    planExpirationDate: { type: Date, default: null },
    lastLogin: { type: Date, default: Date.now },

    // User relationships
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Link to other users
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Saved posts for later reading

    // User role fields (admin users are managed separately in Admin collection)
    role: {
      type: String,
      enum: ["user", "moderator"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness if field is present
    },
  },
  {
    timestamps: true,
  },
);

// Removed stray paymentSchema.index calls that belonged to Payment model
//! Generate token for account verification
userSchema.methods.generateAccVerificationToken = function () {
  const emailToken = crypto.randomBytes(20).toString("hex");
  //assign the token to the user
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  this.accountVerificationExpires = Date.now() + 10 * 60 * 1000; //10 minutes
  return emailToken;
};
//! Generate token for password reset
userSchema.methods.generatePasswordResetToken = function () {
  const emailToken = crypto.randomBytes(20).toString("hex");
  //assign the token to the user
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes
  return emailToken;
};

//! Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ authMethod: 1, googleId: 1 });
userSchema.index(
  { username: "text", email: "text" },
  { weights: { username: 10, email: 2 }, name: "user_text_search" },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
