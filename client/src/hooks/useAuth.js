import { useContext } from "react";
import { AuthContext } from "../context/createAuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider. Make sure AuthProvider wraps your component tree.");
  }
  return context;
};
