import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userProfileAPI } from '../../APIServices/users/usersAPI';
import { getUserPublishedPostsAPI, getUserDraftsAPI, getUserScheduledPostsAPI } from '../../APIServices/posts/postsAPI';
import { usePlanAccess } from '../../hooks/usePlanAccess';
// import PlanUpgradePrompt from '../Plans/PlanUpgradePrompt';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaSpinner
} from 'react-icons/fa';

const ContentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: userData } = useQuery({
    queryKey: ["profile"],
    queryFn: userProfileAPI,
  });

  // Fetch real data from APIs
  const { data: publishedPosts, isLoading: publishedLoading } = useQuery({
    queryKey: ["user-published-posts"],
    queryFn: () => getUserPublishedPostsAPI(1, 100), // Get more posts for calendar
  });

  const { data: draftsData, isLoading: draftsLoading } = useQuery({
    queryKey: ["user-drafts"],
    queryFn: () => getUserDraftsAPI(1, 100),
  });

  const { data: scheduledData, isLoading: scheduledLoading } = useQuery({
    queryKey: ["user-scheduled-posts"],
    queryFn: () => getUserScheduledPostsAPI(1, 100),
  });

  // const {  userPlan } = usePlanAccess();

  // Check if user can access content calendar
  // const canAccess = canAccessFeature("content_calendar");

  // Transform real data into calendar events
  const transformPostsToEvents = () => {
    const events = [];

    // Add published posts
    if (publishedPosts?.posts) {
      publishedPosts.posts.forEach(post => {
        events.push({
          id: post._id,
          title: post.title,
          date: new Date(post.publishedAt || post.createdAt),
          time: new Date(post.publishedAt || post.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'published',
          type: 'post',
          description: post.description,
          post: post
        });
      });
    }

    // Add drafts
    if (draftsData?.drafts) {
      draftsData.drafts.forEach(post => {
        events.push({
          id: post._id,
          title: post.title,
          date: new Date(post.createdAt),
          time: new Date(post.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'draft',
          type: 'post',
          description: post.description,
          post: post
        });
      });
    }

    // Add scheduled posts
    if (scheduledData?.scheduledPosts) {
      scheduledData.scheduledPosts.forEach(post => {
        events.push({
          id: post._id,
          title: post.title,
          date: new Date(post.scheduledFor),
          time: new Date(post.scheduledFor).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'scheduled',
          type: 'post',
          description: post.description,
          post: post
        });
      });
    }

    return events;
  };

  const events = transformPostsToEvents();
  const isLoading = publishedLoading || draftsLoading || scheduledLoading;

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-100 bg-white/5 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <FaCheckCircle className="text-green-600" />;
      case 'scheduled': return <FaClock className="text-blue-600" />;
      case 'draft': return <FaEdit className="text-yellow-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  // Navigate calendar
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[80px] border border-white/10 border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-white'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1  truncate ${getStatusColor(event.status)}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-400">Loading your content calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📅 Content Calendar
              </h1>
              <p className="text-gray-400">
                Plan and schedule your content effectively
              </p>
            </div>
            <Link
              to="/dashboard/create-post"
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white  transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Create New Post
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 border-white/10">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold text-white">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-300">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-0">
                  {renderCalendar()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {formatDate(selectedDate)}
              </h3>
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="border border-white/10 border-white/10  p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(event.status)}
                          <span className="ml-2 font-medium text-white">
                            {event.title}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Link
                            to={`/edit-post/${event.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit Post
                          </Link>
                          <Link 
                            to={`/posts/${event.id}`}
                            className="text-gray-400 hover:text-green-600"
                            title="View Post"
                          >
                            <FaExternalLinkAlt />
                          </Link>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {event.time} • {event.description}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No content for this date
                  </p>
                )}
              </div>
            </div>

            {/* Content Stats */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Content Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Published</span>
                  <span className="font-medium text-green-600">
                    {events.filter(e => e.status === 'published').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scheduled</span>
                  <span className="font-medium text-blue-600">
                    {events.filter(e => e.status === 'scheduled').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Drafts</span>
                  <span className="font-medium text-yellow-600">
                    {events.filter(e => e.status === 'draft').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="font-medium text-white">
                    {events.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link 
                  to="/dashboard/create-post"
                  className="w-full text-left px-3 py-2  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
                >
                  <FaEdit className="inline mr-2 text-blue-500" />
                  Create New Post
                </Link>
                <Link 
                  to="/dashboard/drafts"
                  className="w-full text-left px-3 py-2  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
                >
                  <FaEdit className="inline mr-2 text-yellow-500" />
                  View Drafts
                </Link>
                <Link 
                  to="/dashboard/scheduled"
                  className="w-full text-left px-3 py-2  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
                >
                  <FaClock className="inline mr-2 text-green-500" />
                  Scheduled Posts
                </Link>
                <Link 
                  to="/dashboard/analytics"
                  className="w-full text-left px-3 py-2  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
                >
                  <FaEye className="inline mr-2 text-purple-500" />
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;

