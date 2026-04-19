import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaEye, FaHeart, FaComment, FaSearch, FaClock, FaTimes, FaTrash, FaUser, FaLock } from 'react-icons/fa';
import { getUserPublishedPostsAPI, getPostAnalyticsAPI } from '../../APIServices/posts/postsAPI';
import { deleteCommentAPI } from '../../APIServices/comments/commentsAPI';
import { hasAnalytics, getPlanTier, PLAN_TIERS } from '../../utils/planUtils';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import PlanUpgradePrompt from '../Plans/PlanUpgradePrompt';

const PostManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTab, setSelectedTab] = useState('views'); // views, likes, comments
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { userAuth } = useSelector((state) => state.auth);
  const { canAccessFeature, userPlan: planAccess } = usePlanAccess();
  
  // Extract plan name properly - handle both string and object formats
  const getPlanName = (plan) => {
    if (typeof plan === 'string') return plan;
    if (typeof plan === 'object' && plan?.planName) return plan.planName;
    if (typeof plan === 'object' && plan?.name) return plan.name;
    return 'Free';
  };
  
  const userPlan = getPlanName(userAuth?.plan);
  const hasAnalyticsAccess = hasAnalytics(userPlan);
  
  // Check if user has Pro plan for detailed view access
  const userTier = getPlanTier(planAccess);
  const hasProAccess = userTier === PLAN_TIERS.PRO;
  
  const queryClient = useQueryClient();

  console.log('PostManagement - User Plan Name:', userPlan);
  console.log('PostManagement - Has Analytics Access:', hasAnalyticsAccess);
  console.log('PostManagement - User Tier:', userTier);
  console.log('PostManagement - Has Pro Access:', hasProAccess);
  console.log('PostManagement - Raw Plan Object:', userAuth?.plan);

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      console.log('Delete mutation called for comment:', commentId);
      return await deleteCommentAPI(commentId);
    },
    onSuccess: async (data, commentId) => {
      console.log('Delete mutation successful, refreshing data...');
      console.log('Deleted comment ID:', commentId);
      
      try {
        // Immediately refresh the post details to show updated data
        if (selectedPost) {
          console.log('Re-fetching post details for:', selectedPost._id);
          await fetchPostDetails(selectedPost);
        }
        
        // Also invalidate the posts list query to ensure counts are updated
        queryClient.invalidateQueries(["user-posts-management"]);
        
        console.log('Successfully refreshed post data after comment deletion');
      } catch (error) {
        console.error('Error refreshing data after comment deletion:', error);
      }
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete comment';
      alert(`Error: ${errorMessage}. Please try again.`);
    }
  });

  // Fetch user's posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["user-posts-management"],
    queryFn: getUserPublishedPostsAPI,
  });

  const posts = postsData?.posts || [];
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch detailed post analytics
  const fetchPostDetails = async (post) => {
    setSelectedPost(post);
    setLoading(true);
    try {
      if (hasAnalyticsAccess) {
        console.log('Fetching analytics for post:', post._id);
        const response = await getPostAnalyticsAPI(post._id);
        console.log('Analytics response:', response);
        setPostDetails(response.analytics);
      } else {
        console.log('Using basic post data (no analytics access)');
        // Use basic post data if no analytics access
        setPostDetails({
          totalViews: post.viewsCount || 0,
          totalLikes: post.likes?.length || 0,
          totalComments: post.comments?.length || 0,
          viewers: post.viewers || [],
          likers: post.likes || [],
          comments: post.comments || []
        });
      }
    } catch (error) {
      console.error('Error fetching post details:', error.response?.data || error.message);
      // Fallback to basic post data
      const fallbackData = {
        totalViews: post.viewsCount || post.viewers?.length || 0,
        totalLikes: post.likes?.length || 0,
        totalComments: post.comments?.length || 0,
        viewers: post.viewers || [],
        likers: post.likes || [],
        comments: post.comments || []
      };
      console.log('Using fallback data:', fallbackData);
      setPostDetails(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    console.log('Attempting to delete comment:', commentId);
    
    if (!commentId) {
      console.error('No comment ID provided');
      alert('Error: Comment ID is missing');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        console.log('User confirmed deletion, calling API...');
        console.log('Current user auth:', userAuth?.id);
        console.log('Deleting comment with ID:', commentId);
        
        await deleteCommentMutation.mutateAsync(commentId);
        console.log('Comment deleted successfully');
        
        // Show success message
        alert('Comment deleted successfully!');
        
      } catch (error) {
        console.error('Delete comment failed:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete comment';
        alert(`Failed to delete comment: ${errorMessage}`);
      }
    } else {
      console.log('User cancelled deletion');
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setPostDetails(null);
    setSelectedTab('views');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-400">Loading your posts...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Post Management
        </h1>
        <p className="text-gray-400">
          Manage your posts and see detailed engagement information
        </p>
      </div>

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

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <FaComment className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Create your first post to see it here'}
          </p>
        </div>
      ) : (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr 
                    key={post._id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${hasProAccess ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => hasProAccess && fetchPostDetails(post)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {post.title || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {post.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {post.category?.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FaEye className="text-blue-600" />
                          <span>{post.viewsCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaHeart className="text-red-600" />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaComment className="text-green-600" />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchPostDetails(post);
                        }}
                        className={`flex items-center space-x-1 ${
                          hasProAccess 
                            ? "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" 
                            : "text-gray-400"
                        }`}
                        title={hasProAccess ? "View detailed analytics" : "Pro plan required for detailed analytics"}
                      >
                        {hasProAccess ? (
                          <>
                            <FaEye className="text-xs" />
                            <span>View Details</span>
                          </>
                        ) : (
                          <>
                            <FaLock className="text-xs" />
                            <span>Pro Only</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 border-white/10 bg-gradient-to-r from-blue-600 to-purple-600">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPost.title}</h2>
                <p className="text-blue-100 text-sm">Post Management Details</p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 border-white/10">
              <button
                onClick={() => setSelectedTab('views')}
                className={`px-6 py-3 text-sm font-medium ${
                  selectedTab === 'views'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaEye className="inline mr-2" />
                Views ({postDetails?.totalViews || 0})
              </button>
              <button
                onClick={() => setSelectedTab('likes')}
                className={`px-6 py-3 text-sm font-medium ${
                  selectedTab === 'likes'
                    ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaHeart className="inline mr-2" />
                Likes ({postDetails?.totalLikes || 0})
              </button>
              <button
                onClick={() => setSelectedTab('comments')}
                className={`px-6 py-3 text-sm font-medium ${
                  selectedTab === 'comments'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FaComment className="inline mr-2" />
                Comments ({postDetails?.totalComments || 0})
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-400">Loading details...</span>
                </div>
              ) : !hasProAccess ? (
                // Pro plan required for detailed views
                <div className="text-center py-12">
                  <FaLock className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Pro Feature Required
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Upgrade to Pro to see detailed viewer analytics, including who viewed, liked, and commented on your posts.
                  </p>
                  <PlanUpgradePrompt 
                    feature="Detailed Analytics"
                    currentPlan={userTier}
                    requiredPlan="Pro"
                    variant="compact"
                  />
                </div>
              ) : (
                <div>
                  {/* Views Tab */}
                  {selectedTab === 'views' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Who Viewed Your Post
                      </h3>
                      {postDetails?.viewers && postDetails.viewers.length > 0 ? (
                        <div className="space-y-3">
                          {postDetails.viewers.map((viewer, index) => (
                            <div key={viewer._id || index} className="flex items-center justify-between p-3 bg-gray-50 bg-white/5 ">
                              <div className="flex items-center space-x-3">
                                <Link 
                                  to={`/user/${viewer._id}`}
                                  className="relative hover:opacity-80 transition-opacity"
                                  title="View Profile"
                                >
                                  {viewer.profilePicture ? (
                                    <img
                                      src={typeof viewer.profilePicture === 'string' 
                                        ? viewer.profilePicture 
                                        : viewer.profilePicture?.url || viewer.profilePicture
                                      }
                                      alt={viewer.username || 'User'}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10 border-white/20 hover:border-blue-400 transition-colors cursor-pointer"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium border-2 border-white/10 border-white/20 hover:border-blue-400 transition-colors cursor-pointer"
                                    style={{ display: viewer.profilePicture ? 'none' : 'flex' }}
                                  >
                                    <FaUser />
                                  </div>
                                </Link>
                                <div>
                                  <Link 
                                    to={`/user/${viewer._id}`}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    <p className="font-medium text-white">
                                      {viewer.username || 'Anonymous User'}
                                    </p>
                                  </Link>
                                  <p className="text-sm text-gray-400">
                                    {viewer.email ? `${viewer.email}` : 'Viewer'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400 flex items-center">
                                  <FaClock className="mr-1" size={12} />
                                  {viewer.viewedAt ? new Date(viewer.viewedAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <FaEye className="mx-auto text-4xl mb-4" />
                          <p>No views yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Likes Tab */}
                  {selectedTab === 'likes' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Who Liked Your Post
                      </h3>
                      {postDetails?.likers && postDetails.likers.length > 0 ? (
                        <div className="space-y-3">
                          {postDetails.likers.map((liker, index) => (
                            <div key={liker._id || index} className="flex items-center justify-between p-3 bg-gray-50 bg-white/5 ">
                              <div className="flex items-center space-x-3">
                                <Link 
                                  to={`/user/${liker._id}`}
                                  className="relative hover:opacity-80 transition-opacity"
                                  title="View Profile"
                                >
                                  {liker.profilePicture ? (
                                    <img
                                      src={typeof liker.profilePicture === 'string' 
                                        ? liker.profilePicture 
                                        : liker.profilePicture?.url || liker.profilePicture
                                      }
                                      alt={liker.username || 'User'}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10 border-white/20 hover:border-red-400 transition-colors cursor-pointer"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-medium border-2 border-white/10 border-white/20 hover:border-red-400 transition-colors cursor-pointer"
                                    style={{ display: liker.profilePicture ? 'none' : 'flex' }}
                                  >
                                    <FaHeart />
                                  </div>
                                </Link>
                                <div>
                                  <Link 
                                    to={`/user/${liker._id}`}
                                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  >
                                    <p className="font-medium text-white">
                                      {liker.username || 'Anonymous User'}
                                    </p>
                                  </Link>
                                  <p className="text-sm text-gray-400">
                                    {liker.email ? `${liker.email}` : 'Liked your post'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400 flex items-center">
                                  <FaClock className="mr-1" size={12} />
                                  {liker.likedAt ? new Date(liker.likedAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <FaHeart className="mx-auto text-4xl mb-4" />
                          <p>No likes yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments Tab */}
                  {selectedTab === 'comments' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Comments on Your Post
                      </h3>
                      {postDetails?.comments && postDetails.comments.length > 0 ? (
                        <div className="space-y-4">
                          {postDetails.comments.map((comment, index) => (
                            <div key={comment._id || index} className="p-4 bg-gray-50 bg-white/5 ">
                              <div className="flex items-start space-x-3">
                                <Link 
                                  to={`/user/${comment.author?._id}`}
                                  className="relative hover:opacity-80 transition-opacity"
                                  title="View Profile"
                                >
                                  {comment.author?.profilePicture ? (
                                    <img
                                      src={typeof comment.author.profilePicture === 'string' 
                                        ? comment.author.profilePicture 
                                        : comment.author.profilePicture?.url || comment.author.profilePicture
                                      }
                                      alt={comment.author?.username || 'User'}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10 border-white/20 hover:border-green-400 transition-colors cursor-pointer"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium border-2 border-white/10 border-white/20 hover:border-green-400 transition-colors cursor-pointer"
                                    style={{ display: comment.author?.profilePicture ? 'none' : 'flex' }}
                                  >
                                    <FaComment />
                                  </div>
                                </Link>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Link 
                                        to={`/user/${comment.author?._id}`}
                                        className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                      >
                                        <p className="font-medium text-white">
                                          {comment.author?.username || 'Anonymous User'}
                                        </p>
                                      </Link>
                                      <p className="text-sm text-gray-400 flex items-center">
                                        <FaClock className="mr-1" size={12} />
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                                      </p>
                                    </div>
                                    {comment._id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        disabled={deleteCommentMutation.isPending}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1  transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete Comment"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    {comment.content || comment.text || 'No content'}
                                  </p>
                                  {comment.author?.email && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {comment.author.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <FaComment className="mx-auto text-4xl mb-4" />
                          <p>No comments yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
