// ==============================
// file: lib/debug/exposeFirebase.ts
// Production-Safe Firebase Auth Debug Exposer
// ==============================

import { getFirebaseAuth } from "@/lib/firebaseClient";

/**
 * ตรวจสอบว่าควรเปิดโหมด Debug หรือไม่
 *
 * - เปิดได้ด้วยวิธีใดวิธีหนึ่ง:
 *   1) URL query เช่น  ?debug-firebase=1
 *   2) localStorage.__debug_firebase = "1"
 *
 * - ปลอดภัยมาก เพราะผู้ใช้ทั่วไปจะไม่รู้หรือไม่มีสิทธิ์เปิด
 */
function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const flagLocalStorage =
    localStorage.getItem("__debug_firebase") === "1";

  const flagQuery =
    typeof window !== "undefined" &&
    window.location.search.includes("debug-firebase=1");

  return flagLocalStorage || flagQuery;
}

/**
 * ฟังก์ชันหลักสำหรับ expose Firebase Auth แบบปลอดภัย
 */
export function exposeFirebaseAuthSafe(): void {
  if (typeof window === "undefined") return;

  // เปิดเฉพาะตอน Developer ต้องการ
  if (!isDebugEnabled()) return;

  try {
    const auth = getFirebaseAuth();

    // Expose เฉพาะสำหรับ Dev
    (window as any)._firebaseAuth = auth;

    console.log(
      "%c[DEBUG] Firebase Auth ได้ถูก expose ไว้ที่ window._firebaseAuth",
      "color: green; font-weight: bold;"
    );
  } catch (err) {
    console.error("[DEBUG] exposeFirebaseAuthSafe() failed:", err);
  }
}

/**
 * ฟังก์ชันเสริม (optional)
 * เพื่อให้นักพัฒนารู้วิธีเปิด debug mode
 */
export function printDebugInstructions(): void {
  if (typeof window === "undefined") return;

  console.log(`
===============================
🔥 Firebase Debug Instructions
===============================

เปิด Debug ได้ 2 วิธี:

1) ผ่าน URL:
   ?debug-firebase=1

2) ผ่าน console:
   localStorage.setItem("__debug_firebase", "1");
   location.reload();

ปิด Debug:
   localStorage.removeItem("__debug_firebase");
   location.reload();

หลังเปิดแล้ว คุณสามารถเข้าถึง Firebase Auth ได้ที่:

   window._firebaseAuth

===============================
`);
}
