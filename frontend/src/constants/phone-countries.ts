// frontend/src/constants/phone-countries.ts

export type PhoneCountry = {
  code: string;      // ISO: TH
  name: string;      // Thailand
  callingCode: string; // +66
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "TH", name: "Thailand", callingCode: "+66" },
  { code: "US", name: "United States", callingCode: "+1" },
  { code: "JP", name: "Japan", callingCode: "+81" },
  { code: "KR", name: "South Korea", callingCode: "+82" },
  { code: "SG", name: "Singapore", callingCode: "+65" },
  // 👉 เพิ่มได้เรื่อย ๆ (หรือเดี๋ยวผมให้ full list ทีหลัง)
];
