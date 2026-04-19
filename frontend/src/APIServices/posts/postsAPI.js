import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";

const BASE_URL = `${ROOT_BASE}/posts`;

//!Create post api
export const createPostAPI = async (data) => {
  const response = await axios.post(`${BASE_URL}/create`, data, {
    withCredentials: true,
  });
  return response.data;
};

//!Get all posts api — updated for cursor-based infinite scroll
export const getAllPostsAPI = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}`, {
    params: {
      ...params,
      limit: params.limit || 20,
    },
    withCredentials: true, // Need auth for plan verification
  });
  return response.data;
};

// Legacy function names for backward compatibility
export const fetchAllPosts = getAllPostsAPI;

//!Get post by id api
export const getPostByIdAPI = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`, {
    withCredentials: false,
  });
  return response.data;
};

// Legacy function names for backward compatibility
export const fetchPost = getPostByIdAPI;

//!Update post api
export const updatePostAPI = async ({ postId, formData }) => {
  const response = await axios.put(`${BASE_URL}/${postId}`, formData, {
    withCredentials: true,
  });
  return response.data;
};

//!Delete post api
export const deletePostAPI = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/${postId}`, {
    withCredentials: true,
  });
  return response.data;
};

//!Like post api
export const likePostAPI = async (postId) => {
  const response = await axios.put(
    `${BASE_URL}/likes/${postId}`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

//!Dislike post api
export const dislikePostAPI = async (postId) => {
  const response = await axios.put(
    `${BASE_URL}/dislikes/${postId}`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

//!Get trending posts api
export const getTrendingPostsAPI = async () => {
  const response = await axios.get(`${BASE_URL}/trending`, {
    withCredentials: false,
  });
  return response.data;
};

// Legacy function names for backward compatibility
export const fetchTrendingPostsAPI = getTrendingPostsAPI;

//!Get posts by following api
export const getPostsByFollowingAPI = async () => {
  const response = await axios.get(`${BASE_URL}/following`, {
    withCredentials: true,
  });
  return response.data;
};

// Legacy function names for backward compatibility
export const fetchPostsByFollowing = getPostsByFollowingAPI;

//!Get popular tags api
export const getPopularTagsAPI = async (limit = 20) => {
  const response = await axios.get(`${BASE_URL}/popular-tags`, {
    params: { limit },
    withCredentials: false,
  });
  return response.data;
};

//!Search posts by tags api
export const searchPostsByTagsAPI = async (tags, page = 1, limit = 20) => {
  const response = await axios.get(`${BASE_URL}/search-by-tags`, {
    params: { tags, page, limit },
    withCredentials: false,
  });
  return response.data;
};

//!Get user drafts api
export const getUserDraftsAPI = async (page = 1, limit = 10) => {
  const response = await axios.get(`${BASE_URL}/drafts`, {
    params: { page, limit },
    withCredentials: true,
  });
  return response.data;
};

//!Get user published posts api
export const getUserPublishedPostsAPI = async (page = 1, limit = 10) => {
  const response = await axios.get(`${BASE_URL}/published`, {
    params: { page, limit },
    withCredentials: true,
  });
  return response.data;
};

//!Get user scheduled posts api
export const getUserScheduledPostsAPI = async (page = 1, limit = 10) => {
  const response = await axios.get(`${BASE_URL}/scheduled`, {
    params: { page, limit },
    withCredentials: true,
  });
  return response.data;
};

//!Update post status api
export const updatePostStatusAPI = async (
  postId,
  status,
  scheduledFor = null,
) => {
  const response = await axios.patch(
    `${BASE_URL}/${postId}/status`,
    {
      status,
      scheduledFor,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

//!Publish scheduled posts api (admin/cron job)
export const publishScheduledPostsAPI = async () => {
  const response = await axios.post(
    `${BASE_URL}/publish-scheduled`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

//!Search all (posts and users) api
export const searchAllAPI = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params,
    withCredentials: false,
  });
  return response.data;
};

//!Track post view api
export const trackPostViewAPI = async (postId) => {
  const response = await axios.post(
    `${BASE_URL}/track-view/${postId}`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

//!Get post analytics api (author only)
export const getPostAnalyticsAPI = async (postId) => {
  const response = await axios.get(`${BASE_URL}/analytics/${postId}`, {
    withCredentials: true,
  });
  return response.data;
};
