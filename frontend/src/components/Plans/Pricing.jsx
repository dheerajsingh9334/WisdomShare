import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Static plans configuration
const STATIC_PLANS = [
  {
    _id: "free",
    planName: "Free",
    tier: "free",
    price: 0,
    postLimit: 1,
    characterLimit: 1500,
    aiWordLimit: 300,
    features: [
      "1 post per day",
      "View posts",
      "Single category selection",
      "Up to 1,500 characters per post",
      "AI Blog Writer (up to 300 words)",
      "AI Semantic Search",
      "Guest AI Chatbot",
    ],
  },
  {
    _id: "premium",
    planName: "Premium",
    tier: "premium",
    price: 9.99,
    postLimit: 3,
    characterLimit: 5000,
    aiWordLimit: 900,
    features: [
      "3 posts per day",
      "View, Comment & Like posts",
      "Multiple categories selection",
      "Up to 5,000 characters per post",
      "Scheduled Posts",
      "AI Blog Writer + Refine (up to 900 words)",
      "AI Summarize Blogs",
    ],
  },
  {
    _id: "pro",
    planName: "Pro",
    tier: "pro",
    price: 99.99,
    postLimit: 5,
    characterLimit: 10000,
    aiWordLimit: 1500,
    features: [
      "5 posts per day",
      "View, Comment & Like posts",
      "Multiple categories selection",
      "Up to 10,000 characters per post",
      "Scheduled Posts",
      "Advanced analytics",
      "AI Blog Writer + Refine (up to 1,500 words)",
      "Priority AI task processing",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handlePlanSelection = (plan) => {
    const identifier = plan?._id || plan?.tier || plan?.planName;
    if (!identifier) {
      console.error("Plan identifier not found:", plan);
      return;
    }
    if (plan.tier === "free" || plan.planName === "Free") {
      navigate("/free-subscription");
    } else {
      navigate(`/checkout/${identifier}`, { state: { planCandidate: plan } });
    }
  };

  // Use static plans directly
  const freePlan = STATIC_PLANS[0];
  const premiumPlan = STATIC_PLANS[1];
  const proPlan = STATIC_PLANS[2];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start for free, no credit card required. Upgrade when you're ready
            to unlock more features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {freePlan?.planName || "Free"}
              </h3>
              {freePlan?.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  {freePlan.description}
                </p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  $0
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  /month
                </span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {freePlan?.postLimit
                    ? `${freePlan.postLimit} post/day`
                    : "Limited posts"}
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(freePlan)}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              >
                Get Started Free
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                What's included:
              </h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(
                  freePlan?.features || [
                    "1 post per day",
                    "View posts",
                    "Single category selection",
                    "Up to 1,500 characters per post",
                    "AI Blog Writer (up to 300 words)",
                    "AI Semantic Search",
                    "Guest AI Chatbot",
                  ]
                ).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 relative transform scale-105">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {premiumPlan?.planName || "Premium"}
              </h3>
              {premiumPlan?.description && (
                <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
                  {premiumPlan.description}
                </p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  ${premiumPlan?.price || "9.99"}
                </span>
                <span className="text-green-100 text-sm sm:text-base">
                  /month
                </span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white/20 text-xs sm:text-sm text-white mr-2">
                  {premiumPlan?.postLimit || 3} posts/day
                </span>
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white text-green-600 text-xs font-semibold">
                  PREMIUM
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(premiumPlan)}
                disabled={!premiumPlan?._id}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-green-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {premiumPlan?._id ? "Start Premium" : "Loading..."}
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
                What's included:
              </h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(
                  premiumPlan?.features || [
                    "3 posts per day",
                    "View, Comment & Like posts",
                    "Multiple categories selection",
                    "Up to 5,000 characters per post",
                    "Scheduled Posts",
                    "AI Blog Writer + Refine (up to 900 words)",
                    "AI Summarize Blogs",
                  ]
                ).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 mr-2 sm:mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-100 text-xs sm:text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                PRO
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {proPlan?.planName || "Pro"}
              </h3>
              {proPlan?.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  {proPlan.description}
                </p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  ${proPlan?.price || "99.99"}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  /month
                </span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm">
                  {proPlan?.postLimit || 5} posts/day + full AI suite
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(proPlan)}
                disabled={!proPlan?._id}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {proPlan?._id ? "Start Pro" : "Loading..."}
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                What's included:
              </h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(
                  proPlan?.features || [
                    "5 posts per day",
                    "View, Comment & Like posts",
                    "Multiple categories selection",
                    "Up to 10,000 characters per post",
                    "Scheduled Posts",
                    "Advanced analytics",
                    "AI Blog Writer + Refine (up to 1,500 words)",
                    "Priority AI task processing",
                  ]
                ).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens to my posts if I downgrade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your existing posts remain accessible. You'll only be limited on
                creating new posts based on your plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
