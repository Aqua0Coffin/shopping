import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="border-b border-gold/15 bg-silk/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Sakhy Admin</p>
            <p className="text-sm text-charcoal">{session.user.email}</p>
          </div>
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors duration-300 font-medium"
          >
            Sign Out
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <aside className="border border-gold/15 bg-silk/10 p-4 h-fit">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-charcoal/80 hover:text-gold transition-colors px-2 py-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
