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

GitHubアカウント全体を棚卸ししたところ、独立リポジトリ `Hiderock61/hiderock-method-os` を再発見。

READMEでは、このリポジトリを「ヒデロック発明OS©️」とし、方法©️を保存し別AIでも再実行するための方法コレクションとして定義していた。

### 再整理

- Notion = 運用正本
- `hiderock-method-os` = 方法©️GitHub設計図ホーム
- 本館 `/methods/` = 複数のGitHub正本へ接続する公開総合索引

本館側独立正本:

- ROU-DOU編集方法©️ v1.0
- 痕跡逆算発掘法©️ v1.0

方法OS側接続: 14本

当時の結果:

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

現役リポジトリ `Hiderock61/migakisha-cleaning-portfolio` を発見。
修正前版・修正後版を比較でき、GitHub Pagesも built / public だった。

### 判定

`現役ポートフォリオ → 本館未掲載 → 復帰対象`

### 施工

- 本館トップ復帰: `df10375acc4e540ff66fa739d80ca4f5bee9d7c7`
- README同期: `2531bb82767b54f0c927218e76f5c2d2dab84f78`
- APP_MAP v1.1: `595aa8dd15ea38bf10d50bc4191e32966aa506d2`
- PROJECT_CARD v2.3同期: `8b3b96dd2862cecd0bb9a76045b274cd0ac77d6e`

---

## 2026-08-13｜GitHub archive状態と本館棚を同期

### 監査結果

GitHub現役（archived=false）:

- `new-kit-gaw`
- `ashiato`
- `genshoka-os`
- `houmon-torisetsu`

GitHub archive済み（archived=true）:

- `kit-gaw`
- `yuueki`
- `sento-qr-ticket-demo`

例外:

- `hiderokusuke-remocon` は archived=false
- ただし現在の代表入口ではなく個人用旧版なので、本館では歴史参照棚へ置く

### 新しい分類ルール

- **🔒 GitHub archive済み** = repo自身が `archived=true`
- **📦 本館上の歴史参照** = 今の主役ではない旧版・過去系統。repoは `archived=false` の場合もある

本館の棚整理だけを理由に、GitHub repoそのものをarchive / unarchiveしない。

### 施工

- README同期: `82d9e8e0fb660b559a2f7278afbf630fe542bbf5`
- APP_MAP v1.2: `e22e82c4a4ac1168c2b03880e1f5f5ce8db634eb`
- PROJECT_CARD v2.4同期: `56a8354d59c576f5850932890f2c3358356c79d1`
- 本館トップ v2.4: `7de8c15d89bf03584f7d54c8dcf6e9ed00d078c4`

---

## 2026-08-13｜現役repo全数・本館未掲載監査

### 母集団

Hiderock61配下で確認できたrepoは **19本**。

- GitHub archive済み: 4本
- `hiderock61.github.io` 本館自身: 1本
- 本館外の現役repo: **14本**

### 結果

本館外の現役repo 14本は、すべて既に本館のいずれかへ接続済み。

**GitHubでは現役だが本館に完全未掲載のrepoは0本。**

旧重複repo `Hiderock61/-migakisha-cleaning-portfolio` は archived=true / size=0。現役のみがき舎が別に存在するため本館公開不要と判定し、削除やunarchiveは行わない。

PROJECT_CARD更新:

`1c7ad120f7ff16fd10ba3e76d741a509972573d6`

---

## 2026-08-13｜ヤスリ施工©️を正本化・方法棚を17/17へ

### 監査

本館方法©️棚では最後の未接続が `ヤスリ施工` 1本だった。

Notion方法コレクションDBを確認したところ、独立した「ヤスリ施工©️」札はまだ存在していなかった。一方、既存の作業地層には同じ構造が繰り返し残っていた。

- 高校MTR期: 知識が全部揃う前にまず録る → 変な所を見つける → 直す
- 入口→装備庫: 既存コピー＆ペースト方式を維持し、着地点だけを必要最小限修正
- 入口アプリ v0.4F: 既存の人間語UX・内部カード形式を維持し、本文抽出と重複質問だけを修正

### 判定

`実運用済みの反復構造 → 方法名あり → 独立正本札だけ欠落`

AIの記憶だけで新発明したものではなく、既存運用を方法©️登録プロトコルに沿って正本化できる状態と判定。

### 施工

- Notion方法コレクションDBへ **ヤスリ施工©️** を運用中 / 公開安全として登録
- GitHub方法OSへ `methods/015_yasuri-sekou-method.md` を追加
- 方法OS README / METHOD_HOMEへ015を登録
- 本館方法©️棚を v0.5へ更新
- 本館棚台帳を17 / 17 / 0へ更新

関連コミット:

- 方法OS 015新設: `a08fdecceb0caf7b505e48fc824c4fe01d896c8c`
- 方法OS README: `7864785fabba718e644e1b06cd9f109b048593a9`
- METHOD_HOME: `5a93e58ce6082da896c9057c6c473ed27e67d2a9`
- 本館 methods/index v0.5: `5f0703e9ec8c3cd768ba1003a58ef3bc6d370062`
- 本館 methods/README: `fee68f567a00a6b21a7aca9e1355db7b7dd867bc`

結果:

**棚登録17 / GitHub正本17 / 未接続0**

---

## 2026-08-13｜note公開棚を再監査・主要リンクを接続

### 発掘

本館の読む作品・研究には、カテゴリ名はあるが専用URLが曖昧な棚が残っていた。

公開note側を再監査し、以下の実在マガジンを確認した。

- `あるAIの困惑ログシーリズ`
- `ラジオドラマ📻創世期`
- `AIの話マガジン`
- `科学するシリーズ`

### 再整理

- **あるAIの困惑ログ** → 専用マガジンへ直接接続
- **ラジオドラマ・寸劇** → `ラジオドラマ📻創世期` へ接続
- 曖昧な **コラム** → 実在する `AIの話マガジン` を **AI・思考コラム** として接続
- **ヒデロツク理論研究室** → `科学するシリーズ` を「公開研究の一部」として接続

### 境界

`科学するシリーズ` は理論研究室全体の公開正本とは扱わない。

**研究室全体を束ねる専用公開URLは今回も未確認。**
専用公開先が作成・発見された時だけ、本館の研究室導線を置き換える。

### 施工

- 本館トップ v2.6: `99e266ef61e23cee9a7f34e79e76356ce0f95840`
- README同期: `7c673f2607ae45e73daba096cf7657947d5db360`
- APP_MAP v1.3: `6b96c070c649c3fe36c22b53a2e9622da8614ea0`
- PROJECT_CARD同期: `25001eeff5389d448501525f0e37a98d3f4de1ee`

---

## 整備ログ運用ルール

- PROJECT_CARDには現在地だけを書く
- 完了した掃除・監査・削除理由はここへ移す
- 削除したものは「何だったか / なぜ消したか / 正本はどこか」を残す
- 一時的な細かい施工メモは残しすぎない
- 現在の公開構造が変わった時は README / APP_MAP / PROJECT_CARD を同期する
- 方法©️の未接続を見つけたら、先にNotion・`hiderock-method-os`・本館methodsを確認する
- 本館アーカイブとGitHub archivedフラグを同一視しない
- 現役repo全数監査はrepo構成に変化があった時だけ再実行する
- 外部公開リンクは検索・実在確認後に接続し、似たシリーズを正本扱いしない
