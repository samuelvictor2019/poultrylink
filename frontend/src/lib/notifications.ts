import type { AppNotification, UserRole } from "@/types";

/**
 * Where a notification should take the person who received it, or null when
 * there's nowhere useful to go.
 *
 * Order notifications normally open the shared order page, but that page is
 * only for the buyer and seller — transporters and admins have their own
 * screens, so they're routed there instead.
 */
export function notificationHref(n: Pick<AppNotification, "orderId" | "type">, role: UserRole): string | null {
    if (role === "TRANSPORTER" && n.orderId) return "/delivering/deliveries";
    if (role === "ADMIN" && n.orderId) return "/admin/disputes";
    if (n.orderId) return `/orders/${n.orderId}`;
    if (n.type === "VERIFICATION") return "/profile";
    return null;
}