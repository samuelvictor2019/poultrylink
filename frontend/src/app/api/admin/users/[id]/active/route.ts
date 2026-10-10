import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { AdminUser } from "@/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await authedExpressFetch<{ user: AdminUser }>(`/users/${params.id}/active`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.user });
}