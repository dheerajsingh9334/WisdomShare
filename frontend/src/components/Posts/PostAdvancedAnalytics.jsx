import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaHeart, FaComment, FaChartLine, FaCrown, FaTimes, FaTrash, FaFlag } from 'react-icons/fa';
import { hasReaderAnalytics, PLAN_TIERS } from '../../utils/planUtils';
import { Link } from 'react-router-dom';

const PostAdvancedAnalytics = ({ userPlan, isAuthor, onDeleteComment, onFlagComment }) => {
  const [activeTab, setActiveTab] = useState('views');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const hasAnalyticsAccess = hasReaderAnalytics(userPlan);

  // Mock data - replace with actual API calls
  const [analyticsData, setAnalyticsData] = useState({
    views: [
      { id: 1, user: { username: 'john_doe', profilePicture: '/avatar1.jpg', plan: 'Premium' }, timestamp: '2025-08-20T10:30:00Z', location: 'New York, USA' },
      { id: 2, user: { username: 'jane_smith', profilePicture: '/avatar2.jpg', plan: 'Pro' }, timestamp: '2025-08-20T09:15:00Z', location: 'London, UK' },
      { id: 3, user: { username: 'mike_wilson', profilePicture: '/avatar3.jpg', plan: 'Free' }, timestamp: '2025-08-20T08:45:00Z', location: 'Toronto, CA' }
    ],
    likes: [
      { id: 1, user: { username: 'sarah_connor', profilePicture: '/avatar4.jpg', plan: 'Premium' }, timestamp: '2025-08-20T11:20:00Z' },
      { id: 2, user: { username: 'alex_turner', profilePicture: '/avatar5.jpg', plan: 'Pro' }, timestamp: '2025-08-20T10:05:00Z' }
    ],
    comments: [
      { 
        id: 1, 
        user: { username: 'emma_watson', profilePicture: '/avatar6.jpg', plan: 'Premium' }, 
        content: 'Great post! Very insightful.',
        timestamp: '2025-08-20T12:15:00Z',
        likes: 3,
        isApproved: true
      },
      { 
        id: 2, 
        user: { username: 'david_smith', profilePicture: '/avatar7.jpg', plan: 'Free' }, 
        content: 'Thanks for sharing this information.',
        timestamp: '2025-08-20T11:30:00Z',
        likes: 1,
        isApproved: true
      }
    ]
  });

  const handleDeleteComment = (commentId) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
    // Update local state
    setAnalyticsData(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== commentId)
    }));
  };

  const handleFlagComment = (commentId) => {
    if (onFlagComment) {
      onFlagComment(commentId);
    }
  };

  const UserModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">User Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <img src={user.profilePicture} alt={user.username} className="w-16 h-16 rounded-full" />
          <div>
            <h4 className="font-medium text-white">{user.username}</h4>
            <span className={`px-2 py-1  text-xs ${
              user.plan === 'Pro' ? 'bg-purple-100 text-purple-800' :
              user.plan === 'Premium' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-100'
            }`}>
              {user.plan} Plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasAnalyticsAccess) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700  p-6">
        <div className="text-center">
          <FaCrown className="mx-auto text-4xl text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
            Advanced Analytics
          </h3>
          <p className="text-purple-600 dark:text-purple-300 mb-4">
            See who views, likes, and comments on your posts with detailed insights.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
              👥 Reader Demographics
            </span>
            <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
              📊 Engagement Stats
            </span>
            <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
              🌍 Geographic Data
            </span>
          </div>
          <Link
            to="/plan-management"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3  font-medium transition-colors inline-flex items-center space-x-2"
          >
            <FaCrown />
            <span>Upgrade to Pro</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <FaChartLine className="text-purple-500" />
            <span>Advanced Analytics</span>
            <FaCrown className="text-yellow-500" />
          </h2>
          <span className="bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
            Pro Feature
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 border-white/10">
        <button
          onClick={() => setActiveTab('views')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'views'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FaEye />
            <span>Views ({analyticsData.views.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'likes'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FaHeart />
            <span>Likes ({analyticsData.likes.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FaComment />
            <span>Comments ({analyticsData.comments.length})</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'views' && (
          <div className="space-y-3">
            {analyticsData.views.map((view) => (
              <div key={view.id} className="flex items-center justify-between p-3 bg-gray-50 bg-white/5 ">
                <div className="flex items-center space-x-3">
                  <img
                    src={view.user.profilePicture}
                    alt={view.user.username}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => {setSelectedUser(view.user); setShowModal(true);}}
                  />
                  <div>
                    <p className="font-medium text-white">{view.user.username}</p>
                    <p className="text-xs text-gray-400">{view.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(view.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(view.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="space-y-3">
            {analyticsData.likes.map((like) => (
              <div key={like.id} className="flex items-center justify-between p-3 bg-gray-50 bg-white/5 ">
                <div className="flex items-center space-x-3">
                  <img
                    src={like.user.profilePicture}
                    alt={like.user.username}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => {setSelectedUser(like.user); setShowModal(true);}}
                  />
                  <div>
                    <p className="font-medium text-white">{like.user.username}</p>
                    <span className={`px-2 py-1  text-xs ${
                      like.user.plan === 'Pro' ? 'bg-purple-100 text-purple-800' :
                      like.user.plan === 'Premium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-100'
                    }`}>
                      {like.user.plan}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaHeart className="text-red-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(like.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-3">
            {analyticsData.comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-gray-50 bg-white/5 ">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={comment.user.profilePicture}
                      alt={comment.user.username}
                      className="w-10 h-10 rounded-full cursor-pointer"
                      onClick={() => {setSelectedUser(comment.user); setShowModal(true);}}
                    />
                    <div>
                      <p className="font-medium text-white">{comment.user.username}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isAuthor && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFlagComment(comment.id)}
                        className="text-yellow-500 hover:text-yellow-600 p-1"
                        title="Flag comment"
                      >
                        <FaFlag size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Delete comment"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <FaHeart className="text-red-400" />
                    <span>{comment.likes} likes</span>
                  </span>
                  <span className={`px-2 py-1  ${
                    comment.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comment.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => {setShowModal(false); setSelectedUser(null);}} 
        />
      )}
    </div>
  );
};

PostAdvancedAnalytics.propTypes = {
  userPlan: PropTypes.string.isRequired,
  isAuthor: PropTypes.bool,
  onDeleteComment: PropTypes.func,
  onFlagComment: PropTypes.func
};

export default PostAdvancedAnalytics;
