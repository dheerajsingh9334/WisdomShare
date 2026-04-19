import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  FaComment, 
  FaTrash, 
  FaFlag, 
  FaThumbsUp, 
  FaUserShield,
  FaCrown,
  FaReply
} from 'react-icons/fa';
import { hasCommentAndLike, hasReaderAnalytics } from '../../utils/planUtils';

const CommentManagementSystem = ({ 
  comments = [], 
  userPlan, 
  isAuthor, 
  onDeleteComment,
  onApproveComment,
  onFlagComment,
  onReplyToComment,
  onLikeComment
}) => {
  const [filter, setFilter] = useState('all');
  const [selectedComments, setSelectedComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const hasCommentAccess = hasCommentAndLike(userPlan);
  const hasAnalyticsAccess = hasReaderAnalytics(userPlan);

  // Filter comments based on current filter
  const filteredComments = comments.filter(comment => {
    switch (filter) {
      case 'approved':
        return comment.isApproved;
      case 'pending':
        return !comment.isApproved;
      case 'flagged':
        return comment.isFlagged;
      default:
        return true;
    }
  });

  const handleSelectComment = (commentId) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleBulkAction = (action) => {
    selectedComments.forEach(commentId => {
      switch (action) {
        case 'delete':
          onDeleteComment?.(commentId);
          break;
        case 'approve':
          onApproveComment?.(commentId);
          break;
        case 'flag':
          onFlagComment?.(commentId);
          break;
        default:
          break;
      }
    });
    setSelectedComments([]);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      onReplyToComment?.(replyingTo, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  if (!hasCommentAccess) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700  p-6">
        <div className="text-center">
          <FaComment className="mx-auto text-4xl text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Comment Management
          </h3>
          <p className="text-blue-600 dark:text-blue-300 mb-4">
            Manage comments, replies, and engage with your audience.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
              💬 Comment & Reply
            </span>
            <span className="bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
              👍 Like Comments
            </span>
            <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
              🛡️ Moderation Tools
            </span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  font-medium transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <FaComment className="text-blue-500" />
            <span>Comment Management</span>
            {isAuthor && <FaUserShield className="text-green-500" />}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total: {comments.length}</span>
            {hasAnalyticsAccess && (
              <FaCrown className="text-yellow-500" title="Pro Analytics Available" />
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'approved', 'pending', 'flagged'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 bg-white/5 text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <span className="ml-1 text-xs">
                ({comments.filter(c => {
                  switch (filterType) {
                    case 'approved': return c.isApproved;
                    case 'pending': return !c.isApproved;
                    case 'flagged': return c.isFlagged;
                    default: return true;
                  }
                }).length})
              </span>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {isAuthor && selectedComments.length > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 bg-white/5 ">
            <span className="text-sm text-gray-400">
              {selectedComments.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white  text-sm"
            >
              <FaThumbsUp className="inline mr-1" /> Approve
            </button>
            <button
              onClick={() => handleBulkAction('flag')}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white  text-sm"
            >
              <FaFlag className="inline mr-1" /> Flag
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white  text-sm"
            >
              <FaTrash className="inline mr-1" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredComments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FaComment className="mx-auto text-3xl mb-2" />
            <p>No comments match the current filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Checkbox for bulk selection */}
                  {isAuthor && (
                    <input
                      type="checkbox"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() => handleSelectComment(comment.id)}
                      className="mt-1"
                    />
                  )}

                  {/* User Avatar */}
                  <Link to={`/user/${comment.user._id}`} className="flex-shrink-0">
                    <img
                      src={comment.user.profilePicture || '/default-avatar.png'}
                      alt={comment.user.username}
                      className="w-10 h-10 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                  </Link>

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link 
                        to={`/user/${comment.user._id}`}
                        className="font-medium text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {comment.user.username}
                      </Link>
                      <span className={`px-2 py-1  text-xs ${
                        comment.user.plan === 'Pro' 
                          ? 'bg-purple-100 text-purple-800' 
                          : comment.user.plan === 'Premium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-100'
                      }`}>
                        {comment.user.plan}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-2">
                      {comment.content}
                    </p>

                    {/* Comment Stats */}
                    <div className="flex items-center space-x-4 mb-2">
                      <button
                        onClick={() => onLikeComment?.(comment.id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
                      >
                        <FaThumbsUp />
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
                      >
                        <FaReply />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        comment.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comment.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      {comment.isFlagged && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Flagged
                        </span>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-gray-50 bg-white/5 ">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full p-2 border border-white/20 border-white/20  text-sm resize-none"
                          rows="2"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white  text-sm"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isAuthor && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => onApproveComment?.(comment.id)}
                        className={`p-2  ${
                          comment.isApproved 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={comment.isApproved ? 'Approved' : 'Approve comment'}
                      >
                        <FaThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => onFlagComment?.(comment.id)}
                        className="p-2 text-yellow-500 hover:text-yellow-600"
                        title="Flag comment"
                      >
                        <FaFlag size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteComment?.(comment.id)}
                        className="p-2 text-red-500 hover:text-red-600"
                        title="Delete comment"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

CommentManagementSystem.propTypes = {
  comments: PropTypes.array,
  userPlan: PropTypes.string.isRequired,
  isAuthor: PropTypes.bool,
  onDeleteComment: PropTypes.func,
  onApproveComment: PropTypes.func,
  onFlagComment: PropTypes.func,
  onReplyToComment: PropTypes.func,
  onLikeComment: PropTypes.func
};

export default CommentManagementSystem;
