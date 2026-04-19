import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { FaChartLine, FaEye, FaHeart, FaComment, FaCrown, FaSearch } from 'react-icons/fa';
import { getUserPublishedPostsAPI } from '../../APIServices/posts/postsAPI';
import { hasAnalytics, hasReaderAnalytics, getPlanTier, PLAN_TIERS } from '../../utils/planUtils';
import AdvancedAnalyticsButton from '../Analytics/AdvancedAnalyticsButton';

const MyPostsAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { userAuth } = useSelector((state) => state.auth);
  const userPlan = userAuth?.plan || 'Free';  // Use the correct path based on our backend fix
  const planTier = getPlanTier(userPlan);
  
  const hasAnalyticsAccess = hasAnalytics(userPlan);
  const hasReaderAccess = hasReaderAnalytics(userPlan);

  // Fetch user's posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["user-posts"],
    queryFn: getUserPublishedPostsAPI,
    enabled: hasAnalyticsAccess
  });

  const posts = postsData?.posts || [];
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate overall stats
  const totalViews = posts.reduce((sum, post) => sum + (post.viewsCount || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
  const avgEngagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) : 0;

  if (!hasAnalyticsAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <FaChartLine className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Advanced Analytics
          </h2>
          <p className="text-gray-400 mb-6">
            Upgrade to Premium or Pro to access detailed analytics for your posts
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20  p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Analytics Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <FaEye className="text-blue-600" />
                <span className="text-gray-300">View engagement metrics</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaHeart className="text-red-600" />
                <span className="text-gray-300">See who liked your posts</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaComment className="text-green-600" />
                <span className="text-gray-300">Manage comments as author</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCrown className="text-yellow-600" />
                <span className="text-gray-300">Who viewed your posts (Pro)</span>
              </div>
            </div>
          </div>
          <a
            href="/pricing"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white  hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <FaCrown className="mr-2" />
            Upgrade to Premium
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 My Posts Analytics
            </h1>
            <p className="text-gray-400">
              Track engagement and manage your content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              planTier === PLAN_TIERS.PRO ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              planTier === PLAN_TIERS.PREMIUM ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-gray-100 text-gray-100 bg-black dark:text-gray-200'
            }`}>
              {planTier === PLAN_TIERS.PRO ? '👑 Pro' : 
               planTier === PLAN_TIERS.PREMIUM ? '⭐ Premium' : 
               '🆓 Free'}
            </span>
            {hasReaderAccess && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                👀 Reader Analytics
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overall Stats Summary */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4  text-center">
            <FaEye className="mx-auto text-blue-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalViews}</div>
            <div className="text-sm text-blue-600">Total Views</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4  text-center">
            <FaHeart className="mx-auto text-red-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{totalLikes}</div>
            <div className="text-sm text-red-600">Total Likes</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4  text-center">
            <FaComment className="mx-auto text-green-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalComments}</div>
            <div className="text-sm text-green-600">Total Comments</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4  text-center">
            <FaChartLine className="mx-auto text-purple-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{avgEngagement}%</div>
            <div className="text-sm text-purple-600">Avg Engagement</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/50 backdrop-blur-xl border border-white/10 text-white text-white"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <FaChartLine className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Create your first post to see analytics'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts
            .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)) // Sort by views descending
            .map((post, index) => {
              const engagementRate = post.viewsCount > 0 ? 
                (((post.likes?.length || 0) + (post.comments?.length || 0)) / post.viewsCount * 100) : 0;
              const isTopPerformer = index < 3 && engagementRate > 5; // Top 3 posts with >5% engagement
              
              return (
            <div
              key={post._id}
              className={`bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-md hover:shadow-lg transition-shadow p-6 ${
                isTopPerformer ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
              }`}
            >
              {isTopPerformer && (
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    🏆 Top Performer #{index + 1}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {post.content?.substring(0, 150)}...
                  </p>
                  
                  {/* Stats Row */}
                  <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <FaEye className="text-blue-600" />
                      <span>{post.viewsCount || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaHeart className="text-red-600" />
                      <span>{post.likes?.length || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaComment className="text-green-600" />
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                    <div className="text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  {(post.viewsCount > 0) && (
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <span>💡 Engagement:</span>
                        <span className="font-medium text-blue-600">
                          {(((post.likes?.length || 0) + (post.comments?.length || 0)) / (post.viewsCount || 1) * 100).toFixed(1)}%
                        </span>
                      </span>
                      {hasReaderAccess && (
                        <span className="flex items-center space-x-1">
                          <span>👀 Like Rate:</span>
                          <span className="font-medium text-red-600">
                            {((post.likes?.length || 0) / (post.viewsCount || 1) * 100).toFixed(1)}%
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Analytics Button */}
                <div className="ml-4">
                  <AdvancedAnalyticsButton 
                    post={post} 
                    userPlan={userPlan} 
                    isAuthor={true} 
                  />
                </div>
              </div>
            </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MyPostsAnalytics;
