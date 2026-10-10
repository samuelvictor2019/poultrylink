import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

export async function GET() {
  const result = await authedExpressFetch("/deliveries/mine");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}