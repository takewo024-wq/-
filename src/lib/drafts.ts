import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface Draft {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  note: {
    key: string;
    editUrl: string;
    postedAt: string;
  } | null;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "drafts.json");

async function readAll(): Promise<Draft[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Draft[];
  } catch {
    return [];
  }
}

async function writeAll(drafts: Draft[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(drafts, null, 2), "utf-8");
}

export async function listDrafts(): Promise<Draft[]> {
  const drafts = await readAll();
  return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  const drafts = await readAll();
  return drafts.find((d) => d.id === id);
}

export async function createDraft(title: string, body: string): Promise<Draft> {
  const now = new Date().toISOString();
  const draft: Draft = {
    id: randomUUID(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
    note: null,
  };
  const drafts = await readAll();
  drafts.push(draft);
  await writeAll(drafts);
  return draft;
}

export async function updateDraft(
  id: string,
  updates: { title?: string; body?: string }
): Promise<Draft | undefined> {
  const drafts = await readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return undefined;
  if (updates.title !== undefined) draft.title = updates.title;
  if (updates.body !== undefined) draft.body = updates.body;
  draft.updatedAt = new Date().toISOString();
  await writeAll(drafts);
  return draft;
}

export async function deleteDraft(id: string): Promise<boolean> {
  const drafts = await readAll();
  const next = drafts.filter((d) => d.id !== id);
  if (next.length === drafts.length) return false;
  await writeAll(next);
  return true;
}

export async function markDraftPosted(
  id: string,
  note: Draft["note"]
): Promise<Draft | undefined> {
  const drafts = await readAll();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return undefined;
  draft.note = note;
  draft.updatedAt = new Date().toISOString();
  await writeAll(drafts);
  return draft;
}
