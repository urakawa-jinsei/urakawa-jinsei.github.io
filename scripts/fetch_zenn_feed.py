#!/usr/bin/env python3
"""Fetch the Zenn RSS feed and convert it to JSON."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parents[1]
FEED_URL = "https://zenn.dev/urakawa_jinsei/feed"
PROXY_URL = f"https://r.jina.ai/{FEED_URL}"
OUTPUT_PATH = REPO_ROOT / "assets" / "data" / "zenn-feed.json"
ATOM_NS = "{http://www.w3.org/2005/Atom}"


def fetch_feed(url: str) -> bytes:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; GitHubAction/1.0; +https://github.com/)",
        "Accept": "application/atom+xml, application/xml, text/xml; charset=utf-8",
    }
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def load_feed() -> bytes:
    errors: list[str] = []
    for url in (FEED_URL, PROXY_URL):
        try:
            return fetch_feed(url)
        except urllib.error.URLError as exc:  # pragma: no cover - diagnostic output only
            errors.append(f"{url}: {exc}")
    raise RuntimeError("Unable to fetch RSS feed: " + "; ".join(errors))


def strip_html(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_feed(feed_bytes: bytes) -> list[dict]:
    root = ET.fromstring(feed_bytes)
    entries = root.findall(f"{ATOM_NS}entry")

    articles = []
    for entry in entries:
        title_node = entry.find(f"{ATOM_NS}title")
        title = (title_node.text or "").strip() if title_node is not None else ""

        link_node = None
        for candidate in entry.findall(f"{ATOM_NS}link"):
            rel = candidate.attrib.get("rel")
            if rel == "alternate":
                link_node = candidate
                break
            if link_node is None:
                link_node = candidate
        url = link_node.attrib.get("href", "") if link_node is not None else ""

        published_node = entry.find(f"{ATOM_NS}published") or entry.find(f"{ATOM_NS}updated")
        published_at = (published_node.text or "").strip() if published_node is not None else ""

        summary_node = entry.find(f"{ATOM_NS}summary") or entry.find(f"{ATOM_NS}content")
        raw_summary = summary_node.text if summary_node is not None and summary_node.text else ""
        summary = strip_html(raw_summary)

        categories = []
        for category in entry.findall(f"{ATOM_NS}category"):
            term = category.attrib.get("term") or category.text or ""
            term = term.strip()
            if term:
                categories.append(term)

        if not title or not url:
            continue

        article = {
            "title": title,
            "url": url,
            "published_at": published_at,
            "summary": summary,
            "category": categories[0] if categories else "その他",
            "tags": categories,
        }
        articles.append(article)

    return articles


def write_json(articles: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "articles": articles,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    try:
        feed_bytes = load_feed()
        articles = parse_feed(feed_bytes)
        if not articles:
            raise RuntimeError("The RSS feed did not contain any articles.")
        write_json(articles)
    except Exception as exc:  # pragma: no cover - script used in CI only
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
