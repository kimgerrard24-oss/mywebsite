// frontend/src/components/share/ShareLinkError.tsx

type Props = {
  type: "NOT_FOUND" | "FORBIDDEN" | "EXPIRED";
};

export default function ShareLinkError({
  type,
}: Props) {
  let title = "เกิดข้อผิดพลาด";
  let desc = "ไม่สามารถเปิดลิงก์นี้ได้";

  if (type === "NOT_FOUND") {
    title = "ไม่พบลิงก์นี้";
    desc = "ลิงก์อาจถูกลบหรือไม่ถูกต้อง";
  }

  if (type === "EXPIRED") {
    title = "ลิงก์หมดอายุ";
    desc = "ลิงก์นี้ไม่สามารถใช้งานได้อีก";
  }

  if (type === "FORBIDDEN") {
    title = "ไม่สามารถเข้าถึงโพสต์นี้ได้";
    desc = "อาจเป็นเพราะการตั้งค่าความเป็นส่วนตัว";
  }

  return (
    <div className="text-center space-y-2">
      <h1 className="text-lg font-semibold">
        {title}
      </h1>
      <p className="text-sm text-gray-500">
        {desc}
      </p>
    </div>
  );
}
