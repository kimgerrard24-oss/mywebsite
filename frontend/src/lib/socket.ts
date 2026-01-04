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

  if (socketInstance) {
    console.log("[socket] reuse existing socket", {
      id: socketInstance.id,
      connected: socketInstance.connected,
    });
    return socketInstance;
  }

  console.log("[socket] creating new socket", {
    API_BASE,
  });

  socketInstance = io(API_BASE, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket"], // บังคับ websocket
  });

  (window as any).socket = socketInstance;

  socketInstance.on("connect", () => {
    console.log("[socket] connected", {
      id: socketInstance!.id,
      transport: socketInstance!.io.engine.transport.name,
    });
  });

  socketInstance.on("disconnect", (reason) => {
    console.warn("[socket] disconnected", {
      reason,
    });
  });

  socketInstance.on("connect_error", (err) => {
    console.error("[socket] connect_error", {
      message: err?.message,
      name: err?.name,
      description: (err as any)?.description,
      context: (err as any)?.context,
    });
  });

  socketInstance.io.on("reconnect_attempt", (attempt) => {
    console.warn("[socket] reconnect_attempt", {
      attempt,
    });
  });

  socketInstance.io.on("reconnect_error", (err) => {
    console.error("[socket] reconnect_error", {
      message: err?.message,
    });
  });

  socketInstance.io.on("reconnect_failed", () => {
    console.error("[socket] reconnect_failed");
  });

  return socketInstance;
}
