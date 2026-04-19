import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaChartLine, FaCrown, FaEye } from 'react-icons/fa';
import { hasReaderAnalytics } from '../../utils/planUtils';
import PostAdvancedAnalytics from './PostAdvancedAnalytics';

const AnalyticsButton = ({ userPlan, isAuthor }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const hasAccess = hasReaderAnalytics(userPlan);

  if (!hasAccess) {
    return (
      <div className="relative group">
        <button 
          disabled
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 bg-white/5 text-gray-400  cursor-not-allowed"
          title="Upgrade to Pro to view analytics"
        >
          <FaChartLine />
          <span className="text-sm">Analytics</span>
          <span className="text-xs">🔒</span>
        </button>
        
        {/* Upgrade Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black text-white text-xs  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          <div className="flex items-center space-x-1">
            <FaCrown className="text-yellow-400" />
            <span>Pro feature - View detailed analytics</span>
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300  transition-colors"
        title="View detailed analytics"
      >
        <FaChartLine />
        <span className="text-sm font-medium">Analytics</span>
        <FaCrown className="text-yellow-500" size={12} />
      </button>

      {/* Analytics Modal/Panel */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-white/10 border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <FaEye className="text-purple-500" />
                <span>Post Analytics</span>
              </h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <PostAdvancedAnalytics 
                userPlan={userPlan}
                isAuthor={isAuthor}
                onDeleteComment={(commentId) => console.log('Delete comment:', commentId)}
                onFlagComment={(commentId) => console.log('Flag comment:', commentId)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AnalyticsButton.propTypes = {
  userPlan: PropTypes.string.isRequired,
  isAuthor: PropTypes.bool
};

export default AnalyticsButton;
