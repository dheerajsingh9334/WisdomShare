import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaCalendarAlt, 
  FaClock,
  FaGlobe,
  FaMobile,
  FaMapMarkerAlt,
  FaUserFriends,
  FaTrendingUp,
  FaDownload,
  FaChartLine,
  FaCrown
} from 'react-icons/fa';
import { hasReaderAnalytics } from '../../utils/planUtils';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement);

const PostEngagementAnalytics = ({ 
  userPlan, 
  isAuthor,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const hasAnalyticsAccess = hasReaderAnalytics(userPlan);

  // Mock analytics data - replace with real API data
  const analyticsData = {
    overview: {
      totalViews: 2540,
      uniqueViews: 1820,
      totalLikes: 156,
      totalComments: 42,
      totalShares: 28,
      engagementRate: 12.4,
      averageReadTime: '2m 34s',
      returnVisitorRate: 23.5
    },
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 35, count: 637 },
        { range: '25-34', percentage: 42, count: 764 },
        { range: '35-44', percentage: 15, count: 273 },
        { range: '45-54', percentage: 6, count: 109 },
        { range: '55+', percentage: 2, count: 37 }
      ],
      genderSplit: {
        male: 58,
        female: 39,
        other: 3
      },
      topCountries: [
        { name: 'United States', count: 456, percentage: 25.1 },
        { name: 'India', count: 364, percentage: 20.0 },
        { name: 'United Kingdom', count: 182, percentage: 10.0 },
        { name: 'Canada', count: 146, percentage: 8.0 },
        { name: 'Germany', count: 109, percentage: 6.0 }
      ]
    },
    devices: {
      types: [
        { type: 'Mobile', count: 1274, percentage: 70 },
        { type: 'Desktop', count: 473, percentage: 26 },
        { type: 'Tablet', count: 73, percentage: 4 }
      ],
      browsers: [
        { name: 'Chrome', count: 1018, percentage: 56 },
        { name: 'Safari', count: 509, percentage: 28 },
        { name: 'Firefox', count: 182, percentage: 10 },
        { name: 'Edge', count: 91, percentage: 5 },
        { name: 'Other', count: 20, percentage: 1 }
      ]
    },
    timeline: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 100) + 20,
        engagements: Math.floor(Math.random() * 30) + 5
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.floor(Math.random() * 400) + 100,
        likes: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
        shares: Math.floor(Math.random() * 15) + 1
      }))
    }
  };

  if (!hasAnalyticsAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <FaChartLine className="mx-auto text-5xl text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Advanced Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get detailed insights about your post engagement, reader demographics, and performance metrics.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 ">
                <FaUserFriends className="text-purple-500 mb-2" />
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Reader Demographics</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 ">
                <FaTrendingUp className="text-blue-500 mb-2" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Engagement Trends</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 ">
                <FaGlobe className="text-green-500 mb-2" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Geographic Insights</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 ">
                <FaMobile className="text-orange-500 mb-2" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Device Analytics</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-white/20 border-white/20 text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2  font-medium">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const timelineData = {
    labels: analyticsData.timeline.daily.map(d => d.day),
    datasets: [
      {
        label: 'Views',
        data: analyticsData.timeline.daily.map(d => d.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Likes',
        data: analyticsData.timeline.daily.map(d => d.likes),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const deviceData = {
    labels: analyticsData.devices.types.map(d => d.type),
    datasets: [
      {
        data: analyticsData.devices.types.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 border-white/10">
          <div className="flex items-center space-x-3">
            <FaChartLine className="text-2xl text-purple-500" />
            <h2 className="text-xl font-bold text-white">
              Post Analytics
            </h2>
            <FaCrown className="text-yellow-500" title="Pro Feature" />
            {isAuthor && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm">
                Author View
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-white/20 border-white/20  px-3 py-1 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'timeline', label: 'Timeline', icon: FaClock },
            { id: 'demographics', label: 'Demographics', icon: FaUserFriends },
            { id: 'devices', label: 'Devices', icon: FaMobile },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-400 hover:text-white dark:hover:text-gray-200'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 ">
                  <div className="flex items-center justify-between">
                    <FaEye className="text-blue-500 text-xl" />
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {analyticsData.overview.totalViews.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Total Views</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {analyticsData.overview.uniqueViews.toLocaleString()} unique
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 ">
                  <div className="flex items-center justify-between">
                    <FaHeart className="text-red-500 text-xl" />
                    <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {analyticsData.overview.totalLikes}
                    </span>
                  </div>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">Total Likes</p>
                  <p className="text-xs text-red-500 mt-1">
                    {((analyticsData.overview.totalLikes / analyticsData.overview.totalViews) * 100).toFixed(1)}% rate
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 ">
                  <div className="flex items-center justify-between">
                    <FaComment className="text-green-500 text-xl" />
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {analyticsData.overview.totalComments}
                    </span>
                  </div>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">Comments</p>
                  <p className="text-xs text-green-500 mt-1">
                    {((analyticsData.overview.totalComments / analyticsData.overview.totalViews) * 100).toFixed(2)}% rate
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 ">
                  <div className="flex items-center justify-between">
                    <FaShare className="text-purple-500 text-xl" />
                    <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {analyticsData.overview.totalShares}
                    </span>
                  </div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">Shares</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {((analyticsData.overview.totalShares / analyticsData.overview.totalViews) * 100).toFixed(2)}% rate
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 bg-white/5 p-4 ">
                  <h3 className="font-semibold text-white mb-2">Engagement Rate</h3>
                  <div className="text-2xl font-bold text-gray-300">
                    {analyticsData.overview.engagementRate}%
                  </div>
                  <p className="text-sm text-gray-400">
                    Above average performance
                  </p>
                </div>

                <div className="bg-gray-50 bg-white/5 p-4 ">
                  <h3 className="font-semibold text-white mb-2">Avg. Read Time</h3>
                  <div className="text-2xl font-bold text-gray-300">
                    {analyticsData.overview.averageReadTime}
                  </div>
                  <p className="text-sm text-gray-400">
                    High engagement content
                  </p>
                </div>

                <div className="bg-gray-50 bg-white/5 p-4 ">
                  <h3 className="font-semibold text-white mb-2">Return Visitors</h3>
                  <div className="text-2xl font-bold text-gray-300">
                    {analyticsData.overview.returnVisitorRate}%
                  </div>
                  <p className="text-sm text-gray-400">
                    Good retention rate
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Views & Engagement Over Time
                </h3>
                <div className="h-64">
                  <Line data={timelineData} options={chartOptions} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h4 className="font-semibold text-white mb-3">Peak Hours</h4>
                  <div className="space-y-2">
                    {analyticsData.timeline.hourly
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((hour) => (
                        <div key={hour.hour} className="flex justify-between items-center">
                          <span className="text-gray-400">
                            {hour.hour}:00 - {hour.hour + 1}:00
                          </span>
                          <span className="font-medium text-white">
                            {hour.views} views
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h4 className="font-semibold text-white mb-3">Daily Performance</h4>
                  <div className="space-y-2">
                    {analyticsData.timeline.daily.map((day) => (
                      <div key={day.day} className="flex justify-between items-center">
                        <span className="text-gray-400">{day.day}</span>
                        <div className="flex space-x-2 text-sm">
                          <span className="text-blue-600">{day.views}v</span>
                          <span className="text-red-600">{day.likes}l</span>
                          <span className="text-green-600">{day.comments}c</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demographics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Age Distribution
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-gray-400">{group.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 bg-white/5 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12">
                            {group.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Countries
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.demographics.topCountries.map((country, index) => (
                      <div key={country.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span className="text-gray-400">{country.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white">
                            {country.count}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({country.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Device Types
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut data={deviceData} />
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white p-4  border border-white/10 border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Browser Distribution
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.devices.browsers.map((browser) => (
                      <div key={browser.name} className="flex items-center justify-between">
                        <span className="text-gray-400">{browser.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 bg-white/5 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${browser.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12">
                            {browser.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 border-white/10 bg-black text-white">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FaCalendarAlt />
            <span>Data updated in real-time</span>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white dark:hover:text-gray-200">
              <FaDownload />
              <span>Export Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white  text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PostEngagementAnalytics.propTypes = {
  userPlan: PropTypes.string.isRequired,
  isAuthor: PropTypes.bool,
  onClose: PropTypes.func.isRequired
};

export default PostEngagementAnalytics;
