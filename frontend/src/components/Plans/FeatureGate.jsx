import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserPlanAndUsageAPI } from '../../APIServices/users/usersAPI';
import { PLAN_TIERS, hasFeatureAccess } from '../../utils/planUtils';
import { FaLock, FaCrown, FaGem } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Feature Gate Component - Controls access to features based on user's plan
 * @param {Object} props
 * @param {string} props.feature - Feature key to check access for
 * @param {React.ReactNode} props.children - Content to show if access granted
 * @param {React.ReactNode} props.fallback - Custom fallback component (optional)
 * @param {boolean} props.showUpgrade - Whether to show upgrade button (default: true)
 * @param {string} props.redirectTo - Where to redirect for upgrade (default: /pricing)
 */
const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgrade = true,
  redirectTo = '/pricing'
}) => {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-none h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }

  const userPlan = usageData?.usage?.plan?.tier || PLAN_TIERS.FREE;
  const hasAccess = hasFeatureAccess(feature, userPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If access denied, show fallback or default upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 text-center rounded-none relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-6 relative z-10">
        <FaLock className="h-12 w-12 text-white/20 mx-auto" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight uppercase relative z-10">
        {getFeatureTitle(feature)} 
      </h3>
      
      <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed relative z-10">
        {getFeatureDescription(feature, userPlan)}
      </p>

      {showUpgrade && (
        <div className="space-y-4 relative z-10">
          <Link
            to={redirectTo}
            className="inline-flex items-center px-8 py-3 bg-white text-black hover:bg-gray-200 transition-all font-bold uppercase tracking-widest text-xs rounded-none"
          >
            Upgrade to Unlock
          </Link>
          
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
            Elevate your wisdom share experience
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Plan Badge Component - Shows user's current plan with styling
 */
export const PlanBadge = ({ plan, className = "" }) => {
  const getBadgeStyle = (planTier) => {
    switch (planTier) {
      case PLAN_TIERS.PRO:
        return "bg-white text-black border-white";
      case PLAN_TIERS.PREMIUM:
        return "bg-white/20 text-white border-white/20";
      case PLAN_TIERS.FREE:
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  const getIcon = (planTier) => {
    switch (planTier) {
      case PLAN_TIERS.PRO:
        return <FaGem className="mr-1.5 h-3 w-3" />;
      case PLAN_TIERS.PREMIUM:
        return <FaCrown className="mr-1.5 h-3 w-3" />;
      case PLAN_TIERS.FREE:
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 border rounded-none text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(plan)} ${className}`}>
      {getIcon(plan)}
      {plan?.charAt(0)?.toUpperCase() + plan?.slice(1) || 'Free'}
    </span>
  );
};

/**
 * Lock Icon Component - Shows when feature is locked
 */
export const FeatureLock = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5", 
    lg: "h-7 w-7"
  };

  return (
    <div className="inline-flex items-center justify-center p-1 bg-white/5 border border-white/10 rounded-none">
      <FaLock className={`text-white/60 ${sizeClasses[size]}`} />
    </div>
  );
};
 Riverside

// Helper functions
const getFeatureTitle = (feature) => {
  const titles = {
    'advanced_analytics': 'Advanced Analytics',
    'unlimited_posts': 'Unlimited Posts',
    'custom_branding': 'Custom Branding',
    'priority_support': 'Priority Support',
    'api_access': 'API Access',
    'white_label_solution': 'White Label Solution',
    'team_collaboration': 'Team Collaboration',
    'custom_integrations': 'Custom Integrations',
    'content_calendar': 'Content Calendar',
    'scheduled_posts': 'Scheduled Posts',
    'advanced_seo_tools': 'Advanced SEO Tools',
    'custom_domain': 'Custom Domain'
  };
  return titles[feature] || 'Premium Feature';
};

const getFeatureDescription = (feature, currentPlan) => {
  const descriptions = {
    'advanced_analytics': `Get detailed insights into your content performance, audience engagement, and growth metrics.`,
    'unlimited_posts': `Create unlimited posts without restrictions. Currently on ${currentPlan} plan.`,
    'custom_branding': `Remove our branding and add your own custom logo and colors.`,
    'priority_support': `Get priority customer support with faster response times.`,
    'api_access': `Access our powerful API to integrate with your existing tools and workflows.`,
    'white_label_solution': `Complete white-label solution for your business needs.`,
    'team_collaboration': `Collaborate with team members and manage permissions.`,
    'custom_integrations': `Build custom integrations tailored to your business.`,
    'content_calendar': `Plan and schedule your content with our advanced calendar.`,
    'scheduled_posts': `Schedule posts to be published automatically at optimal times.`,
    'advanced_seo_tools': `Optimize your content for search engines with advanced SEO tools.`,
    'custom_domain': `Use your own custom domain for a professional presence.`
  };
  return descriptions[feature] || `This feature requires a higher plan tier.`;
};

const getRequiredPlan = (feature) => {
  const proFeatures = ['api_access', 'white_label_solution', 'team_collaboration', 'custom_integrations'];
  return proFeatures.includes(feature) ? PLAN_TIERS.PRO : PLAN_TIERS.PREMIUM;
};

export default FeatureGate;
