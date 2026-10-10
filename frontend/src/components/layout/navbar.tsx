"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import type { UserRole } from "@/types";

const LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/market-prices", label: "Market Prices" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

// What shows up next to the main nav links once someone's logged in, based
// on their role. Roles without a dashboard built yet (VET, COOPERATIVE,
// FINANCIER) just see the links above — nothing extra to point them at.
function dashboardLinksFor(role: UserRole): { href: string; label: string }[] {
  switch (role) {
    case "BUYER":
      return [{ href: "/orders", label: "My Orders" }];
    case "FARMER":
    case "SUPPLIER":
      return [
        { href: "/selling/listings", label: "My Listings" },
        { href: "/selling/orders", label: "Orders" },
      ];
    case "TRANSPORTER":
      return [{ href: "/delivering/deliveries", label: "My Deliveries" }];
    case "ADMIN":
      return [{ href: "/admin", label: "Admin" }];
    default:
      return [];
  }
}

export function Navbar() {
  const { user, status, clear } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => null);
    clear();
    router.push("/");
    router.refresh();
  }

  const dashboardLinks = user ? dashboardLinksFor(user.role) : [];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/90 border-b border-foreground/10">
      <nav className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-head font-extrabold text-lg">
          <span className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background text-sm">
            PL
          </span>
          PoultryLink
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:opacity-70 transition">
                {l.label}
              </Link>
            </li>
          ))}
          {status === "authenticated" &&
            dashboardLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:opacity-70 transition">
                  {l.label}
                </Link>
              </li>
            ))}
        </ul>

        <div className="flex items-center gap-3">
          {status === "authenticated" && user ? (
            <>
              <Link href="/profile" className="hidden sm:inline text-sm font-bold hover:opacity-70">
                {user.profile?.firstName ?? "Account"}
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm font-bold hover:opacity-70">
                Log in
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}