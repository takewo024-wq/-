#!/usr/bin/env python3
"""Obsidianのノート（Markdown）を WordPress に投稿・更新する。

WordPress の REST API（wp-json/wp/v2/posts）を、アプリケーションパスワードで
Basic認証して叩く。自己ホストの WordPress.org サイト向け。

セットアップ:
  pip3 install -r requirements.txt
  cp .env.example .env   # WP_URL / WP_USER / WP_APP_PASSWORD を書く

使い方:
  # 下書きとして新規投稿（既定）
  python3 scripts/wp_publish.py "obsidian/古事記をよむ/ヤマトタケル 熊曾建討伐.md"

  # 公開する
  python3 scripts/wp_publish.py "obsidian/古事記をよむ/記事.md" --publish

  # 既存の投稿を更新する（1回投稿すると post_id が記事のfrontmatterに書き戻る）
  python3 scripts/wp_publish.py "obsidian/古事記をよむ/記事.md"

frontmatterで拾うキー（なくても動く）:
  title        : 投稿タイトル。なければ本文の最初の # 見出しを使う
  wp_status    : draft / publish （--publish / --draft で上書きされる）
  wp_category  : カテゴリー名（1つ）。なければ WP_DEFAULT_CATEGORY か「未分類」
  wp_tags      : WordPress投稿用タグのリスト。あればこちらを優先
  tags         : Obsidian整理用タグ。wp_tags が無いときのみ使う
                 （"note記事"のようなメタタグは自動で除外する）
  wp_post_id   : 投稿後にこのスクリプトが書き戻す。次回はこのIDを更新する
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

try:
    import markdown as md_lib
    import requests
    from dotenv import load_dotenv
except ImportError as e:
    sys.exit(
        f"必要なライブラリが足りません（{e}）。\n"
        f"  pip3 install -r requirements.txt\n"
        f"を実行してください。"
    )

# noteに出さないのと同じ理由で、WordPressにも出さないセクション
DROP_FROM = ("## 🔗 リンク", "## 📝 執筆メモ")


# ---------- frontmatter ----------


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    raw, body = text[4:end], text[end + 5 :]
    fm: dict = {}
    key = None
    for line in raw.split("\n"):
        if re.match(r"^\s*-\s+", line) and key:
            if not isinstance(fm.get(key), list):
                fm[key] = []
            item = line.strip()[1:].strip().strip('"')
            item = re.sub(r'^\[\[|\]\]$', "", item)
            fm[key].append(item)
            continue
        m = re.match(r"^([^\s:][^:]*):\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1).strip(), m.group(2).strip()
        if val == "":
            fm[key] = None  # 次行以降のリストで埋まる
        else:
            fm[key] = val.strip('"')
    return fm, body


def write_frontmatter_key(path: Path, key: str, value: str) -> None:
    """post_id など、投稿後にわかる値を記事ファイルへ書き戻す。"""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return
    end = text.find("\n---\n", 4)
    if end == -1:
        return
    head, rest = text[: end + 1], text[end + 1 :]
    if re.search(rf"^{re.escape(key)}:.*$", head, re.MULTILINE):
        head = re.sub(rf"^{re.escape(key)}:.*$", f"{key}: {value}", head, flags=re.MULTILINE)
    else:
        head = head.rstrip("\n") + f"\n{key}: {value}\n"
    path.write_text(head + rest, encoding="utf-8")


# ---------- 本文の整形 ----------


def strip_callouts(lines: list[str]) -> list[str]:
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


def wikilinks_to_text(line: str) -> str:
    line = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", line)
    line = re.sub(r"\[\[([^\]]*)\]\]", r"\1", line)
    return line


def drop_private_sections(text: str) -> str:
    cut = len(text)
    for heading in DROP_FROM:
        i = text.find("\n" + heading)
        if i != -1:
            cut = min(cut, i)
    return text[:cut]


def extract_title_and_body(body: str, fm_title: str | None) -> tuple[str, str]:
    lines = body.split("\n")
    title = fm_title
    start = 0
    for i, line in enumerate(lines):
        if line.startswith("# "):
            if not title:
                title = line[2:].strip()
            start = i + 1
            break
    return title or "(無題)", "\n".join(lines[start:])


def markdownify(body: str) -> str:
    body = drop_private_sections(body)
    lines = strip_callouts(body.split("\n"))
    lines = [wikilinks_to_text(l) if l.strip() != "---" else "" for l in lines]
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()
    html = md_lib.markdown(text, extensions=["extra", "sane_lists", "nl2br"])
    return html


# ---------- WordPress API ----------


class WPClient:
    def __init__(self) -> None:
        load_dotenv()
        url = os.environ.get("WP_URL")
        user = os.environ.get("WP_USER")
        app_pw = os.environ.get("WP_APP_PASSWORD")
        if not (url and user and app_pw):
            sys.exit(
                ".env に WP_URL / WP_USER / WP_APP_PASSWORD が設定されていません。\n"
                "  cp .env.example .env\n"
                "を実行して、値を埋めてください。"
            )
        self.base = url.rstrip("/") + "/wp-json/wp/v2"
        self.session = requests.Session()
        self.session.auth = (user, app_pw)

    def _term_id(self, kind: str, name: str) -> int:
        """categories/tags で name の term id を返す。なければ作る。"""
        r = self.session.get(f"{self.base}/{kind}", params={"search": name, "per_page": 100})
        r.raise_for_status()
        for term in r.json():
            if term["name"] == name:
                return term["id"]
        r = self.session.post(f"{self.base}/{kind}", json={"name": name})
        r.raise_for_status()
        return r.json()["id"]

    def publish(
        self,
        *,
        post_id: str | None,
        title: str,
        html: str,
        status: str,
        category: str | None,
        tags: list[str],
    ) -> dict:
        payload = {"title": title, "content": html, "status": status}
        if category:
            payload["categories"] = [self._term_id("categories", category)]
        if tags:
            payload["tags"] = [self._term_id("tags", t) for t in tags]

        if post_id:
            r = self.session.post(f"{self.base}/posts/{post_id}", json=payload)
        else:
            r = self.session.post(f"{self.base}/posts", json=payload)
        r.raise_for_status()
        return r.json()


# ---------- main ----------


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", help="投稿するObsidianノート(.md)のパス")
    status_g = ap.add_mutually_exclusive_group()
    status_g.add_argument("--publish", action="store_true", help="公開状態で投稿する")
    status_g.add_argument("--draft", action="store_true", help="下書きとして投稿する（既定）")
    ap.add_argument("--category", help="カテゴリー名。省略時は frontmatter の wp_category、それも無ければ「未分類」")
    ap.add_argument("--dry-run", action="store_true", help="APIに送らず、変換結果だけ表示する")
    args = ap.parse_args()

    src = Path(args.src).expanduser()
    if not src.exists():
        sys.exit(f"ファイルが見つかりません: {src}")

    raw = src.read_text(encoding="utf-8")
    fm, body = split_frontmatter(raw)
    title, body = extract_title_and_body(body, fm.get("title"))
    html = markdownify(body)

    status = "publish" if args.publish else "draft"
    if not args.publish and not args.draft and fm.get("wp_status") in ("draft", "publish"):
        status = fm["wp_status"]

    category = args.category or fm.get("wp_category") or os.environ.get("WP_DEFAULT_CATEGORY")

    NON_WP_TAGS = {"note記事", "MOC"}
    if fm.get("wp_tags"):
        tags = fm["wp_tags"]
    else:
        tags = [t for t in (fm.get("tags") or []) if t not in NON_WP_TAGS]

    if args.dry_run:
        print(f"タイトル: {title}")
        print(f"状態    : {status}")
        print(f"カテゴリ: {category or '（未分類）'}")
        print(f"タグ    : {', '.join(tags) if tags else '（なし）'}")
        print("--- HTML ---")
        print(html[:2000] + ("\n...(省略)..." if len(html) > 2000 else ""))
        return

    client = WPClient()
    post_id = fm.get("wp_post_id")
    result = client.publish(
        post_id=post_id,
        title=title,
        html=html,
        status=status,
        category=category,
        tags=tags,
    )

    write_frontmatter_key(src, "wp_post_id", str(result["id"]))
    write_frontmatter_key(src, "wp_status", status)

    link = result.get("link", "")
    action = "更新" if post_id else "新規投稿"
    print(f"{action}しました: post_id={result['id']}  status={status}")
    if link:
        print(link)


if __name__ == "__main__":
    main()
