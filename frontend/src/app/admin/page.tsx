"use client";

import { useAdminDashboard } from "@/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return <p className="text-muted-foreground">Couldn&apos;t load the dashboard.</p>;

  const tiles = [
    { label: "Total users", value: data.userCount.toLocaleString() },
    { label: "Active listings", value: data.activeListingCount.toLocaleString() },
    { label: "Total orders", value: data.orderCount.toLocaleString() },
    { label: "Disputed orders", value: data.disputedOrders.toLocaleString() },
    { label: "Escrow currently held", value: formatNaira(data.escrowCurrentlyHeld) },
    { label: "Completed GMV", value: formatNaira(data.completedGmv) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardContent className="pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.label}</p>
            <p className="font-head font-extrabold text-2xl mt-1">{t.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}