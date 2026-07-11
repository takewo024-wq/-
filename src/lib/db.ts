// 全員でデータを共有するためのサーバー側ストア。
// ブラウザの localStorage の代わりに、サーバー上の SQLite に保存する。
// Node.js 組み込みの node:sqlite を使うため、追加のネイティブモジュールは不要。
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export const COLLECTIONS = ["users", "diaries", "goals", "reviews"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export interface Record {
  id: string;
  [key: string]: unknown;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

// dev の HMR で複数回初期化されないよう global にキャッシュする
const globalForDb = globalThis as unknown as { _ispDb?: DatabaseSync };

function getDb(): DatabaseSync {
  if (globalForDb._ispDb) return globalForDb._ispDb;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      collection TEXT NOT NULL,
      id         TEXT NOT NULL,
      data       TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (collection, id)
    );
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  seedIfEmpty(db);
  globalForDb._ispDb = db;
  return db;
}

// 初回のみ、手書き記録から取り込んだ初期データ(seed.json)を投入する。
function seedIfEmpty(db: DatabaseSync): void {
  const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get() as
    | { value: string }
    | undefined;
  if (seeded) return;

  let seed: Partial<Record & Record> & { [k in Collection]?: Record[] } = {};
  try {
    seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  } catch {
    seed = {};
  }

  const insert = db.prepare(
    "INSERT OR REPLACE INTO records (collection, id, data, updated_at) VALUES (?, ?, ?, ?)"
  );
  const now = Date.now();
  db.exec("BEGIN");
  try {
    for (const col of COLLECTIONS) {
      const rows = (seed[col] as Record[] | undefined) ?? [];
      for (const row of rows) {
        if (!row || row.id == null) continue;
        insert.run(col, String(row.id), JSON.stringify(row), now);
      }
    }
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded', ?)").run(
      String(now)
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function getAll(): { [k in Collection]: Record[] } {
  const db = getDb();
  const stmt = db.prepare("SELECT data FROM records WHERE collection = ? ORDER BY rowid");
  const result = {} as { [k in Collection]: Record[] };
  for (const col of COLLECTIONS) {
    const rows = stmt.all(col) as { data: string }[];
    result[col] = rows.map((r) => JSON.parse(r.data) as Record);
  }
  return result;
}

export function applyChanges(
  collection: Collection,
  upserts: Record[],
  deletes: string[]
): void {
  const db = getDb();
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO records (collection, id, data, updated_at) VALUES (?, ?, ?, ?)"
  );
  const del = db.prepare("DELETE FROM records WHERE collection = ? AND id = ?");
  const now = Date.now();
  db.exec("BEGIN");
  try {
    for (const row of upserts) {
      if (!row || row.id == null) continue;
      upsert.run(collection, String(row.id), JSON.stringify(row), now);
    }
    for (const id of deletes) {
      if (id == null) continue;
      del.run(collection, String(id));
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function isCollection(x: unknown): x is Collection {
  return typeof x === "string" && (COLLECTIONS as readonly string[]).includes(x);
}
