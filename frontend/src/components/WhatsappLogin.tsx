import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://10.20.10.106:3010");

const WhatsappLogin: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("check-login");

    socket.on("loggedIn", (status: boolean) => {
      setIsLoggedIn(status);
      if (status) {
        setTimeout(() => {
          navigate("/"); // Navigasi setelah delay singkat
        }, 1500);
      }
    });

    socket.on("qr", (qr: string) => {
      setQrCode(qr);
    });

    return () => {
      socket.off("qr");
      socket.off("loggedIn");
    };
  }, [navigate]);

  if (isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-green-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-green-600">✅ Anda sudah login</h2>
          <p className="mt-2 text-gray-600">Mengalihkan ke halaman utama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Login WhatsApp</h2>
        {qrCode ? (
          <QRCodeSVG value={qrCode} size={256} />
        ) : (
          <p>Menunggu QR Code...</p>
        )}
        <p className="mt-4 text-gray-600 text-center">
          Scan QR code di atas untuk login ke WhatsApp bot.
        </p>
      </div>
    </div>
  );
};

export default WhatsappLogin;
