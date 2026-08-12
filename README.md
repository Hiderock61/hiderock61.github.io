# HIDEROTSUKE / ヒデロツく 本館

公開URL: https://hiderock61.github.io/

ヒデロツクの活動全体をつなぐ玄関です。
Webアプリ、Web制作ポートフォリオ、方法©️、記事・番組、個人研究を、用途別の棚に分けて置きます。

最終整理: 2026-08-12

---

## 本館の見方

本館は「全部を一列に並べるリンク集」ではなく、次の棚で管理します。

1. **🚪 まず見る** — 初見で触ってほしい代表作
2. **🔧 仕事・AI道具** — 実際の作業を進めるアプリ
3. **🖥️ Web制作ポートフォリオ** — 架空案件・改善事例・UX試作
4. **©️ 方法©️棚** — 制作・編集・思考・人生整理で再利用する方法
5. **📻 読む作品・番組** — note、AIニュース、ラジオ寸劇、連載
6. **🧪 研究・実験** — 個人研究、UI模型、生活観測系プロトタイプ
7. **🗄️ アーカイブ** — 旧版・歴史参照用

---

## 🚪 まず見る

- **AIリモコン**
  - https://hiderock61.github.io/ai-remocon/
  - 目的からAIへ渡す「最初の一文」を作る。

- **フリーランス制作工程**
  - 入口アプリ: https://hiderock61.github.io/anken-jirai-map/
  - 装備庫: https://hiderock61.github.io/freelance-/
  - 募集本文 → 案件カード → 制作・検品・提出へつなぐ。

- **New Kit Gaw**
  - https://hiderock61.github.io/new-kit-gaw/
  - コミュニティ、話題、発言、プロフィール、足あとを巡るSNS構造模型。

---

## 🔧 仕事・AI道具

### AIを使う道具

- ai-remocon — AIリモコン
- akechi-os — 明智君OS
- hiderock-tam — ヒデロックテンプレ法©️ Demo

### フリーランス制作工程

- anken-jirai-map — **フリーランス入口アプリ v0.4F**
  - 募集本文を分解し、未確定事項と質問を整理して正式案件カードを作る。
- freelance- — **フリーランス装備庫 v2.3.6**
  - 案件カードを制作・検品・提出の作業台へ変換する。

接続:

`募集本文 → 入口アプリ → 正式案件カード → 装備庫 → 制作 / 検品 / 提出`

※ 現在は案件カードを確認してコピー＆ペーストで渡す方式。

---

## 🖥️ Web制作ポートフォリオ

- **六弦電気工房**
  - https://hiderock61.github.io/rokugen-denki-portfolio/
  - 修正前サイトから情報設計・スマホ表示・導線を段階改善するケーススタディ。

- **余白珈琲**
  - https://hiderock61.github.io/yohaku-coffee/
  - 方南町の小さな架空喫茶店を想定した、スマホ中心の店舗サイト制作事例。

- **みず番**
  - https://hiderock61.github.io/mizuban/
  - 地域密着型の架空水道修理サイト。料金表示・CTA・FAQ・問い合わせ導線を改善。

- **nagi**
  - https://hiderock61.github.io/nagi-salon-portfoli/concept-static/
  - 同一素材から静止型と自動ループ型を作り分けるサロンUX比較試作。

---

## ©️ 方法©️棚

公開棚:

- https://hiderock61.github.io/methods/

現在GitHub正本がある方法:

- **ROU-DOU編集方法©️ v1.0**
  - 長期チャットから原典を壊さず発掘・札化・接続して作品世界へ戻す親編集法。
- **痕跡逆算発掘法©️ v1.0**
  - 記憶に頼らず、写真・メール・端末・人脈・契約などの痕跡から本人情報を逆算する。

棚にはこのほか、編集・思考・人生整理・AI施工で使う方法©️の樹形図を掲載します。

運用原則:

`現実で使う → 名前が付く → Notionで正本化 → GitHubで再現可能にする → 実際に使って更新`

---

## 📻 読む作品・番組

本館トップから note の各マガジンへ接続します。

- AIデイリーニュース
- AI副業連載
- アプリ制作連載
- 小麦粉ラジオ｜FX
- ラジオドラマ・寸劇
- コラム

note: https://note.com/note_id_hiderock

---

## 🧪 研究・実験

### SNS・コミュニティ模型

- new-kit-gaw — 最新探索型SNS模型
- ashiato — あしあと仲人©️
- yuueki — YUUEKi.com

### 生活・観測の実験

- genshoka-os — 現象化OS Core β
- houmon-torisetsu — 訪問前トリセツ
- sento-qr-ticket-demo — 銭湯QR券売機デモ

医療・介護・コミュニティ等に見える試作品は、実サービスではなく架空データやUI構造を使った検証用プロトタイプとして扱います。

---

## 🗄️ アーカイブ

- kit-gaw — New Kit Gaw以前の旧系統
- hiderokusuke-remocon — 個人用リモコン旧版

棚卸し完了・削除済み:

- Feeee
- hideki-Hiderock-
- freelance

---

## このリポジトリ内の構造

```text
/
├─ index.html              本館トップ
├─ README.md               人間向けの本館説明書
├─ APP_MAP.md              AI・施工用の短時間参照地図
├─ PROJECT_CARD.md          このリポジトリ自体の現在地カード
├─ methods/                方法©️棚とGitHub正本
├─ mizuban/                みず番ポートフォリオ
├─ yohaku-coffee/          余白珈琲ポートフォリオ
└─ app.js                  旧コード候補。現本館から未接続のため要監査
```

`app.js` は現在の `index.html` から接続されていないため、削除せず「旧コード候補」として保留します。

---

## 正本の役割分担

- **index.html** — 公開客が見る玄関
- **README.md** — 本館全体の説明書
- **APP_MAP.md** — AIが短時間で現在地を把握する地図
- **PROJECT_CARD.md** — 本館リポジトリ自身の状態・触る場所・触らない場所
- **methods/** — 方法©️の公開棚と再現用GitHub正本
- **Notion** — 方法©️・作品・人生情報などの運用正本

---

## 同期ルール

次の変化があった時だけ、本館を同期します。

- 代表作が増えた / 消えた
- アプリの役割が変わった
- 本館で見せるべき新しいポートフォリオが増えた
- 方法©️の公開正本が増えた
- アプリ同士の接続関係が変わった

バージョン番号は、接続確認に重要なものだけ記録します。細かな全リポジトリのバージョンを本館で追い続けないことで、説明書の陳腐化を減らします。

---

## 外部

- note: https://note.com/note_id_hiderock
- YouTube: https://www.youtube.com/@HideRockJapan6969
- SoundCloud: https://soundcloud.com/9baeevutx6c3
- GitHub: https://github.com/Hiderock61

---

更新履歴:

- 2026-08-12: 棚構造を再整理。方法©️棚・余白珈琲を本館構造へ復帰。入口アプリ v0.4F / 装備庫 v2.3.6 を同期。旧 `app.js` を削除せず監査候補化。
- 2026-07-31: 旧同期版。
