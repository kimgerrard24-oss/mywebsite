// ==============================
// file: src/lib/socket.ts
// ==============================
import { io, Socket } from "socket.io-client";

// ============================
// Production API Base ตาม env
// ============================
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getSocket() cannot be used on SSR");
  }

  if (socketInstance) return socketInstance;

  // ============================
  // ใช้ WSS (Secure Websocket) เสมอ
  // ============================
  const socketUrl = API_BASE.replace("https://", "wss://");

  // ============================
  // ตั้งค่าเพื่อให้เข้ากับ backend NestJS ของคุณเป๊ะ
  // ============================
  socketInstance = io(socketUrl, {
    path: "/socket.io",
    withCredentials: true,          // ส่ง session cookie ไป backend (HttpOnly)
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    secure: true,
  });

  // Optional: expose to window for debugging
  (window as any).socket = socketInstance;

  socketInstance.on("connect", () => {
    console.log("Socket connected:", socketInstance!.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Socket connect error:", err);
  });

  // หน่วงเล็กน้อยเพื่อให้ session cookie พร้อมก่อน connect
  setTimeout(() => {
    if (!socketInstance!.connected) socketInstance!.connect();
  }, 300);

  return socketInstance;
}
