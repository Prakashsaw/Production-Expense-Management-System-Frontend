import { LoadingOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Form, Input, message } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OTPVerificationForm.css";
import { BASE_URL } from "../../utils/baseURL";
import axios from "axios";
import { getResponseError } from "../../utils/getResponseError";
import OTPInput from "../../components/OTPInput";
import Header1 from "../../components/Layout/Header1";
import Footer from "../../components/Layout/Footer";

// OTP Input Wrapper to integrate with Ant Design Form
const OTPInputWrapper = ({ value, onChange }) => {
  const otpArray = typeof value === 'string' ? value.split('') : (value || []);
  
  const handleChange = (newOtp) => {
    const otpString = typeof newOtp === 'string' ? newOtp : newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }
  };
  
  return (
    <OTPInput
      otp={otpArray}
      onChange={handleChange}
    />
  );
};

const SendOTPAndVerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [sendingOTPError, setSendingOTPError] = useState(null);
  const [response, setResponse] = useState([]);
  const [verifyForm] = Form.useForm();
  const navigate = useNavigate();

  const submitHandlerForSendOTP = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/api/v1/users/send-email-otp`,
        values
      );
      setResponse(res.data);
      setLoading(false);
      setSendingOTPError(null);
      message.success("OTP sent successfully on your email address...!");
    } catch (error) {
      setResponse([]);
      setLoading(false);
      setSendingOTPError(getResponseError(error));
      message.error("Something went wrong in sending OTP...!");
      console.log(error);
    }
  };

  const submitHandlerForVerifyOTP = async (values) => {
    try {
      setLoading(true);
      await axios.post(
        `${BASE_URL}/api/v1/users/verify-email-otp/${response.expenseAppUserId}`,
        values
      );
      setLoading(false);
      setResponse([]);
      setSendingOTPError(null);
      message.success("OTP verified successfully...!");
      setResponse(false);
      navigate("/otp-verified-success");
    } catch (error) {
      setLoading(false);
      setResponse([]);
      setSendingOTPError(getResponseError(error));
      message.error("Something went wrong in verifying OTP...!");
      console.log(error);
    }
  };

  const handleClick = () => {
    // set response to empty array
    setResponse([]);
  };

  return (
    <>
      <Header1 />
      <div className="auth-page-wrapper">
        <div className="otp-content">
          <div className="otp-verification-page">
            <div className="otp-verification-form">
            {response && response.email ? (
              <Form
                form={verifyForm}
                layout="vertical"
                initialValues={{
                  remember: true,
                  email: response.email,
                }}
                onFinish={submitHandlerForVerifyOTP}
                autoComplete="off"
              >
                <h2 className="header-name">Verify OTP</h2>
                <p className="otp-description">Please enter OTP which you have received on your email.</p>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your valid email...!",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    className="form-input"
                    type="email"
                    placeholder="Email"
                    disabled={true}
                    size="large"
                  />
                </Form.Item>

                {/* <Form.Item
                  label="OTP"
                  name="otp"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your OTP...!",
                    },
                    {
                      len: 6,
                      message: "OTP must be 6 digits!",
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    className="pass-input"
                    type="number"
                    placeholder="OTP"
                    style={{
                      height: 40,
                    }}
                    maxLength={6} // Restrict to 6 digits
                  />
                </Form.Item> */}

                <Form.Item
                  label="OTP"
                  name="otp"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your OTP...!",
                    },
                    {
                      len: 6,
                      message: "OTP must be 6 digits!",
                    },
                  ]}
                >
                  <OTPInputWrapper />
                </Form.Item>
                {sendingOTPError && (
                  <Alert
                    message={sendingOTPError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 15 }}
                  />
                )}
                <div className="loading-text pb-2 mt-2 d-flex justify-content-center">
                  <button className="btn" disabled={loading}>
                    {loading ? <LoadingOutlined /> : "Submit OTP"}
                  </button>
                </div>
                <div
                  className="text pt-2 d-flex justify-content-center"
                  onClick={handleClick}
                >
                  Resend OTP?
                  <Link to="/email-verification-otp">click here!</Link>
                </div>
              </Form>
            ) : (
              <Form
                layout="vertical"
                initialValues={{
                  remember: true,
                }}
                onFinish={submitHandlerForSendOTP}
                autoComplete="off"
              >
                <h2 className="header-name">Send OTP</h2>
                <p className="otp-description">
                  Please enter your email address. You will receive an OTP to
                  verify your email.
                </p>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your valid email...!",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    className="form-input"
                    type="email"
                    placeholder="Email"
                    size="large"
                  />
                </Form.Item>

                {sendingOTPError && (
                  <Alert
                    message={sendingOTPError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 15 }}
                  />
                )}

                <div className="loading-text pb-2 mt-2 d-flex justify-content-center">
                  <button className="btn" disabled={loading}>
                    {loading ? <LoadingOutlined /> : "Send OTP"}
                  </button>
                </div>
                <div className="text pt-2 d-flex justify-content-center">
                  <Link to="/login">Login here!</Link>
                </div>
              </Form>
            )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SendOTPAndVerifyEmail;
