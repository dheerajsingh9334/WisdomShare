import React, { Suspense } from 'react';

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
};

/**
 * Page Loading Component for full page loads
 */
export const PageLoader = ({ message = "Loading page..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
};

/**
 * Card Loading Skeleton
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-md p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-10 w-10"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600  w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600  w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 "></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600  w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600  w-3/4"></div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * List Loading Skeleton
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-sm animate-pulse">
          <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-8"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600  w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600  w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600  w-16"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Lazy Loading Wrapper
 */
export const LazyLoadWrapper = ({ children, fallback = <LoadingSpinner /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Performance optimized component wrapper
 */
export const OptimizedWrapper = ({ children, loading = false, error = null }) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-2">❌</div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default LoadingSpinner;
