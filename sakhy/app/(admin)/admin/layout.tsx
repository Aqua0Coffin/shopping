import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    redirect("/");
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "#F5EFE9" }}>
      {/* Dark fixed sidebar */}
      <AdminSidebar email={session.user.email ?? ""} />

      {/* Content — offset by sidebar width */}
      <div className="ml-[220px] flex flex-col min-h-screen">
        {/* Slim top bar */}
        <header className="sticky top-0 z-30 h-[60px] flex items-center border-b border-[#B08D5E]/12 bg-[#F5EFE9]/90 backdrop-blur-sm px-8">
          {/* Breadcrumb slot — pages can render their own heading in content */}
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest text-[#8A7B6A] hover:text-[#B08D5E] transition-colors mr-6"
          >
            View Store ↗
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
