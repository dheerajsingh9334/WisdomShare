import axios from "axios";
import { BASE_URL as ROOT_BASE } from "../../utils/baseEndpoint";
//create that must return a promise
const BASE_URL = `${ROOT_BASE}/stripe`;

const buildCheckoutIdempotencyKey = (planId) => {
  const storageKey = `checkout:idempotency:${planId}`;
  const ttlMs = 10 * 60 * 1000;
  const now = Date.now();

  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (
        parsed?.value &&
        parsed?.createdAt &&
        now - parsed.createdAt < ttlMs
      ) {
        return parsed.value;
      }
    }

    const newKey = `${planId}-${now}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ value: newKey, createdAt: now }),
    );
    return newKey;
  } catch (_) {
    return `${planId}-${now}`;
  }
};

//!Create post api
export const paymentIntentAPI = async (planId) => {
  const idempotencyKey = buildCheckoutIdempotencyKey(planId);
  const response = await axios.post(
    `${BASE_URL}/checkout`,
    {
      subscriptionPlanId: planId,
      idempotencyKey,
    },
    {
      headers: {
        "idempotency-key": idempotencyKey,
      },
      withCredentials: true,
    },
  );
  return response.data?.data || response.data;
};
//!payment verification
export const paymentVerificationAPI = async (paymentId) => {
  const response = await axios.get(`${BASE_URL}/verify/${paymentId}`, {
    withCredentials: true,
  });
  return response.data?.data
    ? { ...response.data, userFound: response.data.data.user }
    : response.data;
};
//!Free pln
export const freePlanAPI = async () => {
  const response = await axios.get(`${BASE_URL}/free-plan`, {
    withCredentials: true,
  });
  return response.data;
};
