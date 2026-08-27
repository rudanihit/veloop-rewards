const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const getToken = () => {
  return localStorage.getItem("veloop_token");
};

const request = async (endpoint, options = {}, retry = true) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Automatically refresh the development token
  // when the current token has expired.
  if (response.status === 401 && retry) {
    try {
      const loginResponse = await devLogin("dev@veloop.local");

      if (loginResponse?.data?.token) {
        return request(endpoint, options, false);
      }
    } catch (loginError) {
      console.error(
        "Automatic development login failed:",
        loginError,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Something went wrong with the request",
    );
  }

  return data;
};

const devLogin = async (email) => {
  const response = await request(
    "/auth/dev-login",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    false,
  );

  if (response?.data?.token) {
    localStorage.setItem(
      "veloop_token",
      response.data.token,
    );
  }

  if (response?.data?.user) {
    localStorage.setItem(
      "veloop_user",
      JSON.stringify(response.data.user),
    );
  }

  return response;
};

const getReferralDashboard = async () => {
  return request("/referrals/me");
};

const getReferralStats = async () => {
  return request("/referrals/stats");
};

const getRewardMilestones = async () => {
  return request("/rewards/milestones");
};

const createReferral = async ({
  referredUserId,
  referralCode,
  attributionSource,
  deviceId,
}) => {
  return request("/referrals", {
    method: "POST",
    body: JSON.stringify({
      referredUserId,
      referralCode,
      attributionSource,
      deviceId,
    }),
  });
};

const getReferralProgress = async (referralId) => {
  return request(`/referrals/${referralId}/progress`);
};

const completeReferral = async (referralId) => {
  return request(`/referrals/${referralId}/complete`, {
    method: "POST",
  });
};

const recordAdEvent = async ({
  eventId,
  eventType = "VIDEO_AD_COMPLETED",
  devVerified = false,
  occurredAt,
}) => {
  return request("/ad-events", {
    method: "POST",
    body: JSON.stringify({
      eventId,
      eventType,
      devVerified,
      occurredAt,
    }),
  });
};

const logout = () => {
  localStorage.removeItem("veloop_token");
  localStorage.removeItem("veloop_user");
};

export {
  devLogin,
  getReferralDashboard,
  getReferralStats,
  getRewardMilestones,
  createReferral,
  getReferralProgress,
  completeReferral,
  recordAdEvent,
  logout,
};