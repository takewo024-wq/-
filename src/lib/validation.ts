import { EmployeeId } from "@/lib/employees";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ValidatedChatRequest {
  employeeId: EmployeeId;
  messages: ChatMessage[];
}

// 入力量の上限（トークン消費＝コスト暴発を防ぐ）
export const LIMITS = {
  maxMessages: 50, // 1 スレッドあたりの最大メッセージ数
  maxCharsPerMessage: 8_000, // 1 メッセージあたりの最大文字数
  maxTotalChars: 24_000, // 送信全体の最大文字数
};

export type ValidationError = { error: string; status: number };

export function validateChatBody(
  body: unknown
): { data: ValidatedChatRequest } | { error: ValidationError } {
  if (typeof body !== "object" || body === null) {
    return { error: { error: "リクエスト形式が不正です。", status: 400 } };
  }

  const { employeeId, messages } = body as Record<string, unknown>;

  if (typeof employeeId !== "string") {
    return { error: { error: "社員IDが不正です。", status: 400 } };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: { error: "メッセージがありません。", status: 400 } };
  }

  if (messages.length > LIMITS.maxMessages) {
    return {
      error: {
        error: `会話が長すぎます（最大 ${LIMITS.maxMessages} 件）。新しいスレッドを開始してください。`,
        status: 413,
      },
    };
  }

  let totalChars = 0;
  const clean: ChatMessage[] = [];

  for (const m of messages) {
    if (typeof m !== "object" || m === null) {
      return { error: { error: "メッセージ形式が不正です。", status: 400 } };
    }
    const { role, content } = m as Record<string, unknown>;

    if (role !== "user" && role !== "assistant") {
      return { error: { error: "メッセージの role が不正です。", status: 400 } };
    }
    if (typeof content !== "string" || content.length === 0) {
      return { error: { error: "メッセージ本文が不正です。", status: 400 } };
    }
    if (content.length > LIMITS.maxCharsPerMessage) {
      return {
        error: {
          error: `1 メッセージが長すぎます（最大 ${LIMITS.maxCharsPerMessage} 文字）。`,
          status: 413,
        },
      };
    }

    totalChars += content.length;
    clean.push({ role, content });
  }

  if (totalChars > LIMITS.maxTotalChars) {
    return {
      error: {
        error: `送信内容が多すぎます（合計最大 ${LIMITS.maxTotalChars} 文字）。`,
        status: 413,
      },
    };
  }

  return { data: { employeeId: employeeId as EmployeeId, messages: clean } };
}
