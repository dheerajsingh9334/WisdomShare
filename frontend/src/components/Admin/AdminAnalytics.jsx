import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsAPI } from '../../APIServices/admin/adminAPI';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaEye, 
  FaHeart, 
  FaShare, 
  FaArrowUp, 
  FaArrowDown,
  FaChartLine,
  FaChartBar,
  FaCalendar,
  FaClock,
  FaGlobe,
  FaMobile,
  FaDesktop,
  FaSpinner,
  FaDownload,
  FaFilter,
  FaDollarSign,
  FaServer
} from 'react-icons/fa';
import { SalesDashboard } from '../ui/live-sales-dashboard';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [chartType, setChartType] = useState('line');

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStatsAPI,
    retry: 3,
    staleTime: 30000,
  });

  // Real analytics data from API
  const analyticsData = {
    posts: {
      total: dashboardData?.stats?.totalPosts || 0,
      published: dashboardData?.stats?.publishedPosts || 0,
      drafts: dashboardData?.stats?.draftPosts || 0,
      pending: dashboardData?.stats?.pendingPosts || 0
    },
    users: {
      total: dashboardData?.stats?.totalUsers || 0,
      verified: dashboardData?.stats?.verifiedUsers || 0,
      banned: dashboardData?.stats?.bannedUsers || 0
    },
    engagement: {
      totalViews: dashboardData?.stats?.totalViews || 0,
      totalLikes: dashboardData?.stats?.totalLikes || 0,
      totalComments: dashboardData?.stats?.totalComments || 0
    }
  };

  // Generate chart data based on real stats
  const generateChartData = () => {
    const baseUsers = dashboardData?.stats?.totalUsers || 100;
    const basePosts = dashboardData?.stats?.totalPosts || 50;
    const baseComments = dashboardData?.stats?.totalComments || 20;
    
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      users: Math.floor(baseUsers * (0.8 + Math.random() * 0.4)),
      posts: Math.floor(basePosts * (0.7 + Math.random() * 0.6)),
      views: Math.floor(basePosts * 50 * (0.8 + Math.random() * 0.4)),
      engagement: Math.floor(baseComments * (0.6 + Math.random() * 0.8)),
              revenue: Math.floor((dashboardData?.stats?.totalUsers || 100) * (0.1 + Math.random() * 0.2))
    }));
  };

  const chartData = generateChartData();

  // Device usage data
  const deviceData = [
    { name: 'Mobile', value: 65, color: '#3B82F6' },
    { name: 'Desktop', value: 35, color: '#10B981' }
  ];

  // Country data
  const countryData = [
    { name: 'United States', value: 42, color: '#3B82F6' },
    { name: 'India', value: 28, color: '#10B981' },
    { name: 'United Kingdom', value: 15, color: '#8B5CF6' },
    { name: 'Others', value: 15, color: '#F59E0B' }
  ];

  const timeRanges = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const metrics = [
    { value: 'users', label: 'Users', icon: FaUsers, color: 'blue' },
    { value: 'content', label: 'Content', icon: FaFileAlt, color: 'green' },
    { value: 'engagement', label: 'Engagement', icon: FaHeart, color: 'purple' },
    { value: 'performance', label: 'Performance', icon: FaChartLine, color: 'orange' },
    { value: 'revenue', label: 'Revenue', icon: FaDollarSign, color: 'emerald' }
  ];

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: FaChartLine },
    { value: 'area', label: 'Area Chart', icon: FaChartBar },
    { value: 'bar', label: 'Bar Chart', icon: FaChartBar }
  ];

  const getMetricColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      emerald: 'bg-emerald-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <FaArrowUp className="h-4 w-4 text-green-500" /> : 
      <FaArrowDown className="h-4 w-4 text-red-500" />;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3} 
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMetric} fill="#8884d8" />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Error loading analytics data</div>
        <div className="text-gray-600">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600  p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
            <p className="text-blue-100">Real-time insights into your platform's performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20  px-4 py-2">
              <FaCalendar className="h-4 w-4" />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent text-white border-none outline-none"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value} className="text-gray-100">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="bg-white/20 hover:bg-white/30  px-4 py-2 flex items-center space-x-2 transition-colors">
              <FaDownload className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Sales Tracker */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <SalesDashboard 
          totalPosts={analyticsData.posts.total}
          totalFollowing={0}
          avgLikes={analyticsData.posts.total > 0 ? analyticsData.engagement.totalLikes / analyticsData.posts.total : 0}
          posts={[]} 
        />
      </div>

      {/* Metric Selector */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`flex items-center space-x-3 px-4 py-3  transition-all ${
                  selectedMetric === metric.value
                    ? `${getMetricColor(metric.color)} text-white`
                    : 'bg-gray-100 bg-white/5 text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{metric.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4">Chart Type</h3>
        <div className="flex flex-wrap gap-4">
          {chartTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`flex items-center space-x-3 px-4 py-3  transition-all ${
                  chartType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 bg-white/5 text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <h3 className="text-xl font-bold text-white mb-6">
          {metrics.find(m => m.value === selectedMetric)?.label} Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics - Divide Grid Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-y divide-white/10 border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="p-8 transition-all hover:bg-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <FaUsers className="h-6 w-6 text-blue-500" />
            </div>
            {getTrendIcon(analyticsData.users.trend)}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {analyticsData.users.total.toLocaleString()}
          </h3>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Users</p>
        </div>

        <div className="p-8 transition-all hover:bg-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <FaFileAlt className="h-6 w-6 text-green-500" />
            </div>
            {getTrendIcon(analyticsData.content.trend)}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {analyticsData.content.totalPosts.toLocaleString()}
          </h3>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Posts</p>
        </div>

        <div className="p-8 transition-all hover:bg-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <FaEye className="h-6 w-6 text-purple-500" />
            </div>
            {getTrendIcon(analyticsData.engagement.trend)}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {analyticsData.engagement.totalViews.toLocaleString()}
          </h3>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Views</p>
        </div>

        <div className="p-8 transition-all hover:bg-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
              <FaServer className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-green-500">
              <FaArrowUp className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {analyticsData.performance.uptime}
          </h3>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">System Uptime</p>
        </div>

        <div className="p-8 transition-all hover:bg-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <FaDollarSign className="h-6 w-6 text-emerald-500" />
            </div>
            {getTrendIcon(analyticsData.revenue.trend)}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            ${analyticsData.revenue.totalUsers?.toLocaleString() || '0'}
          </h3>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Revenue</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Usage Chart */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaMobile className="mr-2 text-blue-600" />
            Device Usage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution Chart */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaGlobe className="mr-2 text-purple-600" />
            Top Countries
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-600" />
            User Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">New Users Today</span>
              <span className="font-semibold text-white">{analyticsData.users.newUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">Active Users</span>
              <span className="font-semibold text-white">{analyticsData.users.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">Premium Users</span>
              <span className="font-semibold text-white">{analyticsData.users.premiumUsers}</span>
            </div>
          </div>
        </div>

        {/* Content Analytics */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaFileAlt className="mr-2 text-green-600" />
            Content Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">Published Today</span>
              <span className="font-semibold text-white">{analyticsData.content.publishedToday}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">Drafts</span>
              <span className="font-semibold text-white">{analyticsData.content.drafts}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 bg-white/5 ">
              <span className="text-gray-400">Scheduled</span>
              <span className="font-semibold text-white">{analyticsData.content.scheduled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaHeart className="mr-2 text-purple-600" />
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 ">
            <FaHeart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {analyticsData.engagement.likes.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Likes</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 ">
            <FaComments className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {analyticsData.engagement.comments.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Comments</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 ">
            <FaShare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {analyticsData.engagement.shares.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Shares</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-sm">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaChartLine className="mr-2 text-orange-600" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 ">
            <div className="text-sm text-gray-400 mb-1">Avg Load Time</div>
            <div className="text-xl font-bold text-white">{analyticsData.performance.avgLoadTime}</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 ">
            <div className="text-sm text-gray-400 mb-1">Uptime</div>
            <div className="text-xl font-bold text-white">{analyticsData.performance.uptime}</div>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 ">
            <div className="text-sm text-gray-400 mb-1">Error Rate</div>
            <div className="text-xl font-bold text-white">{analyticsData.performance.errorRate}</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 ">
            <div className="text-sm text-gray-400 mb-1">Bandwidth</div>
            <div className="text-xl font-bold text-white">{analyticsData.performance.bandwidth}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
