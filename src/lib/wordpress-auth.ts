export interface WordPressUser {
  username: string;
  displayName: string;
}

export class WordPressAuthError extends Error {}

/**
 * Verifies WordPress credentials against the site's REST API using
 * Basic Auth (WordPress core "Application Passwords" feature, no plugin needed).
 */
export async function verifyWordPressLogin(
  siteUrl: string,
  username: string,
  applicationPassword: string
): Promise<WordPressUser> {
  const normalizedUrl = siteUrl.replace(/\/+$/, "");
  const endpoint = `${normalizedUrl}/wp-json/wp/v2/users/me`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString("base64")}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new WordPressAuthError(
      "WordPressサイトに接続できませんでした。サイトURLを確認してください。"
    );
  }

  if (res.status === 401 || res.status === 403) {
    throw new WordPressAuthError("ユーザー名またはアプリケーションパスワードが正しくありません。");
  }
  if (!res.ok) {
    throw new WordPressAuthError("WordPressへのログインに失敗しました。");
  }

  const data = await res.json();
  return {
    username: data.slug ?? username,
    displayName: data.name ?? username,
  };
}
