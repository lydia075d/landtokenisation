import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    agent_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5001/api/auth/register", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
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
        <h2 className="text-3xl font-bold text-center mb-6 text-black">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <input
            name="username"
            value={form.username}
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            name="name"
            value={form.name}
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            name="phone"
            value={form.phone}
            placeholder="Phone (optional)"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <input
            name="agent_code"
            value={form.agent_code}
            placeholder="Agent Code (optional)"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-black-400 bg-transparent text-black placeholder-black-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-black">
          Already have an account?{" "}
          <Link to="/" className="text-red-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
