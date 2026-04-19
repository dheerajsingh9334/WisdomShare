const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Plan = require("../../models/Plan/Plan");
const User = require("../../models/User/User");
const Payment = require("../../models/Payment/Payment");
const PlanHistory = require("../../models/Payment/PlanHistory");
//-----Stripe Payment-----
const stripePaymentController = {
  //----- payment
  payment: asyncHandler(async (req, res) => {
    //!. Get the plan ID and idempotency key
    const { subscriptionPlanId, idempotencyKey: bodyIdempotencyKey } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] || bodyIdempotencyKey;

    // ── Double-payment guard ── check before hitting Stripe at all
    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotencyKey });
      if (existingPayment) {
        console.log(
          "💳 Idempotency key already used — returning cached result",
        );
        return res.json({
          success: true,
          data: {
            status: existingPayment.status,
          },
          alreadyProcessed: true,
          message: "Payment already initiated with this idempotency key",
          status: existingPayment.status,
        });
      }
    }

    // Resolve plan by ObjectId, tier or planName (fallback to static)
    let plan = null;
    if (mongoose.isValidObjectId(subscriptionPlanId)) {
      plan = await Plan.findById(subscriptionPlanId);
    }
    if (!plan) {
      plan = await Plan.findOne({
        $or: [
          { tier: subscriptionPlanId },
          { planName: new RegExp(`^${subscriptionPlanId}$`, "i") },
        ],
      });
    }
    if (!plan) {
      const {
        resolveStaticPlanByIdOrName,
      } = require("../../utils/staticPlans");
      const staticPlan = resolveStaticPlanByIdOrName(subscriptionPlanId);
      if (!staticPlan) {
        return res.json({ message: "Plan not found" });
      }
      // Mimic plan doc shape for price
      plan = {
        price: staticPlan.price,
        _id: staticPlan._id,
        tier: staticPlan.tier,
      };
    }
    //! get the user
    const user = await User.findById(req.user).populate("plan");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Avoid accidental rapid repeat purchases for the same plan.
    const duplicatePaymentFilter = {
      user: user._id,
      status: "success",
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    };
    if (mongoose.isValidObjectId(plan._id)) {
      duplicatePaymentFilter.subscriptionPlan = plan._id;
    }
    const latestSuccessfulSamePlan = await Payment.findOne(
      duplicatePaymentFilter,
    ).sort({ createdAt: -1 });

    if (latestSuccessfulSamePlan) {
      return res.status(409).json({
        success: false,
        message:
          "This plan was already purchased recently. Please wait before trying again.",
        alreadyProcessed: true,
      });
    }

    //! Create payment intent/making the payment
    try {
      // Proration logic: if upgrading during an active cycle, apply credit for remaining days of current plan price
      let amountCents = Math.round((plan.price || 0) * 100);
      let discountCents = 0;
      let previousPayment = null;

      // Try to find latest successful payment for user
      previousPayment = await Payment.findOne({
        user: user._id,
        status: "success",
      })
        .sort({ createdAt: -1 })
        .populate("subscriptionPlan");

      const cycleStart = previousPayment?.createdAt || new Date();
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
      const now = new Date();

      // Only apply proration if there's time left and user has an existing plan with a price
      if (previousPayment && previousPayment.subscriptionPlan && user.plan) {
        const oldPlan = previousPayment.subscriptionPlan;
        const isUpgrade = (plan.price || 0) > (oldPlan.price || 0);
        const isDowngrade = (plan.price || 0) < (oldPlan.price || 0);
        if (now < cycleEnd) {
          const totalDays = Math.max(
            1,
            Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24)),
          );
          const remainingDays = Math.max(
            0,
            Math.ceil((cycleEnd - now) / (1000 * 60 * 60 * 24)),
          );
          const dailyOldPrice = (oldPlan.price || 0) / totalDays;
          const credit = dailyOldPrice * remainingDays;
          const creditCents = Math.round(credit * 100);
          if (isUpgrade) {
            // Apply discount for remaining value of old plan
            discountCents = Math.min(creditCents, amountCents);
            amountCents = Math.max(0, amountCents - discountCents);
          }
          // For downgrade, we can record that refund should be processed; handled post-verify or separate endpoint
          await PlanHistory.create({
            user: user._id,
            fromPlan: oldPlan._id,
            toPlan: mongoose.isValidObjectId(plan._id) ? plan._id : null,
            action: isUpgrade
              ? "upgrade"
              : isDowngrade
                ? "downgrade"
                : "switch",
            oldPrice: oldPlan.price || 0,
            newPrice: plan.price || 0,
            cycleStart,
            cycleEnd,
            remainingDays,
            creditCalculated: credit,
            discountApplied: discountCents / 100,
            previousPaymentReference: previousPayment.reference,
            notes: isDowngrade
              ? "Refund should be issued for unused time on old plan"
              : "",
          });
        }
      } else {
        // First-time purchase record
        await PlanHistory.create({
          user: user._id,
          toPlan: mongoose.isValidObjectId(plan._id) ? plan._id : null,
          action: "start",
          oldPrice: 0,
          newPrice: plan.price || 0,
        });
      }

      const stripeOptions = {};
      if (idempotencyKey) {
        stripeOptions.idempotencyKey = idempotencyKey;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountCents,
          currency: "usd",
          metadata: {
            userId: user._id.toString(),
            subscriptionPlanId,
            discountCents: discountCents.toString(),
            idempotencyKey: idempotencyKey || "",
          },
        },
        stripeOptions,
      );
      //! Send the response
      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          subscriptionPlanId,
          paymentIntentId: paymentIntent.id,
        },
        clientSecret: paymentIntent.client_secret,
        subscriptionPlanId,
        paymentIntent,
      });
    } catch (error) {
      console.error("Stripe payment intent creation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create payment intent",
        details: error,
      });
    }
  }),
  //verifying the payment
  verify: asyncHandler(async (req, res) => {
    try {
      //! Get the paymentId
      const { paymentId } = req.params;
      if (!paymentId) {
        return res.status(400).json({ message: "Payment ID is required" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      console.log("Payment Intent:", paymentIntent);
      //! confirm the payment status
      if (paymentIntent.status === "succeeded") {
        //!get the data from the metadata
        const metadata = paymentIntent?.metadata;
        const subscriptionPlanId = metadata?.subscriptionPlanId;
        const userId = metadata.userId;
        const idempotencyKey = metadata.idempotencyKey;

        if (!req.user || req.user.toString() !== userId?.toString()) {
          return res
            .status(403)
            .json({
              success: false,
              message: "Unauthorized payment verification attempt",
            });
        }

        //! Find the user
        const userFound = await User.findById(userId);
        if (!userFound) {
          return res.json({ message: "User not found" });
        }

        //! Resolve the plan by ObjectId, tier or planName (fallback to static)
        let plan = null;
        if (mongoose.isValidObjectId(subscriptionPlanId)) {
          plan = await Plan.findById(subscriptionPlanId);
        }
        if (!plan) {
          plan = await Plan.findOne({
            $or: [
              { tier: subscriptionPlanId },
              { planName: new RegExp(`^${subscriptionPlanId}$`, "i") },
            ],
          });
        }

        if (!plan) {
          const {
            resolveStaticPlanByIdOrName,
          } = require("../../utils/staticPlans");
          const staticPlan = resolveStaticPlanByIdOrName(subscriptionPlanId);
          if (!staticPlan) {
            return res
              .status(400)
              .json({ message: "Invalid subscription plan" });
          }
          // Try to find a corresponding DB plan by tier
          const dbPlan = await Plan.findOne({ tier: staticPlan.tier });
          if (!dbPlan) {
            return res
              .status(500)
              .json({
                message:
                  "Plan not configured in database. Please contact support.",
              });
          }
          plan = dbPlan;
        }

        //! Get the payment details
        const amount = paymentIntent?.amount / 100;
        const currency = paymentIntent?.currency;

        // Check if this payment/idempotency key is already processed (double-payment guard)
        const existingPayment = await Payment.findOne({
          $or: [
            { reference: paymentId },
            ...(idempotencyKey ? [{ idempotencyKey }] : []),
          ],
        });

        if (existingPayment) {
          return res.json({
            success: true,
            data: {
              user: await User.findById(userId).populate("plan"),
            },
            status: true,
            message: "Payment already verified",
            alreadyProcessed: true,
            userFound: await User.findById(userId).populate("plan"),
          });
        }

        // ── Atomic payment creation + user update via Mongoose transaction ──
        let newPayment;
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            [newPayment] = await Payment.create(
              [
                {
                  user: userId,
                  subscriptionPlan: plan._id,
                  status: "success",
                  amount,
                  currency,
                  reference: paymentId,
                  idempotencyKey: idempotencyKey || undefined,
                },
              ],
              { session },
            );

            await User.findByIdAndUpdate(
              userId,
              { 
                hasSelectedPlan: true, 
                plan: plan._id,
                planExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
              },
              { session },
            );
          });
        } catch (txErr) {
          console.error(
            "Transaction failed, falling back to non-transactional save:",
            txErr?.message,
          );
          if (txErr?.code === 11000) {
            const existing = await Payment.findOne({ reference: paymentId });
            if (existing) {
              const existingUser = await User.findById(userId).populate("plan");
              return res.json({
                success: true,
                data: { user: existingUser },
                status: true,
                message: "Payment already verified",
                alreadyProcessed: true,
                userFound: existingUser,
              });
            }
          }
          // Fallback for non-replica-set environments (local dev without replica set)
          newPayment = await Payment.create({
            user: userId,
            subscriptionPlan: plan._id,
            status: "success",
            amount,
            currency,
            reference: paymentId,
            idempotencyKey: idempotencyKey || undefined,
          });
          userFound.hasSelectedPlan = true;
          userFound.plan = plan._id;
          userFound.planExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
          await userFound.save();
        } finally {
          session.endSession();
        }

        if (newPayment) {
          // After successful switch, if this is a downgrade during active cycle, process pro-rated refund on previous charge
          // Find previous successful payment before this one
          const previousPayment = await Payment.findOne({
            user: userId,
            status: "success",
            _id: { $ne: newPayment._id },
          })
            .sort({ createdAt: -1 })
            .populate("subscriptionPlan");

          if (previousPayment?.subscriptionPlan) {
            const oldPlan = previousPayment.subscriptionPlan;
            // Determine if downgrade and within same billing cycle
            const cycleStart = previousPayment.createdAt;
            const cycleEnd = new Date(cycleStart);
            cycleEnd.setMonth(cycleEnd.getMonth() + 1);
            const now = new Date();
            const isDowngrade = (oldPlan.price || 0) > (plan.price || 0);
            if (isDowngrade && now < cycleEnd) {
              const totalDays = Math.max(
                1,
                Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24)),
              );
              const remainingDays = Math.max(
                0,
                Math.ceil((cycleEnd - now) / (1000 * 60 * 60 * 24)),
              );
              const dailyOldPrice = (oldPlan.price || 0) / totalDays;
              const credit = dailyOldPrice * remainingDays; // USD
              const creditCents = Math.round(credit * 100);
              try {
                // Retrieve previous payment intent to get charge id
                const prevPI = await stripe.paymentIntents.retrieve(
                  previousPayment.reference,
                );
                const chargeId = prevPI?.latest_charge;
                if (chargeId && creditCents > 0) {
                  const refund = await stripe.refunds.create({
                    charge: chargeId,
                    amount: creditCents,
                  });
                  await PlanHistory.create({
                    user: userId,
                    fromPlan: oldPlan._id,
                    toPlan: plan._id,
                    action: "downgrade",
                    oldPrice: oldPlan.price || 0,
                    newPrice: plan.price || 0,
                    cycleStart,
                    cycleEnd,
                    remainingDays,
                    creditCalculated: credit,
                    refundProcessed: credit,
                    stripeRefundId: refund.id,
                    previousPaymentReference: previousPayment.reference,
                    notes: "Automatic prorated refund processed on downgrade",
                  });
                }
              } catch (refundErr) {
                console.error(
                  "Refund processing failed:",
                  refundErr?.message || refundErr,
                );
                // Record history even if refund fails
                await PlanHistory.create({
                  user: userId,
                  fromPlan: oldPlan._id,
                  toPlan: plan._id,
                  action: "downgrade",
                  oldPrice: oldPlan.price || 0,
                  newPrice: plan.price || 0,
                  cycleStart,
                  cycleEnd,
                  remainingDays,
                  creditCalculated: credit,
                  refundProcessed: 0,
                  previousPaymentReference: previousPayment.reference,
                  notes: "Refund calculation recorded; Stripe refund failed.",
                });
              }
            }
          }
        }

        //! Fetch the updated user with populated plan
        const updatedUser = await User.findById(userId).populate("plan");

        //! Send the response
        res.json({
          success: true,
          data: {
            user: updatedUser,
          },
          status: true,
          message: "Payment verified, user updated",
          userFound: updatedUser,
        });
      } else {
        // Payment not succeeded
        res.json({
          success: false,
          data: {
            paymentIntentStatus: paymentIntent.status,
          },
          status: false,
          message: `Payment status: ${paymentIntent.status}`,
          paymentIntent,
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to verify payment",
        details: error,
      });
    }
  }),
  //Free plan
  free: asyncHandler(async (req, res) => {
    //check for the user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //update the user field
    user.hasSelectedPlan = true;
    await user.save();
    //send the response
    res.json({
      status: true,
      message: "Payment verified, user updated",
    });
  }),
};

module.exports = stripePaymentController;
