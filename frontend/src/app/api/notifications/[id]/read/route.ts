import { NextResponse } from "next/server";
import { authedExpressFetchWithStatus } from "@/lib/api/server";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetchWithStatus(`/notifications/${params.id}/read`, { method: "PATCH" });
  return NextResponse.json(result.body, { status: result.status });
}