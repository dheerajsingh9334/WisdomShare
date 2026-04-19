import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserScheduledPostsAPI, updatePostStatusAPI, deletePostAPI } from '../../APIServices/posts/postsAPI';
import { FaEdit, FaTrash, FaCalendar, FaClock, FaPlay } from 'react-icons/fa';
import AlertMessage from '../Alert/AlertMessage';

const DashboardScheduled = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    status: 'scheduled',
    scheduledFor: ''
  });

  const queryClient = useQueryClient();

  const { data: scheduledData, isLoading, error } = useQuery({
    queryKey: ['user-scheduled', currentPage],
    queryFn: () => getUserScheduledPostsAPI(currentPage, 10),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, statusData }) => updatePostStatusAPI(postId, statusData.status, statusData.scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-scheduled']);
      setShowEditModal(false);
      setSelectedPost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-scheduled']);
    },
  });

  const handlePublishNow = (post) => {
    setSelectedPost(post);
    setEditData({ status: 'published', scheduledFor: '' });
    setShowEditModal(true);
  };

  const handleEditSchedule = (post) => {
    setSelectedPost(post);
    setEditData({ 
      status: 'scheduled', 
      scheduledFor: new Date(post.scheduledFor).toISOString().slice(0, 16)
    });
    setShowEditModal(true);
  };

  const handleMoveToDraft = (post) => {
    setSelectedPost(post);
    setEditData({ status: 'draft', scheduledFor: '' });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedPost) return;

    const statusData = {
      status: editData.status,
      ...(editData.status === 'scheduled' && { scheduledFor: editData.scheduledFor })
    };

    await updateStatusMutation.mutateAsync({
      postId: selectedPost._id,
      statusData
    });
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this scheduled post? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(postId);
    }
  };

  const getTimeUntilScheduled = (scheduledDate) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diff = scheduled - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Function to decode HTML entities and clean content
  const decodeHtmlEntities = (text) => {
    if (!text) return '';
    
    // First decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    let decodedText = textarea.value;
    
    // Clean up common code snippets and HTML tags
    decodedText = decodedText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\{.*?\}/g, '') // Remove JSX/JS code blocks
      .replace(/\/\*.*?\*\//g, '') // Remove JS comments
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\|.*?\|/g, '') // Remove pipe-separated content
      .replace(/\^.*?$/gm, '') // Remove caret-prefixed lines
      .replace(/\d+\|/g, '') // Remove line numbers
      .trim();
    
    // Limit length and add ellipsis if too long
    if (decodedText.length > 200) {
      decodedText = decodedText.substring(0, 200) + '...';
    }
    
    return decodedText || 'No description available';
  };

  // Helper function to safely display category
  const getCategoryDisplay = (category) => {
    if (!category) return null;
    
    if (typeof category === 'string') {
      return category;
    } else if (typeof category === 'object' && category !== null) {
      return category.categoryName || category.name || 'Unknown Category';
    }
    
    return 'Unknown Category';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <AlertMessage type="error" message={error.message} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Scheduled Posts</h2>
        <div className="text-sm text-gray-500">
          {scheduledData?.totalScheduled || 0} scheduled post{scheduledData?.totalScheduled !== 1 ? 's' : ''}
        </div>
      </div>

      {scheduledData?.scheduledPosts?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-medium text-white mb-2">No scheduled posts</h3>
          <p className="text-gray-400">Schedule your drafts to publish automatically!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledData?.scheduledPosts?.map((post) => (
            <div
              key={post._id}
              className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {decodeHtmlEntities(post.description)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="h-4 w-4" />
                      {new Date(post.scheduledFor).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="h-4 w-4" />
                      {new Date(post.scheduledFor).toLocaleTimeString()}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {getTimeUntilScheduled(post.scheduledFor)}
                    </span>
                    {post.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getCategoryDisplay(post.category)}
                      </span>
                    )}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handlePublishNow(post)}
                    className="px-3 py-2 bg-green-600 text-white text-sm  hover:bg-green-700 transition-colors"
                  >
                    <FaPlay className="h-3 w-3 mr-1" />
                    Publish Now
                  </button>
                  <button
                    onClick={() => handleEditSchedule(post)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm  hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit className="h-3 w-3 mr-1" />
                    Edit Schedule
                  </button>
                  <button
                    onClick={() => handleMoveToDraft(post)}
                    className="px-3 py-2 bg-gray-600 text-white text-sm  hover:bg-gray-700 transition-colors"
                  >
                    Move to Draft
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 bg-red-600 text-white text-sm  hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {scheduledData?.pagination && scheduledData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-white/20  disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-2">
            Page {currentPage} of {scheduledData.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === scheduledData.pagination.totalPages}
            className="px-3 py-2 border border-white/20  disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editData.status === 'published' ? 'Publish Now' : 
               editData.status === 'scheduled' ? 'Edit Schedule' : 'Move to Draft'}
            </h3>
            
            <div className="space-y-4">
              {editData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.scheduledFor}
                    onChange={(e) => setEditData({ ...editData, scheduledFor: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-white/20  focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitEdit}
                  disabled={updateStatusMutation.isPending || (editData.status === 'scheduled' && !editData.scheduledFor)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Processing...' : 
                   editData.status === 'published' ? 'Publish Now' : 
                   editData.status === 'scheduled' ? 'Update Schedule' : 'Move to Draft'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white  hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScheduled;




