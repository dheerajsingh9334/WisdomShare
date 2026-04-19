import { useQuery } from "@tanstack/react-query";
import { getUserPlanAndUsageAPI } from "../APIServices/users/usersAPI";
import { 
  getPlanTier, 
  getPlanInfo, 
  canCreatePost, 
  hasFeatureAccess,
  PLAN_TIERS 
} from "../utils/planUtils";

export const usePlanAccess = () => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchOnWindowFocus: true,
  });

  const usage = usageData?.usage;
  const userPlan = usage?.plan;
  const userPosts = usage?.posts?.current || 0;
  
  // Get plan information
  const planTier = getPlanTier(userPlan);
  const planInfo = getPlanInfo(userPlan);
  const canPost = canCreatePost(userPlan, userPosts);

  // Check if user can access specific features
  const canAccessFeature = (feature) => {
    return hasFeatureAccess(userPlan, feature);
  };

  // Check if user can create posts
  const canCreateNewPost = () => {
    return canPost;
  };

  // Get post usage information
  const getPostUsage = () => {
    const postLimit = usage?.posts?.limit || planInfo?.postLimit;
    const postsUsed = userPosts;
    const postsRemaining = postLimit ? postLimit - postsUsed : null;
    const usagePercentage = postLimit ? (postsUsed / postLimit) * 100 : 0;
    const isLimitReached = postLimit ? postsUsed >= postLimit : false;
    const isApproachingLimit = postLimit ? postsUsed >= postLimit * 0.8 && postsUsed < postLimit : false;

    return {
      postLimit,
      postsUsed,
      postsRemaining,
      usagePercentage,
      isLimitReached,
      isApproachingLimit,
      isUnlimited: usage?.posts?.unlimited || !postLimit
    };
  };

  // Check if user needs to upgrade for a specific feature
  const needsUpgradeFor = (feature) => {
    if (canAccessFeature(feature)) return null;

    // Determine which plan is needed
    if (feature === "create_post" && planTier === PLAN_TIERS.FREE) {
      return "Premium";
    }
    
    if (feature === "team_collaboration" || feature === "api_access") {
      return "Pro";
    }
    
    if (feature === "advanced_analytics" || feature === "seo_tools" || feature === "content_calendar") {
      // Pro users already have access to analytics
      if (planTier === PLAN_TIERS.PRO) {
        return null;
      }
      return "Premium";
    }

    return "Premium";
  };

  // Get upgrade prompt for a feature
  const getUpgradePrompt = (feature) => {
    const requiredPlan = needsUpgradeFor(feature);
    if (!requiredPlan) return null;

    return {
      feature,
      requiredPlan,
      currentPlan: planTier,
      message: `Upgrade to ${requiredPlan} to access ${feature}`,
      upgradeUrl: "/pricing"
    };
  };

  // Check if user is approaching post limit
  const isApproachingPostLimit = () => {
    const { isApproachingLimit } = getPostUsage();
    return isApproachingLimit;
  };

  // Check if user has reached post limit
  const hasReachedPostLimit = () => {
    const { isLimitReached } = getPostUsage();
    return isLimitReached;
  };

  // Get plan badge information
  const getPlanBadge = () => {
    const badges = {
      [PLAN_TIERS.FREE]: {
        text: 'FREE',
        className: 'bg-gray-100 text-gray-700 bg-white/5 dark:text-gray-300',
        color: 'gray'
      },
      [PLAN_TIERS.PREMIUM]: {
        text: 'PREMIUM',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        color: 'green'
      },
      [PLAN_TIERS.PRO]: {
        text: 'PRO',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        color: 'indigo'
      }
    };
    
    return badges[planTier] || badges[PLAN_TIERS.FREE];
  };

  // Get upgrade button information
  const getUpgradeButton = () => {
    if (planTier === PLAN_TIERS.PRO) return null;
    
    const buttons = {
      [PLAN_TIERS.FREE]: {
        text: 'Upgrade to Premium',
        href: '/pricing',
        className: 'bg-green-600 hover:bg-green-700 text-white',
        color: 'green'
      },
      [PLAN_TIERS.PREMIUM]: {
        text: 'Upgrade to Pro',
        href: '/pricing',
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        color: 'indigo'
      }
    };
    
    return buttons[planTier] || null;
  };

  return {
    // Data
    userPlan,
    planTier,
    planInfo,
    userPosts,
    usage,
    
    // Feature access
    canAccessFeature,
    canCreateNewPost,
    
    // Usage information
    getPostUsage,
    isApproachingPostLimit,
    hasReachedPostLimit,
    
    // Upgrade information
    needsUpgradeFor,
    getUpgradePrompt,
    getPlanBadge,
    getUpgradeButton,
    
    // Loading states
    isLoading,
    error
  };
};
