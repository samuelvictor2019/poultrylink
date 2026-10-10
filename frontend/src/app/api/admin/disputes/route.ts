import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { AdminDisputeOrder } from "@/types";

export async function GET() {
  const result = await authedExpressFetch<AdminDisputeOrder[]>("/admin/disputes");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}