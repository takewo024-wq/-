import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ログイン試行にもレート制限をかけ、総当たりを抑止する
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`login:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください。" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  if (!process.env.APP_ACCESS_PASSWORD) {
    return NextResponse.json(
      { error: "サーバーに APP_ACCESS_PASSWORD が設定されていません。" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    return NextResponse.json({ error: "リクエスト形式が不正です。" }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "パスワードが違います。" }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "セッションを発行できませんでした。" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
