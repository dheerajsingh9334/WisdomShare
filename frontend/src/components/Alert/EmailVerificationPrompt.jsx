import PropTypes from 'prop-types';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { sendEmailVerificationTokenAPI } from '../../APIServices/users/usersAPI';

const EmailVerificationPrompt = ({ message = "Please verify your email to perform this action.", onClose }) => {
  const resendMutation = useMutation({
    mutationFn: sendEmailVerificationTokenAPI,
    onSuccess: () => {
      alert('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      alert('Failed to send verification email: ' + error.message);
    }
  });

  const handleResendEmail = () => {
    resendMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <FaExclamationTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-white mb-2">
            Email Verification Required
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resendMutation.isPending}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <FaEnvelope className="mr-2" />
              {resendMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200  hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
              >
                Close
              </button>
            )}
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-400 mt-4">
            Check your spam folder if you don&apos;t see the email within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

EmailVerificationPrompt.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func,
};

export default EmailVerificationPrompt;
