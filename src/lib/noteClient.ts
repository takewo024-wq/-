import { NoteAPIClient } from "note-api-client";

export interface NotePostResult {
  key: string;
  editUrl: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toNoteHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export async function postDraftToNote(title: string, body: string): Promise<NotePostResult> {
  const cookie = process.env.NOTE_SESSION_COOKIE;
  if (!cookie) {
    throw new Error(
      "NOTE_SESSION_COOKIE が設定されていません。note.com にブラウザでログインし、DevTools から Cookie ヘッダーの値を .env.local に設定してください。"
    );
  }

  const html = toNoteHtml(body);
  const client = new NoteAPIClient(cookie);

  const note = await client.createNote({ title, body: html });
  await client.saveDraft({
    id: String(note.id),
    title,
    body: html,
    isTempSaved: false,
    index: true,
  });

  return {
    key: note.key,
    editUrl: `https://editor.note.com/notes/${note.key}/edit/`,
  };
}
