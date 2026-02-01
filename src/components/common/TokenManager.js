import React, { useState, useEffect } from "react";
import { setupAxiosInterceptor, setTokenExpiredModalCallback } from "../../utils/axiosInterceptor";
import TokenExpiredModal from "./TokenExpiredModal";

/**
 * TokenManager component that sets up axios interceptor and manages token expiration modal
 * This should be included at the app level to handle token expiration globally
 */
const TokenManager = ({ children }) => {
  const [tokenExpiredModalVisible, setTokenExpiredModalVisible] = useState(false);

  useEffect(() => {
    // Setup axios interceptor
    console.log("🔧 Setting up axios interceptor...");
    setupAxiosInterceptor();

    // Set callback for showing/hiding modal
    setTokenExpiredModalCallback((visible) => {
      console.log("📱 Modal visibility changed:", visible);
      setTokenExpiredModalVisible(visible);
    });

    // Cleanup on unmount
    return () => {
      setTokenExpiredModalCallback(null);
    };
  }, []);

  const handleTokenRefreshed = (newToken) => {
    // Token was refreshed successfully
    setTokenExpiredModalVisible(false);
    // The interceptor will automatically retry the failed request
    // No need to reload the page
  };

  const handleModalCancel = () => {
    setTokenExpiredModalVisible(false);
  };

  return (
    <>
      {children}
      <TokenExpiredModal
        visible={tokenExpiredModalVisible}
        onRefresh={handleTokenRefreshed}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default TokenManager;
