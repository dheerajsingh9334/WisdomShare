import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsAPI, getActivityFeedAPI } from '../../APIServices/admin/adminAPI';
import AdminStats from './AdminStats';
import { 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaTags, 
  FaBell, 
  FaCog, 
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaRocket
} from 'react-icons/fa';

const AdminMainDashboard = () => {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStatsAPI,
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: () => getActivityFeedAPI({ limit: 10 }),
    retry: 3,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: FaUsers,
      href: '/admin/users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate posts and comments',
      icon: FaFileAlt,
      href: '/admin/posts',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: FaCog,
      href: '/admin/settings',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Notifications',
      description: 'Send announcements to users',
      icon: FaBell,
      href: '/admin/notifications',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Categories',
      description: 'Manage content categories',
      icon: FaTags,
      href: '/admin/categories',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: FaChartBar,
      href: '/admin/analytics',
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Plan Management',
      description: 'Manage subscription plans',
      icon: FaRocket,
      href: '/admin/plans',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  // Real activity feed data from API
  const activityFeed = activityData?.activities || [];

  // Real performance metrics from dashboard data
  const performanceMetrics = [
    { 
      name: 'Total Users', 
      value: dashboardData?.stats?.totalUsers || 0, 
      change: dashboardData?.stats?.recentUsers ? `+${dashboardData.stats.recentUsers}` : '+0', 
      trend: 'up', 
      icon: FaUsers 
    },
    { 
      name: 'Total Posts', 
      value: dashboardData?.stats?.totalPosts || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaFileAlt 
    },
    { 
      name: 'Total Comments', 
      value: dashboardData?.stats?.totalComments || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaComments 
    },
    { 
      name: 'Total Views', 
      value: dashboardData?.stats?.totalViews || 0, 
      change: '+0', 
      trend: 'up', 
      icon: FaChartBar 
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 bg-white/5  w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 bg-white/5  w-2/3"></div>
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 bg-white/5 "></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to load dashboard statistics. Please try again later.</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600  shadow-sm p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                             <p className="text-blue-100 text-lg">
                 Welcome back! Here&apos;s what&apos;s happening with your platform today.
               </p>
              <div className="flex items-center mt-4 text-blue-100">
                <FaClock className="mr-2" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <FaRocket className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{metric.name}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`p-3  ${metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <Icon className={`h-6 w-6 ${metric.color || 'text-gray-400'}`} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {metric.trend === 'up' ? (
                  <FaArrowUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <FaArrowDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-400 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm">
        <AdminStats stats={dashboardData?.stats} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className={`group p-6 border border-white/10 border-white/10  hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 bg-gradient-to-r ${action.gradient} text-white`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3  bg-white/20 mr-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {action.title}
                  </h3>
                </div>
                <p className="text-blue-100 text-sm">
                  {action.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* System Status & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 ">
              <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">System Online</p>
                <p className="text-sm text-green-600 dark:text-green-400">All services operational</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 ">
              <FaUsers className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Active Users</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{dashboardData?.stats?.totalUsers || 0} registered</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 ">
              <FaFileAlt className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">Content</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{dashboardData?.stats?.totalPosts || 0} posts</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 ">
              <FaComments className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">Comments</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">{dashboardData?.stats?.totalComments || 0} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 bg-white/5 "></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 bg-white/5  w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 bg-white/5  w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activityFeed.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activityFeed.map((activity) => {
                // Map icon strings to actual icon components
                let IconComponent;
                switch (activity.icon) {
                  case 'FaUsers':
                    IconComponent = FaUsers;
                    break;
                  case 'FaFileAlt':
                    IconComponent = FaFileAlt;
                    break;
                  case 'FaComments':
                    IconComponent = FaComments;
                    break;
                  case 'FaCrown':
                    IconComponent = FaRocket; // Using rocket as crown alternative
                    break;
                  default:
                    IconComponent = FaUsers;
                }
                
                // Format time
                const timeAgo = (() => {
                  const now = new Date();
                  const activityTime = new Date(activity.time);
                  const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
                  
                  if (diffInMinutes < 1) return 'Just now';
                  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
                  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
                  return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
                })();
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700  transition-colors">
                    <div className={`p-2  bg-gray-100 bg-white/5 ${activity.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No recent activity</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-white/10 border-white/10">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View all activity →
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminMainDashboard;
