import { Alert, Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./OTPVerifiedSuccess.css";
import Header1 from "../../components/Layout/Header1";
import Footer from "../../components/Layout/Footer";

const OTPVerifiedSuccess = () => {
  const navigate = useNavigate();

  const onClickHandler = async () => {
    navigate("/login");
  };
  return (
    <>
      <Header1 />
      <div className="auth-page-wrapper">
        <div className="otp-content">
          <div className="otp-verification-page">
            <div className="otp-verification-form">
              <Alert
                message="OTP Verified Successfully"
                description="Your OTP has been verified successfully. You can now proceed to login."
                type="success"
                showIcon
                className="success-alert"
              />
              <Button
                type="primary"
                className="success-btn"
                onClick={onClickHandler}
                block
              >
                Back to Login Page
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OTPVerifiedSuccess;
