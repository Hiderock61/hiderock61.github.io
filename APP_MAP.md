# APP_MAP v2.8

Hiderock61 の公開活動を、AIや施工側が短時間で把握するための地図。

最終確認日: 2026-09-30（アプリ導線を同期。その他の棚は既存記録を維持）

更新: 2026-11-01（無料ブラウザアプリ改修と公開境界の追加記録）

## 2026-11-01｜無料β配布前・2アプリ判定安全性修理（本ルーム）

- 入口 app.js / index.html と装備庫 script.js / index.html をGitHubのmainへ保存。入口の版識別子 `04g-beta-safe1101a`、装備庫 `2315-beta-safe1101a`。旧版を壊さず、実案件の自動送信や自動納品は追加しない。
- 見つかった再現バグ：「修正しない」「納品ファイルは未定」「検査しない」「確認できない」でも、単語検出だけで制作可能と判定する場合があった。入口の制作可否判定に未確定・否定表現のHOLDを追加し、装備庫の受入ゲートにも同等の再検査を実装。
- 第三者向け初期値：入口STEP3で従来HTML/CSSなど一律「納品可能」だった固定値を廃止し、全技術「未判定」から始める。本人の選択を端末のローカルストレージへ保存し、初期設定へ戻せる。
- 入力欄近くに「この端末の募集メモ・技術設定を削除」ボタンを新設。本人の確認後、当該2つの保存キーのみ削除。他アプリの端末データは変更しない。
- 静的ソース再読・JS構文・単体判定PASS。テストでは正常制作可能、未許可HOLD、未定HOLD、検査しないHOLD、装備庫再検査PASS。一般的な自然言語の意味解析や契約の実証はできないことを明示。
- [公開ソース検収器](https://hiderock61.github.io/tools/app-release-check/) の期待版と安全チェックを更新。GitHub PagesのLIVE HTTP・iPhone上でのコピー・画面切替・端末保存の実操作はHOLD、第三者向け正式告知はHOLD。
- Beta入口 [無料β体験](https://hiderock61.github.io/free-tools/freelance-beta/) ／ [入口](https://hiderock61.github.io/anken-jirai-map/) ／ [装備庫](https://hiderock61.github.io/freelance-/#card-intake)。
- Work・TinyFishは今回未使用。

---

## 2026-11-01｜架空の依頼文から始まらない再発：読書画面と結果画面を分離

- **本人iPhoneの再観測**：STEP5のスクリーンショットでは、画面上端に依頼文の「3,000円ほど、納期は相談です」がある一方、画面の中心は「カード状態」「入口タイプ・到達判定」。先行版の原文はSTEP5内にあり、スクロールで結果へ進む構造のため、読まないうちに結果が見える問題が残っていた。
- **構造を変更**：[入口アプリ](https://hiderock61.github.io/anken-jirai-map/) の `#practiceOriginal` をSTEP5の内側から外し、初回ボタンの直下へ配置。練習開始時は `data-practice-phase=read` を設定し、CSSで検索タブ／分析タブの両方を隠す。結果は原文カード内の「依頼文を読んだ → 整理結果を見る」を押すまで表示されない。STEP5には「← 架空の依頼文をもう一度読む」を新設。
- **復帰**：練習終了時にdata-practice-phaseを消し、依頼文と練習状態をクリアして元の本人募集メモを復元。コピー成功後の装備庫自動遷移、許可確認なしの制作停止、案件カードの安全検査を維持。
- **GitHub施工**：[HTML](https://github.com/Hiderock61/anken-jirai-map/blob/main/index.html)／[JS](https://github.com/Hiderock61/anken-jirai-map/blob/main/app.js)／[CSS](https://github.com/Hiderock61/anken-jirai-map/blob/main/style.css)、版識別子 `04g-reader1101`。iPhone実環境の再検収は未完了。
- **局所QA**：readモード直後は原文のみ・STEP5へ自動移動しない・「整理結果を見る」タップ時だけ結果・原文へ戻る・許可未確認・元メモ復帰などの実関数模擬DOM19/19 PASS。4アプリ検収機によるGitHubソース模擬GETで4/4 PASS。故意に新モード識別子を失わせたソースではFAILと判定した。LIVE HTTP／Safari実タップによる確認はHOLD。
- Work/TinyFishは使わず、他アプリとあしあと仲人PARKは不変。

---

## 2026-11-01｜入口・架空案件の「依頼文が見えない」実機フィードバック修理

- **本人のiPhone検収**：架空の仕事を試すと分解した結果だけが目に入り、そもそも何の依頼文を分解したか分からない。原因は練習開始時にSTEP5の結果へ移動し、元の架空募集本文がSTEP1の入力欄にしかなく、さらに結果へのスクロールで手前の情報を飛ばす構造。
- **改修**：[入口アプリ](https://hiderock61.github.io/anken-jirai-map/) のSTEP5の判定結果より上へ、青い「🧪 STEP0｜アプリに渡した架空の依頼文」を追加。架空の店舗から届いたと想定した自然な修正依頼文（HTML/CSS、表示崩れ、成果物、予算3,000円、納期相談、制作許可未確認）を全文表示。**実際にフォームへ入れた架空の本文そのもの**をtextContentで描画し、結果と対比できる。練習中だけ表示し、本物の案件には表示しない。
- **閲覧順**：練習ボタン→依頼文にスクロール→その下に分解結果→確認中のカード→黄色ボタンでコピー＋確認ツールへ。従来の練習時「生成した結果へ自動スクロール」を無効化して原文を飛ばさない。練習終了で原文を非表示・消去し、元の募集メモへ復元。
- **整合性修理**：架空の本文に「納期は相談」と書くため、入力側の納期も「相談中（練習）」へ統一。制作開始許可は依然として本人確認がなければ未確認で、実応募・実制作を行わない。
- **証拠**：[app.js](https://github.com/Hiderock61/anken-jirai-map/blob/main/app.js)、[index.html](https://github.com/Hiderock61/anken-jirai-map/blob/main/index.html)、[style.css](https://github.com/Hiderock61/anken-jirai-map/blob/main/style.css)。HTML参照JS `04g-original1101b`、CSS `04g-original1101`。本館の[4アプリ公開検収機](https://hiderock61.github.io/tools/app-release-check/)も更新した。
- **検証境界**：コード構文・文言・CSS・表示順など15/15 PASS。実関数を模擬DOMで呼び出した練習開始・元メモ復元等14/14 PASS。これはGitHub保存ソースのテストであり、今回の最新版が本人iPhoneの実ブラウザに届いて表示されたかはまだHOLD。TinyFish・Workは使用なし。

---

## 2026-11-01｜入口の黄色ボタン・1タップでコピー＋確認画面へ

- <b>実機起点</b>：iPhoneのSTEP5で黄色の「仕事情報をコピーして次の画面へ」を押しても画面が変わらない。従来は実際にコピーだけ実行し、次画面は下の別リンクから手動で開く設計だった。B案（成功ならコピー後すぐ移動）を本人が指定。
- <b>施工</b>：[入口アプリ `app.js`](https://github.com/Hiderock61/anken-jirai-map/blob/main/app.js) で黄色ボタン専用の `copyAndOpenCheckingTool` を実装。旧 `copyCaseCard` の実コピー成功値が真のときだけ `window.location.assign(equipmentLink.href)` を実行する。移動先は従来どおり [装備庫の白いカード受付](https://hiderock61.github.io/freelance-/#card-intake)。失敗なら自動移動せず手動コピーとリンクに退避。コピー成功でもブラウザが移動拒否したらリンクへ退避。
- <b>表示</b>：黄色ボタンを「仕事情報をコピーして確認画面を開く」へ変更、貼付先で「白い欄へ貼る」説明を追加。別の「仕事情報をコピー」ボタンはコピー専用のまま。[入口HTML](https://github.com/Hiderock61/anken-jirai-map/blob/main/index.html) JS参照識別子 `app.js?v=04g-oneclick1101` へ更新。
- <b>検収</b>：ソース断片の模擬イベント／クリップボード13/13 PASS。GitHubソース由来の4アプリ公開検収機モック4/4 PASS。検収機 `qa.js` を新JS識別子と `window.location.assign` の期待トークンへ同期。安全判定・旧形式拒否・質問／未確定事項の確認は変更なし。実iPhoneの新版ボタン操作・実クリップボード・公開配信HTTPはなおHOLD。
- <b>注意</b>：コピーの次は同じ画面内での自動貼付ではない。移動先の白い欄へ本人が貼り、内容を確認する。自動応募・送信・納品なし。TinyFish・Work利用なし。

---

## 2026-11-01｜一般公開前の第三者目線・文言／導線／カード安全検収

- ユーザー判断で外部への積極的な告知前に、β体験ページ→入口→仕事確認ツール→フィードバックの一巡をソース上で再検査。公開URLの実HTTPアクセスはこの環境では取得できず、Safari実端末E2EはHOLD。URLを知ればアクセスできるβページはGitHubへ既に公開ソース保存済みであり、この施工はSNS・noteへの告知を行っていない。
- <b>発見した初見向け問題</b>：共通β入口のフッターに「明智工務店」、装備庫のAI道具説明に「明智君／ヒデロック脳内／AIちゃんこ鍋」、入口の冒頭に「抽出ヤスリ」「司令台」等の内輪用語。一般の人が操作を理解する障害になるため、ユーザー向け本文をChatGPTや「仕事の確認ツール」「仕事の募集を整理する」など具体的な普通の言葉へ変更。製作者のブランド表示は残す。
- <b>フィードバック導線の欠損も修理</b>：β体験ページからアプリへ移った後に感想フォームへ戻れなくなる可能性があったため、入口の結果画面と装備庫の「確認中」簡易画面へ[無料βアンケート](https://form.jotform.com/263037279624058)のリンクを追加。フォームの接続メタデータでENABLED／回答0件を再確認。仕事相談フォームは無変更、実送信テストは未実施。
- <b>機能は変えない</b>：内部の【案件カード】見出し、制作許可の明示判定、確認中の制作停止、重複見出し拒否、既存の5STEPと6タブ、架空練習、下書き退避、手動コピーを保持。コピー案内だけ一般語へ整理した。
- <b>コード検収</b>：GitHub最新の入口実コード＋装備庫実パーサの確認中／制作可能／許可なし／重複見出し／偽見出し／空カード6/6 PASS。通常コピー／失敗時の手動コピー／旧コピーAPI／空カード7/7 PASS。HTML/Javascript/導線/版識別19/19 PASS。公開検収機はGitHub実ソースを模擬HTTP応答にした4/4 PASSおよび旧版FAIL／503HOLDを含む6/6 PASS。これは実公開HTTP・Safariの操作試験ではない。
- <b>現行JS版</b>：入口 `app.js?v=04g-public1101`、装備庫 `script.js?v=2315-public1101`。本館の[4アプリ公開検収機](https://hiderock61.github.io/tools/app-release-check/)のチェック対象も更新。betaの単一入口は[こちら](https://hiderock61.github.io/free-tools/freelance-beta/)。
- <b>HOLD</b>：第三者に告知する前にiPhoneで「βページ表示→架空の仕事→コピー→次画面に貼付→確認中のかんたん表示→感想フォームが開く」を本人が一巡。実在の顧客データは使わない。アンケートは本番の回答0件のまま保持する。TinyFish／Workを使っていない。

---

## 2026-11-01｜フリーランス2アプリ・一般向け無料βの一本化導線

- <b>実装した共通入口</b>：[仕事の募集文を整理する｜無料β体験](https://hiderock61.github.io/free-tools/freelance-beta/)（GitHub本館 `free-tools/freelance-beta/index.html`）。初めて来た人向けに、架空の募集で体験する／本物の募集で使う／入口→コピー→装備庫／フィードバック、を1画面にまとめた。単一URLを外部記事でも使う。ソースのGitHub施工はPASSだが、今回の公開Pages HTTP直接検収はツール側で取得不可につきHOLD。
- <b>公開導線</b>：本館 `/` のトップショートカット「仕事整理β体験」、無料道具棚の目立つカード、「仕事を進める道具」欄から共通入口へ接続。既存の入口・装備庫へのリンクは保持。 `/work/` の事例と仕事の流れの間に「FREE BETA / USER TEST」セクションを追加。業務相談・有料サービスとは明確に区別。
- <b>実アプリ</b>：[入口 `anken-jirai-map`](https://hiderock61.github.io/anken-jirai-map/) と [装備庫 `freelance-`](https://hiderock61.github.io/freelance-/#card-intake) のコードはこの公開導線施工では変更しない。先行するiPhone操作テストの「専門用語が多く、AIに直接聞く方が早い」という本人の体感をβの主要仮説として扱い、機能追加より需要検証を優先。
- <b>反響受付</b>：従来の仕事相談用Jotformに触れず、別個の[無料βフィードバックフォーム](https://form.jotform.com/263037279624058)を新規作成、メタデータ上の `ENABLED` を確認。個人情報・募集原文を送らない旨を案内し、試用者が体験結果を送る。現時点の回答数は0であり、需要や利便性は未立証。
- <b>今後の市場テスト</b>：同一β入口URLをnoteの紹介記事や案内文に置き、まず5件程度の第三者試用とコメントを観測。閲覧数、クリック数、実際の使用完了数をサイト側で自動計測する仕組みは現在実装していない。フォーム回答だけで転換率や支払意思を証明したとは扱わない。
- <b>制約</b>：ユーザー情報や秘密の実案件内容は入力させない。無料試作であり、自動募集取得、自動応募、契約、実制作、納品、AIへの自動送信はなし。TinyFish・Work未使用、あしあと仲人はPARKのまま。

---

## 2026-11-01｜iPhone再検収：装備庫「確認中」画面の下を整理

- 本人iPhone画像2枚で新しい緑枠の「iPhoneかんたん表示」が実配信されていることを観測。本人の追加指摘は、そこから下に行くと旧版の「仕事情報の整理」「今やること」など複雑なパネルが続くこと。
- <b>原因</b>：新かんたん表示は `#confirmationPanel` の中にある一方、`#viewToday` 内には並列に旧版のカード受付・制作作業台・今日の装備ルート・条件別作業パネルが残る。元の詳細は削除しない。
- <b>今回の修理</b>：確認中カードの場合だけ `#viewToday[data-card-focus="checking"] > :not(#confirmationPanel)` を非表示にし、下の余計な画面を出さない。「詳しい内容・残りの質問」から従来の情報を展開可能。「別の仕事情報を貼り直す」を新設し、`data-card-focus` を解除して元の入力欄を再表示（入力文章は消さない）。制作可能カードと他タブは従来どおり。確認中→制作禁止、許可検査、見出し重複拒否は変更なし。
- <b>GitHub反映</b>：[装備庫HTML](https://github.com/Hiderock61/freelance-/blob/main/index.html)・[JS](https://github.com/Hiderock61/freelance-/blob/main/script.js)・[CSS](https://github.com/Hiderock61/freelance-/blob/main/style.css)。iPhone版識別子はJS `2315-focus1101b`、CSS `2315-focus1101b`。本館[4アプリ公開検収機](https://hiderock61.github.io/tools/app-release-check/)もこの版を参照。
- <b>局所QA</b>：GitHub最新版の実関数を使って確認中表示、最初の1件、コピー送信注意、簡略モード、旧画面の非表示CSS、入力欄への復帰と値非消去、スクリプト構文を13/13 PASS。ここでの検査は模擬DOMであり、今回の修正後のiPhone実画面はまだ未検収。
- <b>残る最終ゲート</b>：本人iPhoneで[装備庫](https://hiderock61.github.io/freelance-/#card-intake)を再読込して練習カードを読み込み、緑の「かんたん表示」下へスクロールして旧パネルが表示されないことを確認。TinyFish・Work使用なし、あしあと仲人はPARK継続。

---

## 2026-11-01｜iPhone実機画像による「装備庫が難しい」改善・かんたん確認画面

- 本人提供のiPhone画像2枚で、フリーランス装備庫の「今日」タブに制作中の説明や長い既知情報が大量に並び、確認中カードの「次にやること」が直感的に見つからない現象を確認。制作停止／「まだ確認が必要」の判定そのものは正常。UIの表示量を減らす施工に移った。
- [フリーランス装備庫](https://hiderock61.github.io/freelance-/#card-intake) の「確認中」を初回からかんたん表示に変更。上部に「今は制作しません」「確認することN件」「最初の確認項目1件」「質問をコピー」「入口へ戻る」を示し、既存の7つの詳細表示ブロックは「詳しい内容・残りの質問を表示」で展開可能。元の作業台、必須条件、カードパーサ、納品機能、その他5タブは削除せず維持。
- 誤送信防止：サンプルカードの案件名／掲載場所に「架空」「練習」が含まれる場合は「練習用の質問をコピー（送信しない）」と明示。コピーAPI失敗時は成功表示せず旧来の全文選択欄へ切り替わる。送信の自動処理は追加していない。
- 詳細を開く／閉じる（aria-expanded連動）、練習と本番コピー、コピー不可、制作可能カードを確認中として誤処理しないことを局所模擬操作検査。確認中画面の表示条件・遷移8/8 PASS、GitHub最新ソースの整合／構文／検収機による模擬GET 9/9 PASS（4アプリ正常4/4）。
- 修正ソース：[`freelance-/index.html`](https://github.com/Hiderock61/freelance-/blob/main/index.html)、[`script.js`](https://github.com/Hiderock61/freelance-/blob/main/script.js)、[`style.css`](https://github.com/Hiderock61/freelance-/blob/main/style.css)。iPhoneキャッシュ識別子はJS `2315-simple1101b`、CSS `2315-simple1101b`。
- 本館 [4アプリ検収機](https://hiderock61.github.io/tools/app-release-check/) を新版のトークン／ファイル参照に同期。上記PASSはGitHub保存ソースと模擬DOMに限定。LIVE GitHub Pages HTTPと本人iPhone画面・コピー・実際の手動カード受入は未確認。
- あしあと仲人はPARK、TinyFish・Workは使用なし。

---

## 2026-11-01｜フリーランス2本・iPhone初回利用への施工

- <b>入口アプリ</b>：[https://hiderock61.github.io/anken-jirai-map/](https://hiderock61.github.io/anken-jirai-map/) に「架空の仕事で一通り試す」「本物の募集を整理する」の2入口を設置。架空案件は許可のない「確認中」としてカード生成し、装備庫への手動コピーを試す。実際の7項目募集メモは練習中にローカルストレージへ上書きせず、練習終了で画面に復元する。
- <b>入口で見つかった許可の自動ONを修理</b>：求人文の許可らしい記述から制作開始チェックを自動ONしないよう変更し、本人によるSTEP4のチェックを必須とした。人間向け結果の許可表示もチェック状態と一致。制作開始の許可をアプリが実在確認する機能ではない。
- <b>装備庫</b>：[https://hiderock61.github.io/freelance-/](https://hiderock61.github.io/freelance-/) に「架空の確認中カードを読んでみる」を設置。実Parserと確認作業台を流用し、質問あり・許可未確認のカードを読み込む。既存の貼付内容を上書きするときは本人確認を挟み、本物のカードを貼り直せば練習表示を消す。入口への直接リンクも追加。
- <b>既存作業台を保持</b>：確認中→質問整理のみ、制作可能→明示許可／必要条件が揃った場合に限り作業準備、現行の納品3モード、重複見出し拒否、手動コピー連携を維持。応募・発注・納品・送信の本番自動処理なし。
- <b>新JS/CSS改版識別</b>：入口の `04g-usable1101`、装備庫の `2315-usable1101b` 等へHTMLの参照を同期。iPhoneで古いキャッシュを参照しにくくする実装。実端末のキャッシュ更新成功は未確認。
- <b>コード検収</b>：自動許可修理6/6、架空練習／元メモ復元9/9、両アプリのJS/CSS/HTML参照・DOM ID・架空カード読込20/20 PASS。GitHub mainファイル再READで判定。iPhone本番動作・公開PagesのLIVE配信は未検証。
- <b>4アプリ公開検収機</b>：[https://hiderock61.github.io/tools/app-release-check/](https://hiderock61.github.io/tools/app-release-check/) の期待する版を今回の新HTML/JSへ更新。保存コードによる模擬GETで4/4 PASS、通信失敗HOLD・旧JS FAILを含む7/7 PASS。これは実HTTP成功の証拠ではない。
- <b>次の実機工程</b>：iPhone Safariで入口を開く→練習ボタン→架空の「確認中」カード→コピー→装備庫の白欄へペースト→確認作業台だけ表示されることを確認。次に練習終了で本物メモを復元して、現実の募集で同じ手順を利用。サンプルを実案件として使わない。
- <b>条件</b>：TinyFish・Workゼロ。あしあと仲人PARK継続。

---

## 2026-11-01｜4アプリ公開検収機（read-only QA）を新設

- <b>使い方</b>：[本館4アプリ公開検収機](https://hiderock61.github.io/tools/app-release-check/) をiPhoneのSafari等から開き「4アプリを一括検査」を1回押す。各アプリの公開HTML・JS・WorkerをGETし、直近の安全修理と版識別子が配信されているかPASS/FAIL/HOLDで可視化する。検査結果の全文コピーあり。
- <b>検査対象</b>：明智君OS（PWA manifest・Worker版・コピー結果）、ヒデロクスケ・リモコン（v0.3・9役割）、入口アプリ（最新版JS・制作許可・見出し保護・コピー導線）、装備庫（最新版JS・重複見出し拒否・制作許可の再検査）。
- <b>施工証拠</b>：[検査ロジック](https://github.com/Hiderock61/hiderock61.github.io/blob/main/tools/app-release-check/qa.js) commit `ccef257caa508b3e1439300821501f685342c3c6`、[検査画面](https://github.com/Hiderock61/hiderock61.github.io/blob/main/tools/app-release-check/index.html) commit `4fbe21fcd61a3d82c0f2f1223692a984abd9478e`。GitHub実コード由来の4本のHTML/JS/SWで模擬PASS4/4。通信503→HOLD、旧JS混入→FAILなどの故障注入を含む検査器9/9 PASS。
- <b>権限と限界</b>：本館と4アプリが同じ `hiderock61.github.io` originなので、通常のブラウザで公開ファイルを直接取得できる設計。実際に公開されているかはiPhoneでこの検収機を起動して検査する必要があり、今回のGitHub保存・モック結果だけで公開配信PASSとは言わない。非公開Notion、GitHub認証、外部API、個人データ、クリップボード内容を自動取得しない。
- <b>残り</b>：iPhoneで検収機の4/4 PASSと、実コピー／案件カードの2状態受渡し／明智君OS PWA機内モード起動は別の受入条件。TinyFish・Workは使用しない。あしあと仲人はPARK。

---

## 2026-11-01｜4アプリ・追加の欠陥対策と整理 v1.9

- 本番動作はまだ未検収だが、既存GitHub実コードを用いた架空カード試験で、募集情報の本文に公式カード見出し（例：【カード状態】）が混じると装備庫のパーサが後の見出しで上書きし、確認中から制作可能へ変わってしまう経路を再現した。
- <b>修理</b>：[入口](https://github.com/Hiderock61/anken-jirai-map/commit/21c5c5a42cabaa467ec58a350de556240a9f449e) は利用者入力の見出しらしい行を「入力見出し」としてエスケープ。[装備庫](https://github.com/Hiderock61/freelance-/commit/c6037b24bd82899bbe28b31e899263b8eedfb501) は重複する正式カード見出しを上書きせずカード全体を受理拒否。正常カード、重複、偽見出し、旧カード許可なし、質問残存など実コード断片の統合13/13 PASS。
- 入口と装備庫のHTML内JS参照に新クエリを付け、旧版スクリプトを取り違えにくくした。GitHub保存PASSは実配信PASSの代わりではない。関連 [入口HTML](https://github.com/Hiderock61/anken-jirai-map/blob/main/index.html)／[装備庫HTML](https://github.com/Hiderock61/freelance-/blob/main/index.html)。
- 4アプリのHTML要素とJavaScriptで参照するDOM IDを静的照合。明智君OSとヒデロクスケは不一致0件。フリーランス装備庫の初期HTMLにない3 IDはJavaScript内で動的生成される。その他のJS/CSSファイル参照切れは前回0件。
- <b>リモコンの資産台帳誤認防止</b>：ヒデロクスケの現行indexは9役割ボタンのv0.3だがREADME冒頭が別名称の「ヒデロックテンプレ法©️ v0.4F」になっていた。現行アプリ説明をREADME先頭へ追加し、旧文面を消さず下に保管。[README修正](https://github.com/Hiderock61/hiderokusuke-remocon/blob/main/README.md)。
- <b>残るHOLD</b>：公開Pages HTTP応答は通常Web取得でアクセス不能のため未検証。iPhoneコピー、オフライン・PWA動作、架空カード2状態の実ページ手渡し、実顧客への効果は未確認。TinyFish・Workは使わない。あしあと仲人PARK継続。

---

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
