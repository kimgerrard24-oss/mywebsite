// ==============================
// file: src/lib/socket.ts
// ==============================
import { io, Socket } from "socket.io-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

let socketInstance: Socket | null = null;

/**
 * Create (but NOT connect) socket instance
 * Connection must be triggered explicitly
 */
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

  console.log("[socket] creating new socket (autoConnect=false)", {
    API_BASE,
  });

  socketInstance = io(API_BASE, {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: false, // 🔴 CRITICAL FIX
  });

  (window as any).socket = socketInstance;

  socketInstance.on("connect", () => {
    console.log("[socket] connected", {
      id: socketInstance!.id,
      transport: socketInstance!.io.engine.transport.name,
    });
  });

  socketInstance.on("disconnect", (reason) => {
    console.warn("[socket] disconnected", { reason });
  });

  socketInstance.on("connect_error", (err) => {
    console.error("[socket] connect_error", {
      message: err?.message,
      name: err?.name,
    });
  });

  socketInstance.io.on("reconnect_attempt", (attempt) => {
    console.warn("[socket] reconnect_attempt", { attempt });
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

/**
 * Explicitly connect socket
 * Must be called AFTER session is valid
 */
export function connectSocket(): void {
  if (!socketInstance) {
    console.warn("[socket] connect called but socket not created");
    return;
  }

  if (socketInstance.connected) {
    console.log("[socket] already connected");
    return;
  }

  console.log("[socket] connecting...");
  socketInstance.connect();
}

/**
 * Destroy socket completely (e.g. logout / session reset)
 */
export function resetSocket(): void {
  if (!socketInstance) return;

  console.warn("[socket] resetting socket", {
    id: socketInstance.id,
    connected: socketInstance.connected,
  });

  socketInstance.disconnect();
  socketInstance = null;
}

export function resetAfterAccountLock() {
  try {
    resetSocket();
  } catch {}

  // If you have auth store / notification store, reset here
  // e.g. useAuthStore.getState().reset()

  // Clear client-only caches if any
}