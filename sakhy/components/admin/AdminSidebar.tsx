"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8 2v12M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.25" />
        <path d="M2 13.5c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col"
      style={{ background: "#120800" }}
    >
      {/* Brand */}
      <div className="flex h-[60px] shrink-0 items-center border-b border-white/5 px-6">
        <div>
          <span className="font-display text-base tracking-[0.22em] text-[#B08D5E] uppercase">
            Sakhy
          </span>
          <span className="ml-2 text-[9px] tracking-[0.3em] text-white/25 uppercase font-sans align-middle">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1 overflow-y-auto" aria-label="Admin navigation">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded px-3 py-2.5 text-[11px] tracking-wider uppercase
                transition-colors duration-150 font-sans font-medium
                ${active
                  ? "bg-white/[0.06] text-[#B08D5E] border-l-2 border-[#B08D5E] -ml-px pl-[11px]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className={`shrink-0 transition-colors ${active ? "text-[#B08D5E]" : "text-white/25 group-hover:text-white/50"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user */}
      <div className="shrink-0 border-t border-white/5 px-4 py-4">
        <p className="text-[10px] text-white/30 truncate font-sans mb-2">{email}</p>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="text-[10px] uppercase tracking-widest text-white/30 hover:text-[#B08D5E] transition-colors font-sans"
        >
          Sign out →
        </Link>
      </div>
    </aside>
  );
}
