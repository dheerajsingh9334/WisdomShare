import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  sendNotificationAPI, 
  sendDirectMessageAPI,
  sendNotificationToAllAPI,
  getAllUsersAPI
} from '../../APIServices/admin/adminAPI';
import { 
  BellIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// Icon component to render dynamic icons
const IconComponent = ({ name, className = "h-5 w-5" }) => {
  const icons = {
    ShieldCheckIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserPlusIcon,
    MegaphoneIcon,
    ChartBarIcon,
    UsersIcon,
    InformationCircleIcon
  };
  
  const Icon = icons[name];
  return Icon ? <Icon className={className} /> : <BellIcon className={className} />;
};

const NotificationManagement = () => {
  const queryClient = useQueryClient();
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'admin',
    priority: 'normal'
  });
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'admin',
    priority: 'normal'
  });
  const [directMessageData, setDirectMessageData] = useState({
    userId: '',
    message: '',
    priority: 'normal',
    messageType: 'personal'
  });

  // Enhanced notification types for all admin actions
  const notificationTypes = [
    { value: 'admin', label: 'Admin Message', icon: 'ShieldCheckIcon', color: 'blue', description: 'General admin communications' },
    { value: 'system', label: 'System Update', icon: 'CogIcon', color: 'blue', description: 'Platform system changes' },
    { value: 'maintenance', label: 'Maintenance', icon: 'ExclamationTriangleIcon', color: 'yellow', description: 'Scheduled maintenance notifications' },
    { value: 'update', label: 'Platform Update', icon: 'CheckCircleIcon', color: 'green', description: 'New features and improvements' },
    { value: 'warning', label: 'Warning', icon: 'ExclamationTriangleIcon', color: 'red', description: 'Important warnings and alerts' },
    { value: 'announcement', label: 'Announcement', icon: 'MegaphoneIcon', color: 'purple', description: 'General announcements' },
    { value: 'feature', label: 'New Feature', icon: 'CheckCircleIcon', color: 'green', description: 'Feature releases' },
    { value: 'security', label: 'Security Alert', icon: 'XCircleIcon', color: 'red', description: 'Security-related notifications' },
    { value: 'plan', label: 'Plan Update', icon: 'ChartBarIcon', color: 'indigo', description: 'Subscription plan changes' },
    { value: 'content', label: 'Content Moderation', icon: 'ExclamationTriangleIcon', color: 'orange', description: 'Content policy updates' },
    { value: 'welcome', label: 'Welcome Message', icon: 'UserPlusIcon', color: 'green', description: 'New user welcome messages' },
    { value: 'admin_welcome', label: 'Admin Welcome', icon: 'ShieldCheckIcon', color: 'purple', description: 'New admin welcome messages' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'gray', description: 'Informational updates' },
    { value: 'normal', label: 'Normal', color: 'blue', description: 'Standard notifications' },
    { value: 'high', label: 'High', color: 'orange', description: 'Important updates' },
    { value: 'urgent', label: 'Urgent', color: 'red', description: 'Critical alerts' }
  ];

  // Fetch users for dropdown
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => getAllUsersAPI({ limit: 100 }),
  });

  

  const sendNotificationMutation = useMutation({
    mutationFn: ({ userId, notificationData }) => {
      
      return sendNotificationAPI(userId, notificationData);
    },
    onSuccess: (data) => {
      
      setShowIndividualModal(false);
      setFormData({ userId: '', title: '', message: '', type: 'admin', priority: 'normal' });
      alert('Notification sent successfully!');
    },
    onError: (error) => {
      
      alert('Failed to send notification: ' + (error.message || 'Unknown error'));
    }
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: (notificationData) => {
      
      return sendNotificationToAllAPI(notificationData);
    },
    onSuccess: (data) => {
      
      setShowBroadcastModal(false);
      setBroadcastData({ title: '', message: '', type: 'admin', priority: 'normal' });
      
      // Invalidate notification queries so users can see new notifications
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notification-count']);
      
      alert('Broadcast notification sent successfully! All users will now see this notification.');
    },
    onError: (error) => {
      
      alert('Failed to send broadcast notification: ' + error.message);
    }
  });

  const sendDirectMessageMutation = useMutation({
    mutationFn: ({ userId, messageData }) => {
      
      return sendDirectMessageAPI(userId, messageData);
    },
    onSuccess: (data) => {
      
      setShowDirectMessageModal(false);
      setDirectMessageData({ userId: '', message: '', priority: 'normal', messageType: 'personal' });
      
      // Invalidate admin notification queries
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
      
      alert(`Direct message sent successfully to ${data.recipient.username}!`);
    },
    onError: (error) => {
      
      alert('Failed to send direct message: ' + (error.message || 'Unknown error'));
    }
  });

  const handleSendIndividualNotification = () => {
    
    if (!formData.userId || !formData.userId.trim()) {
      alert('Please select a valid user');
      return;
    }
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.message || !formData.message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    
    sendNotificationMutation.mutate({
      userId: formData.userId.trim(),
      notificationData: {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority
      }
    });
  };

  const handleSendBroadcastNotification = () => {
    if (broadcastData.title && broadcastData.message) {
      
      sendBroadcastMutation.mutate({
        title: broadcastData.title.trim(),
        message: broadcastData.message.trim(),
        type: broadcastData.type,
        priority: broadcastData.priority
      });
    }
  };

  const handleSendDirectMessage = () => {
    if (!directMessageData.userId || !directMessageData.userId.trim()) {
      alert('Please select a valid user');
      return;
    }
    if (!directMessageData.message || !directMessageData.message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    
    sendDirectMessageMutation.mutate({
      userId: directMessageData.userId.trim(),
      messageData: {
        message: directMessageData.message.trim(),
        priority: directMessageData.priority,
        messageType: directMessageData.messageType
      }
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'gray',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'blue';
  };

  const getTypeColor = (type) => {
    const typeObj = notificationTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'blue';
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">Notification Management</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Send notifications to individual users or broadcast to all users</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
          <a href="/notifications" target="_blank" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">View User Notifications</a>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <a href="/settings" target="_blank" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">User Settings</a>
        </div>

        {/* Direct Message */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-start mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30  flex-shrink-0">
              <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1">Direct Message</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">Send personal message to specific user</p>
            </div>
          </div>
          <button
            onClick={() => setShowDirectMessageModal(true)}
            className="w-full bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5  hover:bg-purple-700 flex items-center justify-center text-xs sm:text-sm lg:text-base transition-colors"
          >
            <PaperAirplaneIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Send Direct Message</span>
          </button>
        </div>
      </div>

      {/* Notification Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {/* Individual Notification */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-start mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30  flex-shrink-0">
              <BellIcon className="h-4 w-4 sm:h-5 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1">Individual Notification</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">Send notification to a specific user</p>
            </div>
          </div>
          <button
            onClick={() => setShowIndividualModal(true)}
            className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5  hover:bg-blue-700 flex items-center justify-center text-xs sm:text-sm lg:text-base transition-colors"
          >
            <PaperAirplaneIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Send Individual Notification</span>
          </button>
        </div>

        {/* Broadcast Notification */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-start mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30  flex-shrink-0">
              <BellIcon className="h-4 w-4 sm:h-5 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1">Broadcast Notification</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">Send notification to all users</p>
            </div>
          </div>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="w-full bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5  hover:bg-green-700 flex items-center justify-center text-xs sm:text-sm lg:text-base transition-colors"
          >
            <PaperAirplaneIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Send Broadcast Notification</span>
          </button>
        </div>
      </div>

      {/* Notification Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  p-3 sm:p-4 lg:p-6 overflow-hidden">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3">Notification Guidelines</h3>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">
            • Individual notifications are sent to specific users by their user ID
          </div>
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">
            • Broadcast notifications are sent to all regular users (not admins)
          </div>
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">
            • Keep notifications concise and relevant
          </div>
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">
            • Use appropriate notification types (admin, system, update, etc.)
          </div>
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">
            • Notifications will appear in users&apos; notification center
          </div>
        </div>
      </div>

      {/* Individual Notification Modal */}
      {showIndividualModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-4 sm:top-10 lg:top-20 mx-auto p-3 sm:p-4 lg:p-5 border w-full max-w-xs sm:max-w-sm lg:max-w-md shadow-lg  bg-black/50 backdrop-blur-xl border border-white/10 text-white overflow-hidden">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Send Individual Notification</h3>
              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Select User</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Select a user...</option>
                    {usersData?.users?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm resize-none"
                    rows="3"
                    placeholder="Notification message"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowIndividualModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-white/20 border-white/20  hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendIndividualNotification}
                  disabled={!formData.userId.trim() || !formData.title.trim() || !formData.message.trim()}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-4 sm:top-10 lg:top-20 mx-auto p-3 sm:p-4 lg:p-5 border w-full max-w-xs sm:max-w-sm lg:max-w-md shadow-lg  bg-black/50 backdrop-blur-xl border border-white/10 text-white overflow-hidden">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Send Broadcast Notification</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">This will send a notification to all regular users.</p>
              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Message</label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm resize-none"
                    rows="3"
                    placeholder="Notification message"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Type</label>
                    <select
                      value={broadcastData.type}
                      onChange={(e) => setBroadcastData({...broadcastData, type: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Priority</label>
                    <select
                      value={broadcastData.priority}
                      onChange={(e) => setBroadcastData({...broadcastData, priority: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-white/20 border-white/20  hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBroadcastNotification}
                  disabled={!broadcastData.title.trim() || !broadcastData.message.trim()}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white  hover:bg-green-700 disabled:opacity-50"
                >
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {showDirectMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-4 sm:top-10 lg:top-20 mx-auto p-3 sm:p-4 lg:p-5 border w-full max-w-xs sm:max-w-sm lg:max-w-md shadow-lg  bg-black/50 backdrop-blur-xl border border-white/10 text-white overflow-hidden">
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Send Direct Message</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Send a personal message to a specific user.</p>
              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Select User</label>
                  <select
                    value={directMessageData.userId}
                    onChange={(e) => setDirectMessageData({...directMessageData, userId: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">Select a user...</option>
                    {usersData?.users?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300">Message</label>
                  <textarea
                    value={directMessageData.message}
                    onChange={(e) => setDirectMessageData({...directMessageData, message: e.target.value})}
                    className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm resize-none"
                    rows="4"
                    placeholder="Your personal message to the user..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Message Type</label>
                    <select
                      value={directMessageData.messageType}
                      onChange={(e) => setDirectMessageData({...directMessageData, messageType: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      <option value="personal">Personal Message</option>
                      <option value="support">Support Response</option>
                      <option value="warning">Warning/Notice</option>
                      <option value="approval">Approval/Rejection</option>
                      <option value="general">General Communication</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Priority</label>
                    <select
                      value={directMessageData.priority}
                      onChange={(e) => setDirectMessageData({...directMessageData, priority: e.target.value})}
                      className="mt-1 w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 dark:text-white text-xs sm:text-sm"
                    >
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowDirectMessageModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-white/20 border-white/20  hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendDirectMessage}
                  disabled={!directMessageData.userId.trim() || !directMessageData.message.trim()}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-600 text-white  hover:bg-purple-700 disabled:opacity-50"
                >
                  Send Direct Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;




