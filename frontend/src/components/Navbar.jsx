import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.email) {
        parsedUser.displayName = parsedUser.email.split("@")[0];
      }

      setUser(parsedUser);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5001/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <div className="w-full bg-white/30 dark:bg-black/30 text-black dark:text-white px-6 py-3 flex justify-between items-center backdrop-blur-md shadow-md z-50">
      <div className="flex items-center gap-3">
        <img 
          src="/assets/1sqft logo.png" 
          alt="1SQFT Logo" 
          className="h-16 w-auto hover:scale-105 transition-transform duration-200"
        />
      </div>
  
      <div className="flex-1 flex justify-center">
        {user && (
          <div className="text-xl font-bold">
            Hello, <span className="text-red-600 dark:text-red-400">{user.displayName}</span>
          </div>
        )}
      </div>
  
      <div className="flex items-center gap-6">
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition text-lg font-semibold"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}