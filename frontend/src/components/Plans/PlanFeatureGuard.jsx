import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { hasFeatureAccess, getPlanTier, PLAN_TIERS } from "../../utils/planUtils";
import { FaExclamationTriangle, FaCrown, FaChartLine, FaLock } from "react-icons/fa";

const PlanFeatureGuard = ({ 
  children, 
  feature = "basic_feature",
  fallback = null,
  showUpgradePrompt = true 
}) => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !usageData?.usage) {
    return fallback || (
      <div className="text-center text-red-600 dark:text-red-400 p-4">
        <p>Error loading plan information. Please try again.</p>
      </div>
    );
  }

  const { usage } = usageData;
  const { plan } = usage;
  const planTier = getPlanTier(plan);

  // Check if user can access the feature
  const canAccess = hasFeatureAccess(plan, feature);

  if (canAccess) {
    return children;
  }

  // If fallback is provided, use it
  if (fallback) {
    return fallback;
  }

  // If upgrade prompt is disabled, return null
  if (!showUpgradePrompt) {
    return null;
  }

  // Determine which plan is needed for this feature
  const getRequiredPlan = () => {
    if (planTier === PLAN_TIERS.FREE) {
      return "Premium";
    }
    if (planTier === PLAN_TIERS.PREMIUM) {
      return "Pro";
    }
    return "Pro";
  };

  const requiredPlan = getRequiredPlan();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900  border border-white/10 border-white/10 p-6 text-center">
      {/* Lock Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 bg-gray-200 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <FaLock className="text-2xl text-gray-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Feature Locked
      </h3>

      {/* Description */}
      <p className="text-gray-400 mb-4">
        This feature requires a {requiredPlan} plan or higher.
      </p>

      {/* Current Plan Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          planTier === PLAN_TIERS.PRO 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
            : planTier === PLAN_TIERS.PREMIUM
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 bg-white/5 dark:text-gray-300'
        }`}>
          {planTier === PLAN_TIERS.PRO ? 'PRO' : planTier === PLAN_TIERS.PREMIUM ? 'PREMIUM' : 'FREE'}
        </span>
      </div>

      {/* Upgrade Button */}
      <Link
        to="/pricing"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Upgrade to {requiredPlan}
      </Link>
    </div>
  );
};

export default PlanFeatureGuard;
