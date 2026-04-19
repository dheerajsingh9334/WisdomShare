// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const GoogleLoginError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Google Login Failed</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            We couldn&apos;t sign you in with Google. This could happen for several reasons:
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 bg-white/5  p-4">
            <h3 className="font-medium text-white mb-2">Possible reasons:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• You cancelled the Google login process</li>
              <li>• Google authentication service is temporarily unavailable</li>
              <li>• Your Google account doesn&apos;t have the required permissions</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full h-12 inline-flex items-center justify-center gap-2  bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
          >
            <FaArrowLeft /> Try Again
          </Link>

          <Link
            to="/register"
            className="w-full h-12 inline-flex items-center justify-center gap-2  border border-white/20 border-white/20 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Create Account Instead
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Need help? <Link to="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginError;
