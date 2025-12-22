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
  <div
    className="
      flex
      items-center
      gap-1.5
      sm:gap-2
      text-xs
      sm:text-sm
    "
    role="navigation"
    aria-label="Language switcher"
  >
    <button
      type="button"
      onClick={() => switchLang("th")}
      aria-current={currentLang === "th" ? "true" : undefined}
      className={
        currentLang === "th"
          ? `
            font-semibold
            text-blue-600
          `
          : `
            text-gray-500
            hover:text-blue-600
            transition
          `
      }
    >
      TH
    </button>

    <span
      className="
        text-gray-300
        select-none
      "
      aria-hidden="true"
    >
      |
    </span>

    <button
      type="button"
      onClick={() => switchLang("en")}
      aria-current={currentLang === "en" ? "true" : undefined}
      className={
        currentLang === "en"
          ? `
            font-semibold
            text-blue-600
          `
          : `
            text-gray-500
            hover:text-blue-600
            transition
          `
      }
    >
      EN
    </button>
  </div>
);

}
