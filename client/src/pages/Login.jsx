import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials or server is not running");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-200">
      <div className="p-6 bg-white shadow rounded w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        {error && <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <input className="w-full p-2 border mb-3" type="email"
          placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />

        <input className="w-full p-2 border mb-3" type="password"
          placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} />

        <button className="w-full bg-blue-600 text-white p-2 disabled:opacity-50"
          onClick={submit} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>

        <p className="mt-3 text-sm">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </div>
    </div>
  );
}
