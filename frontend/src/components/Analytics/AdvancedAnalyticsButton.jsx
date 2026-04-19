import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaHeart, FaComment, FaChartLine, FaTimes, FaLock, FaClock } from 'react-icons/fa';
import { hasAnalytics, hasReaderAnalytics } from '../../utils/planUtils';
import { getPostAnalyticsAPI } from '../../APIServices/posts/postsAPI';

const AdvancedAnalyticsButton = ({ post, userPlan, isAuthor = false }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const hasAnalyticsAccess = hasAnalytics(userPlan);
  const hasReaderAccess = hasReaderAnalytics(userPlan);

  // Fetch detailed analytics when opening modal
  const fetchAnalytics = useCallback(async () => {
    if (!post?._id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getPostAnalyticsAPI(post._id);
      setAnalyticsData(response.analytics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      // Fallback to basic post data
      setAnalyticsData({
        totalViews: post.viewsCount || 0,
        totalLikes: post.likes?.length || 0,
        totalComments: post.comments?.length || 0,
        viewers: post.viewers || [],
        likers: post.likes || [],
        comments: post.comments || []
      });
    } finally {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (showAnalytics && !analyticsData) {
      fetchAnalytics();
    }
  }, [showAnalytics, analyticsData, fetchAnalytics]);

  if (!hasAnalyticsAccess || !isAuthor) {
    return null;
  }

  const handleDeleteComment = (commentId) => {
    // Handle comment deletion
    console.log('Deleting comment:', commentId);
  };

  return (
    <>
      <button
        onClick={() => setShowAnalytics(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-all rounded-none group"
        title="View Advanced Analytics"
      >
        <FaChartLine size={16} className="group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Analytics</span>
        <FaLock size={10} className="text-black/40" />
      </button>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 text-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/5">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 border border-white/20">
                  <FaChartLine className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tighter uppercase">Advanced Analytics</h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Detailed performance insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 border border-transparent hover:border-white/10"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-white"></div>
                  <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Processing Data</span>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="text-white mb-4 text-sm font-bold uppercase tracking-widest">⚠️ Data Retrieval Error</div>
                  <div className="text-xs text-gray-400 mb-8">{error}</div>
                  <button 
                    onClick={fetchAnalytics}
                    className="px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-all rounded-none"
                  >
                    Retry Request
                  </button>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Stats Overview */}
                  <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 mb-8 overflow-hidden rounded-none">
                    <div className="bg-white/5 p-8 text-center group hover:bg-white/10 transition-colors">
                      <FaEye className="mx-auto text-gray-400 group-hover:text-white transition-colors mb-4" size={28} />
                      <div className="text-4xl font-light text-white mb-1 tracking-tight">{analyticsData.totalViews}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Views</div>
                    </div>
                    <div className="bg-white/5 p-8 text-center group hover:bg-white/10 transition-colors">
                      <FaHeart className="mx-auto text-gray-400 group-hover:text-white transition-colors mb-4" size={28} />
                      <div className="text-4xl font-light text-white mb-1 tracking-tight">{analyticsData.totalLikes}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Likes</div>
                    </div>
                    <div className="bg-white/5 p-8 text-center group hover:bg-white/10 transition-colors">
                      <FaComment className="mx-auto text-gray-400 group-hover:text-white transition-colors mb-4" size={28} />
                      <div className="text-4xl font-light text-white mb-1 tracking-tight">{analyticsData.totalComments}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Comments</div>
                    </div>
                  </div>

                  {/* Detailed Analytics Tabs */}
                  <div className="space-y-8">
                    {/* Who Viewed */}
                    {hasReaderAccess && (
                      <div className="bg-white/[0.02] border border-white/10 p-6 rounded-none">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center uppercase tracking-widest">
                          <FaEye className="mr-3 text-white/40" />
                          Audience Reach
                          <span className="ml-3 bg-white text-black text-[10px] px-2 py-0.5 font-bold">PRO</span>
                        </h3>
                        <div className="space-y-4">
                          {analyticsData.viewers.length > 0 ? analyticsData.viewers.map((viewer, index) => (
                            <div key={viewer._id || index} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={viewer.profilePicture || '/default-avatar.png'}
                                  alt={viewer.username || 'User'}
                                  className="w-10 h-10 rounded-none object-cover border border-white/10"
                                />
                                <div>
                                  <p className="font-bold text-sm text-white">{viewer.username || 'Anonymous'}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-tight">Recent Engagement</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center">
                                  <FaClock className="mr-2" size={10} />
                                  Just Now
                                </p>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 text-xs py-8 uppercase tracking-[0.2em] bg-white/5 border border-dashed border-white/10">
                              No audience data available
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Who Liked */}
                    <div className="bg-white/[0.02] border border-white/10 p-6 rounded-none">
                      <h3 className="text-sm font-bold text-white mb-6 flex items-center uppercase tracking-widest">
                        <FaHeart className="mr-3 text-white/40" />
                        Engagement Appreciation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analyticsData.likers.length > 0 ? analyticsData.likers.map((liker, index) => (
                          <div key={liker._id || index} className="flex items-center space-x-4 p-4 bg-white/5 border border-white/5">
                            <img
                              src={liker.profilePicture || '/default-avatar.png'}
                              alt={liker.username || 'User'}
                              className="w-10 h-10 rounded-none object-cover border border-white/10"
                            />
                            <p className="font-bold text-sm text-white">{liker.username || 'Anonymous'}</p>
                          </div>
                        )) : (
                          <div className="col-span-full text-center text-gray-500 text-xs py-8 uppercase tracking-[0.2em] bg-white/5 border border-dashed border-white/10">
                            No appreciation recorded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments Management */}
                    <div className="bg-white/[0.02] border border-white/10 p-6 rounded-none">
                      <h3 className="text-sm font-bold text-white mb-6 flex items-center uppercase tracking-widest">
                        <FaComment className="mr-3 text-white/40" />
                        Editorial Control
                        <span className="ml-3 border border-white/20 text-gray-400 text-[10px] px-2 py-0.5 font-bold">AUTHOR</span>
                      </h3>
                      <div className="space-y-4">
                        {analyticsData.comments && analyticsData.comments.length > 0 ? analyticsData.comments.map((comment, index) => (
                          <div key={comment._id || index} className="p-6 bg-white/5 border border-white/5 group relative">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <img
                                  src={comment.author?.profilePicture || '/default-avatar.png'}
                                  alt={comment.author?.username || 'User'}
                                  className="w-10 h-10 rounded-none object-cover border border-white/10"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <p className="font-bold text-sm text-white">{comment.author?.username || 'Anonymous'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center">
                                      <FaClock className="mr-2" size={10} />
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <p className="text-gray-400 text-sm leading-relaxed">{comment.content || comment.text || 'No content'}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-gray-600 hover:text-white transition-colors p-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                                title="Delete comment"
                              >
                                <FaTimes size={16} />
                              </button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 text-xs py-8 uppercase tracking-[0.2em] bg-white/5 border border-dashed border-white/10">
                            No discourse recorded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AdvancedAnalyticsButton.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    viewsCount: PropTypes.number,
    likes: PropTypes.array,
    comments: PropTypes.array,
    viewers: PropTypes.array
  }).isRequired,
  userPlan: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  isAuthor: PropTypes.bool
};

export default AdvancedAnalyticsButton;
