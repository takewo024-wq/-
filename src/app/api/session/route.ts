import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

/** 現在のセッションが有効かどうかを返す（UI の初期表示判定に使う）。 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return NextResponse.json({ authed: verifySessionToken(token) });
}
