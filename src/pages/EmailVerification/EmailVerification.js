import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/baseURL";
import { getResponseError } from "../../utils/getResponseError";
import axios from "axios";
import { Alert, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Header1 from "../../components/Layout/Header1";
import Footer from "../../components/Layout/Footer";
import "./EmailVerification.css";

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState(null);
  const [validUrl, setValidUrl] = useState(false);

  const params = useParams();
  const { expenseAppUserId, token } = params;

  const navigate = useNavigate();

  const onClickHandler = async () => {
    navigate("/login");
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        const data = await axios.post(
          `${BASE_URL}/api/v1/users/verify-email/${expenseAppUserId}/${token}`
        );
        console.log(data);
        setLoading(false);
        setValidUrl(true);
      } catch (error) {
        console.log(error);
        setLoading(false);
        setEmailVerifyError(getResponseError(error));
      }
    };
    verifyEmail();
  }, [expenseAppUserId, token, navigate]);

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 48,
        color: "var(--primary-color)",
      }}
      spin
    />
  );

  return (
    <>
      <Header1 />
      <div className="auth-page-wrapper">
        <div className="email-verify-content">
          <div className="email-verify-page">
            <div className="email-verify-form">
              {loading && (
                <div className="loading-container">
                  <Spin indicator={antIcon} tip="Verifying your email..." size="large" />
                </div>
              )}
              {validUrl && (
                <Alert
                  message="Email Verified"
                  description="Your email has been verified successfully. Go to login page and login with your credentials."
                  type="success"
                  showIcon
                  className="success-alert"
                />
              )}
              {emailVerifyError && (
                <Alert
                  message={emailVerifyError}
                  description="Go to login page and try again for email verification link."
                  type="error"
                  showIcon
                  className="error-alert"
                />
              )}
              {!loading && (
                <Button
                  type="primary"
                  className="success-btn"
                  onClick={onClickHandler}
                  block
                >
                  Back to Login Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmailVerification;
