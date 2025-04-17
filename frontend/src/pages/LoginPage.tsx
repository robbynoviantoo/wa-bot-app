import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setToken } from "../utils/auth";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "BOT - Login";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await login(username, password);
      setToken(token);
      navigate("/");
    } catch (err) {
      alert("Login gagal");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-sm p-8 bg-white bg-opacity-80 rounded-lg shadow-lg backdrop-blur-xl">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-8">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-200"
            >
              Login
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-gray-700">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
