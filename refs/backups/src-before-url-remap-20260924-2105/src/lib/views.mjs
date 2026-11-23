import { esc, fmtDate, slugify, wordCount } from "./util.mjs";
import { statSync } from "node:fs";
import { productCard, faqBlock, factsBlock, quickFactTable, specTable, itemListSchema, productSchema, faqSchema, breadcrumbSchema, articleSchema, jsonLd, casePackLabel, setPiecesLabel } from "./layout.mjs";

// Cache-busting for mutable site images: append file mtime as ?v= so a replaced
// file always gets a fresh URL instead of the browser's 1h cached copy.
const _vCache = new Map();
function vurl(p) {
  if (!p || !p.startsWith("/assets/img/")) return p;
  if (_vCache.has(p)) return _vCache.get(p);
  let out = p;
  try {
    out = `${p}?v=${statSync(`src${p.split("?")[0]}`).mtimeMs.toString(36)}`;
  } catch {}
  _vCache.set(p, out);
  return out;
}

/* ---------------------------------------------------------------------------
 * Reference-pattern helpers (2026-09 sourcing-pattern refresh)
 * - specStrip: capacity / case pack / decoration / packaging / pricing /
 *   dispatch shown together at the top of a product page.
 * - compareTable: per-range comparison of capacity, case pack and material.
 * - importSection: importer decision framework for electric models.
 * - setConfigSection: set contents and packaging choices for set products.
 * Nothing here publishes a figure that is not in the product record; pricing
 * stays quotation-only and every minimum stays "confirmed per SKU".
 * ------------------------------------------------------------------------- */
function specStrip(p) {
  const pack = casePackLabel(p);
  const rows = [
    ["Capacity", p.capacity],
    ["Case pack", pack ? `${pack} per case` : p.carton],
    ["Decoration", (p.decorationOptions || []).slice(0, 3).join(", ")],
    ["Packaging", (p.packagingOptions || []).slice(0, 3).join(", ")],
    ["Pricing", "Price on request · quoted per project"],
    ["Dispatch", p.leadTime]
  ].filter((r) => r[1] && r[1] !== "—" && String(r[1]).trim() !== "");
  return `<div class="spec-strip" role="list" aria-label="Key specification at a glance">${rows
    .map((r) => `<div class="spec-strip-item" role="listitem"><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`)
    .join("")}</div>`;
}

function setConfigSection(p) {
  const set = setPiecesLabel(p);
  if (!set) return "";
  const isComponents = set.kind === "components in one unit";
  const rows = [
    [isComponents ? "Components per unit" : "Pieces per set", String(set.pieces)],
    ["Supplied as", isComponents ? "One integrated unit, packed as a single selling unit" : "A matched set, counted and packed as one selling unit"],
    ["Set packaging", (p.packagingOptions || []).join(", ")],
    ["Set contents", "Confirmed per SKU with the quotation — the component list is part of the specification the price is issued against"],
    ["Changing the composition", "Supported — components can be added, removed or finished differently on our own tooling (OEM and ODM)"]
  ];
  return `<section class="section section-alt">
  <div class="wrap layout-split">
    <div class="prose">
      <h2>Set configuration and packaging choices</h2>
      <p>This model is sold as a set, so the quotation is issued against the complete selling unit — every piece, the packaging it goes into, and the carton it ships in — not against a single component. Before pricing we confirm the component list, the finish of each piece and the box structure, and that exact specification is what the price describes.</p>
      <p>Packaging is a separate decision from the product. A bulk export carton suits venue and distributor programmes; a retail colour box with hang tag and UPC suits shelf sale; a gift box with insert suits gift and corporate programmes. Printed boxes and inserts are developed around the approved set, so the artwork decision and the packaging decision are confirmed together.</p>
      <p>Set composition is a project decision, not a fixed one. Because the moulds are ours, components can be added, removed or finished differently — a shorter set for a promotional price point, or an extended set for a gift programme. Tell us the channel and we will propose the configuration.</p>
    </div>
    <aside class="sidebar">
      <div class="sidebar-card"><h3>Set configuration</h3>${specTable(rows)}</div>
      <div class="sidebar-card sidebar-cta">
        <h3>Specifying a set?</h3>
        <p>Send the components you want in the box, the channel it sells through and the destination. We return the set price with packaging broken out.</p>
        <a class="btn btn-primary btn-block" href="/quote/?add=${p.slug}">Add and request pricing</a>
      </div>
    </aside>
  </div>
</section>`;
}

function importSection(p) {
  if ((p.product_family || "") !== "electric_appliance") return "";
  const confirmed = [
    ["Model", p.sku],
    ["Material", p.material],
    ["Dimensions", p.dimensions],
    ["Unit weight", p.unitWeight],
    ["Case pack", p.carton],
    ["Plug standard", "Configurable to the destination market — confirmed with the quotation"],
    ["Battery format", "Configurable — confirmed with the charging specification as one system"]
  ];
  const withQuote = [
    ["Charging specification", "Input, connector, cable and charging behaviour, approved against the current version"],
    ["Battery transport documentation", "Confirmed per route and issued with the shipment"],
    ["Retail box and manual", "Structure, language, warnings and barcode, approved against the final version"],
    ["Customs classification", "Documentation for classification is provided; duty, taxes and clearance stay with the importer of record"],
    ["Warranty terms", "Stated in the quotation for the confirmed specification"]
  ];
  return `<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>Importing this model</h2>
    <p class="section-sub">What this record confirms today, what is confirmed with the quotation, and the checks that protect a branded order.</p></div>
    <div class="grid grid-2 import-grid">
      <div class="sidebar-card"><h3>Confirmed in this record</h3>${specTable(confirmed)}</div>
      <div class="sidebar-card"><h3>Confirmed with the quotation</h3>${specTable(withQuote)}</div>
    </div>
    <div class="prose wide import-checks">
      <h2>Six checks before you release a branded order</h2>
      <ol class="tick-list numbered">
        <li><strong>Start from a dated sample.</strong> Record the model, body colour, surface finish, controls and every included item against it. A product photo is not an order specification.</li>
        <li><strong>Approve battery and charging as one system.</strong> The battery format, charging input, connector and cable are confirmed together against the current version, not assumed from a catalogue field.</li>
        <li><strong>Define your cork and bottle range.</strong> State the corks and bottles the unit must handle, and approve an observable test on the sample. We do not publish performance claims the sample has not demonstrated.</li>
        <li><strong>Approve the gift or retail presentation.</strong> Neutral box, colour box, gift insert, barcode, manual language and importer information — the exact presentation affects the price and the inspection standard.</li>
        <li><strong>Keep artwork claims evidence-based.</strong> Logo, colour and layout are yours to decide; box and manual text must match the approved sample, and claims the record does not support are excluded.</li>
        <li><strong>Inspect the final version.</strong> Model identity, colour, finish, operating and release sequence, accessories, labels, box and carton count — checked against the approved revision, not against a generic unit.</li>
      </ol>
      <p>The destination market changes what the approval file must carry: operator and importer information, language, labelling, and the documentation route for battery shipments. We build that file with you order by order. Import duty, taxes and clearance remain the responsibility of the importer of record.</p>
    </div>
  </div>
</section>`;
}

export function hero(s) {
  const scenes = [
    ["/assets/img/hero/scene-cellar.jpg", "Elegant wine cellar with racked bottles"],
    ["/assets/img/hero/scene-bar.jpg", "Whisky bottles lined on a dimly lit bar counter"],
    ["/assets/img/hero/scene-party.jpg", "Friends toasting drinks at a rooftop party at sunset"]
  ];
  // Editorial hero: italic lead-in over two lines of caps, last word picked out in brass.
  // Falls back to the plain title if the admin rewrites it into a different shape.
  const tw = String(s.heroTitle || "").trim().split(/\s+/);
  const structured = tw.length === 6 && tw[4].toLowerCase() === "for";
  const heroTitleHtml = structured
    ? `<em>${esc(tw[0])}</em><span>${esc(tw.slice(1, 4).join(" "))}</span><span>${esc(tw[4])} <b>${esc(tw[5])}</b></span>`
    : `<span>${esc(s.heroTitle)}</span>`;
  return `<section class="hero hero-photo">
  ${scenes
    .map(
      ([src, alt], i) =>
        `<div class="hero-bg hero-bg-${i + 1}" style="background-image:url('${src}')" role="img" aria-label="${esc(alt)}"></div>`
    )
    .join("\n")}
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(s.heroEyebrow)}</p>
      <h1 class="hero-title">${heroTitleHtml}</h1>
      <p class="hero-sub">${esc(s.heroSubtitle)}</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="/shop/">${esc(s.heroCtaPrimary)}</a>
        <a class="btn btn-ghost" href="/quote/">${esc(s.heroCtaSecondary)}</a>
      </div>
      <ul class="hero-proof">
        <li>Own moulds — stable specification</li>
        <li>Logo printing — method and minimum confirmed per SKU</li>
        <li>Consolidated shipments</li>
        <li>Sample orders welcome</li>
      </ul>
    </div>
    <div class="hero-social">${tiktokWindow(s, { compact: true })}</div>
  </div>
</section>`;
}

export function entryPoints(products) {
  const items = [
    {
      href: "/shop/",
      title: "Wholesale Product Catalog",
      body: `All ${products.length} SKUs with capacity, material and carton data recorded per model — ready-to-ship lines alongside made-to-order shapes.`,
      cta: "Browse the catalogue"
    },
    {
      href: "/custom-branding/",
      title: "Custom Logo Wineware",
      body: "Pad printing, laser engraving, electroplating and Pantone colour matching, with the decoration method and minimum confirmed per SKU.",
      cta: "Decoration options"
    },
    {
      href: "/wholesale/",
      title: "Private Label & Packaging",
      body: "Retail colour boxes, hang tags and UPC barcodes, OEM and ODM programmes, and mixed categories consolidated into one shipment.",
      cta: "Private label programme"
    },
    {
      href: "/quote/",
      title: "Build a Corporate Gift Set",
      body: "Pick the pieces, the set composition and the presentation. We return pricing by volume tier with lead time and carton data.",
      cta: "Configure a gift set"
    }
  ];
  return `<section class="section section-alt" id="entry-points">
  <div class="wrap">
    <div class="section-head section-head--center">
      <p class="sh-script">Four ways to start</p>
      <h2>Whichever way you buy, start here</h2>
      <p class="section-sub">Importers, Amazon and e-commerce sellers, hospitality groups and gift distributors all start differently. Pick the route that matches your order.</p>
    </div>
    <div class="grid grid-4">
      ${items
        .map(
          (it) => `<a class="programme-card entry-card" href="${it.href}">
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.body)}</p>
        <span class="link-arrow">${esc(it.cta)}<span aria-hidden="true">→</span></span>
      </a>`
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function trustBar() {
  const items = [
    ["#1 ranked", "Corkscrews & Openers on Alibaba.com, 4.8/5 from 64 buyers"],
    ["Material range", "Tritan, PET, PS, PP, AS and acrylic"],
    ["Custom logo", "Pad print, laser, engraving, plating"],
    ["Colour matched", "Pantone matched with chip approval"],
    ["Retail ready", "Colour boxes, hang tags, UPC barcodes"],
    ["Consolidated", "Mixed categories, one shipment"]
  ];
  return `<section class="trust-bar"><div class="wrap trust-grid">${items
    .map(([t, d]) => `<div class="trust-item"><strong>${esc(t)}</strong><span>${esc(d)}</span></div>`)
    .join("")}</div></section>`;
}

export function categoryGrid(categories) {
  return `<div class="grid grid-3 category-grid">${categories
    .map(
      (c) => `<a class="category-card" href="/collections/${c.slug}/">
      <img src="${c.image}" alt="${esc(c.name)} wholesale collection from BYF BOOM" width="800" height="800" loading="lazy" decoding="async">
      <div class="category-card-body">
        <p class="kicker">${esc(c.kicker)}</p>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.blurb)}</p>
        <span class="link-arrow">${c.productCount} products<span aria-hidden="true">→</span></span>
      </div>
    </a>`
    )
    .join("")}</div>`;
}

export function homeView({ s, categories, products, posts, featured, faqs }) {
  const heroFeatured = products.filter((p) => p.badgeHero);
  return `
${hero(s)}
${trustBar()}
${entryPoints(products)}
<section class="section" id="catalogue">
  <div class="wrap">
    <div class="section-head section-head--center">
      <p class="sh-script">The catalogue</p>
      <h2>Sixteen product families, one factory</h2>
      <p class="section-sub">Moulded drinkware, bar tools, ice buckets and rechargeable kitchen electrics — made on our own tooling so the specification holds between orders.</p>
    </div>
    ${categoryGrid(categories.slice(0, 9))}
    <p class="center"><a class="btn btn-outline" href="/shop/">See all ${products.length} products</a></p>
  </div>
</section>
<section class="section section-alt">
  <div class="wrap">
    <div class="section-head section-head--center">
      <p class="sh-script">Two programmes</p>
      <h2>Built for the two ways buyers order</h2>
    </div>
    <div class="grid grid-2 programme-grid">
      <article class="programme-card">
        <h3>Custom logo programmes</h3>
        <p>Your logo, your colour, your packaging. Pad printing, laser engraving and electroplating with the method and minimum confirmed per SKU, a virtual proof and a physical pre-production sample before bulk production.</p>
        <ul class="tick-list">
          <li>Pantone colour matching with chip approval</li>
          <li>Retail colour boxes, hang tags and UPC barcodes</li>
          <li>Moulded-in logos on high-volume shapes</li>
        </ul>
        <a class="btn btn-primary" href="/custom-branding/">Custom branding options</a>
      </article>
      <article class="programme-card">
        <h3>Wholesale, container and OEM programmes</h3>
        <p>Every price is quoted per project rather than published as a list figure, because colour, decoration, packaging, set contents, battery format and plug standard are all built to your specification on our own tooling. Mixed categories consolidate into a single shipment and a single customs entry.</p>
        <ul class="tick-list">
          <li>Quotation per SKU and per order route</li>
          <li>Mixed-order consolidation</li>
          <li>OEM and ODM projects welcomed</li>
        </ul>
        <a class="btn btn-primary" href="/wholesale/">Wholesale programme</a>
      </article>
    </div>
  </div>
</section>
<section class="section section-dark">
  <div class="wrap">
    <div class="section-head section-head--center">
      <p class="sh-script">Who we serve</p>
      <h2>Six buyer types, six different answers</h2>
      <p class="section-sub">A promotional distributor, a wedding caterer and a hotel procurement team need different things from the same catalogue. Each page below sets out what that buyer actually asks for.</p>
    </div>
    <div class="grid grid-3 industry-grid">
      ${[
        ["promotional-distributors", "Promotional product distributors", "Decoration costed on day one, proofs that match the print, ship dates in writing."],
        ["weddings-events", "Weddings and event caterers", "Matched sets by the guest count, breakage allowances, and stock that survives pack-down."],
        ["hotels-resorts", "Hotels and resorts", "Repeat-wash drinkware for pool decks, with specifications that do not drift on reorder."],
        ["bars-nightclubs", "Bars and nightclubs", "One-piece cocktail glassware that survives late service, plus the novelty serveware that sells."],
        ["wineries-tasting-rooms", "Wineries and tasting rooms", "ISO tasting glasses, pourers, vacuum stoppers and purpose-built spittoon buckets."],
        ["retail-ecommerce", "Retail and e-commerce brands", "Retail-ready packaging, listing data and low-risk trial quantities before you commit."]
      ]
        .map(
          ([slug, name, desc]) => `<a class="industry-card" href="/industries/${slug}/">
        <h3>${esc(name)}</h3><p>${esc(desc)}</p><span class="link-arrow">Read more<span aria-hidden="true">→</span></span></a>`
        )
        .join("")}
    </div>
  </div>
</section>
${faqBlock(faqs, "Wholesale buying questions", {
  script: "Before you enquire",
  center: true,
  intro:
    "The questions buyers ask before an enquiry. MOQ, decoration minimums, packaging and FOB dispatch timing are confirmed per SKU and per order route, not from a category name."
})}
<section class="section cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>Send us your list and destination</h2>
      <p>We return pricing by volume tier with decoration and packaging broken out, plus lead time and carton data. No account required.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="/quote/">Start a quote request</a>
      <a class="btn btn-ghost" href="mailto:${esc(s.email)}">${esc(s.email)}</a>
    </div>
  </div>
</section>`;
}

/** TikTok window: single video, 16:9 mobile-friendly player.
 *  settings.social.tiktokVideo = full video URL (tiktok.com/@user/video/123…)
 *  renders the official player iframe; empty renders a styled 16:9 placeholder. */
export function tiktokWindow(s, { compact = false } = {}) {
  const handle = ((s.social && s.social.tiktok) || "").replace(/^@/, "").replace(/\/+$/, "").trim();
  const videoUrl = ((s.social && s.social.tiktokVideo) || "").trim();
  const m = videoUrl.match(/\/video\/(\d+)/);
  const videoId = m ? m[1] : "";
  const head = `<div class="social-head">
    <span class="social-id"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M16.6 3c.4 2.1 1.8 3.6 3.9 3.9v3c-1.5 0-2.8-.5-3.9-1.3v5.9c0 3.6-2.5 6-5.9 6-3.2 0-5.7-2.4-5.7-5.6 0-3.3 2.7-5.8 6.2-5.5v3.1c-1.8-.3-3.1.7-3.1 2.3 0 1.5 1.1 2.6 2.6 2.6 1.7 0 2.9-1.2 2.9-3.2V3h3z"/></svg><strong>${handle ? "@" + esc(handle) : videoId ? "BYF BOOM on TikTok" : "BYF BOOM on TikTok"}</strong></span>
    <a class="btn btn-light btn-sm" href="${videoUrl || (handle ? `https://www.tiktok.com/@${esc(handle)}` : "#")}" target="_blank" rel="noopener">Follow</a>
  </div>`;
  if (videoId) {
    return `<div class="social-window${compact ? " social-window-compact" : ""}">
  ${head}
  <div class="tt-single">
    <iframe src="https://www.tiktok.com/embed/v2/${esc(videoId)}" title="BYF BOOM TikTok video" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </div>
</div>`;
  }
  return `<div class="social-window${compact ? " social-window-compact" : ""}">
  ${head}
  <div class="tt-single tt-single-ph" style="background-image:url('/assets/img/hero/scene-party.jpg')">
    <span class="tt-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg></span>
    <span class="tt-dur">TikTok</span>
    <p class="tt-single-note">Factory floor tests, new-model drops and event setups — our latest TikTok plays here.</p>
  </div>
</div>`;
}

/** Social feed + hot sellers dynamic band. variant: "home" (social + hot), "product" (compact), "hot" (hot sellers only). */
export function socialHotBand({ s, hot = [], variant = "home" }) {
  const picks = hot.slice(0, 8);
  const head =
    variant === "hot"
      ? `<div class="section-head">
      <p class="kicker">Best sellers</p>
      <h2>What buyers are ordering this season</h2>
      <p class="section-sub">The models with the strongest repeat-order rate across events, hospitality and gifting programmes.</p>
    </div>`
      : `<div class="section-head">
      <p class="kicker">Live now</p>
      <h2>${variant === "home" ? "On TikTok and off the pallets" : "Watch it in action, then order it"}</h2>
      <p class="section-sub">Our TikTok feed on the left updates by itself every time we post. On the right, the models buyers are ordering most this season.</p>
    </div>`;
  const socialCol =
    variant === "hot"
      ? ""
      : `<div class="social-hot-col">${tiktokWindow(s, { compact: variant === "product" })}</div>`;
  return `
<section class="section section-alt social-hot${variant === "product" ? " social-hot-compact" : ""}${variant === "hot" ? " social-hot-only" : ""}">
  <div class="wrap">
    ${head}
    <div class="social-hot-grid${variant === "hot" ? " hot-only-grid" : ""}">
      ${socialCol}
      <div class="hot-window">
        <div class="hot-head">
          <h3>Hot sellers this season</h3>
          <a class="link-arrow" href="/shop/">All products<span aria-hidden="true">→</span></a>
        </div>
        <div class="hot-rotator" data-hot-rotator>
          ${picks.map((p) => `<div class="hot-card">${productCard(p, { showAdd: false })}</div>`).join("")}
        </div>
        <p class="hot-hint" data-hot-hint hidden>Rotating — hover to pause</p>
      </div>
    </div>
  </div>
</section>`;
}

export function shopView({ s, categories, products, breadcrumbs, title, h1, intro, seo }) {
  const schemas = [
    breadcrumbSchema(s, breadcrumbs),
    itemListSchema(s, h1, products)
  ];
  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    breadcrumbs,
    schemas,
    content: `
<section class="page-head">
  <div class="wrap">
    <p class="kicker">${esc(seo.kicker || "Catalogue")}</p>
    <h1>${esc(h1)}</h1>
    <p class="lead">${esc(intro)}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <form class="filter-bar" role="search" onsubmit="return false">
      <label class="filter-search">
        <span class="sr-only">Filter products</span>
        <input type="search" id="product-filter" placeholder="Filter by name, model or material…" autocomplete="off">
      </label>
      <label class="filter-select">
        <span class="sr-only">Category</span>
        <select id="category-filter">
          <option value="">All categories</option>
          ${categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-select">
        <span class="sr-only">Sort</span>
        <select id="sort-filter">
          <option value="">Catalogue order</option>
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </label>
      <p class="filter-count" id="filter-count" aria-live="polite">${products.length} products</p>
    </form>
    <div class="grid grid-4" id="product-grid">
      ${products
        .map(
          (p) =>
            `<div class="grid-item" data-cat="${p.category}" data-name="${esc(p.name.toLowerCase())}" data-sku="${esc(p.sku.toLowerCase())}" data-material="${esc(p.material.toLowerCase())}">${productCard(
              p
            )}</div>`
        )
        .join("")}
    </div>
    <p class="empty-state" id="empty-state" hidden>No products match that filter. Try a different term or <a href="/quote/">send us the specification</a> — we mould to order.</p>
  </div>
</section>
${faqBlock(
  [
    { q: "How is pricing worked out?", a: "Every model is quoted per project rather than listed at a fixed price, because colour, logo, packaging, set contents, battery format and plug standard are all built to your specification on our own tooling. Tell us the models, quantities, decoration and destination and we return a firm quotation; OEM and ODM briefs are welcome." },
    { q: "How do I order a mixture of products?", a: "Add each item to the quote list, then submit one request. Mixed orders are consolidated into a single shipment and a single customs entry, which reduces freight and processing costs." },
    { q: "Can every product on this page be customised?", a: "Yes. Colour matching, logo printing, laser engraving, electroplating and retail packaging are available across the range. The minimum for each decoration method is confirmed per SKU and per method in the quotation — it differs by process and by model." }
  ],
  "Ordering questions"
)}`
  };
}

export function collectionView({ s, category, products, breadcrumbs, related }) {
  const faqs = category.faqs;
  const schemas = [breadcrumbSchema(s, breadcrumbs), itemListSchema(s, category.h1, products), faqSchema(faqs)];
  const body = `
<section class="page-head">
  <div class="wrap">
    <p class="kicker">${esc(category.kicker)} · ${category.productCount} models · quotation per SKU</p>
    <h1>${esc(category.h1)}</h1>
    <p class="lead">${esc(category.blurb)}</p>
    <div class="hero-cta">
      <a class="btn btn-primary" href="/quote/">Request ${esc(category.name.toLowerCase())} pricing</a>
      <a class="btn btn-ghost" href="/custom-branding/">Custom logo options</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap layout-split">
    <div>
      <div class="prose">
        <h2>About this range</h2>
        <p>${esc(category.longDesc)}</p>
        <h2>Material focus</h2>
        <p>${esc(category.materialFocus)}</p>
        <h2>Who buys this range</h2>
        <ul class="tick-list">${category.bestFor.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      </div>
    </div>
    <aside class="sidebar">
      <div class="sidebar-card">
        <h3>At a glance</h3>
        ${specTable([
          ["Products in range", String(category.productCount)],
          ["Pricing basis", "Quotation per SKU"],
          ["Material focus", esc(category.materialFocus)],
          ["Custom colour", "To your Pantone reference"],
          ["Logo printing", "Method and minimum confirmed per SKU"],
          ["FOB dispatch", "Confirmed per SKU from stock status, quantity and product family"]
        ])}
      </div>
      <div class="sidebar-card sidebar-cta">
        <h3>Need a firm price?</h3>
        <p>Send the models, quantities and destination. We return pricing by volume tier with decoration and packaging broken out.</p>
        <a class="btn btn-primary btn-block" href="/quote/">Start a quote request</a>
      </div>
    </aside>
  </div>
</section>
<section class="section section-alt">
  <div class="wrap">
    <div class="section-head"><h2>${esc(category.name)} products</h2>
    <p class="section-sub">Every item below is made on our own tooling with custom colour, decoration and packaging available.</p></div>
    <div class="grid grid-4">${products.map((p) => productCard(p)).join("")}</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>Compare ${esc(category.name.toLowerCase())}</h2>
    <p class="section-sub">Capacity, case pack and material for every model in the range. Pricing is by quotation per SKU.</p></div>
    <div class="table-scroll">
      <table class="spec-table compare-table">
        <thead><tr><th scope="col">Model</th><th scope="col">Product</th><th scope="col">Capacity</th><th scope="col">Case pack</th><th scope="col">Material</th></tr></thead>
        <tbody>${products
          .map(
            (p) => `<tr><th scope="row">${esc(p.sku)}</th><td><a href="/products/${p.slug}/">${esc(p.name)}</a></td><td>${
              p.capacity && p.capacity !== "—" ? esc(p.capacity) : "—"
            }</td><td>${esc(casePackLabel(p) || "Confirmed per SKU")}</td><td>${esc(p.material)}</td></tr>`
          )
          .join("")}</tbody>
      </table>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${factsBlock(category.facts, `${category.name} — answer-ready facts`)}
  </div>
</section>
${faqBlock(faqs, `${esc(category.name)} — buyer questions`, {
  intro:
    "MOQ is held per SKU/model and per order route for this range — a standard bulk order, a decorated order and a gift-box build can each carry a different minimum."
})}
${
  related && related.length
    ? `<section class="section"><div class="wrap"><div class="section-head"><h2>Related ranges</h2></div><div class="grid grid-3">${related
        .map(
          (c) => `<a class="category-card compact" href="/collections/${c.slug}/">
        <img src="${c.image}" alt="${esc(c.name)} wholesale collection" width="800" height="800" loading="lazy">
        <div class="category-card-body"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></div></a>`
        )
        .join("")}</div></div></section>`
    : ""
}`;
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    canonical: `/collections/${category.slug}/`,
    breadcrumbs,
    schemas,
    content: body
  };
}

export function productView({ s, product, category, related, hot = [], breadcrumbs }) {
  const faqs = product.faqs;
  const schemas = [breadcrumbSchema(s, breadcrumbs), productSchema(s, product), faqSchema(faqs)];
  // ---------------------------------------------------------------------
  // Pricing policy: quotation only, sitewide. No unit price, no reference
  // range, no price tier and no MOQ figure is rendered. Colour, decoration,
  // packaging, set contents, battery format and plug standard are all made to
  // order on our own tooling, so a published number would be the price of
  // nothing. The unit price exists only inside a quotation document.
  // ---------------------------------------------------------------------
  const priceHead = `<p class="price-from price-on-request-line">Price on request <span class="muted">· quoted per project</span></p>`;

  const body = `
<section class="section product-top">
  <div class="wrap product-layout">
    <div class="product-media">
      <img src="${product.images[0]}" alt="${esc(product.imageAlt)}" width="800" height="800" fetchpriority="high">
      ${product.images.length > 1 ? `<div class="product-thumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
        ${product.images.slice(1).map((src, i) => `<a href="${esc(src)}" target="_blank" rel="noopener" aria-label="Photo ${i + 2} of ${esc(product.name)}"><img src="${esc(src)}" alt="${esc(product.imageAlt)} - photo ${i + 2}" width="96" height="96" loading="lazy" style="width:96px;height:96px;object-fit:cover;border-radius:6px;border:1px solid rgba(0,0,0,.12);"></a>`).join("")}
      </div>` : ""}
      ${product.badges.length ? `<p class="badge-row">${product.badges.map((b) => `<span class="badge">${esc(b)}</span>`).join("")}</p>` : ""}
    </div>
    <div class="product-info">
      <p class="kicker">${esc(product.categoryName)} · Model ${esc(product.sku)}</p>
      <h1>${esc(product.name)}</h1>
      <p class="lead">${esc(product.shortDescription)}</p>
      <div class="price-panel" data-pricing-mode="quoteOnly">
        ${priceHead}
        <p class="price-note">${esc(product.pricingNote || "Priced per project. Colour, decoration, packaging, set contents, battery format and plug standard are built to your specification, so the unit price is confirmed in the quotation.")}</p>
      </div>
      ${specStrip(product)}
      <div class="product-actions">
        <button class="btn btn-primary" type="button" data-add-quote data-slug="${product.slug}" data-sku="${esc(product.sku)}" data-name="${esc(product.name)}">Add to quote list</button>
        <a class="btn btn-outline" href="/quote/">Go to quote request</a>
      </div>
      <ul class="usp-list">
        <li>OEM and ODM projects welcome</li>
        <li>Pantone colour matching</li>
        <li>${esc(product.leadTime)}</li>
        <li>${esc(product.paymentTerms)}</li>
      </ul>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap layout-split">
    <div class="prose">
      <h2>Product overview</h2>
      ${product.description.map((p) => `<p>${esc(p)}</p>`).join("")}
      <h2>Features</h2>
      <ul class="tick-list">${product.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <h2>Customisation options</h2>
      <p>Decoration: ${product.decorationOptions.map((d) => esc(d)).join(", ")}.</p>
      <p>Packaging: ${product.packagingOptions.map((d) => esc(d)).join(", ")}.</p>
      <h2>Typical applications</h2>
      <ul class="tick-list">${product.applications.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      <h2>How to order this item</h2>
      <p>Add the ${esc(product.name)} to your quote list with the quantity you need, or send us the model number directly. We return a quotation that sets out the unit price for your specification, decoration cost, packaging cost and dispatch time, followed by a virtual proof and — where the finish is colour sensitive — a physical pre-production sample for approval. OEM and ODM briefs are welcome: send a drawing, a reference sample or a target cost.</p>
    </div>
    <aside class="sidebar">
      <div class="sidebar-card">
        <h3>Specification</h3>
        ${specTable([
          ["Model", esc(product.sku)],
          ["Material", esc(product.material)],
          ["Capacity", esc(product.capacity)],
          ["Dimensions", esc(product.dimensions)],
          ["Unit weight", esc(product.unitWeight)],
          ["Carton", esc(product.carton)],
          ["Category", `<a href="/collections/${category.slug}/">${esc(category.name)}</a>`],
          ["Pricing", "Quotation per SKU"],
          ["Custom logo", "Method and minimum confirmed per SKU"],
          ["Custom colour", "To your Pantone reference"],
          ["OEM / ODM", "Supported"],
          ["Dispatch", esc(product.leadTime)],
          ["Payment terms", esc(product.paymentTerms)]
        ])}
      </div>
      <div class="sidebar-card sidebar-cta">
        <h3>Request pricing for ${esc(product.sku)}</h3>
        <p>Tell us the quantity and the destination and we will return a firm quote with decoration and packaging broken out.</p>
        <a class="btn btn-primary btn-block" href="/quote/?add=${product.slug}">Add and request pricing</a>
      </div>
      <div class="sidebar-card">
        <h3>Ask us anything</h3>
        <ul class="contact-list">
          <li><a href="mailto:${esc(s.salesEmail)}?subject=Enquiry%20about%20${encodeURIComponent(product.sku)}">${esc(s.salesEmail)}</a></li>
          <li>${esc(s.phone)}</li>
          <li>WhatsApp ${esc(s.whatsapp)}</li>
        </ul>
      </div>
    </aside>
  </div>
</section>
${setConfigSection(product)}
<section class="section">
  <div class="wrap">
    ${factsBlock(product.facts, `${product.name} — answer-ready facts`)}
  </div>
</section>
${importSection(product)}
${faqBlock(faqs, `${esc(product.name)} — questions buyers ask`, {
  intro:
    "These answers are built from this SKU's record. Where a figure is not confirmed for this exact model and order route, the answer states what it depends on instead of showing an estimate."
})}
${
  related.length
    ? `<section class="section section-alt"><div class="wrap"><div class="section-head"><h2>Related products</h2></div><div class="grid grid-4">${related
        .map((p) => productCard(p))
        .join("")}</div></div></section>`
    : ""
}
${socialHotBand({ s, hot: hot.filter((p) => p.slug !== product.slug), variant: "product" })}
<section class="section cta-band">
  <div class="wrap cta-inner">
    <div><h2>Need this item in your own colour?</h2><p>Send the quantity, the Pantone reference and your artwork. We will return a decorated price and a proof.</p></div>
    <div class="cta-actions"><a class="btn btn-primary" href="/custom-branding/">Custom branding</a><a class="btn btn-ghost" href="/quote/">Request a quote</a></div>
  </div>
</section>`;
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    canonical: `/products/${product.slug}/`,
    ogImage: product.images[0],
    ogImages: product.images,
    breadcrumbs,
    schemas,
    content: body
  };
}

/** Per-industry hero carousel: licensed stock scene photos (Pexels license — free for commercial use, no attribution required).
 *  Source photos recorded in refs/image-credits.md. Landscape shots lead each list. */
const INDUSTRY_HERO_IMAGES = {
  "promotional-distributors": [
    "/assets/img/hero/industry/promotional-distributors-1.jpg",
    "/assets/img/hero/industry/promotional-distributors-2.jpg",
    "/assets/img/hero/industry/promotional-distributors-3.jpg"
  ],
  "weddings-events": [
    "/assets/img/hero/industry/weddings-events-1.jpg",
    "/assets/img/hero/industry/weddings-events-2.jpg",
    "/assets/img/hero/industry/weddings-events-3.jpg"
  ],
  "hotels-resorts": [
    "/assets/img/hero/industry/hotels-resorts-1.jpg",
    "/assets/img/hero/industry/hotels-resorts-2.jpg",
    "/assets/img/hero/industry/hotels-resorts-3.jpg"
  ],
  "bars-nightclubs": [
    "/assets/img/hero/industry/bars-nightclubs-3.jpg",
    "/assets/img/hero/industry/bars-nightclubs-2.jpg",
    "/assets/img/hero/industry/bars-nightclubs-1.jpg"
  ],
  "wineries-tasting-rooms": [
    "/assets/img/hero/industry/wineries-tasting-rooms-2.jpg",
    "/assets/img/hero/industry/wineries-tasting-rooms-3.jpg",
    "/assets/img/hero/industry/wineries-tasting-rooms-1.jpg"
  ],
  "retail-ecommerce": [
    "/assets/img/hero/industry/retail-ecommerce-1.jpg",
    "/assets/img/hero/industry/retail-ecommerce-3.jpg",
    "/assets/img/hero/industry/retail-ecommerce-2.jpg"
  ]
};

function industryHero(page, products) {
  const imgs = (INDUSTRY_HERO_IMAGES[page.slug] || []).map((src) => ({ src }));
  if (!imgs.length) {
    return `<section class="page-head"><div class="wrap">
      <p class="kicker">${esc(page.kicker)}</p>
      <h1>${esc(page.h1)}</h1>
      <p class="lead">${esc(page.intro)}</p>
    </div></section>`;
  }
  const n = imgs.length;
  const cycle = 12;
  return `<section class="industry-hero">
  <div class="industry-hero-media" aria-hidden="true">
    ${imgs
      .map(
        (im, i) =>
          `<img src="${esc(im.src)}" alt="" class="industry-hero-img" style="animation-delay:${(cycle * i) / n}s" loading="${i === 0 ? "eager" : "lazy"}" fetchpriority="${i === 0 ? "high" : "low"}">`
      )
      .join("")}
  </div>
  <div class="industry-hero-shade"></div>
  <div class="wrap industry-hero-inner">
    <p class="kicker">${esc(page.kicker)}</p>
    <h1>${esc(page.h1)}</h1>
    <p class="lead">${esc(page.intro)}</p>
    <div class="hero-cta"><a class="btn btn-primary" href="/quote/">Request a quote</a><a class="btn btn-ghost btn-light" href="/shop/">Browse the catalogue</a></div>
  </div>
</section>`;
}

export function pageView({ s, page, breadcrumbs, products, categories }) {
  const rec = (page.recommendedCollections || []).map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean);
  const recProducts = rec.length
    ? products.filter((p) => rec.some((c) => c.slug === p.category) && p.featured).slice(0, 8)
    : [];
  const schemas = [breadcrumbSchema(s, breadcrumbs), faqSchema(page.faqs)];
  const body = `
${
  page.type === "industry"
    ? industryHero(page, products)
    : page.headImage
      ? `<section class="page-head page-head-photo">
  <div class="ph-media${page.headImageFlip ? " ph-flip" : ""}" style="background-image:url('${esc(vurl(page.headImage))}')" role="img" aria-label="${esc(page.headImageAlt || "")}"></div>
  <div class="wrap">
    <div class="ph-copy">
      <p class="kicker">${esc(page.kicker)}</p>
      <h1>${esc(page.h1)}</h1>
      <p class="lead">${esc(page.intro)}</p>
    </div>
  </div>
</section>`
      : `<section class="page-head">
  <div class="wrap">
    <p class="kicker">${esc(page.kicker)}</p>
    <h1>${esc(page.h1)}</h1>
    <p class="lead">${esc(page.intro)}</p>
  </div>
</section>`
}
${page.painPoints && page.painPoints.length
      ? `<section class="section section-alt"><div class="wrap"><div class="section-head"><h2>What usually goes wrong</h2><p class="section-sub">The five problems we hear most from this buyer type.</p></div><ul class="pain-list">${page.painPoints
          .map((p) => `<li>${esc(p)}</li>`)
          .join("")}</ul></div></section>`
      : ""}
<section class="section">
  <div class="wrap layout-split">
    <div class="prose">
      ${(page.sections || [])
        .map(
          (sec) => `<h2>${esc(sec.h2)}</h2>${(sec.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}${
            sec.bullets ? `<ul class="tick-list">${sec.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""
          }${
            sec.table
              ? `<table class="spec-table pricing-modes-table"><thead><tr>${sec.table[0]
                  .map((h) => `<th scope="col">${esc(h)}</th>`)
                  .join("")}</tr></thead><tbody>${sec.table
                  .slice(1)
                  .map(
                    (r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`
                  )
                  .join("")}</tbody></table>`
              : ""
          }`
        )
        .join("")}
    </div>
    <aside class="sidebar">
      <div class="sidebar-card sidebar-cta">
        <h3>Talk to us about your programme</h3>
        <p>Send the item list, quantities, decoration and destination. We reply with pricing by volume tier, lead time and carton data.</p>
        <a class="btn btn-primary btn-block" href="/quote/">Start a quote request</a>
      </div>
      ${rec.length ? `<div class="sidebar-card"><h3>Recommended ranges</h3><ul class="link-list">${rec
          .map((c) => `<li><a href="/collections/${c.slug}/">${esc(c.name)} <span class="muted">${c.productCount} products</span></a></li>`)
          .join("")}</ul></div>` : ""}
      <div class="sidebar-card">
        <h3>Contact</h3>
        <ul class="contact-list">
          <li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>
          <li>${esc(s.phone)}</li>
          <li>${esc(s.hours)}</li>
        </ul>
      </div>
    </aside>
  </div>
</section>
${
  recProducts.length
    ? `<section class="section section-alt"><div class="wrap"><div class="section-head"><h2>Products this buyer orders most</h2></div><div class="grid grid-4">${recProducts
        .map((p) => productCard(p))
        .join("")}</div></div></section>`
    : ""
}
${faqBlock(page.faqs, `${esc(page.h1.split("|")[0].trim())} — questions`)}`;
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    canonical: `/${page.type === "industry" ? "industries" : "pages"}/${page.slug}/`.replace("/pages/", "/"),
    breadcrumbs,
    schemas,
    content: body
  };
}

export function resourcesView({ s, posts, breadcrumbs }) {
  return {
    title: "Sourcing guides for drinkware and barware buyers | BYF BOOM",
    description: "Material comparisons, quantity planning, decoration minimums and landed-cost notes for buyers of wholesale drinkware, bar tools and kitchen electrics.",
    canonical: "/resources/",
    breadcrumbs,
    schemas: [breadcrumbSchema(s, breadcrumbs), itemListSchema(s, "Sourcing guides", posts.map((p) => ({ slug: p.slug, name: p.title })))],
    content: `
<section class="page-head"><div class="wrap">
<p class="kicker">Guides</p><h1>Sourcing guides for drinkware buyers</h1>
<p class="lead">The questions buyers ask before placing a first order, answered with the numbers: material behaviour, quantity planning, decoration minimums and import duty structure.</p>
</div></section>
<section class="section"><div class="wrap">
<div class="grid grid-3">${posts
      .map(
        (p) => `<article class="card post-card"><div class="card-body">
<p class="card-sku">${esc(p.category)} · ${p.readingMinutes} min read</p>
<h3 class="card-title"><a href="/resources/${p.slug}/">${esc(p.title)}</a></h3>
<p class="card-meta">${esc(p.excerpt)}</p>
<p class="card-date">${esc(fmtDate(p.date))}</p>
<span class="link-arrow">Read the guide<span aria-hidden="true">→</span></span>
</div></article>`
      )
      .join("")}</div>
</div></section>`
  };
}

export function postView({ s, post, related, breadcrumbs }) {
  const schemas = [breadcrumbSchema(s, breadcrumbs), articleSchema(s, post), faqSchema(post.faqs)];
  const words = post.sections.reduce((n, sec) => n + (sec.body || []).reduce((m, p) => m + wordCount(p), 0), 0);
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    canonical: `/resources/${post.slug}/`,
    breadcrumbs,
    schemas,
    content: `
<article class="section post-article">
  <div class="wrap layout-split">
    <div class="prose">
      <p class="kicker">${esc(post.category)} · ${esc(fmtDate(post.date))} · ${post.readingMinutes} min read</p>
      <h1>${esc(post.h1)}</h1>
      <p class="lead">${esc(post.excerpt)}</p>
      ${post.sections
        .map(
          (sec) => `<h2>${esc(sec.h2)}</h2>${(sec.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}${
            sec.bullets ? `<ul class="tick-list">${sec.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""
          }${(sec.bodyAfterBullets || []).map((p) => `<p>${esc(p)}</p>`).join("")}`
        )
        .join("")}
      <p class="byline">Written by ${esc(post.author)}. Last reviewed ${esc(fmtDate(post.date))}. Approximately ${words} words.</p>
    </div>
    <aside class="sidebar">
      <div class="sidebar-card sidebar-cta">
        <h3>Applying this to an order?</h3>
        <p>Send us the item list and destination. We return pricing by volume tier, decoration cost and lead time.</p>
        <a class="btn btn-primary btn-block" href="/quote/">Request a quote</a>
      </div>
      <div class="sidebar-card">
        <h3>Key terms</h3>
        <ul class="tag-list">${(post.keywords || []).map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
      </div>
      <div class="sidebar-card">
        <h3>More guides</h3>
        <ul class="link-list">${related
          .map((p) => `<li><a href="/resources/${p.slug}/">${esc(p.title)}</a></li>`)
          .join("")}</ul>
      </div>
    </aside>
  </div>
</article>
${faqBlock(post.faqs, "Questions on this topic")}`
  };
}

export function faqPageView({ s, page, faqs, breadcrumbs }) {
  const groups =
    page && page.faqGroups && page.faqGroups.length
      ? page.faqGroups
      : [{ title: "All questions", faqs: faqs || [] }];
  const flat = groups.flatMap((g) => g.faqs);
  return {
    title: (page && page.seoTitle) || "Wholesale drinkware FAQ — MOQ, decoration, dispatch, samples | BYF BOOM",
    description:
      (page && page.seoDescription) ||
      "Answers on minimum order quantities, decoration, packaging, FOB dispatch time, payment terms, samples, materials and documentation for wholesale drinkware.",
    canonical: "/faq/",
    breadcrumbs,
    schemas: [breadcrumbSchema(s, breadcrumbs), faqSchema(flat)],
    content: `
<section class="page-head"><div class="wrap"><p class="kicker">${esc((page && page.kicker) || "Answers")}</p>
<h1>Frequently asked questions</h1>
<p class="lead">${esc((page && page.intro) || "The questions buyers ask before placing a first order, answered from our records.")}</p>
</div></section>
<section class="section"><div class="wrap">
<div class="prose wide">
<h2>Quick answers</h2>
${quickFactTable((page && page.quickFacts) || [])}
</div>
</div></section>
${((page && page.sections) || [])
  .map(
    (sec) => `<section class="section"><div class="wrap"><div class="prose wide">
<h2>${esc(sec.h2)}</h2>
${(sec.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}
${sec.bullets ? `<ul class="tick-list">${sec.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
</div></div></section>`
  )
  .join("")}
${groups.map((g) => faqBlock(g.faqs, g.title)).join("\n")}
<section class="section cta-band"><div class="wrap cta-inner">
<div><h2>Still have a question?</h2><p>Send it with your item list, quantities and destination and we will answer it in writing, with the quotation attached.</p></div>
<div class="cta-actions"><a class="btn btn-primary" href="/quote/">Request a quote</a><a class="btn btn-ghost" href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>
</div></section>`
  };
}

export function contactView({ s, breadcrumbs }) {
  return {
    title: "Contact BYF BOOM — wholesale drinkware and barware enquiries",
    description: "Contact BYF BOOM for wholesale drinkware, barware and kitchen electrics enquiries. Email, phone and WhatsApp details, plus a direct quote request form.",
    canonical: "/contact/",
    breadcrumbs,
    schemas: [breadcrumbSchema(s, breadcrumbs)],
    content: `
<section class="page-head"><div class="wrap"><p class="kicker">Contact</p>
<h1>Talk to the factory directly</h1>
<p class="lead">There is no account manager layer between you and the people who make the product. Send the item list and the destination and you will get pricing and lead time in writing.</p>
</div></section>
<section class="section"><div class="wrap layout-split">
<div class="prose">
<h2>Sales and quotations</h2>
<p><a href="mailto:${esc(s.salesEmail)}">${esc(s.salesEmail)}</a> — for pricing, MOQs, lead times and programme enquiries.</p>
<h2>Samples</h2>
<p><a href="mailto:${esc(s.sampleEmail)}">${esc(s.sampleEmail)}</a> — for sample orders and pre-production approval items.</p>
<h2>Phone and messaging</h2>
<p>${esc(s.phone)} · WhatsApp ${esc(s.whatsapp)} · ${esc(s.hours)}</p>
<h2>Address</h2>
<p>${esc(s.legalName)}<br>${esc(s.legalNameAlt)}<br>${esc(s.addressFull)}</p>
<h2>What happens after you write to us</h2>
<ol class="tick-list numbered">
<li>We confirm the models, quantities and destination.</li>
<li>We return a quotation by volume tier with decoration, packaging, lead time and carton data broken out.</li>
<li>You approve artwork and we issue a virtual proof, plus a physical pre-production sample where colour matters.</li>
<li>Production runs, with a check against the approved sample before packing.</li>
</ol>
</div>
<aside class="sidebar">
<div class="sidebar-card sidebar-cta">
<h3>Fastest route to a price</h3>
<p>Use the quote form with your full item list — it captures everything we need to quote without a round of emails.</p>
<a class="btn btn-primary btn-block" href="/quote/">Open the quote request</a>
</div>
<div class="sidebar-card"><h3>Factories</h3><ul class="tick-list">${s.factories.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
</aside>
</div></section>`
  };
}

export function quoteView({ s, breadcrumbs }) {
  return {
    title: "Request a quote — wholesale drinkware and barware pricing",
    description: "Build a quote list from the catalogue and request firm pricing by volume tier, with decoration, packaging and lead time broken out. Sample orders welcome.",
    canonical: "/quote/",
    breadcrumbs,
    schemas: [breadcrumbSchema(s, breadcrumbs)],
    content: `
<section class="page-head"><div class="wrap"><p class="kicker">Quote request</p>
<h1>Request a quote</h1>
<p class="lead">Three short steps: who you are, what the project needs, and how samples and timing should work. Your quote list stays beside the form — adjust quantities as you go. Anything undecided, leave it open or mark it as open; we would rather ask one question than quote the wrong specification.</p>
</div></section>
<section class="section"><div class="wrap quote-layout">
<div class="quote-main">
  <form class="quote-form" id="quote-form" data-endpoint="${esc(s.formEndpoint)}" data-sales-email="${esc(s.salesEmail)}" novalidate>
    <div class="qsteps-head">
      <ol class="qsteps" id="qsteps-nav" aria-label="Quote form steps">
        <li data-step="1" class="active"><span class="qstep-num">1</span><span class="qstep-label">Contact</span></li>
        <li data-step="2"><span class="qstep-num">2</span><span class="qstep-label">Project</span></li>
        <li data-step="3"><span class="qstep-num">3</span><span class="qstep-label">Sample &amp; send</span></li>
      </ol>
    </div>

    <div class="qstep" data-step="1">
      <h2>Your details</h2>
      <p class="form-note">Fields marked * are required. We reply within one business day, ${esc(s.hours)}.</p>
      <div class="form-grid">
        <label>Company *<input type="text" name="company" required autocomplete="organization" placeholder="Company or trading name"></label>
        <label>Contact name *<input type="text" name="name" required autocomplete="name" placeholder="Who should we reply to?"></label>
        <label>Work email *<input type="email" name="email" required autocomplete="email" placeholder="name@company.com"></label>
        <label>Phone / WhatsApp<input type="tel" name="phone" autocomplete="tel" placeholder="With country code, e.g. +1 555 010 0000"></label>
        <label>Country / region *<input type="text" name="country" required autocomplete="country-name" placeholder="e.g. United States"></label>
        <label>Buyer type
          <select name="buyerType">
            <option value="">Select…</option>
            <option>Promotional product distributor</option>
            <option>Wedding or event caterer</option>
            <option>Hotel, resort or venue</option>
            <option>Bar or nightclub</option>
            <option>Winery or tasting room</option>
            <option>Retailer or e-commerce brand</option>
            <option>Importer or wholesaler</option>
          </select>
        </label>
      </div>
    </div>

    <div class="qstep" data-step="2">
      <h2>Project details</h2>
      <p class="form-note">These fields are what a supplier needs to return a firm price on the first reply. Everything here is optional — leave it blank or mark it as open.</p>
      <div class="form-grid">
        <label class="form-span2">Quantity split per model, colour or logo version
          <textarea name="variantSplit" rows="3" placeholder="e.g. 15.0 oz Tritan wine glasses — clear for the tasting room, smoked grey for retail — with quantities per colour and one logo version"></textarea>
        </label>
        <label>Decoration
          <select name="decoration">
            <option value="">Select…</option>
            <option>No logo — plain product</option>
            <option>Logo supplied — vector file ready</option>
            <option>Logo to develop — advise on process</option>
            <option>Not decided — quote plain and decorated</option>
          </select>
        </label>
        <label>Decoration notes<input type="text" name="decorationNotes" placeholder="Position, number of colours, Pantone…"></label>
        <label>Packaging
          <select name="packaging">
            <option value="">Select…</option>
            <option>Bulk export carton</option>
            <option>Retail colour box</option>
            <option>Gift box with insert</option>
            <option>E-commerce parcel pack</option>
            <option>Mixed — advise per SKU</option>
            <option>Not decided — advise</option>
          </select>
        </label>
        <label>Pieces per set and accessories<input type="text" name="setContents" placeholder="e.g. opener + foil cutter + stopper + pourer + base, one box"></label>
        <label>Destination port or city<input type="text" name="destinationPort" placeholder="e.g. Long Beach, or a warehouse city"></label>
        <label>Trade basis
          <select name="tradeBasis">
            <option value="">Select…</option>
            <option>FOB</option>
            <option>EXW</option>
            <option>FCA</option>
            <option>DDP — advise</option>
            <option>Not sure — advise</option>
          </select>
        </label>
      </div>
      <fieldset class="check-group">
        <legend>What do you need?</legend>
        <label class="check"><input type="checkbox" name="needs" value="Custom logo printing"> Custom logo printing</label>
        <label class="check"><input type="checkbox" name="needs" value="Custom colour matching"> Custom colour matching</label>
        <label class="check"><input type="checkbox" name="needs" value="Retail packaging and UPC"> Retail packaging and UPC</label>
        <label class="check"><input type="checkbox" name="needs" value="Samples first"> Samples first</label>
        <label class="check"><input type="checkbox" name="needs" value="Consolidated shipment"> Consolidated shipment</label>
      </fieldset>
    </div>

    <div class="qstep" data-step="3">
      <h2>Sample, timing and QC</h2>
      <fieldset class="check-group">
        <legend>What should the sample prove?</legend>
        <label class="check"><input type="checkbox" name="sample" value="Plain sample — size and hand feel"> Plain sample — size and hand feel</label>
        <label class="check"><input type="checkbox" name="sample" value="Decorated sample — logo approval"> Decorated sample — logo approval</label>
        <label class="check"><input type="checkbox" name="sample" value="Complete set — component fit"> Complete set — component fit</label>
        <label class="check"><input type="checkbox" name="sample" value="Packaging sample — box and insert"> Packaging sample — box and insert</label>
        <label class="check"><input type="checkbox" name="sample" value="No sample needed"> No sample needed</label>
      </fieldset>
      <div class="form-grid">
        <label>Target date<input type="date" name="targetDate"></label>
        <label>What the target date is
          <select name="dateType">
            <option value="">Select…</option>
            <option>FOB shipment date</option>
            <option>Warehouse arrival date</option>
            <option>Retail launch date</option>
          </select>
        </label>
        <label class="form-span2">QC or compliance requirements
          <textarea name="qcNotes" rows="3" placeholder="Inspection checklist, test method, retailer manual, destination-specific documents…"></textarea>
        </label>
        <label class="form-span2">Anything else
          <textarea name="notes" rows="3" placeholder="Artwork status, target landed cost, channel notes…"></textarea>
        </label>
      </div>
      <input type="hidden" name="quoteList" id="quote-list-field">
      <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary btn-block" type="submit" id="quote-submit">Send quote request</button>
      <p class="form-note small">By submitting you agree to be contacted about this enquiry. We do not sell contact data. See the <a href="/privacy/">privacy notice</a>.</p>
    </div>

    <div class="qstep-actions">
      <button class="btn btn-ghost btn-light" type="button" id="qstep-back" hidden>Back</button>
      <button class="btn btn-primary" type="button" id="qstep-next">Next: Project details</button>
    </div>
    <p class="qstep-hint" id="qstep-hint"></p>
    <p class="form-status" id="quote-status" role="status" aria-live="polite"></p>
  </form>
</div>
<aside class="quote-side">
  <div class="quote-side-card">
    <div class="quote-side-head">
      <h2>Your quote list</h2>
      <span class="quote-count" id="quote-count" hidden></span>
    </div>
    <div id="quote-items" class="quote-items"></div>
    <p id="quote-empty" class="empty-state" hidden>Your quote list is empty. <a href="/shop/">Browse the catalogue</a> and add the items you need.</p>
    <div class="quote-tools">
      <button class="btn btn-ghost btn-light btn-sm" type="button" id="quote-clear">Clear list</button>
      <button class="btn btn-outline btn-sm" type="button" id="quote-csv">Download list (CSV)</button>
    </div>
  </div>
  <div class="quote-side-card quote-help">
    <h3>Prefer email or WhatsApp?</h3>
    <p>Send your list to <a href="mailto:${esc(s.salesEmail)}">${esc(s.salesEmail)}</a>, or message WhatsApp ${esc(s.whatsapp)} — ${esc(s.hours)}.</p>
  </div>
  <div class="quote-side-card">
    <h3>What happens after you send</h3>
    <ol class="tick-list numbered">
      <li>We confirm the models, quantities and destination.</li>
      <li>You receive pricing by volume tier, with decoration, packaging, lead time and carton data broken out.</li>
      <li>You approve artwork; we issue a virtual proof and, where colour matters, a pre-production sample.</li>
    </ol>
  </div>
</aside>
</div></section>
<section class="section section-alt"><div class="wrap">
<div class="section-head"><h2>How quoting works</h2></div>
<ul class="tick-list wide-list">${s.quoteTerms.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div></section>
<section class="section"><div class="wrap prose wide">
<h2>Prefer to write it yourself?</h2>
<p>The form above is the short version of our RFQ checklist. If you would rather prepare the enquiry in your own document, the guide below explains what each field is for and includes a plain-text template you can copy into an email: <a href="/resources/how-to-prepare-a-drinkware-rfq/">How to prepare a drinkware RFQ that returns a firm price</a>. Mark anything undecided as open — we would rather ask one question than quote the wrong specification.</p>
</div></section>`
  };
}

export function searchView({ s, categories, breadcrumbs }) {
  return {
    title: "Search the catalogue — wholesale drinkware and barware",
    description: "Search 180+ wholesale drinkware, bar tool and kitchen electric models by name, model number, material or category.",
    canonical: "/search/",
    breadcrumbs,
    schemas: [breadcrumbSchema(s, breadcrumbs)],
    content: `
<section class="page-head"><div class="wrap"><p class="kicker">Search</p><h1>Find a model</h1>
<p class="lead">Search by product name, model number, material or category. ${categories.reduce((n, c) => n + c.productCount, 0)} models in the catalogue.</p>
</div></section>
<section class="section"><div class="wrap">
<form class="filter-bar" role="search" onsubmit="return false">
<label class="filter-search"><span class="sr-only">Search</span>
<input type="search" id="site-search" placeholder="Try 'champagne flute', 'TT010', 'Tritan', 'stopper'…" autocomplete="off" autofocus></label>
</form>
<p class="filter-count" id="search-count" aria-live="polite">Start typing to search.</p>
<div class="grid grid-4" id="search-results"></div>
</div></section>`
  };
}

export function notFoundView({ s, categories }) {
  return {
    title: "Page not found",
    description: "The page you requested could not be found. Browse the catalogue of wholesale drinkware, bar tools and kitchen electrics.",
    canonical: "/404.html",
    schemas: [],
    breadcrumbs: [],
    content: `
<section class="page-head"><div class="wrap"><p class="kicker">404</p><h1>That page does not exist</h1>
<p class="lead">The link may be out of date, or the model may have been renumbered. Start from a category below, or search the catalogue.</p>
<div class="hero-cta"><a class="btn btn-primary" href="/shop/">Browse all products</a><a class="btn btn-ghost" href="/search/">Search</a></div>
</div></section>
<section class="section"><div class="wrap"><div class="grid grid-4">${categories
      .slice(0, 8)
      .map((c) => `<a class="category-card compact" href="/collections/${c.slug}/"><img src="${c.image}" alt="${esc(c.name)} collection" width="800" height="800" loading="lazy"><div class="category-card-body"><h3>${esc(c.name)}</h3></div></a>`)
      .join("")}</div></div></section>`
  };
}
