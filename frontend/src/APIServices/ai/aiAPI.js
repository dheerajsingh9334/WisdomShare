import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";

const BASE_URL = `${ROOT_BASE}/ai`;

export const enqueueAIBlogWriterAPI = async (payload, idempotencyKey) => {
  const response = await axios.post(`${BASE_URL}/writer`, payload, {
    withCredentials: true,
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });
  return response.data;
};

export const generateBlogDirectAPI = async (payload) => {
  const response = await axios.post(`${BASE_URL}/writer/direct`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const enqueueAIRefineAPI = async (payload, idempotencyKey) => {
  const response = await axios.post(`${BASE_URL}/refine`, payload, {
    withCredentials: true,
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });
  return response.data;
};

export const refineBlogDirectAPI = async (payload) => {
  const response = await axios.post(`${BASE_URL}/refine/direct`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const enqueueAISemanticSearchAPI = async (payload, idempotencyKey) => {
  const response = await axios.post(`${BASE_URL}/semantic-search`, payload, {
    withCredentials: true,
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });
  return response.data;
};

export const semanticSearchDirectAPI = async (payload) => {
  const response = await axios.post(
    `${BASE_URL}/semantic-search/direct`,
    payload,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const enqueueAIGuestChatAPI = async (payload, idempotencyKey) => {
  const response = await axios.post(`${BASE_URL}/chat`, payload, {
    withCredentials: true,
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });
  return response.data;
};

export const guestChatDirectAPI = async (payload) => {
  const response = await axios.post(`${BASE_URL}/chat/direct`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const enqueueAISummarizeAPI = async (payload, idempotencyKey) => {
  const response = await axios.post(`${BASE_URL}/summarize`, payload, {
    withCredentials: true,
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });
  return response.data;
};

export const summarizeBlogDirectAPI = async (payload) => {
  const response = await axios.post(`${BASE_URL}/summarize/direct`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const getAITaskStatusAPI = async (taskId) => {
  const response = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
    withCredentials: true,
  });
  return response.data;
};
