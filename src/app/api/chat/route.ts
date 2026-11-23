import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { employees, DEFAULT_MODEL } from "@/lib/employees";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { validateChatBody } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1) 認証: 有効なセッション Cookie が無ければ拒否
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  // 2) レート制限: IP 単位で過剰なリクエストを抑止
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`chat:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。少し待ってからお試しください。" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  // 3) サーバー側の設定確認
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  // 4) 入力検証: 件数・文字数の上限を強制（コスト暴発の防止）
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエスト形式が不正です。" }, { status: 400 });
  }

  const validated = validateChatBody(rawBody);
  if ("error" in validated) {
    return NextResponse.json(
      { error: validated.error.error },
      { status: validated.error.status }
    );
  }

  const { employeeId, messages } = validated.data;
  const employee = employees[employeeId];
  if (!employee) {
    return NextResponse.json({ error: "不明な社員IDです。" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  // 5) ストリーミング応答: text_delta を順次クライアントへ流す
  const anthropicStream = client.messages.stream({
    model: employee.model ?? DEFAULT_MODEL,
    max_tokens: 2048,
    system: employee.systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    ...(employee.webSearch
      ? { tools: [{ type: "web_search_20260209" as const, name: "web_search" as const }] }
      : {}),
  });

  const iterator = anthropicStream[Symbol.asyncIterator]();

  // 最初のイベントを先読みして、即時失敗（無効なキー・モデル等）を
  // ストリーム開始前に捕捉し、クリーンな JSON エラーで返す。
  let firstResult: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    firstResult = await iterator.next();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI社員からの応答取得に失敗しました。" },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueText = (event: Anthropic.MessageStreamEvent) => {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      };

      try {
        let result = firstResult;
        while (!result.done) {
          enqueueText(result.value);
          result = await iterator.next();
        }
        controller.close();
      } catch (err) {
        console.error(err);
        // 送信途中での失敗。受信済みの部分テキストはクライアント側に残る。
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
