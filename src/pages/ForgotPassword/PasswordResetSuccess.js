import { Alert, Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  const onClickHandler = async () => {
    navigate("/login");
  };
  return (
    <>
      <div>
        <Alert
          message="Password Reset Successfully."
          description="Your password has been reset successfully. Go to login page and login with your new password."
          type="success"
          showIcon
          style={{
            margin: 50,
            marginLeft: 200,
            marginRight: 200,
            padding: 50,
            borderRadius: 10,
            backgroundColor: "#f6ffed",
          }}
        />
        <Button
          type="primary"
          style={{
            marginLeft: 550,
            borderRadius: 3,
          }}
          onClick={onClickHandler}
        >
          Back to Login Page{" "}
        </Button>
      </div>
    </>
  );
};

export default PasswordResetSuccess;
