import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProfileAPI, updateAdminProfileAPI, changeAdminPasswordAPI, deleteAdminAccountAPI } from "../../APIServices/admin/adminAPI";
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { adminLogout } from '../../redux/slices/adminAuthSlice';

const AdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth: admin } = useSelector((state) => state.adminAuth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDeletePassword, setConfirmDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Delete admin account mutation
  const deleteAdminAccountMutation = useMutation({
    mutationFn: deleteAdminAccountAPI,
    onSuccess: (data) => {
      
      dispatch(adminLogout());
      navigate('/admin/login');
      alert('Your admin account has been permanently deleted. Your posts will remain on the platform.');
    },
    onError: (error) => {
      
      setDeleteError(error.response?.data?.message || 'Failed to delete admin account');
    }
  });

  const handleDeleteAdminAccount = () => {
    if (deletePassword !== confirmDeletePassword) {
      setDeleteError('Passwords do not match');
      return;
    }
    
    if (deletePassword.length < 6) {
      setDeleteError('Password must be at least 6 characters long');
      return;
    }

    setDeleteError('');
    deleteAdminAccountMutation.mutate({ password: deletePassword });
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setConfirmDeletePassword('');
    setDeleteError('');
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    contactInfo: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const queryClient = useQueryClient();

  // Fetch admin profile
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfileAPI,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateAdminProfileAPI,
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries(["adminProfile"]);
      alert("Profile updated successfully!");
    },
    onError: (error) => {
      alert("Failed to update profile: " + error.message);
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: changeAdminPasswordAPI,
    onSuccess: () => {
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordErrors({});
      alert("Password updated successfully!");
    },
    onError: (error) => {
      
      if (error.response?.data?.message) {
        alert("Failed to update password: " + error.response.data.message);
      } else if (error.message) {
        alert("Failed to update password: " + error.message);
      } else {
        alert("Failed to update password. Please try again.");
      }
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileData?.admin) {
      setFormData({
        firstName: profileData.admin.profile?.firstName || "",
        lastName: profileData.admin.profile?.lastName || "",
        bio: profileData.admin.profile?.bio || "",
        contactInfo: profileData.admin.profile?.contactInfo || ""
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      updatePasswordMutation.mutate({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profileData?.admin) {
      setFormData({
        firstName: profileData.admin.profile?.firstName || "",
        lastName: profileData.admin.profile?.lastName || "",
        bio: profileData.admin.profile?.bio || "",
        contactInfo: profileData.admin.profile?.contactInfo || ""
      });
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Error loading profile: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const profileAdmin = profileData?.admin;

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaUser className="text-3xl text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Admin Profile
                </h1>
                <p className="text-gray-400">
                  Manage your profile and contact information
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 bg-white/5  p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <p className="text-white font-medium">{profileAdmin?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-white">{profileAdmin?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Role
                    </label>
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {profileAdmin?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Bio */}
            <div className="space-y-4">
              <div className="bg-gray-50 bg-white/5  p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Contact & Bio
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      First Name
                    </label>
                    <p className="text-white">
                      {profileAdmin?.profile?.firstName || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name
                    </label>
                    <p className="text-white">
                      {profileAdmin?.profile?.lastName || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isEditing ? "Edit Profile" : "Profile Details"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white">
                    {profileAdmin?.profile?.firstName || "Not set"}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white">
                    {profileAdmin?.profile?.lastName || "Not set"}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell users about yourself..."
                />
              ) : (
                <p className="text-white">
                  {profileAdmin?.profile?.bio || "No bio added yet"}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaEnvelope className="inline mr-2" />
                Contact Information
              </label>
              <p className="text-xs text-gray-400 mb-2">
                This information will be shown to users when you send broadcast notifications or ban users
              </p>
              {isEditing ? (
                <textarea
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-white/20 border-white/20  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your contact information, office hours, preferred contact method, etc..."
                />
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  p-4">
                  <p className="text-white">
                    {profileAdmin?.profile?.contactInfo || "No contact information added yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white  hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <FaSave className="mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Update Section */}
        <div className="mt-8 bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-lg border border-white/10 border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaLock className="text-2xl text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Update Password
                </h2>
                <p className="text-gray-400">
                  Change your account password for enhanced security
                </p>
              </div>
            </div>
            
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors"
              >
                <FaLock className="mr-2" />
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 pr-10 border  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-white/20 border-white/20'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 pr-10 border  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-white/20 border-white/20'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 pr-10 border  bg-black/40 backdrop-blur-md text-white bg-white/5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-white/20 border-white/20'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <FaLock className="mr-2" />
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Account Actions</h3>
              <p className="text-sm text-gray-400">Manage your admin account settings</p>
            </div>
            <button
              onClick={openDeleteModal}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20  transition-colors duration-200"
              title="Delete Admin Account"
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg  bg-black/50 backdrop-blur-xl border border-white/10 text-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-white text-center mt-4">
                  Delete Admin Account
                </h3>
                <p className="text-sm text-gray-400 text-center mt-2 mb-6">
                  This action cannot be undone. Your posts will remain on the platform.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/5 dark:text-white"
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmDeletePassword}
                      onChange={(e) => setConfirmDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/5 dark:text-white"
                      placeholder="Confirm your password"
                    />
                  </div>
                  
                  {deleteError && (
                    <div className="text-red-600 dark:text-red-400 text-sm text-center">
                      {deleteError}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700  hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAdminAccount}
                    disabled={deleteAdminAccountMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleteAdminAccountMutation.isPending ? 'Deleting...' : 'Delete Admin Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 How This Information is Used
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              • <strong>Contact Information:</strong> Users will see this when you send broadcast notifications or ban users
            </p>
            <p>
              • <strong>Bio:</strong> Displayed in admin panels and user-facing admin information
            </p>
            <p>
              • <strong>Name:</strong> Used in notifications and system messages
            </p>
            <p>
                             • <strong>Ban Notifications:</strong> When you ban a user, they&apos;ll see your contact info to reach out if needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;


