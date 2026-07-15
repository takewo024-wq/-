import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { employees, EmployeeId } from "@/lib/employees";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  employeeId: EmployeeId;
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  const employee = employees[body.employeeId];
  if (!employee) {
    return NextResponse.json({ error: "不明な社員IDです。" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "メッセージがありません。" }, { status: 400 });
  }

  // The Messages API requires the conversation to start on a "user" turn;
  // the client's thread starts with a display-only assistant greeting.
  const firstUserIndex = body.messages.findIndex((m) => m.role === "user");
  if (firstUserIndex === -1) {
    return NextResponse.json({ error: "メッセージがありません。" }, { status: 400 });
  }
  const apiMessages = body.messages.slice(firstUserIndex);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: employee.systemPrompt,
      messages: apiMessages.map((m) => ({ role: m.role, content: m.content })),
      ...(employee.webSearch
        ? { tools: [{ type: "web_search_20260209" as const, name: "web_search" as const }] }
        : {}),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI社員からの応答取得に失敗しました。" },
      { status: 502 }
    );
  }
}
