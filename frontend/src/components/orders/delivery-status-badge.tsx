import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { DeliveryStatus } from "@/types";

const LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Not picked up yet",
  ASSIGNED: "Assigned to you",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  CONFIRMED: "Confirmed by buyer",
  FAILED: "Failed",
};

const VARIANTS: Record<DeliveryStatus, NonNullable<BadgeProps["variant"]>> = {
  PENDING: "outline",
  ASSIGNED: "secondary",
  IN_TRANSIT: "warning",
  DELIVERED: "success",
  CONFIRMED: "success",
  FAILED: "destructive",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}