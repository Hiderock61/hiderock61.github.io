#!/usr/bin/env python3

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

REQUIRED_FIELDS = {
    "schema_version",
    "test_id",
    "plugin",
    "verb",
    "status",
    "capability",
    "evidence_level",
    "flags",
    "observed_result",
    "verified_at",
    "source",
    "mode",
}
STRING_FIELDS = {
    "schema_version",
    "plugin",
    "verb",
    "status",
    "capability",
    "evidence_level",
    "observed_result",
    "verified_at",
    "source",
    "mode",
}
FLAG_KEYS = {"read", "write", "external_action", "human_gate"}


def fail(message):
    raise SystemExit(f"CONFLICT: {message}")


def encode_flags(flags):
    if not isinstance(flags, dict):
        fail("flags must be an object")
    if set(flags) != FLAG_KEYS:
        fail(f"invalid flags keys: {sorted(flags)}")
    if not all(isinstance(flags[key], bool) for key in FLAG_KEYS):
        fail("all flag values must be boolean")

    value = 0
    if flags["read"]:
        value |= 1
    if flags["write"]:
        value |= 2
    if flags["external_action"]:
        value |= 4
    if flags["human_gate"]:
        value |= 8
    return value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("packet")
    parser.add_argument("manifest")
    args = parser.parse_args()

    packet_path = Path(args.packet)
    manifest_path = Path(args.manifest)

    packet = json.loads(packet_path.read_text(encoding="utf-8"))
    data = json.loads(manifest_path.read_text(encoding="utf-8"))

    missing = REQUIRED_FIELDS - set(packet)
    if missing:
        fail(f"missing packet fields: {sorted(missing)}")

    for field in STRING_FIELDS:
        if not isinstance(packet[field], str) or not packet[field].strip():
            fail(f"{field} must be a non-empty string")

    if packet["schema_version"] != "1.0":
        fail(f"unsupported packet schema: {packet['schema_version']}")
    if packet["mode"] != "ADD":
        fail(f"unsupported mode: {packet['mode']}")

    test_id = packet["test_id"]
    if not isinstance(test_id, int) or isinstance(test_id, bool) or test_id < 1:
        fail("test_id must be a positive integer")

    try:
        plugins = data["dict"]["plugin"]
        verbs = data["dict"]["verb"]
        statuses = data["dict"]["status"]
        records = data["records"]
        coverage = data["coverage"]
    except (KeyError, TypeError) as exc:
        fail(f"invalid manifest structure: {exc}")

    plugin_name = packet["plugin"]
    if plugin_name not in plugins:
        plugins.append(plugin_name)
    plugin_idx = plugins.index(plugin_name)

    if packet["verb"] not in verbs:
        fail(f"unknown verb: {packet['verb']}")
    verb_idx = verbs.index(packet["verb"])

    if packet["status"] not in statuses:
        fail(f"unknown status: {packet['status']}")
    status_idx = statuses.index(packet["status"])

    flags_int = encode_flags(packet["flags"])

    new_record = [
        plugin_idx,
        verb_idx,
        status_idx,
        packet["capability"],
        flags_int,
        test_id,
    ]

    if new_record in records:
        print(f"NOOP #{test_id:03d}: exact record already exists")
        return

    same_identity = [
        row
        for row in records
        if row[5] == test_id
        and row[0] == plugin_idx
        and row[1] == verb_idx
        and row[3] == packet["capability"]
    ]
    if same_identity:
        fail(f"same identity with different content: {same_identity!r}")

    previous = [
        row
        for row in records
        if row[0] == plugin_idx
        and row[1] == verb_idx
        and row[3] == packet["capability"]
    ]
    if previous:
        print(
            "WARNING: capability already exists in earlier test(s): "
            f"{[row[5] for row in previous]}",
            file=sys.stderr,
        )

    records.append(new_record)

    try:
        test_ids = sorted({row[5] for row in records})
        max_test = max(test_ids)
        counts = Counter(statuses[row[2]] for row in records)
    except (IndexError, TypeError, ValueError) as exc:
        fail(f"invalid manifest record: {exc}")

    coverage["tests"] = f"#001-#{max_test:03d}"
    coverage["capability_records"] = len(records)
    coverage["plugins"] = len(plugins)
    coverage["missing_tests"] = [
        f"#{number:03d}"
        for number in range(1, max_test + 1)
        if number not in test_ids
    ]

    data["snapshot_date"] = packet["verified_at"]
    data["status_counts"] = {
        status: counts.get(status, 0)
        for status in statuses
    }
    data["latest_update"] = (
        f"#{test_id:03d} {packet['plugin']} {packet['verb']} "
        f"{packet['status']} ({packet['evidence_level']})"
    )

    manifest_path.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    print(f"ADD #{test_id:03d}")
    print("record:", new_record)
    print("coverage:", coverage)
    print("status_counts:", data["status_counts"])
    print("latest_update:", data["latest_update"])


if __name__ == "__main__":
    main()
