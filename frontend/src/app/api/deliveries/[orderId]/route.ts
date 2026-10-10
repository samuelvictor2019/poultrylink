import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Delivery } from "@/types";

// TRANSPORTER (if assigned) or ADMIN only — Express enforces this regardless
// of who calls it. Driven by the /delivering/deliveries dashboard.
export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  const body = await req.json();
  const result = await authedExpressFetch<{ delivery: Delivery }>(`/deliveries/${params.orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.delivery });
}