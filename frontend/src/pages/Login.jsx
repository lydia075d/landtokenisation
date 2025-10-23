import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("user");

  const navigate = useNavigate();
  const { login } = useAuth();

  const teamAccounts = {
    "admin@gmail.com": { password: "admin", role: "admin", path: "/admin-dashboard" },
    "property@gmail.com": { password: "prop", role: "property", path: "/pteam-dashboard" },
    "legal@gmail.com": { password: "legal", role: "legal", path: "/lteam-dashboard" },
    "token@gmail.com": { password: "token", role: "token", path: "/tteam-dashboard" },
    "finance@gmail.com": { password: "finance", role: "finance", path: "/Fteam-dashboard" },
    "tech@gmail.com": { password: "tech", role: "tech", path: "/Techteam-dashboard" },
    "purchase@gmail.com": { password: "purchase", role: "purchase", path: "/PurchaseHead-dashboard" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (loginType === "admin" && teamAccounts[email]) {
        const team = teamAccounts[email];
        if (password === team.password) {
          login({ email, role: team.role });
          localStorage.setItem("token", `${team.role}-token`);
          localStorage.setItem("user_id", `${team.role}-id`);
          localStorage.setItem("role", team.role);
          localStorage.setItem("user", JSON.stringify({ email, username: email.split("@")[0], role: team.role }));
          

          return navigate(team.path);
        } else {
          setError("Invalid admin credentials.");
          return;
        }
      }

      // Default user login via backend
      const res = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      login(res.data.user);
      localStorage.setItem("user_id", res.data.user.id || res.data.user._id);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role || "user");
      localStorage.setItem("user", JSON.stringify(res.data.user)); 

      navigate(res.data.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url("/assets/map-bg.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-black-500">Login</h2>

        <div className="flex justify-center mb-6 space-x-4">
          <button
            type="button"
            onClick={() => setLoginType("user")}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition duration-200 ${
              loginType === "user"
                ? "bg-red-600 text-white border-black"
                : "bg-transparent text-red-400 border-red-400"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition duration-200 ${
              loginType === "admin"
                ? "bg-red-600 text-white border-black"
                : "bg-transparent text-red-400 border-red-400"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loginType === "user" && (
          <p className="text-center mt-4 text-sm text-black">
            Don’t have an account?{" "}
            <Link to="/register" className="text-red-500 hover:underline">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
