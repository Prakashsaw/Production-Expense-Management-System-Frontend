import { Row, Col, Input } from "antd";
import { useRef } from "react";

const OTPInput = ({ otp, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Ensure the value is only one character
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;

      // Combine and pass the updated OTP as a string
      onChange(newOtp.join(""));

      // Automatically move to the next input box if a digit is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input if backspace is pressed and input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Row gutter={8} justify="center">
      {Array.from({ length: 6 }).map((_, index) => (
        <Col key={index}>
          <Input
            ref={(el) => (inputRefs.current[index] = el)}
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              width: 40,
              height: 40,
              textAlign: "center",
              fontSize: 18,
              margin: "0 5px",
            }}
          />
        </Col>
      ))}
    </Row>
  );
};

export default OTPInput;
