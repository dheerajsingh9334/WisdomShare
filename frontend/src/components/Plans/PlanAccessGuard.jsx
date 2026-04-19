import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserPlanAndUsageAPI } from "../../APIServices/users/usersAPI";
import { canCreatePost } from "../../utils/planUtils";
import { FaExclamationTriangle, FaCrown, FaChartLine } from "react-icons/fa";

const PlanAccessGuard = ({ children, feature = "create_post" }) => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Checking plan access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !usageData?.usage) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Error loading plan information. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const { usage } = usageData;
  const { plan, posts } = usage;

  // Check if user can access the feature
  let canAccess = true;
  let restrictionMessage = "";
  let upgradeRequired = false;

  if (feature === "create_post") {
    canAccess = canCreatePost(plan, posts.current);
    if (!canAccess) {
      restrictionMessage = `You've reached your post limit of ${posts.limit} posts.`;
      upgradeRequired = true;
    }
  }

  if (canAccess) {
    return children;
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-8 text-center">
          {/* Warning Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Plan Limit Reached
          </h1>

          {/* Current Plan Status */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              {plan.tier === 'pro' && <FaCrown className="text-yellow-500" />}
              {plan.tier === 'premium' && <FaChartLine className="text-green-500" />}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                plan.tier === 'pro' 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : plan.tier === 'premium'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 bg-white/5 dark:text-gray-300'
              }`}>
                {plan.tier === 'pro' ? 'PRO' : plan.tier === 'premium' ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
            <p className="text-gray-400">
              Current Plan: {plan.planName || 'Free Plan'}
            </p>
          </div>

          {/* Usage Progress */}
          {!posts.unlimited && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Post Usage</span>
                <span>{posts.current}/{posts.limit}</span>
              </div>
              <div className="w-full bg-gray-200 bg-white/5 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-red-500 transition-all duration-300"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                {restrictionMessage}
              </p>
            </div>
          )}

          {/* Upgrade Options */}
          {upgradeRequired && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Upgrade Your Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-green-500 to-green-600  p-4 text-white">
                  <h3 className="font-semibold mb-2">Premium</h3>
                  <p className="text-sm text-green-100 mb-2">Unlimited posts</p>
                  <p className="text-lg font-bold">$29/month</p>
                </div>
                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600  p-4 text-white">
                  <h3 className="font-semibold mb-2">Pro</h3>
                  <p className="text-sm text-indigo-100 mb-2">Everything unlimited</p>
                  <p className="text-lg font-bold">$99/month</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard/plan-management"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white  hover:bg-green-700 transition-colors font-medium"
            >
              <FaCrown className="mr-2" />
              Manage Plan
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white  hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-sm text-gray-400">
            <p>Need help? Contact our support team for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanAccessGuard;

