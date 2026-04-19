import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";

const BASE_URL = `${ROOT_BASE}/chat`;

export const fetchConversationsAPI = async () => {
  const response = await axios.get(`${BASE_URL}/conversations`, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchMessagesAPI = async (roomId, limit = 50) => {
  const response = await axios.get(`${BASE_URL}/messages/${roomId}`, {
    params: { limit },
    withCredentials: true,
  });
  return response.data;
};

export const sendMessageAPI = async ({ receiverId, message }) => {
  const response = await axios.post(
    `${BASE_URL}/messages`,
    { receiverId, message },
    { withCredentials: true },
  );
  return response.data;
};

export const markRoomAsReadAPI = async (roomId) => {
  const response = await axios.patch(
    `${BASE_URL}/messages/read/${roomId}`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};
