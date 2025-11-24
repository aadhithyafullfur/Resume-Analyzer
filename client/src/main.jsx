import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// List of known extension error patterns to suppress
const EXTENSION_ERROR_PATTERNS = [
  "listener indicated an asynchronous response",
  "is not a function",
  "chrome-extension://",
  "message channel closed",
  "Extension context invalidated",
  "Could not establish connection",
];

// Check if error matches extension patterns
const isExtensionError = (message, filename) => {
  const messageStr = String(message || "").toLowerCase();
  const filenameStr = String(filename || "").toLowerCase();
  return EXTENSION_ERROR_PATTERNS.some(
    (pattern) =>
      messageStr.includes(pattern.toLowerCase()) ||
      filenameStr.includes(pattern.toLowerCase())
  );
};

// Suppress browser extension errors
// eslint-disable-next-line no-undef
if (typeof chrome !== "undefined" && chrome?.runtime) {
  // eslint-disable-next-line no-undef
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      // Respond immediately without returning true to prevent "message channel closed" error
      sendResponse({ received: true });
    } catch {
      // Silently handle - extension may already be unloaded
    }
    // IMPORTANT: Never return true here - it causes async response timeout
  });
}

// Suppress extension-related unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (
    isExtensionError(reason?.message || reason, reason?.filename) ||
    (typeof reason === "string" && isExtensionError(reason, ""))
  ) {
    event.preventDefault();
  }
});

// Suppress extension errors globally
window.addEventListener("error", (event) => {
  if (isExtensionError(event.message, event.filename)) {
    event.preventDefault();
  }
});

// Override console.error to filter extension messages
const originalError = console.error;
console.error = function (...args) {
  const message = args[0];
  if (message && !isExtensionError(String(message), "")) {
    originalError.apply(console, args);
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
