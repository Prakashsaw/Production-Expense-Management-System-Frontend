// GoogleAuthSuccess.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const name = urlParams.get("name");
    const expenseAppUserId = urlParams.get("expenseAppUserId");
    const isVerified = urlParams.get("isVerified");

    console.log("token: ", token);

    if (token) {
      localStorage.setItem(
        "user",
        JSON.stringify({ expenseAppUserId, isVerified, name, token })
      );
      message.success("Google Login Successful!");
      navigate("/user");
    }
  }, [navigate]);

  return <h2>Processing Google Authentication...</h2>;
};

export default GoogleAuthSuccess;
