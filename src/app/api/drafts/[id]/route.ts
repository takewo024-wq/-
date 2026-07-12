import { NextRequest, NextResponse } from "next/server";
import { deleteDraft, updateDraft } from "@/lib/drafts";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const updates: { title?: string; body?: string } = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.body === "string") updates.body = body.body;

  const draft = await updateDraft(id, updates);
  if (!draft) {
    return NextResponse.json({ error: "下書きが見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ draft });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteDraft(id);
  if (!ok) {
    return NextResponse.json({ error: "下書きが見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
