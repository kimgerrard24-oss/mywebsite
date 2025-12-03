// ==============================
// file: pages/auth-check.tsx
// ==============================
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, LogIn, LogOut } from "lucide-react";

type Status = "OK" | "ERROR" | "LOADING";

export default function AuthCheckPage() {
  const [status, setStatus] = useState<Status>("LOADING");
  const [details, setDetails] = useState<any>(null);

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://phlyphant.com";

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com"
  ).replace(/\/+$/, "");

  // ==============================================
  // Session Check
  // ==============================================
  const checkSession = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/session-check`, {
        withCredentials: true,
      });

      if (res.data && res.data.valid === true) {
        setStatus("OK");
        setDetails(res.data);
        return;
      }

      const retry = await axios.get(`${API_BASE}/auth/session-check`, {
        withCredentials: true,
      });

      if (retry.data && retry.data.valid === true) {
        setStatus("OK");
        setDetails(retry.data);
      } else {
        setStatus("ERROR");
      }
    } catch {
      setStatus("ERROR");
    }
  };

  const googleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const facebookLogin = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };

  // ======================================
  // FIXED: ใช้ endpoint ที่มีจริงใน Backend
  // ======================================
  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
      checkSession();
    } catch {}
  };

  useEffect(() => {
    checkSession();
  }, []);

  const StatusIcon =
    status === "OK" ? (
      <CheckCircle className="w-8 h-8 text-green-600" />
    ) : status === "ERROR" ? (
      <XCircle className="w-8 h-8 text-red-600" />
    ) : (
      <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
    );

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-linear-to-br from-purple-100 via-white to-blue-100">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl border rounded-3xl p-6 sm:p-10">

        <h1 className="text-3xl md:text-4xl font-extrabold text-center 
          bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm mb-10"
        >
          Hybrid OAuth + Firebase Admin Test
        </h1>

        <div className="flex items-center justify-center mb-8">
          {StatusIcon}
          <span className="ml-4 text-lg md:text-xl font-semibold">
            Session Status:{" "}
            {status === "OK"
              ? "VALID (Authenticated)"
              : status === "ERROR"
              ? "INVALID / NO SESSION"
              : "Checking..."}
          </span>
        </div>

        {details && status === "OK" && (
          <div className="bg-green-50 border border-green-200 p-5 rounded-xl mb-8">
            <h2 className="font-bold text-green-700 text-lg mb-2">
              User Details
            </h2>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        {status !== "OK" && (
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              คุณยังไม่ได้ Login หรือ Session หมดอายุ
            </p>

            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={googleLogin}
                className="
                  px-6 py-3 rounded-xl text-white font-semibold
                  bg-blue-600 hover:bg-blue-700
                  hover:shadow-lg hover:scale-105
                  transition-all flex items-center gap-2
                "
              >
                <LogIn className="w-5 h-5" /> Login with Google
              </button>

              <button
                onClick={facebookLogin}
                className="
                  px-6 py-3 rounded-xl text-white font-semibold
                  bg-blue-800 hover:bg-blue-900
                  hover:shadow-lg hover:scale-105
                  transition-all flex items-center gap-2
                "
              >
                <LogIn className="w-5 h-5" /> Login with Facebook
              </button>
            </div>
          </div>
        )}

        {status === "OK" && (
          <div className="text-center">
            <button
              onClick={logout}
              className="
                px-6 py-3 rounded-xl font-semibold
                bg-red-500 text-white hover:bg-red-600
                hover:shadow-lg hover:scale-105
                transition-all flex items-center gap-2 mx-auto
              "
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
