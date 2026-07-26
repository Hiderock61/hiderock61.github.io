# APP_MAP v0.5

このファイルは、Hiderock61 の公開リポジトリ群を「何の箱か」で整理するためのアプリ地図です。

最終確認日: 2026-07-26

## v0.5 更新内容

2026-07-26 GitHub棚卸し完了報告時点での再整理。

完了したこと:

- 本館（hiderock61.github.io）の README.md を「何のアプリがどこにあるか」が初見でも分かる目次へ改訂
- 正式プロジェクト（本命・実験・旧研究箱）を全て GitHub Pages で確認完了
- new-kit-gaw（最新系統）と kit-gaw（旧系統）の役割分けを明確化
- ashiato を旧研究箱として正式地図に復帰させる
- 本館 index.html に正式プロジェクトのアプリ一覧を「何ができるか」と共に追加
- index.html からは Feeee、hideki-Hiderock-、freelance を除外

現在の構成:

```text
🟢 本命（整備・公開優先）:
  - new-kit-gaw        = 最新系統の探索模型SPA
  - kit-gaw            = 旧系統 v0.8α-2（歴史参照用）
  - ai-remocon         = AIリモコン
  - akechi-os          = 明智君OS
  - hiderock-tam       = ヒデロックテンプレ法©️
  - anken-jirai-map    = 地雷地図（正式箱）
  - freelance-         = フリーランス装備庫（正式箱）

🟡 実験プロトタイプ（デモ・検証目的）:
  - yuueki             = YUUEKi.com
  - genshoka-os        = 現象化OS Core β
  - houmon-torisetsu   = 訪問前トリセツ（架空データ）
  - sento-qr-ticket-demo = 銭湯QR券売機デモ
  - hiderokusuke-remocon = 旧個人リモコン

旧研究箱（保留・参考目的）:
  - ashiato            = あしあと仲人©️（紹介制SNS模型）

🔴 削除候補（本館一覧から除外）:
  - Feeee              = 地雷地図重複候補
  - hideki-Hiderock-   = 空箱候補
  - freelance          = 地雷地図重複候補
```

---

## この地図の目的

* リポジトリが増えても迷子にならないようにする
* 同じ中身の重複箱を見つける
* 本命、実験、保留、重複候補、削除候補を分ける
* いきなり削除や改名をせず、まず札を貼る
* GitHub Pages の公開導線を整理する

## 状態ラベル

* 🟢 本命: 公開・運用候補として整える箱
* 🟡 実験: プロトタイプ、検証用、まだ実運用しない箱
* 🔵 旧研究箱: 保留中だが参考・歴史的価値ありの箱
* 🟠 重複候補: 中身が別リポジトリと被っている可能性が高い箱
* 🔴 削除/アーカイブ候補: 空箱または役割が薄い箱。すぐ消さず確認後に判断

---

## 🟢 本命（公開・整備優先）

### Hiderock61/new-kit-gaw

* 何の箱: 最新系統の探索模型 SPA
* 役割: コミュニティ → 話題 → 発言 → プロフィール → 別コミュニティ → 足あと までの静的SPA体験
* 状態: 最新系統として整備中
* GitHub Pages: https://hiderock61.github.io/new-kit-gaw/
* 注意: 静的プロトタイプ。ログイン、保存、リアルタイム同期は未実装

### Hiderock61/kit-gaw

* 何の箱: 旧系統 v0.8α-2 の探索模型（歴史参照用）
* 役割: 旧来の盤・部屋・問い・プロフィール構造を保存。new-kit-gaw と混ぜず参照用として残す
* 状態: 旧版として保管
* GitHub Pages: https://hiderock61.github.io/kit-gaw/
* 注意: 設計が古いため、新規プロジェクトの参考にはしない

### Hiderock61/ai-remocon

* 何の箱: AIリモコン
* 役割: ChatGPT、Gemini、Copilot、Claude などに貼る「最初の一文」をワンタップで生成する
* 状態: 公開候補として完成度高め
* GitHub Pages: https://hiderock61.github.io/ai-remocon/
* 用途: 埋め込み・外部貼付用の文章生成ツール

### Hiderock61/akechi-os

* 何の箱: 明智君OS
* 役割: 起動・一手・退避・帰還 の 4 ボタンで、AI とのやり取りを再開・整理する小さなリモコン
* 状態: 公開候補として完成度高め
* GitHub Pages: https://hiderock61.github.io/akechi-os/
* 注意: PWA 要素検討中

### Hiderock61/hiderock-tam

* 何の箱: ヒデロックテンプレ法©️
* 役割: 素材 → 違和感 → 体感 → 創作ネタ → 仕事判断 を工程化する本人用台帳
* 状態: 本人用の本命。外向き一般化は後でよい
* GitHub Pages: https://hiderock61.github.io/hiderock-tam/
* 用途: 人生と仕事を扱える工程へのテンプレ法

### Hiderock61/anken-jirai-map

* 何の箱: AI副業・案件地雷地図（正式箱）
* 役割: 募集文や案件文を貼り、「何の入口か」を赤札で判定するマッピングツール
* 状態: 地雷地図の正式リポジトリ
* GitHub Pages: https://hiderock61.github.io/anken-jirai-map/
* 用途: 仕事の入口判定・安全チ��ック用

### Hiderock61/freelance-

* 何の箱: フリーランス装備庫（正式箱）
* 役割: iPhone だけで学習・作業を体感する装備庫。見学・共有・装備・今日・納品・監督を学ぶ学習アプリ
* 状態: 復旧済み。入口は装備庫に戻した
* GitHub Pages: https://hiderock61.github.io/freelance-/
* 注意: `app.js` は残骸として残るが、入口では読まない

---

## 🟡 実験プロトタイプ（デモ・検証目的）

以下は実運用を前提としないプロトタイプです。ログイン・保存・本番決済などの実運用機能は未実装。

### Hiderock61/yuueki

* 何の箱: YUUEKi.com
* 役割: ガイド付きのUI模型。一対一ルーム、介入度、境界線などの設計を試す
* 状態: 実験プロトタイプ
* GitHub Pages: https://hiderock61.github.io/yuueki/
* 注意: 年齢確認・異性紹介事業などの法務は未実装。実運用前提ではありません

### Hiderock61/genshoka-os

* 何の箱: 現象化OS Core β
* 役割: 日常語を I/M/S/F/E/T の 6 レイヤーで観測する仮説実験ツール
* 状態: 実験プロトタイプ
* GitHub Pages: https://hiderock61.github.io/genshoka-os/
* 用途: 日常の現象を分層観測する検証用ツール

### Hiderock61/houmon-torisetsu

* 何の箱: 訪問前トリセツ
* 役割: 訪問看護・訪問介護スタッフ向けの訪問前メモデモ
* 状態: 実験プロトタイプ
* GitHub Pages: https://hiderock61.github.io/houmon-torisetsu/
* 注意: 架空データのみ。電子カルテではなく、医療判断・介護判断の代替ではありません

### Hiderock61/sento-qr-ticket-demo

* 何の箱: 銭湯QRスマホ券売機デモ
* 役割: QRからスマホで入浴券・サウナ・ドリンクなどを選ぶUI試作
* 状態: ポートフォリオ用の実験寄り
* GitHub Pages: https://hiderock61.github.io/sento-qr-ticket-demo/
* 注意: 本番決済なし。Square、Stripe、PayPay などの決済接続は未実装

### Hiderock61/hiderokusuke-remocon

* 何の箱: 旧個人リモコン v0.2
* 役割: ひでGPT、明智君、体感、現実君などの役割へ戻るための個人 cockpit
* 状態: 旧版または個人用実験。ai-remocon とは設計を分けて残す
* GitHub Pages: https://hiderock61.github.io/hiderokusuke-remocon/
* 注意: AIリモコンとは異なる旧版。混同しないこと

---

## 🔵 旧研究箱（保留・参考目的）

### Hiderock61/ashiato

* 何の箱: あしあと仲人©️
* 役割: コミュニティから人と��りを見る、紹介制SNSの静的UI模型
* 状態: YUUEKi 系の別実験・旧研究箱
* GitHub Pages: https://hiderock61.github.io/ashiato/
* 注意: ログイン、会員登録、保存、DM、本人確認、外部API はありません。UI探索用モデル

---

## 🟠 重複候補

### Hiderock61/freelance

* 何の箱: 地雷地図の重複候補
* 現在の中身: anken-jirai-map と同じ内容に見える
* 状態: 重複候補確認済み
* 判定: 正式箱にはしない。本館からリンクしない
* 処理: すぐ削除せず、Archive または削除は参照確認後に判断

### Hiderock61/Feeee

* 何の箱: 地雷地図の重複候補
* 現在の中身: anken-jirai-map と同じ内容に見える
* 状態: 重複候補確認済み
* 判定: 正式箱にはしない。本館からリンクしない
* 処理: すぐ削除せず、Archive または削除は参照確認後に判断

---

## ⚫ 削除/アーカイブ候補

### Hiderock61/hideki-Hiderock-

* 何の箱: 空箱候補
* 現在の中身: README だけの最小リポジトリ
* 状態: 空箱確認済み
* 判定: 削除または Archive 候補
* 処理: すぐ削除せず、ほかの箱から参照されていないか確認してから判断

---

## 運用ルール

### 新規追加時

- Pages URL の実在確認を済ませてから APP_MAP.md に追加
- README なしに新規箱は本館からリンクしない
- 何ができるか（用途・役割）を短く具体的に記述する

### 本館との同期

- README.md = 公開用の親目次（初見向け）
- APP_MAP.md = 内部管理用の詳細地図（開発向け）
- index.html = 正式プロジェクトのアプリ一覧（UI導線）

これら 3 つは定期的に確認し、ズレがあれば同期させる。

### 本館からリンクするプロジェクトの条件

1. GitHub Pages URL が実在することを確認済み
2. README.md が整備されている
3. 削除・Archive・重複候補ではない
4. 何ができるか（具体的な用途）が記述できる

### 削除・改名・除外について

- いきなり削除しない。まず札を貼る
- 重複候補は、正式版確認前に削除しない
- 医療・介護・出会い系プロトタイプは「実運用ではない」ことを明記

---

## 保存メモ

GitHub棚卸し方法©️:

> まず地図を直す。
> 次に札を貼る。
> そのあと中身を直す。
> 削除は最後。

v0.5 時点での完成度:

- 本命プロジェクト：7 件（new-kit-gaw、kit-gaw、ai-remocon、akechi-os、hiderock-tam、anken-jirai-map、freelance-）
- 実験プロトタイプ：5 件（yuueki、genshoka-os、houmon-torisetsu、sento-qr-ticket-demo、hiderokusuke-remocon）
- 旧研究箱：1 件（ashiato）
- 重複候補：2 件（freelance、Feeee）
- 削除候補：1 件（hideki-Hiderock-）

所有リポジトリ総数：17 件（削除なし、改名なし）
