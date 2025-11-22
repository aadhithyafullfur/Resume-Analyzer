import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    
    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      await registerUser(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-200">
      <div className="p-6 bg-white shadow rounded w-80">
        <h1 className="text-xl font-bold mb-4">Register</h1>

        {error && <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <input className="w-full p-2 border mb-3"
          placeholder="Name" value={name} onChange={e=>setName(e.target.value)} disabled={loading} />

        <input className="w-full p-2 border mb-3" type="email"
          placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />

        <input className="w-full p-2 border mb-3" type="password"
          placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} />

        <button className="w-full bg-blue-600 text-white p-2 disabled:opacity-50"
          onClick={submit} disabled={loading}>{loading ? "Registering..." : "Register"}</button>

        <p className="mt-3 text-sm">
          Already have an account? <Link to="/" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
