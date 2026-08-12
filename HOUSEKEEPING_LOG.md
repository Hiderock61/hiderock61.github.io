# HOUSEKEEPING_LOG｜HIDEROTSUKE 本館整備ログ

本館の掃除・監査・棚替えの履歴を残す場所。

`PROJECT_CARD.md` は現在地だけを持ち、このファイルは「なぜ変えたか」「何を消したか」「どのコミットで行ったか」を残す。

---

## 2026-08-12｜本館棚整理

### 実施

- 本館トップを用途別の7棚へ整理
  - 🚪 まず見る
  - 🔧 仕事・AI道具
  - 🖥️ Web制作ポートフォリオ
  - ©️ 方法©️棚
  - 📻 読む作品・番組
  - 🧪 研究・実験
  - 🗄️ アーカイブ
- README / APP_MAP / PROJECT_CARD を現在地へ同期
- 本館トップへ `methods/` の入口を追加
- `yohaku-coffee/` をWeb制作ポートフォリオへ復帰
- フリーランス制作工程を入口アプリ v0.4F / 装備庫 v2.3.6 として同期
- New Kit Gaw を代表入口から研究・実験棚へ戻した

### 方針

- 既存公開URLを壊す移動はしない
- 未接続ファイルは即削除せず、先に由来を監査する
- 公開トップ / README / APP_MAP / PROJECT_CARD の役割を分離して同期する

---

## 2026-08-12｜ルート `app.js` 孤児コード監査

### 発見

本館ルート直下に、現在の `index.html` から読み込まれていない `app.js` が残っていた。

### 由来判定

`Hiderock61/ashiato` の「あしあと仲人©️ v0.4J前後」のSNS模型コードが、本館ルートへ重複混入した作業コピーと判定。

根拠:

- `ashiato` 側で 2026-07-06 に「あしあと仲人©️ v0.4J」が存在
- 同系統に `showScreen()`、表札街、コミュニティ、住人、立ち話、治安ゲート、おばちゃん仲介がある
- 本館側の旧 `app.js` にも同じ構造・ダミーデータが存在
- `ashiato` 側の更新から約14分後に本館へ単独アップロードされていた
- 当時の本館 `index.html` からも、現在の `index.html` からも未接続
- 正本系統は `Hiderock61/ashiato` に残っている

### 処理

分類:

`重複混入ファイル → 削除候補A → 監査後削除`

削除コミット:

`70b12f76412a2b3a47065d5fa0bdb4e7e6e206bb`

正本 `Hiderock61/ashiato` は変更していない。

---

## 2026-08-12｜説明書再同期

### README

- 「まず見る」を公開トップと一致させた
  - AIリモコン
  - フリーランス制作工程
  - 方法©️棚
- New Kit Gaw を研究・実験棚へ整理
- 削除済み `app.js` の現役説明を撤去

コミット:

`a367e23f851fb0afffde67fac9828ae4b7aa7f9a`

### APP_MAP

- v0.8へ更新
- 代表入口を公開トップと同期
- New Kit Gaw をSNS研究系へ配置
- 削除済み `app.js` を物理配置から撤去

コミット:

`6ac78e99477ea72c5e903bd2ae8776961303f393`

---

## 2026-08-12｜方法©️棚 整備状況表示

方法©️棚を v0.3 へ更新。

当時の見え方:

- 棚登録: 15
- GitHub正本あり: 2
- GitHub正本未接続: 13

GitHub正本ありとして確認できていたもの:

- ROU-DOU編集方法©️ v1.0
- 痕跡逆算発掘法©️ v1.0

後続監査で `Hiderock61/hiderock-method-os` が再発見され、この「未接続13」は大幅に修正された。現在地は後段の「方法OS統合」を参照。

コミット:

`e03ff33d18e4990a7cdf535dba5e93572afa25e0`

---

## 2026-08-12｜現在地と工事履歴を分離

`PROJECT_CARD.md` が、現在地カードと過去の工事日誌を兼ね始めて長くなっていたため分離した。

### 新設

- `HOUSEKEEPING_LOG.md` — 掃除・監査・削除・棚替えの履歴

### 役割変更

- `PROJECT_CARD.md` — 現在地・役割・施工境界だけ
- `README.md` — 人間向け全体説明
- `APP_MAP.md` — AI・施工向け現在地地図
- `HOUSEKEEPING_LOG.md` — 過去の工事理由と証拠

関連コミット:

- 整備ログ新設: `bded5a48cb5e8a29ce96cce525f230adc5311bed`
- PROJECT_CARD軽量化: `943c4d546336b2b48bd7dc8b6c79b10fc74d7a17`
- README同期: `7be2c981443196ac7fe877ff7c72998afb241045`
- APP_MAP v0.9: `5596d57160ef716437e283193e220078591e2af2`

---

## 2026-08-12｜方法©️ GitHub棚台帳を新設

`methods/` をGitHub上で直接開いても全体像が分かるよう、`methods/README.md` を追加。

初版台帳には次を掲載:

- 当時棚に見えていた15方法©️のカテゴリ別一覧
- GitHub正本あり2本
- GitHub正本未接続13本
- 状態表示の意味
- 正本化する時の最低項目
- 「方法©️見て」時の正本確認ルール

コミット:

`8cc1247f61245780633e075274cb0b653532bbe7`

---

## 2026-08-12｜みず番 旧SVG画像を整理

### 発見

`mizuban/assets/` に次のJPEG / SVGペアが残っていた。

- `hero.jpg` / `hero.svg`
- `explain.jpg` / `explain.svg`
- `work.jpg` / `work.svg`

### 監査

現役の `mizuban/index.html` はJPEGを直接使用。

- `hero.jpg`
- `explain.jpg`
- `work.jpg`

`case-study.html` にも、iPhoneでSVG内ラスターの粗さを発見し「元JPEGを直接扱う方針へ修正した」と制作履歴が残っている。

`case-study.css` に旧SVG参照はない。

### 判定

旧SVG3枚は、画質改善前の画像工程で残った未使用資産。

分類:

`旧工程資産 → 孤児候補 → 現役JPEG確認後削除`

### 削除

- `hero.svg` — `f00ac187c50052c7f82be5c310fa25ec666b70c4`
- `explain.svg` — `4f19c8c66753aa5cebc552b06037d6751aba4e37`
- `work.svg` — `b44ed814a04afffc59d4953b4abc008f631f1b2f`

現役JPEG3枚は保持。

---

## 2026-08-12｜方法OS再発見・正本統合

### 発見

GitHubアカウント全体を棚卸ししたところ、独立リポジトリ

`Hiderock61/hiderock-method-os`

を再発見。

READMEでは、このリポジトリを「ヒデロック発明OS©️」とし、方法©️を保存し別AIでも再実行するための方法コレクションとして定義していた。

役割も明記済みだった。

- Notion: 正本・生きている操作基地
- GitHub: 公開可能な方法©️ホーム兼、別AIへ渡す設計図

### 中身

方法OSには番号付き方法©️が14本あり、本館棚で「GitHub未接続」と見えていた方法の大半が既に正本化されていた。

本館棚と一致する正本:

- 001 自分史Notion法©️
- 002 オープンレイヤー自分史法©️
- 003 逆読みGo注釈法©️
- 004 社会的レイヤー札化方法©️
- 005 上下俯瞰法©️
- 006 ヒデロツク劇団方法©️（BONSAI©️）
- 007 明智工務店施工依頼書法©️
- 009 Notion正本防衛法©️
- 011 編集室発掘・作品札化法©️
- 012 坂読み分岐法©️
- 013 ヒデロック多層世界地図©️
- 014 武術テンプレ法©️

さらに本館棚へ未掲載だった次の2本も確認。

- 008 Cozzy Key🔑
- 010 方法©️登録プロトコル

### 再整理

本館 `/methods/` の役割を「本館内だけの正本置場」から **公開総合索引** へ修正。

役割分担:

- Notion = 運用正本
- `hiderock-method-os` = 方法©️GitHub設計図ホーム
- 本館 `/methods/` = 複数のGitHub正本へ接続する公開総合索引

本館側独立正本:

- ROU-DOU編集方法©️ v1.0
- 痕跡逆算発掘法©️ v1.0

方法OS側接続: 14本

結果:

- 棚登録: **17**
- GitHub正本あり: **16**
- GitHub正本未接続: **1**
- 未接続: **ヤスリ施工**

### 施工

- 方法©️棚 v0.4: `147a3d4dbd17f0dd7b8b53bc576aece07747060d`
- methods/README同期: `8c8a530c9a40c6ee9497ce21975f9645cd73bf37`
- 本館README同期: `e1acea28f896cbbdd7dd3587f082ae8c1b0efd1a`
- APP_MAP v1.0: `b1d25681899d5eb7a2a25352b1e3b42691836144`
- PROJECT_CARD同期: `039a49ff72970e525cfd2ab445e8b5f672f5519f`

---

## 2026-08-12｜みがき舎をWeb制作棚へ復帰

### 発見

GitHubアカウント全体の棚卸しで、現役リポジトリ

`Hiderock61/migakisha-cleaning-portfolio`

を発見。

中身は「杉並ハウスクリーニング みがき舎」の架空Web制作ポートフォリオで、修正前版・修正後版を比較できる構成。

GitHub Pages APIでも以下を確認。

- status: built
- public: true
- source: main / root
- Pages: `https://hiderock61.github.io/migakisha-cleaning-portfolio/`

### 判定

現役かつ公開済みなのに、本館Web制作ポートフォリオ棚から抜けていた。

分類:

`現役ポートフォリオ → 本館未掲載 → 復帰対象`

### 施工

本館トップへ「みがき舎｜ハウスクリーニングサイト改善事例」を追加。

接続:

- 修正後版
- 修正前版

本館トップを v2.3 へ更新。

関連コミット:

- 本館トップ復帰: `df10375acc4e540ff66fa739d80ca4f5bee9d7c7`
- README同期: `2531bb82767b54f0c927218e76f5c2d2dab84f78`
- APP_MAP v1.1: `595aa8dd15ea38bf10d50bc4191e32966aa506d2`
- PROJECT_CARD v2.3同期: `8b3b96dd2862cecd0bb9a76045b274cd0ac77d6e`

---

## 整備ログ運用ルール

- PROJECT_CARDには現在地だけを書く
- 完了した掃除・監査・削除理由はここへ移す
- 削除したものは「何だったか / なぜ消したか / 正本はどこか」を残す
- 一時的な細かい施工メモは残しすぎない
- 現在の公開構造が変わった時は README / APP_MAP / PROJECT_CARD を同期する
- 方法©️の未接続を見つけたら、先に `hiderock-method-os` を含む既存正本を探す
