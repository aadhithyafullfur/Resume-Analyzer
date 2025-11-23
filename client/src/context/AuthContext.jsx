import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./createAuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const serverURL = import.meta.env.VITE_SERVER_URL;

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!serverURL) {
        console.warn("⚠️ VITE_SERVER_URL is not configured. Server API calls may fail.");
      }
      setIsInitialized(true);
    }
  }, [serverURL]);

  const login = useCallback(
    async (email, password) => {
      if (!serverURL) {
        const err = new Error("Server URL not configured");
        setError(err.message);
        throw err;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axios.post(`${serverURL}/api/auth/login`, {
          email,
          password,
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          setError(null);
        }
        return res.data;
      } catch (err) {
        let message =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Is the server running?";

        // Ignore extension-related errors
        if (message.includes("listener indicated an asynchronous response")) {
          return null;
        }

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [serverURL]
  );

  const registerUser = useCallback(
    async (name, email, password) => {
      if (!serverURL) {
        const err = new Error("Server URL not configured");
        setError(err.message);
        throw err;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axios.post(`${serverURL}/api/auth/register`, {
          name,
          email,
          password,
        });

        if (res.data) {
          setError(null);
        }
        return res.data;
      } catch (err) {
        let message =
          err.response?.data?.message ||
          err.message ||
          "Registration failed. Is the server running?";

        // Ignore extension-related errors
        if (message.includes("listener indicated an asynchronous response")) {
          return null;
        }

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [serverURL]
  );

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (!isInitialized) {
    return null;
  }

  const value = {
    user,
    error,
    loading,
    login,
    registerUser,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};