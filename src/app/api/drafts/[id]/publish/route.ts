import { NextRequest, NextResponse } from "next/server";
import { getDraft, markDraftPosted } from "@/lib/drafts";
import { postDraftToNote } from "@/lib/noteClient";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: "下書きが見つかりません。" }, { status: 404 });
  }

  try {
    const result = await postDraftToNote(draft.title, draft.body);
    const updated = await markDraftPosted(id, {
      key: result.key,
      editUrl: result.editUrl,
      postedAt: new Date().toISOString(),
    });
    return NextResponse.json({ draft: updated });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "note への下書き送信に失敗しました。";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
