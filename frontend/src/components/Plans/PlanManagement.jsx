import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPlansAPI } from "../../APIServices/plans/plans";
import { getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { getPlanBadge } from "../../utils/planUtils";
import { r } from "../../utils/unifiedResponsive";
import {
  FaCrown,
  FaChartLine,
  FaGift,
  FaCheck,
  FaExclamationTriangle,
  FaStar,
  FaRocket,
  FaUsers,
  FaChartBar,
  FaCog,
  FaInfinity,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaCreditCard,
  FaShieldAlt,
  FaSync,
  FaQuestionCircle,
  FaCalendarAlt,
  FaClock,
  FaUserCheck,
  FaBell,
  FaCalendar,
} from "react-icons/fa";

const PlanManagement = () => {
  const {
    data: plansData,
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ["pricing-lists"],
    queryFn: fetchPlansAPI,
  });

  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchOnWindowFocus: true,
  });

  if (plansLoading || usageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading plans...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const plans = plansData?.plans || [];
  const usage = usageData?.usage;
  const currentPlan = usage?.plan;
  const currentPlanBadge = currentPlan ? getPlanBadge(currentPlan) : null;

  // Get plans by tier
  const freePlan = plans.find(
    (plan) => plan.tier === "free" || plan.planName === "Free",
  );
  const premiumPlan = plans.find(
    (plan) => plan.tier === "premium" || plan.planName === "Premium",
  );
  const proPlan = plans.find(
    (plan) => plan.tier === "pro" || plan.planName === "Pro",
  );

  const getPlanIcon = (tier) => {
    switch (tier) {
      case "pro":
        return <FaCrown className="text-yellow-500" />;
      case "premium":
        return <FaChartLine className="text-green-500" />;
      case "free":
        return <FaGift className="text-blue-500" />;
      default:
        return <FaStar className="text-gray-500" />;
    }
  };

  const getPlanFeatures = (plan) => {
    if (!plan?.features) return [];
    return Array.isArray(plan.features) ? plan.features : [];
  };

  const canUpgrade = (currentTier) => {
    if (!currentTier) return true;
    const tierOrder = ["free", "premium", "pro"];
    const currentIndex = tierOrder.indexOf(currentTier.toLowerCase());
    return currentIndex < tierOrder.length - 1;
  };

  const canDowngrade = (currentTier) => {
    if (!currentTier) return false;
    const tierOrder = ["free", "premium", "pro"];
    const currentIndex = tierOrder.indexOf(currentTier.toLowerCase());
    return currentIndex > 0;
  };

  const getUpgradePlan = (currentTier) => {
    if (!currentTier) return premiumPlan;
    const tierOrder = ["free", "premium", "pro"];
    const currentIndex = tierOrder.indexOf(currentTier.toLowerCase());
    if (currentIndex < tierOrder.length - 1) {
      return plans.find((plan) => plan.tier === tierOrder[currentIndex + 1]);
    }
    return null;
  };

  const getDowngradePlan = (currentTier) => {
    if (!currentTier) return null;
    const tierOrder = ["free", "premium", "pro"];
    const currentIndex = tierOrder.indexOf(currentTier.toLowerCase());
    if (currentIndex > 0) {
      return plans.find((plan) => plan.tier === tierOrder[currentIndex - 1]);
    }
    return null;
  };

  const upgradePlan = getUpgradePlan(currentPlan?.tier);
  const downgradePlan = getDowngradePlan(currentPlan?.tier);

  // Mock billing history data (replace with actual API call)
  const billingHistory = [
    {
      id: 1,
      date: "2024-01-15",
      amount: "$29.00",
      status: "Paid",
      plan: "Premium",
      invoice: "INV-001",
    },
    {
      id: 2,
      date: "2023-12-15",
      amount: "$29.00",
      status: "Paid",
      plan: "Premium",
      invoice: "INV-002",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1
            className={`${r.text.h1} font-serif text-gray-900 dark:text-white mb-4 sm:mb-6`}
          >
            Plan Management
          </h1>
          <p
            className={`${r.text.bodyLarge} text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2`}
          >
            Manage your subscription and explore upgrade options to unlock more
            features.
          </p>

          {/* Refresh Button */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => {
                refetchPlans();
                refetchUsage();
              }}
              className={`${r.components.button.primary} inline-flex items-center`}
            >
              <FaSync className="mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Current Plan Status */}
        {usage && (
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <h2
                  className={`${r.text.h2} text-gray-900 dark:text-white mb-2`}
                >
                  Current Plan Status
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {getPlanIcon(currentPlan?.tier)}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full ${r.text.bodySmall} font-medium ${currentPlanBadge?.className}`}
                  >
                    {currentPlanBadge?.text}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {currentPlan?.planName || "Free Plan"}
                  </span>
                </div>
              </div>

              {/* Usage Progress */}
              {!usage.posts.unlimited && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Post Usage</span>
                    <span>
                      {usage.posts.current}/{usage.posts.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        usage.posts.current >= usage.posts.limit
                          ? "bg-red-500"
                          : usage.posts.current >= usage.posts.limit * 0.8
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((usage.posts.current / usage.posts.limit) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  {usage.posts.current >= usage.posts.limit && (
                    <div className="mt-2 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                      <FaExclamationTriangle />
                      <span className="text-sm font-medium">
                        Post limit reached! Consider upgrading.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Posts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`${r.text.h4} text-gray-900 dark:text-white`}>
                    Posts
                  </h3>
                  <span
                    className={`${r.text.bodySmall} text-gray-500 dark:text-gray-400`}
                  >
                    {usage.posts.current} /{" "}
                    {usage.posts.unlimited ? "∞" : usage.posts.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usage.posts.unlimited
                        ? "bg-green-500"
                        : usage.posts.current >= usage.posts.limit
                          ? "bg-red-500"
                          : usage.posts.current >= usage.posts.limit * 0.8
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                    }`}
                    style={{
                      width: usage.posts.unlimited
                        ? "100%"
                        : `${Math.min((usage.posts.current / usage.posts.limit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p
                  className={`${r.text.bodySmall} text-gray-600 dark:text-gray-400 mt-2`}
                >
                  {usage.posts.unlimited
                    ? "Unlimited posts available"
                    : `${usage.posts.limit - usage.posts.current} posts remaining`}
                </p>
              </div>

              {/* Plan Actions */}
              <div className="flex flex-col sm:flex-wrap justify-center gap-3 sm:gap-4 mt-6">
                {canUpgrade(currentPlan?.tier) && upgradePlan && (
                  <Link
                    to={`/checkout/${upgradePlan._id}`}
                    className={`${r.components.button.success} inline-flex items-center justify-center`}
                  >
                    <FaArrowUp className="mr-2" />
                    Upgrade to {upgradePlan.planName}
                  </Link>
                )}

                {canDowngrade(currentPlan?.tier) && downgradePlan && (
                  <Link
                    to={`/checkout/${downgradePlan._id}`}
                    className={`${r.components.button.secondary} inline-flex items-center justify-center`}
                  >
                    <FaArrowDown className="mr-2" />
                    Downgrade to {downgradePlan.planName}
                  </Link>
                )}
                <Link
                  to="/dashboard/content-calendar"
                  className={`${r.components.button.outline} inline-flex items-center justify-center`}
                >
                  <FaCalendar className="mr-2" />
                  Content Calendar
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <h2
              className={`${r.text.h2} text-gray-900 dark:text-white text-center mb-6 sm:mb-8`}
            >
              Billing History
            </h2>
            {billingHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                        Date
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                        Amount
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                        Plan
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            {item.date}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-900 dark:text-white font-semibold">
                          {item.amount}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-600 dark:text-gray-400">
                          {item.plan}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-600 dark:text-gray-400">
                          {item.invoice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No billing history available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FaGift className="text-2xl sm:text-3xl text-blue-500 mr-3" />
                <h3 className={`${r.text.h3} text-gray-900 dark:text-white`}>
                  Free
                </h3>
              </div>
              <div className="mb-4 sm:mb-6">
                <span
                  className={`${r.text.h1} font-bold text-gray-900 dark:text-white`}
                >
                  $0
                </span>
                <span
                  className={`${r.text.body} text-gray-600 dark:text-gray-400`}
                >
                  /month
                </span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${r.text.bodySmall} text-gray-700 dark:text-gray-300`}
                >
                  Limit: 1 post/day
                </span>
              </div>
              <Link
                to="/free-subscription"
                className={`w-full inline-flex items-center justify-center ${r.components.button.outline}`}
              >
                Get Started Free
              </Link>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4
                className={`font-semibold text-gray-900 dark:text-white mb-4 flex items-center ${r.text.h4}`}
              >
                <FaCheck className="text-green-500 mr-2" />
                What's included:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    1 post per day
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    View posts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Single category selection
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Up to 1,500 characters per post
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    AI Blog Writer (up to 300 words)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FaChartLine className="text-2xl sm:text-3xl text-white mr-3" />
                <h3 className={`${r.text.h3} text-white`}>Premium</h3>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className={`${r.text.h1} font-bold text-white`}>
                  $9.99
                </span>
                <span className={`${r.text.body} text-green-100`}>/month</span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm text-white mr-2">
                  <FaInfinity className="mr-1" />
                </span>
              </div>
              <Link
                to={`/checkout/${premiumPlan?._id || "premium"}`}
                className={`w-full inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition duration-200`}
              >
                Start Premium
              </Link>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4
                className={`font-semibold text-white mb-4 flex items-center ${r.text.h4}`}
              >
                <FaCheck className="text-green-200 mr-2" />
                What's included:
              </h4>
              <ul className="space-y-3">
                {/* <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>Up to 100 posts</span>
                </li> */}
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    3 posts per day
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    View, Comment & Like posts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    Multiple categories selection
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    Up to 5,000 characters per post
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    Scheduled Posts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-green-200 mr-3 flex-shrink-0" />
                  <span className={`text-green-100 ${r.text.bodySmall}`}>
                    AI Writer + Refine (up to 900 words)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                PRO
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FaCrown className="text-2xl sm:text-3xl text-yellow-500 mr-3" />
                <h3 className={`${r.text.h3} text-gray-900 dark:text-white`}>
                  Pro
                </h3>
              </div>
              <div className="mb-4 sm:mb-6">
                <span
                  className={`${r.text.h1} font-bold text-gray-900 dark:text-white`}
                >
                  $99.99
                </span>
                <span
                  className={`${r.text.body} text-gray-600 dark:text-gray-400`}
                >
                  /month
                </span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ${r.text.bodySmall}`}
                >
                  <FaRocket className="mr-1" />
                </span>
              </div>
              <Link
                to={`/checkout/${proPlan?._id || "pro"}`}
                className={`w-full inline-flex items-center justify-center ${r.components.button.primary}`}
              >
                Start Pro
              </Link>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4
                className={`font-semibold text-gray-900 dark:text-white mb-4 flex items-center ${r.text.h4}`}
              >
                <FaCheck className="text-indigo-500 mr-2" />
                What's included:
              </h4>
              <ul className="space-y-3">
                {/* <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}>Up to 300 posts</span>
                </li> */}
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    5 posts per day
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    View, Comment & Like posts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Multiple categories selection
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Up to 10,000 characters per post
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Scheduled Posts
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    Advanced analytics
                  </span>
                </li>
                <li className="flex items-center">
                  <FaCheck className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${r.text.bodySmall}`}
                  >
                    AI Writer + Refine (up to 1,500 words)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="max-w-7xl mx-auto mb-12 sm:mb-16">
          <div className={`${r.layout.grid3} gap-6 sm:gap-8`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 text-center">
              <FaShieldAlt className="text-3xl sm:text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className={`${r.text.h4} text-gray-900 dark:text-white mb-2`}>
                Secure Payments
              </h3>
              <p className={`${r.text.body} text-gray-600 dark:text-gray-400`}>
                All payments are processed securely through Stripe with
                industry-standard encryption.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 text-center">
              <FaSync className="text-3xl sm:text-4xl text-green-500 mx-auto mb-4" />
              <h3 className={`${r.text.h4} text-gray-900 dark:text-white mb-2`}>
                Flexible Plans
              </h3>
              <p className={`${r.text.body} text-gray-600 dark:text-gray-400`}>
                Upgrade or downgrade your plan at any time. Changes take effect
                immediately.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 text-center">
              <FaQuestionCircle className="text-3xl sm:text-4xl text-purple-500 mx-auto mb-4" />
              <h3 className={`${r.text.h4} text-gray-900 dark:text-white mb-2`}>
                24/7 Support
              </h3>
              <p className={`${r.text.body} text-gray-600 dark:text-gray-400`}>
                Get help whenever you need it with our comprehensive support
                system.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2
            className={`${r.text.h2} text-gray-900 dark:text-white mb-6 sm:mb-8`}
          >
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              to="/dashboard"
              className={`${r.components.button.secondary} inline-flex items-center justify-center`}
            >
              <FaCog className="mr-2" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`${r.components.button.primary} inline-flex items-center justify-center`}
            >
              <FaUsers className="mr-2" />
              Profile
            </Link>
            {/* Earnings removed */}
            <Link
              to="/pricing"
              className={`${r.components.button.outline} inline-flex items-center justify-center`}
            >
              <FaCreditCard className="mr-2" />
              View All Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
