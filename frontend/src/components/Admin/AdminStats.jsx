import React from 'react';
import { 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaTags, 
  FaBan, 
  FaUserShield,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminStats = ({ stats, isLoading, onTabChange }) => {
  const handleStatClick = (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200  w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 "></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <FaExclamationTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      tabName: 'users'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts || 0,
      icon: FaFileAlt,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      tabName: 'posts'
    },
    {
      title: 'Total Comments',
      value: stats.totalComments || 0,
      icon: FaComments,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      tabName: 'comments'
    },
    {
      title: 'Categories',
      value: stats.totalCategories || 0,
      icon: FaTags,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      tabName: 'categories'
    }
  ];

  const detailStats = [
    {
      title: 'Banned Users',
      value: stats.bannedUsers || 0,
      icon: FaBan,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      tabName: 'users'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers || 0,
      icon: FaUserShield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      tabName: 'users'
    },
    {
      title: 'Recent Users (7 days)',
      value: stats.recentUsers || 0,
      icon: FaChartLine,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      tabName: 'users'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Platform Statistics</h2>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => handleStatClick(stat.tabName)}
              className={`${stat.bgColor} ${stat.hoverColor}  p-6 border border-white/10 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${stat.color} p-3 `}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {detailStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => handleStatClick(stat.tabName)}
              className={`${stat.bgColor} ${stat.hoverColor}  p-4 border border-white/10 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md`}
            >
              <div className="flex items-center">
                <Icon className={`h-5 w-5 ${stat.color} mr-3`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Stats */}
      {stats.regularUsers !== undefined && (
        <div className="mt-6 p-4 bg-gray-50 ">
          <h3 className="text-lg font-semibold text-white mb-3">User Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleStatClick('users')}
              className="text-center p-3  hover:bg-black/40 backdrop-blur-md text-white hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <p className="text-2xl font-bold text-blue-600">{stats.regularUsers || 0}</p>
              <p className="text-sm text-gray-600">Regular Users</p>
            </button>
            <button
              onClick={() => handleStatClick('users')}
              className="text-center p-3  hover:bg-black/40 backdrop-blur-md text-white hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <p className="text-2xl font-bold text-purple-600">{stats.moderatorUsers || 0}</p>
              <p className="text-sm text-gray-600">Moderators</p>
            </button>
            <button
              onClick={() => handleStatClick('users')}
              className="text-center p-3  hover:bg-black/40 backdrop-blur-md text-white hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <p className="text-2xl font-bold text-indigo-600">{stats.adminUsers || 0}</p>
              <p className="text-sm text-gray-600">Administrators</p>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-black/40 backdrop-blur-md text-white  border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleStatClick('users')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700  transition-colors duration-200"
          >
            <FaUsers className="h-5 w-5 mr-2" />
            Manage Users
          </button>
          <button
            onClick={() => handleStatClick('posts')}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700  transition-colors duration-200"
          >
            <FaFileAlt className="h-5 w-5 mr-2" />
            Manage Posts
          </button>
          <button
            onClick={() => handleStatClick('plans')}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700  transition-colors duration-200"
          >
            <FaChartLine className="h-5 w-5 mr-2" />
            Manage Plans
          </button>
          <button
            onClick={() => handleStatClick('categories')}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 text-orange-700  transition-colors duration-200"
          >
            <FaTags className="h-5 w-5 mr-2" />
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;




