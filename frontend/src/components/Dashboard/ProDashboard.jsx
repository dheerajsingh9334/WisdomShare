import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FaChartLine, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaArrowUp, 
  FaCrown,
  FaUsers,
  FaCalendarAlt,
  FaGlobe,
  FaClock
} from 'react-icons/fa';
import { hasAnalytics, hasReaderAnalytics, getPlanTier } from '../../utils/planUtils';

const ProDashboard = ({ userPlan }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const hasAnalyticsAccess = hasAnalytics(userPlan);
  const hasReaderAccess = hasReaderAnalytics(userPlan);
  const planTier = getPlanTier(userPlan);

  useEffect(() => {
    if (hasAnalyticsAccess) {
      // Simulate loading analytics data
      setTimeout(() => {
        setAnalyticsData({
          totalViews: 12480,
          totalLikes: 892,
          totalComments: 143,
          totalFollowers: 1250,
          weeklyGrowth: {
            views: 15.3,
            likes: 8.7,
            comments: 12.1,
            followers: 5.2
          },
          topPosts: [
            {
              id: 1,
              title: "Getting Started with React Hooks",
              views: 3420,
              likes: 245,
              comments: 67,
              publishedAt: "2024-01-15"
            },
            {
              id: 2,
              title: "Advanced JavaScript Patterns",
              views: 2880,
              likes: 198,
              comments: 34,
              publishedAt: "2024-01-10"
            },
            {
              id: 3,
              title: "Building Modern Web Applications",
              views: 2150,
              likes: 156,
              comments: 23,
              publishedAt: "2024-01-08"
            }
          ],
          recentActivity: [
            { type: 'like', user: 'john_doe', post: 'React Hooks Guide', time: '2 hours ago' },
            { type: 'comment', user: 'jane_smith', post: 'JavaScript Patterns', time: '4 hours ago' },
            { type: 'view', user: 'alex_wilson', post: 'Web Applications', time: '6 hours ago' },
            { type: 'follow', user: 'sarah_johnson', time: '8 hours ago' }
          ],
          audienceInsights: {
            countries: [
              { name: 'United States', percentage: 35, count: 438 },
              { name: 'United Kingdom', percentage: 22, count: 275 },
              { name: 'Canada', percentage: 18, count: 225 },
              { name: 'Germany', percentage: 15, count: 188 },
              { name: 'Australia', percentage: 10, count: 124 }
            ],
            demographics: {
              ageGroups: [
                { range: '18-24', percentage: 25 },
                { range: '25-34', percentage: 45 },
                { range: '35-44', percentage: 20 },
                { range: '45+', percentage: 10 }
              ]
            }
          }
        });
        setLoading(false);
      }, 1000);
    }
  }, [hasAnalyticsAccess, selectedTimeRange]);

  if (!hasAnalyticsAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600  p-8 text-center text-white">
          <FaCrown className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Unlock Pro Analytics</h2>
          <p className="mb-4 opacity-90">Get detailed insights about your audience and content performance</p>
          <button className="bg-black/40 backdrop-blur-md text-white text-purple-600 px-6 py-3  font-semibold hover:bg-gray-100 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300  w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 "></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-300 "></div>
            <div className="h-64 bg-gray-300 "></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaChartLine className="text-purple-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Pro Analytics Dashboard</h1>
            <p className="text-gray-400">Advanced insights for your content</p>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 rounded-full">
            <FaCrown className="text-purple-600" size={16} />
            <span className="text-purple-800 font-semibold text-sm">{planTier} Plan</span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2  text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 bg-white/5 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold text-white">{analyticsData.totalViews.toLocaleString()}</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <FaArrowUp className="mr-1" size={12} />
                +{analyticsData.weeklyGrowth.views}% this week
              </p>
            </div>
            <FaEye className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Likes</p>
              <p className="text-3xl font-bold text-white">{analyticsData.totalLikes.toLocaleString()}</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <FaArrowUp className="mr-1" size={12} />
                +{analyticsData.weeklyGrowth.likes}% this week
              </p>
            </div>
            <FaHeart className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Comments</p>
              <p className="text-3xl font-bold text-white">{analyticsData.totalComments.toLocaleString()}</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <FaArrowUp className="mr-1" size={12} />
                +{analyticsData.weeklyGrowth.comments}% this week
              </p>
            </div>
            <FaComment className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Followers</p>
              <p className="text-3xl font-bold text-white">{analyticsData.totalFollowers.toLocaleString()}</p>
              <p className="text-green-600 text-sm flex items-center mt-1">
                <FaArrowUp className="mr-1" size={12} />
                +{analyticsData.weeklyGrowth.followers}% this week
              </p>
            </div>
            <FaUsers className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Top Posts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Posts */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaArrowUp className="mr-2 text-green-600" />
            Top Performing Posts
          </h3>
          <div className="space-y-4">
            {analyticsData.topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 bg-white/5 ">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      #{index + 1}
                    </span>
                    <h4 className="font-medium text-white text-sm">{post.title}</h4>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <FaEye className="mr-1" size={10} />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <FaHeart className="mr-1" size={10} />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <FaComment className="mr-1" size={10} />
                      {post.comments}
                    </span>
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" size={10} />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaClock className="mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 bg-white/5 ">
                <div className={`p-2 rounded-full ${
                  activity.type === 'like' ? 'bg-red-100 text-red-600' :
                  activity.type === 'comment' ? 'bg-green-100 text-green-600' :
                  activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'like' && <FaHeart size={14} />}
                  {activity.type === 'comment' && <FaComment size={14} />}
                  {activity.type === 'view' && <FaEye size={14} />}
                  {activity.type === 'follow' && <FaUsers size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{activity.user}</span>
                    {activity.type === 'like' && ' liked your post '}
                    {activity.type === 'comment' && ' commented on '}
                    {activity.type === 'view' && ' viewed '}
                    {activity.type === 'follow' && ' started following you'}
                    {activity.post && <span className="font-medium">&ldquo;{activity.post}&rdquo;</span>}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Insights - Pro Feature */}
      {hasReaderAccess && (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 shadow-lg border border-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaGlobe className="mr-2 text-purple-600" />
            Audience Insights
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">PRO</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <div>
              <h4 className="font-medium text-white mb-3">Top Countries</h4>
              <div className="space-y-2">
                {analyticsData.audienceInsights.countries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">{country.name}</span>
                      <span className="text-xs text-gray-400">({country.count})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300 w-8">{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Demographics */}
            <div>
              <h4 className="font-medium text-white mb-3">Age Groups</h4>
              <div className="space-y-2">
                {analyticsData.audienceInsights.demographics.ageGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{group.range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300 w-8">{group.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProDashboard.propTypes = {
  userPlan: PropTypes.string.isRequired
};

export default ProDashboard;
