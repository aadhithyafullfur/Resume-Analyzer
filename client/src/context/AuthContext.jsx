import { useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./createAuthContext";

    export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const serverURL = import.meta.env.VITE_SERVER_URL;

  // Validate server URL on mount
  if (typeof window !== "undefined" && !serverURL && window.location.hostname === "localhost") {
    console.warn("⚠️ VITE_SERVER_URL is not configured. Server API calls may fail.");
  }

  const login = useCallback(async (email, password) => {
    if (!serverURL) {
      throw new Error("Server URL not configured");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${serverURL}/api/auth/login`, { email, password });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed. Is the server running?";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serverURL]);

  const registerUser = useCallback(async (name, email, password) => {
    if (!serverURL) {
      throw new Error("Server URL not configured");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${serverURL}/api/auth/register`, { name, email, password });
      setError(null);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed. Is the server running?";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serverURL]);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const value = {
    user,
    error,
    loading,
    login,
    registerUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
