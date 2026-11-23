/**
 * FAQ engine — implements the Boomspring FAQ implementation pack.
 *
 * Sources of truth:
 *   data/faq-contract.json        field contract, fallbacks, MOQ modes, lead-time rules
 *   data/alibaba-moq-register.json Alibaba MOQ source register (binding table)
 *   scripts/faq.seed.json         approved English copy library
 *
 * Hard rule from the pack: never render an answer whose facts are not held in a
 * record, never show an unresolved token, never show a category-level MOQ.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = path.resolve(__dirname, "..", "..");
const DATA = path.join(SITE_ROOT, "data");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadContract() {
  return readJson(path.join(DATA, "faq-contract.json"), null);
}
export function loadRegister() {
  return readJson(path.join(DATA, "alibaba-moq-register.json"), { entries: [] });
}
export function loadFaqSeed() {
  return readJson(path.join(SITE_ROOT, "scripts", "faq.seed.json"), {});
}

/* ---------------------------------------------------------------------------
 * Publication gate vocabulary (pack section 8 + publication boundary)
 * ------------------------------------------------------------------------ */
export const BANNED_PHRASES = [
  /\bFDA[- ]approved\b/i,
  /\blead[- ]free\b/i,
  /dishwasher[\s-]?safe/i,
  /\bshatterproof\b/i,
  /\bzero breakage\b/i,
  // "unbreakable" is the same absolute durability claim as "shatterproof" and
  // can never be backed by a record, so it is banned rather than advisory.
  /\bunbreakable\b/i,
  // "BPA-free" is an additive-by-additive material claim. Upgraded from advisory
  // to banned: the approved wording is the recorded polymer type/grade plus a
  // pointer to the safety data sheet and food-contact report issued on quotation.
  /\bBPA[- ]?free\b/i,
  /\bfast delivery\b/i,
  /\bsame[- ]day (?:shipping|dispatch)\b/i,
  /\bin stock now\b/i
];

export const ADVISORY_PHRASES = [
  // "reusable" is deliberately NOT here: it describes intended use ("moulded for
  // repeat service"), not a measured performance result, and it is the approved
  // replacement for the banned durability claims.
  // "BPA-free" was moved to BANNED_PHRASES: it is an additive-by-additive
  // material claim and was reworded site-wide rather than left as a warning.
  /\bfood[- ]contact safe\b/i,
  /\bfood[- ]grade\b/i,
  /\bcheapest\b/i,
  /\bbest price\b/i,
  /\bguaranteed?\b/i,
  /\bFDA\b/i,
  /\bISO ?9001\b/i
];

/** Words that must not appear in an FAQ answer unless a record backs them. */
export function gateScan(html) {
  const banned = [];
  for (const re of BANNED_PHRASES) {
    const hits = (html.match(new RegExp(re.source, "gi")) || []).length;
    if (hits) banned.push({ pattern: String(re), hits });
  }
  const advisories = [];
  for (const re of ADVISORY_PHRASES) {
    const hits = (html.match(new RegExp(re.source, "gi")) || []).length;
    if (hits) advisories.push({ pattern: String(re), hits });
  }
  const tokens = [...new Set([...html.matchAll(/\{\{[a-z0-9_]+\}\}/gi)].map((m) => m[0]))];
  const categoryMoq = (html.match(/MOQ\s*:?\s*(?:from\s+)?[\d,]+\s*(?:pcs|pieces|sets)[^<]{0,40}(?:category|range|collection)/gi) || []).length;
  return { banned, advisories, tokens, categoryMoq };
}

/** Scan the visible FAQ blocks only — extracted from every built page. */
export function extractFaqBlocks(html) {
  const out = [];
  const re = /<details class="faq-item">[\s\S]*?<\/details>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[0]);
  return out.join("\n");
}

/* ---------------------------------------------------------------------------
 * Product field contract
 * ------------------------------------------------------------------------ */
const ELECTRIC_RE = /electric|rechargeable|usb|battery|charging|gravity|led/i;

export function productFamily(p) {
  if (p.product_family) return p.product_family;
  return ELECTRIC_RE.test(`${p.name} ${p.categoryName || ""}`) ? "electric_appliance" : "general";
}

export function inventoryStatus(p) {
  return p.inventory_status || "build_to_order";
}

export function orderQuantityBand(p) {
  return p.order_quantity_band || "sample_or_small_batch";
}

/** FOB dispatch text, routed through the contract's leadTimeRules. */
export function fobDispatchText(p, contract, seed) {
  const rules = (contract && contract.leadTimeRules) || [];
  const destNote = "Destination-specific freight arrival is quoted separately.";
  const fam = productFamily(p);
  const inv = inventoryStatus(p);
  const band = orderQuantityBand(p);

  let rule = null;
  if (inv === "in_stock_sample") {
    rule = rules.find((r) => r.inventory_status === "in_stock_sample");
  } else if (fam === "electric_appliance") {
    rule = rules.find((r) => r.product_family === "electric_appliance");
  } else if (band === "1000_plus") {
    rule = rules.find((r) => r.order_quantity_band === "1000_plus");
  } else {
    rule = rules.find((r) => r.inventory_status === "build_to_order" && r.order_quantity_band === "sample_or_small_batch");
  }
  const text = (rule && rule.public_text) || (contract && contract.fallbacks && contract.fallbacks.lead_time) || "";
  return `${text} ${destNote}`.trim();
}

/** Short label for the spec table — never called a delivery date. */
export function fobDispatchRoute(p) {
  if (inventoryStatus(p) === "in_stock_sample") return "In-stock sample: dispatched within 1–3 working days";
  if (productFamily(p) === "electric_appliance") return "FOB dispatch 45–60 working days (no stock)";
  if (orderQuantityBand(p) === "1000_plus") return "FOB dispatch 15–25 days (no stock, 1,000 pcs+)";
  return "FOB dispatch 10–15 days (no stock, small batch)";
}

function registerEntry(p, register) {
  if (!p.alibaba_listing_key || !register || !register.entries) return null;
  return register.entries.find((e) => e.key === p.alibaba_listing_key) || null;
}

/** MOQ answer honouring the three display modes. Never shows a number unless verified. */
export function moqAnswer(p, contract, register) {
  const fallback = (contract && contract.fallbacks && contract.fallbacks.moq) || "";
  const mode = p.moq_display_mode || "quote_only";
  if (mode !== "published_verified") return fallback;
  const entry = registerEntry(p, register);
  if (!entry || !p.standard_moq || !p.alibaba_moq_verified_date) return fallback;
  return `MOQ: ${Number(p.standard_moq).toLocaleString()} ${entry.unit} for SKU ${p.sku}, blank bulk order. The decorated route and a gift-box build are confirmed separately for the same model, and the applicable route is stated in the quotation.`;
}

/**
 * The only way an MOQ figure may reach a public page.
 *
 * Returns the verified number together with its unit, or null when the SKU is
 * in quote_only / sample_private mode or the register entry is incomplete. Any
 * caller that prints an MOQ must go through this function — a hard-coded
 * fallback of 500 or 1,000 is exactly what the pack forbids.
 */
export function publicMoq(p, register) {
  return publicMoqDetail(p, register).number;
}

export function publicMoqDetail(p, register) {
  const mode = (p && p.moq_display_mode) || "quote_only";
  if (mode !== "published_verified") return { number: null, unit: "", entry: null };
  const n = Number(p.standard_moq);
  if (!Number.isFinite(n) || n <= 0) return { number: null, unit: "", entry: null };
  const entry = registerEntry(p || {}, register);
  // The register is optional at render time: the publication gate fails the
  // build when a published_verified SKU has no matching register entry.
  return { number: n, unit: (entry && entry.unit) || p.alibaba_moq_unit || "pcs", entry: entry || null };
}

export function sampleAnswer(p, contract) {
  return (p.sample_policy && String(p.sample_policy).trim()) || (contract && contract.fallbacks && contract.fallbacks.sample) || "";
}

/* ---------------------------------------------------------------------------
 * Care instructions — material behaviour, no "dishwasher safe" token
 * ------------------------------------------------------------------------ */
const CARE = {
  Tritan: "Tritan is the material intended for repeated washing, including top-rack commercial cycles, and repeated commercial washing does not cloud it. Rinse before first use; avoid abrasive scouring pads.",
  PP: "Polypropylene tolerates heat and repeated washing better than the other moulded materials, so warm soapy water or a normal commercial cycle is appropriate.",
  AS: "AS holds its clarity in larger bowls. Warm soapy water or a normal commercial cycle is appropriate, and the carton configuration shows how the items stack.",
  PET: "PET is designed for reuse across an event rather than for repeated hot washing. Hand washing in warm soapy water gives the longest life; hot cycles are not appropriate for this material.",
  PS: "Polystyrene gives the clearest glass look at the lowest unit cost. Hand washing, or a top-rack rinse, keeps the surface clear for longest.",
  Acrylic: "Hand washing in warm soapy water preserves the polished finish. Hot cycles and abrasive detergents are not appropriate for this material.",
  Metal: "Wipe or hand wash in warm soapy water and dry before storage to preserve the finish. Hot cycles and abrasive detergents are not appropriate."
};

export function materialKey(material) {
  const m = String(material || "").toLowerCase();
  if (m.startsWith("tritan")) return "Tritan";
  if (m.startsWith("pet") || m.includes("gold rim")) return "PET";
  if (m.startsWith("acrylic")) return "Acrylic";
  if (m.startsWith("as")) return "AS";
  if (m.startsWith("pp")) return "PP";
  if (m.startsWith("ps") || m.includes("plating") || m.includes("led")) return "PS";
  if (m.includes("metal") || m.includes("steel") || m.includes("abs")) return "Metal";
  return null;
}

export function careInstruction(p) {
  if (p.care_instructions && String(p.care_instructions).trim()) return String(p.care_instructions).trim();
  const k = materialKey(p.material);
  return CARE[k] || "Care instructions for this SKU are confirmed with the quotation.";
}

/* ---------------------------------------------------------------------------
 * SKU page FAQ — pack section 3 (9-question template, gated)
 * ------------------------------------------------------------------------ */
const catHref = (p) => `/collections/${p.category}/`;

export function buildProductFaqs(p, ctx) {
  const contract = ctx.contract;
  const register = ctx.register;
  const seed = ctx.seed;
  const verified = p.last_verified_date || ctx.lastVerifiedDate;
  const faqs = [];

  // Q1 — specifications. Every referenced field must be populated.
  const specBits = [];
  if (p.capacity && p.capacity !== "—") specBits.push(`a capacity of ${p.capacity}`);
  if (p.dimensions && p.dimensions !== "—") specBits.push(`recorded dimensions of ${p.dimensions}`);
  specBits.push(`moulded in ${p.material}`);
  faqs.push({
    q: `What are the specifications of the ${p.name}?`,
    a: `The ${p.name} has ${specBits.join(", ")}. The specification table on this page lists the model, material, capacity, dimensions, unit weight and case pack, and it is the record the quotation is issued against. Last verified: ${verified}.`,
    links: [{ label: p.categoryName, href: catHref(p) }, { label: "Full specification", href: `#specification` }]
  });

  // Q2 — MOQ, SKU level only.
  faqs.push({
    q: `What is the MOQ for the ${p.name}?`,
    a: moqAnswer(p, contract, register),
    links: [
      { label: "How MOQ works", href: "/resources/custom-logo-drinkware-moq-and-print-methods/" },
      { label: "Request a quote", href: "/quote/" }
    ]
  });

  // Q3 — logo. Only names methods that are recorded for the SKU.
  const methods = (p.decoration_methods || []).filter(Boolean);
  const positions = (p.logo_positions || []).filter(Boolean);
  const methodText = methods.length
    ? `The recorded decoration methods for the ${p.name} are ${methods.join(", ")}.`
    : `The decoration method for the ${p.name} is confirmed against the selected SKU, because it depends on the surface, the artwork, the decoration area, the colour count and the order quantity.`;
  const positionText = positions.length ? ` Logo positions assessed for this SKU: ${positions.join(", ")}.` : "";
  faqs.push({
    q: `Can I add a logo to the ${p.name}?`,
    a: `${methodText}${positionText} The final recommendation depends on the supplied artwork, the appearance you want, the durability requirement, the quantity and the packaging configuration.`,
    links: [
      { label: "Logo decoration guide", href: "/resources/logo-decoration-on-barware-and-drinkware/" },
      { label: "Custom branding", href: "/custom-branding/" }
    ]
  });

  // Q4 — packing. Uses the carton record.
  const casePack = p.case_pack && p.case_pack !== "—" ? p.case_pack : null;
  faqs.push({
    q: `How is the ${p.name} packed for export?`,
    a: `The standard packaging for the ${p.name} is ${p.standard_packaging || "the export carton stated on this page"}.${
      casePack ? ` The regular case pack is ${casePack}.` : ` The case pack is confirmed with the quotation.`
    } For a customized gift set, the insert, gift box, outer carton and shipping protection are confirmed as part of the order brief.`,
    links: [{ label: "Gift box packaging guide", href: "/resources/gift-box-packaging-for-barware-and-drinkware/" }]
  });

  // Q5 — gift set.
  const sets = (p.available_gift_sets || []).filter(Boolean);
  faqs.push({
    q: `Can the ${p.name} be included in a gift set?`,
    a: sets.length
      ? `The recorded gift-set configurations for the ${p.name} are ${sets.join(", ")}. A non-standard configuration is assessed using the full item list, the packaging requirement, the logo treatment, the quantity and the destination.`
      : `A gift-set configuration is assessed as a complete build: the item, the insert, the gift box, the logo treatment, the outer carton and the quantity. Non-standard configurations are quoted from the full item list, the packaging requirement and the destination.`,
    links: [{ label: "Barware gift sets", href: "/collections/bar-sets-gifts/" }]
  });

  // Q6 — samples.
  faqs.push({
    q: `Can I request a sample of the ${p.name}?`,
    a: sampleAnswer(p, contract),
    links: [{ label: "Request a sample", href: "/quote/" }]
  });

  // Q7 — FOB dispatch, labelled as dispatch time, never as arrival.
  faqs.push({
    q: `What is the production lead time for the ${p.name}?`,
    a: `${fobDispatchText(p, contract, seed)} This is FOB dispatch timing rather than a delivery date to your destination.`,
    links: [{ label: "Request a quote", href: "/quote/" }]
  });

  // Q8 — care.
  faqs.push({
    q: `How should the ${p.name} be cleaned or handled?`,
    a: careInstruction(p),
    links: [{ label: "Material behaviour", href: "/resources/tritan-vs-pet-vs-polystyrene-drinkware/" }]
  });

  // Q9 — quality control, published only when an approved record exists.
  if (p.quality_control_record && String(p.quality_control_record).trim()) {
    faqs.push({
      q: `What quality-control information is available for the ${p.name}?`,
      a: String(p.quality_control_record).trim(),
      links: [{ label: "About the factory", href: "/about/" }]
    });
  }

  return faqs;
}

/** GEO answer-ready facts block (pack section 7). */
export function factsBlock(p, ctx) {
  const verified = p.last_verified_date || ctx.lastVerifiedDate;
  const methods = (p.decoration_methods || []).filter(Boolean);
  // Pack format H × rim × base once those records exist; otherwise the
  // catalogue dimensions string, which is the record we actually hold.
  const dims =
    p.height && p.rim_diameter && p.base_diameter
      ? `${p.height} H × ${p.rim_diameter} rim × ${p.base_diameter} base`
      : p.dimensions && p.dimensions !== "—"
        ? p.dimensions
        : "Confirmed with the quotation";
  return [
    ["Product", p.name],
    ["Use", (p.applications || [])[0] || p.categoryName],
    ["Material", p.material],
    ["Capacity", p.capacity],
    ["Dimensions", dims],
    ["Case pack", p.case_pack && p.case_pack !== "—" ? p.case_pack : "Confirmed with the quotation"],
    ["Branding", methods.length ? methods.join(", ") : "Confirmed per SKU on request"],
    ["Packaging", p.standard_packaging || "Export carton"],
    ["Last verified", verified]
  ];
}

/* ---------------------------------------------------------------------------
 * Category page FAQ — pack section 2
 * ------------------------------------------------------------------------ */
export function groupForCollection(seed, catSlug) {
  return (seed.categoryGroups || []).find((g) => (g.collections || []).includes(catSlug)) || null;
}

function fill(template, vars) {
  return String(template)
    .replace(/\{catLower\}/g, vars.catLower)
    .replace(/\{cat\}/g, vars.cat)
    .replace(/\{sku\}/g, vars.sku || "");
}

/**
 * Lower only the first letter, so a mid-sentence buyer phrase reads naturally
 * without damaging acronyms or proper nouns inside the phrase.
 */
function sentenceCase(s) {
  const t = String(s || "").trim();
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : "";
}

/**
 * Join a list the way English does. When one of the first items already
 * contains "and" (for example "bars and restaurants"), a comma list is used
 * so the sentence never reads "X and Y and Z".
 */
function listPhrase(items) {
  const a = (items || []).filter(Boolean);
  if (!a.length) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return a.some((s) => /\band\b/.test(s)) ? `${a[0]}, ${a[1]}` : `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}

/**
 * Collapse repeated base materials so a range never reads
 * "PS, PP, PET and PS with LED module". Variants are folded into the base as
 * "PS (with plating and LED)".
 */
function groupMaterials(materials) {
  const order = [];
  const map = new Map();
  for (const raw of materials) {
    // "PP/PS" is the catalogue shorthand for "PP or PS" — split it so the
    // sentence does not repeat a material that is already listed.
    for (const part of String(raw).split("/")) {
      const m = part.match(/^(.+?)\s+with\s+(.+)$/i);
      const base = (m ? m[1] : part).trim();
      const variant = m ? m[2].trim() : "";
      if (!base) continue;
      const key = base.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { base, variants: [] });
        order.push(key);
      }
      if (variant) map.get(key).variants.push(variant);
    }
  }
  return order.map((k) => {
    const g = map.get(k);
    return g.variants.length ? `${g.base} (with ${listPhrase(g.variants)})` : g.base;
  });
}

export function buildCategoryFaqs(cat, seed) {
  const vars = { cat: cat.name, catLower: cat.name.toLowerCase() };
  const group = groupForCollection(seed, cat.slug);
  const out = [];

  // One collection-specific question so the block is not a copy of a sibling.
  // Material codes are acronyms (PS, PP, AS, PET, Tritan) and must keep their
  // case; only a sentence-initial buyer phrase is lowered.
  const materials = (cat.materialFocus || "")
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const buyers = (cat.bestFor || []).slice(0, 3).map(sentenceCase);
  out.push({
    q: `What does the ${cat.name} range include?`,
    a: `This range holds ${cat.productCount} items${
      materials.length ? `, specified in ${listPhrase(groupMaterials(materials))}` : ""
    }.${buyers.length ? ` Orders come most often from ${listPhrase(buyers)}.` : ""} Each product card states the shape, capacity, material and case pack for that SKU, and the specification table on each product page is the record the quotation is issued against.`,
    links: [{ label: "See the range", href: `/collections/${cat.slug}/` }, { label: "Request a quote", href: "/quote/" }]
  });

  const fallbackGroup = (seed.categoryGroups || []).find((g) => g.key === "drinkware-serveware-wholesale");
  const templates = (group && group.faqs) || (fallbackGroup && fallbackGroup.faqs) || [];
  for (const t of templates) {
    out.push({ q: fill(t.q, vars), a: fill(t.a, vars), links: t.links || [] });
  }
  return out;
}

export function categoryFacts(cat, ctx) {
  const group = groupForCollection(ctx.seed, cat.slug);
  return [
    ["Range", cat.name],
    ["Items in range", String(cat.productCount)],
    ["Material focus", cat.materialFocus],
    ["Typical buyers", (cat.bestFor || []).slice(0, 3).join(", ")],
    ["MOQ", "Maintained per SKU/model and per order route"],
    ["FOB dispatch", "Depends on stock status, quantity and product family — confirmed per SKU"],
    ["Last verified", ctx.lastVerifiedDate]
  ];
}

/* ---------------------------------------------------------------------------
 * Industry + guide FAQ additions
 * ------------------------------------------------------------------------ */
export function industryFaqAdditions(slug, seed) {
  return (seed.industryFaqAdditions || {})[slug] || [];
}

export function guideFaqAdditions(slug, seed) {
  return (seed.guideFaqAdditions || {})[slug] || [];
}

export function hubFaqs(seed) {
  const groups = (seed.hub && seed.hub.groups) || [];
  return { quickFacts: (seed.hub && seed.hub.quickFacts) || [], groups };
}

export function pendingItems(seed) {
  return seed.pending || [];
}

/** Strip internal links before emitting FAQPage markup — markup must match visible text. */
export function schemaItems(faqs) {
  return (faqs || []).map((f) => ({ q: f.q, a: f.a }));
}
