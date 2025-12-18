// frontend/src/lib/i18n.ts
import th from "locales/th";
import en from "locales/en";

export type Lang = "th" | "en";

const dictionaries = { th, en };

export function getDictionary(lang: Lang) {
  return dictionaries[lang] ?? dictionaries.th;
}
