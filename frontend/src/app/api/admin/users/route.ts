import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

// Forwards to Express's GET /users (admin-only, role/verificationStatus/page
// query params pass straight through).
export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const result = await authedExpressFetch(`/users${search}`);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}