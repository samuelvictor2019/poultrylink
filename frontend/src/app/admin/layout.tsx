"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/verification", label: "Verification" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuthStore();
  const pathname = usePathname();

  if (status === "loading" || status === "idle") {
    return <main className="px-6 py-16 text-center text-muted-foreground">Loading…</main>;
  }

  if (status === "unauthenticated" || !user || user.role !== "ADMIN") {
    return (
      <main className="px-6 py-16 text-center">
        <p className="font-head font-bold text-lg">Admins only</p>
        <p className="text-muted-foreground mt-2">You need an admin account to view this page.</p>
      </main>
    );
  }

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-5xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl">Admin</h1>
      <div className="flex gap-2 mt-4 border-b border-foreground/10 pb-px">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-t-lg",
              pathname === t.href ? "bg-foreground text-background" : "hover:bg-secondary"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </main>
  );
}