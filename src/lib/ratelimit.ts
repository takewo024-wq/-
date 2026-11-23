import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * レート制限（スライディングウィンドウ）。
 *
 * - 本番/複数インスタンス: Upstash Redis（REST）を共有ストアとして使用。
 *   環境変数 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が必要。
 * - 未設定時（ローカル開発など）: プロセス内メモリにフォールバック。
 *   この場合は単一インスタンス内でのみ有効（複数インスタンスでは厳密でない）。
 *
 * 呼び出し側の契約は `await rateLimit(key)` で統一。
 */

const WINDOW_MS = 60_000; // 1 分
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_PER_MINUTE) || 20;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

// ---- Upstash Redis（設定されていれば使用）----

function createUpstashLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const redis = new Redis({ url, token });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_MS} ms`),
      prefix: "ai-company:rl",
      analytics: false,
    });
  } catch {
    return null;
  }
}

// モジュールスコープで 1 度だけ生成（接続・インスタンスの使い回し）
const upstash = createUpstashLimiter();

export const usingRedis = upstash !== null;

// ---- インメモリ（フォールバック）----

const hits = new Map<string, number[]>();

function memoryRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    hits.set(key, timestamps);
    return { ok: false, remaining: 0, retryAfterSec };
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // メモリ肥大化を抑える簡易クリーンアップ
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      const alive = v.filter((t) => t > windowStart);
      if (alive.length === 0) hits.delete(k);
      else hits.set(k, alive);
    }
  }

  return { ok: true, remaining: MAX_REQUESTS - timestamps.length, retryAfterSec: 0 };
}

// ---- 公開 API ----

export async function rateLimit(key: string): Promise<RateLimitResult> {
  if (upstash) {
    try {
      const { success, remaining, reset } = await upstash.limit(key);
      const retryAfterSec = success
        ? 0
        : Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: success, remaining, retryAfterSec };
    } catch {
      // Redis 障害時はメモリにフォールバックし、可用性を優先する
      return memoryRateLimit(key);
    }
  }
  return memoryRateLimit(key);
}

/** リクエストヘッダからクライアント IP を推定する（プロキシ前提）。 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
