#!/usr/bin/env bash
# 連載ノートをObsidian保管庫に取り込む。
#
#   bash scripts/setup-vault.sh ~/Documents/MyVault
#   bash scripts/setup-vault.sh ~/Documents/MyVault --force   # 既存ファイルも上書き
#
# 既存のノートは既定では上書きしない。--force を付けたときだけ上書きする。

set -euo pipefail

VAULT="${1:-}"
FORCE="${2:-}"

if [ -z "$VAULT" ]; then
  echo "使い方: bash scripts/setup-vault.sh <保管庫のパス> [--force]" >&2
  exit 1
fi

VAULT="${VAULT/#\~/$HOME}"

if [ ! -d "$VAULT" ]; then
  echo "保管庫が見つかりません: $VAULT" >&2
  exit 1
fi

if [ ! -d "$VAULT/.obsidian" ]; then
  echo "警告: $VAULT に .obsidian がありません。保管庫のルートを指定していますか？" >&2
  read -r -p "このまま続けますか [y/N] " ans
  [ "$ans" = "y" ] || exit 1
fi

SRC="$(cd "$(dirname "$0")/.." && pwd)/obsidian"
copied=0
skipped=0

copy() {  # copy <src> <dest>
  local src="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -e "$dest" ] && [ "$FORCE" != "--force" ]; then
    echo "  skip  $(basename "$dest")  （既にあります）"
    skipped=$((skipped + 1))
  else
    cp "$src" "$dest"
    echo "  copy  $(basename "$dest")"
    copied=$((copied + 1))
  fi
}

echo "保管庫: $VAULT"
echo

echo "古事記をよむ/"
while IFS= read -r -d '' f; do
  copy "$f" "$VAULT/古事記をよむ/$(basename "$f")"
done < <(find "$SRC/古事記をよむ" -maxdepth 1 -name '*.md' -print0)

echo "_templates/"
while IFS= read -r -d '' f; do
  copy "$f" "$VAULT/_templates/$(basename "$f")"
done < <(find "$SRC/_templates" -maxdepth 1 -name '*.md' -print0)

echo
echo "完了： ${copied}件コピー / ${skipped}件スキップ"
echo
echo "次にObsidian側で:"
echo "  1. 設定 → コアプラグイン → テンプレート を有効化"
echo "  2. テンプレートフォルダの場所 に  _templates  を指定"
echo "  3. 「00 古事記をよむ MOC」を開いて、公開済みの表を埋める"
