import { NextResponse } from "next/server";
import { authedExpressFetchWithStatus } from "@/lib/api/server";

export async function PATCH() {
  const result = await authedExpressFetchWithStatus("/notifications/read-all", { method: "PATCH" });
  return NextResponse.json(result.body, { status: result.status });
}