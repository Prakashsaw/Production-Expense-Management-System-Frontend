import axios from "axios";
import { BASE_URL } from "./baseURL";
import { isTokenExpired } from "./tokenExpirationCheck";

// Create a ref to track if we're already showing the modal
let isTokenExpiredModalVisible = false;
let tokenExpiredModalCallback = null;

// Function to set the modal visibility callback
export const setTokenExpiredModalCallback = (callback) => {
  tokenExpiredModalCallback = callback;
};

// Function to show token expired modal
export const showTokenExpiredModal = () => {
  if (!isTokenExpiredModalVisible && tokenExpiredModalCallback) {
    isTokenExpiredModalVisible = true;
    tokenExpiredModalCallback(true);
  }
};

// Function to hide token expired modal
export const hideTokenExpiredModal = () => {
  isTokenExpiredModalVisible = false;
  if (tokenExpiredModalCallback) {
    tokenExpiredModalCallback(false);
  }
};

// Function to handle token refresh
export const refreshAccessToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const refreshToken = user?.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      `${BASE_URL}/api/v1/users/refresh-token`,
      { refreshToken }
    );

    if (response.data.status === "success") {
      // Update access token in localStorage
      const updatedUser = {
        ...user,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      hideTokenExpiredModal();
      return response.data.accessToken;
    } else {
      throw new Error(response.data.message || "Failed to refresh token");
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    hideTokenExpiredModal();
    throw error;
  }
};

// Setup axios interceptor
let axiosInterceptorSetup = false;

export const setupAxiosInterceptor = () => {
  if (axiosInterceptorSetup) return; // Prevent multiple setups
  axiosInterceptorSetup = true;

  // Request interceptor to check token expiration before making request
  axios.interceptors.request.use(
    (config) => {
      // Check if this is an authenticated request
      const authHeader = config.headers?.Authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        
        // Check if token is expired before making the request
        if (isTokenExpired(token)) {
          console.log("⚠️ Token is expired before request - Will show modal on 401");
          // Don't block the request, let it go through and catch 401
          // This ensures backend validation is the source of truth
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to catch 401 errors
  axios.interceptors.response.use(
    (response) => {
      // If response is successful, reset the modal visibility flag
      if (response.status === 200 || response.status === 201) {
        isTokenExpiredModalVisible = false;
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Debug logging (remove in production)
      if (error.response?.status === 401) {
        console.log("🔒 401 Error Detected:", {
          url: originalRequest.url,
          code: error.response?.data?.code,
          expired: error.response?.data?.expired,
          message: error.response?.data?.message,
          data: error.response?.data,
        });
      }

      // Check if error is 401 (Unauthorized)
      if (error.response?.status === 401) {
        // Skip for auth-related endpoints
        const isAuthEndpoint = 
          originalRequest.url?.includes("/refresh-token") ||
          originalRequest.url?.includes("/login") ||
          originalRequest.url?.includes("/register") ||
          originalRequest.url?.includes("/verify-email");

        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        // Check if user has a refresh token (means they were logged in)
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const hasRefreshToken = user?.refreshToken && user?.token;

        if (hasRefreshToken && !isTokenExpiredModalVisible) {
          console.log("🚨 401 Error Detected - Showing Token Expired Modal", {
            url: originalRequest.url,
            errorCode: error.response?.data?.code,
            errorMessage: error.response?.data?.message,
            hasRefreshToken: true,
          });

          // Show modal for any 401 error if user has refresh token
          // This covers both expired tokens and invalid tokens
          showTokenExpiredModal();
          
          // Create a custom error that won't trigger error messages
          const customError = new Error("Token expired or invalid");
          customError.suppressError = true;
          return Promise.reject(customError);
        }
      }

      return Promise.reject(error);
    }
  );
};
