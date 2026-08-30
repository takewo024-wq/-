# Obsidian 連携

note連載「古事記をよむ」を **Obsidianで書いて、noteに出す** ための置き場。

```
obsidian/
├─ 古事記をよむ/
│   ├─ 00 古事記をよむ MOC.md      … 連載マップ（まずここを見る）
│   └─ ヤマトタケル 熊曾建討伐.md   … 記事本体
└─ _templates/
    └─ 古事記記事テンプレート.md    … 新記事はこれを複製して書く
exports/                            … noteに貼るプレーンテキスト（自動生成）
scripts/md2note.py                  … 記事 → note用テキスト 変換
```

## 書く → 出す の流れ

1. Obsidianで `_templates/古事記記事テンプレート.md` を複製して執筆
2. frontmatter の `前回` / `次回` にウィキリンクを入れる
3. 変換して note に貼る

```bash
python3 scripts/md2note.py "obsidian/古事記をよむ/ヤマトタケル 熊曾建討伐.md"
# → exports/ヤマトタケル 熊曾建討伐.note.txt
```

frontmatter・ウィキリンク・callout・「🔗 リンク」「📝 執筆メモ」は
変換時に自動で落ちるので、Obsidian側では気にせず書いて構いません。

## 保管庫とつなぐ方法

Claudeはクラウド上で動いているため、PCのObsidian保管庫を直接は読めません。
**GitHub経由でつなぐ**と、Claudeが過去記事を自分で読めるようになります
（＝「前回のふりかえり」を毎回手で説明しなくてよくなる）。

### 推奨：保管庫をGitHubリポジトリにする

1. Obsidianで **Community plugins → Git** を導入
2. 保管庫（または `古事記をよむ` フォルダだけ）をGitHubのプライベートリポジトリに
3. Gitプラグインの `Vault backup interval` を10分などに設定して自動push
4. Claudeのセッションでそのリポジトリを追加すれば、過去記事を読んだうえで執筆できる

### 簡易：このリポジトリを保管庫の中にクローンする

保管庫のフォルダ内で:

```bash
git clone <このリポジトリのURL> 古事記連載
```

Obsidianを開き直すと `古事記連載/obsidian/` 以下がノートとして見えます。
更新は `git pull` / `git push`。

## Obsidian側の設定（任意）

| 設定 | 場所 | 効果 |
|---|---|---|
| テンプレートフォルダ = `obsidian/_templates` | 設定 → テンプレート | 新記事をワンクリックで作れる |
| Dataviewプラグイン | コミュニティプラグイン | MOCの連載一覧が自動生成される |
| プロパティ表示をON | 設定 → エディタ | frontmatterがカード表示になる |
