import React from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";


const socket = io("http://10.20.10.106:3010", {
  withCredentials: true,
});
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login-whatsapp"); // Ganti dengan path login WhatsApp kamu
  };
  const handleLogoutClick = () => {
    socket.emit("logout");
    alert("Logout berhasil");
    // Optionally redirect or refresh
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Login WhatsApp
          </button>
          <button
            onClick={handleLogoutClick}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
