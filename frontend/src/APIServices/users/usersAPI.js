import { BASE_URL } from "../../utils/baseEndpoint";
import axios from "axios";

// ! Register user
export const registerAPI = async (userData) => {
  const response = await axios.post(
    `${BASE_URL}/users/register`,
    {
      username: userData?.username,
      password: userData?.password,
      email: userData?.email,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// ! login user
export const loginAPI = async (userData) => {
  const response = await axios.post(
    `${BASE_URL}/users/login`,
    {
      username: userData?.username,
      password: userData?.password,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

//http://localhost:5000/api/v1/users/checkAuthenticated
// ! checkAuthStatus user
export const checkAuthStatusAPI = async () => {
  const response = await axios.get(`${BASE_URL}/users/checkAuthenticated`, {
    withCredentials: true,
  });

  return response.data;
};
// ! user profile
export const userProfileAPI = async () => {
  const response = await axios.get(`${BASE_URL}/users/profile`, {
    withCredentials: true,
  });
  return response.data;
};

// ! update user profile
export const updateProfileAPI = async (profileData) => {
  const response = await axios.put(
    `${BASE_URL}/users/profile`,
    profileData,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// ! logout user
export const logoutAPI = async () => {
  const response = await axios.post(
    `${BASE_URL}/users/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// ! delete user account
export const deleteAccountAPI = async (passwordData) => {
  const response = await axios.delete(
    `${BASE_URL}/users/delete-account`,
    {
      data: passwordData,
      withCredentials: true,
    }
  );

  return response.data;
};

// ! follw user
export const followUserAPI = async (userId) => {
  const response = await axios.put(
    `${BASE_URL}/users/follow/${userId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// ! unfollw user
export const unfollowUserAPI = async (userId) => {
  const response = await axios.put(
    `${BASE_URL}/users/unfollow/${userId}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// ! send Email verification token
export const sendEmailVerificationTokenAPI = async () => {
  const response = await axios.put(
    `${BASE_URL}/users/account-verification-email`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// ! updateEmailAPI
export const updateEmailAPI = async (email) => {
  const response = await axios.put(
    `${BASE_URL}/users/update-email`,
    {
      email,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// !Verify user account
export const verifyUserAccountAPI = async (verifyToken) => {
  const response = await axios.put(
    `${BASE_URL}/users/verify-account/${verifyToken}`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// !forgot password
export const forgotPasswordAPI = async (email) => {
  const response = await axios.post(
    `${BASE_URL}/users/forgot-password`,
    {
      email,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};
// !upload profile pic
export const uplaodProfilePicAPI = async (formData) => {
  const response = await axios.put(
    `${BASE_URL}/users/upload-profile-picture`,
    formData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// !reset password
export const resetPasswordAPI = async (data) => {
  const response = await axios.post(
    `${BASE_URL}/users/reset-password`,
    {
      password: data?.password,
    },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// !change password (requires current password)
export const changePasswordAPI = async (passwordData) => {
  const response = await axios.put(
    `${BASE_URL}/users/change-password`,
    {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// ! Get another user's profile by ID
export const getUserProfileByIdAPI = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/profile/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("User not found (404)");
    } else {
      throw new Error(error.message || "Something went wrong");
    }
  }
};

// ! Get user's current plan and usage
export const getUserPlanAndUsageAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/plan-usage`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch plan usage");
  }
};

// ! Get lightweight user stats for sidebar
export const getUserStatsAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/stats`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch user stats");
  }
};

// ! Get user's plan and billing history
export const getUserPlanHistoryAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/plan-history`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch plan history");
  }
};

// ! Save post
export const savePostAPI = async (postId) => {
  const response = await axios.put(
    `${BASE_URL}/users/save-post/${postId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// ! Unsave post
export const unsavePostAPI = async (postId) => {
  const response = await axios.put(
    `${BASE_URL}/users/unsave-post/${postId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// ! Get saved posts
export const getSavedPostsAPI = async () => {
  const response = await axios.get(`${BASE_URL}/users/saved-posts`, {
    withCredentials: true,
  });
  return response.data;
};

// ! Get all users for ranking
export const fetchAllUsersAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/all`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch users");
  }
};

// ! Get users ranked by most followers
export const fetchUsersByFollowersAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/ranking/followers`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch users by followers");
  }
};

// ! Get posts ranked by most likes
export const fetchPostsByLikesAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/ranking/likes`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch posts by likes");
  }
};

// ! Get posts ranked by most views
export const fetchPostsByViewsAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/ranking/views`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch posts by views");
  }
};

