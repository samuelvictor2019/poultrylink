import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Delivery, DeliveryStatus } from "@/types";

export function useMyDeliveries() {
  return useQuery({
    queryKey: ["deliveries", "mine"],
    queryFn: () => apiFetch<Delivery[]>("/deliveries/mine"),
  });
}

// CONFIRMED is deliberately not offered here — the backend blocks a
// transporter from setting it ("Only the buyer or an admin can confirm
// delivery"); only ADMIN or the buyer's own confirm-delivery action can.
export type TransporterSettableStatus = Extract<DeliveryStatus, "IN_TRANSIT" | "DELIVERED" | "FAILED">;

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: TransporterSettableStatus }) =>
      apiFetch<Delivery>(`/deliveries/${orderId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deliveries", "mine"] }),
  });
}