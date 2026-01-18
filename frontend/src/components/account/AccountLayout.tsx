// frontend/src/components/account/AccountLayout.tsx

import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { label: "My profile", href: "/settings/profile" },
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
  label: "Lock my account",
  href: "/settings/verify?next=/settings/confirm-lock",
  danger: true,
},

];

export default function AccountLayout({ children }: Props) {
  const router = useRouter();

  return (
    <main className="mx-auto flex max-w-5xl gap-6 px-4 py-8">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <nav className="rounded-lg border bg-white">
          <ul className="divide-y">
            {NAV_ITEMS.map((item) => {
              const active = router.pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={`block px-4 py-3 text-sm transition
                      ${
                        active
                          ? "bg-gray-100 font-semibold text-black"
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
            <p className="px-4 py-2 text-xs font-semibold uppercase text-gray-400">
              Security
            </p>

            <ul className="divide-y">
              {SECURITY_ACTIONS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={`block px-4 py-3 text-sm transition
                      ${
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
      <section className="min-w-0 flex-1 rounded-lg border bg-white p-6">
        {children}
      </section>
    </main>
  );
}

