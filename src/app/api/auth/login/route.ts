import { NextRequest, NextResponse } from "next/server";
import { verifyWordPressLogin, WordPressAuthError } from "@/lib/wordpress-auth";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { siteUrl, username, applicationPassword } = await req.json();

  if (!siteUrl || !username || !applicationPassword) {
    return NextResponse.json(
      { error: "サイトURL、ユーザー名、アプリケーションパスワードを入力してください。" },
      { status: 400 }
    );
  }

  try {
    const user = await verifyWordPressLogin(siteUrl, username, applicationPassword);
    await createSession({
      username: user.username,
      displayName: user.displayName,
      wordpressUrl: siteUrl.replace(/\/+$/, ""),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WordPressAuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    return NextResponse.json({ error: "エラーが発生しました。" }, { status: 500 });
  }
}
