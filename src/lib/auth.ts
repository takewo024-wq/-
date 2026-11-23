import { createHmac, createHash, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "ai_company_session";

// セッションの有効期間（ミリ秒）。既定は 8 時間。
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/**
 * セッション署名に使う秘密鍵を取得する。
 * APP_SESSION_SECRET が未設定なら APP_ACCESS_PASSWORD から導出する
 * （設定項目を増やさないためのフォールバック）。
 */
function getSecret(): string | null {
  const secret = process.env.APP_SESSION_SECRET || process.env.APP_ACCESS_PASSWORD;
  return secret && secret.length > 0 ? secret : null;
}

/** タイミング攻撃を避けた文字列比較（長さの差も漏らさないようハッシュ後に比較）。 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** 入力パスワードが設定値と一致するか検証する。未設定ならログイン不可（fail-closed）。 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.APP_ACCESS_PASSWORD;
  if (!expected || expected.length === 0) return false;
  if (typeof input !== "string" || input.length === 0) return false;
  return safeEqual(input, expected);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** 新しいセッショントークン（`exp.署名`）を発行する。 */
export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(exp, secret)}`;
}

/** セッショントークンが正しく署名され、かつ失効していないか検証する。 */
export function verifySessionToken(token: string | undefined | null): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // 署名の検証（改ざん検知）
  if (!safeEqual(sig, sign(exp, secret))) return false;

  // 有効期限の検証
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || Date.now() > expMs) return false;

  return true;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};
