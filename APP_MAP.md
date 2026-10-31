# APP_MAP v1.8

Hiderock61 の公開活動を、AIや施工側が短時間で把握するための地図。

最終確認日: 2026-09-30（アプリ導線を同期。その他の棚は既存記録を維持）

更新: 2026-11-01（無料ブラウザアプリ改修と公開境界の追加記録）

## 2026-11-01｜制作開始許可の実カード検証・iPhoneキャッシュ対策

- 入口 `Hiderock61/anken-jirai-map` と装備庫 `Hiderock61/freelance-` の現物JavaScriptを実際に切り出して、架空の確認中／制作可能カードを生成し、装備庫の本物のparserで読み直し、制作ゲートへ通す試験を実施（15/15 PASS）。
- <b>判明した欠損</b>：旧入口は制作開始許可を確認していたが、案件カードに【制作開始許可】を明記していなかった。旧装備庫は「制作可能」という文言と3項目を検査するだけで、許可と未解決の質問を再照合していなかった。
- <b>改修</b>：入口が【制作開始許可】＝「確認済み／未確認」を明記し、装備庫は「制作可能」受理前に、許可が確認済み・質問なし・未確定事項なし・作業内容/納品物/チェック基準が確定済み、を再チェック。旧式カードで許可が書かれていない場合は止め、入口で再生成する。これは意図的な安全側の互換性変更。
- 入口コピーAPI失敗時は内部カードを開いて選択可能にし、まだコピーしていない旨を明示し、手動コピー後の装備庫へのリンクも表示。模擬7/7 PASS。外部送信や応募自動化は追加なし。
- <b>iPhoneキャッシュ対策</b>：明智君OS、入口、装備庫のHTMLに新JSクエリを設定。明智君OSのPWA Service Workerキャッシュ名・precache対象も同期。GitHub main更新済みだがiPhoneキャッシュ更新・実表示は未確認。
- 全4repoのindex.html相対参照をリポジトリ内ファイルと照合し、参照切れ0件。HTMLインラインJSと参照JSの構文検査PASS。公開PagesへのHTTP応答確認とiPhoneの2状態案件実機E2Eは未確認。

---

## 2026-11-01｜別リポジトリ4系統・局所補修とPWA施工

GitHub mainへ反映・ローカル試験済み。公開Pages配信応答と本人iPhone実機操作は別検収。あしあと仲人は今回PARK指定なので改変なし。

| 入口 | 今回の施工 | 未確認 |
|---|---|---|
| [明智君OS](https://hiderock61.github.io/akechi-os/) | コピー誤成功修理（QA7/7）、PWAアイコン/Service Worker/隔離キャッシュ整備（QA10/10とSW模擬実行6/6） | iPhoneインストール・実オフライン起動 |
| [ヒデロクスケ・リモコン](https://hiderock61.github.io/hiderokusuke-remocon/) | コピー成功判定修理・失敗時の手動コピー案内（QA5/5） | iPhoneクリップボード実機 |
| [フリーランス装備庫](https://hiderock61.github.io/freelance-/) | v2系を保全してコピー失敗時の選択欄、納品文3モードと質問コピーの誤成功修理、端末保存拒否対処（QA9/9、草案5/5） | iPhoneコピー・実案件連携 |
| [フリーランス入口アプリ](https://hiderock61.github.io/anken-jirai-map/) | 閉じた内部カードを展開してからコピー試行。コピーできなければ受渡成功扱いしない（QA9/9） | 入口→装備庫のiPhone手渡し |

入口と装備庫は手動コピー＆ペーストを共通伝票として使う既存設計を継承。確認中の実制作は禁止。外部AI自動送信・自動応募・顧客の本番操作を追加していない。明智君OSとヒデロクスケ・リモコンは役割が異なる別アプリ。

---

## 2026-11-01｜本館アプリ・無課金ローカル施工の最新差分

この節は旧版の履歴を上書きせず、GitHub実物の新しい施工だけを記録する。

| 公開入口 | 今回の変化 | 検証した範囲 | 継続HOLD |
|---|---|---|---|
| [捨てる？残す？3問ミニ判定](https://hiderock61.github.io/300yen/suteru-nokosu/) | 静的案内 → 操作式無料ブラウザ版 v1.0 | 14/14模擬動作テスト。YES/NO/不明の分岐、30日保留、結果コピー、外部送信なし。コミット `3f869d815f87d137624bdbf05bb569d606261424` | Pages反映とiPhone画面実操作は未確認。note有料PDFは非変更 |
| [A型 EC商品登録・架空体験デモ](https://hiderock61.github.io/a-ec-importer/demo.html) | CSV構造不正の受付停止を修理。列名重複、列数不足・超過、引用符異常を拒否 | 独立20/20、架空14件→10 PASS/4 HOLD→模擬登録10件、2回目も10件。コミット `6fb4d6fb0467b23fa4e4b831980a9f52d40f6543` | Shopify本番接続・有料クラウド提供・iPhone実機・Pages反映は未実証 |

保留分類：`portfolio-diary`／`diff24`／`affiliate-diff`は公開版が存在するためゼロから作り直さない。`tools/skillforge-v01`の実OS操作・Chrome拡張等、A型のShopify認証・本番ストア書込は本館の静的HTML変更だけでは完成しない。新規権限や外部サービス操作は別承認と実環境QAが必要。

本館トップから両アプリへの内部リンクは存在し、現在GitHub mainのファイル構成との照合で本館トップ内の相対リンク34/34到達先が存在。これはGitHubソース上の到達先存在チェックであり、HTTP 200と最終描画・端末実操作の代用ではない。

---

## 30秒で見る現在地

```text
HIDEROTSUKE 本館 v3.8
├─ 🚪 代表入口
│  ├─ AIリモコン
│  ├─ フリーランス制作工程
│  └─ 方法©️棚
├─ 🔧 仕事・AI道具
│  ├─ ai-remocon
│  ├─ akechi-os
│  ├─ hiderock-tam
│  ├─ anken-jirai-map v0.4F
│  └─ freelance- v2.3.6
├─ 🖥️ Web制作ポートフォリオ
│  ├─ 六弦電気工房
│  ├─ みがき舎
│  ├─ 余白珈琲
│  ├─ みず番
│  ├─ AI資料量産装置 v0.1
│  ├─ AI商品登録ライン v0.1
│  └─ nagi
├─ ©️ 方法©️
│  └─ methods/  [棚17 / GitHub正本17 / 未接続0]
│     ├─ 本館側個別正本 2
│     └─ hiderock-method-os 接続 15
├─ 📻 読む作品・番組
│  ├─ AIデイリーニュース
│  ├─ AI副業連載
│  ├─ アプリ制作連載
│  ├─ 小麦粉ラジオ｜FX
│  ├─ あるAIの困惑ログ
│  ├─ ラジオドラマ📻創世期
│  └─ AI・思考コラム
├─ 🧪 研究・実験
│  ├─ 公開研究の一部: 科学するシリーズ
│  └─ GitHub現役
│     ├─ new-kit-gaw
│     ├─ ashiato
│     ├─ genshoka-os
│     └─ houmon-torisetsu
└─ 🗄️ アーカイブ
   ├─ 🔒 GitHub archive済み
   │  ├─ kit-gaw
   │  ├─ yuueki
   │  └─ sento-qr-ticket-demo
   └─ 📦 本館上の歴史参照 / repo未archive
      └─ hiderokusuke-remocon
```

---

## 記録・比較アプリの公開導線

- アフィリエイト差分分析アプリ — https://hiderock61.github.io/affiliate-diff/
  - 本館「Webアプリ・試作品」から開く。記事の変更前後と観測結果を記録・比較する。
- ポートフォリオ日記アプリ — https://hiderock61.github.io/portfolio-diary/
  - 本館「Web制作ポートフォリオ」から開く。作業記録をCASE STUDY候補にまとめる。
- 差分24時 — https://hiderock61.github.io/diff24/
  - 本館「Web制作ポートフォリオ」から開く。2つの記録の差分を比較する。

本体はそれぞれ本館リポジトリの同名ディレクトリに配置。入口追加とアプリ本体の機能変更は別作業として扱う。

---

## 🚪 代表入口

### AIリモコン
- Repo: `ai-remocon`
- Pages: https://hiderock61.github.io/ai-remocon/

### フリーランス制作工程
- 入口: `anken-jirai-map` v0.4F
- 装備庫: `freelance-` v2.3.6
- 接続: `募集本文 → 入口アプリ → 正式案件カード → 装備庫 → 制作 / 検品 / 提出`
- 現在は確認後にコピー＆ペーストで渡す。

### 方法©️棚
- 本館: `/methods/`
- Pages: https://hiderock61.github.io/methods/
- 状態: **棚17 / GitHub正本17 / 未接続0**

---

## 🖥️ Web制作ポートフォリオ

- 六弦電気工房 — https://hiderock61.github.io/rokugen-denki-portfolio/
- みがき舎 — https://hiderock61.github.io/migakisha-cleaning-portfolio/
- 余白珈琲 — https://hiderock61.github.io/yohaku-coffee/
- みず番 — https://hiderock61.github.io/mizuban/
- AI資料量産装置 v0.1 — https://hiderock61.github.io/ai-material-factory/
- AI商品登録ライン v0.1 — https://hiderock61.github.io/ai-product-registration/
- nagi — https://hiderock61.github.io/nagi-salon-portfoli/concept-static/

---

## ©️ 方法©️棚

### 役割分担

- **Notion** — 運用正本
- **Hiderock61/hiderock-method-os** — 方法©️GitHub設計図ホーム
- **本館 `/methods/`** — 公開総合索引
- **本館 `methods/*.md`** — 本館側で正本化された個別方法©️

### 本館側正本 2

- `methods/ROU-DOU_EDIT_METHOD.md`
- `methods/TRACES_REVERSE_EXCAVATION_METHOD.md`

### 方法OS側 15

- 001 自分史Notion法©️
- 002 オープンレイヤー自分史法©️
- 003 逆読みGo注釈法©️
- 004 社会的レイヤー札化方法©️
- 005 上下俯瞰法©️
- 006 ヒデロツク劇団方法©️（BONSAI©️）
- 007 明智工務店施工依頼書法©️
- 008 Cozzy Key🔑
- 009 Notion正本防衛法©️
- 010 方法©️登録プロトコル
- 011 編集室発掘・作品札化法©️
- 012 坂読み分岐法©️
- 013 ヒデロック多層世界地図©️
- 014 武術テンプレ法©️
- 015 **ヤスリ施工©️ v1.0**

GitHub正本未接続: **0本**。

---

## 📻 読む作品・番組

本館 `index.html` から確認済みの公開棚へ直接接続。

- あるAIの困惑ログ — https://note.com/note_id_hiderock/m/mb2ca5bf75c81
- ラジオドラマ📻創世期 — https://note.com/note_id_hiderock/m/mbaaae678ec04
- AI・思考コラム / AIの話マガジン — https://note.com/note_id_hiderock/m/maa437548d287

既存接続:
- AIデイリーニュース
- AI副業連載
- アプリ制作連載
- 小麦粉ラジオ｜FX

---

## 🧪 研究・実験

### 公開研究

- 科学するシリーズ — https://note.com/note_id_hiderock/m/m777964139443

これは研究室全体の公開正本ではなく、公開研究の一部として扱う。
**ヒデロツク理論研究室全体を束ねる専用公開URLは未確認。**

### GitHub現役

- `new-kit-gaw` — archived=false
- `ashiato` — archived=false
- `genshoka-os` — archived=false
- `houmon-torisetsu` — archived=false

---

## 🗄️ アーカイブ

### 🔒 GitHub archive済み

- `kit-gaw`
- `yuueki`
- `sento-qr-ticket-demo`

### 📦 本館上の歴史参照 / repo未archive

- `hiderokusuke-remocon`

本館上のアーカイブ分類とGitHubの `archived` フラグは別管理。

---

## 本館リポジトリ内だけの物理配置

```text
/
├─ index.html
├─ README.md
├─ APP_MAP.md
├─ PROJECT_CARD.md
├─ HOUSEKEEPING_LOG.md
├─ methods/
├─ mizuban/
└─ yohaku-coffee/
```

---

## 正本優先順位

1. 現在動いている各リポジトリ
2. Notion運用正本 / 方法OS設計図
3. 本館 `index.html` / `methods/` 公開索引
4. README / APP_MAP / PROJECT_CARD
5. HOUSEKEEPING_LOG / 過去ログ

---

## 再監査トリガー

- 新repo作成
- repo archive / unarchive
- 代表作・公開マガジンの追加や統合
- 方法©️正本の追加
- 本館掲載物の削除・統合

---

v1.3（2026-08-13）: ヤスリ施工©️を方法OS 015へ接続して方法棚17/17/0を達成。note公開棚を再監査し、困惑ログ・ラジオドラマ・AI思考コラム・科学するシリーズへ接続。本館 v2.6 と同期。


---

v1.4（2026-09-26）: 本館 v3.8 と同期。自主実演ケーススタディ「AI資料量産装置 v0.1」「AI商品登録ライン v0.1」をWeb制作ポートフォリオ棚へ接続。


v1.5（2026-09-30）: アフィリエイト差分分析アプリの本館入口を追加。日記・差分24時を含む3アプリの公開導線を追記。
