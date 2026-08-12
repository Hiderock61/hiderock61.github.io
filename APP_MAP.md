# APP_MAP v0.7

Hiderock61 の公開活動を、AIや施工側が短時間で把握するための地図。

最終確認日: 2026-08-12

## 30秒で見る現在地

```text
HIDEROTSUKE 本館
├─ 🚪 代表入口
│  ├─ AIリモコン
│  ├─ フリーランス制作工程
│  └─ New Kit Gaw
├─ 🔧 仕事・AI道具
│  ├─ ai-remocon
│  ├─ akechi-os
│  ├─ hiderock-tam
│  ├─ anken-jirai-map v0.4F
│  └─ freelance- v2.3.6
├─ 🖥️ Web制作ポートフォリオ
│  ├─ 六弦電気工房
│  ├─ 余白珈琲
│  ├─ みず番
│  └─ nagi
├─ ©️ 方法©️
│  └─ methods/
├─ 📻 読む作品・番組
│  └─ note中心
├─ 🧪 研究・実験
│  ├─ SNS模型
│  └─ 生活・観測プロトタイプ
└─ 🗄️ アーカイブ
   ├─ kit-gaw
   └─ hiderokusuke-remocon
```

---

## 🚪 代表入口

### AIリモコン
- Repo: `ai-remocon`
- Pages: https://hiderock61.github.io/ai-remocon/
- 役割: 目的からAIへ渡す最初の一文を作る。

### フリーランス制作工程
- 入口: `anken-jirai-map` v0.4F
- 装備庫: `freelance-` v2.3.6
- 接続:
  `募集本文 → 入口アプリ → 正式案件カード → 装備庫 → 制作 / 検品 / 提出`
- 現在は確認後にコピー＆ペーストで渡す。

### New Kit Gaw
- Repo: `new-kit-gaw`
- Pages: https://hiderock61.github.io/new-kit-gaw/
- 役割: コミュニティ→話題→発言→プロフィール→足あとを巡るSNS構造模型。

---

## 🔧 仕事・AI道具

- `ai-remocon` — 会話起動リモコン
- `akechi-os` — 起動・一手・退避・帰還の操作盤
- `hiderock-tam` — 素材を混ぜてAI向け発注文へ流す生成工場
- `anken-jirai-map` — フリーランス入口アプリ v0.4F
- `freelance-` — フリーランス装備庫 v2.3.6

---

## 🖥️ Web制作ポートフォリオ

### 六弦電気工房
- Pages: https://hiderock61.github.io/rokugen-denki-portfolio/
- 種別: 既存サイト改善・スマホUI・導線改善

### 余白珈琲
- 本館内: `/yohaku-coffee/`
- Pages: https://hiderock61.github.io/yohaku-coffee/
- 種別: 架空喫茶店・スマホ中心店舗サイト

### みず番
- 本館内: `/mizuban/`
- Pages: https://hiderock61.github.io/mizuban/
- 種別: 架空水道修理・地域サービス・情報設計

### nagi
- Pages: https://hiderock61.github.io/nagi-salon-portfoli/concept-static/
- 種別: サロン・静止型 / 自動ループ型UX比較

---

## ©️ 方法©️棚

- 本館内: `/methods/`
- Pages: https://hiderock61.github.io/methods/
- 役割: 実作業から生まれた再利用可能な方法©️を用途別に俯瞰する。

GitHub正本あり:

- `methods/ROU-DOU_EDIT_METHOD.md`
  - ROU-DOU編集方法©️ v1.0
- `methods/TRACES_REVERSE_EXCAVATION_METHOD.md`
  - 痕跡逆算発掘法©️ v1.0

方法©️の運用正本はNotionと連携し、GitHubは別ルームでも再現するための公開・履歴側として使う。

---

## 📻 読む作品・番組

本館 `index.html` → noteマガジンへ接続。

- AIデイリーニュース
- AI副業連載
- アプリ制作連載
- 小麦粉ラジオ｜FX
- ラジオドラマ・寸劇
- コラム

---

## 🧪 研究・実験

### SNS・コミュニティ
- `new-kit-gaw` — 現行代表
- `ashiato`
- `yuueki`

### 生活・観測
- `genshoka-os`
- `houmon-torisetsu`
- `sento-qr-ticket-demo`

実サービスではなくUI・構造・仮説の検証目的のものを含む。

---

## 🗄️ アーカイブ

- `kit-gaw` — SNS模型の旧系統
- `hiderokusuke-remocon` — 個人用リモコン旧版

棚卸し完了・削除済み:

- Feeee
- hideki-Hiderock-
- freelance

---

## 本館リポジトリ内だけの物理配置

```text
/
├─ index.html
├─ README.md
├─ APP_MAP.md
├─ PROJECT_CARD.md
├─ methods/
├─ mizuban/
├─ yohaku-coffee/
└─ app.js  ← 現index.htmlから未接続。旧コード候補、削除保留。
```

---

## 同期ルール

### 更新する
- 代表作の追加・削除
- 役割の変更
- ポートフォリオ追加
- 公開方法©️追加
- アプリ同士の接続変更

### むやみに追わない
- 全リポジトリの細かなパッチ番号
- 完了済み作業ログ
- 一時的な施工メモ

### 正本優先順位
1. 現在動いている各リポジトリ
2. 本館 `index.html`
3. README / APP_MAP / PROJECT_CARD
4. 古い作業ログ

---

v0.7（2026-08-12）: 本館を「代表入口 / 仕事 / ポートフォリオ / 方法©️ / 読み物 / 研究 / アーカイブ」の棚構造へ再整理。
