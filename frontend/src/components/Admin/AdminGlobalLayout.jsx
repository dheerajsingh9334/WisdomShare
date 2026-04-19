import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../redux/slices/adminAuthSlice";
import { adminLogoutAPI } from "../../APIServices/admin/adminAuthAPI";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  fetchAdminNotificationsAPI,
  getAdminUnreadCountAPI,
  markAllAdminNotificationsReadAPI,
  deleteAllAdminNotificationsAPI,
  deleteAdminNotificationAPI,
  readAdminNotificationAPI
} from "../../APIServices/admin/adminAPI";
import PropTypes from "prop-types";
import { 
  FaShieldAlt, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaTags,
  FaBell,
  FaSearch,
  FaHome,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCreditCard,
  FaHeart,
  FaShare,
  FaTrophy,
  FaSun,
  FaMoon,
  FaCrown,
  FaBlog
} from "react-icons/fa";

const AdminGlobalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { adminAuth } = useSelector((state) => state.adminAuth);

  // Initialize dark mode on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Real notifications
  const { refetch: refetchNotifications, error: notificationsError, isLoading: notificationsLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      
      
      const result = await fetchAdminNotificationsAPI();
      
      return result;
    },
    refetchInterval: 30000,
    enabled: !!adminAuth,
    onSuccess: (data) => {
      
      setNotifications(data || []);
    },
          onError: () => {
        
      }
  });

  
  useEffect(() => {
    
  }, [notifications]);

  
  useEffect(() => {
    
  }, [adminAuth]);

  const { data: unreadData } = useQuery({
    queryKey: ['admin-notification-count'],
    queryFn: getAdminUnreadCountAPI,
    refetchInterval: 30000,
    enabled: !!adminAuth,
          onError: () => {
        
      }
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAdminNotificationsReadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllAdminNotificationsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
    }
  });

  const deleteOneMutation = useMutation({
    mutationFn: deleteAdminNotificationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
    }
  });

  const readOneMutation = useMutation({
    mutationFn: readAdminNotificationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-count']);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
    
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogoutAPI();
      dispatch(adminLogout());
      navigate("/admin/auth/login");
    } catch (error) {
      
      // Force logout even if API fails
      dispatch(adminLogout());
      navigate("/admin/auth/login");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleConfirmLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      handleLogout();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_follower':
        return <FaUser className="text-blue-500" />;
      case 'new_post_from_following':
        return <FaBlog className="text-green-500" />;
      case 'new_comment':
        return <FaComments className="text-green-500" />;
      case 'new_like':
        return <FaHeart className="text-red-500" />;
      case 'new_share':
        return <FaShare className="text-purple-500" />;
      case 'post_approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'post_rejected':
        return <FaTimes className="text-red-500" />;
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

  const menuItems = [
    {
      name: 'Dashboard',
      icon: FaHome,
      path: '/admin/dashboard',
      description: 'Overview and statistics'
    },
    {
      name: 'User Management',
      icon: FaUsers,
      path: '/admin/users',
      description: 'Manage users and roles'
    },
    {
      name: 'Post Management',
      icon: FaFileAlt,
      path: '/admin/posts',
      description: 'Manage posts and content'
    },
    {
      name: 'Comment Management',
      icon: FaComments,
      path: '/admin/comments',
      description: 'Moderate comments'
    },
    {
      name: 'Category Management',
      icon: FaTags,
      path: '/admin/categories',
      description: 'Manage content categories'
    },
    {
      name: 'Plan Management',
      icon: FaCreditCard,
      path: '/admin/plans',
      description: 'Manage subscription plans'
    },
    {
      name: 'Notifications',
      icon: FaBell,
      path: '/admin/notifications',
      description: 'Send notifications'
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-black/50 backdrop-blur-3xl border-r border-white/10 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-white/10 border-white/10 bg-gradient-to-r from-red-600 to-red-700">
            <div className="flex items-center">
              <FaShieldAlt className="text-lg sm:text-xl md:text-2xl text-white mr-2 sm:mr-3" />
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2  text-white hover:bg-red-700 transition-colors"
            >
              <FaTimes className="h-4 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-white/10 border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-2 overflow-y-auto">
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FaSearch className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No menu items found</p>
              </div>
            ) : (
              filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left  transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-r-2 border-red-700 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 transition-colors ${
                      isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium transition-colors text-sm sm:text-base ${
                        isActive ? 'text-red-700 dark:text-red-300' : 'text-white group-hover:text-white dark:group-hover:text-white'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs sm:text-sm transition-colors ${
                        isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-white/10 border-white/10 bg-gray-50 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <FaUser className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{adminAuth?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-400 truncate">{adminAuth?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-0 lg:ml-72 flex-1 min-h-screen">
        {/* Top navbar */}
        <div className="bg-black/50 backdrop-blur-3xl shadow-sm border-b border-white/10 sticky top-0 z-40 min-h-[56px] sm:min-h-[64px]">
          <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-3 sm:py-4 h-14 sm:h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2  text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaBars className="h-4 w-5" />
              </button>
              <h2 className="ml-2 sm:ml-3 md:ml-4 text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                {menuItems.find(item => isActivePath(item.path))?.name || 'Admin Panel'}
              </h2>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                
                    setShowNotifications(!showNotifications);
                  }}
                  className="relative p-2  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={`Notifications: ${notifications.length} total, ${unreadData?.unreadCount || 0} unread`}
                >
                  <FaBell className={`h-4 w-5 ${
                    notificationsLoading ? 'text-blue-500 animate-pulse' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                  {unreadData?.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                    </span>
                  )}
                  {notificationsLoading && (
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 py-2 z-50 max-h-96 overflow-y-auto">
                    {/* Header with title and buttons */}
                    <div className="px-3 sm:px-4 py-2 border-b border-white/10 border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white text-sm sm:text-base">
                            🔔 Notifications
                            {notifications.length > 0 && (
                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                {notifications.length}
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                                                  <button
                          onClick={() => refetchNotifications()}
                          className={`text-xs px-2 py-1  transition-colors ${
                            notificationsLoading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                          title="Refresh notifications"
                          disabled={notificationsLoading}
                        >
                          {notificationsLoading ? '⏳' : '🔄'}
                        </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/v1/admin/notifications/test', {
                                  credentials: 'include'
                                });
                                const data = await response.json();
                        
                                alert(`Test successful: ${data.message}`);
                              } catch (error) {
                        
                                alert('Test failed: ' + error.message);
                              }
                            }}
                            className="text-xs px-2 py-1 bg-green-600 text-white  hover:bg-green-700 transition-colors"
                            title="Test API endpoint"
                          >
                            🧪
                          </button>
                        </div>
                      </div>
                      

                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 sm:gap-2 mt-2">
                        {unreadData?.unreadCount > 0 && (
                          <button
                            onClick={() => markAllMutation.mutate()}
                            className="text-xs px-2 py-1 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => deleteAllMutation.mutate()}
                            className="text-xs px-2 py-1 bg-red-600 text-white  hover:bg-red-700 transition-colors"
                          >
                            Delete all
                          </button>
                        )}
                      </div>
                    </div>
                    {notificationsLoading ? (
                      <div className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-xs text-gray-400">Loading notifications...</p>
                      </div>
                    ) : notificationsError ? (
                      <div className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                        <div className="text-red-500 mb-2">⚠️ Error Loading Notifications</div>
                        <p className="text-xs text-gray-400 mb-2">
                          {notificationsError.message || 'Unknown error occurred'}
                        </p>
                        <button
                          onClick={() => refetchNotifications()}
                          className="text-xs px-3 py-1 bg-red-600 text-white  hover:bg-red-700 transition-colors"
                        >
                          🔄 Retry
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 sm:px-4 py-6 sm:py-8 text-center">
                        <FaBell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No notifications</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Notifications will appear here when received
                        </p>

                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => {
                
                        return (
                          <div key={n._id || n.id} className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-white/5 border-white/20 last:border-b-0 transition-colors ${
                            !n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 bg-white/5 flex items-center justify-center">
                                  {getNotificationIcon(n.type)}
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                                      {n.title || n.message?.substring(0, 50) || n.type || 'Notification'}
                                    </p>
                                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                      {n.message || n.description || n.content || 'No message content'}
                                    </p>
                                    
                                    {/* Debug: Show raw notification data if no structured content */}
                                    {!n.message && !n.description && !n.content && (
                                      <div className="mt-2 text-xs text-gray-400">
                                        <details className="cursor-pointer">
                                          <summary className="hover:text-gray-700 dark:hover:text-gray-300">
                                            🔍 Debug: Raw Notification Data
                                          </summary>
                                          <div className="mt-1 p-2 bg-gray-50 bg-white/5  text-xs">
                                            <pre className="whitespace-pre-wrap break-words">
                                              {JSON.stringify(n, null, 2)}
                                            </pre>
                                          </div>
                                        </details>
                                      </div>
                                    )}
                                    
                                    {/* Show additional details for admin notifications */}
                                    {n.type === 'admin' && n.metadata?.additionalData?.adminContact && (
                                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  text-xs">
                                        <div className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                                          📧 Contact Admin:
                                        </div>
                                        <div className="text-blue-700 dark:text-blue-300 space-y-1">
                                          {n.metadata.additionalData.adminContact.username && (
                                            <div><span className="font-medium">Admin:</span> {n.metadata.additionalData.adminContact.username}</div>
                                          )}
                                          {n.metadata.additionalData.adminContact.email && (
                                            <div><span className="font-medium">Email:</span> {n.metadata.additionalData.adminContact.email}</div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Show metadata if available */}
                                    {n.metadata && Object.keys(n.metadata).length > 0 && (
                                      <div className="mt-2 text-xs text-gray-400">
                                        <details className="cursor-pointer">
                                          <summary className="hover:text-gray-700 dark:hover:text-gray-300">
                                            📋 Additional Details
                                          </summary>
                                          <div className="mt-1 p-2 bg-gray-50 bg-white/5  text-xs">
                                            <pre className="whitespace-pre-wrap break-words">
                                              {JSON.stringify(n.metadata, null, 2)}
                                            </pre>
                                          </div>
                                        </details>
                                      </div>
                                    )}
                                    
                                    <p className="text-xs text-gray-400 mt-2">
                                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'No date'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {!n.isRead && (
                                      <button 
                                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20  transition-colors" 
                                        onClick={() => readOneMutation.mutate(n._id)}
                                        title="Mark as read"
                                      >
                                        Read
                                      </button>
                                    )}
                                    <button 
                                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20  transition-colors" 
                                      onClick={() => deleteOneMutation.mutate(n._id)}
                                      title="Delete notification"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Priority badge */}
                            {n.priority && n.priority !== 'medium' && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  n.priority === 'urgent' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : n.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {n.priority === 'urgent' && <FaExclamationTriangle className="mr-1 h-3 w-3" />}
                                  {n.priority === 'high' && <FaExclamationTriangle className="mr-1 h-3 w-3" />}
                                  {n.priority.charAt(0).toUpperCase() + n.priority.slice(1)} Priority
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    
                    {/* View all notifications link */}
                    {notifications.length > 5 && (
                      <div className="px-3 sm:px-4 py-2 border-t border-white/10 border-white/10">
                        <Link
                          to="/admin/notifications"
                          className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all {notifications.length} notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaSun className="h-4 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-4 w-5 text-gray-600" />
                )}
              </button>

              {/* Admin dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden md:block">
                    {adminAuth?.username || 'Admin'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 py-2 z-50">
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 border-white/10">
                      <p className="text-sm font-medium text-white">{adminAuth?.username || 'Admin'}</p>
                      <p className="text-sm text-gray-400">{adminAuth?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaUser className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </div>
                    <div className="border-t border-white/10 border-white/10 pt-1">
                      <button
                        onClick={handleConfirmLogout}
                        className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FaSignOutAlt className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-2 sm:p-3 md:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

AdminGlobalLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminGlobalLayout;

