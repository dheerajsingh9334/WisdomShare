import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaCrown, FaChartLine, FaInfinity } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { userProfileAPI } from "../../APIServices/users/usersAPI";
import { getPlanTier, getPlanInfo, PLAN_TIERS } from "../../utils/planUtils";

const PostLimitReached = () => {
  const { data: userData } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  const userPlan = userData?.user?.plan;
  const userPosts = userData?.user?.posts?.length || 0;
  
  // Get plan information
  const planTier = getPlanTier(userPlan);
  const planInfo = getPlanInfo(userPlan);
  
  // Calculate plan usage
  const postLimit = planInfo?.postLimit;
  const postsUsed = userPosts;
  const postsRemaining = postLimit ? postLimit - postsUsed : null;
  const usagePercentage = postLimit ? (postsUsed / postLimit) * 100 : 0;

  const upgradePlans = [
    {
      name: "Premium",
      tier: "premium",
      price: "$29",
      period: "month",
      description: "Unlimited posts & advanced features",
      features: [
        "Unlimited posts",
        "Advanced features",
        "Priority support"
      ],
      color: "green",
      icon: <FaChartLine className="text-2xl" />
    },
    {
      name: "Pro",
      tier: "pro",
      price: "$99",
      period: "month",
      description: "Everything unlimited + team features",
      features: [
        "All Premium features",
        "Team collaboration",
        "API access",
        "Dedicated support"
      ],
      color: "indigo",
      icon: <FaInfinity className="text-2xl" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-8 text-center">
          {/* Warning Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Post Limit Reached
          </h1>

          {/* Current Plan Status */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              {planTier === PLAN_TIERS.PRO && <FaCrown className="text-yellow-500" />}
              {planTier === PLAN_TIERS.PREMIUM && <FaChartLine className="text-green-500" />}
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
            <p className="text-gray-400">
              Current Plan: {planInfo?.name || 'Free Plan'}
            </p>
          </div>

          {/* Usage Progress */}
          {!planInfo?.postLimit && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Post Usage</span>
                <span>{postsUsed} / {postLimit || 'Unlimited'}</span>
              </div>
              <div className="w-full bg-gray-200 bg-white/5 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-red-500 transition-all duration-300"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                You've reached your post limit of {postLimit} posts.
              </p>
            </div>
          )}

          {/* Upgrade Options */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Upgrade Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upgradePlans.map((plan) => (
                <div key={plan.tier} className={`bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600  p-6 text-white relative overflow-hidden`}>
                  {/* Popular Badge */}
                  {plan.tier === "premium" && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm opacity-90 mb-3">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm opacity-90">/{plan.period}</span>
                    </div>
                    
                    {/* Features List */}
                    <ul className="text-left text-sm space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-green-300 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link
                      to={`/checkout/${plan.tier}`}
                      className={`inline-block w-full py-3 px-4 bg-black/40 backdrop-blur-md text-white text-${plan.color}-600  font-semibold hover:bg-gray-50 transition-colors duration-200`}
                    >
                      Start {plan.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white  hover:bg-green-700 transition-colors font-medium"
            >
              <FaCrown className="mr-2" />
              View All Plans
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
            <p className="mt-1">Your existing posts will remain accessible after upgrading.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLimitReached;
