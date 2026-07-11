// 個別支援計画データの共有ストレージ層。
// 複数PCから同じデータを読み書きできるよう、サーバー側に一元保存する。
//
// バックエンドは環境変数で自動選択する:
//  1. KV_REST_API_URL / KV_REST_API_TOKEN があれば Upstash 互換の KV(Redis) REST を使う
//     （Vercel に Upstash KV を追加すると自動でこの2つが設定される）→ 本番のデプロイ向け。
//  2. なければ JSON ファイルに保存する（自己ホスト・LAN・ローカル開発向け）。
//     保存先は PLAN_DATA_DIR（未指定なら <cwd>/data）。
//
// 注意: Vercel などのサーバーレス環境ではファイルシステムが揮発性のため、
//       ファイル保存はPC間共有として機能しない。その場合は KV を設定すること。

import { promises as fs } from "fs";
import path from "path";

const KEY = "isp_shared_db_v1";

export type PlanData = {
  isp_users: unknown[];
  isp_diaries: unknown[];
  isp_goals: unknown[];
  isp_reviews: unknown[];
  _flags: Record<string, unknown>;
  [k: string]: unknown;
};

export function emptyData(): PlanData {
  return {
    isp_users: [],
    isp_diaries: [],
    isp_goals: [],
    isp_reviews: [],
    _flags: {},
  };
}

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(kvUrl && kvToken);

export function backendLabel(): "kv" | "file-ephemeral" | "file" {
  if (useKv) return "kv";
  // Vercel 等ではファイルが揮発するため、共有が続かないことを示す
  return process.env.VERCEL ? "file-ephemeral" : "file";
}

// ---------- KV (Upstash / Vercel KV) ----------
async function kvGet(): Promise<PlanData | null> {
  const res = await fetch(`${kvUrl}/get/${encodeURIComponent(KEY)}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV get failed: ${res.status}`);
  const json = (await res.json()) as { result: string | null };
  if (!json.result) return null;
  return JSON.parse(json.result) as PlanData;
}

async function kvSet(data: PlanData): Promise<void> {
  const res = await fetch(`${kvUrl}/set/${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

// ---------- File ----------
function dataDir(): string {
  return process.env.PLAN_DATA_DIR || path.join(process.cwd(), "data");
}
function dataFile(): string {
  return path.join(dataDir(), "plan-db.json");
}

async function fileGet(): Promise<PlanData | null> {
  try {
    const raw = await fs.readFile(dataFile(), "utf8");
    return JSON.parse(raw) as PlanData;
  } catch {
    return null;
  }
}

async function fileSet(data: PlanData): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(dataFile(), JSON.stringify(data), "utf8");
}

// ---------- Public API ----------
export async function loadData(): Promise<PlanData> {
  const data = useKv ? await kvGet() : await fileGet();
  return data ?? emptyData();
}

export async function saveData(data: PlanData): Promise<void> {
  if (useKv) await kvSet(data);
  else await fileSet(data);
}
