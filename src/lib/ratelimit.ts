/**
 * ごく軽量なインメモリのレート制限（スライディングウィンドウ）。
 *
 * 注意: サーバーインスタンスごとのメモリ上で動くため、複数インスタンスに
 * 分散する本番環境（サーバーレス含む）では完全な制限にはならない。
 * 本格運用では Upstash Redis などの外部ストアに置き換えること。
 * それでも「無認証で使い放題」を防ぐ一次防御としては十分機能する。
 */

const WINDOW_MS = 60_000; // 1 分
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_PER_MINUTE) || 20;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string): RateLimitResult {
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

  // メモリ肥大化を抑えるための簡易クリーンアップ
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      const alive = v.filter((t) => t > windowStart);
      if (alive.length === 0) hits.delete(k);
      else hits.set(k, alive);
    }
  }

  return { ok: true, remaining: MAX_REQUESTS - timestamps.length, retryAfterSec: 0 };
}

/** リクエストヘッダからクライアント IP を推定する（プロキシ前提）。 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
