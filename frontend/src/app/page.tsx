"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.text())
      .then(setMessage)
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-100 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors px-6 py-12">
      {/* Floating Background Ornaments */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl animate-ping"></div>
      </div>

      {/* Card Container */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 max-w-lg w-full transition-transform hover:scale-[1.02]">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 mb-4 drop-shadow-sm">
          Frontend is running ✅
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          Backend says:
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md">
            {message || "Loading..."}
          </span>
        </p>

        <button
          className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95 transition-all duration-200"
          onClick={() => alert('TailwindCSS ทำงานดีมาก 🎉')}
        >
          ทดสอบ Tailwind Button 🚀
        </button>

        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {["bg-red-500", "bg-green-500", "bg-yellow-400", "bg-blue-500", "bg-purple-500", "bg-pink-500"].map(
            (color, i) => (
              <div
                key={i}
                className={`w-10 h-10 ${color} rounded-full shadow-md hover:scale-110 transition-transform`}
              ></div>
            )
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          หากเห็นพื้นหลังแบบ gradient ปุ่มมีเอฟเฟกต์ hover และวงกลมสีแสดงอยู่ — TailwindCSS ใช้งานได้ถูกต้อง ✅
        </p>
      </div>
    </main>
  );
}
