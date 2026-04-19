import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDraftsAPI, updatePostStatusAPI, deletePostAPI } from '../../APIServices/posts/postsAPI';
import { FaEdit, FaTrash, FaEye, FaCalendar, FaClock } from 'react-icons/fa';
import AlertMessage from '../Alert/AlertMessage';

const DashboardDrafts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishData, setPublishData] = useState({
    status: 'published',
    scheduledFor: ''
  });

  const queryClient = useQueryClient();

  const { data: draftsData, isLoading, error } = useQuery({
    queryKey: ['user-drafts', currentPage],
    queryFn: () => getUserDraftsAPI({ page: currentPage, limit: 10 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, statusData }) => updatePostStatusAPI(postId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-drafts']);
      setShowPublishModal(false);
      setSelectedDraft(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePostAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-drafts']);
    },
  });

  const handlePublish = (draft) => {
    setSelectedDraft(draft);
    setPublishData({ status: 'published', scheduledFor: '' });
    setShowPublishModal(true);
  };

  const handleSchedule = (draft) => {
    setSelectedDraft(draft);
    setPublishData({ status: 'scheduled', scheduledFor: '' });
    setShowPublishModal(true);
  };

  const handleSubmitPublish = async () => {
    if (!selectedDraft) return;

    const statusData = {
      status: publishData.status,
      ...(publishData.status === 'scheduled' && { scheduledFor: publishData.scheduledFor })
    };

    await updateStatusMutation.mutateAsync({
      postId: selectedDraft._id,
      statusData
    });
  };

  const handleDelete = async (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(draftId);
    }
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
        <h2 className="text-2xl font-bold text-white">My Drafts</h2>
        <div className="text-sm text-gray-500">
          {draftsData?.totalDrafts || 0} draft{draftsData?.totalDrafts !== 1 ? 's' : ''}
        </div>
      </div>

      {draftsData?.drafts?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-white mb-2">No drafts yet</h3>
          <p className="text-gray-400">Start writing to create your first draft!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draftsData?.drafts?.map((draft) => (
            <div
              key={draft._id}
              className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {draft.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {draft.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="h-4 w-4" />
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="h-4 w-4" />
                      {new Date(draft.updatedAt).toLocaleTimeString()}
                    </span>
                    {draft.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {draft.category.categoryName}
                      </span>
                    )}
                  </div>

                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {draft.tags.map((tag, index) => (
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
                    onClick={() => handlePublish(draft)}
                    className="px-3 py-2 bg-green-600 text-white text-sm  hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleSchedule(draft)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm  hover:bg-blue-700 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleDelete(draft._id)}
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
      {draftsData?.pagination && draftsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-white/20  disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-2">
            Page {currentPage} of {draftsData.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === draftsData.pagination.totalPages}
            className="px-3 py-2 border border-white/20  disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Publish/Schedule Modal */}
      {showPublishModal && selectedDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {publishData.status === 'published' ? 'Publish Draft' : 'Schedule Draft'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {publishData.status === 'published' ? 'Publish Status' : 'Schedule Date & Time'}
                </label>
                {publishData.status === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={publishData.scheduledFor}
                    onChange={(e) => setPublishData({ ...publishData, scheduledFor: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-white/20  focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitPublish}
                  disabled={updateStatusMutation.isPending || (publishData.status === 'scheduled' && !publishData.scheduledFor)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Processing...' : 
                   publishData.status === 'published' ? 'Publish Now' : 'Schedule Post'}
                </button>
                <button
                  onClick={() => setShowPublishModal(false)}
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

export default DashboardDrafts;




