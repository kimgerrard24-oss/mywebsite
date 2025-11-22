// ==============================
// file: pages/sockettest.tsx
// ==============================
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketTest() {
  const [msg, setMsg] = useState<string>("Connecting...");

  useEffect(() => {
    // -------------------------------------------------------
    // Production API Base (Hybrid OAuth + Cookie Required)
    // -------------------------------------------------------
    const api =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://api.phlyphant.com";

    // เพิ่ม delay 500ms เพื่อให้ session cookie ถูกต้องก่อน WebSocket handshake
    const timer = setTimeout(() => {
      // -------------------------------------------------------
      // Socket.IO Production Config
      // -------------------------------------------------------
      const socketUrl = api.replace("https://", "wss://");

      const socket: Socket = io(socketUrl, {
        path: "/socket.io/",               // ต้องตรงกับ backend
        transports: ["polling", "websocket"],
        withCredentials: true,             // ส่ง session cookie
        autoConnect: true,
        reconnection: true,
        timeout: 20000,
      });

      (window as any).socket = socket;

      socket.on("connect", () => {
        setTimeout(() => {
          setMsg("Connected (id: " + socket.id + ")");

          // ทดสอบ callback event
          socket.emit("ping", (data: any) => {
            setMsg("Ping response: " + JSON.stringify(data));
          });
        }, 200);
      });

      socket.on("connect_error", (err) => {
        console.error("connect_error:", err);
        setMsg("connect_error: " + err.message);
      });

      socket.on("disconnect", () => {
        setMsg("Disconnected");
      });

      return () => {
        socket.disconnect();
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontSize: "18px",
        fontWeight: "500",
      }}
    >
      Socket Test: {msg}
    </div>
  );
}
