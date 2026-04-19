// Static plans configuration as fallback when no DB plans exist

const STATIC_PLANS = [
  {
    _id: "free_plan_static",
    planName: "Free",
    description: "Perfect for getting started with blogging",
    features: [
      "1 post per day",
      "1,500 characters per post",
      "1 category",
      "Basic post creation",
      "View posts",
      "AI Blog Writer (300 words)",
      "AI Semantic Search",
    ],
    price: 0,
    postLimit: 1,
    dailyPostLimit: 1,
    tier: "free",
    isActive: true,
    characterLimit: 1500,
    categoryLimit: 1,
    analytics: false,
    advancedEditor: false,
    scheduledPosts: false,
    multipleCategories: false,
    commentAndLike: false,
    readerAnalytics: false,
  },
  {
    _id: "premium_plan_static",
    planName: "Premium",
    description: "Enhanced features for serious bloggers",
    features: [
      "3 posts per day",
      "5,000 characters per post",
      "Multiple categories",
      "Advanced editor",
      "Scheduled posts",
      "Analytics",
      "Comments and likes",
      "AI Blog Writer + Refine (900 words)",
      "AI Summarize Blogs",
    ],
    price: 9.99,
    postLimit: 3,
    dailyPostLimit: 3,
    tier: "premium",
    isActive: true,
    characterLimit: 5000,
    categoryLimit: null,
    analytics: true,
    advancedEditor: true,
    scheduledPosts: true,
    multipleCategories: true,
    commentAndLike: true,
    readerAnalytics: false,
  },
  {
    _id: "pro_plan_static",
    planName: "Pro",
    description: "Complete blogging solution for professionals",
    features: [
      "Everything in Premium",
      "10,000 characters per post",
      "5 posts per day",
      "Advanced analytics",
      "Reader analytics",
      "Priority support",
      "All features unlocked",
      "AI Blog Writer + Refine (1,500 words)",
      "Priority AI processing",
    ],
    price: 99.99,
    postLimit: 5,
    dailyPostLimit: 5,
    tier: "pro",
    isActive: true,
    characterLimit: 10000,
    categoryLimit: null,
    analytics: true,
    advancedEditor: true,
    scheduledPosts: true,
    multipleCategories: true,
    commentAndLike: true,
    readerAnalytics: true,
    prioritySupport: true,
  },
];

// Get all static plans
const getStaticPlans = () => {
  return STATIC_PLANS.filter((plan) => plan.isActive);
};

// Find a static plan by ID, tier, or planName
const resolveStaticPlanByIdOrName = (identifier) => {
  if (!identifier) return null;

  const searchTerm = identifier.toString().toLowerCase();

  return STATIC_PLANS.find((plan) => {
    return (
      plan._id === identifier ||
      plan.tier.toLowerCase() === searchTerm ||
      plan.planName.toLowerCase() === searchTerm ||
      plan._id.toLowerCase() === searchTerm
    );
  });
};

// Get plan by tier specifically
const getStaticPlanByTier = (tier) => {
  if (!tier) return null;
  return STATIC_PLANS.find(
    (plan) => plan.tier.toLowerCase() === tier.toLowerCase(),
  );
};

// Get plan features for a given tier
const getStaticPlanFeatures = (tier) => {
  const plan = getStaticPlanByTier(tier);
  return plan ? plan.features : [];
};

module.exports = {
  getStaticPlans,
  resolveStaticPlanByIdOrName,
  getStaticPlanByTier,
  getStaticPlanFeatures,
  STATIC_PLANS,
};
