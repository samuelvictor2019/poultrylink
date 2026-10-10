"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeliveryStatusBadge } from "@/components/orders/delivery-status-badge";
import { useMyDeliveries, useUpdateDeliveryStatus, type TransporterSettableStatus } from "@/hooks/use-deliveries";
import { ApiClientError } from "@/lib/api/client";

// What a transporter can move a delivery to, from wherever it currently sits.
// CONFIRMED is never offered — see the note in use-deliveries.ts.
const NEXT_ACTIONS: Partial<Record<string, { label: string; status: TransporterSettableStatus }[]>> = {
  PENDING: [{ label: "Mark in transit", status: "IN_TRANSIT" }],
  ASSIGNED: [{ label: "Mark in transit", status: "IN_TRANSIT" }],
  IN_TRANSIT: [
    { label: "Mark delivered", status: "DELIVERED" },
    { label: "Mark failed", status: "FAILED" },
  ],
};

export default function MyDeliveriesPage() {
  const { data: deliveries, isLoading } = useMyDeliveries();
  const updateStatus = useUpdateDeliveryStatus();
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(orderId: string, status: TransporterSettableStatus) {
    setError(null);
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't update that delivery.");
    }
  }

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-3xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl">Your deliveries</h1>
      <p className="text-muted-foreground mt-1">Orders a seller has assigned to you for dispatch.</p>

      {error && <p className="text-sm font-semibold text-destructive mt-4">{error}</p>}

      {isLoading ? (
        <p className="text-muted-foreground mt-6">Loading…</p>
      ) : !deliveries?.length ? (
        <p className="text-muted-foreground mt-6">Nothing assigned to you yet.</p>
      ) : (
        <div className="space-y-3 mt-6">
          {deliveries.map((delivery) => {
            const actions = NEXT_ACTIONS[delivery.status] ?? [];
            return (
              <Card key={delivery.orderId}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/orders/${delivery.orderId}`} className="font-head font-bold underline hover:no-underline">
                        Order #{delivery.orderId.slice(0, 8)}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{delivery.deliveryAddress}</p>
                    </div>
                    <DeliveryStatusBadge status={delivery.status} />
                  </div>

                  {actions.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {actions.map((action) => (
                        <Button
                          key={action.status}
                          size="sm"
                          variant={action.status === "FAILED" ? "outline" : "default"}
                          disabled={updateStatus.isPending}
                          onClick={() => handleUpdate(delivery.orderId, action.status)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}