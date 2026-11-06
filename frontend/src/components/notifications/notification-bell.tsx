"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import {
  useLatestNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { notificationHref } from "@/lib/notifications";
import { useAuthStore } from "@/store/auth-store";
import type { AppNotification } from "@/types";

export function NotificationBell() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: unread = 0 } = useUnreadCount(Boolean(role));
  const { data: latest, isLoading, isError } = useLatestNotifications(open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = latest?.data ?? [];

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!role) return null;

  function handleOpen(n: AppNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="relative p-2 rounded-lg hover:bg-secondary"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-foreground bg-background pixel-shadow z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
            <p className="font-head font-bold text-sm">Notifications</p>
            {unread > 0 && (
              <Button size="sm" variant="ghost" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : isError ? (
              <p className="px-4 py-8 text-center text-sm text-destructive">Couldn&apos;t load notifications.</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => (
                <NotificationItem key={n.id} notification={n} href={notificationHref(n, role)} onOpen={handleOpen} />
              ))
            )}
          </div>

          <Link
            href="/notifications"
            className="block px-4 py-3 text-center text-xs font-bold border-t border-foreground/10 hover:bg-secondary"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}