#!/usr/bin/env python3
"""Obsidianノート → note.com 貼り付け用プレーンテキスト。

noteのエディタはMarkdownを変換しないため、記号を落として素の文章にする。
Obsidian固有の記法（frontmatter・ウィキリンク・callout）や、
公開しないセクション（🔗 リンク／📝 執筆メモ）もここで取り除く。

  python3 scripts/md2note.py "obsidian/古事記をよむ/ヤマトタケル 熊曾建討伐.md"
"""
import re
import sys
from pathlib import Path

# note に出さないセクション（この見出し以降を末尾まで捨てる）
DROP_FROM = ("## 🔗 リンク", "## 📝 執筆メモ")


def strip_frontmatter(text: str) -> str:
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            return text[end + 5 :]
    return text


def drop_private_sections(text: str) -> str:
    cut = len(text)
    for heading in DROP_FROM:
        i = text.find("\n" + heading)
        if i != -1:
            cut = min(cut, i)
    return text[:cut]


def strip_callouts(lines):
    """> [!info] で始まる callout をブロックごと落とす。"""
    out, in_callout = [], False
    for line in lines:
        if re.match(r"^>\s*\[!", line):
            in_callout = True
            continue
        if in_callout:
            if line.startswith(">"):
                continue
            in_callout = False
        out.append(line)
    return out


def to_plain(line: str) -> str:
    line = re.sub(r"^#{1,6}\s*", "", line)          # 見出し記号
    line = re.sub(r"^>\s*", "", line)               # 引用記号
    line = re.sub(r"^\s*[-*]\s+", "・", line)       # 箇条書き
    line = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", line)  # [[link|alias]]
    line = re.sub(r"\[\[([^\]]*)\]\]", r"\1", line)           # [[link]]
    line = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", line)      # [text](url)
    line = line.replace("**", "").replace("==", "")
    line = line.replace("📖 ", "").replace("🔮 ", "")
    return line


def convert(text: str) -> str:
    text = drop_private_sections(strip_frontmatter(text))
    lines = strip_callouts(text.split("\n"))
    out = ["" if l.strip() == "---" else to_plain(l) for l in lines]
    result = re.sub(r"\n{3,}", "\n\n", "\n".join(out))
    return result.strip() + "\n"


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    dest = Path("exports") / (src.stem + ".note.txt")
    dest.parent.mkdir(exist_ok=True)
    result = convert(src.read_text(encoding="utf-8"))
    dest.write_text(result, encoding="utf-8")
    chars = len(re.sub(r"\s", "", result))
    print(f"{dest}  ({chars:,}字)")


if __name__ == "__main__":
    main()
