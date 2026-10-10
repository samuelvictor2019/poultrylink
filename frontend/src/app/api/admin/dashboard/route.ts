import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { AdminDashboardSummary } from "@/types";

export async function GET() {
  const result = await authedExpressFetch<AdminDashboardSummary>("/admin/dashboard");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}