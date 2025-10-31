#!/usr/bin/env python3
"""Fetch the Zenn RSS feed and convert it to JSON."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parents[1]
FEED_URL = "http://zenn.dev/urakawa_jinsei/feed?all=1"
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


def parse_atom_feed(root: ET.Element) -> list[dict]:
    entries = root.findall(f".//{ATOM_NS}entry")

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

        enclosure_node = None
        for candidate in entry.findall(f"{ATOM_NS}link"):
            if candidate.attrib.get("rel") == "enclosure":
                enclosure_node = candidate
                break
        enclosure = enclosure_node.attrib.get("href", "") if enclosure_node is not None else ""

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
            "enclosure": enclosure,
            "published_at": published_at,
            "summary": summary,
            "category": categories[0] if categories else "その他",
            "tags": categories,
        }
        articles.append(article)

    return articles


def parse_rss_feed(root: ET.Element) -> list[dict]:
    channel = root.find("channel")
    if channel is None:
        return []

    articles = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        url = (item.findtext("link") or "").strip()
        enclosure_node = item.find("enclosure")
        enclosure = enclosure_node.attrib.get("url", "") if enclosure_node is not None else ""

        pub_date = (item.findtext("pubDate") or "").strip()
        published_at = pub_date
        if pub_date:
            try:
                parsed = parsedate_to_datetime(pub_date)
            except (TypeError, ValueError):
                parsed = None
            if parsed is not None:
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                published_at = parsed.astimezone(timezone.utc).isoformat()

        description = item.findtext("description") or ""
        for child in item:
            if child.tag.endswith("encoded") and child.text:
                description = child.text
                break
        summary = strip_html(description)

        categories = []
        for category in item.findall("category"):
            text = (category.text or "").strip()
            if text:
                categories.append(text)

        if not title or not url:
            continue

        article = {
            "title": title,
            "url": url,
            "enclosure": enclosure,
            "published_at": published_at,
            "summary": summary,
            "category": categories[0] if categories else "その他",
            "tags": categories,
        }
        articles.append(article)

    return articles


def parse_feed(feed_bytes: bytes) -> list[dict]:
    root = ET.fromstring(feed_bytes)

    if root.tag.endswith("feed"):
        return parse_atom_feed(root)
    if root.tag.endswith("rss"):
        return parse_rss_feed(root)

    # Fallback: attempt Atom parsing first, then RSS in case of namespaces.
    articles = parse_atom_feed(root)
    if articles:
        return articles
    return parse_rss_feed(root)


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
