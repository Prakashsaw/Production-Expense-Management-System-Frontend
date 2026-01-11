import { Alert, Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header1 from "../../components/Layout/Header1";
import Footer from "../../components/Layout/Footer";
import "./EmailVerification.css";

const SignUpSuccess = () => {
  const navigate = useNavigate();

  const onClickHandler = async () => {
    navigate("/login");
  };
  
  return (
    <>
      <Header1 />
      <div className="auth-page-wrapper">
        <div className="email-verify-content">
          <div className="email-verify-page">
            <div className="email-verify-form">
              <Alert
                message="Successfully Registered"
                description="You successfully registered to Expense Management System. Please check your email for email verification link and verify your email."
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

export default SignUpSuccess;
