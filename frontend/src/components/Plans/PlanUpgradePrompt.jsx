import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaCrown, FaChartLine, FaInfinity } from "react-icons/fa";
import { getPlanTier, PLAN_TIERS } from "../../utils/planUtils";

const PlanUpgradePrompt = ({ 
  feature, 
  currentPlan, 
  requiredPlan = "Premium", 
  className = "",
  showIcon = true,
  variant = "default" // "default", "compact", "banner"
}) => {
  const planTier = getPlanTier(currentPlan);
  
  const getPlanIcon = (plan) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return <FaInfinity className="text-indigo-500" />;
      case 'premium':
        return <FaChartLine className="text-green-500" />;
      default:
        return <FaCrown className="text-yellow-500" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return 'indigo';
      case 'premium':
        return 'green';
      default:
        return 'yellow';
    }
  };

  const getPlanPrice = (plan) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return '$99';
      case 'premium':
        return '$29';
      default:
        return '$0';
    }
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <FaLock className="text-gray-400" />
        <span className="text-gray-400">
          Requires {requiredPlan}
        </span>
        <Link
          to="/pricing"
          className={`px-2 py-1 bg-${getPlanColor(requiredPlan)}-600 hover:bg-${getPlanColor(requiredPlan)}-700 text-white text-xs  transition-colors duration-200`}
        >
          Upgrade
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-to-r from-${getPlanColor(requiredPlan)}-500 to-${getPlanColor(requiredPlan)}-600  p-4 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showIcon && getPlanIcon(requiredPlan)}
            <div>
              <h4 className="font-semibold">Unlock {feature}</h4>
              <p className="text-sm opacity-90">Upgrade to {requiredPlan} to access this feature</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="px-4 py-2 bg-black/40 backdrop-blur-md text-white text-white  font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-black/50 backdrop-blur-xl border border-white/10 text-white border border-white/10 border-white/10  p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 bg-white/5 rounded-full flex items-center justify-center">
            <FaLock className="text-gray-400" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">
            {feature} is locked
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            Upgrade to {requiredPlan} to unlock this feature and many more.
          </p>
          
          {/* Plan Comparison */}
          <div className="bg-gray-50 bg-white/5  p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Current Plan:</span>
              <span className="font-medium text-white">
                {planTier === PLAN_TIERS.PRO ? 'PRO' : planTier === PLAN_TIERS.PREMIUM ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-400">Required Plan:</span>
              <span className="font-medium text-white">{requiredPlan}</span>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/pricing"
              className={`inline-flex items-center justify-center px-4 py-2 bg-${getPlanColor(requiredPlan)}-600 hover:bg-${getPlanColor(requiredPlan)}-700 text-white text-sm font-medium  transition-colors duration-200`}
            >
              {showIcon && getPlanIcon(requiredPlan)}
              <span className="ml-2">Upgrade to {requiredPlan}</span>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 border border-white/20 text-gray-700 bg-black/40 backdrop-blur-md text-white hover:bg-gray-50 text-sm font-medium  transition-colors duration-200"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradePrompt;
