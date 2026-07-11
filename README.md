This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 個別支援計画管理アプリ（PC間でデータ共有）

`/plan.html` で個別支援計画の管理アプリを開けます（利用者・支援目標・支援日誌・有効支援ピックアップ・振り返り・次期計画）。

以前はデータを各PCのブラウザ内（`localStorage`）にのみ保存していたため他PCと共有できませんでしたが、
データを**共有サーバー（`/api/plan`）に一元保存**するようになり、同じURLを開いたどのPCからでも
同じデータを閲覧・編集できます（数秒ごとに自動同期）。

- アプリ画面: `/plan.html`
- データAPI: `GET/PUT /api/plan`
- 保存層: `src/lib/planStore.ts`

### データの保存先（バックエンド）

環境変数で自動的に切り替わります。

| 条件 | 保存先 | 用途 |
| --- | --- | --- |
| `KV_REST_API_URL` と `KV_REST_API_TOKEN` を設定 | KV(Upstash/Vercel KV) | 本番デプロイ（推奨） |
| 未設定 | JSONファイル `PLAN_DATA_DIR`（既定 `./data/plan-db.json`） | 自己ホスト・LAN・ローカル開発 |

> ⚠ **Vercel などサーバーレス環境ではファイルシステムが揮発性**のため、ファイル保存はPC間共有として
> 機能しません（時間経過で消えます）。その場合は下記の手順でKVを追加してください。KV未設定のまま
> Vercel で動かすと、アプリ画面に警告が表示されます。

### インターネット経由で共有する（Vercel + KV の例）

1. このリポジトリを Vercel にデプロイする。
2. Vercel の Storage（Marketplace）から **Upstash for Redis (KV)** を作成し、プロジェクトに接続する。
   → `KV_REST_API_URL` / `KV_REST_API_TOKEN` が自動で環境変数に設定されます。
3. （強く推奨）環境変数 **`PLAN_ACCESS_TOKEN`** に任意のパスワードを設定する。
   本アプリは氏名・生年月日・医療的ケアなどの個人情報を扱うため、公開URLは必ず保護してください。
4. 再デプロイ後、`https://<あなたのドメイン>/plan.html` を各PCで開く。
   パスワードを設定した場合は初回に入力を求められます（ブラウザに記憶されます）。

自己ホスト（Render / Railway / VPS など、永続ディスクがある環境）の場合は、KVなしでも
ファイル保存（`PLAN_DATA_DIR` に永続ディレクトリを指定）でPC間共有できます。

### アクセス保護

- `PLAN_ACCESS_TOKEN` を設定すると、`/api/plan` はヘッダ `x-plan-token`（または離脱時保存用に `?token=`）が
  一致しない限り 401 を返します。未設定の場合は誰でもアクセスできるため、LAN内・検証用途に限定してください。

### 従来データ（各PCのブラウザに保存済み）の移行

旧ファイル版のデータは各PCのブラウザ内にあります。旧版のサイドバー「📤 エクスポート」でJSONを保存し、
新しい共有URLの「📥 インポート」で読み込むと、共有サーバー側へ取り込めます（ID重複は自動でスキップ）。

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
