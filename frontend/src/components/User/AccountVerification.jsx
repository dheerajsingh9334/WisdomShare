import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { verifyUserAccountAPI } from '../../APIServices/users/usersAPI';

const AccountVerification = () => {
  const { verifyToken } = useParams();
  const [isVerified, setIsVerified] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: verifyUserAccountAPI,
    onSuccess: () => {
      setIsVerified(true);
    },
    onError: () => {
      setIsVerified(false);
    }
  });

  useEffect(() => {
    if (verifyToken) {
      verifyMutation.mutate(verifyToken);
    }
  }, [verifyToken, verifyMutation]);

  if (!verifyToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg p-8 text-center">
        {verifyMutation.isPending && (
          <div>
            <FaSpinner className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifying Your Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {verifyMutation.isSuccess && isVerified && (
          <div>
            <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account has been verified. You can now access all features including creating posts, commenting, and following users.
            </p>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
              <a
                href="/create-post"
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors"
              >
                Create Your First Post
              </a>
            </div>
          </div>
        )}

        {verifyMutation.isError && (
          <div>
            <FaTimesCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {verifyMutation.error?.message || 'The verification link is invalid or has expired. Please request a new verification email.'}
            </p>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
              <a
                href="/resend-verification"
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
              >
                Request New Verification Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountVerification;
