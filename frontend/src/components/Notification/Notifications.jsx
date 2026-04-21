import React from "react";
import { 
  FaBell, 
  FaUser, 
  FaComment, 
  FaHeart, 
  FaShare, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaDollarSign, 
  FaCrown, 
  FaExclamationTriangle, 
  FaTrophy, 
  FaTimes, 
  FaCheck,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaTrashAlt,
  FaBlog
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";

const Notifications = () => {

  // Use shared notification context - no more duplicate API calls!
  const {
    notifications,
    unreadCount,
    filteredNotifications,
    isLoading,
    error,
    filter,
    setFilter,
    showUnreadOnly,
    setShowUnreadOnly,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteAllNotificationsMutation
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_follower':
        return <FaUser className="text-blue-500" />;
      case 'new_post_from_following':
        return <FaBlog className="text-green-500" />;
      case 'new_comment':
        return <FaComment className="text-green-500" />;
      case 'new_like':
        return <FaHeart className="text-red-500" />;
      case 'new_share':
        return <FaShare className="text-purple-500" />;
      case 'post_approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'post_rejected':
        return <FaTimesCircle className="text-red-500" />;
              // case 'earnings_update': // Earnings functionality removed
        return <FaDollarSign className="text-yellow-500" />;
      case 'plan_upgrade':
        return <FaCrown className="text-yellow-500" />;
      case 'plan_expiry':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'achievement_unlocked':
        return <FaTrophy className="text-yellow-500" />;
      case 'admin':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'system':
        return <FaBell className="text-blue-500" />;
      case 'update':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'announcement':
        return <FaBell className="text-purple-500" />;
      case 'system_announcement':
        return <FaBell className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    const { type, metadata, message, title } = notification;
    
    // Handle admin notifications specially with contact info
    if (type === 'admin' && (title || message)) {
      return (
        <div className="w-full overflow-hidden">
          {title && (
            <div className="font-semibold text-red-600 dark:text-red-400 mb-1 break-words">
              {title}
            </div>
          )}
          <div className="text-gray-300 mb-2 break-words">
            {message}
          </div>
          
          {/* Admin Contact Information */}
          {metadata?.additionalData?.adminContact && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  overflow-hidden">
              <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                📧 Contact Admin:
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 break-words">
                {metadata.additionalData.adminContact.username && (
                  <div className="break-words">
                    <span className="font-medium">Admin:</span> {metadata.additionalData.adminContact.username}
                  </div>
                )}
                {metadata.additionalData.adminContact.email && (
                  <div className="break-words">
                    <span className="font-medium">Email:</span> {metadata.additionalData.adminContact.email}
                  </div>
                )}
                {metadata.additionalData.adminContact.role && (
                  <div className="break-words">
                    <span className="font-medium">Role:</span> {metadata.additionalData.adminContact.role}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (metadata?.actorName && metadata?.action) {
      return (
        <div className="w-full overflow-hidden">
          <span className="font-semibold text-white break-words">
            {metadata.actorName}
          </span>
          <span className="text-gray-400 break-words"> {metadata.action}</span>
          {metadata.targetType && (
            <span className="text-gray-400 break-words"> your {metadata.targetType}</span>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-300 break-words">{message || 'Notification'}</span>;
  };

  const getNotificationLink = (notification) => {
    const { type, metadata } = notification;
    
    switch (type) {
      case 'new_follower':
        return `/user/${metadata?.actorId}`;
      case 'new_comment':
      case 'new_like':
      case 'new_share':
        return `/posts/${metadata?.targetId}`;
      case 'post_approved':
      case 'post_rejected':
        return `/dashboard/posts`;
      case 'plan_upgrade':
      case 'plan_expiry':
        return `/dashboard/plan-management`;
      default:
        return '#';
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Error loading notifications: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="flex items-center space-x-3">
              <FaBell className="text-2xl sm:text-3xl text-green-600 dark:text-green-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Notifications
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  {unreadCount?.unreadCount || 0} unread notifications
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
              {unreadCount?.unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 glass-premium-button text-white  hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <FaCheck className="mr-2" />
                  Mark all as read
                </button>
              )}
              
              {notifications && notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  disabled={deleteAllNotificationsMutation.isPending}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <FaTrashAlt className="mr-2" />
                  Delete all
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm text-gray-400">Filter:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="new_follower">Followers</option>
              <option value="new_comment">Comments</option>
              <option value="new_like">Likes</option>
              <option value="new_share">Shares</option>
              <option value="post_approved">Post Approval</option>
              <option value="post_rejected">Post Rejection</option>
              <option value="plan_upgrade">Plan Updates</option>
              <option value="plan_expiry">Plan Expiry</option>
              <option value="achievement_unlocked">Achievements</option>
              <option value="admin">Admin Notifications</option>
              <option value="system">System Notifications</option>
              <option value="system_announcement">System Announcements</option>
            </select>

            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-3 py-2  text-sm font-medium transition-colors ${
                showUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-300'
              }`}
            >
              {showUnreadOnly ? <FaEye className="mr-2" /> : <FaEyeSlash className="mr-2" />}
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-12 text-center">
              <FaBell className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-400">
                {showUnreadOnly 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-neutral-900/40 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-4 sm:p-6 transition-all duration-200 ${
                  !notification.isRead 
                    ? 'ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10' 
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 bg-white/5 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {getNotificationContent(notification)}
                        
                        {notification.metadata?.additionalData && (
                          <div className="mt-2 text-sm text-gray-400 overflow-hidden">
                            {/* Render additional data safely with proper overflow handling */}
                            <div className="break-words max-w-full">
                              {typeof notification.metadata.additionalData === 'string' 
                                ? notification.metadata.additionalData
                                : (
                                  <details className="cursor-pointer">
                                    <summary className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                      View Additional Data
                                    </summary>
                                    <div className="mt-2 p-2 bg-gray-100 bg-white/5  text-xs font-mono break-all overflow-x-auto">
                                      {JSON.stringify(notification.metadata.additionalData, null, 2)}
                                    </div>
                                  </details>
                                )
                              }
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-start sm:justify-end space-x-2 sm:ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={markAsReadMutation.isPending}
                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Mark as read"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {getNotificationLink(notification) !== '#' && (
                          <Link
                            to={getNotificationLink(notification)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View details"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          disabled={deleteNotificationMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                {notification.priority && notification.priority !== 'medium' && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium break-words ${
                      notification.priority === 'urgent' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : notification.priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {notification.priority === 'urgent' && <FaExclamationTriangle className="mr-1" />}
                      {notification.priority === 'high' && <FaExclamationTriangle className="mr-1" />}
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
