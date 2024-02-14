import { Button } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/HomeHeader.css";

const HomeHeader = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark sticky-top">
        <img
          src="data:image/jpeg;base64,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"
          alt="logo"
          width="40"
          height="40"
          style={{ borderRadius: "50%", marginLeft: "10px" }}
        />
        <Link className="navbar-brand" to="/">
          Expense Management System
        </Link>
        <div className="container-fluid">
          <div
            className="collapse navbar-collapse"
            id="navbarToggleExternalContent"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-link">
                <Button className="home-btn">
                  <Link to="/">Home</Link>
                </Button>
              </li>
              <li className="nav-link">
                <Button className="login-btn">
                  <Link to="/login">Login</Link>
                </Button>
              </li>
              <li className="nav-link">
                <Button className="register-btn">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HomeHeader;
