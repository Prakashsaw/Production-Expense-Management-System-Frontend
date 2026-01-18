import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/antd.min.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Suppress ResizeObserver errors (common with Ant Design components)
// This is a known issue with Ant Design and doesn't affect functionality
// This fix prevents the error from appearing in React error boundaries and console
const resizeObserverErrorHandler = (e) => {
  const errorMessage = e.message || e.error?.message || String(e) || "";
  const errorString = errorMessage.toString().toLowerCase();
  
  if (
    errorString.includes("resizeobserver loop completed") ||
    errorString.includes("resizeobserver loop limit exceeded") ||
    errorString.includes("resizeobserver")
  ) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    e.cancelBubble = true;
    return false;
  }
};

// Handle error events with capture phase (catches errors before React error boundary)
window.addEventListener("error", resizeObserverErrorHandler, true);

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  const errorMessage = e.reason?.message || String(e.reason) || "";
  const errorString = errorMessage.toString().toLowerCase();
  if (errorString.includes("resizeobserver")) {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
  }
});

// Suppress console errors for ResizeObserver
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0]?.message || String(args[0]) || "";
  const errorString = errorMessage.toString().toLowerCase();
  if (errorString.includes("resizeobserver")) {
    return; // Suppress ResizeObserver errors
  }
  originalConsoleError.apply(console, args);
};

// Suppress console warnings for ResizeObserver
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const warningMessage = String(args[0]) || "";
  const warningString = warningMessage.toString().toLowerCase();
  if (warningString.includes("resizeobserver")) {
    return; // Suppress ResizeObserver warnings
  }
  originalConsoleWarn.apply(console, args);
};

// Override React's error reporting to catch ResizeObserver errors
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const errorMessage = message?.toString().toLowerCase() || "";
  if (errorMessage.includes("resizeobserver")) {
    return true; // Suppress the error
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
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


