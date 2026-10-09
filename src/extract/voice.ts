import type { CaptureResult } from "../crawl/crawl.js";
import type { VoiceCorpus, CompanySignals, CompanyCategory, Identity, PageKind } from "../profile/schema.js";
import { parseColor } from "../util/color.js";

const STOP = new Set(
  "a an the and or but if then else for to of in on at by with from as is are was were be been being it its this that these those you your yours we our us they their them he she his her i me my not no yes do does did can could will would should may might must just so than too very more most all any each every some such into over under about across after before up down out off again further once here there when where why how what which who whom both few other own same only also new get got make made use using used one two three per via vs etc like back way well even still now".split(" "),
);

const SMALL_WORDS = new Set("a an the and or but nor for so yet at by in of on to up as is if via vs per with from into onto".split(" "));

export function extractVoice(capture: CaptureResult): VoiceCorpus {
  const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];
  const headlines = uniq(capture.pages.flatMap((p) => (p.raw.headings as { tag: string; text: string }[]).filter((h) => h.tag === "h1" || h.tag === "h2").map((h) => h.text))).slice(0, 40);
  const display = uniq(capture.pages.flatMap((p) => p.raw.displayCopy as string[])).filter((d) => !headlines.includes(d));
  const subheadlines = uniq(capture.pages.flatMap((p) => (p.raw.headings as { tag: string; text: string }[]).filter((h) => h.tag === "h3").map((h) => h.text))).slice(0, 30);
  const ctaCounts = new Map<string, number>();
  for (const p of capture.pages)
    for (const b of p.raw.buttons as { text: string; styles: Record<string, string> }[]) {
      const styled = (b.styles["background-color"] && b.styles["background-color"] !== "rgba(0, 0, 0, 0)") || parseFloat(b.styles["border-top-width"] || "0") > 0;
      if (styled) ctaCounts.set(b.text, (ctaCounts.get(b.text) || 0) + 1);
    }
  const ctas = [...ctaCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).filter((t) => t.length <= 32).slice(0, 24);
  const navigation = uniq(capture.pages[0].raw.nav as string[]).slice(0, 24);
  const paragraphs = uniq(capture.pages.flatMap((p) => p.raw.paragraphs as string[])).slice(0, 60);
  const microcopy = uniq(capture.pages.flatMap((p) => p.raw.microcopy as string[])).slice(0, 40);

  const allHeads = [...headlines, ...display, ...subheadlines];
  const prose = paragraphs.join(" ");
  const sentences = prose.split(/(?<=[.!?])\s+/).filter((s) => s.split(/\s+/).length >= 3);
  const words = prose.split(/\s+/).filter(Boolean);
  const lower = prose.toLowerCase();
  const count = (re: RegExp) => (lower.match(re) || []).length;
  const per100 = (n: number) => (words.length ? Math.round((n / words.length) * 1000) / 10 : 0);

  const syllables = (w: string) => {
    const s = w.toLowerCase().replace(/[^a-z]/g, "");
    if (!s) return 0;
    if (s.length <= 3) return 1;
    return Math.max(1, (s.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g) || []).length);
  };
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  const grade = sentences.length && words.length ? 0.39 * (words.length / sentences.length) + 11.8 * (syl / words.length) - 15.59 : 0;

  const caseOf = (h: string): "sentence" | "title" | "upper" | "lower" | null => {
    const ws = h.replace(/[^\p{L}\s'-]/gu, "").split(/\s+/).filter((w) => w.length > 1);
    if (ws.length < 3) return null;
    if (h === h.toUpperCase() && /[A-Z]/.test(h)) return "upper";
    if (h === h.toLowerCase()) return "lower";
    const rest = ws.slice(1).filter((w) => !SMALL_WORDS.has(w.toLowerCase()));
    if (!rest.length) return null;
    const caps = rest.filter((w) => /^\p{Lu}/u.test(w)).length / rest.length;
    if (caps >= 0.8) return "title";
    if (caps <= 0.35) return "sentence";
    return null;
  };
  const cases = allHeads.map(caseOf).filter(Boolean) as string[];
  const tally = new Map<string, number>();
  cases.forEach((c) => tally.set(c, (tally.get(c) || 0) + 1));
  const topCase = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  const headingCase = (topCase && topCase[1] / cases.length >= 0.6 ? topCase[0] : cases.length ? "mixed" : "sentence") as VoiceCorpus["stats"]["headingCase"];

  const oxfordYes = (prose.match(/\w+, \w+(?: \w+)?, (and|or) \w+/g) || []).length;
  const oxfordNo = (prose.match(/\w+, \w+(?: \w+)? (and|or) \w+/g) || []).length;

  const termCounts = new Map<string, number>();
  const text = capture.pages.map((p) => [...(p.raw.headings as { text: string }[]).map((h) => h.text), ...(p.raw.paragraphs as string[])].join(" ")).join(" ").toLowerCase();
  const toks = text.match(/[a-z][a-z0-9'-]{2,}/g) || [];
  toks.forEach((t, i) => {
    if (!STOP.has(t)) termCounts.set(t, (termCounts.get(t) || 0) + 1);
    const next = toks[i + 1];
    if (next && !STOP.has(t) && !STOP.has(next)) termCounts.set(`${t} ${next}`, (termCounts.get(`${t} ${next}`) || 0) + 1.5);
  });
  const topTerms = [...termCounts.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([term, c]) => ({ term, count: Math.round(c) }));

  const headWords = allHeads.map((h) => h.split(/\s+/).length);
  return {
    headlines: [...headlines, ...display].slice(0, 40),
    subheadlines,
    ctas,
    navigation,
    paragraphs,
    microcopy,
    stats: {
      avgSentenceLength: sentences.length ? Math.round((words.length / sentences.length) * 10) / 10 : 0,
      avgHeadlineWords: headWords.length ? Math.round((headWords.reduce((a, b) => a + b, 0) / headWords.length) * 10) / 10 : 0,
      headingCase,
      secondPerson: per100(count(/\b(you|your|yours|you're|you'll)\b/g)),
      firstPersonPlural: per100(count(/\b(we|our|us|we're|we've)\b/g)),
      exclamationRate: sentences.length ? Math.round((sentences.filter((s) => s.trim().endsWith("!")).length / sentences.length) * 100) / 100 : 0,
      questionRate: sentences.length ? Math.round((sentences.filter((s) => s.trim().endsWith("?")).length / sentences.length) * 100) / 100 : 0,
      emojiRate: per100((prose.match(/\p{Extended_Pictographic}/gu) || []).length),
      readingGrade: Math.round(grade * 10) / 10,
      emDash: /—/.test(prose + allHeads.join(" ")),
      oxfordComma: oxfordYes + oxfordNo < 2 ? "unknown" : oxfordYes >= oxfordNo ? "yes" : "no",
      periodsInHeadlines: allHeads.length ? Math.round((allHeads.filter((h) => /\.$/.test(h.trim())).length / allHeads.length) * 100) / 100 : 0,
      numerals: per100((prose.match(/\b\d[\d,.]*\b/g) || []).length),
    },
    topTerms,
  };
}

/* ------------------------------------------------------------------ identity */

export function extractIdentity(capture: CaptureResult): Identity {
  const home = capture.pages[0].raw;
  const meta = home.meta as Record<string, string>;
  const domain = new URL(capture.finalUrl).hostname.replace(/^www\./, "");
  const domainStem = domain.split(".")[0];
  const org = (home.jsonld as unknown[]).flatMap(flattenLd).find((x) => /Organization|Corporation|SoftwareApplication|WebSite/i.test(String(x["@type"]))) as Record<string, unknown> | undefined;
  const titleParts = (home.title as string).split(/\s[|–—:·-]\s/).map((s) => s.trim()).filter(Boolean);
  const byDomain = titleParts.find((t) => t.toLowerCase().replace(/\s/g, "").includes(domainStem.toLowerCase()));
  const name =
    meta["og:site_name"] ||
    (org && typeof org.name === "string" ? org.name : "") ||
    byDomain ||
    domainStem.charAt(0).toUpperCase() + domainStem.slice(1);
  const social: Record<string, string> = {};
  const SOCIAL: [string, RegExp][] = [
    ["x", /(twitter\.com|x\.com)\/(?!intent|share|home)[\w]+/i],
    ["linkedin", /linkedin\.com\/(company|school|in)\//i],
    ["github", /github\.com\/[\w-]+\/?$/i],
    ["youtube", /youtube\.com\/(@|c\/|channel\/|user\/)/i],
    ["instagram", /instagram\.com\/[\w.]+/i],
    ["tiktok", /tiktok\.com\/@/i],
    ["discord", /discord\.(gg|com)\//i],
    ["facebook", /facebook\.com\/[\w.]+/i],
    ["threads", /threads\.net\/@/i],
    ["bluesky", /bsky\.app\/profile/i],
  ];
  for (const l of home.links as { href: string }[]) for (const [k, re] of SOCIAL) if (!social[k] && re.test(l.href)) social[k] = l.href;
  const tc = parseColor(meta["theme-color"]);
  const h1 = (home.headings as { tag: string; text: string }[]).find((h) => h.tag === "h1")?.text;
  return {
    name: name.trim(),
    domain,
    title: home.title,
    tagline: h1 || meta["og:title"],
    description: meta["description"] || meta["og:description"],
    themeColor: tc?.hex,
    social,
    organization: org,
  };
}

function flattenLd(x: unknown): Record<string, unknown>[] {
  if (!x || typeof x !== "object") return [];
  if (Array.isArray(x)) return x.flatMap(flattenLd);
  const o = x as Record<string, unknown>;
  return [o, ...(Array.isArray(o["@graph"]) ? (o["@graph"] as unknown[]).flatMap(flattenLd) : [])];
}

/* ------------------------------------------------------------------ company */

const CATEGORY_TERMS: Record<CompanyCategory, RegExp> = {
  ai: /\b(ai|a\.i\.|artificial intelligence|llm|gpt|agents?|agentic|machine learning|model|copilot|generative|prompt|assistant|voice ai|inference)\b/gi,
  devtools: /\b(developers?|api|sdk|cli|deploy|git|code|open source|infrastructure|devops|ci\/cd|repositor(y|ies)|framework|runtime|terminal)\b/gi,
  fintech: /\b(payments?|banking|invoices?|billing|financial|finance|treasury|cards?|transactions?|revenue|checkout|payouts?|fraud|tax|ledger)\b/gi,
  productivity: /\b(workspace|notes?|docs|wiki|tasks?|projects?|collaborat\w+|calendar|meetings?|productivity|workflow|focus|organi[sz]e)\b/gi,
  design: /\b(design|designers?|prototype|figma|canvas|creative|brand|visual)\b/gi,
  consumer: /\b(friends|family|personal|lifestyle|fun|everyday|app store|download the app|for you)\b/gi,
  commerce: /\b(shop|store|e-?commerce|merchants?|sell|products?|inventory|orders?|cart)\b/gi,
  health: /\b(health|patients?|clinical|medical|care|wellness|therapy|doctors?|fitness)\b/gi,
  security: /\b(security|secure|compliance|soc ?2|identity|auth|encryption|threat|zero trust|privacy)\b/gi,
  data: /\b(data|analytics|warehouse|pipelines?|dashboards?|insights|metrics|bi|sql)\b/gi,
  media: /\b(video|podcast|music|stream(ing)?|creators?|content|audio|editing)\b/gi,
  hardware: /\b(hardware|device|chip|sensor|robot\w*|battery|manufactur\w+)\b/gi,
  education: /\b(learn(ing)?|students?|courses?|teachers?|education|classroom|school)\b/gi,
  marketing: /\b(marketing|campaigns?|seo|ads|audience|growth|email marketing|crm|leads?)\b/gi,
  hr: /\b(hiring|recruit\w*|payroll|employees?|hr|people ops|onboarding|benefits)\b/gi,
  web3: /\b(crypto|blockchain|web3|wallet|onchain|nft|defi|token)\b/gi,
};

export function extractCompany(capture: CaptureResult, voice: VoiceCorpus, customers: string[]): CompanySignals {
  const pagesText = capture.pages.map((p) => ({ url: p.url, kind: p.kind as PageKind, excerpt: (p.raw.bodyText as string).slice(0, 2500) }));
  const corpus = capture.pages.map((p, i) => (i === 0 ? p.raw.bodyText + " " + p.raw.bodyText : p.raw.bodyText)).join(" ").slice(0, 120_000);
  const lc = corpus.toLowerCase();
  const allLinks = capture.pages.flatMap((p) => p.raw.links as { href: string; text: string }[]);
  const ctasLc = voice.ctas.map((c) => c.toLowerCase());
  const has = (re: RegExp) => re.test(lc);

  const words = corpus.split(/\s+/).length || 1;
  const categories = (Object.entries(CATEGORY_TERMS) as [CompanyCategory, RegExp][])
    .map(([name, re]) => {
      const hits = corpus.match(re) || [];
      const uniqHits = [...new Set(hits.map((h) => h.toLowerCase()))];
      return { name, score: Math.round((hits.length / words) * 10000) / 10, reasons: uniqHits.slice(0, 6) };
    })
    .filter((c) => c.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const b2b: string[] = [];
  const b2c: string[] = [];
  if (ctasLc.some((c) => /contact sales|talk to sales|book a demo|request (a )?demo|get a demo|schedule/.test(c))) b2b.push("sales CTA (contact sales / demo)");
  if (has(/\benterprise\b/)) b2b.push("mentions enterprise");
  if (has(/\bsoc ?2|hipaa|gdpr|sso|saml|scim\b/)) b2b.push("compliance / SSO language");
  if (has(/\b(teams?|businesses|companies|organizations|customers like)\b/)) b2b.push("talks to teams & businesses");
  if (customers.length >= 4) b2b.push(`customer logo wall (${customers.length})`);
  if (has(/\bapi\b|\bsdk\b/)) b2b.push("API / SDK");
  if (allLinks.some((l) => /apps\.apple\.com|play\.google\.com/.test(l.href))) b2c.push("app store links");
  if ((lc.match(/\b(your (life|friends|family|thoughts|mind|memories)|personal (assistant|use|life)|for everyone)\b/g) || []).length >= 3) b2c.push("personal / lifestyle language");
  if (has(/\b(free forever|for individuals|personal plan|for students)\b/)) b2c.push("individual plans");
  if (ctasLc.some((c) => /download|get the app|for (mac|windows|iphone|ios|android)/.test(c)) || allLinks.some((l) => /\.(dmg|exe)$|\/download/.test(l.href))) b2c.push("desktop / mobile app download CTA");
  const modelGuess: CompanySignals["model"]["guess"] = b2b.length >= 3 && b2c.length >= 2 ? "Prosumer" : b2b.length >= 2 && b2c.length >= 2 ? "Prosumer" : b2b.length >= 2 ? "B2B" : b2c.length >= 2 ? "B2C" : b2b.length > b2c.length ? "B2B" : b2c.length ? "B2C" : "Unknown";

  const plg = ctasLc.some((c) => /get started|sign up|start (for )?free|try (it )?(for )?free|download|start building|join|create (an )?account|get .* free/.test(c));
  const sales = ctasLc.some((c) => /contact sales|talk to sales|book a demo|request (a )?demo|get a demo/.test(c));
  const ctaCounts = new Map<string, number>();
  for (const p of capture.pages) for (const b of p.raw.buttons as { text: string }[]) ctaCounts.set(b.text, (ctaCounts.get(b.text) || 0) + 1);

  const stats = [...new Set((corpus.match(/(?:[$€£]\s?)?\b\d[\d,.]*\s?(?:%|\+|x|k|m|bn|b|t|million|billion|trillion)?\+?\s+(?:[a-z]+\s){0,3}(?:countries|customers|users|businesses|companies|teams|developers|people|transactions|uptime|faster|languages|integrations|downloads|members|years)\b/gi) || []).map((s) => s.trim()))].filter((s) => !/^(19|20)\d\d\b/.test(s) && !/^\d{1,2} (companies|years|people|teams)$/i.test(s)).slice(0, 12);

  return {
    model: { guess: modelGuess, confidence: Math.min(1, (Math.max(b2b.length, b2c.length) + 1) / 6), reasons: [...b2b.map((r) => `B2B: ${r}`), ...b2c.map((r) => `B2C: ${r}`)] },
    categories,
    motion: plg && sales ? "hybrid" : plg ? "product-led" : sales ? "sales-led" : "unknown",
    ctas: [...ctaCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([text, count]) => ({ text, count })),
    hasPricing: capture.pages.some((p) => p.kind === "pricing") || voice.navigation.some((n) => /pricing|plans/i.test(n)),
    hasEnterprise: has(/\benterprise\b/),
    hasDocs: allLinks.some((l) => /\/docs|docs\.|developers?\.|\/developers?/.test(l.href)),
    hasApi: has(/\bapi\b/),
    hasCareers: allLinks.some((l) => /careers|jobs/.test(l.href)),
    customers,
    stats,
    keyPhrases: voice.topTerms.slice(0, 15).map((t) => t.term),
    pagesText,
  };
}
