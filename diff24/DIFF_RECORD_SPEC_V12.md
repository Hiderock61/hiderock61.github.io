# 差分24時©️｜DIFF RECORD v12.0-PROBE｜設計・検収札
2026-11-16 / オノノケホールディングス / GitHub現行v11.0からの増築

## T0
「文章・数値・JSON・CSV・画像・観測など、異なる方法で発見した差分を、他の工程が理解できる共通記録へ翻訳する」。
**比較方法を統一するのではなく、比較後の情報の出力規格を統一する。**

## 原典と継承
- 正本：<https://app.notion.com/p/3e5c10ec598c814ca7d0d505682b88f9>
- 現物：<https://github.com/Hiderock61/hiderock61.github.io/tree/main/diff24>
- 現行GitHub版：ANALYSIS_VERSION 11.0 / SCHEMA_VERSION 1.6（この2値は**変更しない**）。
- Hatchable旧版は別経路。今回改変しない。
- 既存RAW / METRIC / JSON PATH / CSV / 3-way / EVENT LOG / SENSOR BUS / SNAPSHOT / 保存済みCASE は変更しない。

## 第1増築の範囲
`diff-record.js` は既存 `diff24-changeset-v1` から
`diff24-record-batch-v1` を**その場で派生生成**する。既存保存データは書き換えない。

8項目：
1. **existence**：A/B入力にその項目があるか（A_ONLY / B_ONLY / BOTH / UNKNOWN）。現実の商品の販売終了、廃止、発生を意味しない。
2. **location**：分野と位置（scope / path）。
3. **direction**：INCREASE / DECREASE / CHANGED_UNQUANTIFIED / TYPE_CHANGED / UNKNOWN等。
4. **magnitude**：数値差・絶対量・単位・率。入力または既存機構で数字が確定した場合のみ。
5. **time**：比較に使った観測日時。保存日時を観測日時と偽装しない。両側時刻のないものはnull。
6. **before**：A値および既知判定。
7. **after**：B値および既知判定。
8. **consequence**：A/Bの結果記録またはUNKNOWN。**因果関係は常に未認定**。

付帯：operation、evidence reference（外部検証済みとの主張なし）、review_required、source schema、parent/revision。

## 成立させる不変条件
- 未観測 ≠ 存在しない、Bに無い ≠ 実世界で削除された。
- 数値未確認 ≠ ゼロ。JSONの明示的な `null` とプロパティ未存在を区別。
- 結果の同時観測 ≠ 原因の証明。
- 通貨や単位を勝手に換算しない。
- 異なるCASE TYPEを無条件で同一尺度化しない。
- 元資料・既存事件簿・外部サイトへ書込みなし。
- 旧保存Schemaの移行なし。現行の観測・センサー運転には介入しない。

## 試験と未検証
**コード試験：** 共通形式・数値Δ・JSON型変化・CSV片側存在・UNKNOWN・null/欠損・原因未認定・未知操作拒否・3-way境界を検査。Node標準テストは `node --test diff24/tests/diff-record.test.cjs`。

**検収範囲：** 新規Adapterが既存Change Setから読み取り専用でDIFF RECORD JSONを生成できること。旧全機能のブラウザE2E、モバイル実機、現実の市場監視、顧客需要はこの増築で実証していない。

## 次の工程（勝手に並行開発しない）
- v12.1：BASE/A/Bの3-wayを`conflict`付きDIFF RECORDへ正規化。
- v12.2：画像の画素差・時間軸・外部センサーバス専用アダプター（観測条件と不確実性を保持）。
- v12.3：文章・数値・CSV・JSON・画像の5分野に独立した検収標本を作り、必要なら入力ガイドを追加。
- v13候補：M13への読み取り専用出力。M13の支払需要仮説を差分24時側で勝手に生成しない。金線1号・M14の案件GOを自動決裁しない。

## 運転状態
BRANCH PROBE / 本番main変更なし / 自動監視なし / 追加維持義務なし。

## 2026-11-16｜裏オペ第1回｜READ ONLY境界監査と局所補修
- **現行main**：`diff24/app.js` Blob SHA `0f79ad154c57e48dff9f56442da56d7e03d5cfe3`。mainのANALYSIS_VERSION 11.0 / SCHEMA_VERSION 1.6は維持。
- **対象**：開発ブランチ `feature/diff24-record-v12-20261116`、Draft PR #5。mainとHatchable旧版に変更なし。
- **発見した不備**：欠損した `ADD` / `REMOVE` にも入力内存在を断定し、`review_required=false` だった。
- **修正**：必要な `oldValue` / `value` が欠落した `ADD` / `REMOVE` / `REPLACE` / `TYPE_CHANGE` は `existence=UNKNOWN`、`direction=UNKNOWN`、`review_required=true` とする。明示的なJSON `null` は欠損ではない。
- **単体テスト**：JavaScript実行環境でNode標準テスト相当14件を実行し14/14 PASS。実際の `node --test` コマンドの実行確認とは区別する。
- **局所結合**：旧v11.0 `analyze → deriveChangeSet → DIFF RECORD → renderAnalysis` を模擬DOMで実行。
  - 文章2レコード、数値1、JSON2、CSV2の共通出力：PASS。
  - 異なるCASE TYPEの比較不能が維持され、新パネルが非表示：PASS。
  - 新規HTMLの参照ID整合／script読み込み順／JavaScript構文：PASS。
- **確認不能**：実iPhone・ブラウザ全操作のE2E、旧全機能の網羅回帰、公開Webの実監視、画像・3-wayのDIFF RECORD変換、保守採算、顧客需要。
- **次の候補**：v12.1へ進む前に、実ブラウザで旧事件簿・結果後付け・センサーバスを回帰検収する。
- **導入判定**：BRANCH PROBE / LOCAL QA PASS / MAIN HOLD。Draft PRは自動マージしない。
