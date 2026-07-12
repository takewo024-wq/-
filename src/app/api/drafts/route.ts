import { NextRequest, NextResponse } from "next/server";
import { createDraft, listDrafts } from "@/lib/drafts";

export const runtime = "nodejs";

export async function GET() {
  const drafts = await listDrafts();
  return NextResponse.json({ drafts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.body === "string" ? body.body : "";

  if (!title) {
    return NextResponse.json({ error: "タイトルを入力してください。" }, { status: 400 });
  }

  const draft = await createDraft(title, content);
  return NextResponse.json({ draft }, { status: 201 });
}
