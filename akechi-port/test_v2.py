#!/usr/bin/env python3
"""Structural break tests for the static AKECHI PORT v2 build."""

import json
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).parent
catalog = json.loads((root / "catalog-v2.json").read_text())
page = (root / "index.html").read_text()

assert catalog["count"] == 85
assert len(catalog["items"]) == 85
assert len({x["no"] for x in catalog["items"]}) == 85
assert len({x["name"] for x in catalog["items"]}) == 85
assert len(catalog["genres"]) == 10
assert set(Counter(x["genre"] for x in catalog["items"])) == {x["id"] for x in catalog["genres"]}

for item in catalog["items"]:
    assert item["ordinary"]["summary"]
    assert item["ordinary"]["example"].startswith("例：")
    assert item["machine"]["name"]
    for key in ("trigger", "input", "inside", "action", "output"):
        assert item["machine"][key]
    assert item["akechi_idea"]
    assert item["connections"]
    assert all(c["to"] and c["passes"] for c in item["connections"])

assert len(re.findall(r'<details class="plugin-card"', page)) == 85
assert len(re.findall(r'class="genre-section"', page)) == 10
assert page.count(">人間視点</h3>") == 85
assert page.count(">設計副音声</h3>") == 85
assert page.count(">明智くんのアイデア</h3>") == 85
assert page.count("<dt>きっかけ</dt>") == 85
assert page.count("<dt>入力</dt>") == 85
assert page.count("<dt>内部</dt>") == 85
assert page.count("<dt>動作</dt>") == 85
assert page.count("<dt>出力</dt>") == 85
assert not re.search(r'<details[^>]+\sopen(?:\s|>)', page)
assert "fetch(" not in page
assert "@media(max-width:760px)" in page
assert "@media(min-width:1700px)" in page
assert "@media print" in page
assert "break-inside:avoid" in page
assert "overflow-wrap:anywhere" in page
assert 'class="skip-link"' in page

print("PASS: 85 cards, 10 genres, complete flows, static fallback, responsive and print guards")
