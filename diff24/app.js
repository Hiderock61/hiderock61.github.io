(() => {
  const STORAGE_KEY = "sabun24_cases_v01";
  const SOURCE_STORAGE_KEY = "sabun24_source_cases_v04";
  const AKECHI_INBOX_KEY = "akechi_diff24_inbox_v01";
  const PORTFOLIO_INBOX_KEY = "akechi_portfolio_inbox_v01";
  const EVENT_STORAGE_KEY = "sabun24_event_log_v01";
  const ANALYSIS_VERSION = "7.7";
  const SCHEMA_VERSION = "0.9";

  const $ = (id) => document.getElementById(id);
  const screens = [...document.querySelectorAll(".screen")];
  const navButtons = [...document.querySelectorAll(".nav-btn")];

  let currentAnalysis = null;
  const deletedAnalysisIds = new Set();

  const typeLabels = {
    application: "応募文",
    article: "記事",
    web: "Webページ",
    observation: "観測記録",
    generic: "汎用テキスト",
    json: "JSON / 構造データ"
  };

  const modeLabels = {
    ab: "A ↔ B",
    before_after: "変更前 ↔ 変更後",
    success_failure: "結果比較",
    three_way: "3-way｜BASE ↔ A / B"
  };

  function effectiveMode(record) {
    return record?.mode || "ab";
  }

  function effectiveCaseType(record) {
    if (record?.caseType) return record.caseType;
    const aType = record?.caseTypeA || "";
    const bType = record?.caseTypeB || "";
    return aType && aType === bType ? aType : "";
  }

  function effectiveIncompatible(record) {
    if (record?.incompatible === true) return true;
    const aType = record?.caseTypeA || "";
    const bType = record?.caseTypeB || "";
    return !!(aType && bType && aType !== bType);
  }

  function effectiveTitle(record) {
    if (effectiveIncompatible(record)) {
      const aLabel = typeLabels[record?.caseTypeA] || record?.caseTypeA || "不明";
      const bLabel = typeLabels[record?.caseTypeB] || record?.caseTypeB || "不明";
      return `比較不能｜${aLabel} ↔ ${bLabel}`;
    }
    if (record?.title) return record.title;
    if (record?.subject) {
      const mode = effectiveMode(record);
      return `${record.subject}｜${modeLabels[mode] || mode}`;
    }
    const caseType = effectiveCaseType(record);
    const typeLabel = typeLabels[caseType] || caseType || "種類不明";
    const mode = effectiveMode(record);
    const modeLabel = modeLabels[mode] || mode;
    return `${typeLabel}｜${modeLabel}`;
  }

  function formatCaseDate(value) {
    if (!value) return "日時不明";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "日時不明";
    return date.toLocaleString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function showScreen(name) {
    screens.forEach(s => s.classList.toggle("active", s.id === `screen-${name}`));
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.target === name));
    if (name === "cases") renderCaseList();
    if (name === "cross") renderCross();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach(btn => btn.addEventListener("click", () => showScreen(btn.dataset.target)));

  function addMetricRow(metric = {}) {
    const box = $("metric-rows");
    if (!box) return;
    const row = document.createElement("div");
    row.className = "metric-row";
    row.innerHTML = `
      <label class="metric-cell metric-name"><span>物差し名</span><input data-metric="label" placeholder="例：価格 / 在庫 / 保証" value="${escapeHtml(metric.label || "")}" /></label>
      <label class="metric-cell"><span>型</span><select data-metric="type">
        <option value="number">数値</option>
        <option value="text">文字</option>
        <option value="state">状態</option>
      </select></label>
      <label class="metric-cell threeway-only hidden"><span>BASE</span><input data-metric="base" placeholder="共通元" value="${escapeHtml(metric.base ?? "")}" /></label>
      <label class="metric-cell"><span>A</span><input data-metric="a" placeholder="前 / A" value="${escapeHtml(metric.a ?? "")}" /></label>
      <label class="metric-cell"><span>B</span><input data-metric="b" placeholder="後 / B" value="${escapeHtml(metric.b ?? "")}" /></label>
      <label class="metric-cell"><span>単位</span><input data-metric="unit" placeholder="円 / 台 / %" value="${escapeHtml(metric.unit || "")}" /></label>
      <button class="ghost metric-remove" type="button">削除</button>`;
    row.querySelector('[data-metric="type"]').value = ["number","text","state"].includes(metric.type) ? metric.type : "number";
    row.querySelector(".metric-remove").addEventListener("click", () => {
      row.remove();
      if (!box.querySelector(".metric-row")) addMetricRow();
    });
    box.appendChild(row);
  }

  function loadMetricRows(metrics = []) {
    const box = $("metric-rows");
    if (!box) return;
    box.innerHTML = "";
    const safe = Array.isArray(metrics) && metrics.length ? metrics : [{}];
    safe.forEach(addMetricRow);
  }

  function readMetricRows() {
    const box = $("metric-rows");
    if (!box) return [];
    return [...box.querySelectorAll(".metric-row")].map(row => ({
      label: row.querySelector('[data-metric="label"]').value.trim(),
      type: row.querySelector('[data-metric="type"]').value,
      base: row.querySelector('[data-metric="base"]')?.value.trim() || "",
      a: row.querySelector('[data-metric="a"]').value.trim(),
      b: row.querySelector('[data-metric="b"]').value.trim(),
      unit: row.querySelector('[data-metric="unit"]').value.trim()
    })).filter(m => m.label || m.a || m.b || m.unit);
  }

  function isUnknownMetricValue(value) {
    const t = normalizeText(String(value ?? "")).toLowerCase();
    return !t || ["unknown","不明","未観測","na","n/a"].includes(t);
  }

  function parseMetricNumber(value) {
    if (isUnknownMetricValue(value)) return null;
    const t = normalizeText(String(value)).replace(/,/g, "");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)) return NaN;
    return Number(t);
  }

  function formatMetricNumber(value) {
    if (!Number.isFinite(value)) return String(value);
    return Number.isInteger(value) ? value.toLocaleString("ja-JP") : String(Math.round(value * 1000) / 1000);
  }

  function deriveMetricDiffs(metrics = []) {
    return (Array.isArray(metrics) ? metrics : []).map((metric, index) => {
      const label = metric.label || `測定軸${index + 1}`;
      const type = ["number","text","state"].includes(metric.type) ? metric.type : "text";
      const unit = String(metric.unit || "").trim();
      const aRaw = String(metric.a ?? "").trim();
      const bRaw = String(metric.b ?? "").trim();

      if (isUnknownMetricValue(aRaw) || isUnknownMetricValue(bRaw)) {
        return { label, type, unit, a: aRaw, b: bRaw, status: "unknown", summary: `${label}: A=${aRaw || "UNKNOWN"} / B=${bRaw || "UNKNOWN"}` };
      }

      if (type === "number") {
        const a = parseMetricNumber(aRaw);
        const b = parseMetricNumber(bRaw);
        if (!Number.isFinite(a) || !Number.isFinite(b)) {
          return { label, type, unit, a: aRaw, b: bRaw, status: "invalid", summary: `${label}: 数値として解釈できない値あり（A=${aRaw} / B=${bRaw}）` };
        }
        const delta = b - a;
        const percent = a === 0 ? null : (delta / a) * 100;
        const deltaText = delta > 0 ? `+${formatMetricNumber(delta)}${unit}` : delta < 0 ? `-${formatMetricNumber(Math.abs(delta))}${unit}` : `±0${unit}`;
        const percentText = percent === null ? "率計算不可" : formatSignedPercent(percent);
        return {
          label, type, unit, a, b, delta, percent,
          status: delta === 0 ? "same" : "changed",
          summary: `${label}: ${formatMetricNumber(a)}${unit} → ${formatMetricNumber(b)}${unit}｜${deltaText} / ${percentText}`
        };
      }

      const a = normalizeText(aRaw);
      const b = normalizeText(bRaw);
      const status = a === b ? "same" : "changed";
      return { label, type, unit, a, b, status, summary: `${label}: ${a} → ${b}${status === "same" ? "｜変化なし" : ""}` };
    });
  }

  function metricDiffCounts(metrics = []) {
    const diffs = deriveMetricDiffs(metrics);
    return {
      total: diffs.length,
      changed: diffs.filter(x => x.status === "changed").length,
      same: diffs.filter(x => x.status === "same").length,
      unknown: diffs.filter(x => x.status === "unknown" || x.status === "invalid").length
    };
  }

  function hasComparablePayload(record) {
    const hasText = !!normalizeText(String(record?.a || "")) || !!normalizeText(String(record?.b || ""));
    const hasMetrics = Array.isArray(record?.metrics) && record.metrics.length > 0;
    return hasText || hasMetrics;
  }

  function updateThreeWayUI() {
    const active = $("mode").value === "three_way";
    $("base-field").classList.toggle("hidden", !active);
    document.querySelectorAll(".threeway-only").forEach(el => el.classList.toggle("hidden", !active));
  }

  function importDiff24Packet() {
    const status = $("task-packet-status");
    const source = $("task-packet").value.trim();
    if (!source) {
      status.textContent = "DIFF24 PACKETが空です。";
      return;
    }

    let packet;
    try {
      packet = JSON.parse(source);
    } catch {
      status.textContent = "JSONとして読めません。TaskのDIFF24 PACKET全体をそのまま貼り付けてください。";
      return;
    }

    if (
      packet?.schema !== "diff24-ipad-v1" ||
      packet?.caseType !== "observation" ||
      typeof packet?.a !== "string" ||
      typeof packet?.b !== "string"
    ) {
      status.textContent = "iPad観測用DIFF24 PACKETではありません。schema / caseType / A/Bを確認してください。";
      return;
    }

    $("mode").value = packet.mode === "ab" || packet.mode === "success_failure" || packet.mode === "three_way"
      ? packet.mode
      : "before_after";
    updateThreeWayUI();
    $("case-type-a").value = "observation";
    $("case-type-b").value = "observation";
    $("subject").value = packet.subject || "iPad相場観測";
    loadMetricRows(Array.isArray(packet.metrics) ? packet.metrics : []);
    $("case-a").value = packet.a;
    $("case-b").value = packet.b;

    const evidence = Array.isArray(packet.evidence)
      ? packet.evidence.filter(Boolean).join(" | ")
      : String(packet.evidence || "");
    $("evidence").value = evidence;

    status.textContent = "読込完了。A=前回 / B=今回としてセットしました。あとは「鑑識する」。";
  }

  function normalizeText(text) {
    return text
      .replace(/\r/g, "")
      .replace(/[\t ]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function normalizeOutcomeLabel(text) {
    return normalizeText(String(text || "")).normalize("NFC")
      .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/\uFFE5/g, "¥")
      .replace(/\u2212/g, "-")
      .replace(/\u200B/g, "")
      .replace(/[\t \u3000]+/g, "")
      .trim();
  }

  function segment(text) {
    const normalized = normalizeText(text);
    if (!normalized) return [];
    const chunks = normalized
      .split(/(?<=[。！？!?\n])/)
      .map(s => s.trim())
      .filter(Boolean);
    return chunks.length ? chunks : [normalized];
  }

  function tokenSet(text) {
    const tokens = normalizeText(text)
      .toLowerCase()
      .replace(/[、。！？!?「」『』（）()【】\[\],.\-_:;\/]/g, " ")
      .split(/\s+/)
      .flatMap(x => x.length > 12 ? [x, ...Array.from(x)] : [x])
      .filter(x => x.length > 0);
    return new Set(tokens);
  }

  function jaccard(a, b) {
    const A = tokenSet(a);
    const B = tokenSet(b);
    if (!A.size && !B.size) return 1;
    let inter = 0;
    A.forEach(v => { if (B.has(v)) inter++; });
    const union = new Set([...A, ...B]).size || 1;
    return inter / union;
  }

  function pairChanged(removed, added) {
    const pairs = [];
    const usedAdded = new Set();
    const stillRemoved = [];

    removed.forEach(r => {
      let bestIdx = -1;
      let bestScore = 0;
      added.forEach((a, i) => {
        if (usedAdded.has(i)) return;
        const score = jaccard(r, a);
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      });
      if (bestIdx >= 0 && bestScore >= 0.28) {
        usedAdded.add(bestIdx);
        pairs.push({ from: r, to: added[bestIdx], similarity: bestScore });
      } else {
        stillRemoved.push(r);
      }
    });

    const stillAdded = added.filter((_, i) => !usedAdded.has(i));
    return { pairs, stillAdded, stillRemoved };
  }

  function calcRawDiff(aText, bText, observation) {
    const a = segment(aText);
    const b = segment(bText);
    const common = a.filter(x => b.includes(x));
    const removed0 = a.filter(x => !b.includes(x));
    const added0 = b.filter(x => !a.includes(x));
    const paired = pairChanged(removed0, added0);

    const unknown = [];
    if (!normalizeText(aText)) unknown.push("CASE A が未入力");
    if (!normalizeText(bText)) unknown.push("CASE B が未入力");

    if (observation?.label) {
      const label = observation.label;
      const aState = observation.aState;
      const bState = observation.bState;
      const stateLabel = { value: "値あり", none: "無し", unknown: "不明" };

      if (aState === "unknown" || bState === "unknown") {
        unknown.push(`[観測] ${label}: A=${stateLabel[aState]} / B=${stateLabel[bState]}`);
      } else if (aState === bState) {
        common.push(`[観測] ${label}: A/Bとも${stateLabel[aState]}`);
      } else if (aState === "none" && bState === "value") {
        paired.stillAdded.push(`[観測] ${label}: A=無し → B=値あり`);
      } else if (aState === "value" && bState === "none") {
        paired.stillRemoved.push(`[観測] ${label}: A=値あり → B=無し`);
      }
    }

    return {
      common,
      added: paired.stillAdded,
      removed: paired.stillRemoved,
      changed: paired.pairs,
      unknown
    };
  }

  function detectSignals(text, caseType) {
    const t = normalizeText(text);
    const len = t.length;
    const questionCount = (t.match(/[?？]/g) || []).length;
    const bulletCount = (t.match(/[・●■\-]\s?/g) || []).length;
    const aiMention = /AI|ChatGPT|自動|生成AI/i.test(t);
    const personal = /自分|私|僕|経験|実際|以前|好き|興味|使って|やって/i.test(t);
    const evidence = /URL|https?:|実績|件|%|円|時間|分|数値/i.test(t);
    const cta = /連絡|相談|応募|問い合わせ|クリック|購入|申し込|見て|確認/i.test(t);

    const base = { len, questionCount, bulletCount, aiMention, personal, evidence, cta };

    if (caseType === "article") {
      base.headingLike = (t.match(/\n[#■●【].*/g) || []).length;
      base.comparison = /比較|違い|メリット|デメリット|おすすめ|表/i.test(t);
    }
    if (caseType === "application") {
      base.politeClose = /よろしく|幸い|お願いいたします|お願いします/i.test(t);
      base.fit = /募集|案件|作業|対応|進め|業務/i.test(t);
    }
    if (caseType === "web") {
      base.cta = /問い合わせ|申し込|購入|予約|見る|詳しく|試す/i.test(t);
      base.structure = /トップ|見出し|カード|ボタン|メニュー|CTA/i.test(t);
    }
    if (caseType === "observation") {
      base.price = /(?:¥|￥)\s*\d|\d[\d,]*(?:\.\d+)?\s*円/i.test(t);
      base.stock = /在庫|残り|売切|売り切れ|入荷|台|個/i.test(t);
      base.condition = /新品|中古|未使用|ジャンク|Aランク|Bランク|Cランク|保証|状態/i.test(t);
    }
    return base;
  }

  function extractSingleYenAmount(text) {
    const source = String(text || "");
    const regex = /(?:[¥￥]\s*([0-9][\d,]*(?:\.\d+)?)|([0-9][\d,]*(?:\.\d+)?)\s*円)/g;
    const values = [];
    let match;
    while ((match = regex.exec(source)) !== null) {
      const raw = match[1] || match[2] || "";
      const value = Number(raw.replace(/,/g, ""));
      if (Number.isFinite(value)) values.push(value);
    }
    return values.length === 1 ? values[0] : null;
  }

  function stripYenAmount(text) {
    return normalizeText(String(text || "")
      .replace(/[¥￥]\s*[0-9][\d,]*(?:\.\d+)?/g, " ")
      .replace(/[0-9][\d,]*(?:\.\d+)?\s*円/g, " "));
  }

  function formatYen(value) {
    const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
    return `${rounded.toLocaleString("ja-JP")}円`;
  }

  function formatSignedYen(value) {
    if (value > 0) return `+${formatYen(value)}`;
    if (value < 0) return `-${formatYen(Math.abs(value))}`;
    return "±0円";
  }

  function formatSignedPercent(value) {
    if (!Number.isFinite(value)) return "率計算不可";
    const rounded = Math.round(value * 10) / 10;
    if (rounded > 0) return `+${rounded}%`;
    if (rounded < 0) return `${rounded}%`;
    return "±0%";
  }

  function deriveObservationYenDeltas(aText, bText, caseType) {
    if (caseType !== "observation") return [];

    const A = segment(aText)
      .map((text, index) => ({ text, index, value: extractSingleYenAmount(text) }))
      .filter(x => x.value !== null);
    const B = segment(bText)
      .map((text, index) => ({ text, index, value: extractSingleYenAmount(text) }))
      .filter(x => x.value !== null);

    if (!A.length || !B.length) return [];

    const pairs = [];
    const usedB = new Set();

    A.forEach(a => {
      let bestIndex = -1;
      let bestScore = -1;
      const aLabel = stripYenAmount(a.text);

      B.forEach((b, i) => {
        if (usedB.has(i)) return;
        const bLabel = stripYenAmount(b.text);
        const score = aLabel && bLabel ? jaccard(aLabel, bLabel) : 0;
        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      });

      // 価格行がA/Bに1個ずつなら、ラベルが無くても一対一で対応可能。
      const solePair = A.length === 1 && B.length === 1;
      if (bestIndex < 0 || (!solePair && bestScore < 0.28)) return;

      const b = B[bestIndex];
      usedB.add(bestIndex);
      const delta = b.value - a.value;
      const percent = a.value === 0 ? NaN : (delta / a.value) * 100;

      pairs.push({
        from: a.value,
        to: b.value,
        delta,
        percent,
        aText: a.text,
        bText: b.text
      });
    });

    return pairs;
  }

  function semanticText(item) {
    return typeof item === "string" ? item : (item?.text || "");
  }

  function lengthDeltaDirection(item) {
    const text = semanticText(item);
    if (/BはAより約\d+文字長い/.test(text)) return "longer";
    if (/BはAより約\d+文字短い/.test(text)) return "shorter";
    return "similar";
  }

  function questionDeltaDirection(item) {
    const text = semanticText(item);
    const match = text.match(/質問表現は A=(\d+) \/ B=(\d+)。/);
    if (!match) return "same";
    const a = Number(match[1]);
    const b = Number(match[2]);
    if (b > a) return "more";
    if (b < a) return "fewer";
    return "same";
  }

  function legacySemanticRuleKey(text) {
    if (/^BはAより約\d+文字長い。$/.test(text)) {
      return "rule:normalized_length_delta:longer";
    }
    if (/^BはAより約\d+文字短い。$/.test(text)) {
      return "rule:normalized_length_delta:shorter";
    }
    if (text === "AとBの文字量は大きくは変わらない。") {
      return "rule:normalized_length_delta:similar";
    }

    if (/^質問表現は A=\d+ \/ B=\d+。$/.test(text)) {
      return `rule:question_count_delta:${questionDeltaDirection(text)}`;
    }

    const signalLabels = {
      "AI・自動化への言及": "aiMention",
      "本人の経験・接点を示す表現": "personal",
      "数値・実績・出典らしき表現": "evidence",
      "次の行動を促す表現": "cta",
      "比較構造": "comparison",
      "定型的な締め表現": "politeClose",
      "案件理解・業務適合を示す表現": "fit",
      "画面構造・UIに関する表現": "structure"
    };

    const added = text.match(/^Bで「(.+?)」が追加された可能性。$/);
    if (added && signalLabels[added[1]]) {
      return `rule:signal_${signalLabels[added[1]]}_added`;
    }

    const removed = text.match(/^Bでは「(.+?)」が減った可能性。$/);
    if (removed && signalLabels[removed[1]]) {
      return `rule:signal_${signalLabels[removed[1]]}_removed`;
    }

    return "";
  }

  function semanticAggregateKey(item) {
    if (typeof item !== "string" && item?.rule) {
      if (item.rule === "normalized_length_delta") {
        return `rule:${item.rule}:${lengthDeltaDirection(item)}`;
      }
      if (item.rule === "question_count_delta") {
        return `rule:${item.rule}:${questionDeltaDirection(item)}`;
      }
      return `rule:${item.rule}`;
    }

    const text = semanticText(item);
    const legacyRuleKey = legacySemanticRuleKey(text);
    if (legacyRuleKey) return legacyRuleKey;
    return text ? `text:${text}` : "";
  }

  function semanticAggregateLabel(item) {
    if (typeof item !== "string" && item?.rule === "normalized_length_delta") {
      const direction = lengthDeltaDirection(item);
      if (direction === "longer") return "文字量の差｜Bが長い";
      if (direction === "shorter") return "文字量の差｜Bが短い";
      return "文字量ほぼ同じ";
    }
    if (typeof item !== "string" && item?.rule === "question_count_delta") {
      const direction = questionDeltaDirection(item);
      if (direction === "more") return "質問表現｜Bが多い";
      if (direction === "fewer") return "質問表現｜Bが少ない";
      return "質問表現｜同数";
    }
    return semanticText(item);
  }

  function findRawRefs(raw, side, pattern) {
    const refs = [];
    const pushMatches = (kind, items, picker) => {
      items.forEach((item, index) => {
        const text = picker ? picker(item) : item;
        if (pattern.test(String(text || ""))) refs.push(`${kind}:${index + 1}`);
        pattern.lastIndex = 0;
      });
    };

    if (side === "B") {
      pushMatches("added", raw.added, null);
      pushMatches("changed", raw.changed, x => x.to);
    } else {
      pushMatches("removed", raw.removed, null);
      pushMatches("changed", raw.changed, x => x.from);
    }
    return [...new Set(refs)];
  }

  function semanticDiff(aText, bText, caseType, raw) {
    const A = detectSignals(aText, caseType);
    const B = detectSignals(bText, caseType);
    const notes = [];

    const lenDiff = B.len - A.len;
    notes.push({
      text: Math.abs(lenDiff) >= 20
        ? (lenDiff > 0 ? `BはAより約${Math.abs(lenDiff)}文字長い。` : `BはAより約${Math.abs(lenDiff)}文字短い。`)
        : "AとBの文字量は大きくは変わらない。",
      rawRefs: ["input:A", "input:B"],
      rule: "normalized_length_delta"
    });

    const boolKeys = [
      ["aiMention", "AI・自動化への言及", /AI|ChatGPT|自動|生成AI/i],
      ["personal", "本人の経験・接点を示す表現", /自分|私|僕|経験|実際|以前|好き|興味|使って|やって/i],
      ["evidence", "数値・実績・出典らしき表現", /URL|https?:|実績|件|%|円|時間|分|数値/i],
      ["cta", "次の行動を促す表現", /連絡|相談|応募|問い合わせ|クリック|購入|申し込|見て|確認/i],
      ["comparison", "比較構造", /比較|違い|メリット|デメリット|おすすめ|表/i],
      ["politeClose", "定型的な締め表現", /よろしく|幸い|お願いいたします|お願いします/i],
      ["fit", "案件理解・業務適合を示す表現", /募集|案件|作業|対応|進め|業務/i],
      ["structure", "画面構造・UIに関する表現", /トップ|見出し|カード|ボタン|メニュー|CTA/i],
      ["price", "価格の記録", /(?:¥|￥)\s*\d|\d[\d,]*(?:\.\d+)?\s*円/i],
      ["stock", "在庫・残数の記録", /在庫|残り|売切|売り切れ|入荷|台|個/i],
      ["condition", "状態・ランク・保証の記録", /新品|中古|未使用|ジャンク|Aランク|Bランク|Cランク|保証|状態/i]
    ];

    boolKeys.forEach(([key, label, pattern]) => {
      if ((key in A || key in B) && !!A[key] !== !!B[key]) {
        const side = B[key] ? "B" : "A";
        const refs = findRawRefs(raw, side, pattern);
        notes.push({
          text: B[key] ? `Bで「${label}」が追加された可能性。` : `Bでは「${label}」が減った可能性。`,
          rawRefs: refs.length ? refs : [`input:${side}`],
          rule: `signal_${key}_${B[key] ? "added" : "removed"}`
        });
      }
    });

    if (A.questionCount !== B.questionCount) {
      const refs = [
        ...findRawRefs(raw, "A", /[?？]/),
        ...findRawRefs(raw, "B", /[?？]/)
      ];
      notes.push({
        text: `質問表現は A=${A.questionCount} / B=${B.questionCount}。`,
        rawRefs: refs.length ? [...new Set(refs)] : ["input:A", "input:B"],
        rule: "question_count_delta"
      });
    }

    return notes.slice(0, 5);
  }

  function jsonValueType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  function jsonPointerToken(value) {
    return String(value).replace(/~/g, "~0").replace(/\//g, "~1");
  }

  function jsonPathJoin(path, key) {
    return (path || "") + "/" + jsonPointerToken(key);
  }

  function parseJsonText(text) {
    try {
      return { ok: true, value: JSON.parse(String(text || "")), error: "" };
    } catch (error) {
      return { ok: false, value: null, error: error?.message || "JSON parse error" };
    }
  }

  function diffJsonValues(a, b, path = "") {
    const operations = [];
    const aType = jsonValueType(a);
    const bType = jsonValueType(b);

    if (aType !== bType) {
      operations.push({ op: "TYPE_CHANGE", path: path || "/", oldType: aType, type: bType, oldValue: a, value: b });
      return operations;
    }

    if (aType === "object") {
      const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
      [...keys].sort().forEach(key => {
        const hasA = Object.prototype.hasOwnProperty.call(a, key);
        const hasB = Object.prototype.hasOwnProperty.call(b, key);
        const nextPath = jsonPathJoin(path, key);
        if (!hasA && hasB) operations.push({ op: "ADD", path: nextPath, value: b[key], type: jsonValueType(b[key]) });
        else if (hasA && !hasB) operations.push({ op: "REMOVE", path: nextPath, oldValue: a[key], oldType: jsonValueType(a[key]) });
        else operations.push(...diffJsonValues(a[key], b[key], nextPath));
      });
      return operations;
    }

    if (aType === "array") {
      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) {
        const nextPath = jsonPathJoin(path, i);
        if (i >= a.length) operations.push({ op: "ADD", path: nextPath, value: b[i], type: jsonValueType(b[i]) });
        else if (i >= b.length) operations.push({ op: "REMOVE", path: nextPath, oldValue: a[i], oldType: jsonValueType(a[i]) });
        else operations.push(...diffJsonValues(a[i], b[i], nextPath));
      }
      return operations;
    }

    if (!Object.is(a, b)) operations.push({ op: "REPLACE", path: path || "/", oldValue: a, value: b, type: aType });
    return operations;
  }

  function deriveStructuredDiff(record) {
    if (effectiveCaseType(record) !== "json" || effectiveMode(record) === "three_way") return null;
    const A = parseJsonText(record?.a || "");
    const B = parseJsonText(record?.b || "");
    if (!A.ok || !B.ok) {
      return {
        schema: "diff24-structured-v1",
        ok: false,
        errorA: A.ok ? "" : A.error,
        errorB: B.ok ? "" : B.error,
        operationCount: 0,
        operations: []
      };
    }
    const operations = diffJsonValues(A.value, B.value);
    const counts = {
      add: operations.filter(x => x.op === "ADD").length,
      remove: operations.filter(x => x.op === "REMOVE").length,
      replace: operations.filter(x => x.op === "REPLACE").length,
      typeChange: operations.filter(x => x.op === "TYPE_CHANGE").length
    };
    return {
      schema: "diff24-structured-v1",
      ok: true,
      comparisonId: record?.id || null,
      subject: record?.subject || "",
      counts,
      operationCount: operations.length,
      operations
    };
  }

  function stableCanonical(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(stableCanonical).join(",") + "]";
    return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stableCanonical(value[key])).join(",") + "}";
  }

  function fnv1a32(text) {
    let hash = 0x811c9dc5;
    const source = String(text || "");
    for (let i = 0; i < source.length; i++) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function sideStatePayload(record, side) {
    const text = side === "BASE" ? (record?.base || "") : side === "A" ? (record?.a || "") : (record?.b || "");
    let canonicalText = normalizeText(String(text));
    if (effectiveCaseType(record) === "json") {
      const parsed = parseJsonText(text);
      canonicalText = parsed.ok ? stableCanonical(parsed.value) : canonicalText;
    }
    const metrics = (record?.metrics || []).map(m => ({
      label: m.label || "",
      type: m.type || "text",
      unit: m.unit || "",
      value: side === "BASE" ? (m.base ?? "") : side === "A" ? (m.a ?? "") : (m.b ?? "")
    }));
    return stableCanonical({ caseType: effectiveCaseType(record), text: canonicalText, metrics });
  }

  function deriveFingerprints(record) {
    const A = fnv1a32(sideStatePayload(record, "A"));
    const B = fnv1a32(sideStatePayload(record, "B"));
    const result = { algorithm: "FNV1A32", a: A, b: B, sameAB: A === B };
    if (effectiveMode(record) === "three_way") {
      result.base = fnv1a32(sideStatePayload(record, "BASE"));
      result.sameBaseA = result.base === A;
      result.sameBaseB = result.base === B;
    }
    return result;
  }

  function structuredOperationText(op) {
    if (op.op === "ADD") return `ADD ${op.path}`;
    if (op.op === "REMOVE") return `REMOVE ${op.path}`;
    if (op.op === "TYPE_CHANGE") return `TYPE_CHANGE ${op.path}｜${op.oldType} → ${op.type}`;
    return `REPLACE ${op.path}`;
  }

  async function copyStructuredDiff() {
    if (!currentAnalysis) return;
    const structured = deriveStructuredDiff(currentAnalysis);
    if (!structured) return;
    const json = JSON.stringify(structured, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      $("structured-status").textContent = "STRUCTURED DIFFをコピーしました。";
    } catch {
      $("structured-json").focus();
      $("structured-json").select();
      $("structured-status").textContent = "自動コピーできませんでした。JSON欄を選択しました。";
    }
  }

  function sideChangeForBase(baseValue, raw, duplicate = false) {
    if (duplicate) return { kind: "unknown", value: null, note: "BASE内に同一要素が複数あり位置を確定できない" };
    const safe = normalizeRawShape(raw);
    const changed = safe.changed.find(x => normalizeText(x?.from || "") === normalizeText(baseValue));
    if (changed) return { kind: "replace", value: changed.to };
    if (safe.removed.some(x => normalizeText(x) === normalizeText(baseValue))) return { kind: "remove", value: null };
    if (safe.common.some(x => normalizeText(x) === normalizeText(baseValue))) return { kind: "same", value: baseValue };
    return { kind: "unknown", value: null, note: "BASE要素の対応先を確定できない" };
  }

  function classifyThreeWayPair(baseValue, aChange, bChange, key, scope = "text", meta = {}) {
    if (aChange.kind === "unknown" || bChange.kind === "unknown") {
      return { key, scope, status: "UNKNOWN", base: baseValue, a: aChange.value, b: bChange.value, ...meta, reason: aChange.note || bChange.note || "対応不明" };
    }
    if (aChange.kind === "same" && bChange.kind === "same") return null;

    if (aChange.kind === "same" && bChange.kind !== "same") {
      return { key, scope, status: "B_ONLY", base: baseValue, a: baseValue, b: bChange.value, ...meta, reason: "BだけがBASEから変更" };
    }
    if (bChange.kind === "same" && aChange.kind !== "same") {
      return { key, scope, status: "A_ONLY", base: baseValue, a: aChange.value, b: baseValue, ...meta, reason: "AだけがBASEから変更" };
    }

    if (aChange.kind === "remove" && bChange.kind === "remove") {
      return { key, scope, status: "BOTH_SAME", base: baseValue, a: null, b: null, ...meta, reason: "A/Bとも同じ削除" };
    }

    if (aChange.kind === "replace" && bChange.kind === "replace") {
      if (normalizeText(String(aChange.value ?? "")) === normalizeText(String(bChange.value ?? ""))) {
        return { key, scope, status: "BOTH_SAME", base: baseValue, a: aChange.value, b: bChange.value, ...meta, reason: "A/Bとも同じ変更" };
      }
      return { key, scope, status: "CONFLICT", base: baseValue, a: aChange.value, b: bChange.value, ...meta, reason: "A/Bが同じBASE要素を別々に変更" };
    }

    return { key, scope, status: "CONFLICT", base: baseValue, a: aChange.value, b: bChange.value, ...meta, reason: "削除と変更が競合" };
  }

  function comparableMetricValue(raw, type) {
    if (isUnknownMetricValue(raw)) return { ok: false, value: raw, note: "UNKNOWN / 未観測" };
    if (type === "number") {
      const n = parseMetricNumber(raw);
      if (!Number.isFinite(n)) return { ok: false, value: raw, note: "数値として解釈不能" };
      return { ok: true, value: n };
    }
    return { ok: true, value: normalizeText(String(raw)) };
  }

  function deriveThreeWay(record) {
    if (effectiveMode(record) !== "three_way") return null;

    const baseText = String(record?.base || "");
    const aText = String(record?.a || "");
    const bText = String(record?.b || "");
    const entries = [];

    if (normalizeText(baseText)) {
      const rawA = calcRawDiff(baseText, aText, null);
      const rawB = calcRawDiff(baseText, bText, null);
      const baseSegments = segment(baseText);
      const aSegments = segment(aText);
      const bSegments = segment(bText);
      const aligned = baseSegments.length === aSegments.length && baseSegments.length === bSegments.length;

      if (aligned) {
        baseSegments.forEach((baseValue, index) => {
          const aValue = aSegments[index];
          const bValue = bSegments[index];
          const aChange = normalizeText(aValue) === normalizeText(baseValue)
            ? { kind: "same", value: baseValue }
            : { kind: "replace", value: aValue };
          const bChange = normalizeText(bValue) === normalizeText(baseValue)
            ? { kind: "same", value: baseValue }
            : { kind: "replace", value: bValue };
          const item = classifyThreeWayPair(
            baseValue,
            aChange,
            bChange,
            `text:base:${index + 1}`
          );
          if (item) entries.push(item);
        });
      } else {
        const counts = new Map();
        baseSegments.forEach(x => {
          const key = normalizeText(x);
          counts.set(key, (counts.get(key) || 0) + 1);
        });

        baseSegments.forEach((baseValue, index) => {
          const duplicate = (counts.get(normalizeText(baseValue)) || 0) > 1;
          const item = classifyThreeWayPair(
            baseValue,
            sideChangeForBase(baseValue, rawA, duplicate),
            sideChangeForBase(baseValue, rawB, duplicate),
            `text:base:${index + 1}`
          );
          if (item) entries.push(item);
        });

        const aAdded = [...rawA.added];
        const bAdded = [...rawB.added];
        const usedB = new Set();
        aAdded.forEach((value, index) => {
          const match = bAdded.findIndex((x, i) => !usedB.has(i) && normalizeText(x) === normalizeText(value));
          if (match >= 0) {
            usedB.add(match);
            entries.push({ key: `text:add:a:${index + 1}`, scope: "text", status: "BOTH_SAME", base: null, a: value, b: bAdded[match], reason: "A/Bが同じ新規要素を追加" });
          } else {
            entries.push({ key: `text:add:a:${index + 1}`, scope: "text", status: "A_ONLY", base: null, a: value, b: null, reason: "Aだけの新規追加。位置不明のため競合とは断定しない" });
          }
        });
        bAdded.forEach((value, index) => {
          if (usedB.has(index)) return;
          entries.push({ key: `text:add:b:${index + 1}`, scope: "text", status: "B_ONLY", base: null, a: null, b: value, reason: "Bだけの新規追加。位置不明のため競合とは断定しない" });
        });
      }
    }

    (record?.metrics || []).forEach((metric, index) => {
      const type = ["number","text","state"].includes(metric.type) ? metric.type : "text";
      const base = comparableMetricValue(metric.base, type);
      const a = comparableMetricValue(metric.a, type);
      const b = comparableMetricValue(metric.b, type);
      const meta = { label: metric.label || `測定軸${index + 1}`, type, unit: metric.unit || "" };
      if (!base.ok || !a.ok || !b.ok) {
        entries.push({
          key: `metric:${index + 1}`, scope: "metric", status: "UNKNOWN",
          base: base.value, a: a.value, b: b.value, ...meta,
          reason: base.note || a.note || b.note || "値を比較できない"
        });
        return;
      }

      const same = (x, y) => type === "number" ? x === y : normalizeText(String(x)) === normalizeText(String(y));
      const aChanged = !same(a.value, base.value);
      const bChanged = !same(b.value, base.value);
      if (!aChanged && !bChanged) return;
      if (aChanged && !bChanged) {
        entries.push({ key: `metric:${index + 1}`, scope: "metric", status: "A_ONLY", base: base.value, a: a.value, b: b.value, ...meta, reason: "AだけがBASEから変更" });
      } else if (!aChanged && bChanged) {
        entries.push({ key: `metric:${index + 1}`, scope: "metric", status: "B_ONLY", base: base.value, a: a.value, b: b.value, ...meta, reason: "BだけがBASEから変更" });
      } else if (same(a.value, b.value)) {
        entries.push({ key: `metric:${index + 1}`, scope: "metric", status: "BOTH_SAME", base: base.value, a: a.value, b: b.value, ...meta, reason: "A/Bとも同じ値へ変更" });
      } else {
        entries.push({ key: `metric:${index + 1}`, scope: "metric", status: "CONFLICT", base: base.value, a: a.value, b: b.value, ...meta, reason: "A/Bが同じ測定軸を別々の値へ変更" });
      }
    });

    const counts = {
      conflict: entries.filter(x => x.status === "CONFLICT").length,
      safe: entries.filter(x => ["A_ONLY","B_ONLY","BOTH_SAME"].includes(x.status)).length,
      unknown: entries.filter(x => x.status === "UNKNOWN").length
    };

    return {
      schema: "diff24-threeway-v1",
      comparisonId: record?.id || null,
      subject: record?.subject || "",
      caseType: effectiveCaseType(record) || "",
      counts,
      entries,
      autoMergeSafe: counts.conflict === 0 && counts.unknown === 0
    };
  }

  function threeWayEntryText(item) {
    const label = item.label ? `${item.label}｜` : "";
    const unit = item.unit || "";
    const val = v => v === null || v === undefined ? "∅" : `${v}${item.scope === "metric" ? unit : ""}`;
    return `${label}BASE: ${val(item.base)} / A: ${val(item.a)} / B: ${val(item.b)}｜${item.reason}`;
  }

  async function copyCurrentThreeWay() {
    if (!currentAnalysis) return;
    const report = deriveThreeWay(currentAnalysis);
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const status = $("threeway-status");
    try {
      await navigator.clipboard.writeText(json);
      status.textContent = "MERGE REPORTをコピーしました。";
    } catch {
      $("threeway-json").focus();
      $("threeway-json").select();
      status.textContent = "自動コピーできませんでした。JSON欄を選択したので手動コピーしてください。";
    }
  }

  function deriveCdcPacket(record) {
    if (!record || effectiveIncompatible(record) || effectiveMode(record) === "three_way") return null;
    const changeSet = deriveChangeSet(record);
    const events = changeSet.operations.map((op, index) => {
      const action = op.op === "ADD"
        ? "INSERT"
        : op.op === "REMOVE"
          ? "DELETE"
          : op.op === "REPLACE"
            ? "UPDATE"
            : op.op === "TYPE_CHANGE"
              ? "TYPE_CHANGE"
              : "REVIEW";
      return {
        seq: index + 1,
        action,
        scope: op.scope || "text",
        key: op.path || op.key || `op:${index + 1}`,
        path: op.path || null,
        label: op.label || "",
        oldValue: Object.prototype.hasOwnProperty.call(op, "oldValue") ? op.oldValue : null,
        value: Object.prototype.hasOwnProperty.call(op, "value") ? op.value : null,
        delta: Object.prototype.hasOwnProperty.call(op, "delta") ? op.delta : null,
        note: op.note || ""
      };
    });

    const counts = {
      insert: events.filter(x => x.action === "INSERT").length,
      delete: events.filter(x => x.action === "DELETE").length,
      update: events.filter(x => x.action === "UPDATE").length,
      typeChange: events.filter(x => x.action === "TYPE_CHANGE").length,
      review: events.filter(x => x.action === "REVIEW").length
    };

    return {
      schema: "diff24-cdc-v1",
      source: "diff24",
      comparisonId: record.id || null,
      subject: record.subject || "",
      revision: inferRevision(record),
      parentId: record.parentId || null,
      createdAt: record.createdAt || null,
      fingerprintA: deriveFingerprints(record).a,
      fingerprintB: deriveFingerprints(record).b,
      changedOnly: true,
      counts,
      eventCount: events.length,
      events
    };
  }

  function cdcEventText(event) {
    const key = event.path || event.key || "";
    const label = event.label ? `${event.label}｜` : "";
    if (event.action === "INSERT") return `${label}${key}｜追加`;
    if (event.action === "DELETE") return `${label}${key}｜削除`;
    if (event.action === "TYPE_CHANGE") return `${label}${key}｜型変更`;
    if (event.action === "REVIEW") return `${label}${key}｜要確認`;
    return `${label}${key}｜更新`;
  }

  async function copyCurrentCdc() {
    if (!currentAnalysis) return;
    const packet = deriveCdcPacket(currentAnalysis);
    if (!packet) return;
    const json = JSON.stringify(packet, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      $("cdc-status").textContent = "CDC PACKETをコピーしました。";
    } catch {
      $("cdc-json").focus();
      $("cdc-json").select();
      $("cdc-status").textContent = "自動コピーできませんでした。JSON欄を選択しました。";
    }
  }

  function deriveChangeSet(record) {
    const structured = deriveStructuredDiff(record);
    if (structured?.ok) {
      const operations = structured.operations.map((op, index) => ({
        ...op,
        scope: "json",
        key: `json:${index + 1}`
      }));
      const fingerprints = deriveFingerprints(record);
      return {
        schema: "diff24-changeset-v1",
        source: "diff24",
        comparisonId: record?.id || null,
        subject: record?.subject || "",
        caseType: effectiveCaseType(record) || "",
        mode: effectiveMode(record),
        revision: inferRevision(record),
        parentId: record?.parentId || null,
        createdAt: record?.createdAt || null,
        fingerprintA: fingerprints.a,
        fingerprintB: fingerprints.b,
        operationCount: operations.length,
        operations
      };
    }

    const raw = normalizeRawShape(record?.raw);
    const operations = [];

    raw.added.forEach((value, index) => operations.push({
      op: "ADD",
      scope: "text",
      key: `added:${index + 1}`,
      value
    }));

    raw.removed.forEach((oldValue, index) => operations.push({
      op: "REMOVE",
      scope: "text",
      key: `removed:${index + 1}`,
      oldValue
    }));

    raw.changed.forEach((item, index) => operations.push({
      op: "REPLACE",
      scope: "text",
      key: `changed:${index + 1}`,
      oldValue: item?.from ?? "",
      value: item?.to ?? ""
    }));

    raw.unknown.forEach((note, index) => operations.push({
      op: "UNKNOWN",
      scope: "text",
      key: `unknown:${index + 1}`,
      note
    }));

    deriveMetricDiffs(record?.metrics || []).forEach((item, index) => {
      if (item.status === "same") return;
      const base = {
        scope: "metric",
        key: `metric:${index + 1}`,
        label: item.label,
        type: item.type,
        unit: item.unit || ""
      };

      if (item.status === "unknown" || item.status === "invalid") {
        operations.push({
          ...base,
          op: "UNKNOWN",
          oldValue: item.a,
          value: item.b,
          note: item.summary
        });
        return;
      }

      operations.push({
        ...base,
        op: "REPLACE",
        oldValue: item.a,
        value: item.b,
        ...(item.type === "number" ? {
          delta: item.delta,
          percent: Number.isFinite(item.percent) ? item.percent : null
        } : {})
      });
    });

    return {
      schema: "diff24-changeset-v1",
      source: "diff24",
      comparisonId: record?.id || null,
      subject: record?.subject || "",
      caseType: effectiveCaseType(record) || "",
      mode: effectiveMode(record),
      revision: inferRevision(record),
      parentId: record?.parentId || null,
      createdAt: record?.createdAt || null,
      fingerprintA: deriveFingerprints(record).a,
      fingerprintB: deriveFingerprints(record).b,
      operationCount: operations.length,
      operations
    };
  }

  function changeSetOperationText(operation) {
    if (operation.scope === "json") {
      if (operation.op === "TYPE_CHANGE") return `${operation.path}｜${operation.oldType} → ${operation.type}`;
      if (operation.op === "ADD") return `${operation.path}｜追加`;
      if (operation.op === "REMOVE") return `${operation.path}｜削除`;
      return `${operation.path}｜変更`;
    }
    const label = operation.label ? `${operation.label}｜` : "";
    const unit = operation.unit || "";
    if (operation.op === "ADD") return `${label}追加: ${shorten(operation.value, 90)}`;
    if (operation.op === "REMOVE") return `${label}削除: ${shorten(operation.oldValue, 90)}`;
    if (operation.op === "REPLACE") {
      const delta = operation.delta !== undefined
        ? `｜Δ ${operation.delta > 0 ? "+" : ""}${formatMetricNumber(operation.delta)}${unit}`
        : "";
      return `${label}${shorten(String(operation.oldValue), 70)} → ${shorten(String(operation.value), 70)}${delta}`;
    }
    return `${label}${operation.note || "不明 / 欠損"}`;
  }

  async function copyCurrentChangeSet() {
    if (!currentAnalysis || effectiveIncompatible(currentAnalysis)) return;
    const json = JSON.stringify(deriveChangeSet(currentAnalysis), null, 2);
    const status = $("changeset-status");
    try {
      await navigator.clipboard.writeText(json);
      status.textContent = "変更セットJSONをコピーしました。次工程へそのまま渡せます。";
    } catch {
      $("changeset-json").focus();
      $("changeset-json").select();
      status.textContent = "自動コピーできませんでした。JSON欄を選択したので手動コピーしてください。";
    }
  }

  function normalizeRawShape(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    return {
      common: Array.isArray(source.common) ? source.common : [],
      added: Array.isArray(source.added) ? source.added : [],
      removed: Array.isArray(source.removed) ? source.removed : [],
      changed: Array.isArray(source.changed) ? source.changed : [],
      unknown: Array.isArray(source.unknown) ? source.unknown : []
    };
  }

  function rawCounts(raw) {
    const safeRaw = normalizeRawShape(raw);
    return {
      common: safeRaw.common.length,
      added: safeRaw.added.length,
      removed: safeRaw.removed.length,
      changed: safeRaw.changed.length,
      unknown: safeRaw.unknown.length
    };
  }

  // #053: 旧保存データに fact が無い場合も表示だけ安全に復元する。
  // 保存済みrecord自体は書き換えない。rawも無ければ「FACT記録なし」とする。
  function displayFact(record) {
    const stored = typeof record?.fact === "string" ? record.fact.trim() : "";
    if (stored) return stored;

    if (!record?.raw || typeof record.raw !== "object") return "FACT記録なし";

    const counts = rawCounts(record.raw);
    const factParts = [];
    if (counts.added) factParts.push(`追加 ${counts.added}件`);
    if (counts.removed) factParts.push(`削除 ${counts.removed}件`);
    if (counts.changed) factParts.push(`変更 ${counts.changed}件`);
    if (counts.common) factParts.push(`共通 ${counts.common}件`);
    if (counts.unknown) factParts.push(`不明/欠損 ${counts.unknown}件`);
    const metricCounts = metricDiffCounts(record.metrics || []);
    if (metricCounts.total) {
      factParts.push(`測定軸 ${metricCounts.total}件（変化 ${metricCounts.changed} / 同一 ${metricCounts.same} / 不明 ${metricCounts.unknown}）`);
    }

    return factParts.length ? factParts.join(" / ") : "検出可能な差分なし";
  }

  function buildImportant(raw, semantic, formData, hasOutcome) {
    raw = normalizeRawShape(raw);
    const candidates = [];
    const observationLabel = formData.observation?.label || "";

    function addCandidate(kind, text, baseScore, reason) {
      const isObservation = observationLabel && text.includes(`[観測] ${observationLabel}`);
      let score = baseScore;
      const reasons = [];

      if (isObservation) {
        score += 300;
        reasons.push("明示観測項目");
      }
      if (kind === "不明 / 欠損") {
        score += 260;
        reasons.push("比較を止める欠損");
      }
      if (hasOutcome) {
        score += 80;
        reasons.push("結果差と同時に存在");
      }

      if (formData.mode === "ab") {
        score += 20;
        reasons.push("比較目的:A/B差");
      } else if (formData.mode === "before_after") {
        if (kind === "変更") score += 260;
        if (kind === "追加" || kind === "削除") score += 180;
        if (kind === "意味差分") score += 40;
        reasons.push("比較目的:変更前後");
      } else if (formData.mode === "success_failure") {
        if (kind === "意味差分") score += 240;
        if (isObservation) score += 160;
        if (kind === "追加" || kind === "削除" || kind === "変更") score += 60;
        reasons.push("比較目的:結果差");
      }

      if (reason) reasons.push(reason);

      candidates.push({
        kind,
        text,
        score,
        reason: reasons.join(" / ") || "通常差分"
      });
    }

    raw.changed.forEach(x => addCandidate("変更", `${shorten(x.from)} → ${shorten(x.to)}`, 120, "変更可能"));
    raw.added.forEach(x => addCandidate("追加", shorten(x), 100, "変更可能"));
    raw.removed.forEach(x => addCandidate("削除", shorten(x), 100, "変更可能"));
    raw.unknown.forEach(x => addCandidate("不明 / 欠損", shorten(x), 140, ""));
    semantic.forEach(x => addCandidate("意味差分", semanticText(x), 160, "意味単位"));

    deriveMetricDiffs(formData.metrics || []).forEach(x => {
      if (x.status === "same") return;
      addCandidate(
        x.status === "unknown" || x.status === "invalid" ? "測定軸不明" : "測定軸差分",
        x.summary,
        x.status === "unknown" || x.status === "invalid" ? 420 : 360,
        "ユーザー指定の物差し"
      );
    });

    deriveObservationYenDeltas(formData.a, formData.b, formData.caseType).forEach(x => {
      addCandidate(
        "数値差分",
        `${formatYen(x.from)} → ${formatYen(x.to)}｜${formatSignedYen(x.delta)} / ${formatSignedPercent(x.percent)}`,
        340,
        "観測価格の実数差"
      );
    });

    if (!candidates.length) {
      candidates.push({ kind: "共通", text: "大きな差分は検出されなかった。", score: 0, reason: "差分なし" });
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ kind, text, reason }) => ({ kind, text, reason }));
  }

  function shorten(s, n = 110) {
    const t = normalizeText(s);
    return t.length > n ? t.slice(0, n) + "…" : t;
  }

  function outcomeComparableKey(text) {
    const normalized = normalizeOutcomeLabel(text || "");
    if (!normalized) return "";

    // #009: 「同じ意味の単純な数値表記」だけを安全に同値化する。
    // 数字が1個だけの形式に限定し、日付や複数指標など複雑なRESULTは文字列比較のまま残す。
    const match = normalized.match(/^([^0-9+\-]*?)([+\-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+))(\s*%?)([^0-9]*?)$/);
    if (!match) return `text:${normalized}`;

    const [, prefix, numericText, unit, suffix] = match;
    const numericValue = Number(numericText.replace(/,/g, ""));
    if (!Number.isFinite(numericValue)) return `text:${normalized}`;

    return `numeric:${prefix.trim().toLowerCase()}|${numericValue}|${unit.trim()}|${suffix.trim().toLowerCase()}`;
  }

  function classifyOutcomeState(outcomeA, outcomeB) {
    const a = normalizeOutcomeLabel(outcomeA || "");
    const b = normalizeOutcomeLabel(outcomeB || "");
    const aObserved = !!a;
    const bObserved = !!b;

    if (!aObserved && !bObserved) {
      return { code: "unobserved", a, b, aObserved, bObserved, hasDifference: false };
    }
    if (aObserved !== bObserved) {
      return { code: "partial", a, b, aObserved, bObserved, hasDifference: false };
    }

    const aKey = outcomeComparableKey(a);
    const bKey = outcomeComparableKey(b);
    if (aKey === bKey) {
      return { code: "same", a, b, aObserved, bObserved, hasDifference: false };
    }
    return { code: "different", a, b, aObserved, bObserved, hasDifference: true };
  }

  function buildNextCheck(raw, semantic, outcomeA, outcomeB, mode) {
    raw = normalizeRawShape(raw);
    if (raw.unknown.length) return "不明 / 欠損になっている観測情報を補い、同じ条件で再比較する。";

    const outcomeState = classifyOutcomeState(outcomeA, outcomeB);

    if (outcomeState.code === "partial") {
      return outcomeState.aObserved
        ? "RESULT Bが未観測。B側の結果を取得してから結果差を比較する。"
        : "RESULT Aが未観測。A側の結果を取得してから結果差を比較する。";
    }

    if (outcomeState.code === "same") {
      return "RESULT A/Bは同じ結果。今回は結果差なしとして、本文差分を1点だけ残し、次のCASEで結果が分かれるか確認する。";
    }

    if (mode === "before_after") {
      return "変更前→変更後で動いた最上位差分を1点だけ取り出し、次のCASEでも同じ変更を入れる／戻す。";
    }

    if (mode === "three_way") {
      return "3-way競合検査を確認し、CONFLICTは人間が採用側を決める。UNKNOWNは対応位置またはBASE値を補って再検査する。";
    }

    if (mode === "success_failure") {
      if (outcomeState.hasDifference) {
        return "観測された結果差と同時に存在する最上位差分を1点だけ次のCASEで揃える／変える。因果はまだ確定しない。";
      }
      return "まず生差分を固定して保存し、結果が観測されたら後から重ねる。結果ラベルは先に決めない。";
    }

    if (outcomeState.hasDifference) {
      if (semantic.length) return "A/Bの最上位差分を1点だけ残す／変え、結果がどう動くか確認する。";
      return "A/Bの条件をできるだけ揃え、差分を1点だけ変更する。";
    }

    return "A/Bの差を固定して保存し、結果が出たら後から重ねて見る。";
  }

  function cloneRaw(raw) {
    return JSON.parse(JSON.stringify(raw || {}));
  }

  function analyze(formData, fixedRaw = null) {
    const hasTextInput = !!normalizeText(formData.a || "") || !!normalizeText(formData.b || "");
    const raw = fixedRaw
      ? cloneRaw(fixedRaw)
      : (hasTextInput || formData.observation?.label)
        ? calcRawDiff(formData.a || "", formData.b || "", formData.observation)
        : normalizeRawShape(null);
    const safeRaw = normalizeRawShape(raw);
    const semantic = hasTextInput
      ? semanticDiff(formData.a || "", formData.b || "", formData.caseType, safeRaw)
      : [];
    const counts = rawCounts(safeRaw);
    const threeWay = formData.mode === "three_way"
      ? deriveThreeWay({ ...formData, caseType: formData.caseType })
      : null;
    const outcomeState = classifyOutcomeState(formData.outcomeA, formData.outcomeB);
    const outcomeSummary = outcomeState.code === "unobserved"
      ? "結果未観測"
      : `A: ${formData.outcomeA || "結果未観測"} / B: ${formData.outcomeB || "結果未観測"}`;

    const factParts = [];
    if (counts.added) factParts.push(`追加 ${counts.added}件`);
    if (counts.removed) factParts.push(`削除 ${counts.removed}件`);
    if (counts.changed) factParts.push(`変更 ${counts.changed}件`);
    if (counts.common) factParts.push(`共通 ${counts.common}件`);
    if (counts.unknown) factParts.push(`不明/欠損 ${counts.unknown}件`);
    const metricCounts = metricDiffCounts(formData.metrics || []);
    if (metricCounts.total) {
      factParts.push(`測定軸 ${metricCounts.total}件（変化 ${metricCounts.changed} / 同一 ${metricCounts.same} / 不明 ${metricCounts.unknown}）`);
    }
    if (threeWay) {
      factParts.push(`3-way CONFLICT ${threeWay.counts.conflict} / SAFE ${threeWay.counts.safe} / UNKNOWN ${threeWay.counts.unknown}`);
    }
    if (!factParts.length) factParts.push("検出可能な差分なし");

    const association = outcomeState.code === "different"
      ? "差分と結果の変化が同時に存在している。現時点では関連候補であり、因果は未確定。"
      : outcomeState.code === "same"
        ? "RESULT A/Bは同じため、今回は結果差なし。本文差分と結果変化の関連は判定しない。"
        : outcomeState.code === "partial"
          ? "片側の結果が未観測のため、結果差との関連はまだ判定しない。"
          : "結果が未観測のため、結果との関連はまだ判定しない。";

    const hypothesis = outcomeState.hasDifference && semantic.length
      ? `仮説候補：${semanticText(semantic[0])} この差が結果に関係した可能性はあるが、追加CASEで確認が必要。`
      : "原因仮説は保留。観測CASEを増やしてから検討する。";

    return {
      id: "case_" + Date.now(),
      createdAt: new Date().toISOString(),
      title: formData.subject
        ? `${formData.subject}｜${modeLabels[formData.mode]}`
        : `${typeLabels[formData.caseType]}｜${modeLabels[formData.mode]}`,
      ...formData,
      raw,
      semantic,
      threeWay,
      fingerprints: deriveFingerprints(formData),
      outcomeSummary,
      fact: factParts.join(" / "),
      association,
      hypothesis,
      outcomeState: outcomeState.code,
      important: buildImportant(safeRaw, semantic, formData, outcomeState.hasDifference),
      nextCheck: buildNextCheck(safeRaw, semantic, formData.outcomeA, formData.outcomeB, formData.mode),
      schemaVersion: SCHEMA_VERSION,
      analysisVersion: ANALYSIS_VERSION
    };
  }

  function buildIncompatible(formData) {
    return {
      id: "case_" + Date.now(),
      createdAt: new Date().toISOString(),
      title: `比較不能｜${typeLabels[formData.caseTypeA]} ↔ ${typeLabels[formData.caseTypeB]}`,
      ...formData,
      caseType: formData.caseTypeA,
      incompatible: true,
      raw: { common: [], added: [], removed: [], changed: [], unknown: [] },
      semantic: [],
      outcomeSummary: "CASE TYPEが異なるため、結果は重ねない。",
      fact: "比較不能",
      association: "CASE TYPEが異なるため判定しない。",
      hypothesis: "原因仮説は作らない。",
      important: [{ kind: "比較不能", text: "CASE A と CASE B の種類が異なるため、同じSchemaでは比較しない。" }],
      nextCheck: "同じCASE TYPE同士を選び直してから比較する。",
      schemaVersion: SCHEMA_VERSION,
      analysisVersion: ANALYSIS_VERSION
    };
  }

  function renderList(container, items, formatter) {
    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = '<p>なし</p>';
      return;
    }
    const ul = document.createElement("ul");
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = formatter ? formatter(item) : item;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderRawList(container, items, kind, formatter) {
    container.innerHTML = "";
    items = Array.isArray(items) ? items : [];
    if (!items.length) {
      container.innerHTML = '<p>なし</p>';
      return;
    }
    const ul = document.createElement("ul");
    items.forEach((item, index) => {
      const ref = `${kind}:${index + 1}`;
      const li = document.createElement("li");
      li.dataset.rawRef = ref;
      li.id = `raw-${kind}-${index + 1}`;
      const text = formatter ? formatter(item) : item;
      li.textContent = `[${ref}] ${text}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderSemantic(container, semantic) {
    container.innerHTML = "";
    if (!semantic.length) {
      container.textContent = "意味差分はまだ見つからない。ここは初号機の簡易ヒューリスティック。";
      return;
    }

    semantic.forEach((item, index) => {
      const text = semanticText(item);
      const refs = typeof item === "string" ? [] : (item.rawRefs || []);
      const rule = typeof item === "string" ? "legacy_text_only" : (item.rule || "unspecified");

      const block = document.createElement("div");
      block.className = "important-item";
      const refHtml = refs.length
        ? refs.map(ref => ref.startsWith("input:")
            ? `<span><small>根拠 ${escapeHtml(ref)}</small></span>`
            : `<button type="button" class="ghost" data-semantic-ref="${escapeHtml(ref)}">根拠 ${escapeHtml(ref)}</button>`
          ).join(" ")
        : '<small>根拠参照なし（旧形式）</small>';

      block.innerHTML =
        `<small>意味差分 ${index + 1}｜rule: ${escapeHtml(rule)}</small>` +
        `<strong>${escapeHtml(text)}</strong>` +
        `<div class="case-actions">${refHtml}</div>`;
      container.appendChild(block);
    });

    container.querySelectorAll("[data-semantic-ref]").forEach(btn => {
      btn.addEventListener("click", () => {
        const ref = btn.dataset.semanticRef;
        const target = document.querySelector(`[data-raw-ref="${ref}"]`);
        if (!target) return;
        document.querySelectorAll("[data-raw-ref]").forEach(el => { el.style.outline = ""; });
        target.style.outline = "2px solid currentColor";
        target.style.outlineOffset = "3px";
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          target.style.outline = "";
          target.style.outlineOffset = "";
        }, 1800);
      });
    });
  }

  function deriveCurrentOutcomeView(a) {
    if (effectiveIncompatible(a)) {
      return {
        outcomeSummary: "CASE TYPEが異なるため、結果は重ねない。",
        association: "CASE TYPEが異なるため判定しない。",
        hypothesis: "原因仮説は作らない。",
        nextCheck: "同じCASE TYPE同士を選び直してから比較する。",
        important: [{ kind: "比較不能", text: "CASE A と CASE B の種類が異なるため、同じSchemaでは比較しない。" }]
      };
    }

    const raw = normalizeRawShape(a.raw);
    const semantic = a.semantic || [];
    const outcomeState = classifyOutcomeState(a.outcomeA || "", a.outcomeB || "");
    const outcomeSummary = outcomeState.code === "unobserved"
      ? "結果未観測"
      : `A: ${a.outcomeA || "結果未観測"} / B: ${a.outcomeB || "結果未観測"}`;
    const association = outcomeState.code === "different"
      ? "差分と結果の変化が同時に存在している。現時点では関連候補であり、因果は未確定。"
      : outcomeState.code === "same"
        ? "RESULT A/Bは同じため、今回は結果差なし。本文差分と結果変化の関連は判定しない。"
        : outcomeState.code === "partial"
          ? "片側の結果が未観測のため、結果差との関連はまだ判定しない。"
          : "結果が未観測のため、結果との関連はまだ判定しない。";
    const hypothesis = outcomeState.hasDifference && semantic.length
      ? `仮説候補：${semanticText(semantic[0])} この差が結果に関係した可能性はあるが、追加CASEで確認が必要。`
      : "原因仮説は保留。観測CASEを増やしてから検討する。";

    return {
      outcomeSummary,
      association,
      hypothesis,
      nextCheck: buildNextCheck(raw, semantic, a.outcomeA || "", a.outcomeB || "", effectiveMode(a)),
      important: buildImportant(raw, semantic, a, outcomeState.hasDifference)
    };
  }

  function resetResultView() {
    $("result-empty").classList.remove("hidden");
    $("result-content").classList.add("hidden");
    $("save-analysis").disabled = true;
    $("save-analysis").textContent = "事件簿へ保存";
    $("send-portfolio").disabled = true;
    $("result-title").textContent = "まだ鑑識していません";
    $("compatibility-banner").classList.add("hidden");
    $("compatibility-banner").textContent = "";
    $("apply-outcome").disabled = true;
    $("outcome-a").value = "";
    $("outcome-b").value = "";
    $("outcome-summary").textContent = "";
    $("fact-text").textContent = "";
    $("association-text").textContent = "";
    $("hypothesis-text").textContent = "";
    $("next-check").textContent = "";
    $("semantic-summary").innerHTML = "";
    $("important-list").innerHTML = "";
    $("metric-diff-panel").classList.add("hidden");
    $("metric-diff-list").innerHTML = "";
    $("history-panel").classList.add("hidden");
    $("history-summary").innerHTML = "";
    $("changeset-panel").classList.add("hidden");
    $("changeset-list").innerHTML = "";
    $("changeset-json").value = "";
    $("changeset-status").textContent = "";
    $("copy-changeset").disabled = true;
    $("threeway-panel").classList.add("hidden");
    $("threeway-summary").innerHTML = "";
    $("threeway-list").innerHTML = "";
    $("threeway-json").value = "";
    $("threeway-status").textContent = "";
    $("copy-threeway").disabled = true;
    $("structured-panel").classList.add("hidden");
    $("structured-summary").innerHTML = "";
    $("structured-list").innerHTML = "";
    $("structured-json").value = "";
    $("structured-status").textContent = "";
    $("copy-structured").disabled = true;
    $("fingerprint-panel").classList.add("hidden");
    $("fingerprint-list").innerHTML = "";
    $("fingerprint-status").textContent = "";
    $("cdc-panel").classList.add("hidden");
    $("cdc-summary").innerHTML = "";
    $("cdc-list").innerHTML = "";
    $("cdc-json").value = "";
    $("cdc-status").textContent = "";
    $("copy-cdc").disabled = true;
    $("open-parent").disabled = true;
    $("open-parent").dataset.id = "";
    $("open-child").disabled = true;
    $("open-child").dataset.id = "";
    $("numeric-diff-panel").classList.add("hidden");
    $("numeric-diff-list").innerHTML = "";
    ["common-list", "added-list", "removed-list", "changed-list", "unknown-list"]
      .forEach(id => { $(id).innerHTML = ""; });
  }

  function renderAnalysis(a) {
    $("result-empty").classList.add("hidden");
    $("result-content").classList.remove("hidden");
    const incompatible = effectiveIncompatible(a);
    $("save-analysis").disabled = incompatible;
    $("send-portfolio").disabled = incompatible;
    $("result-title").textContent = effectiveTitle(a);

    const raw = incompatible ? normalizeRawShape(null) : normalizeRawShape(a.raw);
    $("compatibility-banner").classList.toggle("hidden", !incompatible);
    $("compatibility-banner").textContent = incompatible
      ? `比較不能：CASE Aは「${typeLabels[a.caseTypeA] || a.caseTypeA || "不明"}」、CASE Bは「${typeLabels[a.caseTypeB] || a.caseTypeB || "不明"}」。同じCASE TYPE同士だけ比較します。`
      : "";
    $("apply-outcome").disabled = incompatible;

    renderRawList($("common-list"), raw.common, "common");
    renderRawList($("added-list"), raw.added, "added");
    renderRawList($("removed-list"), raw.removed, "removed");
    renderRawList($("changed-list"), raw.changed, "changed", x => `${shorten(x.from, 55)} → ${shorten(x.to, 55)}`);
    renderRawList($("unknown-list"), raw.unknown, "unknown");

    const metricDiffs = incompatible ? [] : deriveMetricDiffs(a.metrics || []);
    $("metric-diff-panel").classList.toggle("hidden", metricDiffs.length === 0);
    $("metric-diff-list").innerHTML = "";
    metricDiffs.forEach(item => {
      const div = document.createElement("div");
      div.className = "important-item";
      const statusLabel = {
        changed: "CHANGED",
        same: "SAME",
        unknown: "UNKNOWN",
        invalid: "INVALID"
      }[item.status] || item.status;
      div.innerHTML =
        `<small>${escapeHtml(item.type.toUpperCase())}｜${escapeHtml(statusLabel)}</small>` +
        `<strong>${escapeHtml(item.label)}</strong>` +
        `<p class="metric-delta-line">${escapeHtml(item.summary)}</p>`;
      $("metric-diff-list").appendChild(div);
    });

    const historyInfo = incompatible ? null : historyNeighbors(a);
    const hasHistorySubject = !!a.subject;
    $("history-panel").classList.toggle("hidden", !hasHistorySubject);
    if (hasHistorySubject) {
      const rev = historyInfo?.revision;
      const total = historyInfo?.history?.length || (rev ? rev : 1);
      const parentMissing = !!a.parentId && !historyInfo?.parent;
      $("history-summary").innerHTML =
        `<span class="revision-chip">r${escapeHtml(rev || "?")} / ${escapeHtml(total)}</span>` +
        `<strong>${escapeHtml(a.subject)}</strong>` +
        `<p>${parentMissing ? "親記録は削除済み。履歴番号は保存値を維持する。" : historyInfo?.parent ? "前の版からつながっている。" : "この対象の先頭記録。"}</p>`;
      $("open-parent").disabled = !historyInfo?.parent;
      $("open-parent").dataset.id = historyInfo?.parent?.id || "";
      $("open-child").disabled = !historyInfo?.child;
      $("open-child").dataset.id = historyInfo?.child?.id || "";
    }

    const changeSet = incompatible || effectiveMode(a) === "three_way" ? null : deriveChangeSet(a);
    const hasChangeSet = !!changeSet && changeSet.operations.length > 0;
    $("changeset-panel").classList.toggle("hidden", !hasChangeSet);
    $("changeset-list").innerHTML = "";
    $("changeset-json").value = hasChangeSet ? JSON.stringify(changeSet, null, 2) : "";
    $("copy-changeset").disabled = !hasChangeSet;
    $("changeset-status").textContent = hasChangeSet
      ? `${changeSet.operationCount} operation(s)。共通部分は含めていません。`
      : "";
    if (hasChangeSet) {
      changeSet.operations.forEach(operation => {
        const div = document.createElement("div");
        div.className = "important-item changeset-op";
        div.innerHTML =
          `<small>${escapeHtml(operation.op)}｜${escapeHtml(operation.scope.toUpperCase())}</small>` +
          `<strong>${escapeHtml(changeSetOperationText(operation))}</strong>` +
          `<code>${escapeHtml(operation.key)}</code>`;
        $("changeset-list").appendChild(div);
      });
    }

    const threeWay = incompatible ? null : deriveThreeWay(a);
    const hasThreeWay = !!threeWay;
    $("threeway-panel").classList.toggle("hidden", !hasThreeWay);
    $("threeway-list").innerHTML = "";
    $("threeway-json").value = hasThreeWay ? JSON.stringify(threeWay, null, 2) : "";
    $("copy-threeway").disabled = !hasThreeWay;
    $("threeway-status").textContent = "";
    if (hasThreeWay) {
      $("threeway-summary").innerHTML =
        `<div class="merge-badges">` +
        `<span class="merge-badge">CONFLICT ${threeWay.counts.conflict}</span>` +
        `<span class="merge-badge">SAFE ${threeWay.counts.safe}</span>` +
        `<span class="merge-badge">UNKNOWN ${threeWay.counts.unknown}</span>` +
        `</div><strong>${threeWay.autoMergeSafe ? "自動統合候補：競合・不明なし" : "人間確認が必要"}</strong>`;
      if (!threeWay.entries.length) {
        $("threeway-list").innerHTML = '<p class="muted">BASEからA/Bへの変更は検出されませんでした。</p>';
      } else {
        threeWay.entries.forEach(item => {
          const div = document.createElement("div");
          div.className = "important-item " + (item.status === "CONFLICT" ? "merge-conflict" : item.status === "UNKNOWN" ? "merge-unknown" : "merge-safe");
          div.innerHTML =
            `<small>${escapeHtml(item.status)}｜${escapeHtml(item.scope.toUpperCase())}</small>` +
            `<strong>${escapeHtml(threeWayEntryText(item))}</strong>` +
            `<code>${escapeHtml(item.key)}</code>`;
          $("threeway-list").appendChild(div);
        });
      }
    }

    const structured = incompatible ? null : deriveStructuredDiff(a);
    $("structured-panel").classList.toggle("hidden", !structured);
    $("structured-list").innerHTML = "";
    $("structured-json").value = structured ? JSON.stringify(structured, null, 2) : "";
    $("copy-structured").disabled = !structured;
    $("structured-status").textContent = "";
    if (structured) {
      if (!structured.ok) {
        $("structured-summary").innerHTML = '<span class="merge-badge">JSON PARSE ERROR</span>';
        const err = document.createElement("div");
        err.className = "important-item merge-unknown";
        err.innerHTML = `<small>UNKNOWN</small><strong>A: ${escapeHtml(structured.errorA || "OK")} / B: ${escapeHtml(structured.errorB || "OK")}</strong>`;
        $("structured-list").appendChild(err);
      } else {
        $("structured-summary").innerHTML =
          `<span class="merge-badge">ADD ${structured.counts.add}</span>` +
          `<span class="merge-badge">REMOVE ${structured.counts.remove}</span>` +
          `<span class="merge-badge">REPLACE ${structured.counts.replace}</span>` +
          `<span class="merge-badge">TYPE ${structured.counts.typeChange}</span>`;
        if (!structured.operations.length) {
          $("structured-list").innerHTML = '<p class="muted">構造差分なし。</p>';
        } else {
          structured.operations.forEach(op => {
            const div = document.createElement("div");
            div.className = "important-item";
            div.innerHTML =
              `<small>${escapeHtml(op.op)}</small>` +
              `<strong>${escapeHtml(structuredOperationText(op))}</strong>` +
              `<code class="json-path">${escapeHtml(op.path)}</code>`;
            $("structured-list").appendChild(div);
          });
        }
      }
    }

    const fingerprints = incompatible ? null : deriveFingerprints(a);
    $("fingerprint-panel").classList.toggle("hidden", !fingerprints);
    $("fingerprint-list").innerHTML = "";
    if (fingerprints) {
      const cards = [];
      if (fingerprints.base) cards.push(["BASE", fingerprints.base]);
      cards.push(["A", fingerprints.a], ["B", fingerprints.b]);
      cards.forEach(([label, value]) => {
        const div = document.createElement("div");
        div.className = "fingerprint-card";
        div.innerHTML = `<small>${label}</small><code>${escapeHtml(value)}</code>`;
        $("fingerprint-list").appendChild(div);
      });
      $("fingerprint-status").textContent = fingerprints.sameAB
        ? "A/Bは同一状態指紋。内容差分なし候補。"
        : "A/Bの状態指紋は異なる。";
      $("fingerprint-panel").classList.toggle("fingerprint-same", fingerprints.sameAB);
      $("fingerprint-panel").classList.toggle("fingerprint-diff", !fingerprints.sameAB);
    }

    const cdc = incompatible ? null : deriveCdcPacket(a);
    const hasCdc = !!cdc && cdc.events.length > 0;
    $("cdc-panel").classList.toggle("hidden", !hasCdc);
    $("cdc-list").innerHTML = "";
    $("cdc-json").value = hasCdc ? JSON.stringify(cdc, null, 2) : "";
    $("copy-cdc").disabled = !hasCdc;
    $("cdc-status").textContent = hasCdc ? "変更のある項目だけを流しています。" : "";
    if (hasCdc) {
      $("cdc-summary").innerHTML =
        `<span class="merge-badge">INSERT ${cdc.counts.insert}</span>` +
        `<span class="merge-badge">DELETE ${cdc.counts.delete}</span>` +
        `<span class="merge-badge">UPDATE ${cdc.counts.update}</span>` +
        `<span class="merge-badge">TYPE ${cdc.counts.typeChange}</span>` +
        `<span class="merge-badge">REVIEW ${cdc.counts.review}</span>`;
      cdc.events.forEach(event => {
        const div = document.createElement("div");
        const cls = event.action === "INSERT" ? "cdc-insert"
          : event.action === "DELETE" ? "cdc-delete"
            : event.action === "UPDATE" || event.action === "TYPE_CHANGE" ? "cdc-update"
              : "cdc-review";
        div.className = "important-item " + cls;
        div.innerHTML =
          `<small>${escapeHtml(event.action)}｜${escapeHtml(event.scope.toUpperCase())}</small>` +
          `<strong>${escapeHtml(cdcEventText(event))}</strong>`;
        $("cdc-list").appendChild(div);
      });
    }

    const numericDeltas = incompatible
      ? []
      : deriveObservationYenDeltas(a.a, a.b, effectiveCaseType(a));
    $("numeric-diff-panel").classList.toggle("hidden", numericDeltas.length === 0);
    $("numeric-diff-list").innerHTML = "";
    numericDeltas.forEach(item => {
      const div = document.createElement("div");
      div.className = "important-item";
      div.innerHTML =
        `<small>PRICE A → B</small>` +
        `<strong>${escapeHtml(formatYen(item.from))} → ${escapeHtml(formatYen(item.to))}</strong>` +
        `<p>${escapeHtml(formatSignedYen(item.delta))} / ${escapeHtml(formatSignedPercent(item.percent))}</p>`;
      $("numeric-diff-list").appendChild(div);
    });

    if (incompatible) {
      $("semantic-summary").textContent = "比較不能のため意味差分は判定しない。";
    } else {
      renderSemantic($("semantic-summary"), a.semantic || []);
    }

    const outcomeView = deriveCurrentOutcomeView(a);
    $("outcome-a").value = a.outcomeA || "";
    $("outcome-b").value = a.outcomeB || "";
    $("outcome-summary").textContent = outcomeView.outcomeSummary;
    $("fact-text").textContent = incompatible ? "比較不能" : displayFact(a);
    $("association-text").textContent = outcomeView.association;
    $("hypothesis-text").textContent = outcomeView.hypothesis;
    $("next-check").textContent = outcomeView.nextCheck;

    $("important-list").innerHTML = "";
    outcomeView.important.forEach(item => {
      const div = document.createElement("div");
      div.className = "important-item";
      const reason = item.reason ? `｜${item.reason}` : "";
      div.innerHTML = `<small>${escapeHtml(item.kind + reason)}</small><strong>${escapeHtml(item.text)}</strong>`;
      $("important-list").appendChild(div);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readCases() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function writeCases(cases) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }

  function readSourceCases() {
    try {
      const data = JSON.parse(localStorage.getItem(SOURCE_STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function writeSourceCases(cases) {
    localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(cases));
  }

  function readEventLog() {
    try {
      const data = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function writeEventLog(events) {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
  }

  function buildEventEntries(record) {
    const packet = deriveCdcPacket(record);
    if (!packet) return [];
    return packet.events.map(event => ({
      id: `evt_${record.id}_${event.seq}`,
      comparisonId: record.id,
      subject: record.subject || "",
      revision: inferRevision(record),
      createdAt: record.createdAt,
      action: event.action,
      scope: event.scope,
      key: event.key,
      path: event.path,
      label: event.label,
      oldValue: event.oldValue,
      value: event.value,
      delta: event.delta,
      note: event.note,
      fingerprintA: packet.fingerprintA,
      fingerprintB: packet.fingerprintB
    }));
  }

  function appendEventLogForRecord(record) {
    if (!record?.id) return;
    const existing = readEventLog().filter(x => x.comparisonId !== record.id);
    const additions = buildEventEntries(record);
    writeEventLog([...additions, ...existing].slice(0, 2000));
  }

  function renderEventLog() {
    const events = readEventLog();
    const list = $("event-log-list");
    const replay = $("event-replay");
    const summary = $("event-log-summary");
    if (!list || !replay || !summary) return;

    summary.innerHTML =
      `<span class="merge-badge">EVENTS ${events.length}</span>` +
      `<span class="merge-badge">SUBJECTS ${new Set(events.map(x => x.subject).filter(Boolean)).size}</span>`;

    const bySubject = new Map();
    events.filter(x => x.subject).forEach(event => {
      if (!bySubject.has(event.subject)) bySubject.set(event.subject, []);
      bySubject.get(event.subject).push(event);
    });

    replay.innerHTML = "";
    [...bySubject.entries()].slice(0, 8).forEach(([subject, rows]) => {
      const revisions = [...new Set(rows.map(x => x.revision).filter(Boolean))].sort((a,b)=>a-b);
      const div = document.createElement("div");
      div.className = "event-row replay-lane";
      div.innerHTML =
        `<small>REPLAY｜${rows.length} EVENTS</small>` +
        `<strong>${escapeHtml(subject)}</strong>` +
        `<p class="muted">${escapeHtml(revisions.length ? revisions.map(x => "r"+x).join(" → ") : "revision未採番")}</p>`;
      replay.appendChild(div);
    });

    list.innerHTML = "";
    if (!events.length) {
      list.innerHTML = '<p class="muted">保存された差分イベントはまだありません。</p>';
      return;
    }

    events.slice(0, 30).forEach(event => {
      const div = document.createElement("div");
      const cls = event.action === "INSERT" ? "cdc-insert"
        : event.action === "DELETE" ? "cdc-delete"
          : event.action === "UPDATE" || event.action === "TYPE_CHANGE" ? "cdc-update"
            : "cdc-review";
      div.className = "event-row " + cls;
      const target = event.path || event.key || event.label || "差分";
      div.innerHTML =
        `<small><span>${escapeHtml(formatCaseDate(event.createdAt))}</span><span>${escapeHtml(event.action)}</span><span>${escapeHtml(event.subject || "対象未指定")}</span><span>r${escapeHtml(event.revision || "?")}</span></small>` +
        `<strong>${escapeHtml(target)}</strong>`;
      list.appendChild(div);
    });
  }

  function consumeAkechiInbound() {
    let packet = null;
    try {
      packet = JSON.parse(localStorage.getItem(AKECHI_INBOX_KEY) || "null");
    } catch {
      return false;
    }
    if (!packet || packet.schema !== "akechi-pipe-v01" || !packet.a || !packet.b) return false;

    $("mode").value = ["ab", "before_after", "success_failure", "three_way"].includes(packet.mode) ? packet.mode : "ab";
    updateThreeWayUI();
    $("case-type-a").value = packet.caseTypeA || "article";
    $("case-type-b").value = packet.caseTypeB || "article";
    $("subject").value = packet.subject || "";
    loadMetricRows(Array.isArray(packet.metrics) ? packet.metrics : []);
    $("case-a").value = packet.a;
    $("case-b").value = packet.b;
    $("evidence").value = packet.evidence || "";
    localStorage.removeItem(AKECHI_INBOX_KEY);
    showScreen("input");
    return true;
  }

  function sendCurrentToPortfolioDiary() {
    if (!currentAnalysis || effectiveIncompatible(currentAnalysis)) return;
    const outcomeView = deriveCurrentOutcomeView(currentAnalysis);
    const important = (outcomeView.important || [])
      .map((item, index) => `${index + 1}. [${item.kind}] ${item.text}`)
      .join("\n");
    const numeric = deriveObservationYenDeltas(
      currentAnalysis.a,
      currentAnalysis.b,
      effectiveCaseType(currentAnalysis)
    ).map(x =>
      `${formatYen(x.from)} → ${formatYen(x.to)}｜${formatSignedYen(x.delta)} / ${formatSignedPercent(x.percent)}`
    ).join("\n");

    const metricText = deriveMetricDiffs(currentAnalysis.metrics || [])
      .map(x => x.summary)
      .join("\n");

    const changeSet = effectiveMode(currentAnalysis) === "three_way"
      ? { operations: [] }
      : deriveChangeSet(currentAnalysis);
    const changeSetText = changeSet.operations
      .map((op, index) => `${index + 1}. [${op.op}] ${changeSetOperationText(op)}`)
      .join("\n");

    const raw = [
      "差分24時でA/B比較を実施した。",
      "比較: " + effectiveTitle(currentAnalysis),
      "FACT: " + displayFact(currentAnalysis),
      "比較対象: " + (currentAnalysis.subject || "未指定"),
      "測定軸差分:",
      metricText || "未観測",
      "変更セット:",
      changeSetText || (effectiveMode(currentAnalysis) === "three_way" ? "3-wayでは未生成" : "変更なし"),
      "3-way:",
      effectiveMode(currentAnalysis) === "three_way"
        ? (() => {
            const t = deriveThreeWay(currentAnalysis);
            return t ? `CONFLICT ${t.counts.conflict} / SAFE ${t.counts.safe} / UNKNOWN ${t.counts.unknown}` : "未観測";
          })()
        : "対象外",
      "数値差分:",
      numeric || "未観測",
      "重要差分:",
      important || "未観測",
      "結果: " + outcomeView.outcomeSummary,
      "次の確認: " + outcomeView.nextCheck
    ].join("\n");
    const evidence = String(currentAnalysis.evidence || "")
      .split("|")
      .map(x => x.trim())
      .filter(Boolean);

    localStorage.setItem(PORTFOLIO_INBOX_KEY, JSON.stringify({
      schema: "akechi-pipe-v01",
      source: "diff24",
      createdAt: new Date().toISOString(),
      project: "差分24時",
      type: "研究",
      raw,
      evidence
    }));
    location.href = "../portfolio-diary/";
  }

  function makeSourceCase(side, analysis) {
    const isA = side === "A";
    return {
      id: `source_${Date.now()}_${side.toLowerCase()}_${Math.random().toString(36).slice(2,7)}`,
      comparisonId: analysis.id,
      side,
      caseType: isA ? (analysis.caseTypeA || analysis.caseType) : (analysis.caseTypeB || analysis.caseType),
      text: isA ? analysis.a : analysis.b,
      outcome: isA ? (analysis.outcomeA || "") : (analysis.outcomeB || ""),
      evidence: analysis.evidence || "",
      subject: analysis.subject || "",
      metrics: (analysis.metrics || []).map(m => ({
        label: m.label || "",
        type: m.type || "text",
        value: isA ? (m.a ?? "") : (m.b ?? ""),
        unit: m.unit || ""
      })),
      observation: analysis.observation?.label
        ? {
            label: analysis.observation.label,
            state: isA ? analysis.observation.aState : analysis.observation.bState
          }
        : null,
      createdAt: analysis.createdAt,
      schemaVersion: SCHEMA_VERSION
    };
  }

  function sourceMatchesComparison(source, sourceId, side, comparisonId) {
    return !!source &&
      source.id === sourceId &&
      source.side === side &&
      source.comparisonId === comparisonId;
  }

  function migrateLegacySourceCases() {
    const comparisons = readCases();
    const sources = readSourceCases();
    let changed = false;

    comparisons.forEach(c => {
      if (!hasComparablePayload(c) || effectiveIncompatible(c)) return;

      const sourceCaseIds = Array.isArray(c.sourceCaseIds)
        ? [...c.sourceCaseIds.slice(0, 2)]
        : [];

      ["A", "B"].forEach((side, index) => {
        const sourceId = sourceCaseIds[index];
        let sourceIndex = sourceId ? sources.findIndex(x => x.id === sourceId) : -1;
        let source = sourceIndex >= 0 ? sources[sourceIndex] : null;
        const sourceIsValid = sourceMatchesComparison(source, sourceId, side, c.id);

        if (!sourceIsValid) {
          const existingCorrectIndex = sources.findIndex(x =>
            x.comparisonId === c.id && x.side === side
          );

          if (existingCorrectIndex >= 0) {
            sourceIndex = existingCorrectIndex;
            source = sources[existingCorrectIndex];
            sourceCaseIds[index] = source.id;
            changed = true;
          } else {
            const replacement = makeSourceCase(side, c);
            sourceCaseIds[index] = replacement.id;
            sources.push(replacement);
            sourceIndex = sources.length - 1;
            source = replacement;
            changed = true;
          }
        }

        const expectedCaseType = side === "A"
          ? (c.caseTypeA || c.caseType)
          : (c.caseTypeB || c.caseType);
        const expectedText = side === "A" ? c.a : c.b;
        const expectedOutcome = side === "A" ? (c.outcomeA || "") : (c.outcomeB || "");
        const expectedEvidence = c.evidence || "";
        const expectedObservation = c.observation?.label
          ? {
              label: c.observation.label,
              state: side === "A" ? c.observation.aState : c.observation.bState
            }
          : null;

        if (
          source.caseType !== expectedCaseType ||
          source.text !== expectedText ||
          source.outcome !== expectedOutcome ||
          source.evidence !== expectedEvidence ||
          JSON.stringify(source.observation || null) !== JSON.stringify(expectedObservation)
        ) {
          sources[sourceIndex] = {
            ...source,
            caseType: expectedCaseType,
            text: expectedText,
            outcome: expectedOutcome,
            evidence: expectedEvidence,
            observation: expectedObservation
          };
          changed = true;
        }
      });

      if (
        !Array.isArray(c.sourceCaseIds) ||
        c.sourceCaseIds.length !== 2 ||
        c.sourceCaseIds[0] !== sourceCaseIds[0] ||
        c.sourceCaseIds[1] !== sourceCaseIds[1]
      ) {
        c.sourceCaseIds = sourceCaseIds;
        changed = true;
      }
    });

    const allowedSourceIdsByComparison = new Map();
    comparisons.forEach(c => {
      if (!hasComparablePayload(c) || effectiveIncompatible(c)) return;
      if (!Array.isArray(c.sourceCaseIds) || c.sourceCaseIds.length !== 2) return;
      allowedSourceIdsByComparison.set(c.id, new Set(c.sourceCaseIds));
    });

    for (let index = sources.length - 1; index >= 0; index--) {
      const source = sources[index];
      const allowedIds = allowedSourceIdsByComparison.get(source.comparisonId);
      if (!allowedIds || allowedIds.has(source.id)) continue;
      sources.splice(index, 1);
      changed = true;
    }

    if (changed) {
      writeCases(comparisons);
      writeSourceCases(sources);
    }
  }

  function normalizeSubjectKey(value) {
    return normalizeText(String(value || "")).normalize("NFC").toLowerCase();
  }

  function sameHistorySubject(a, b) {
    const aKey = normalizeSubjectKey(a?.subject);
    const bKey = normalizeSubjectKey(b?.subject);
    if (!aKey || !bKey || aKey !== bKey) return false;
    const aType = effectiveCaseType(a);
    const bType = effectiveCaseType(b);
    return !aType || !bType || aType === bType;
  }

  function subjectHistory(record, cases = readCases()) {
    if (!record?.subject) return [];
    return cases
      .filter(c => !effectiveIncompatible(c) && sameHistorySubject(c, record))
      .sort((a, b) => {
        const at = Date.parse(a.createdAt || "") || 0;
        const bt = Date.parse(b.createdAt || "") || 0;
        return at - bt;
      });
  }

  function inferRevision(record, cases = readCases()) {
    if (Number.isInteger(record?.revision) && record.revision > 0) return record.revision;
    const history = subjectHistory(record, cases);
    const index = history.findIndex(c => c.id === record.id);
    return index >= 0 ? index + 1 : null;
  }

  function historyNeighbors(record, cases = readCases()) {
    const history = subjectHistory(record, cases);
    const index = history.findIndex(c => c.id === record.id);
    const parentById = record?.parentId ? cases.find(c => c.id === record.parentId) || null : null;
    return {
      history,
      index,
      parent: parentById || (index > 0 ? history[index - 1] : null),
      child: index >= 0 && index < history.length - 1 ? history[index + 1] : null,
      revision: inferRevision(record, cases)
    };
  }

  function attachHistoryMetadata(record, existingCases) {
    if (!record?.subject) return record;
    if (Number.isInteger(record.revision) && record.revision > 0) return record;

    const same = existingCases
      .filter(c => !effectiveIncompatible(c) && sameHistorySubject(c, record))
      .sort((a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0));
    const previous = same[0] || null;
    const previousRevision = previous ? inferRevision(previous, existingCases) : null;

    return {
      ...record,
      parentId: previous ? previous.id : null,
      revision: previousRevision ? previousRevision + 1 : 1
    };
  }

  function openHistoryRecord(id) {
    if (!id) return;
    const found = readCases().find(x => x.id === id);
    if (!found) return;
    currentAnalysis = found;
    $("save-analysis").textContent = "保存済み";
    renderAnalysis(found);
    showScreen("result");
  }

  function saveCurrent() {
    if (!currentAnalysis || effectiveIncompatible(currentAnalysis)) return;
    if (deletedAnalysisIds.has(currentAnalysis.id)) {
      currentAnalysis = null;
      resetResultView();
      return;
    }

    const comparisons = readCases();
    const sources = readSourceCases();
    const existingIndex = comparisons.findIndex(x => x.id === currentAnalysis.id);

    if (existingIndex >= 0) {
      const previous = comparisons[existingIndex];
      const sourceCaseIds = [...(previous.sourceCaseIds || currentAnalysis.sourceCaseIds || [])];

      ["A", "B"].forEach((side, index) => {
        const sourceId = sourceCaseIds[index];
        const sourceIndex = sourceId ? sources.findIndex(x => x.id === sourceId) : -1;
        const source = sourceIndex >= 0 ? sources[sourceIndex] : null;
        const sourceIsValid = sourceMatchesComparison(source, sourceId, side, currentAnalysis.id);
        let validSourceIndex = sourceIndex;

        if (!sourceIsValid) {
          const existingCorrectIndex = sources.findIndex(x =>
            x.comparisonId === currentAnalysis.id && x.side === side
          );

          if (existingCorrectIndex >= 0) {
            validSourceIndex = existingCorrectIndex;
            sourceCaseIds[index] = sources[existingCorrectIndex].id;
          } else {
            const replacement = makeSourceCase(side, currentAnalysis);
            sourceCaseIds[index] = replacement.id;
            sources.push(replacement);
            validSourceIndex = sources.length - 1;
          }
        }

        sources[validSourceIndex] = {
          ...sources[validSourceIndex],
          caseType: side === "A"
            ? (currentAnalysis.caseTypeA || currentAnalysis.caseType)
            : (currentAnalysis.caseTypeB || currentAnalysis.caseType),
          text: side === "A" ? currentAnalysis.a : currentAnalysis.b,
          outcome: side === "A" ? (currentAnalysis.outcomeA || "") : (currentAnalysis.outcomeB || ""),
          evidence: currentAnalysis.evidence || "",
          subject: currentAnalysis.subject || "",
          metrics: (currentAnalysis.metrics || []).map(m => ({
            label: m.label || "",
            type: m.type || "text",
            value: side === "A" ? (m.a ?? "") : (m.b ?? ""),
            unit: m.unit || ""
          })),
          observation: currentAnalysis.observation?.label
            ? {
                label: currentAnalysis.observation.label,
                state: side === "A" ? currentAnalysis.observation.aState : currentAnalysis.observation.bState
              }
            : null
        };
      });

      currentAnalysis.sourceCaseIds = sourceCaseIds;
      comparisons[existingIndex] = currentAnalysis;
    } else {
      currentAnalysis = attachHistoryMetadata(currentAnalysis, comparisons);
      appendEventLogForRecord(currentAnalysis);
      const sourceA = makeSourceCase("A", currentAnalysis);
      const sourceB = makeSourceCase("B", currentAnalysis);
      currentAnalysis.sourceCaseIds = [sourceA.id, sourceB.id];
      comparisons.unshift(currentAnalysis);
      sources.unshift(sourceB);
      sources.unshift(sourceA);
    }

    writeCases(comparisons);
    writeSourceCases(sources);
    $("save-analysis").textContent = "保存済み";
    renderCaseList();
    renderCross();
    renderEventLog();
  }

  function renderCaseList() {
    const filter = $("case-filter").value;
    const cases = readCases().filter(x => filter === "all" || effectiveCaseType(x) === filter);
    const box = $("case-list");
    box.innerHTML = "";

    if (!cases.length) {
      box.innerHTML = '<div class="empty-state">事件簿はまだ空です。</div>';
      return;
    }

    cases.forEach(c => {
      const card = document.createElement("article");
      card.className = "case-card";
      const date = formatCaseDate(c.createdAt);
      card.innerHTML = `
        <div class="case-meta">
          <span>${escapeHtml(date)}</span>
          <span>${escapeHtml(typeLabels[effectiveCaseType(c)] || effectiveCaseType(c) || "種類不明")}</span>
          <span>${escapeHtml(modeLabels[effectiveMode(c)] || effectiveMode(c))}</span>
          ${c.subject ? `<span>r${escapeHtml(inferRevision(c, cases) || "?")}</span>` : ""}
        </div>
        <h3>${escapeHtml(effectiveTitle(c))}</h3>
        <p>${escapeHtml(displayFact(c))}</p>
        <div class="case-actions">
          <button class="ghost" data-open="${c.id}">開く</button>
          <button class="danger" data-delete="${c.id}">削除</button>
        </div>`;
      box.appendChild(card);
    });

    box.querySelectorAll("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const found = readCases().find(x => x.id === btn.dataset.open);
        if (!found) return;
        currentAnalysis = found;
        $("save-analysis").textContent = "保存済み";
        renderAnalysis(found);
        showScreen("result");
      });
    });

    box.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delete;
        const target = readCases().find(x => x.id === id);
        if (!target) return;
        if (!confirm(`「${effectiveTitle(target)}」を事件簿から削除しますか？`)) return;
        writeCases(readCases().filter(x => x.id !== id));
        writeEventLog(readEventLog().filter(x => x.comparisonId !== id));
        const sourceIds = new Set(target.sourceCaseIds || []);
        writeSourceCases(
          readSourceCases().filter(x =>
            x.comparisonId !== id && !sourceIds.has(x.id)
          )
        );
        deletedAnalysisIds.add(id);
        if (currentAnalysis?.id === id) {
          currentAnalysis = null;
          resetResultView();
        }
        renderCaseList();
        renderCross();
      });
    });
  }

  function renderCross() {
    const comparisons = readCases().filter(c => !effectiveIncompatible(c));
    const sources = readSourceCases();
    const referencedSourceIds = new Set(
      comparisons.flatMap(c => Array.isArray(c.sourceCaseIds) ? c.sourceCaseIds : [])
    );
    const canonicalSources = sources.filter(source => referencedSourceIds.has(source.id));
    const counts = { application: 0, article: 0, web: 0, observation: 0, generic: 0, json: 0 };
    canonicalSources.forEach(c => { if (counts[c.caseType] !== undefined) counts[c.caseType]++; });

    $("stat-total").textContent = String(canonicalSources.length);
    $("stat-comparisons").textContent = String(comparisons.length);
    $("stat-application").textContent = String(counts.application);
    $("stat-article").textContent = String(counts.article);
    $("stat-web").textContent = String(counts.web);
    $("stat-observation").textContent = String(counts.observation);

    const warning = $("small-n-warning");
    warning.textContent = `元CASE ${canonicalSources.length}件 / 比較記録 ${comparisons.length}件。反復判定は CASE TYPE × 比較モード ごと。結果比較だけは outcomeState も分離し、別の箱は合算しない。`;

    const caseTypes = ["application", "article", "web", "observation", "generic", "json"];
    const modes = ["ab", "before_after", "success_failure"];
    const outcomeStateLabels = {
      different: "結果差あり",
      same: "結果差なし",
      partial: "片側未観測",
      unobserved: "未観測"
    };
    const sections = [];

    function comparisonOutcomeState(c) {
      return classifyOutcomeState(c.outcomeA || "", c.outcomeB || "").code;
    }

    function outcomeTransitionKey(c) {
      const aKey = outcomeComparableKey(c.outcomeA || "");
      const bKey = outcomeComparableKey(c.outcomeB || "");
      return `${aKey} → ${bKey}`;
    }

    function outcomeTransitionLabel(c) {
      const a = normalizeOutcomeLabel(c.outcomeA || "");
      const b = normalizeOutcomeLabel(c.outcomeB || "");
      return `${a} → ${b}`;
    }

    function sameOutcomeKey(c) {
      return outcomeComparableKey(c.outcomeA || c.outcomeB || "");
    }

    function sameOutcomeLabel(c) {
      return normalizeOutcomeLabel(c.outcomeA || c.outcomeB || "");
    }

    function renderCrossScope(caseType, mode, outcomeState = null, transitionKey = null, transitionText = null, sameKey = null, sameLabel = null) {
      const scoped = comparisons.filter(c => {
        if (c.incompatible) return false;
        if (effectiveCaseType(c) !== caseType) return false;
        if (effectiveMode(c) !== mode) return false;
        if (mode === "success_failure") {
          if (comparisonOutcomeState(c) !== outcomeState) return false;
          if (outcomeState === "different" && transitionKey !== null) {
            return outcomeTransitionKey(c) === transitionKey;
          }
          if (outcomeState === "same" && sameKey !== null) {
            return sameOutcomeKey(c) === sameKey;
          }
        }
        return true;
      });

      if (!scoped.length) return;

      const signalCounts = new Map();
      const signalLabels = new Map();
      scoped.forEach(c => {
        const keysInComparison = new Set();
        (c.semantic || []).forEach(s => {
          const key = semanticAggregateKey(s);
          if (!key) return;
          if (key === "rule:normalized_length_delta:similar") return;
          keysInComparison.add(key);
          if (!signalLabels.has(key)) signalLabels.set(key, semanticAggregateLabel(s));
        });
        keysInComparison.forEach(key => {
          signalCounts.set(key, (signalCounts.get(key) || 0) + 1);
        });
      });

      const repeated = [...signalCounts.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, n]) => ({ key, n, label: signalLabels.get(key) || key }));

      const typeLabel = typeLabels[caseType] || caseType;
      const modeLabel = modeLabels[mode] || mode;
      const stateLabel = outcomeState ? outcomeStateLabels[outcomeState] || outcomeState : "";
      const transitionDisplay = outcomeState === "different" && transitionText ? `｜${transitionText}` : "";
      const sameResultLabel = outcomeState === "same" && sameLabel ? `｜${sameLabel}` : "";
      const scopeLabel = outcomeState
        ? `${typeLabel} / ${modeLabel} / ${stateLabel}${transitionDisplay}${sameResultLabel}`
        : `${typeLabel} / ${modeLabel}`;
      const scopeSuffix = transitionKey
        ? `|${encodeURIComponent(transitionKey)}`
        : sameKey
          ? `|${encodeURIComponent(sameKey)}`
          : "";
      const dataScope = outcomeState
        ? `${caseType}|${mode}|${outcomeState}${scopeSuffix}`
        : `${caseType}|${mode}`;
      const header =
        `<div class="section-title"><h3>${escapeHtml(scopeLabel)}</h3><span>${scoped.length} COMPARISON RECORDS</span></div>`;

      if (mode === "success_failure" && (outcomeState === "partial" || outcomeState === "unobserved")) {
        const note = outcomeState === "partial"
          ? "片側の結果が未観測。結果が揃っていないため、反復候補は保留する。"
          : "結果が未観測。結果が揃っていないため、反復候補は保留する。";
        sections.push(
          `<section data-cross-scope="${dataScope}">${header}<p class="muted">${escapeHtml(note)}</p></section>`
        );
        return;
      }

      if (!repeated.length) {
        const note = scoped.length < 2
          ? "この母集団の比較記録が2件未満なので、反復候補はまだ出さない。"
          : "この母集団では、同じ意味差分が2件以上に反復していない。";
        sections.push(
          `<section data-cross-scope="${dataScope}">${header}<p class="muted">${escapeHtml(note)}</p></section>`
        );
        return;
      }

      sections.push(
        `<section data-cross-scope="${dataScope}">${header}` +
        repeated.map(({ label, n }) =>
          `<div class="important-item"><small>${n} / ${scoped.length} COMPARISONS｜${escapeHtml(scopeLabel)}のみ</small><strong>${escapeHtml(label)}</strong></div>`
        ).join("") +
        `</section>`
      );
    }

    caseTypes.forEach(caseType => {
      modes.forEach(mode => {
        if (mode === "success_failure") {
          const transitionGroups = new Map();
          comparisons
            .filter(c =>
              !c.incompatible &&
              effectiveCaseType(c) === caseType &&
              effectiveMode(c) === mode &&
              comparisonOutcomeState(c) === "different"
            )
            .forEach(c => {
              const key = outcomeTransitionKey(c);
              if (!key || transitionGroups.has(key)) return;
              transitionGroups.set(key, outcomeTransitionLabel(c));
            });

          transitionGroups.forEach((label, key) => {
            renderCrossScope(caseType, mode, "different", key, label);
          });

          const sameGroups = new Map();
          comparisons
            .filter(c =>
              !c.incompatible &&
              effectiveCaseType(c) === caseType &&
              effectiveMode(c) === mode &&
              comparisonOutcomeState(c) === "same"
            )
            .forEach(c => {
              const key = sameOutcomeKey(c);
              if (!key || sameGroups.has(key)) return;
              sameGroups.set(key, sameOutcomeLabel(c));
            });

          sameGroups.forEach((label, key) => {
            renderCrossScope(caseType, mode, "same", null, null, key, label);
          });

          ["partial", "unobserved"].forEach(state => {
            renderCrossScope(caseType, mode, state);
          });
        } else {
          renderCrossScope(caseType, mode);
        }
      });
    });

    $("cross-summary").innerHTML =
      `<div class="section-title"><h3>反復候補</h3><span>TYPE × MODE × OUTCOME</span></div>` +
      (sections.length
        ? sections.join("")
        : '<p class="muted">比較記録がまだありません。</p>');
    renderEventLog();
  }

  $("compare-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const base = $("case-base").value;
    const a = $("case-a").value;
    const b = $("case-b").value;
    const metrics = readMetricRows();
    const hasText = !!normalizeText(a) || !!normalizeText(b);
    const hasMetricData = metrics.some(m => m.label && (m.a || m.b || m.base));
    const threeWayMode = $("mode").value === "three_way";
    const hasThreeWayText = threeWayMode && !!normalizeText(base) && !!normalizeText(a) && !!normalizeText(b);
    const hasThreeWayMetric = threeWayMode && metrics.some(m => m.label && m.base && m.a && m.b);
    if (threeWayMode && !hasThreeWayText && !hasThreeWayMetric) {
      alert("3-wayでは、文章ならBASE/A/Bを3つ、測定軸ならBASE/A/B値を入れてください。");
      return;
    }
    if (!hasText && !hasMetricData) {
      alert("CASE A/B または測定軸を1つ以上入れてください。");
      return;
    }

    const caseTypeA = $("case-type-a").value;
    const caseTypeB = $("case-type-b").value;
    const baseData = {
      mode: $("mode").value,
      caseTypeA,
      caseTypeB,
      subject: $("subject").value.trim(),
      metrics,
      base,
      a,
      b,
      observation: $("observation-label").value.trim()
        ? {
            label: $("observation-label").value.trim(),
            aState: $("observation-a-state").value,
            bState: $("observation-b-state").value
          }
        : null,
      outcomeA: "",
      outcomeB: "",
      evidence: $("evidence").value.trim()
    };

    currentAnalysis = caseTypeA === caseTypeB
      ? analyze({ ...baseData, caseType: caseTypeA })
      : buildIncompatible(baseData);

    if (!effectiveIncompatible(currentAnalysis)) {
      currentAnalysis.rawSnapshot = cloneRaw(currentAnalysis.raw);
      currentAnalysis.rawLockedAt = new Date().toISOString();
      currentAnalysis.outcomeAppliedAt = null;
    }

    $("save-analysis").textContent = "事件簿へ保存";
    renderAnalysis(currentAnalysis);
    showScreen("result");
  });

  $("apply-outcome").addEventListener("click", () => {
    if (!currentAnalysis) return;

    if (effectiveIncompatible(currentAnalysis)) return;

    const hadMode = Object.prototype.hasOwnProperty.call(currentAnalysis, "mode");
    const hadCaseType = Object.prototype.hasOwnProperty.call(currentAnalysis, "caseType");
    const hadTitle = Object.prototype.hasOwnProperty.call(currentAnalysis, "title");
    const hadRaw = Object.prototype.hasOwnProperty.call(currentAnalysis, "raw");
    const hadRawSnapshot = Object.prototype.hasOwnProperty.call(currentAnalysis, "rawSnapshot");
    const preservedRaw = hadRaw ? cloneRaw(currentAnalysis.raw) : null;
    const preservedRawSnapshot = hadRawSnapshot ? cloneRaw(currentAnalysis.rawSnapshot) : null;
    const lockedRaw = hadRawSnapshot
      ? cloneRaw(currentAnalysis.rawSnapshot)
      : hadRaw
        ? cloneRaw(currentAnalysis.raw)
        : {};
    const lockedSemantic = JSON.parse(JSON.stringify(currentAnalysis.semantic || []));
    const lockedFact = currentAnalysis.fact;
    const lockedTitle = currentAnalysis.title;
    const preservedSourceCaseIds = [...(currentAnalysis.sourceCaseIds || [])];
    const preservedParentId = currentAnalysis.parentId;
    const preservedRevision = currentAnalysis.revision;
    const hasVerifiedRawLock = !!currentAnalysis.rawLockedAt;
    const rawLockedAt = currentAnalysis.rawLockedAt || null;

    const updated = analyze({
      mode: effectiveMode(currentAnalysis),
      caseType: effectiveCaseType(currentAnalysis),
      caseTypeA: currentAnalysis.caseTypeA || effectiveCaseType(currentAnalysis),
      caseTypeB: currentAnalysis.caseTypeB || effectiveCaseType(currentAnalysis),
      base: currentAnalysis.base || "",
      a: currentAnalysis.a,
      b: currentAnalysis.b,
      observation: currentAnalysis.observation || null,
      outcomeA: $("outcome-a").value.trim(),
      outcomeB: $("outcome-b").value.trim(),
      evidence: currentAnalysis.evidence || "",
      subject: currentAnalysis.subject || "",
      metrics: JSON.parse(JSON.stringify(currentAnalysis.metrics || []))
    }, lockedRaw);

    updated.id = currentAnalysis.id;
    updated.createdAt = currentAnalysis.createdAt;
    if (!hadMode) delete updated.mode;
    if (!hadCaseType) delete updated.caseType;
    updated.semantic = lockedSemantic;
    updated.fact = lockedFact;
    if (hadTitle) updated.title = lockedTitle;
    else delete updated.title;
    updated.sourceCaseIds = preservedSourceCaseIds;
    if (preservedParentId !== undefined) updated.parentId = preservedParentId;
    if (preservedRevision !== undefined) updated.revision = preservedRevision;
    if (hadRaw) updated.raw = preservedRaw;
    else delete updated.raw;
    if (hadRawSnapshot) updated.rawSnapshot = preservedRawSnapshot;
    else delete updated.rawSnapshot;
    updated.rawLockedAt = rawLockedAt;
    updated.outcomeAppliedAt = hasVerifiedRawLock
      ? new Date(Math.max(Date.now(), Date.parse(rawLockedAt) + 1)).toISOString()
      : (currentAnalysis.outcomeAppliedAt || null);

    const outcomeView = deriveCurrentOutcomeView(updated);
    updated.outcomeSummary = outcomeView.outcomeSummary;
    updated.association = outcomeView.association;
    updated.hypothesis = outcomeView.hypothesis;
    updated.important = outcomeView.important;
    updated.nextCheck = outcomeView.nextCheck;

    currentAnalysis = updated;

    $("save-analysis").textContent = "事件簿へ保存";
    renderAnalysis(currentAnalysis);
  });

  $("save-analysis").addEventListener("click", saveCurrent);
  $("send-portfolio").addEventListener("click", sendCurrentToPortfolioDiary);
  $("import-task-packet").addEventListener("click", importDiff24Packet);
  $("case-filter").addEventListener("change", renderCaseList);
  $("add-metric").addEventListener("click", () => addMetricRow());
  $("open-parent").addEventListener("click", () => openHistoryRecord($("open-parent").dataset.id));
  $("open-child").addEventListener("click", () => openHistoryRecord($("open-child").dataset.id));
  $("copy-changeset").addEventListener("click", copyCurrentChangeSet);
  $("copy-threeway").addEventListener("click", copyCurrentThreeWay);
  $("copy-structured").addEventListener("click", copyStructuredDiff);
  $("copy-cdc").addEventListener("click", copyCurrentCdc);
  $("mode").addEventListener("change", updateThreeWayUI);

  loadMetricRows();
  updateThreeWayUI();
  migrateLegacySourceCases();
  consumeAkechiInbound();
  renderCaseList();
  renderCross();
  renderEventLog();
})();