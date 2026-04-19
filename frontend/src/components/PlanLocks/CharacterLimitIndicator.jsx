import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaTimes, FaArrowUp } from 'react-icons/fa';
import { getCharacterStatus, PLAN_TIERS } from '../../utils/planUtils';

const CharacterLimitIndicator = ({ userPlan, content = '', className = '' }) => {
  const status = getCharacterStatus(userPlan, content);
  
  if (status.limit === Infinity) {
    return null; // No limit for this plan
  }

  const getStatusColor = () => {
    if (status.isOverLimit) return 'text-red-600 dark:text-red-400';
    if (status.isNearLimit) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-400';
  };

  const getBarColor = () => {
    if (status.isOverLimit) return 'bg-red-500';
    if (status.isNearLimit) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getBackgroundColor = () => {
    if (status.isOverLimit) return 'bg-red-100 dark:bg-red-900/20';
    if (status.isNearLimit) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-white/5 text-white';
  };

  return (
    <div className={`${className}`}>
      {/* Character Count Display */}
      <div className={`flex items-center justify-between p-3  ${getBackgroundColor()}`}>
        <div className="flex items-center space-x-2">
          {status.isOverLimit && <FaTimes className="text-red-500" />}
          {status.isNearLimit && !status.isOverLimit && <FaExclamationTriangle className="text-orange-500" />}
          
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {status.current.toLocaleString()} / {status.limit.toLocaleString()} characters
          </span>
        </div>

        {status.isOverLimit && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-red-600 dark:text-red-400">
              {Math.abs(status.remaining).toLocaleString()} over limit
            </span>
            <Link
              to="/dashboard/billing"
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1  text-xs font-medium transition-colors"
            >
              <FaArrowUp className="text-xs" />
              <span>Upgrade</span>
            </Link>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 bg-white/5 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: `${Math.min(status.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Over Limit Warning */}
      {status.isOverLimit && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ">
          <div className="flex items-start space-x-2">
            <FaTimes className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Character limit exceeded
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                Your content is {Math.abs(status.remaining).toLocaleString()} characters over the {userPlan} plan limit.
                Please reduce your content or upgrade to a higher plan.
              </p>
              
              <div className="flex items-center space-x-4 text-xs">
                <Link
                  to="/dashboard/billing"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Upgrade Options →
                </Link>
                <span className="text-gray-400">
                  {userPlan === PLAN_TIERS.FREE ? 'Premium: 5,000 chars' : 'Pro: 10,000 chars'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Near Limit Warning */}
      {status.isNearLimit && !status.isOverLimit && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 ">
          <div className="flex items-start space-x-2">
            <FaExclamationTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Approaching character limit
              </h4>
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                You have {status.remaining.toLocaleString()} characters remaining on your {userPlan} plan.
              </p>
              
              <Link
                to="/dashboard/billing"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
              >
                Upgrade for more characters →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Plan Benefits */}
      {!status.isOverLimit && status.percentage < 50 && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          {userPlan === PLAN_TIERS.FREE && (
            <span>Upgrade to Premium for 5,000 characters or Pro for 10,000 characters</span>
          )}
          {userPlan === PLAN_TIERS.PREMIUM && (
            <span>Upgrade to Pro for 10,000 characters</span>
          )}
        </div>
      )}
    </div>
  );
};

CharacterLimitIndicator.propTypes = {
  userPlan: PropTypes.string.isRequired,
  content: PropTypes.string,
  className: PropTypes.string
};

export default CharacterLimitIndicator;
