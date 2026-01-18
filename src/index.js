import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/antd.min.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Suppress ResizeObserver errors (common with Ant Design components)
// This is a known issue with Ant Design and doesn't affect functionality
const resizeObserverErrorHandler = (e) => {
  const errorMessage = e.message || e.error?.message || String(e);
  if (
    errorMessage.includes("ResizeObserver loop completed") ||
    errorMessage.includes("ResizeObserver loop limit exceeded") ||
    errorMessage.includes("ResizeObserver")
  ) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
};

// Handle error events with capture phase
window.addEventListener("error", resizeObserverErrorHandler, true);

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  const errorMessage = e.reason?.message || String(e.reason) || "";
  if (errorMessage.includes("ResizeObserver")) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// Suppress console errors for ResizeObserver
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0]?.message || String(args[0]) || "";
  if (errorMessage.includes("ResizeObserver")) {
    return; // Suppress ResizeObserver errors
  }
  originalConsoleError.apply(console, args);
};

// Suppress console warnings for ResizeObserver
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const warningMessage = String(args[0]) || "";
  if (warningMessage.includes("ResizeObserver")) {
    return; // Suppress ResizeObserver warnings
  }
  originalConsoleWarn.apply(console, args);
};

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


