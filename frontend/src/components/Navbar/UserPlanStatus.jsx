import { useQuery } from "@tanstack/react-query";
import { getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { getPlanBadge, getUpgradeButton } from "../../utils/planUtils";
import { Link } from "react-router-dom";
import { FaCrown, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { useSelector } from "react-redux";
const UserPlanStatus = () => {
  const { userAuth } = useSelector((state) => state.auth);
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!userAuth, // Only fetch if user is logged in
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-4 w-20 "></div>
      </div>
    );
  }

  // If there's an error but we have userAuth, try to show the plan from auth state
  if (error || !usageData?.usage) {
    if (userAuth?.plan) {
      const planName = typeof userAuth.plan === 'string' ? userAuth.plan : (userAuth.plan?.planName || 'Free');
      return (
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30">
            {planName}
          </div>
        </div>
      );
    }
    return null;
  }

  const { usage } = usageData;
  const { plan, posts } = usage;
  const planBadge = getPlanBadge(plan);
  const upgradeButton = getUpgradeButton(plan);
  const isFreePlan = (plan?.tier?.toLowerCase?.() === 'free') || (/^free$/i.test(plan?.planName || ''));
  
  // Check if user is approaching or has reached limit
  const isNearLimit = posts.unlimited ? false : posts.current >= posts.limit * 0.8;
  const hasReachedLimit = posts.unlimited ? false : posts.current >= posts.limit;

  return (
    <div className="flex items-center space-x-2">
      {/* Plan Badge - Always show current plan */}
      <div className={`inline-flex items-center px-2 py-1 rounded-none text-xs font-medium border ${planBadge.className}`}>
        {plan.tier === 'pro' && <FaCrown className="mr-1" />}
        {plan.tier === 'premium' && <FaChartLine className="mr-1" />}
        {planBadge.text}
      </div>

      {/* Usage Status for non-unlimited plans */}
      {!posts.unlimited && (
        <div className="flex items-center space-x-1">
          <div className="text-xs text-gray-400">
            {posts.current}/{posts.limit}
          </div>
          {hasReachedLimit && (
            <FaExclamationTriangle className="text-red-500 text-xs" title="Post limit reached" />
          )}
          {isNearLimit && !hasReachedLimit && (
            <FaExclamationTriangle className="text-yellow-500 text-xs" title="Approaching post limit" />
          )}
        </div>
      )}

      {/* Upgrade Button for Free plan only */}
      {isFreePlan && upgradeButton && (
        <Link
          to="/dashboard/plan-management"
          className={`inline-flex items-center px-2 py-1 rounded-none text-xs font-medium text-white ${upgradeButton.className} hover:opacity-90 transition-opacity`}
        >
          {upgradeButton.text}
        </Link>
      )}
    </div>
  );
};

export default UserPlanStatus;
