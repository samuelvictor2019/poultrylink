import { NextResponse } from "next/server";
import { authedExpressFetchWithStatus } from "@/lib/api/server";

export async function GET() {
  const result = await authedExpressFetchWithStatus<{ count: number }>("/notifications/unread-count");
  return NextResponse.json(result.body, { status: result.status });
}