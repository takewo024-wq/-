This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## note.com への記事作成・自動投稿

`scripts/post-to-note.mjs` は、note.com に記事を作成して投稿するローカル実行用スクリプトです。
note.com には公式の投稿 API が無いため、Playwright で実際にブラウザを起動してログイン→
記事作成→公開までを自動化します。**自分のアカウントに自分のコンテンツを投稿する用途**を前提とします。

### 準備

1. 依存をインストール（Playwright を含む）:

   ```bash
   npm install
   npx playwright install chromium   # 初回のみ。ブラウザ本体を取得
   ```

2. `.env.example` を参考に、note.com のログイン情報を環境変数で渡します:

   ```bash
   export NOTE_EMAIL="you@example.com"
   export NOTE_PASSWORD="your-note-password"
   # AI 生成を使う場合のみ
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

### 使い方

```bash
# 用意した本文ファイルを下書き保存
npm run post-note -- --title "記事タイトル" --body-file article.md

# その場で本文を渡してそのまま公開
npm run post-note -- --title "タイトル" --body "本文" --publish

# テーマだけ渡して AI に記事を書かせてから公開（要 ANTHROPIC_API_KEY）
npm run post-note -- --prompt "AI社員で業務効率化した話" --publish

# 投稿せず生成内容だけ確認
npm run post-note -- --prompt "テーマ" --dry-run
```

主なオプション: `--title` / `--body` / `--body-file` / `--prompt` / `--tags "a,b,c"` /
`--publish`（既定は下書き）/ `--draft` / `--headful`（画面表示）/ `--dry-run`。
`node scripts/post-to-note.mjs --help` でも一覧を表示できます。

### 注意

- 既定は**下書き保存**です。実際に公開するには `--publish` を付けてください。
- ログイン時に CAPTCHA や 2 段階認証が要求される場合は、`--headful` を付けて手動で通過してください。
- note.com の UI 変更でセレクタが合わなくなることがあります。失敗時はカレントディレクトリに
  `note-error-*.png` のスクリーンショットが保存されるので、それを見て調整してください。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
