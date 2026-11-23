# 🏢 AI社員の会社

AI社員とチャットしながら会社を運営するアプリです。CEO秘書・エンジニア・ライター・リサーチャー・マーケティング担当の5人のAI社員に、用件ごとに相談できます。Next.js（App Router）と Anthropic Claude API で動作します。

## 主な機能

- **5人のAI社員**とのチャット（社員ごとに役割・口調・あいさつが異なる）
- 社員ごとに**会話スレッドを分けて**保持
- リサーチャー・マーケティング担当は**Web検索**で最新情報を調査
- **パスワードによるログイン**（共有シークレット）でアクセスを保護
- **レート制限**と**入力量の上限**でAPIコストの暴発を防止

### AI社員一覧

| 社員 | 役割 | Web検索 |
|---|---|---|
| 🗂️ 佐藤 静香 | CEO秘書（依頼整理・優先順位付け・振り分け） | — |
| 💻 高橋 陸 | エンジニア（設計・実装・レビュー・技術調査） | — |
| ✍️ 中村 美咲 | ライター（記事・資料・コピー・校正） | — |
| 🔍 山田 拓也 | リサーチャー（市場・競合・最新情報の調査） | あり |
| 📣 鈴木 彩 | マーケティング担当（有料note販促・価格戦略） | あり |

社員の定義は `src/lib/employees.ts` にまとまっています。追加・編集はこのファイルを変更してください。

## セットアップ

### 1. 依存関係のインストール

```bash
npm ci
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、値を設定します。

```bash
cp .env.example .env.local
```

| 変数 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic APIキー。[console.anthropic.com](https://console.anthropic.com/) で取得。 |
| `APP_ACCESS_PASSWORD` | ✅ | アプリのログインパスワード。これを知っている人だけが利用できます。長くランダムな文字列を推奨。 |
| `APP_SESSION_SECRET` | 任意 | セッションCookieの署名鍵。未設定時は `APP_ACCESS_PASSWORD` から導出。本番では `openssl rand -hex 32` で別途設定を推奨。 |
| `RATE_LIMIT_PER_MINUTE` | 任意 | 1分あたりの許容リクエスト数（既定: 20）。 |

> **重要**: `APP_ACCESS_PASSWORD` を設定しないとログインできません（誰も入れない fail-closed 設計）。公開前に必ず強力な値を設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと、まずログイン画面が表示されます。`APP_ACCESS_PASSWORD` を入力するとチャット画面に進みます。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド済みアプリを起動 |
| `npm run lint` | ESLint を実行 |

## セキュリティと運用上の注意

- **認証**: ログイン成功時に、HMAC署名付き・httpOnly・SameSite=Lax のセッションCookie（有効期限8時間）を発行します。パスワードはサーバー側で定数時間比較します。
- **レート制限**: IP単位のスライディングウィンドウ（既定20回/分）。チャットとログイン試行の両方に適用します。
  - ⚠️ 制限は**サーバーインスタンスのメモリ上**で動作するため、複数インスタンスに分散する本番環境（サーバーレス含む）では完全ではありません。本格運用では Upstash Redis などの外部ストアへの置き換えを推奨します。
- **入力量の上限**: メッセージ件数（最大50）・1件あたり文字数（最大8,000）・合計文字数（最大24,000）をサーバー側で強制し、トークン消費（コスト）の暴発を防ぎます。
- **会話履歴**: 現状はブラウザのメモリ上にのみ保持され、リロードで消えます（永続化は未実装）。

## 構成

```
src/
├─ app/
│  ├─ api/
│  │  ├─ chat/route.ts     # チャット本体（認証・レート制限・検証後に Claude 呼び出し）
│  │  ├─ login/route.ts    # ログイン（パスワード検証 → セッションCookie発行）
│  │  ├─ logout/route.ts   # ログアウト（Cookie失効）
│  │  └─ session/route.ts  # セッション有効性チェック（UIの初期表示判定用）
│  ├─ layout.tsx
│  ├─ page.tsx             # ログイン画面＋チャットUI
│  └─ globals.css
└─ lib/
   ├─ employees.ts         # AI社員の定義（名前・役割・systemPrompt など）
   ├─ auth.ts              # パスワード検証・セッショントークン
   ├─ ratelimit.ts         # インメモリのレート制限
   └─ validation.ts        # 入力検証・上限値
```

## 使用技術

- [Next.js 16](https://nextjs.org)（App Router / Route Handlers）
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)（モデル: `claude-opus-4-8`）

> このリポジトリの Next.js は一部APIや慣習が通常版と異なる場合があります。コードを変更する際は `node_modules/next/dist/docs/` の該当ドキュメントを参照してください（詳細は `AGENTS.md`）。
