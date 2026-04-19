const mongoose = require("mongoose");

//Schema
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reference: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      required: true,
    },
    subscriptionPlan: {
      //use object id
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    amount: {
      type: Number,
      default: 0,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ reference: 1 }, { unique: true });
paymentSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, sparse: true },
);
paymentSchema.index({ user: 1, createdAt: -1 }); // fast per-user history lookup

//! Compile to form the model
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
