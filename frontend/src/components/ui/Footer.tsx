export default function Footer(){
return (
  <footer
    className="
      mt-8
      sm:mt-10
      md:mt-12
    "
  >
    <div
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        sm:px-6
        py-4
        sm:py-6
        text-xs
        sm:text-sm
        text-gray-500
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-3
        sm:gap-4
      "
    >
      <div className="text-center sm:text-left">
        © {new Date().getFullYear()} The Elephant
      </div>

      <div
        className="
          flex
          justify-center
          sm:justify-end
          gap-3
          sm:gap-4
        "
      >
        <a
          href="/legal/terms"
          className="hover:underline"
        >
          Terms
        </a>
        <a
          href="/legal/privacy"
          className="hover:underline"
        >
          Privacy
        </a>
        <a
          href="/contact"
          className="hover:underline"
        >
          Contact
        </a>
      </div>
    </div>
  </footer>
);

}
