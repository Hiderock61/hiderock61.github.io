#!/usr/bin/env python3
"""Structural break tests for the static AKECHI PORT v2 build."""

import json
import csv
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).parent
catalog = json.loads((root / "catalog-v2.json").read_text())
page = (root / "index.html").read_text()
with (root / 'editorial-v2.tsv').open() as f:
    editorial = {x['no']: x for x in csv.DictReader(f, delimiter='\t')}
assert len(editorial) == 138

assert catalog["count"] == 138
assert len(catalog["items"]) == 138
assert len({x["no"] for x in catalog["items"]}) == 138
assert len({x["name"] for x in catalog["items"]}) == 138
assert len(catalog["genres"]) == 10
assert set(Counter(x["genre"] for x in catalog["items"])) == {x["id"] for x in catalog["genres"]}

for item in catalog["items"]:
    if item['no'] in editorial:
        edit = editorial[item['no']]
        assert None not in edit and all(edit.values())
        assert item['ordinary']['summary'] == edit['summary']
        assert item['ordinary']['example'] == '例：' + edit['example']
        assert item['machine']['input'] == edit['input']
        assert item['machine']['output'] == edit['output']
    else:
        assert item.get('round') == 'round2'
        assert item.get('round_no')
    assert item["ordinary"]["summary"]
    assert item["ordinary"]["example"].startswith("例：")
    assert item["machine"]["name"]
    for key in ("trigger", "input", "inside", "action", "output"):
        assert item["machine"][key]
    assert item["akechi_idea"]
    assert item["connections"]
    assert all(c["to"] and c["passes"] for c in item["connections"])

assert len(re.findall(r'<details class="plugin-card"', page)) == 138
assert len(re.findall(r'class="genre-section"', page)) == 10
assert page.count(">人間視点</h3>") == 138
assert page.count(">設計副音声</h3>") == 138
assert page.count(">明智くんのアイデア</h3>") == 138
assert page.count("<dt>きっかけ</dt>") == 138
assert page.count("<dt>入力</dt>") == 138
assert page.count("<dt>内部</dt>") == 138
assert page.count("<dt>動作</dt>") == 138
assert page.count("<dt>出力</dt>") == 138
assert sum(1 for x in catalog["items"] if x.get("round") == "round2") == 53\nassert any(x["status"] == "DEFINED" for x in catalog["items"])\nassert not re.search(r'<details[^>]+\sopen(?:\s|>)', page)
assert "fetch(" not in page
assert "@media(max-width:760px)" in page
assert "@media(min-width:1700px)" in page
assert "@media print" in page
assert "break-inside:avoid" in page
assert "overflow-wrap:anywhere" in page
assert 'class="skip-link"' in page
ids = re.findall(r'\bid="([^"]+)"', page)
assert len(ids) == len(set(ids))
anchors = re.findall(r'href="#([^"]+)"', page)
assert set(anchors) <= set(ids)

print("PASS: 138 cards, 10 genres, complete flows, evidence states, static fallback, responsive and print guards")
