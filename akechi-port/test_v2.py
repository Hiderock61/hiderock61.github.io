#!/usr/bin/env python3
"""Structural checks for the current Hybrid AKECHI PORT (138 plugins)."""

import json
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).parent
catalog = json.loads((root / "catalog-v2.json").read_text())
round2 = json.loads((root / "round2-catalog.json").read_text())
page = (root / "index.html").read_text()

assert catalog["count"] == 138
assert len(catalog["items"]) == 138
assert len({x["no"] for x in catalog["items"]}) == 138
assert len({x["name"] for x in catalog["items"]}) == 138
assert len(catalog["genres"]) == 10

assert round2["count"] == 53
assert len(round2["items"]) == 53
assert [x["no"] for x in round2["items"]] == [f"{n:03d}" for n in range(86, 139)]
assert [x["round_no"] for x in round2["items"]] == [f"{n:03d}" for n in range(1, 54)]

match = re.search(r"const PLUGINS=(\[.*?\]);\nconst LEGACY=", page, re.S)
assert match, "Hybrid PLUGINS data block missing"
plugins = json.loads(match.group(1))

assert len(plugins) == 138
assert len({x["no"] for x in plugins}) == 138
assert len({x["name"] for x in plugins}) == 138
assert len({x["slug"] for x in plugins}) == 138
assert len([x for x in plugins if x.get("round") == "round2"]) == 53

allowed = {"PROVEN", "PARTIAL", "BLOCKED", "DEFINED", "HOLD", "UNKNOWN"}
assert set(x["status"] for x in plugins) <= allowed
assert any(x["status"] == "DEFINED" for x in plugins)

names = {x["name"] for x in plugins}
for item in plugins:
    if item.get("round") == "round2":
        assert item.get("round_no")
        assert item.get("evidence_note")
        assert item.get("akechi_idea")
        assert item.get("connections")
        assert all(c["to"] in names and c["passes"] for c in item["connections"])

assert set(Counter(x["genre"] for x in plugins)) == {x["id"] for x in catalog["genres"]}
assert "PLUGIN ATLAS / 001–138" in page
assert "138個の外部AI能力" in page
assert "全部 <small>138</small>" in page
assert 'class="status status-' not in page  # cards are rendered by Hybrid JS at runtime
assert ".status-defined" in page
assert "<dt>evidence</dt>" in page
assert "明智くんのアイデア｜第2回" in page
assert "接続候補｜第2回・未検証" in page
assert "fetch(" not in page

print("PASS: Hybrid AKECHI PORT has 138 unique plugins, Round 2 has 53 cards, evidence and connection targets are structurally valid")
