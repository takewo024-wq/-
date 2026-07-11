import { NextRequest, NextResponse } from "next/server";
import { getAll, applyChanges, isCollection, type Record } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 全データを取得（利用者・支援日誌・支援目標・振り返り）
export async function GET() {
  try {
    return NextResponse.json(getAll());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "データの取得に失敗しました。" }, { status: 500 });
  }
}

// 変更（追加・更新・削除）を反映。差分のみを受け取る。
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  const { collection, upserts, deletes } = (body ?? {}) as {
    collection?: unknown;
    upserts?: unknown;
    deletes?: unknown;
  };

  if (!isCollection(collection)) {
    return NextResponse.json({ error: "不明なコレクションです。" }, { status: 400 });
  }

  const ups = Array.isArray(upserts) ? (upserts as Record[]) : [];
  const dels = Array.isArray(deletes) ? deletes.map((d) => String(d)) : [];

  // 各 upsert に id があることを確認
  for (const row of ups) {
    if (!row || typeof row !== "object" || (row as Record).id == null) {
      return NextResponse.json(
        { error: "レコードに id がありません。" },
        { status: 400 }
      );
    }
  }

  try {
    applyChanges(collection, ups, dels);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
  }
}
