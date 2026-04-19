// Plan utilities for feature access control

export const PLAN_TIERS = {
  FREE: 'Free',
  PREMIUM: 'Premium',
  PRO: 'Pro'
};

export const PLAN_LIMITS = {
  [PLAN_TIERS.FREE]: {
    posts: 30,
    characters: 3000,
    categories: 1,
    features: {
      viewPosts: true,
      createPosts: true,
      advancedEditor: false,
      scheduledPosts: false,
      analytics: false,
      imageCustomization: false,
      multipleCategories: false,
      commentAndLike: false,
      readerAnalytics: false
    }
  },
  [PLAN_TIERS.PREMIUM]: {
    posts: 100, // Per month
    characters: 10000,
    categories: -1, // Multiple/Unlimited
    features: {
      viewPosts: true,
      createPosts: true,
      advancedEditor: true,
      scheduledPosts: true,
      analytics: true, // Now available for Premium
      imageCustomization: false,
      multipleCategories: true,
      commentAndLike: true,
      readerAnalytics: false // Only Pro gets detailed reader analytics
    }
  },
  [PLAN_TIERS.PRO]: {
    posts: 300, // Per month
    characters: 50000,
    categories: -1, // Unlimited
    features: {
      viewPosts: true,
      createPosts: true,
      advancedEditor: true,
      scheduledPosts: true,
      analytics: true,
      imageCustomization: true,
      multipleCategories: true,
      commentAndLike: true,
      readerAnalytics: true
    }
  }
};

export const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS[PLAN_TIERS.FREE];
};

export const getPlanTier = (userPlan) => {
  if (!userPlan) return PLAN_TIERS.FREE;
  
  // Handle plan object with planName property
  if (typeof userPlan === 'object' && userPlan.planName) {
    const planName = userPlan.planName.toString().toLowerCase();
    if (planName === 'pro') return PLAN_TIERS.PRO;
    if (planName === 'premium') return PLAN_TIERS.PREMIUM;
    if (planName === 'free') return PLAN_TIERS.FREE;
    return PLAN_TIERS.FREE;
  }
  
  // Handle plan object with tier property
  if (typeof userPlan === 'object' && userPlan.tier) {
    const tier = userPlan.tier.toString().toLowerCase();
    if (tier === 'pro') return PLAN_TIERS.PRO;
    if (tier === 'premium') return PLAN_TIERS.PREMIUM;
    if (tier === 'free') return PLAN_TIERS.FREE;
    return PLAN_TIERS.FREE;
  }
  
  // Handle string plan names
  if (typeof userPlan === 'string') {
    const planStr = userPlan.toLowerCase();
    if (planStr === 'pro') return PLAN_TIERS.PRO;
    if (planStr === 'premium') return PLAN_TIERS.PREMIUM;
    if (planStr === 'free') return PLAN_TIERS.FREE;
    return PLAN_TIERS.FREE;
  }
  
  return PLAN_TIERS.FREE;
};

export const getPlanInfo = (userPlan) => {
  const tier = getPlanTier(userPlan);
  return getPlanLimits(tier);
};

export const hasAdvancedEditor = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.advancedEditor;
};

export const hasScheduledPosts = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.scheduledPosts;
};

export const canCreatePost = (userPlan, currentPostCount = 0) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.posts === -1 || currentPostCount < limits.posts;
};

export const getCharacterLimit = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.characters;
};

export const isWithinCharacterLimit = (userPlan, content) => {
  const limit = getCharacterLimit(userPlan);
  return content.length <= limit;
};

export const getPostLimit = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.posts;
};

export const canSelectMultipleCategories = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.multipleCategories;
};

export const getUpgradePrompt = (userPlan, feature) => {
  const tier = getPlanTier(userPlan);
  if (tier === PLAN_TIERS.FREE) {
    return `Upgrade to Premium to access ${feature}`;
  }
  if (tier === PLAN_TIERS.PREMIUM) {
    return `Upgrade to Pro to access ${feature}`;
  }
  return null;
};

export const getUpgradeButton = (userPlan) => {
  const tier = getPlanTier(userPlan);
  if (tier === PLAN_TIERS.FREE) {
    return { text: 'Upgrade to Premium', plan: 'premium' };
  }
  if (tier === PLAN_TIERS.PREMIUM) {
    return { text: 'Upgrade to Pro', plan: 'pro' };
  }
  return null;
};

export const getPlanBadge = (userPlan) => {
  const tier = getPlanTier(userPlan);
  switch (tier) {
    case PLAN_TIERS.FREE:
      return { 
        color: 'bg-gray-100 text-gray-100', 
        text: 'Free Plan',
        icon: '📦'
      };
    case PLAN_TIERS.PREMIUM:
      return { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Premium Plan',
        icon: '⭐'
      };
    case PLAN_TIERS.PRO:
      return { 
        color: 'bg-purple-100 text-purple-800', 
        text: 'Pro Plan',
        icon: '👑'
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-100', 
        text: 'Free Plan',
        icon: '📦'
      };
  }
};

export const getRequiredPlanForFeature = (feature) => {
  if (PLAN_LIMITS[PLAN_TIERS.FREE].features[feature]) return PLAN_TIERS.FREE;
  if (PLAN_LIMITS[PLAN_TIERS.PREMIUM].features[feature]) return PLAN_TIERS.PREMIUM;
  if (PLAN_LIMITS[PLAN_TIERS.PRO].features[feature]) return PLAN_TIERS.PRO;
  return PLAN_TIERS.PRO;
};

export const getCharacterStatus = (userPlan, content) => {
  const limit = getCharacterLimit(userPlan);
  const currentCount = content.length;
  const remaining = limit - currentCount;
  const percentage = (currentCount / limit) * 100;
  
  return {
    current: currentCount,
    limit: limit,
    remaining: remaining,
    percentage: percentage,
    isOverLimit: currentCount > limit,
    isNearLimit: percentage > 80
  };
};

export const hasFeatureAccess = (userPlan, feature) => {
  // Handle specific features with dedicated functions that support backend data
  if (feature === 'analytics' || feature === 'advancedAnalytics') {
    return hasAnalytics(userPlan);
  }
  if (feature === 'reader_analytics' || feature === 'readersAnalytics') {
    return hasReaderAnalytics(userPlan);
  }
  
  // For backend plan objects, check direct properties
  if (typeof userPlan === 'object' && userPlan) {
    // Map frontend feature names to backend properties
    const backendPropertyMap = {
      'scheduled_posts': 'scheduledPosts',
      'comment_and_like': 'canComment',
      'image_customization': 'imageCustomization',
      'advanced_editor': 'advancedEditor',
      'advancedAnalytics': 'analytics'
    };
    
    const backendProperty = backendPropertyMap[feature] || feature;
    if (userPlan[backendProperty] !== undefined) {
      return userPlan[backendProperty];
    }
  }
  
  // Fallback to static plan definitions
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features[feature] || false;
};

// Additional feature access functions
export const hasCommentAndLike = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.commentAndLike;
};

export const hasAnalytics = (userPlan) => {
  // First check if the plan object itself has advancedAnalytics property (backend data)
  if (typeof userPlan === 'object' && userPlan?.advancedAnalytics === true) {
    return true;
  }
  
  // If plan object has tier property, check against that
  if (typeof userPlan === 'object' && userPlan?.tier) {
    const tier = userPlan.tier.toString().toLowerCase();
    return tier === 'premium' || tier === 'pro';
  }
  
  // If plan object has planName property, check against that
  if (typeof userPlan === 'object' && userPlan?.planName) {
    const planName = userPlan.planName.toString().toLowerCase();
    return planName === 'premium' || planName === 'pro';
  }
  
  // Fallback to static plan definitions
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.analytics;
};

export const hasReaderAnalytics = (userPlan) => {
  // First check if the plan object itself has readersAnalytics property (backend data)
  if (typeof userPlan === 'object' && userPlan?.readersAnalytics === true) {
    return true;
  }
  
  // If plan object has tier property, check against that (only Pro has reader analytics)
  if (typeof userPlan === 'object' && userPlan?.tier) {
    const tier = userPlan.tier.toString().toLowerCase();
    return tier === 'pro';
  }
  
  // If plan object has planName property, check against that
  if (typeof userPlan === 'object' && userPlan?.planName) {
    const planName = userPlan.planName.toString().toLowerCase();
    return planName === 'pro';
  }
  
  // Fallback to static plan definitions
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.readerAnalytics;
};

export const hasImageCustomization = (userPlan) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.features.imageCustomization;
};

export const canCreateMorePosts = (userPlan, currentPostCount) => {
  const tier = getPlanTier(userPlan);
  const limits = getPlanLimits(tier);
  return limits.posts === -1 || currentPostCount < limits.posts;
};
