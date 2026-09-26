(() => {
  const STORAGE_KEY = "sabun24_cases_v01";
  const SOURCE_STORAGE_KEY = "sabun24_source_cases_v04";
  const AKECHI_INBOX_KEY = "akechi_diff24_inbox_v01";
  const PORTFOLIO_INBOX_KEY = "akechi_portfolio_inbox_v01";
  const ANALYSIS_VERSION = "5.7";
  const SCHEMA_VERSION = "0.6";

  const $ = (id) => document.getElementById(id);
  const screens = [...document.querySelectorAll(".screen")];
  const navButtons = [...document.querySelectorAll(".nav-btn")];

  let currentAnalysis = null;
  const deletedAnalysisIds = new Set();

  const typeLabels = {
    application: "応募文",
    article: "記事",
    web: "Webページ",
    generic: "汎用テキスト"
  };

  const modeLabels = {
    ab: "A ↔ B",
    before_after: "変更前 ↔ 変更後",
    success_failure: "結果比較"
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
    return base;
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
      ["structure", "画面構造・UIに関する表現", /トップ|見出し|カード|ボタン|メニュー|CTA/i]
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
    const raw = fixedRaw ? cloneRaw(fixedRaw) : calcRawDiff(formData.a, formData.b, formData.observation);
    const safeRaw = normalizeRawShape(raw);
    const semantic = semanticDiff(formData.a, formData.b, formData.caseType, safeRaw);
    const counts = rawCounts(safeRaw);
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
      title: `${typeLabels[formData.caseType]}｜${modeLabels[formData.mode]}`,
      ...formData,
      raw,
      semantic,
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

    if (incompatible) {
      $("semantic-summary").textContent = "比較不能のため意味差分は判定しない。";
    } else {
      renderSemantic($("semantic-summary"), a.semantic || []);
    }

    const outcomeView = deriveCurrentOutcomeView(a);
    $("outcome-a").value = a.outcomeA || "";
    $("outcome-b").value = a.outcomeB || "";
    $("outcome-summary").textContent = outcomeView.outcomeSummary;
    $("fact-text").textContent = incompatible ? "比較不能" : a.fact;
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

  function consumeAkechiInbound() {
    let packet = null;
    try {
      packet = JSON.parse(localStorage.getItem(AKECHI_INBOX_KEY) || "null");
    } catch {
      return false;
    }
    if (!packet || packet.schema !== "akechi-pipe-v01" || !packet.a || !packet.b) return false;

    $("mode").value = ["ab", "before_after", "success_failure"].includes(packet.mode) ? packet.mode : "ab";
    $("case-type-a").value = packet.caseTypeA || "article";
    $("case-type-b").value = packet.caseTypeB || "article";
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
    const raw = [
      "差分24時でA/B比較を実施した。",
      "比較: " + effectiveTitle(currentAnalysis),
      "FACT: " + (currentAnalysis.fact || "未観測"),
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
      if (!c.a || !c.b || effectiveIncompatible(c)) return;

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
      if (!c.a || !c.b || effectiveIncompatible(c)) return;
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
        </div>
        <h3>${escapeHtml(effectiveTitle(c))}</h3>
        <p>${escapeHtml(c.fact)}</p>
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
    const counts = { application: 0, article: 0, web: 0, generic: 0 };
    canonicalSources.forEach(c => { if (counts[c.caseType] !== undefined) counts[c.caseType]++; });

    $("stat-total").textContent = String(canonicalSources.length);
    $("stat-comparisons").textContent = String(comparisons.length);
    $("stat-application").textContent = String(counts.application);
    $("stat-article").textContent = String(counts.article);
    $("stat-web").textContent = String(counts.web);

    const warning = $("small-n-warning");
    warning.textContent = `元CASE ${canonicalSources.length}件 / 比較記録 ${comparisons.length}件。反復判定は CASE TYPE × 比較モード ごと。結果比較だけは outcomeState も分離し、別の箱は合算しない。`;

    const caseTypes = ["application", "article", "web", "generic"];
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
  }

  $("compare-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = $("case-a").value;
    const b = $("case-b").value;
    if (!normalizeText(a) || !normalizeText(b)) {
      alert("CASE A と CASE B を両方入れてください。");
      return;
    }

    const caseTypeA = $("case-type-a").value;
    const caseTypeB = $("case-type-b").value;
    const baseData = {
      mode: $("mode").value,
      caseTypeA,
      caseTypeB,
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
    const hasVerifiedRawLock = !!currentAnalysis.rawLockedAt;
    const rawLockedAt = currentAnalysis.rawLockedAt || null;

    const updated = analyze({
      mode: effectiveMode(currentAnalysis),
      caseType: effectiveCaseType(currentAnalysis),
      caseTypeA: currentAnalysis.caseTypeA || effectiveCaseType(currentAnalysis),
      caseTypeB: currentAnalysis.caseTypeB || effectiveCaseType(currentAnalysis),
      a: currentAnalysis.a,
      b: currentAnalysis.b,
      observation: currentAnalysis.observation || null,
      outcomeA: $("outcome-a").value.trim(),
      outcomeB: $("outcome-b").value.trim(),
      evidence: currentAnalysis.evidence || ""
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
  $("case-filter").addEventListener("change", renderCaseList);

  migrateLegacySourceCases();
  consumeAkechiInbound();
  renderCaseList();
  renderCross();
})();