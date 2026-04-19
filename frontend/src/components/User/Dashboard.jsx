import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getUserPlanAndUsageAPI } from '../../APIServices/users/usersAPI';
import { PLAN_TIERS, hasFeatureAccess, hasAnalytics } from '../../utils/planUtils';
import FeatureGate, { PlanBadge, FeatureLock } from '../Plans/FeatureGate';
import ProDashboard from '../Dashboard/ProDashboard';
import { 
  FaFileAlt, 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaCalendarAlt,
  FaRocket,
  FaCrown,
  FaGem,
  FaPalette,
  FaCode,
  FaHeadset,
  FaGlobe,
  FaUserFriends,
  FaSearch,
  FaClock,
  FaUpload
} from 'react-icons/fa';

const Dashboard = () => {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["user-plan-usage"],
    queryFn: getUserPlanAndUsageAPI,
    staleTime: 5 * 60 * 1000,
  });

  const userPlan = usageData?.usage?.plan?.tier || PLAN_TIERS.FREE;
  const showProDashboard = hasAnalytics(userPlan);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Posts',
      description: 'Create and manage your posts',
      icon: FaFileAlt,
      link: '/posts',
      feature: null, // Always accessible
      color: 'blue'
    },
    {
      title: 'Profile',
      description: 'Manage your profile settings',
      icon: FaUsers,
      link: '/profile',
      feature: null, // Always accessible
      color: 'green'
    },
    {
      title: 'My Posts Analytics',
      description: 'See who viewed, liked, and commented on your posts',
      icon: FaChartLine,
      link: '/dashboard/analytics',
      feature: 'analytics',
      color: 'purple'
    },
    {
      title: 'Individual Post Analytics',
      description: 'Detailed analytics for each of your posts',
      icon: FaSearch,
      link: '/dashboard/my-posts-analytics',
      feature: 'analytics',
      color: 'indigo'
    },
    {
      title: 'Post Management',
      description: 'Manage posts and see who viewed, liked, and commented',
      icon: FaCog,
      link: '/dashboard/post-management',
      feature: 'basic',
      color: 'gray'
    },
    {
      title: 'Content Calendar',
      description: 'Plan and schedule your content',
      icon: FaCalendarAlt,
      link: '/dashboard/content-calendar',
      feature: 'content_calendar',
      color: 'orange'
    },
    {
      title: 'Scheduled Posts',
      description: 'Schedule posts for optimal timing',
      icon: FaClock,
      link: '/scheduled-posts',
      feature: 'scheduled_posts',
      color: 'indigo'
    },
    {
      title: 'Custom Branding',
      description: 'Customize your brand appearance',
      icon: FaPalette,
      link: '/branding',
      feature: 'custom_branding',
      color: 'pink'
    },
    {
      title: 'SEO Tools',
      description: 'Advanced SEO optimization tools',
      icon: FaSearch,
      link: '/seo-tools',
      feature: 'advanced_seo_tools',
      color: 'yellow'
    },
    {
      title: 'API Access',
      description: 'Access our powerful API',
      icon: FaCode,
      link: '/api-docs',
      feature: 'api_access',
      color: 'gray'
    },
    {
      title: 'Team Collaboration',
      description: 'Collaborate with your team',
      icon: FaUserFriends,
      link: '/team',
      feature: 'team_collaboration',
      color: 'teal'
    },
    {
      title: 'Custom Domain',
      description: 'Use your own custom domain',
      icon: FaGlobe,
      link: '/custom-domain',
      feature: 'custom_domain',
      color: 'red'
    },
    {
      title: 'Priority Support',
      description: 'Get priority customer support',
      icon: FaHeadset,
      link: '/support',
      feature: 'priority_support',
      color: 'emerald'
    },
    {
      title: 'White Label Solution',
      description: 'Complete white-label solution',
      icon: FaRocket,
      link: '/white-label',
      feature: 'white_label_solution',
      color: 'violet'
    }
  ];

  const getColorClasses = (color, hasAccess) => {
    return 'bg-white/10 text-white'; // Monochromatic
  };

  return (
    <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-4 xl:px-6 py-6 sm:py-8">
      {/* Show Pro Dashboard for Premium+ users */}
      {showProDashboard && (
        <div className="mb-8">
          <ProDashboard userPlan={userPlan} />
        </div>
      )}

      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Welcome back! Here&apos;s what you can do with your account.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <PlanBadge plan={userPlan} className="text-xs sm:text-sm" />
            {userPlan === PLAN_TIERS.FREE && (
              <Link
                to="/pricing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-none hover:from-blue-700 hover:to-purple-700 transition-colors font-medium text-sm sm:text-base"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Plan Usage Summary - Monochromatic */}
      {usageData?.usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-white/10 border border-white/10 bg-black/40 backdrop-blur-xl mb-8 overflow-hidden">
          <div className="p-8 text-center hover:bg-white/5 transition-all">
            <div className="text-3xl font-bold text-white mb-1">
              {usageData.usage.postsCount || 0}
            </div>
            <div className="text-xs font-medium text-gray-400 tracking-widest uppercase text-white/60">
              Posts Created
            </div>
          </div>
          <div className="p-8 text-center hover:bg-white/5 transition-all">
            <div className="text-3xl font-bold text-white mb-1">
              {usageData.usage.plan?.tier || 'Free'}
            </div>
            <div className="text-xs font-medium text-gray-400 tracking-widest uppercase text-white/60">
              Current Plan
            </div>
          </div>
          <div className="p-8 text-center hover:bg-white/5 transition-all">
            <div className="text-3xl font-bold text-white mb-1">
              {usageData.usage.plan?.features?.length || 0}
            </div>
            <div className="text-xs font-medium text-gray-400 tracking-widest uppercase text-white/60">
              Features Enabled
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid - Divide Grid Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-white/10 border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
        {dashboardItems.map((item, index) => {
          const hasAccess = !item.feature || hasFeatureAccess(item.feature, userPlan);
          const IconComponent = item.icon;

          if (hasAccess) {
            return (
              <Link
                key={index}
                to={item.link}
                className="group p-8 hover:bg-white/[0.02] transition-all relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-none bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <IconComponent className="h-6 w-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-white/10 to-white/20 group-hover:w-full transition-all duration-300" />
              </Link>
            );
          }

          return (
            <div key={index} className="p-8 bg-black/20 opacity-60 relative group cursor-not-allowed">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-none flex items-center justify-center ${getColorClasses(item.color, false)}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <FeatureLock size="sm" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {item.description}
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-medium tracking-wider uppercase"
              >
                {item.feature === 'api_access' || item.feature === 'white_label_solution' || item.feature === 'team_collaboration' ? (
                  <>Upgrade to Pro</>
                ) : (
                  <>Upgrade to Premium</>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Monochromatic */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-white/10 border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          <Link
            to="/create-post"
            className="flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all text-white/70 hover:text-white font-medium group"
          >
            <FaFileAlt className="text-4xl mb-4 group-hover:scale-110 transition-transform text-white/80" />
            <span className="text-lg font-semibold">Create Post</span>
            <span className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">Share your thoughts with the community</span>
            <div className="mt-4 px-6 py-1 border border-white/20 text-xs font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">Create</div>
          </Link>
          
          <div className="group cursor-pointer">
            <FeatureGate feature="unlimited_posts" showUpgrade={false}>
              <Link
                to="/dashboard/analytics"
                className="flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all text-white/70 hover:text-white font-medium group"
              >
                <FaChartLine className="text-4xl mb-4 group-hover:scale-110 transition-transform text-white/80" />
                <span className="text-lg font-semibold">Analytics</span>
                <span className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">View your content performance</span>
                <div className="mt-4 px-6 py-1 border border-white/20 text-xs font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">View</div>
              </Link>
            </FeatureGate>
          </div>

          <Link
            to="/dashboard/posts"
            className="flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all text-white/70 hover:text-white font-medium group"
          >
            <FaCog className="text-4xl mb-4 group-hover:scale-110 transition-transform text-white/80" />
            <span className="text-lg font-semibold">My Posts</span>
            <span className="text-xs text-gray-500 mt-2 text-center max-w-[150px]">Manage your published content</span>
            <div className="mt-4 px-6 py-1 border border-white/20 text-xs font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">Manage</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
