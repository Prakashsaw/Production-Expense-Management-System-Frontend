import React, { useState } from "react";
import { Modal, Button, Space, Alert } from "antd";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/baseURL";
import { message } from "antd";
import { hideTokenExpiredModal } from "../../utils/axiosInterceptor";
import "./TokenExpiredModal.css";

const TokenExpiredModal = ({ visible, onRefresh, onCancel }) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const refreshToken = user?.refreshToken;

      if (!refreshToken) {
        message.error("No refresh token found. Please login again.");
        handleLoginAgain();
        return;
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
          refreshToken: response.data.refreshToken || refreshToken, // Use new refresh token if provided
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        message.success("Token refreshed successfully! Refreshing page...");
        setRefreshing(false);
        hideTokenExpiredModal();
        onRefresh && onRefresh(response.data.accessToken);
        
        // Reload the page to refresh all data with new token
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error(response.data.message || "Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      setRefreshing(false);

      // Check if refresh token is expired
      if (
        error.response?.data?.code === "REFRESH_TOKEN_EXPIRED" ||
        error.response?.data?.code === "REFRESH_TOKEN_INVALID"
      ) {
        message.error(
          "Your session has expired. Please login again to continue."
        );
        handleLoginAgain();
      } else {
        message.error(
          error.response?.data?.message ||
            "Failed to refresh token. Please login again."
        );
        handleLoginAgain();
      }
    }
  };

  const handleLoginAgain = () => {
    localStorage.removeItem("user");
    navigate("/login");
    onCancel && onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ color: "#ff4d4f", display: "flex", alignItems: "center", gap: "8px" }}>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          Session Expired
        </span>
      }
      open={visible}
      onCancel={handleLoginAgain}
      footer={null}
      closable={false}
      maskClosable={false}
      width={500}
      className="token-expired-modal"
    >
      <div className="token-expired-content">
        <Alert
          message="Your session has expired"
          description="Your access token has expired. You can refresh your session to continue, or login again."
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <div className="token-expired-actions">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefreshToken}
              loading={refreshing}
              size="large"
              block
              className="refresh-token-button"
            >
              Refresh Session
            </Button>

            <Button
              icon={<LoginOutlined />}
              onClick={handleLoginAgain}
              disabled={refreshing}
              size="large"
              block
              className="login-again-button"
            >
              Login Again
            </Button>
          </Space>
        </div>

        <div className="token-expired-info">
          <p style={{ margin: "16px 0 0 0", fontSize: "12px", color: "#8c8c8c" }}>
            <strong>Note:</strong> If you haven't logged in for 7 days, your refresh token
            has also expired and you'll need to login again.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TokenExpiredModal;
