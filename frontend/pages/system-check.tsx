// ==============================
// file: pages/system-check.tsx
// ==============================
import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "OK" | "ERROR" | "LOADING";

interface ResultMap {
  tailwind: Status;
  backend: Status;
  postgres: Status;
  redis: Status;
  secrets: Status;
  s3: Status;
  queue: Status;
  socket: Status;
}

export default function SystemCheckPage() {
  const [results, setResults] = useState<ResultMap>({
    tailwind: "LOADING",
    backend: "LOADING",
    postgres: "LOADING",
    redis: "LOADING",
    secrets: "LOADING",
    s3: "LOADING",
    queue: "LOADING",
    socket: "LOADING",
  });

  const api =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  useEffect(() => {
    setResults((prev) => ({ ...prev, tailwind: "OK" }));

    const tests = async () => {
      try {
        const { data } = await axios.get(`${api}/system-check`);

        setResults((p) => ({
          ...p,
          backend: data.status.backend ? "OK" : "ERROR",
          postgres: data.status.postgres ? "OK" : "ERROR",
          redis: data.status.redis ? "OK" : "ERROR",
          secrets: data.status.secrets ? "OK" : "ERROR",
          s3: data.status.s3 ? "OK" : "ERROR",
          queue: data.status.queue ? "OK" : "ERROR",
        }));
      } catch {
        setResults((p) => ({
          ...p,
          backend: "ERROR",
          postgres: "ERROR",
          redis: "ERROR",
          secrets: "ERROR",
          s3: "ERROR",
          queue: "ERROR",
        }));
      }

      // WebSocket Check
      try {
        await new Promise((res) => setTimeout(res, 300));

        const socket: Socket = io(api.replace("https://", "wss://"), {
          transports: ["websocket", "polling"],
          path: "/socket.io/",
          autoConnect: true,
          reconnection: true,
          timeout: 20000,
        });

        (window as any).socket = socket;

        socket.on("connect", () => {
          setTimeout(() => {
            setResults((p) => ({ ...p, socket: "OK" }));
          }, 100);
        });

        socket.on("connect_error", () => {
          setResults((p) => ({ ...p, socket: "ERROR" }));
        });

        socket.on("disconnect", () => {
          setResults((p) => ({ ...p, socket: "ERROR" }));
        });
      } catch {
        setResults((p) => ({ ...p, socket: "ERROR" }));
      }
    };

    tests();
  }, [api]);

  const renderStatus = (label: string, status: Status) => {
    if (status === "LOADING")
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={20} />
          {label}: Checking...
        </div>
      );

    if (status === "OK")
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={20} />
          {label}: OK
        </div>
      );

    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle size={20} />
        {label}: ERROR
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">System Check</h1>

      <div className="space-y-3">
        {renderStatus("TailwindCSS", results.tailwind)}
        {renderStatus("Backend", results.backend)}
        {renderStatus("PostgreSQL", results.postgres)}
        {renderStatus("Redis", results.redis)}
        {renderStatus("Secrets Manager", results.secrets)}
        {renderStatus("S3", results.s3)}
        {renderStatus("Queue", results.queue)}
        {renderStatus("WebSocket", results.socket)}
      </div>
    </div>
  );
}
