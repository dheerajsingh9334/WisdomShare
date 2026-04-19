const User = require("../models/User/User");
const Post = require("../models/Post/Post");
const asyncHandler = require("express-async-handler");

// Middleware to check if user can create a new post based on their plan limits
const checkUserPlan = asyncHandler(async (req, res, next) => {
  try {
    // Get the user with populated plan
    const user = await User.findById(req.user).populate("plan");

    // Check if user has selected a plan
    if (!user?.hasSelectedPlan) {
      return res.status(401).json({
        message: "You must select a plan before creating a post",
      });
    }

    // Check if user has a plan assigned
    if (!user?.plan) {
      return res.status(401).json({
        message: "No plan assigned. Please select a plan first.",
      });
    }

    // Get plan details
    const planTier = (user.plan.tier || user.plan.planName || "free")
      .toString()
      .toLowerCase();

    // Define tier limits for daily posts
    const tierDefaults = {
      free: 1,
      premium: 3,
      pro: 5,
    };

    const postLimit =
      typeof user.plan.dailyPostLimit === "number"
        ? user.plan.dailyPostLimit
        : tierDefaults[planTier] || tierDefaults.free;

    // Calculate current day range
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Count posts created today
    const dailyCount = await Post.countDocuments({
      author: req.user,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Check if user has reached daily limit
    if (dailyCount >= postLimit) {
      return res.status(403).json({
        message: `Daily post limit reached for your plan. Limit per day: ${postLimit}`,
        currentCount: dailyCount,
        limit: postLimit,
        plan: user.plan.planName || user.plan.tier,
        period: "day",
      });
    }

    // Store user plan info in request for use in controllers
    req.userPlan = user.plan;
    req.userPostCount = user.posts?.length || 0;
    req.dailyPostCount = dailyCount;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error checking user plan",
      error: error.message,
    });
  }
});

// Middleware to check specific plan features
const checkPlanFeature = (requiredFeature) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user).populate("plan");

      if (!user?.plan) {
        return res.status(403).json({
          message: "Plan required to access this feature",
        });
      }

      const planTier = (user.plan.tier || user.plan.planName || "free")
        .toString()
        .toLowerCase();

      // Define feature access based on plan tiers
      const featureAccess = {
        advancedAnalytics: ["premium", "pro"],
        scheduledPosts: ["premium", "pro"],
        contentCalendar: ["premium", "pro"],
        advancedSEO: ["premium", "pro"],
        customBranding: ["premium", "pro"],
        prioritySupport: ["premium", "pro"],
        apiAccess: ["pro"],
        teamCollaboration: ["pro"],
        whiteLabel: ["pro"],
        customIntegrations: ["pro"],
        dedicatedSupport: ["pro"],
      };

      // Check if the required feature is accessible for the user's plan
      const allowedPlans = featureAccess[requiredFeature];

      if (!allowedPlans) {
        // If feature not defined, allow access (for backward compatibility)
        return next();
      }

      if (!allowedPlans.includes(planTier)) {
        return res.status(403).json({
          message: `This feature requires ${allowedPlans[0] === "premium" ? "Premium" : "Pro"} plan or higher`,
          requiredPlan: allowedPlans[0],
          currentPlan: planTier,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error checking plan feature access",
        error: error.message,
      });
    }
  });
};

module.exports = {
  checkUserPlan,
  checkPlanFeature,
  checkPostLimit: checkUserPlan, // Alias for backward compatibility
};
