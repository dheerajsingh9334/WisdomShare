import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  fetchUsersByFollowersAPI, 
  fetchPostsByLikesAPI, 
  fetchPostsByViewsAPI 
} from "../../APIServices/users/usersAPI";
import Avatar from "./Avatar";
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaUsers,
  FaCrown,
  FaFire,
  FaStar,
  FaArrowRight,
  FaExternalLinkAlt
} from "react-icons/fa";

const CreatorsRanking = () => {
  // Fetch all three ranking types
  const { 
    data: followersData, 
    isLoading: followersLoading, 
    error: followersError 
  } = useQuery({
    queryKey: ["users-by-followers"],
    queryFn: fetchUsersByFollowersAPI,
  });

  const { 
    data: likesData, 
    isLoading: likesLoading, 
    error: likesError 
  } = useQuery({
    queryKey: ["posts-by-likes"],
    queryFn: fetchPostsByLikesAPI,
  });

  const { 
    data: viewsData, 
    isLoading: viewsLoading, 
    error: viewsError 
  } = useQuery({
    queryKey: ["posts-by-views"],
    queryFn: fetchPostsByViewsAPI,
  });

  if (followersLoading || likesLoading || viewsLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-none h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Loading Rankings</h2>
          <p className="text-gray-400">Gathering the latest data...</p>
        </div>
      </div>
    );
  }

  if (followersError || likesError || viewsError) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-none flex items-center justify-center mx-auto mb-4">
            <FaCrown className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Error Loading Rankings</h2>
          <p className="text-gray-400 mb-4">
            {followersError?.message || likesError?.message || viewsError?.message || "Something went wrong"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2  hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Process and validate data
  const topFollowers = followersData?.users || [];
  const topLikedPosts = likesData?.posts || [];
  const topViewedPosts = viewsData?.posts || [];

  // Ensure we have meaningful data and show top 10
  const ensureTop10 = (array, maxItems = 10) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, maxItems);
  };

  const top10Followers = ensureTop10(topFollowers);
  const top10LikedPosts = ensureTop10(topLikedPosts);
  const top10ViewedPosts = ensureTop10(topViewedPosts);

  // Get meaningful ranking data
  const getRankingStats = () => {
    const totalCreators = top10Followers.length;
    const totalPosts = Math.max(top10LikedPosts.length, top10ViewedPosts.length);
    const totalEngagement = top10LikedPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    const totalViews = top10ViewedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    return { totalCreators, totalPosts, totalEngagement, totalViews };
  };

  const rankingStats = getRankingStats();

  // Get ranking badge component
  const getRankingBadge = (index) => {
    if (index === 0) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-none flex items-center justify-center shadow-lg">
          <FaTrophy className="text-white text-lg" />
        </div>
      );
    } else if (index === 1) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-500 rounded-none flex items-center justify-center shadow-lg">
          <FaMedal className="text-white text-lg" />
        </div>
      );
    } else if (index === 2) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-700 rounded-none flex items-center justify-center shadow-lg">
          <FaAward className="text-white text-lg" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-none flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">#{index + 1}</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-4 xl:px-6 py-6 sm:py-8">
        {/* Hero Header - Responsive */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none mb-4 sm:mb-6 shadow-lg">
            <FaCrown className="text-white text-2xl sm:text-3xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Creators & Content Rankings
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
            Discover the top creators and trending content that&apos;s shaping our community
          </p>
          
          {/* Enhanced Ranking Statistics - Responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-white/10 border border-white/10 bg-neutral-900/40 backdrop-blur-xl max-w-5xl mx-auto overflow-hidden">
            <div className="p-6 transition-all hover:bg-white/5 group">
              <div className="flex items-center gap-3 mb-2">
                <FaUsers className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-400">Top Creators</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{rankingStats.totalCreators}</div>
              <div className="text-xs text-gray-500">active by followers</div>
            </div>
            
            <div className="p-6 transition-all hover:bg-white/5 group">
              <div className="flex items-center gap-3 mb-2">
                <FaHeart className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-400">Top Posts</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{rankingStats.totalPosts}</div>
              <div className="text-xs text-gray-500">by engagement</div>
            </div>
            
            <div className="p-6 transition-all hover:bg-white/5 group">
              <div className="flex items-center gap-3 mb-2">
                <FaEye className="text-green-500 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-400">Total Views</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{rankingStats.totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-500">across top posts</div>
            </div>
            
            <div className="p-6 transition-all hover:bg-white/5 group">
              <div className="flex items-center gap-3 mb-2">
                <FaFire className="text-orange-500 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-400">Engagement</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{rankingStats.totalEngagement.toLocaleString()}</div>
              <div className="text-xs text-gray-500">likes & reactions</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Most Followers Section */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 hover:bg-black/80 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <FaCrown className="text-8xl text-purple-500" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-none flex items-center justify-center shadow-lg">
                <FaCrown className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Most Followers</h2>
                <p className="text-gray-400">Top creators by community size and influence</p>
                <div className="mt-2 text-sm text-gray-400">
                  {top10Followers.length > 0 ? `Showing top ${Math.min(top10Followers.length, 10)} creators` : 'No data available'}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {top10Followers.length > 0 ? (
                top10Followers.map((user, index) => (
                  <div
                    key={user._id}
                    className="group flex items-center gap-4 p-4  hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700/50"
                  >
                    {/* Ranking Badge */}
                    <div className="flex-shrink-0">
                      {getRankingBadge(index)}
                    </div>

                    {/* User Info with Enhanced Profile Picture */}
                    <Link to={`/user/${user._id}`} className="flex-1 group-hover:scale-105 transition-transform duration-200 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Avatar user={user} size="md" showDefaultImage={true} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-white truncate">
                            {user.name || user.username || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            @{user.username || 'unknown'}
                          </p>
                          {user.bio && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Enhanced Stats */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {user.followersCount || 0}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">followers</div>
                      {user.postsCount && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {user.postsCount} posts
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FaUsers className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No creator data available</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>

          {/* Most Liked Posts Section */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 hover:bg-black/80 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <FaHeart className="text-8xl text-red-500" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-none flex items-center justify-center shadow-lg">
                <FaHeart className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Most Liked Posts</h2>
                <p className="text-gray-400">Top posts by community engagement and likes</p>
                <div className="mt-2 text-sm text-gray-400">
                  {top10LikedPosts.length > 0 ? `Showing top ${Math.min(top10LikedPosts.length, 10)} posts` : 'No data available'}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {top10LikedPosts.length > 0 ? (
                top10LikedPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="group p-4  hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-700/50"
                  >
                    {/* Ranking Badge and Title */}
                    <div className="flex items-center gap-3 mb-3">
                      {getRankingBadge(index)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                          {post.title?.length > 40 ? `${post.title.substring(0, 40)}...` : post.title || "Untitled Post"}
                        </h3>
                        {post.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {post.description.length > 80 ? `${post.description.substring(0, 80)}...` : post.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <Avatar user={post.author} size="sm" showDefaultImage={true} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/user/${post.author._id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors block truncate"
                        >
                          {post.author.name || post.author.username || 'Unknown Author'}
                        </Link>
                        <p className="text-xs text-gray-400 truncate">
                          @{post.author.username || 'unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Post Stats and Actions */}
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/post/${post.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white  hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Read Post
                        <FaArrowRight className="text-sm" />
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <FaHeart className="text-red-500" />
                          <span className="font-semibold text-gray-300">{post.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <FaEye className="text-blue-500" />
                          <span className="font-semibold text-gray-300">{post.views || 0}</span>
                        </span>
                        {post.commentsCount && (
                          <span className="flex items-center gap-2">
                            <FaComment className="text-green-500" />
                            <span className="font-semibold text-gray-300">{post.commentsCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FaHeart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No posts data available</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>

          {/* Most Viewed Posts Section */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 hover:bg-black/80 transition-all duration-300 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <FaEye className="text-8xl text-blue-500" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-none flex items-center justify-center shadow-lg">
                <FaEye className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Most Viewed Posts</h2>
                <p className="text-gray-400">Top posts by reach and audience engagement</p>
                <div className="mt-2 text-sm text-gray-400">
                  {top10ViewedPosts.length > 0 ? `Showing top ${Math.min(top10ViewedPosts.length, 10)} posts` : 'No data available'}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {top10ViewedPosts.length > 0 ? (
                top10ViewedPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="group p-4  hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700/50"
                  >
                    {/* Ranking Badge and Title */}
                    <div className="flex items-center gap-3 mb-3">
                      {getRankingBadge(index)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {post.title?.length > 40 ? `${post.title.substring(0, 40)}...` : post.title || "Untitled Post"}
                        </h3>
                        {post.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {post.description.length > 80 ? `${post.description.substring(0, 80)}...` : post.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <Avatar user={post.author} size="sm" showDefaultImage={true} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/user/${post.author._id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors block truncate"
                        >
                          {post.author.name || post.author.username || 'Unknown Author'}
                        </Link>
                        <p className="text-xs text-gray-400 truncate">
                          @{post.author.username || 'unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Post Stats and Actions */}
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/post/${post.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white  hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Read Post
                        <FaExternalLinkAlt className="text-sm" />
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <FaEye className="text-blue-500" />
                          <span className="font-semibold text-gray-300">{post.views || 0}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <FaHeart className="text-red-500" />
                          <span className="font-semibold text-gray-300">{post.likesCount || 0}</span>
                        </span>
                        {post.commentsCount && (
                          <span className="flex items-center gap-2">
                            <FaComment className="text-green-500" />
                            <span className="font-semibold text-gray-300">{post.commentsCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FaEye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No posts data available</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-none border border-white/20 shadow-lg">
            <FaFire className="text-orange-500" />
            <span className="text-sm text-gray-400">
              Rankings updated in real-time • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Additional Ranking Insights */}
        {rankingStats.totalCreators > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10/60 backdrop-blur-sm  p-6 border border-white/20 border-white/10/50">
              <h3 className="text-lg font-semibold text-white mb-3">Ranking Insights</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Top creator has {top10Followers[0]?.followersCount || 0} followers</p>
                <p>• Most engaged post has {top10LikedPosts[0]?.likesCount || 0} likes</p>
                <p>• Highest viewed post has {top10ViewedPosts[0]?.views || 0} views</p>
                <p>• Total community engagement: {rankingStats.totalEngagement.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10/60 backdrop-blur-sm  p-6 border border-white/20 border-white/10/50">
              <h3 className="text-lg font-semibold text-white mb-3">How Rankings Work</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• <strong>Followers:</strong> Based on community size and influence</p>
                <p>• <strong>Likes:</strong> Measured by post engagement and reactions</p>
                <p>• <strong>Views:</strong> Calculated from post reach and audience</p>
                <p>• Rankings update automatically every hour</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CreatorsRanking;
