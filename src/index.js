import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/antd.min.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Initialize theme from localStorage before rendering
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark-mode');
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


