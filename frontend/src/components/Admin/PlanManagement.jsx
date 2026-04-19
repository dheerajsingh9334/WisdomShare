import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllPlansAPI, 
  createPlanAPI, 
  updatePlanAPI, 
  deletePlanAPI,
  getAllUsersAPI,
  assignPlanToUserAPI
} from '../../APIServices/admin/adminAPI';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { r, responsiveCombos } from '../../utils/responsiveUtils';

const PlanManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    tier: 'free',
    price: 0,
    postLimit: 10,
    features: [''],
    isActive: true,
    checkoutEnabled: true,
    stripePriceId: '',
    trialDays: 0
  });

  const [showUserPlanModal, setShowUserPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPlan, setSelectedUserPlan] = useState('');

  const queryClient = useQueryClient();

  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: getAllPlansAPI,
    staleTime: 30000, // 30 seconds
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-for-plans'],
    queryFn: () => getAllUsersAPI({ limit: 100 }),
    staleTime: 30000, // 30 seconds
  });

  const assignPlanMutation = useMutation({
    mutationFn: ({ userId, planId }) => assignPlanToUserAPI(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users-for-plans']);
      setShowUserPlanModal(false);
      setSelectedUser(null);
      setSelectedUserPlan('');
    },
    onError: (error) => {
      
      alert(`Failed to assign plan: ${error.message || 'Unknown error'}`);
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => createPlanAPI(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
      setShowCreateModal(false);
      setFormData({
        planName: '',
        description: '',
        tier: 'free',
        price: 0,
        postLimit: 10,
        features: [''],
        isActive: true
      });
    },
    onError: (error) => {
      
      alert(`Failed to create plan: ${error.message || 'Unknown error'}`);
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, planData }) => updatePlanAPI(planId, planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
      setShowEditModal(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      
      alert(`Failed to update plan: ${error.message || 'Unknown error'}`);
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => deletePlanAPI(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
    },
    onError: (error) => {
      
      alert(`Failed to delete plan: ${error.message || 'Unknown error'}`);
    }
  });

  const handleCreatePlan = () => {
    const planData = {
      ...formData,
      features: formData.features.filter(feature => feature.trim() !== '')
    };
    createPlanMutation.mutate(planData);
  };

  const handleUpdatePlan = () => {
    if (selectedPlan) {
      const planData = {
        ...formData,
        features: formData.features.filter(feature => feature.trim() !== '')
      };
      updatePlanMutation.mutate({ planId: selectedPlan._id, planData });
    }
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      deletePlanMutation.mutate(planId);
    }
  };

  const handleAssignPlan = () => {
    if (selectedUser) {
      // If no plan is selected, it means removing the plan (setting to free)
      const planId = selectedUserPlan || null;
      assignPlanMutation.mutate({ userId: selectedUser._id, planId });
    }
  };

  const handleGlobalPriceUpdate = (planId) => {
    // Get the new price from the input field
    const priceInput = document.querySelector(`input[data-plan-id="${planId}"]`);
    if (priceInput && priceInput.value) {
      const newPrice = parseFloat(priceInput.value);
      if (newPrice >= 0) {
        updatePlanMutation.mutate({ 
          planId, 
          planData: { price: newPrice } 
        });
      } else {
        alert('Please enter a valid price (0 or greater)');
      }
    } else {
      alert('Please enter a new price');
    }
  };

  const handleCheckoutSettingsUpdate = (planId) => {
    // Get the checkout settings from the input fields
    const stripePriceInput = document.querySelector(`input[data-plan-id="${planId}"][placeholder="price_xxxxxxxxxxxxx"]`);
    const trialDaysInput = document.querySelector(`input[data-plan-id="${planId}"][placeholder="0"]`);
    const checkoutEnabledInput = document.querySelector(`input[type="checkbox"][data-plan-id="${planId}"]`);
    
    if (stripePriceInput && trialDaysInput && checkoutEnabledInput) {
      const stripePriceId = stripePriceInput.value;
      const trialDays = parseInt(trialDaysInput.value) || 0;
      const checkoutEnabled = checkoutEnabledInput.checked;
      
      updatePlanMutation.mutate({ 
        planId, 
        planData: { 
          stripePriceId, 
          trialDays, 
          checkoutEnabled 
        } 
      });
    } else {
      alert('Please check all checkout settings fields');
    }
  };



  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-100';
      case 'premium': return 'bg-green-100 text-green-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-100';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'free': return 'FREE';
      case 'premium': return 'PREMIUM';
      case 'pro': return 'PRO';
      default: return tier.toUpperCase();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200  w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 "></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Error loading plans</p>
          <p className="text-sm">{error.message || 'Failed to load plans. Please try again.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white  hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={responsiveCombos.container}>
      <div className={responsiveCombos.section}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">Plan Management</h2>
            <p className="text-sm sm:text-base text-gray-400">Manage subscription plans and pricing</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
              <a href="/plans" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View Public Plans</a>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <a href="/pricing" target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Pricing Page</a>
            </div>
          </div>
                      <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white  hover:bg-blue-700 flex items-center justify-center sm:justify-start w-full sm:w-auto text-xs sm:text-sm lg:text-base transition-colors"
            >
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Create Plan
            </button>
        </div>
      </div>

      {/* Plans Grid */}
      {plansData?.plans && plansData.plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {plansData.plans.map((plan) => (
            <div key={plan._id} className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  sm: shadow-lg border border-white/10 border-white/10 p-3 sm:p-4 md:p-5 lg:p-6 hover:shadow-xl transition-shadow relative">
              {/* Plan Badge */}
              <div className="absolute -top-2 sm:-top-3 lg:-top-4 left-1/2 transform -translate-x-1/2">
                <span className={`px-2 sm:px-3 md:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold ${getTierColor(plan.tier)}`}>
                  {getTierBadge(plan.tier)}
                </span>
              </div>

              {/* Plan Header */}
              <div className="text-center mb-3 sm:mb-4 lg:mb-6">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-2">{plan.planName}</h3>
                {plan.description && (
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 lg:mb-4">{plan.description}</p>
                )}
                <div className="mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs sm:text-sm lg:text-base text-gray-400">/month</span>
                </div>
                <div className="mb-2 sm:mb-3 lg:mb-4">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-gray-100 bg-white/5 text-xs sm:text-sm text-gray-300">
                    {plan.postLimit ? `Limit: ${plan.postLimit} posts` : "Unlimited posts"}
                  </span>
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <h4 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base">Features:</h4>
                  <ul className="space-y-1 sm:space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs sm:text-sm text-gray-400">
                        <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plan Status */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm mt-2">
                  <span className="text-gray-400">Checkout:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.checkoutEnabled 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-gray-100 text-gray-100 bg-white/5 dark:text-gray-300'
                  }`}>
                    {plan.checkoutEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setFormData({
                      planName: plan.planName,
                      description: plan.description || '',
                      tier: plan.tier,
                      price: plan.price,
                      postLimit: plan.postLimit,
                      features: plan.features || [''],
                      isActive: plan.isActive,
                      checkoutEnabled: plan.checkoutEnabled,
                      stripePriceId: plan.stripePriceId || '',
                      trialDays: plan.trialDays || 0
                    });
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white  hover:bg-blue-700 flex items-center justify-center text-xs sm:text-sm transition-colors"
                >
                  <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white  hover:bg-red-700 flex items-center justify-center text-xs sm:text-sm transition-colors"
                >
                  <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-4 sm:p-6 md:p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-2xl sm:text-3xl md:text-4xl mb-4">📋</div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No Plans Found</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4">Create your first subscription plan to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 flex items-center mx-auto text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Create First Plan
          </button>
        </div>
      )}

      {/* User Plan Management Section */}
      <div className="mt-6 sm:mt-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">User Plan Assignment & Management</h3>
          <p className="text-sm sm:text-base text-gray-400">Assign, change, or remove subscription plans for users. Changes take effect immediately.</p>
          
          {/* Bulk Plan Change */}
          <div className="mt-3 sm:mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700  p-3 sm:p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 text-sm sm:text-base">Bulk Plan Change</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Select Plan</label>
                <select
                  value={selectedUserPlan}
                  onChange={(e) => setSelectedUserPlan(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-blue-300 dark:border-blue-600  text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white"
                >
                  <option value="">Free Plan (Default)</option>
                  {plansData?.plans?.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} - ${plan.price}/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Filter Users</label>
                <select className="w-full px-2 sm:px-3 py-2 border border-blue-300 dark:border-blue-600  text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white">
                  <option value="">All Users</option>
                  <option value="free">Free Plan Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="pro">Pro Users</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white px-3 py-2  text-xs sm:text-sm hover:bg-blue-700 transition-colors">
                  Apply to Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {usersLoading ? (
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-4 sm:p-6 md:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">Loading users...</p>
          </div>
        ) : usersData?.users && usersData.users.length > 0 ? (
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 bg-white/5">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Plan
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Plan Details
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black/50 backdrop-blur-xl border border-white/10 text-white divide-y divide-gray-200 dark:divide-gray-700">
                  {usersData.users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.username}
                                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-300">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <div className="text-xs sm:text-sm font-medium text-white">
                              {user.username}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-white">
                          {user.plan?.planName || 'Free Plan'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.plan?.tier || 'free'} tier
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-white">
                          ${user.plan?.price || 0}/month
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.plan?.postLimit ? `${user.plan.postLimit} posts` : 'Unlimited posts'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedUserPlan(user.plan?._id || '');
                            setShowUserPlanModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          Change Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-4 sm:p-6 md:p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-2xl sm:text-3xl md:text-4xl mb-4">👥</div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No Users Found</h3>
            <p className="text-sm sm:text-base text-gray-400">No users are currently registered in the system.</p>
          </div>
        )}
      </div>

      {/* Global Plan Price Management Section */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">Global Plan Price Management</h3>
          <p className="text-sm sm:text-base text-gray-400">Edit plan prices globally and manage user plan assignments</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {plansData?.plans?.map((plan) => (
            <div key={plan._id} className="bg-gray-50 bg-white/5  p-3 sm:p-4 border border-white/10 border-white/20">
              <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">{plan.planName}</h4>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Current Price</label>
                  <div className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">${plan.price}/month</div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">New Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={plan.price}
                    data-plan-id={plan._id}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/50 backdrop-blur-xl border border-white/10 text-white text-white"
                    placeholder="Enter new price"
                  />
                </div>
                <button 
                  className="w-full bg-blue-600 text-white px-3 py-2  text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => handleGlobalPriceUpdate(plan._id)}
                >
                  Update Price Globally
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Plan Management Section */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  border border-white/10 border-white/10 p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">Checkout Plan Management</h3>
          <p className="text-sm sm:text-base text-gray-400">Manage Stripe integration and checkout settings for each plan</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {plansData?.plans?.map((plan) => (
            <div key={plan._id} className="bg-gray-50 bg-white/5  p-3 sm:p-4 border border-white/10 border-white/20">
              <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">{plan.planName}</h4>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Stripe Price ID</label>
                  <input
                    type="text"
                    defaultValue={plan.stripePriceId || ''}
                    data-plan-id={plan._id}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/50 backdrop-blur-xl border border-white/10 text-white text-white"
                    placeholder="price_xxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Trial Days</label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={plan.trialDays || 0}
                    data-plan-id={plan._id}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/50 backdrop-blur-xl border border-white/10 text-white text-white"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={plan.checkoutEnabled}
                    data-plan-id={plan._id}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-white/20 "
                  />
                  <label className="ml-2 text-xs sm:text-sm text-gray-300">
                    Enable Checkout
                  </label>
                </div>
                <button 
                  className="w-full bg-green-600 text-white px-3 py-2  text-xs sm:text-sm hover:bg-green-700 transition-colors"
                  onClick={() => handleCheckoutSettingsUpdate(plan._id)}
                >
                  Update Checkout Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-xs sm:max-w-sm lg:max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Create New Plan</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                    placeholder="Enter plan name"
                  />
                </div>
                                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="2"
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm resize-none"
                      placeholder="Plan description"
                    />
                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Tier</label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({...formData, tier: e.target.value})}
                        className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Post Limit</label>
                      <input
                        type="number"
                        value={formData.postLimit}
                        onChange={(e) => setFormData({...formData, postLimit: parseInt(e.target.value)})}
                        className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                        placeholder="10"
                        min="0"
                      />
                    </div>
                  </div>
                <div>
                  <label className={r.formField.label}>Features</label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className={`flex-1 ${r.input.base}`}
                          placeholder="Feature description"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-2 sm:px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <XMarkIcon className={r.icon.medium} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className={`w-full ${r.button.outline}`}
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 "
                    />
                    <label className="ml-2 text-sm text-gray-300">Active Plan</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.checkoutEnabled}
                      onChange={(e) => setFormData({...formData, checkoutEnabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 "
                    />
                    <label className="ml-2 text-sm text-gray-300">Enable Checkout</label>
                  </div>
                </div>
                <div className={r.formField.grid}>
                  <div>
                    <label className={r.formField.label}>Stripe Price ID</label>
                    <input
                      type="text"
                      value={formData.stripePriceId}
                      onChange={(e) => setFormData({...formData, stripePriceId: e.target.value})}
                      className={r.input.base}
                      placeholder="price_xxxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className={r.formField.label}>Trial Days</label>
                    <input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
                      className={r.input.base}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className={r.modal.footer}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`w-full sm:flex-1 ${r.button.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={createPlanMutation.isPending}
                  className={`w-full sm:flex-1 ${r.button.primary}`}
                >
                  {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-xs sm:max-w-sm lg:max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Edit Plan</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Tier</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({...formData, tier: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Post Limit</label>
                    <input
                      type="number"
                      value={formData.postLimit}
                      onChange={(e) => setFormData({...formData, postLimit: parseInt(e.target.value)})}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Features</label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-2 sm:px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 "
                    />
                    <label className="ml-2 text-sm text-gray-300">Active Plan</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.checkoutEnabled}
                      onChange={(e) => setFormData({...formData, checkoutEnabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 "
                    />
                    <label className="ml-2 text-sm text-gray-300">Enable Checkout</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Stripe Price ID</label>
                    <input
                      type="text"
                      value={formData.stripePriceId}
                      onChange={(e) => setFormData({...formData, stripePriceId: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Trial Days</label>
                    <input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
                      className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/10 border-white/10">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-white/20 border-white/20  text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={updatePlanMutation.isPending}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs sm:text-sm"
                >
                  {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Plan Assignment Modal */}
      {showUserPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 text-white  shadow-xl max-w-xs sm:max-w-sm lg:max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Change User Plan</h3>
                <button
                  onClick={() => setShowUserPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-400">
                  Changing plan for: <span className="font-medium text-white">{selectedUser.username}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  Current plan: <span className="font-medium text-white">{selectedUser.plan?.planName || 'Free Plan'}</span>
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Select New Plan</label>
                  <select
                    value={selectedUserPlan}
                    onChange={(e) => setSelectedUserPlan(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-white/20 border-white/20  focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/40 backdrop-blur-md text-white bg-white/5 text-white text-xs sm:text-sm"
                  >
                    <option value="">Free Plan (Default)</option>
                    {plansData?.plans?.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.planName} - ${plan.price}/month
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/10 border-white/10">
                <button
                  onClick={() => setShowUserPlanModal(false)}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-white/20 border-white/20  text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPlan}
                  disabled={assignPlanMutation.isPending}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs sm:text-sm"
                >
                  {assignPlanMutation.isPending ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;




