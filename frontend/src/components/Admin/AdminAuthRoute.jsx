import { useQuery } from '@tanstack/react-query';
import { checkAdminAuthStatusAPI } from '../../APIServices/admin/adminAuthAPI';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminAuthStatus } from '../../redux/slices/adminAuthSlice';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const AdminAuthRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAdminAuthenticated, adminAuth } = useSelector((state) => state.adminAuth);
  
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['admin-auth-status'],
    queryFn: checkAdminAuthStatusAPI,
    enabled: !isAdminAuthenticated, // Only check if not already authenticated
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if already authenticated
    retry: false,
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Update Redux state if we get admin data from the query
  useEffect(() => {
    if (adminData && adminData.success && adminData.admin) {
      // Ensure this is actually admin data
      if (adminData.admin.role && (adminData.admin.role === 'admin' || adminData.admin.role === 'super_admin')) {

        dispatch(adminAuthStatus(adminData.admin));
      } else {
        
        dispatch(adminAuthStatus(null));
      }
    } else if (adminData && !adminData.success) {
      // Clear admin auth status if the API returned failure
      
      dispatch(adminAuthStatus(null));
    }
  }, [adminData, dispatch]);

  // If we're already authenticated with valid admin data, grant access immediately
  if (isAdminAuthenticated && adminAuth && adminAuth.role && ['admin', 'super_admin'].includes(adminAuth.role)) {
    return children;
  }

  // If we're loading and not authenticated, show loading state
  if (isLoading && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-md text-white p-8  shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If there's an error or no valid admin data, redirect to login
  if (error || (adminData && (!adminData.success || !adminData.admin))) {
    return <Navigate to="/admin/auth/login" />;
  }

  // If we have valid admin data but Redux state is not set, update it and continue
  if (adminData && adminData.success && adminData.admin && !isAdminAuthenticated) {
    
    dispatch(adminAuthStatus(adminData.admin));
    return children;
  }

  // If we reach here, we're not authenticated
  return <Navigate to="/admin/auth/login" />;
};

AdminAuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminAuthRoute;
