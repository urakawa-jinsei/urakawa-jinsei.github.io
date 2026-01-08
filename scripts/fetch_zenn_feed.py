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
import email.utils

REPO_ROOT = Path(__file__).resolve().parents[1]
FEED_URL = "https://zenn.dev/urakawa_jinsei/feed"
PROXY_URL = f"https://r.jina.ai/{FEED_URL}"
OUTPUT_PATH = REPO_ROOT / "data" / "zenn-feed.json"
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
        except urllib.error.URLError as exc:
            errors.append(f"{url}: {exc}")
    raise RuntimeError("Unable to fetch RSS feed: " + "; ".join(errors))


def strip_html(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_date(date_str: str) -> str:
    """RFC 822 (RSS) or ISO 8601 (Atom) date to ISO 8601"""
    try:
        # Try parsing RFC 822
        parsed = email.utils.parsedate_to_datetime(date_str)
        return parsed.isoformat()
    except Exception:
        pass
    
    return date_str # Return as is if parsing fails (assuming it might be ISO already)


def parse_feed(feed_bytes: bytes) -> list[dict]:
    root = ET.fromstring(feed_bytes)
    articles = []

    # Check if it's Atom or RSS
    if root.tag.endswith("rss"):
        # RSS 2.0
        channel = root.find("channel")
        if channel is None:
            return []
            
        items = channel.findall("item")
        for item in items:
            title = (item.find("title").text or "").strip()
            link = (item.find("link").text or "").strip()
            pub_date = (item.find("pubDate").text or "").strip()
            
            # description might contain HTML or just text
            description_node = item.find("description")
            raw_summary = description_node.text if description_node is not None else ""
            summary = strip_html(raw_summary)

            if not title or not link:
                continue

            # Generate Path
            path = link.replace("https://zenn.dev", "")
            
            # Format Date
            published_at = parse_date(pub_date)
            
            # Try to extract emoji from image (Zenn enclosure) - not reliable but let's see
            # Zenn's RSS has <enclosure url="..." /> which is the OG image.
            # We can't easily get the emoji. We'll verify JS fallback.
            
            article = {
                "title": title,
                "url": link,
                "path": path,
                "published_at": published_at,
                "summary": summary,
                "emoji": "📝", # Default emoji
                "liked_count": 0
            }
            articles.append(article)
            
    else:
        # Atom
        entries = root.findall(f"{ATOM_NS}entry")
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

            if not title or not url:
                continue
                
            path = url.replace("https://zenn.dev", "")

            article = {
                "title": title,
                "url": url,
                "path": path,
                "published_at": published_at,
                "summary": summary,
                "emoji": "📝",
                "liked_count": 0
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
        print(f"Successfully wrote {len(articles)} articles to {OUTPUT_PATH}")
    except Exception as exc: 
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
