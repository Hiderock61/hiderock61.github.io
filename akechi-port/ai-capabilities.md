# AKECHI PORT｜AI Capabilities v0.1

2026-09-17 時点の外付け能力スナップショット。正本は Notion「成果物047｜外付け能力棚・能力接続ランタイム」。

## 読み方

- `CONNECTED ≠ TOOL EXPOSED ≠ PROVEN`。接続済みだけでは実行可能とみなさない。
- PROVEN は実機で成功した能力。PARTIAL / HOLD / BLOCKED は制約棚。
- UNKNOWN は未証明であり、使えるとは推測しない。詳細は `capabilities.json` を参照。
- 送信・公開・購入・支払・削除・上書き・権限変更などは HUMAN GATE。

## スナップショット

- 能力レコード: 246
- プラグイン系統: 52
- PROVEN: 135
- PARTIAL: 9
- BLOCKED: 12
- HOLD: 4
- UNKNOWN: 86

## PROVEN｜動詞別能力棚

### 作る

- **Adobe Acrobat**｜Markdown/TextからPDFを作る。新規PDF生成成功
- **Amplitude**｜Amplitudeアカウントを作る
- **Canva**｜横長1ページ視覚成果物を作る。Design ID DAHVKED22io
- **Coda**｜新規Docを作る。実機試験#055｜CodaテストDoc
- **Figma / FigJam**｜構造を編集可能な図へ変換する。Diagram ID cc8f0e70-5476-4671-9ba9-5e096d3b2646
- **Flourish**｜編集可能な可視化プロジェクトを作る。Visualisation ID 30247659
- **Gmail**｜メール下書きを作る。draft_id r6666708913453960960
- **Jotform**｜会話要件から新規フォームを作る
- **Linear**｜Issueを作り実行待ちへ置く。HID-10をTodoで実作成
- **Lovable**｜新規プロジェクトを作る。Project ID e490e85c-956f-4500-9533-c963344d75c3
- **Lucid**｜図を作る
- **Miro**｜会話構造を図解キャンバスへ配置する
- **Miro**｜新規ボードを作る
- **Resume.io**｜構造化経歴から履歴書を生成する。Test Candidate preview
- **Tarot**｜質問に応じた3枚スプレッドを設計する
- **Xmind**｜文章構造からマインドマップを作る。file ID kiJcVpjh

### 保持する

- **Lucid**｜日本語データを保持する

### 修正する

- **Flourish**｜データ列バインドを修正する

### 入力する

- **TinyFish**｜フォームへテキスト入力する

### 再生する

- **Coursera Learning**｜チャット内で講義動画を再生する

### 実行する

- **Semrush**｜Semrush側へ実リクエストを到達させる

### 探す

- **Airtable**｜Airtable候補を発見する
- **Amplitude**｜Amplitude候補を発見する
- **Apple Music**｜特定アーティスト／曲を公式カタログから探す。Mötley Crüe / Primal Scream正式データ取得
- **Coda**｜Coda候補を発見する
- **Coda**｜Coda内検索を行う。results:[] / hasMore:false
- **Coursera Learning**｜学習テーマから関連講義動画を探す。Workflow Automation with Generative AI and Zapier
- **Exa**｜Exa候補を発見する
- **Exa**｜Web検索する
- **Firecrawl**｜Firecrawl候補を発見する
- **Flourish**｜可視化テンプレートを探す
- **Google Contacts**｜連絡先を検索する
- **Jotform**｜作成済みフォームを検索・再取得する
- **Mixpanel**｜Mixpanel候補を発見する
- **Plugin Management**｜不足能力からプラグイン候補を検索する。TABLEALLを発見
- **Plugin Management**｜未導入候補を発見する
- **Scite**｜Scite候補を発見する
- **Scite**｜論文を検索する
- **Semrush**｜Semrush候補を発見する
- **Slack**｜チャンネルIDを解決する
- **Stripe**｜Stripe APIを探す。List all products GET /v1/products
- **Supermetrics**｜Supermetrics候補を発見する
- **Supermetrics**｜フィールドを探索する
- **TABLEALL**｜日本のレストランを探す
- **Tavily AI**｜Tavily AI候補を発見する
- **Tavily AI**｜Web検索する
- **Windsor.ai**｜Windsor.ai候補を発見する

### 接続する

- **Airtable**｜Airtableへ接続する
- **Amplitude**｜Organization URL入力画面へ到達する
- **Apollo.io**｜Apollo.ioへ接続する
- **Coda**｜Codaへ接続する
- **Exa**｜Exaへ接続する
- **Firecrawl**｜Firecrawlへ接続する
- **Lucid**｜Lucidへ接続する
- **Manus**｜Manusへ接続する
- **Mixpanel**｜認証画面へ到達する
- **Plugin Management**｜接続候補を提示し人間操作で接続する 🚪 HUMAN GATE。TABLEALL installed:true
- **Railway**｜Railwayへ接続する
- **Resume.io**｜Resume.ioへ接続する
- **Scite**｜Sciteへ接続する
- **Semrush**｜Semrushへ接続する
- **Supermetrics**｜Supermetricsへ接続する
- **Systeme.io**｜Systeme.ioへ接続する
- **Tavily AI**｜Tavily AIへ接続する
- **Whimsical**｜接続フローを開始する
- **Windsor.ai**｜接続カードを提示する
- **WordPress.com**｜WordPress.comへ接続する。接続後補正で成功
- **monday.com**｜monday.comへ接続する
- **vidIQ**｜vidIQへ接続する

### 更新する

- **Flourish**｜小さいCSVデータを差し替える

### 確認する

- **Data**｜Dataプラグインが導入済みであることを確認する
- **Parallel Search**｜Directory上の存在と接続を確認する
- **TABLEALL**｜日付範囲でリアルタイム空席を確認する

### 編集する

- **Jotform**｜既存フォームの質問文を編集する
- **Miro**｜既存アイテムを編集する
- **Xmind**｜既存マインドマップを編集する

### 見る

- **Resume.io**｜テンプレートプレビューを表示する

### 認識する

- **TinyFish**｜画面要素を認識する

### 読む

- **Airtable**｜base一覧を読む。base 0件
- **Airtable**｜workspace一覧を読む
- **Apollo.io**｜接続アカウント情報を読む
- **Coda**｜ワークスペースへ実アクセスする
- **Coda**｜作成済みDocを再読取する
- **Exa**｜指定URL本文を取得する
- **Exa**｜検索結果Highlightsを取得する
- **Firecrawl**｜main contentをMarkdown化する
- **Firecrawl**｜公開URLをscrapeする。HTTP 200 / Example Domain
- **Flourish**｜編集可能な実体として再取得する
- **GitHub**｜リポジトリ情報を読む。Hiderock61/hiderock-method-os
- **GitHub**｜既存ファイルをbranchから読む。BONSAI_START_HERE.mdをmainから読込
- **Google Calendar**｜空き時間を読む。2026-09-15 busy window 0件
- **Google Contacts**｜Googleアカウントプロフィールを読む
- **Jotform**｜編集後の状態を再読取して確認する
- **Lucid**｜図実体を読み取る
- **Miro**｜作成済みボードを読み返す
- **OpenAI Platform**｜Organization / Projectを読む。Organization Personal / Default project
- **PostHog**｜PostHogプロジェクトを読む
- **PostHog**｜イベント／データスキーマを読む
- **PostHog**｜ダッシュボードを読む
- **Railway**｜Workspaceを読む
- **Railway**｜プロジェクト一覧を読む。[]
- **Scite**｜citation contextを読む
- **Scite**｜full-text excerptを取得する
- **Scite**｜論文メタデータを読む
- **Slack**｜公開チャンネル一覧を読む
- **Slack**｜指定チャンネルのメッセージを読む
- **Stripe**｜商品一覧をGETで読む。0 products, has_more=false
- **Supermetrics**｜データソース一覧を取得する。172種類
- **Supermetrics**｜認証不要データを取得する。Apple Music Top Songs上位5件
- **Systeme.io**｜ファネル一覧を読む。items:[] / hasMore:false
- **TinyFish**｜公開URLを読む
- **WordPress.com**｜アクセス可能サイト一覧を読む。既存サイト0件
- **Xmind**｜既存マインドマップを読む
- **monday.com**｜ユーザー・アカウントを読む
- **monday.com**｜ワークスペース一覧を読む
- **vidIQ**｜vidIQアカウント情報を読む。150 credits / 所有チャンネル0
- **vidIQ**｜公開YouTubeチャンネル統計を読む。HideRockJapan基本統計取得

### 調査する

- **Acumen by Talarion**｜最近の変化を拾い調査候補を作る。日付付き・出典付き候補を複数取得

### 起動する

- **Ask Tarot Cards**｜タロット読解UIを起動する
- **Tarot**｜カード選択UIを起動する

### 開く

- **TinyFish**｜ライブブラウザでページを開く。課金あり

### 露出する

- **Airtable**｜専用ツールを露出する
- **Apollo.io**｜実行ツールを露出する。46 tools
- **Coda**｜専用ツールを露出する。33系統
- **Exa**｜専用ツールを露出する
- **Firecrawl**｜専用ツールを露出する
- **Manus**｜5種類の委任ツールを露出する。Web/Webアプリ、mobile、slides、video、research
- **OpenAI Platform**｜実行ツールを露出する
- **Scite**｜専用ツールを露出する
- **Semrush**｜専用ツールを露出する
- **Supermetrics**｜専用ツールを露出する
- **Systeme.io**｜実行ツールを露出する。118 tools
- **Tavily AI**｜専用ツールを露出する
- **monday.com**｜専用ツールを露出する
- **vidIQ**｜専用ツールを露出する

## 制約・診断棚

### PARTIAL

- **Acumen by Talarion**｜確定する｜出力だけで最終事実を確定する。出典品質が混在し単独確定不可
- **Data**｜露出する｜Data専用実行ツールを確定する。別プラグイン群ツールが返り実行面未確定
- **Figma / FigJam**｜使う｜iPhone上でその場で理解・利用できる図にする。図は生成できたがiPhone上の視認性不足
- **Google Contacts**｜読む｜検索結果IDから連絡先詳細を読む。otherContacts/...→read_contactで404
- **Lovable**｜作る｜指定UIを初回生成で実装する。プロジェクト作成成功、指定UIは未完成
- **Lucid**｜使う｜利用環境で見やすく使える図にする
- **OpenAI Platform**｜作る｜APIキー作成フローへ到達する 🚪 HUMAN GATE。作成フロー到達済み
- **TABLEALL**｜露出する｜接続直後の同一ターンで実行ツールを露出する。接続直後は未露出
- **Xmind**｜変更する｜編集時にレイアウト種別を変更する。この版では非対応

### HOLD

- **Ask Tarot Cards**｜選ぶ｜カードを選択する 🚪 HUMAN GATE
- **Canva**｜検査する｜小表示で仕様適合を受入確認する。現行版は指定文字のみ確認済みだが小表示可読性が未閉鎖
- **Tarot**｜選ぶ｜カードを選択する 🚪 HUMAN GATE
- **Uber Eats**｜探す｜配達可能な店・料理候補を探す 🚪 HUMAN GATE。本人が明示した配達住所が必要

### BLOCKED

- **Elicit**｜調査する｜学術検索を実行する。APIアクセス権限がなく検索実行不可
- **Hunter**｜接続する｜Hunterへ接続する。アカウント作成・ログイン段階で停止
- **Lovable**｜更新する｜既存プロジェクトを修正する 🚪 HUMAN GATE。projects:write Scope不足
- **Mixpanel**｜接続する｜接続を完了する。OrganizationでMCP access未有効
- **OpenTable**｜露出する｜実行ツールを露出する。名前空間は見えるがツール0件、Directory実体なし
- **Parallel Search**｜露出する｜実行ツールを会話へ露出する
- **Semrush**｜読む｜SEO・トラフィック・競合データを読む。API units不足
- **Stripe**｜読む｜専用ツールでアカウント情報を取得する。Unknown tool
- **Tavily AI**｜読む｜URL本文を抽出する。monthly keyless limit
- **Whimsical**｜読む｜共有可能Workspaceを取得する。This user has no workspaces available to share.
- **Windsor.ai**｜接続する｜接続を完了する。接続UI／接続フローで停止
- **vidIQ**｜読む｜所有チャンネル向け非公開Analyticsを読む。所有チャンネル認証0件

## UNKNOWN

86件は未証明のため、この簡易版では列挙しない。AIが割当判断をする時は `capabilities.json` の UNKNOWN を候補扱いせず、必要なら最小実機試験へ送る。

## 雪だるま回路

仕事発生 → 実行動詞へ分解 → 現在能力と照合 → PROVENを使用 → 不足能力を探索・最小実機試験 → Notion正本へ証拠追加 → `capabilities.json` 再生成 → Web再生成
