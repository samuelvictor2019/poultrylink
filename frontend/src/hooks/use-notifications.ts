import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import type { ApiSuccess, AppNotification } from "@/types";

type Page = { data: AppNotification[]; meta?: ApiSuccess<AppNotification[]>["meta"] };

const PAGE_SIZE = 20;
const POLL_MS = 30_000; // no websockets in Phase 1; the count endpoint is cheap enough to poll

export const notificationKeys = {
  all: ["notifications"] as const,
  count: ["notifications", "count"] as const,
  list: ["notifications", "list"] as const,
  infinite: ["notifications", "infinite"] as const,
};

/** Drives the bell badge. Polls only while the tab is visible (react-query's default). */
export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.count,
    queryFn: async () => (await apiFetch<{ count: number }>("/notifications/unread-count")).count,
    enabled,
    refetchInterval: POLL_MS,
  });
}

/** Latest notifications for the dropdown. Only fetched while it's open. */
export function useLatestNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => apiFetchPaginated<AppNotification[]>(`/notifications?limit=${PAGE_SIZE}`),
    enabled,
  });
}

/** Full history for the /notifications page. */
export function useNotificationHistory() {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetchPaginated<AppNotification[]>(`/notifications?limit=${PAGE_SIZE}&page=${pageParam}`),
    getNextPageParam: (last) =>
      last.meta && last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
}

// ---- optimistic updates -----------------------------------------------------
// The badge, the dropdown and the history page all show the same read state,
// so a click patches every cached copy at once and rolls back if Express says no.

function patchCaches(queryClient: QueryClient, patch: (n: AppNotification) => AppNotification) {
  queryClient.setQueriesData<Page>({ queryKey: notificationKeys.list }, (old) =>
    old ? { ...old, data: old.data.map(patch) } : old
  );
  queryClient.setQueriesData<InfiniteData<Page>>({ queryKey: notificationKeys.infinite }, (old) =>
    old ? { ...old, pages: old.pages.map((p) => ({ ...p, data: p.data.map(patch) })) } : old
  );
}

function findCached(queryClient: QueryClient, id: string): AppNotification | undefined {
  for (const [, page] of queryClient.getQueriesData<Page>({ queryKey: notificationKeys.list })) {
    const hit = page?.data.find((n) => n.id === id);
    if (hit) return hit;
  }
  for (const [, history] of queryClient.getQueriesData<InfiniteData<Page>>({ queryKey: notificationKeys.infinite })) {
    for (const p of history?.pages ?? []) {
      const hit = p.data.find((n) => n.id === id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      const wasUnread = findCached(queryClient, id)?.isRead === false;
      patchCaches(queryClient, (n) => (n.id === id ? { ...n, isRead: true } : n));
      if (wasUnread) {
        queryClient.setQueryData<number>(notificationKeys.count, (c) => Math.max(0, (c ?? 1) - 1));
      }
      return { snapshot };
    },

    onError: (_err, _id, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData<unknown>(key, data));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/notifications/read-all", { method: "PATCH" }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      patchCaches(queryClient, (n) => ({ ...n, isRead: true }));
      queryClient.setQueryData<number>(notificationKeys.count, 0);
      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData<unknown>(key, data));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}