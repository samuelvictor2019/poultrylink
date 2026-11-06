"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotificationItem } from "@/components/notifications/notification-item";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationHistory,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { notificationHref } from "@/lib/notifications";
import { useAuthStore } from "@/store/auth-store";
import type { AppNotification } from "@/types";

export default function NotificationsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationHistory();
  const { data: unread = 0 } = useUnreadCount(Boolean(role));
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  function handleOpen(n: AppNotification) {
    if (!n.isRead) markRead.mutate(n.id);
  }

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-head font-extrabold text-3xl">Notifications</h1>
        {unread > 0 && (
          <Button size="sm" variant="outline" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6">
        {isLoading || !role ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : isError ? (
          <p className="text-destructive">Couldn&apos;t load your notifications. Try refreshing.</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">Nothing here yet. Order updates will show up as they happen.</p>
        ) : (
          <>
            <Card className="overflow-hidden">
              {items.map((n) => (
                <NotificationItem key={n.id} notification={n} href={notificationHref(n, role)} onOpen={handleOpen} />
              ))}
            </Card>

            {hasNextPage && (
              <div className="mt-4 text-center">
                <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}