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
scripts/setup-vault.sh              … 保管庫へ取り込む
```

## 書く → 出す の流れ

1. Obsidianで `_templates/古事記記事テンプレート.md` を複製して執筆
2. frontmatter の `前回` / `次回` にウィキリンクを入れる
3. 変換して note に貼る

```bash
# このリポジトリ内のノートから
python3 scripts/md2note.py "obsidian/古事記をよむ/ヤマトタケル 熊曾建討伐.md"
# → exports/ヤマトタケル 熊曾建討伐.note.txt

# 保管庫の中のノートから、デスクトップに出す
python3 scripts/md2note.py ~/Documents/MyVault/古事記をよむ/記事.md -o ~/Desktop
```

frontmatter・ウィキリンク・callout・「🔗 リンク」「📝 執筆メモ」は
変換時に自動で落ちるので、Obsidian側では気にせず書いて構いません。

## 保管庫に取り込む

保管庫のパスを渡すだけ。既存ノートは上書きしません（`--force`で上書き）。

```bash
bash scripts/setup-vault.sh ~/Documents/MyVault
```

保管庫に `古事記をよむ/` と `_templates/` が入ります。

## 過去記事をClaudeに読ませたい場合

Claudeはクラウド上で動いているため、PCの保管庫を直接は読めません。
**保管庫をGitHubのプライベートリポジトリにしておく**と、Claudeが過去記事を
自分で読めるようになります（＝「前回のふりかえり」を毎回説明しなくてよくなる）。

1. Obsidianで **コミュニティプラグイン → Git** を導入
2. 保管庫（または `古事記をよむ` フォルダだけ）をプライベートリポジトリにする
3. `Vault backup interval` を10分などにして自動push
4. Claudeのセッションでそのリポジトリを追加する

保管庫をGitHubに置きたくない場合は、書き上がったノートをその都度
Claudeに渡す運用でも問題ありません。

## Obsidian側の設定（任意）

| 設定 | 場所 | 効果 |
|---|---|---|
| テンプレートフォルダ = `_templates` | 設定 → テンプレート | 新記事をワンクリックで作れる |
| Dataviewプラグイン | コミュニティプラグイン | MOCの連載一覧が自動生成される |
| プロパティ表示をON | 設定 → エディタ | frontmatterがカード表示になる |
