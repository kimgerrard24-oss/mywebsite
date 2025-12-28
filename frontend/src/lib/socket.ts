// ==============================
// file: src/lib/socket.ts
// ==============================
import { io, Socket } from "socket.io-client";

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

  socketInstance = io(API_BASE, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket"], // บังคับ websocket
  });

  (window as any).socket = socketInstance;

  socketInstance.on("connect", () => {
    console.log("Socket connected:", socketInstance!.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Socket connect error:", err);
  });

  return socketInstance;
}
