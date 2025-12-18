// LanguageSwitcher.tsx
type Lang = "th" | "en";

export default function LanguageSwitcher({
  currentLang,
}: {
  currentLang: Lang;
}) {
  const switchLang = (lang: Lang) => {
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => switchLang("th")}
        className={
          currentLang === "th"
            ? "font-semibold text-blue-600"
            : "text-gray-500 hover:text-blue-600"
        }
      >
        TH
      </button>

      <span className="text-gray-300">|</span>

      <button
        type="button"
        onClick={() => switchLang("en")}
        className={
          currentLang === "en"
            ? "font-semibold text-blue-600"
            : "text-gray-500 hover:text-blue-600"
        }
      >
        EN
      </button>
    </div>
  );
}
