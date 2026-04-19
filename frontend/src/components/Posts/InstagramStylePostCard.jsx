import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaComment, FaEye, FaShare, FaBookmark, FaCrown } from 'react-icons/fa';
import { hasCommentAndLike, hasReaderAnalytics, PLAN_TIERS } from '../../utils/planUtils';
import { Link } from 'react-router-dom';

const InstagramStylePostCard = ({ post, userPlan, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [localLikes, setLocalLikes] = useState(post.likes || 0);
  const localViews = post.views || 0;

  const hasLikeAccess = hasCommentAndLike(userPlan);
  const hasViewAnalytics = hasReaderAnalytics(userPlan);
  const isPremiumUser = userPlan === PLAN_TIERS.PREMIUM;
  const isProUser = userPlan === PLAN_TIERS.PRO;

  const handleLike = () => {
    if (!hasLikeAccess) return;
    
    setIsLiked(!isLiked);
    setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);
    if (onLike) onLike(post._id);
  };

  const handleComment = () => {
    if (!hasLikeAccess || !comment.trim()) return;
    
    if (onComment) onComment(post._id, comment);
    setComment('');
    setShowComments(false);
  };

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg overflow-hidden border border-white/10 border-white/10 hover:shadow-xl transition-all duration-300">
      {/* Post Header */}
      <div className="p-4 border-b border-white/5 border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/user/${post.author?._id}`} className="flex-shrink-0">
              <img
                src={post.author?.profilePicture || '/default-avatar.png'}
                alt={post.author?.username}
                className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
              />
            </Link>
            <div>
              <Link 
                to={`/user/${post.author?._id}`}
                className="font-semibold text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {post.author?.username}
                {(isPremiumUser || isProUser) && (
                  <FaCrown className="inline ml-2 text-yellow-500" size={14} />
                )}
              </Link>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FaBookmark size={16} />
          </button>
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative aspect-square">
          <img
            src={typeof post.image === 'string' ? post.image : post.image.url || post.image.path || post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <h2 className="font-bold text-lg text-white mb-2">
          {post.title}
        </h2>
        <div 
          className="text-gray-300 text-sm line-clamp-3"
          dangerouslySetInnerHTML={{ __html: post.description }}
        />
        
        {/* Post Stats - Only for Premium+ users */}
        {hasViewAnalytics && (
          <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-white/5 border-white/10">
            <div className="flex items-center space-x-1 text-gray-400">
              <FaEye size={14} />
              <span className="text-xs">{localViews.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <FaComment size={14} />
              <span className="text-xs">{post.comments?.length || 0} comments</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!hasLikeAccess}
              className={`flex items-center space-x-1 transition-colors ${
                hasLikeAccess
                  ? isLiked
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={!hasLikeAccess ? 'Upgrade to Premium to like posts' : ''}
            >
              <FaHeart size={20} />
              <span className="text-sm font-medium">{localLikes}</span>
              {!hasLikeAccess && <span className="text-xs">🔒</span>}
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              disabled={!hasLikeAccess}
              className={`flex items-center space-x-1 transition-colors ${
                hasLikeAccess
                  ? 'text-gray-500 hover:text-blue-500'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={!hasLikeAccess ? 'Upgrade to Premium to comment on posts' : ''}
            >
              <FaComment size={20} />
              {!hasLikeAccess && <span className="text-xs">🔒</span>}
            </button>

            {/* Share Button */}
            <button className="text-gray-500 hover:text-green-500 transition-colors">
              <FaShare size={20} />
            </button>
          </div>

          {/* View Full Post */}
          <Link
            to={`/posts/${post._id}`}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View Full Post
          </Link>
        </div>

        {/* Comment Section */}
        {showComments && hasLikeAccess && (
          <div className="mt-4 pt-4 border-t border-white/5 border-white/10">
            <div className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-white/20 border-white/20  text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white  text-sm font-medium transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {!hasLikeAccess && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20  border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Unlock Interactive Features
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Like, comment, and view analytics with Premium
                </p>
              </div>
              <Link
                to="/plan-management"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1  text-xs font-medium transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

InstagramStylePostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    author: PropTypes.shape({
      username: PropTypes.string,
      profilePicture: PropTypes.string
    }),
    likes: PropTypes.number,
    views: PropTypes.number,
    comments: PropTypes.array,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  userPlan: PropTypes.string.isRequired,
  onLike: PropTypes.func,
  onComment: PropTypes.func
};

export default InstagramStylePostCard;
