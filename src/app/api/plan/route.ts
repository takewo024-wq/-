// 個別支援計画データの共有API。
// GET  /api/plan  … 保存済みデータ全体を返す
// PUT  /api/plan  … データ全体を丸ごと保存する（最終書き込み優先）
//
// PLAN_ACCESS_TOKEN が設定されている場合、リクエストヘッダ x-plan-token に
// 同じ値が必要。個人情報・医療情報を扱うため、インターネット公開時は必ず設定すること。

import { NextRequest, NextResponse } from "next/server";
import {
  loadData,
  saveData,
  emptyData,
  backendLabel,
  type PlanData,
} from "@/lib/planStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const token = process.env.PLAN_ACCESS_TOKEN;
  if (!token) return true; // 未設定なら誰でもアクセス可（LAN/検証用）
  // 通常はヘッダで渡す。ページ離脱時の sendBeacon はヘッダを付けられないため
  // クエリ ?token= でのフォールバックも許可する。
  if (req.headers.get("x-plan-token") === token) return true;
  return req.nextUrl.searchParams.get("token") === token;
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return unauthorized();
  try {
    const data = await loadData();
    return NextResponse.json(data, {
      headers: { "X-Plan-Backend": backendLabel() },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "load_failed", message: String(e) },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!authorized(req)) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_shape" }, { status: 400 });
  }
  // 想定キーだけを取り込み、未知のトップレベルキーは無視する
  const src = body as Record<string, unknown>;
  const base = emptyData();
  const data: PlanData = {
    ...base,
    isp_users: Array.isArray(src.isp_users) ? src.isp_users : base.isp_users,
    isp_diaries: Array.isArray(src.isp_diaries) ? src.isp_diaries : base.isp_diaries,
    isp_goals: Array.isArray(src.isp_goals) ? src.isp_goals : base.isp_goals,
    isp_reviews: Array.isArray(src.isp_reviews) ? src.isp_reviews : base.isp_reviews,
    _flags:
      typeof src._flags === "object" && src._flags !== null && !Array.isArray(src._flags)
        ? (src._flags as Record<string, unknown>)
        : base._flags,
  };
  try {
    await saveData(data);
    return NextResponse.json(
      { ok: true },
      { headers: { "X-Plan-Backend": backendLabel() } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "save_failed", message: String(e) },
      { status: 500 },
    );
  }
}
