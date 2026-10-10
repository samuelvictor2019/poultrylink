"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminDisputes, useResolveDispute } from "@/hooks/use-admin";
import { ApiClientError } from "@/lib/api/client";
import { formatNaira, formatDate } from "@/lib/format";

export default function AdminDisputesPage() {
  const { data, isLoading } = useAdminDisputes();
  const resolve = useResolveDispute();
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function run(orderId: string, resolution: "RELEASE_TO_SELLER" | "REFUND_BUYER") {
    setError(null);
    setActingOn(orderId);
    try {
      await resolve.mutateAsync({ orderId, resolution });
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Something went wrong.");
    } finally {
      setActingOn(null);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!data?.length ? (
        <p className="text-muted-foreground">No open disputes.</p>
      ) : (
        data.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-head font-bold">
                    {order.items[0]?.listing?.productName ?? "Order"}
                    {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.buyer?.email ?? "Unknown buyer"} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-head font-bold">{formatNaira(order.totalAmount)}</p>
                  <Badge variant="destructive">Disputed</Badge>
                </div>
              </div>

              {order.escrow?.disputeReason && (
                <p className="text-sm bg-secondary rounded-lg p-3">&quot;{order.escrow.disputeReason}&quot;</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={resolve.isPending && actingOn === order.id}
                  onClick={() => run(order.id, "RELEASE_TO_SELLER")}
                >
                  Release to seller
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resolve.isPending && actingOn === order.id}
                  onClick={() => run(order.id, "REFUND_BUYER")}
                >
                  Refund buyer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}