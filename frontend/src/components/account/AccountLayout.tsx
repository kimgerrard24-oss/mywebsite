// frontend/src/components/account/AccountLayout.tsx

import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { label: "My profile", href: "/settings/profile" },
  { label: "Privacy", href: "/account/privacy" },
  { label: "Tag settings", href: "/settings/tag-settings" },
  { label: "Tagged posts", href: "/users/me/tagged-posts" },
  { label: "Hidden tagged posts", href: "/hided-posts/hide-posts" },
  { label: "Reports", href: "/reports/me" },
  { label: "Appeals", href: "/appeals/me" },
  { label: "Blocked users", href: "/users/blocks" },
];

const SECURITY_ACTIONS = [
  {
    label: "Download my data",
    href: "/settings/verify?next=/settings/security?do=export",
  },

  {
    label: "Set password",
    href: "/settings/set-password",
  },

  {
    label: "Lock my account",
    href: "/settings/verify?next=/settings/confirm-lock",
    danger: true,
  },
];

export default function AccountLayout({ children }: Props) {
  const router = useRouter();

 return (
  <main
    className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:px-6 sm:py-8"
    role="main"
  >
    {/* Sidebar */}
    <aside
      className="w-full shrink-0 sm:w-56"
      aria-label="Account navigation"
    >
      <nav
        className="rounded-lg border bg-white"
        role="navigation"
      >
        <ul className="divide-y" role="list">
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href;

            return (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={`block px-4 py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ============================
            Security Actions Section
           ============================ */}
        <div className="border-t">
          <p
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400"
            id="security-actions-heading"
          >
            Security
          </p>

          <ul
            className="divide-y"
            role="list"
            aria-labelledby="security-actions-heading"
          >
            {SECURITY_ACTIONS.map((item) => (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  prefetch={false}
                  className={`block px-4 py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    item.danger
                      ? "text-red-700 hover:bg-red-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>

    {/* Content */}
    <section
      className="min-w-0 flex-1 rounded-lg border bg-white p-4 sm:p-6"
      role="region"
      aria-live="polite"
    >
      {children}
    </section>
  </main>
);

}
