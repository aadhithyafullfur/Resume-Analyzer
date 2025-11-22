import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="text-xl font-bold">AI Resume Analyzer</h1>

      <div className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/history">History</Link>
        {user && (
          <button className="bg-red-500 px-3 rounded" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
