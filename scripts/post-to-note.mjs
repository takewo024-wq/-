// note.com へ記事を作成・投稿するローカル実行スクリプト（Playwright ブラウザ自動操作）
//
// note.com には公式の投稿 API が無いため、ブラウザを実際に起動してログイン→記事作成→
// 公開までを自動化します。自分のアカウントに自分のコンテンツを投稿する用途を前提とします。
//
// 必要な環境変数:
//   NOTE_EMAIL       note.com のログインメールアドレス（必須）
//   NOTE_PASSWORD    note.com のログインパスワード（必須）
//   ANTHROPIC_API_KEY  --prompt で記事を AI 生成する場合のみ必要
//   PW_EXECUTABLE_PATH このマシンの Chromium 実行ファイルを明示指定したい場合（任意）
//
// 使い方の例:
//   node scripts/post-to-note.mjs --title "記事タイトル" --body-file article.md
//   node scripts/post-to-note.mjs --prompt "AI社員で業務効率化した話" --publish
//   node scripts/post-to-note.mjs --title "下書き" --body "本文" --draft --headful
//
// 既定では「下書き保存」です。実際に公開するには --publish を付けてください。

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

/* --------------------------------- 引数解析 --------------------------------- */

function parseArgs(argv) {
  const args = { publish: false, draft: false, headful: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--title": args.title = next(); break;
      case "--body": args.body = next(); break;
      case "--body-file": args.bodyFile = next(); break;
      case "--prompt": args.prompt = next(); break;
      case "--tags": args.tags = next(); break;
      case "--publish": args.publish = true; break;
      case "--draft": args.draft = true; break;
      case "--headful": args.headful = true; break;
      case "--dry-run": args.dryRun = true; break;
      case "-h": case "--help": args.help = true; break;
      default:
        console.warn(`⚠ 不明な引数を無視します: ${a}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`note.com 投稿スクリプト

必須環境変数: NOTE_EMAIL, NOTE_PASSWORD

オプション:
  --title <text>       記事タイトル
  --body <text>        本文（テキスト/Markdown）
  --body-file <path>   本文をファイルから読み込む
  --prompt <text>      本文が無い場合、この指示で AI に記事を生成させる（要 ANTHROPIC_API_KEY）
  --tags "a,b,c"       ハッシュタグ（カンマ区切り）
  --publish            実際に公開する（既定は下書き保存）
  --draft              明示的に下書き保存
  --headful            ブラウザ画面を表示して実行（デバッグ用）
  --dry-run            ログインや投稿を行わず、生成した記事内容だけ表示
  -h, --help           このヘルプ
`);
}

/* ------------------------------ AI による記事生成 ------------------------------ */

const WRITER_SYSTEM = `あなたはプロのnoteライターです。読者にとって価値のある、読みやすいnote記事を執筆します。
出力は必ず次のJSON形式のみで返してください（コードフェンスや前置きは付けない）:
{"title": "記事タイトル", "body": "本文（見出しや箇条書きを含むMarkdown可）"}`;

async function generateArticle(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("--prompt で生成するには ANTHROPIC_API_KEY が必要です。");
  }
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system: WRITER_SYSTEM,
    messages: [{ role: "user", content: `次のテーマでnote記事を書いてください:\n${prompt}` }],
  });
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  try {
    const json = JSON.parse(text);
    if (!json.title || !json.body) throw new Error("title/body が欠けています");
    return { title: json.title, body: json.body };
  } catch {
    throw new Error(`AIの出力をJSONとして解釈できませんでした:\n${text.slice(0, 500)}`);
  }
}

/* ------------------------------ Chromium 起動 ------------------------------- */

function resolveExecutablePath() {
  // 明示指定を最優先
  const explicit = process.env.PW_EXECUTABLE_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;
  // このリモート環境のプリインストール Chromium
  const remote = "/opt/pw-browsers/chromium";
  if (fs.existsSync(remote)) return remote;
  // それ以外は Playwright の管理下ブラウザに任せる
  return undefined;
}

async function launchBrowser(headful) {
  const executablePath = resolveExecutablePath();
  return chromium.launch({
    headless: !headful,
    ...(executablePath ? { executablePath } : {}),
  });
}

/* -------------------------------- ログイン --------------------------------- */

async function login(page, email, password) {
  console.log("→ note.com にログインしています...");
  await page.goto("https://note.com/login", { waitUntil: "domcontentloaded" });

  // メール/パスワード入力欄（note の UI 変更に備えて複数候補を試す）
  const emailInput = page.locator(
    'input[type="email"], input[name="email"], input[placeholder*="mail"]'
  ).first();
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]'
  ).first();

  await emailInput.waitFor({ state: "visible", timeout: 20000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);

  // ログインボタン
  const loginButton = page.getByRole("button", { name: /ログイン|login/i }).first();
  await loginButton.click();

  // ログイン完了（トップ or マイページ）まで待機
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  const url = page.url();
  if (url.includes("/login")) {
    throw new Error(
      "ログインに失敗した可能性があります（/login のまま）。メール/パスワード、もしくは2段階認証・CAPTCHA を確認してください。"
    );
  }
  console.log("✓ ログインしました。");
}

/* -------------------------------- 記事作成 --------------------------------- */

async function createArticle(page, { title, body, tags, publish }) {
  console.log("→ 記事エディタを開いています...");
  await page.goto("https://note.com/notes/new", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  // タイトル入力（note のタイトルは textarea/contenteditable のことが多い）
  const titleField = page.locator(
    'textarea[placeholder*="タイトル"], [contenteditable="true"][data-placeholder*="タイトル"], input[placeholder*="タイトル"]'
  ).first();
  await titleField.waitFor({ state: "visible", timeout: 20000 });
  await titleField.click();
  await titleField.fill(title).catch(async () => {
    // contenteditable で fill が使えない場合はタイプ入力
    await page.keyboard.type(title);
  });

  // 本文入力（contenteditable のエディタ本体）
  const bodyEditor = page.locator(
    '[contenteditable="true"][data-placeholder*="本文"], div[role="textbox"], .ProseMirror'
  ).first();
  await bodyEditor.click();
  // Markdown をそのまま流し込む（note は一部 Markdown 記法を自動変換）
  await page.keyboard.type(body);

  console.log("✓ タイトルと本文を入力しました。");

  if (!publish) {
    // 下書きは自動保存されるが、明示的に保存を促す
    await page.waitForTimeout(2500);
    console.log("✓ 下書きとして保存されました（自動保存）。");
    return;
  }

  // 公開フロー: 「公開に進む」→ 設定 →「投稿する / 公開する」
  console.log("→ 公開手続きに進みます...");
  const proceed = page.getByRole("button", { name: /公開に進む|公開設定|公開/ }).first();
  await proceed.waitFor({ state: "visible", timeout: 20000 });
  await proceed.click();
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  // ハッシュタグ（任意）
  if (tags) {
    const tagInput = page.locator(
      'input[placeholder*="ハッシュタグ"], input[placeholder*="タグ"]'
    ).first();
    if (await tagInput.count()) {
      for (const t of tags.split(",").map((s) => s.trim()).filter(Boolean)) {
        await tagInput.fill(t);
        await page.keyboard.press("Enter");
      }
    }
  }

  const submit = page.getByRole("button", { name: /^投稿する$|^公開する$|投稿|公開する/ }).last();
  await submit.waitFor({ state: "visible", timeout: 20000 });
  await submit.click();
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  console.log("✓ 記事を公開しました。");
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();

  // 本文の決定: --body > --body-file > --prompt(AI生成)
  let title = args.title;
  let body = args.body;

  if (!body && args.bodyFile) {
    const p = path.resolve(args.bodyFile);
    if (!fs.existsSync(p)) throw new Error(`本文ファイルが見つかりません: ${p}`);
    body = fs.readFileSync(p, "utf8");
  }

  if (!body && args.prompt) {
    console.log("→ AI で記事を生成しています...");
    const generated = await generateArticle(args.prompt);
    title = title || generated.title;
    body = generated.body;
    console.log(`✓ 生成完了: 「${title}」（本文 ${body.length} 文字）`);
  }

  if (!title || !body) {
    printHelp();
    throw new Error("タイトルと本文が必要です（--title と --body/--body-file/--prompt）。");
  }

  const publish = args.publish && !args.draft;

  if (args.dryRun) {
    console.log("\n===== DRY RUN（投稿しません） =====");
    console.log("TITLE:", title);
    console.log("PUBLISH:", publish);
    console.log("TAGS:", args.tags || "(なし)");
    console.log("----- BODY -----");
    console.log(body);
    console.log("================================\n");
    return;
  }

  const email = process.env.NOTE_EMAIL;
  const password = process.env.NOTE_PASSWORD;
  if (!email || !password) {
    throw new Error("環境変数 NOTE_EMAIL と NOTE_PASSWORD を設定してください。");
  }

  const browser = await launchBrowser(args.headful);
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page, email, password);
    await createArticle(page, { title, body, tags: args.tags, publish });
    console.log(
      publish
        ? "\n🎉 完了: note.com に記事を公開しました。"
        : "\n📝 完了: note.com に下書きを保存しました（公開するには --publish）。"
    );
  } catch (err) {
    // 失敗時はスクリーンショットを残してデバッグしやすくする
    const shot = path.resolve(`note-error-${Date.now()}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    console.error(`\n✗ 失敗しました: ${err.message}`);
    console.error(`  スクリーンショット: ${shot}`);
    console.error(
      "  note.com の UI は変わりやすいため、ログインでCAPTCHA/2段階認証が出る場合は --headful で手動確認してください。"
    );
    throw err;
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
