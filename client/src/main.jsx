import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Suppress browser extension errors
// eslint-disable-next-line no-undef
if (typeof chrome !== "undefined" && chrome?.runtime) {
  // eslint-disable-next-line no-undef
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      sendResponse({ success: true });
    } catch {
      console.debug("Extension message handled");
    }
    return false; // Explicitly return false to prevent hanging
  });
}

// Suppress extension-related promise rejections
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    typeof event.reason === "string" &&
    event.reason.includes("listener indicated an asynchronous response")
  ) {
    event.preventDefault();
  }
});

// Suppress extension errors in console
window.addEventListener("error", (event) => {
  if (
    event.message &&
    event.message.includes("listener indicated an asynchronous response")
  ) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
