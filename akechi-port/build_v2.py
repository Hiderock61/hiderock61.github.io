#!/usr/bin/env python3
"""Build AKECHI PORT v2 as static HTML from the Notion-derived catalog."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SOURCE = ROOT / "catalog.json"
EVIDENCE = ROOT / "capabilities.json"
OUTPUT_JSON = ROOT / "catalog-v2.json"
OUTPUT_HTML = ROOT / "index.html"

GENRES = {
    "web": ("Web・最新情報", "Webを探す、読む、変化をつかむ、必要な情報だけを次へ渡す。"),
    "research": ("学術・研究", "論文を探す、比較する、引用を監査する、研究知識を残す。"),
    "data": ("データ・市場", "数値を集める、整える、分析する、市場や利用状況を見える形にする。"),
    "people": ("人・会社", "人物や会社を見つける、関係を確かめる、連絡や営業の材料をそろえる。"),
    "files": ("ファイル・知識", "文書やファイルを保存する、探す、読み取る、再利用できる知識にする。"),
    "design": ("図・デザイン", "文章・数値・素材を、画面、図、動画、見える説明へ変える。"),
    "work": ("仕事・自動化", "仕事の発生を受け取り、担当・期限・状態を動かし、次の人へ渡す。"),
    "dev": ("App・Web開発", "仕様からアプリやWebを作り、保存し、公開し、動作状態を確かめる。"),
    "commerce": ("商売・予約・決済", "商品、予約、注文、支払いを受け付け、取引の状態を更新する。"),
    "life": ("生活・旅行・音楽", "移動、食事、住まい、お金、音楽など、現実の選択を助ける。"),
}

MEMBERS = {
    "web": {"Acumen", "Exa", "Firecrawl", "Opera Browser Connector", "Parallel Search", "Tavily AI", "TinyFish"},
    "research": {"Consensus", "Coursera Learning", "Elicit", "Inductive Bio", "SciSpace", "Scite", "Sider Scholar"},
    "data": {"AWS Data Analytics", "Alpaca", "Bigdata.com", "Binance", "ClickHouse", "Flourish", "MotherDuck", "PostHog", "Semrush", "Supermetrics", "vidIQ"},
    "people": {"Apollo", "Google Contacts", "HubSpot", "LinkedIn", "Resume.io"},
    "files": {"Adobe", "Coda", "Dropbox", "Google Drive", "Granola", "Notion"},
    "design": {"Canva", "Figma", "HeyGen", "Higgsfield", "Lucid", "Miro", "Xmind"},
    "work": {"Airtable", "Gmail", "Google Calendar", "Jotform", "Linear", "Manus", "Plugin Management", "Slack", "Todoist", "Trello", "Zoom", "monday.com"},
    "dev": {"AppDeploy", "Base44", "Convex", "DigitalOcean", "GitHub", "Hatchable", "Lovable", "MongoDB Atlas", "Netlify", "OpenAI Platform", "Railway", "Replit", "Supabase", "Vercel", "Webflow", "WordPress.com"},
    "commerce": {"Shopify", "Stripe", "Systeme.io", "TABLEALL"},
    "life": {"Apple Music", "Ask Tarot Cards", "Booking.com", "Flight Network", "Podcast App", "Shazam", "Tarot", "Uber Eats", "YNAB", "idealista"},
}

TRIGGER = {
    "web": "Web上で知りたい対象・URL・変化が出る",
    "research": "研究質問や確かめたい主張が出る",
    "data": "数値・市場・利用状況を観測したくなる",
    "people": "人物・会社・顧客を特定したくなる",
    "files": "保存・検索・再利用したい情報が生まれる",
    "design": "文章・数値・素材を見える形にしたくなる",
    "work": "仕事・予定・状態変更が発生する",
    "dev": "アプリやWebの作成・変更・公開が必要になる",
    "commerce": "売る・予約する・支払う条件が決まる",
    "life": "移動・生活・音・お金について選ぶ必要が出る",
}

INPUT = {
    "web": "検索語／URL／取得条件",
    "research": "研究質問／対象条件／論文候補",
    "data": "銘柄／期間／指標／データ",
    "people": "名前／会社名／属性条件",
    "files": "文章／ファイル／検索条件",
    "design": "文章／数値／画像／レイアウト条件",
    "work": "タスク／イベント／担当／状態変更",
    "dev": "仕様／ソースコード／設定",
    "commerce": "商品／日時／人数／支払条件",
    "life": "場所／日時／音／予算／質問",
}

OUTPUT = {
    "web": "候補一覧／取得本文／変化の手掛かり",
    "research": "論文候補／比較表／根拠",
    "data": "数値／状態／分析材料",
    "people": "人物・会社の候補／連絡材料",
    "files": "検索可能な記録／ファイル／更新状態",
    "design": "図／画面／文書／動画などの視覚物",
    "work": "更新された仕事状態／通知／実行結果",
    "dev": "アプリ／コード／公開状態／診断情報",
    "commerce": "商品・予約・注文・支払いの状態",
    "life": "現実条件に合う候補／識別結果",
}

FAMILY = {
    "センサー": "Sensor", "状態保管": "State Store", "変換器": "Transformer",
    "実行機": "Action Runner", "制御盤": "Control Plane", "解決器": "Resolver",
    "関係グラフ": "Relation Graph", "非同期Job": "Async Job", "Agent工場": "Agent Factory",
    "判断注入": "Decision Injection", "回復・隔離": "Recovery / Isolation", "段階昇格": "Escalation",
    "自己説明": "Self Description", "観測・診断": "Observability", "複合機構": "Composite",
}

ALIASES = {
    "Acumen": ["Acumen by Talarion"], "Adobe": ["Adobe Acrobat"], "Apollo": ["Apollo.io"],
    "Figma": ["Figma / FigJam"], "Ask Tarot Cards": ["Ask Tarot Cards"],
}

TRANSFER = {
    "Notion": "要約・判断根拠・更新履歴", "GitHub": "仕様・コード・差分・実行ログ",
    "Figma": "画面要件・構造・素材", "Elicit": "研究質問・論文候補",
    "Scite": "論文ID・引用候補", "Airtable": "行と列にそろえたレコード",
    "Flourish": "表・時系列・分類済みデータ", "Apple Music": "曲名・アーティスト・音楽ID",
    "Todoist": "次に行う作業・期限・完了条件", "Stripe": "金額・支払条件・決済状態",
}

HUB = {
    "web": "Notion", "research": "Notion", "data": "Flourish", "people": "Airtable",
    "files": "Notion", "design": "GitHub", "work": "Todoist", "dev": "GitHub",
    "commerce": "Airtable", "life": "Notion",
}

CONNECTION_OVERRIDES = {
    "Consensus": [("Elicit", "研究質問・見つかった論文候補")],
    "Elicit": [("Scite", "同じ項目でそろえた論文比較"), ("Notion", "比較表・判断根拠・不足情報")],
    "Scite": [("Notion", "支持・反証・引用関係の監査結果")],
    "Shazam": [("Apple Music", "認識した曲名・アーティスト候補・音楽ID")],
    "Apple Music": [("Shazam", "正式な曲名・アーティスト・アルバム情報")],
}


def clean(value: str, limit: int = 260) -> str:
    value = re.sub(r"\s+", " ", (value or "").strip())
    return value if len(value) <= limit else value[: limit - 1].rstrip("、。／ ") + "…"


def first_piece(value: str, limit: int = 150) -> str:
    parts = [clean(x) for x in re.split(r"／|\n", value or "") if clean(x)]
    return clean(parts[0] if parts else "具体的な条件を入れて処理結果を受け取る", limit)


def joined_pieces(value: str, count: int, limit: int, separator: str = " → ") -> str:
    parts = [clean(x) for x in re.split(r"／|\n", value or "") if clean(x)]
    return clean(separator.join(parts[:count]) if parts else "具体的な条件を入れて処理結果を受け取る", limit)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def genre_for(name: str) -> str:
    found = [key for key, names in MEMBERS.items() if name in names]
    if len(found) != 1:
        raise ValueError(f"genre mapping must be exactly one: {name} -> {found}")
    return found[0]


def load_statuses() -> dict[str, str]:
    data = json.loads(EVIDENCE.read_text())
    plugins, statuses = data["dict"]["plugin"], data["dict"]["status"]
    grouped: dict[str, list[str]] = {}
    for row in data["records"]:
        grouped.setdefault(plugins[row[0]], []).append(statuses[row[2]])
    rank = {"PROVEN": 0, "PARTIAL": 1, "BLOCKED": 2, "HOLD": 3, "UNKNOWN": 4}
    return {name: sorted(vals, key=lambda s: rank[s])[0] for name, vals in grouped.items()}


def status_for(name: str, statuses: dict[str, str]) -> str:
    for alias in [name, *ALIASES.get(name, [])]:
        if alias in statuses:
            return statuses[alias]
    return "UNKNOWN"


def mechanism_steps(raw: str) -> list[str]:
    bits = [clean(x, 80) for x in re.split(r"／|\n", raw or "") if clean(x)]
    return bits[:4] or ["入力を受け取る", "内部処理を行う", "結果を返す"]


def machine_name(item: dict) -> str:
    text = first_piece(item.get("design", ""), 100)
    text = re.sub(r"^(?:.+?というより、)", "", text)
    return text.rstrip("。") or f"{item['name']} PROCESSOR"


def connections(item: dict, names: list[str], genre: str) -> list[dict]:
    if item["name"] in CONNECTION_OVERRIDES:
        return [{"from": item["name"], "to": target, "passes": passes}
                for target, passes in CONNECTION_OVERRIDES[item["name"]]]
    hay = " ".join([item.get("connection", ""), item.get("graft", ""), item.get("when", "")]).lower()
    targets = []
    for name in names:
        if name == item["name"]:
            continue
        variants = [name, *ALIASES.get(name, [])]
        if any(v.lower() in hay for v in variants):
            targets.append(name)
    if not targets:
        fallback = HUB[genre]
        if fallback == item["name"]:
            fallback = "GitHub" if fallback != "GitHub" else "Notion"
        targets = [fallback]
    out = []
    for target in targets[:3]:
        out.append({
            "from": item["name"],
            "to": target,
            "passes": TRANSFER.get(target, "検索条件・候補・処理結果"),
        })
    return out


def build_catalog() -> dict:
    source = json.loads(SOURCE.read_text())
    statuses = load_statuses()
    names = [x["name"] for x in source["items"]]
    items = []
    for item in source["items"]:
        genre = genre_for(item["name"])
        human = clean(item.get("human", "道具"), 90)
        ordinary = f"{item['name']}は、{human}に使う道具。"
        example = "例：" + joined_pieces(item.get("when", ""), 2, 180)
        idea = joined_pieces(item.get("unusual") or item.get("graft") or item.get("connection") or item.get("design", ""), 3, 220, "")
        steps = mechanism_steps(item.get("mechanism", ""))
        items.append({
            "no": item["no"], "name": item["name"], "genre": genre,
            "status": status_for(item["name"], statuses),
            "ordinary": {"summary": ordinary, "example": example},
            "machine": {
                "name": machine_name(item),
                "tags": [FAMILY.get(x, x) for x in item.get("families", [])],
                "trigger": TRIGGER[genre], "input": INPUT[genre],
                "inside": steps, "action": clean(item.get("design", "内部処理を実行する").replace("／", " → "), 180),
                "output": OUTPUT[genre],
            },
            "akechi_idea": idea,
            "connections": connections(item, names, genre),
            "source": "Notion｜プラグイン大賞 同級者編 001〜085",
        })
    if len(items) != 85 or len({x["no"] for x in items}) != 85:
        raise ValueError("catalog must contain 85 unique records")
    return {
        "title": "AKECHI PORT v2｜85外付け能力図鑑",
        "version": "0.1", "generated_at": "2026-09-20",
        "source": source.get("source"), "count": 85,
        "genres": [{"id": k, "name": v[0], "description": v[1]} for k, v in GENRES.items()],
        "items": items,
    }


def e(value) -> str:
    return html.escape(str(value), quote=True)


def card(item: dict) -> str:
    tags = "".join(f'<span class="machine-tag">{e(x)}</span>' for x in item["machine"]["tags"])
    inside = " → ".join(e(x) for x in item["machine"]["inside"])
    chain = "".join(
        f'<li><a href="#plugin-{e(slugify(c["to"]))}" data-plugin-link="{e(c["to"])}">{e(c["to"])}</a><span>{e(c["passes"])}</span></li>'
        for c in item["connections"]
    )
    search = " ".join([
        item["name"], item["ordinary"]["summary"], item["ordinary"]["example"],
        item["machine"]["name"], item["machine"]["trigger"], item["machine"]["input"],
        item["machine"]["output"], item["akechi_idea"], *[x["to"] for x in item["connections"]],
    ])
    slug = slugify(item["name"])
    return f'''<details class="plugin-card" id="plugin-{e(slug)}" data-genre="{e(item['genre'])}" data-search="{e(search.lower())}">
  <summary>
    <span class="plugin-number">{e(item['no'])}</span>
    <span class="plugin-summary"><strong>{e(item['name'])}</strong><span>{e(item['ordinary']['summary'])}</span></span>
    <span class="status status-{e(item['status'].lower())}" title="能力証拠の状態">{e(item['status'])}</span>
    <span class="summary-action" aria-hidden="true">詳しく見る</span>
  </summary>
  <div class="card-detail">
    <div class="perspectives">
      <section class="view human-view" aria-labelledby="human-{e(item['no'])}">
        <h3 id="human-{e(item['no'])}">人間視点</h3>
        <h4>普通は何？</h4><p>{e(item['ordinary']['summary'])}</p>
        <h4>本来の具体例</h4><p>{e(item['ordinary']['example'])}</p>
      </section>
      <section class="view machine-view" aria-labelledby="machine-{e(item['no'])}">
        <h3 id="machine-{e(item['no'])}">設計副音声</h3>
        <p class="machine-name">{e(item['machine']['name'])}</p>
        <div class="machine-tags" aria-label="設計タグ">{tags}</div>
        <dl class="machine-flow">
          <div><dt>きっかけ</dt><dd>{e(item['machine']['trigger'])}</dd></div>
          <div><dt>入力</dt><dd>{e(item['machine']['input'])}</dd></div>
          <div><dt>内部</dt><dd>{inside}</dd></div>
          <div><dt>動作</dt><dd>{e(item['machine']['action'])}</dd></div>
          <div><dt>出力</dt><dd>{e(item['machine']['output'])}</dd></div>
        </dl>
      </section>
    </div>
    <section class="idea-view"><h3>明智くんのアイデア</h3><p>{e(item['akechi_idea'])}</p></section>
    <section class="connection-view"><h3>他Pluginとの接続 <span>｜何を渡すか</span></h3><ol>{chain}</ol></section>
  </div>
</details>'''


def render(catalog: dict) -> str:
    counts = {g: sum(1 for x in catalog["items"] if x["genre"] == g) for g in GENRES}
    chips = "".join(
        f'<a class="genre-chip" href="#genre-{e(key)}" data-filter="{e(key)}">{e(name)} <small>{counts[key]}</small></a>'
        for key, (name, _) in GENRES.items()
    )
    sections = []
    for key, (name, description) in GENRES.items():
        cards = "\n".join(card(x) for x in catalog["items"] if x["genre"] == key)
        sections.append(f'''<section class="genre-section" id="genre-{e(key)}" data-genre-section="{e(key)}">
  <header class="genre-header"><p>GENRE {list(GENRES).index(key)+1:02}</p><h2>{e(name)}</h2><p>{e(description)}</p></header>
  <div class="cards">{cards}</div>
</section>''')
    return TEMPLATE.replace("{{CHIPS}}", chips).replace("{{SECTIONS}}", "\n".join(sections))


TEMPLATE = r'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="85個の外部AI能力を、人間の用途と機械のカラクリの両方から理解し、Plugin同士の接続を考える図鑑。">
<title>AKECHI PORT v2｜85外付け能力図鑑</title>
<style>
:root{color-scheme:dark;--bg:#0e1015;--panel:#151922;--panel2:#1a1f29;--line:#333a48;--text:#f0f2f6;--muted:#abb0bc;--warm:#e7ab5c;--cool:#69b4e7;--green:#69c68f;--max:1180px}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:1rem}body{margin:0;background:var(--bg);color:var(--text);font-family:"Noto Sans JP","Hiragino Sans","Yu Gothic UI",system-ui,sans-serif;font-size:17px;line-height:1.75;overflow-wrap:anywhere}a{color:inherit}.skip-link{position:absolute;left:-999px;top:8px;padding:.7rem 1rem;background:#fff;color:#000;z-index:10}.skip-link:focus{left:8px}.site-header,main,.site-footer{width:min(calc(100% - 2rem),var(--max));margin-inline:auto}.site-header{padding:clamp(3rem,8vw,6.5rem) 0 1.8rem}.eyebrow{margin:0;color:var(--warm);font-weight:800;font-size:.78rem;letter-spacing:.1em}.site-header h1{margin:.3rem 0 .55rem;font-size:clamp(2.5rem,7vw,5.4rem);line-height:1.05;letter-spacing:-.035em}.lead{max-width:780px;margin:0;color:var(--muted);font-size:clamp(1.05rem,2vw,1.3rem)}.tools{position:sticky;top:0;z-index:5;padding:.9rem 0 1rem;background:linear-gradient(var(--bg) 78%,transparent)}.search-row{display:grid;grid-template-columns:1fr auto;gap:.6rem}.search-row input{min-width:0;width:100%;padding:1rem 1.1rem;border:1px solid var(--line);border-radius:.8rem;background:var(--panel);color:var(--text);font:inherit}.search-row input:focus{outline:3px solid color-mix(in srgb,var(--cool) 55%,transparent);outline-offset:2px}.clear{border:1px solid var(--line);border-radius:.8rem;background:var(--panel);color:var(--text);padding:0 1rem;font:inherit;cursor:pointer}.genre-nav{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.75rem}.genre-chip{display:inline-flex;gap:.4rem;align-items:center;padding:.42rem .75rem;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--muted);font-size:.82rem;line-height:1.2}.genre-chip:hover,.genre-chip:focus-visible,.genre-chip[aria-current="true"]{color:var(--text);border-color:var(--cool);outline:none}.genre-chip small{color:var(--cool)}.result-line{display:flex;justify-content:space-between;gap:1rem;margin:.7rem .1rem 0;color:var(--muted);font-size:.88rem}.genre-section{padding:4rem 0 0}.genre-header{padding-top:1rem;border-top:1px solid var(--line);margin-bottom:1.5rem}.genre-header>p:first-child{margin:0;color:var(--cool);font-size:.72rem;font-weight:800;letter-spacing:.13em}.genre-header h2{margin:.15rem 0;font-size:clamp(1.8rem,4vw,3rem);line-height:1.2}.genre-header>p:last-child{max-width:760px;margin:.2rem 0;color:var(--muted)}.cards{display:grid;gap:.85rem}.plugin-card{border:1px solid var(--line);border-radius:1rem;background:var(--panel);scroll-margin-top:9rem}.plugin-card[open]{border-color:#485162}.plugin-card>summary{display:grid;grid-template-columns:3.4rem minmax(0,1fr) auto auto;align-items:center;gap:1rem;padding:1.15rem 1.25rem;cursor:pointer;list-style:none}.plugin-card>summary::-webkit-details-marker{display:none}.plugin-card>summary:focus-visible{outline:3px solid var(--cool);outline-offset:3px;border-radius:1rem}.plugin-number{color:var(--muted);font-size:.78rem;font-weight:800}.plugin-summary{display:grid;gap:.12rem}.plugin-summary strong{font-size:1.18rem;line-height:1.25}.plugin-summary span{color:var(--muted);font-size:.93rem}.status{padding:.18rem .48rem;border:1px solid var(--line);border-radius:999px;color:var(--muted);font-size:.64rem;font-weight:800;letter-spacing:.04em}.status-proven{border-color:#376e50;color:#8ed7aa}.status-partial{border-color:#775a30;color:#efbf79}.status-blocked{border-color:#704045;color:#e69b9f}.status-hold{border-color:#67506f;color:#c8a5d1}.summary-action{color:var(--cool);font-size:.8rem}.plugin-card[open] .summary-action{font-size:0}.plugin-card[open] .summary-action::after{content:"閉じる";font-size:.8rem}.card-detail{padding:0 1.25rem 1.25rem}.perspectives{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.view,.idea-view,.connection-view{padding:1.2rem;border-radius:.8rem;background:var(--panel2)}.view h3,.idea-view h3,.connection-view h3{margin:0 0 .85rem;font-size:.78rem;letter-spacing:.05em}.human-view h3{color:var(--warm)}.machine-view h3,.connection-view h3{color:var(--cool)}.idea-view h3{color:var(--green)}.view h4{margin:1rem 0 .25rem;color:var(--muted);font-size:.82rem}.view p,.idea-view p{margin:0}.machine-name{color:var(--cool);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9rem;font-weight:800;letter-spacing:.025em}.machine-tags{display:flex;flex-wrap:wrap;gap:.35rem;margin:.7rem 0}.machine-tag{padding:.14rem .42rem;border:1px solid #355c76;border-radius:999px;color:#9ed1f2;font-size:.7rem}.machine-flow{margin:0}.machine-flow>div{display:grid;grid-template-columns:4.1rem 1fr;gap:.7rem;padding:.52rem 0;border-top:1px solid #2d3440}.machine-flow dt{color:var(--muted);font-size:.76rem;font-weight:800}.machine-flow dd{margin:0;font-size:.92rem}.idea-view,.connection-view{margin-top:1rem}.connection-view h3 span{color:var(--muted);font-weight:500}.connection-view ol{display:grid;gap:0;margin:0;padding:0;list-style:none}.connection-view li{display:grid;grid-template-columns:minmax(8rem,13rem) 1fr;gap:1rem;position:relative;padding:.55rem 0}.connection-view li+li::before{content:"↓";position:absolute;top:-.75rem;left:.3rem;color:var(--cool)}.connection-view a{color:var(--text);font-weight:800;text-decoration-color:var(--cool);text-underline-offset:.2em}.connection-view li span{color:var(--muted)}.empty{display:none;padding:4rem 0;text-align:center;color:var(--muted)}.site-footer{padding:5rem 0 3rem;color:var(--muted);font-size:.86rem}.site-footer a{color:var(--cool)}[hidden]{display:none!important}
@media(max-width:760px){body{font-size:16px}.site-header,main,.site-footer{width:min(calc(100% - 1.2rem),var(--max))}.site-header{padding-top:3.2rem}.tools{position:static}.search-row{grid-template-columns:1fr}.clear{padding:.7rem}.genre-nav{gap:.4rem}.genre-chip{font-size:.76rem}.plugin-card>summary{grid-template-columns:2.5rem minmax(0,1fr) auto;gap:.65rem;padding:1rem}.plugin-summary span{font-size:.88rem}.summary-action{grid-column:2/4}.perspectives{grid-template-columns:1fr}.card-detail{padding:0 .75rem .75rem}.view,.idea-view,.connection-view{padding:1rem}.machine-flow>div,.connection-view li{grid-template-columns:1fr;gap:.15rem}.connection-view li+li::before{left:.1rem}.status{font-size:.58rem}}
@media(min-width:1700px){:root{--max:1320px}body{font-size:19px}.plugin-summary strong{font-size:1.35rem}.genre-header h2{font-size:3.2rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{:root{color-scheme:light;--bg:#fff;--panel:#fff;--panel2:#fff;--line:#999;--text:#111;--muted:#444;--warm:#6b4300;--cool:#07547c;--green:#126331}.tools,.summary-action,.clear,.site-footer{display:none!important}body{font-size:10.5pt;background:#fff}.site-header{padding:0 0 1cm}.site-header h1{font-size:28pt}.genre-section{padding-top:1cm;break-before:page}.plugin-card{break-inside:avoid;page-break-inside:avoid;margin-bottom:.35cm}.plugin-card>summary{padding:.3cm}.plugin-card:not([open])>:not(summary){display:block!important}.card-detail{padding:0 .3cm .3cm}.view,.idea-view,.connection-view{padding:.3cm}.perspectives{gap:.3cm}.idea-view,.connection-view{margin-top:.3cm}.status{color:#111;border-color:#777}}
</style>
</head>
<body>
<a class="skip-link" href="#catalog">図鑑へ移動</a>
<header class="site-header"><p class="eyebrow">PLUGIN ATLAS / 001–085</p><h1>AKECHI PORT</h1><p class="lead">85個の外部AI能力を、普通の道具と機械のカラクリの両方から眺める図鑑。入力と出力を見て、次につなぐPluginを考える。</p></header>
<main id="catalog">
  <section class="tools" aria-label="検索とジャンル移動">
    <div class="search-row"><label><span class="skip-link">Pluginを検索</span><input id="search" type="search" autocomplete="off" placeholder="Plugin名・普通の用途・入力・出力で検索"></label><button class="clear" id="clear" type="button">検索を消す</button></div>
    <nav class="genre-nav" aria-label="10ジャンル"><a class="genre-chip" href="#catalog" data-filter="all" aria-current="true">全部 <small>85</small></a>{{CHIPS}}</nav>
    <div class="result-line"><span id="result" aria-live="polite">85件</span><span>カードを開くと副音声と接続が見えます</span></div>
  </section>
  <div id="empty" class="empty">一致するPluginがありません。検索語かジャンルを変えてください。</div>
  {{SECTIONS}}
</main>
<footer class="site-footer"><p>正本：ヒデロック発明OS©️ Notion「プラグイン大賞 同級者編 001〜085」／表示データ：<a href="catalog-v2.json">catalog-v2.json</a></p></footer>
<script>
(()=>{const q=document.querySelector('#search'),clear=document.querySelector('#clear'),cards=[...document.querySelectorAll('.plugin-card')],sections=[...document.querySelectorAll('.genre-section')],chips=[...document.querySelectorAll('[data-filter]')],result=document.querySelector('#result'),empty=document.querySelector('#empty');let genre='all';
function apply(){const term=q.value.trim().toLowerCase();let count=0;cards.forEach(c=>{const show=(genre==='all'||c.dataset.genre===genre)&&(!term||c.dataset.search.includes(term));c.hidden=!show;if(show)count++});sections.forEach(s=>s.hidden=![...s.querySelectorAll('.plugin-card')].some(c=>!c.hidden));result.textContent=count+'件';empty.style.display=count?'none':'block'}
chips.forEach(chip=>chip.addEventListener('click',ev=>{genre=chip.dataset.filter;chips.forEach(x=>x.setAttribute('aria-current',String(x===chip)));apply();if(genre!=='all'){requestAnimationFrame(()=>document.querySelector('#genre-'+genre)?.scrollIntoView())}else{ev.preventDefault();document.querySelector('#catalog').scrollIntoView()}}));q.addEventListener('input',apply);clear.addEventListener('click',()=>{q.value='';genre='all';chips.forEach(x=>x.setAttribute('aria-current',String(x.dataset.filter==='all')));apply();q.focus()});
document.querySelectorAll('[data-plugin-link]').forEach(a=>a.addEventListener('click',ev=>{const name=a.dataset.pluginLink;const target=cards.find(c=>c.querySelector('.plugin-summary strong')?.textContent===name);if(target){ev.preventDefault();genre='all';q.value='';apply();target.open=true;target.scrollIntoView({block:'start'});history.replaceState(null,'','#'+target.id)}}));
let printOpen=[];addEventListener('beforeprint',()=>{printOpen=cards.filter(c=>c.open);cards.filter(c=>!c.hidden).forEach(c=>c.open=true)});addEventListener('afterprint',()=>cards.forEach(c=>c.open=printOpen.includes(c)));apply()})();
</script>
</body></html>'''


def main() -> None:
    catalog = build_catalog()
    OUTPUT_JSON.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    OUTPUT_HTML.write_text(render(catalog))
    print(f"built {len(catalog['items'])} cards across {len(catalog['genres'])} genres")


if __name__ == "__main__":
    main()
