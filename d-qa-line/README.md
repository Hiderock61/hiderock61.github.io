# D｜QA・判定・検品ライン v0.1

金線1号の第四ジャンル D の自主実演用システム。

## 骨格
対象 → 判定基準 → CHECK → PASS / FAIL / REVIEW → 証拠 → RE-TEST

## v0.1
- TEST CASE登録
- PASS / FAIL / REVIEW
- 重要度
- 証拠・再現手順
- RE-TEST
- 集計
- CSV / JSON export
- localStorage保存
- FAIL / REVIEW の証拠Validator

既存の本館ファイルは変更せず、`d-qa-line/` 以下だけで独立運用する。
