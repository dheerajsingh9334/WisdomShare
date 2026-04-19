import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCommentsAPI, deleteCommentAPI } from '../../APIServices/admin/adminAPI';
import { 
  MagnifyingGlassIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CommentManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    post: '',
    author: ''
  });

  const queryClient = useQueryClient();

  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: ['admin-comments', filters],
    queryFn: () => getAllCommentsAPI(filters),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteCommentAPI(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 bg-white/5  w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 bg-white/5 "></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading comments: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Comment Management</h2>
        <p className="text-gray-600 dark:text-gray-300">Moderate and manage user comments</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <a href="/posts" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Posts</a>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <a href="/comments" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Comments</a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search comments..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <input
            type="text"
            placeholder="Author username..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="px-4 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <input
            type="text"
            placeholder="Post title..."
            value={filters.post}
            onChange={(e) => handleFilterChange('post', e.target.value)}
            className="px-4 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="px-4 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/50 backdrop-blur-xl border border-white/10 text-white divide-y divide-gray-200 dark:divide-gray-700">
              {commentsData?.comments?.map((comment) => (
                <tr key={comment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm text-white">
                        {comment.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                        {comment.author?.profilePicture ? (
                          <img 
                            src={typeof comment.author.profilePicture === 'string' ? comment.author.profilePicture : (comment.author.profilePicture?.url || comment.author.profilePicture)} 
                            alt={comment.author.username || 'User'}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="text-xs font-medium text-gray-300" style={{ display: comment.author?.profilePicture ? 'none' : 'flex' }}>
                          {comment.author?.username ? comment.author.username.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {comment.author?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {comment.author?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white max-w-xs truncate">
                      {comment.post?.title || 'Post not found'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Comment"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {commentsData?.comments?.map((comment) => (
          <div key={comment._id} className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {comment.author?.profilePicture ? (
                    <img 
                      src={typeof comment.author.profilePicture === 'string' ? comment.author.profilePicture : (comment.author.profilePicture?.url || comment.author.profilePicture)} 
                      alt={comment.author.username || 'User'}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className="text-sm font-medium text-gray-300" style={{ display: comment.author?.profilePicture ? 'none' : 'flex' }}>
                    {comment.author?.username ? comment.author.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">
                    {comment.author?.username || 'Unknown User'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                title="Delete Comment"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-white leading-relaxed">
                {comment.content}
              </p>
            </div>
            
            <div className="text-xs text-gray-400">
              <span className="font-medium">Post:</span> {comment.post?.title || 'Post not found'}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {commentsData?.pagination && (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-4 py-3 flex items-center justify-between border-t border-white/10 border-white/10 sm:px-6 mt-6  border border-white/10 border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(commentsData.pagination.currentPage - 1)}
              disabled={!commentsData.pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-white/20 border-white/20 text-sm font-medium  text-gray-300 bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(commentsData.pagination.currentPage + 1)}
              disabled={!commentsData.pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/20 border-white/20 text-sm font-medium  text-gray-300 bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {((commentsData.pagination.currentPage - 1) * filters.limit) + 1}
                </span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(commentsData.pagination.currentPage * filters.limit, commentsData.pagination.totalComments)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{commentsData.pagination.totalComments}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex  shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(commentsData.pagination.currentPage - 1)}
                  disabled={!commentsData.pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 -l-md border border-white/20 border-white/20 bg-black/50 backdrop-blur-xl border border-white/10 text-white text-sm font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(commentsData.pagination.currentPage + 1)}
                  disabled={!commentsData.pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 -r-md border border-white/20 border-white/20 bg-black/50 backdrop-blur-xl border border-white/10 text-white text-sm font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;




