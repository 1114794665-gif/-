import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeFileSafe, esc, AI_CRAWLERS } from "./lib/util.mjs";
import { layout, organizationSchema, websiteSchema, breadcrumbSchema, jsonLd } from "./lib/layout.mjs";
// publicMoq / publicMoqDetail are still exported by the engine; pricing is now
// quotation-only so the build no longer needs them, but the FAQ gate does.
import { gateScan, extractFaqBlocks } from "./lib/faq.mjs";
import { productImage, collectionImage, heroImage, ogImage } from "./lib/images.mjs";
import {
  homeView,
  shopView,
  collectionView,
  productView,
  pageView,
  resourcesView,
  postView,
  faqPageView,
  contactView,
  quoteView,
  searchView,
  notFoundView
} from "./lib/views.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const DIST = path.join(ROOT, "dist");
const TODAY = new Date().toISOString().slice(0, 10);

const settings = readJson(path.join(DATA, "settings.json"), null);
if (!settings) throw new Error("data/settings.json missing — run: node scripts/seed.mjs");
const categories = readJson(path.join(DATA, "categories.json"), []);
const products = readJson(path.join(DATA, "products.json"), []);
const pages = readJson(path.join(DATA, "pages.json"), []);
const posts = readJson(path.join(DATA, "posts.json"), []);

const catBy = new Map(categories.map((c) => [c.slug, c]));
const prodBy = new Map(products.map((p) => [p.slug, p]));
const pageBy = new Map(pages.map((p) => [p.slug, p]));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const urls = { products: [], collections: [], pages: [], posts: [], other: [] };
const stats = { html: 0, images: 0, warnings: [] };
// Publication gate collection (pack section 8).
const gate = { pages: [], faqBlocks: [] };

function emit(route, html, kind = "other") {
  const clean = route.replace(/^\/+/, "");
  const file = clean.endsWith(".html") || clean === "404.html"
    ? path.join(DIST, clean)
    : path.join(DIST, clean, "index.html");
  writeFileSafe(file, html);
  stats.html += 1;
  gate.pages.push(html);
  const fb = extractFaqBlocks(html);
  if (fb) gate.faqBlocks.push(fb);
  const url = `${settings.domain}/${clean.replace(/index\.html$/, "")}`;
  if (kind !== "other" && urls[kind]) urls[kind].push(url);
  return url;
}

function render(view) {
  return layout({ s: settings, categories, page: view });
}

function crumbs(items) {
  return [{ label: "Home", href: "/" }, ...items];
}

// ---------- assets ----------
const assetSrc = path.join(ROOT, "src", "assets");
// Recursive copy so real product photography dropped into subfolders (e.g.
// src/assets/img/products/*.jpg) reaches dist alongside the generated SVGs.
fs.cpSync(assetSrc, path.join(DIST, "assets"), { recursive: true });

writeFileSafe(path.join(DIST, "assets", "img", "hero.svg"), heroImage());
writeFileSafe(path.join(DIST, "assets", "img", "og-default.svg"), ogImage(settings.heroTitle));
writeFileSafe(path.join(DIST, "assets", "img", "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#14171c"/><path d="M24 14h16l-2 24a6 6 0 01-6 5 6 6 0 01-6-5z" fill="none" stroke="#b08d4a" stroke-width="3"/><path d="M20 52h24" stroke="#f7f4ef" stroke-width="3" stroke-linecap="round"/></svg>`);
writeFileSafe(
  path.join(DIST, "assets", "img", "logo.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64"><rect width="320" height="64" fill="none"/><path d="M28 12h18l-2 26a7 7 0 01-7 6 7 7 0 01-7-6z" fill="none" stroke="#b08d4a" stroke-width="3"/><path d="M24 56h26" stroke="#14171c" stroke-width="3" stroke-linecap="round"/><text x="72" y="40" font-family="Georgia, serif" font-size="26" fill="#14171c">BYF BOOM</text></svg>`
);
stats.images += 3;

for (const c of categories) {
  writeFileSafe(path.join(DIST, "assets", "img", "collections", `${c.slug}.svg`), collectionImage(c));
  stats.images += 1;
}
for (const p of products) {
  writeFileSafe(path.join(DIST, "assets", "img", "products", `${p.slug}.svg`), productImage(p));
  stats.images += 1;
}

// ---------- home ----------
const featured = products.filter((p) => p.featured);
const heroPicks = [];
const seenCat = new Set();
for (const p of featured) {
  if (heroPicks.length >= 8) break;
  if (seenCat.has(p.category)) continue;
  seenCat.add(p.category);
  heroPicks.push(p);
}
for (const p of featured) {
  if (heroPicks.length >= 8) break;
  if (!heroPicks.includes(p)) heroPicks.push(p);
}

emit(
  "/",
  render({
    title: `${settings.brand} — Custom Wineware & Barware for Wholesale`,
    description: settings.defaultSeoDescription,
    canonical: "/",
    ogImage: "/assets/img/hero.svg",
    activePath: "/",    breadcrumbs: [],
    schemas: [
      organizationSchema(settings),
      websiteSchema(settings),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "BYF BOOM wholesale catalogue",
        url: `${settings.domain}/`,
        isPartOf: { "@id": `${settings.domain}/#website` },
        about: categories.map((c) => ({ "@type": "Thing", name: c.name })),
        hasPart: categories.map((c) => ({ "@type": "CollectionPage", name: c.name, url: `${settings.domain}/collections/${c.slug}/` }))
      }
    ],
    content: homeView({
      s: settings,
      categories,
      products,
      posts,
      featured: heroPicks,
      faqs: readJson(path.join(DATA, "home-faq.json"), { faqs: [] }).faqs
    })
  })
);

// ---------- shop ----------
const shopProducts = [...products].sort((a, b) => {
  const ca = catBy.get(a.category)?.order ?? 99;
  const cb = catBy.get(b.category)?.order ?? 99;
  return ca - cb || a.order - b.order;
});
emit(
  "/shop/",
  render(
    shopView({
      s: settings,
      categories,
      products: shopProducts,
      breadcrumbs: crumbs([{ label: "Shop", href: "/shop/" }]),
      h1: `All ${products.length} wholesale drinkware, bar tool and kitchen electric models`,
      intro:
        "Every model in the catalogue, with capacity, material and carton data recorded per SKU. Filter by category, name or material, then add what you need to a quote list. Pricing is by quotation: colour, decoration, packaging, set contents, battery format and plug standard are all built to your specification.",
      seo: {
        title: "All products — wholesale drinkware, bar tools and kitchen electrics",
        description: `Browse ${products.length} wholesale models across 16 product families: drinkware, bar tools, ice buckets and rechargeable kitchen electrics. Add to a quote list and request pricing per SKU.`,
        canonical: "/shop/",
        kicker: "Catalogue"
      }
    })
  ),
  "pages"
);

// ---------- collections ----------
for (const c of categories) {
  const items = products.filter((p) => p.category === c.slug);
  const related = categories.filter((x) => x.slug !== c.slug && x.kicker === c.kicker).slice(0, 3);
  if (!items.length) stats.warnings.push(`collection ${c.slug} has no products`);
  emit(
    `/collections/${c.slug}/`,
    render(
      collectionView({
        s: settings,
        category: c,
        products: items,
        breadcrumbs: crumbs([
          { label: "Shop", href: "/shop/" },
          { label: c.name, href: `/collections/${c.slug}/` }
        ]),
        related
      })
    ),
    "collections"
  );
}

// ---------- products ----------
for (const p of products) {
  const cat = catBy.get(p.category);
  const related = products
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .slice(0, 4);
  const fill = products.filter((x) => x.featured && x.category !== p.category && !related.includes(x)).slice(0, 4 - related.length);
  emit(
    `/products/${p.slug}/`,
    render(
      productView({
        s: settings,
        product: p,
        category: cat,
        related: [...related, ...fill],
        hot: featured,
        breadcrumbs: crumbs([
          { label: "Shop", href: "/shop/" },
          { label: cat.name, href: `/collections/${cat.slug}/` },
          { label: p.sku, href: `/products/${p.slug}/` }
        ])
      })
    ),
    "products"
  );
}

// ---------- industry and static pages ----------
for (const p of pages) {
  if (p.slug === "faq") {
    emit(
      "/faq/",
      render(
        faqPageView({
          s: settings,
          page: p,
          faqs: p.faqs,
          breadcrumbs: crumbs([{ label: "FAQ", href: "/faq/" }])
        })
      ),
      "pages"
    );
    continue;
  }
  emit(
    p.type === "industry" ? `/industries/${p.slug}/` : `/${p.slug}/`,
    render(
      pageView({
        s: settings,
        page: p,
        products,
        categories,
        breadcrumbs: crumbs([
          ...(p.type === "industry" ? [{ label: "Who we serve", href: "/industries/promotional-distributors/" }] : []),
          { label: p.kicker, href: p.type === "industry" ? `/industries/${p.slug}/` : `/${p.slug}/` }
        ])
      })
    ),
    "pages"
  );
}

// ---------- resources ----------
emit(
  "/resources/",
  render(
    resourcesView({
      s: settings,
      posts,
      breadcrumbs: crumbs([{ label: "Guides", href: "/resources/" }])
    })
  ),
  "posts"
);

for (const post of posts) {
  const related = posts.filter((x) => x.slug !== post.slug).slice(0, 4);
  emit(
    `/resources/${post.slug}/`,
    render(
      postView({
        s: settings,
        post,
        related,
        breadcrumbs: crumbs([
          { label: "Guides", href: "/resources/" },
          { label: post.title, href: `/resources/${post.slug}/` }
        ])
      })
    ),
    "posts"
  );
}

// ---------- utility pages ----------
emit(
  "/contact/",
  render(contactView({ s: settings, breadcrumbs: crumbs([{ label: "Contact", href: "/contact/" }]) })),
  "pages"
);
emit(
  "/quote/",
  render(quoteView({ s: settings, breadcrumbs: crumbs([{ label: "Quote request", href: "/quote/" }]) })),
  "pages"
);
emit(
  "/search/",
  render(searchView({ s: settings, categories, breadcrumbs: crumbs([{ label: "Search", href: "/search/" }]) })),
  "pages"
);
emit("/privacy/", render(
  pageView({
    s: settings,
    page: {
      slug: "privacy",
      type: "static",
      kicker: "Legal",
      h1: "Privacy notice",
      title: "Privacy notice | BYF BOOM",
      intro: "This notice explains what we do with the information you send through this website.",
      seoTitle: "Privacy notice | BYF BOOM",
      seoDescription: "How BYF BOOM handles enquiry data submitted through this website: what we collect, why, how long we keep it and how to have it removed.",
      sections: [
        { h2: "What we collect", body: ["When you submit a quote request we collect the company name, contact name, email address, telephone number, country, buyer type, the products and quantities you list, and any notes you add."] },
        { h2: "Why we collect it", body: ["Solely to prepare and send the quotation you asked for, and to follow up on that enquiry. We do not sell, rent or share contact data with third parties for marketing."] },
        { h2: "How long we keep it", body: ["Enquiry records are kept for as long as needed to service the commercial relationship, and are deleted on request."] },
        { h2: "Your choices", body: [`Write to ${settings.email} to request a copy of the information we hold about you, to correct it, or to have it deleted.`] }
      ],
      faqs: []
    },
    products,
    categories,
    breadcrumbs: crumbs([{ label: "Privacy", href: "/privacy/" }])
  })
), "pages");
emit("/terms/", render(
  pageView({
    s: settings,
    page: {
      slug: "terms",
      type: "static",
      kicker: "Legal",
      h1: "Terms of sale",
      title: "Terms of sale | BYF BOOM",
      intro: "The commercial terms that apply to quotations and orders placed with BYF BOOM.",
      seoTitle: "Terms of sale | BYF BOOM",
      seoDescription: "Terms of sale for BYF BOOM wholesale orders: quotation validity, payment terms, lead times, samples, pricing basis and importer responsibility.",
      sections: [
        { h2: "Quotations", body: ["No price is published on this website. Every unit price is quoted per project against your confirmed specification, quantity, decoration, packaging and destination, because colour, logo, set contents, battery format and plug standard are all made to order on our own tooling. A quotation is valid for approximately one month from the date of issue and states the firm price for the specification it describes."] },
        { h2: "Payment", body: ["Terms are 30% deposit in advance with the balance due before delivery, by bank transfer or Western Union, unless agreed otherwise in writing."] },
        {
          h2: "FOB dispatch",
          body: [
            "The times below are FOB hand-over at our factory, counted from approved artwork, deposit and — where applicable — approved pre-production sample. They are dispatch times only: they are not transit times and not delivery-to-door times. Destination-specific freight arrival is quoted separately.",
            "In-stock samples: dispatched within 1–3 working days after payment is received.",
            "No-stock small batch, including samples: FOB dispatch normally takes 10–15 days.",
            "No-stock orders of 1,000 pcs or more: FOB dispatch normally takes 15–25 days.",
            "No-stock electric wine openers, milk frothers, pepper grinders, coffee machines and related electrical products: FOB dispatch normally takes 45–60 working days."
          ]
        },
        { h2: "Samples and artwork", body: ["Virtual proofs are issued for layout approval. Where colour or finish is critical, a physical pre-production sample is issued for written approval before bulk production. Sample availability and cost are confirmed for the selected SKU and customization route — include the SKU, artwork, packaging requirement and destination when requesting a sample."] },
        { h2: "Import duty and clearance", body: ["Goods are sold on the agreed Incoterm. Import duty, taxes, clearance and any trade-action charges are the responsibility of the importer of record. We provide the documentation required for customs classification but do not provide customs advice."] }
      ],
      faqs: []
    },
    products,
    categories,
    breadcrumbs: crumbs([{ label: "Terms of sale", href: "/terms/" }])
  })
), "pages");

const nf = render(notFoundView({ s: settings, categories }));
writeFileSafe(path.join(DIST, "404.html"), nf);
stats.html += 1;

// ---------- robots.txt ----------
const robots = `# robots.txt — ${settings.brand}
# ${settings.legalName} · ${settings.legalNameAlt}
# Machine-readable summary for AI assistants: ${settings.domain}/llms.txt
# Full machine-readable catalogue: ${settings.domain}/llms-full.txt

User-agent: *
Allow: /
Disallow: /admin/

# ---------------------------------------------------------------------------
# AI assistants and search crawlers are explicitly welcome. Product data,
# pricing basis, specifications and sourcing guidance may be quoted by AI
# search products with attribution to ${settings.domain}.
# ---------------------------------------------------------------------------

${AI_CRAWLERS.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n")}
Sitemap: ${settings.domain}/sitemap.xml
Sitemap: ${settings.domain}/sitemap-products.xml
Sitemap: ${settings.domain}/sitemap-collections.xml
Sitemap: ${settings.domain}/sitemap-pages.xml
Sitemap: ${settings.domain}/sitemap-posts.xml
Sitemap: ${settings.domain}/sitemap-images.xml
`;
writeFileSafe(path.join(DIST, "robots.txt"), robots);

// ---------- sitemaps ----------
const urlset = (list) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || TODAY}</lastmod>\n    <changefreq>${u.changefreq || "monthly"}</changefreq>\n    <priority>${u.priority || "0.6"}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>`;
const urlsetFixed = urlset;

writeFileSafe(
  path.join(DIST, "sitemap-products.xml"),
  urlsetFixed(products.map((p) => ({ loc: `${settings.domain}/products/${p.slug}/`, lastmod: p.updatedAt, priority: "0.8" })))
);
writeFileSafe(
  path.join(DIST, "sitemap-collections.xml"),
  urlsetFixed(categories.map((c) => ({ loc: `${settings.domain}/collections/${c.slug}/`, priority: "0.8" })))
);
writeFileSafe(
  path.join(DIST, "sitemap-pages.xml"),
  urlsetFixed(
    [
      { loc: `${settings.domain}/`, priority: "1.0", changefreq: "weekly" },
      { loc: `${settings.domain}/shop/`, priority: "0.9" },
      { loc: `${settings.domain}/quote/`, priority: "0.8" },
      { loc: `${settings.domain}/contact/`, priority: "0.6" },
      { loc: `${settings.domain}/search/`, priority: "0.3" },
      ...pages.map((p) => ({ loc: `${settings.domain}/${p.type === "industry" ? "industries/" + p.slug : p.slug}/`, priority: "0.8" })),
      { loc: `${settings.domain}/privacy/`, priority: "0.2" },
      { loc: `${settings.domain}/terms/`, priority: "0.2" }
    ].filter((u) => !u.loc.endsWith("/pages/"))
  )
);
writeFileSafe(
  path.join(DIST, "sitemap-posts.xml"),
  urlsetFixed([
    { loc: `${settings.domain}/resources/`, priority: "0.7" },
    ...posts.map((p) => ({ loc: `${settings.domain}/resources/${p.slug}/`, lastmod: p.date, priority: "0.7" }))
  ])
);
writeFileSafe(
  path.join(DIST, "sitemap-images.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${products
    .map(
      (p) =>
        `  <url>\n    <loc>${settings.domain}/products/${p.slug}/</loc>\n    <image:image>\n      <image:loc>${settings.domain}${p.images[0]}</image:loc>\n      <image:title>${esc(p.name)}</image:title>\n      <image:caption>${esc(p.imageAlt)}</image:caption>\n    </image:image>\n  </url>`
    )
    .join("\n")}\n</urlset>`
);
writeFileSafe(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    "sitemap-products.xml",
    "sitemap-collections.xml",
    "sitemap-pages.xml",
    "sitemap-posts.xml",
    "sitemap-images.xml"
  ]
    .map((f) => `  <sitemap>\n    <loc>${settings.domain}/${f}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`)
    .join("\n")}\n</sitemapindex>`
);

// ---------- llms.txt ----------
const llmsLines = [];
llmsLines.push(`# ${settings.brand}`);
llmsLines.push("");
llmsLines.push(`> ${settings.llmsIntro}`);
llmsLines.push("");
llmsLines.push("## Key facts");
for (const f of settings.geoFacts) llmsLines.push(`- ${f}`);
llmsLines.push("");
llmsLines.push("## Contact");
llmsLines.push(`- Sales: ${settings.salesEmail}`);
llmsLines.push(`- Samples: ${settings.sampleEmail}`);
llmsLines.push(`- Phone: ${settings.phone}`);
llmsLines.push(`- WhatsApp: ${settings.whatsapp}`);
llmsLines.push(`- Address: ${settings.addressFull}`);
llmsLines.push(`- Hours: ${settings.hours}`);
llmsLines.push("");
llmsLines.push("## Product categories");
for (const c of categories) {
  llmsLines.push(`- [${c.name}](${settings.domain}/collections/${c.slug}/): ${c.blurb} Pricing: quotation per SKU. ${c.productCount} models.`);
}
llmsLines.push("");
llmsLines.push("## Programmes");
for (const p of pages) {
  llmsLines.push(`- [${p.h1}](${settings.domain}/${p.type === "industry" ? "industries/" + p.slug : p.slug}/): ${p.intro}`);
}
llmsLines.push("");
llmsLines.push("## Guides");
for (const p of posts) {
  llmsLines.push(`- [${p.title}](${settings.domain}/resources/${p.slug}/): ${p.excerpt}`);
}
llmsLines.push("");
llmsLines.push("## Buying and quoting");
for (const t of settings.quoteTerms) llmsLines.push(`- ${t}`);
llmsLines.push("");
llmsLines.push("## How MOQ is displayed");
llmsLines.push("- MOQ is maintained per SKU/model and per order route. It is never calculated from a category name.");
llmsLines.push("- A standard bulk order, a logo-decorated order and a custom gift-box build can each carry a different minimum for the same model.");
llmsLines.push("- Where no MOQ number is published for a SKU, the confirmed figure is issued with the quotation. Some made-to-order models are not available by carton or small batch.");
llmsLines.push("");
llmsLines.push("## FOB dispatch time");
llmsLines.push("- In-stock samples are dispatched within 1–3 working days after payment is received.");
llmsLines.push("- No-stock small batches, including samples: FOB dispatch normally takes 10–15 days.");
llmsLines.push("- No-stock orders of 1,000 pcs or more: FOB dispatch normally takes 15–25 days.");
llmsLines.push("- No-stock electrical products (electric wine openers, milk frothers, pepper grinders, coffee machines): FOB dispatch normally takes 45–60 working days.");
llmsLines.push("- FOB dispatch is a hand-over time, not a delivery date to the destination. Destination-specific freight arrival is quoted separately.");
llmsLines.push("- Where a logo, custom packaging or a technical confirmation is outstanding, the quotation states the start condition for the dispatch clock.");
llmsLines.push("");
llmsLines.push("## How pricing is displayed");
llmsLines.push("- Prices published on this site are list references for planning only. The firm price is the quotation issued against quantity, decoration, packaging and delivery terms.");
llmsLines.push("- Standard moulded drinkware, stoppers and pourers: public tiered reference pricing — these are standardised, so buyers compare unit price and order quantity.");
llmsLines.push("- Electric wine openers, milk frothers and grinders: a from-price is shown; battery type, plug standard, certification and packaging are costed on quotation.");
llmsLines.push("- Electric barware and accessory sets: a reference price range is shown; cost varies by combination.");
llmsLines.push("- LED and custom ice buckets: MOQ with a reference range; decoration method, mould, size and lighting options are costed on quotation.");
llmsLines.push("- New-mould custom products: quotation only — a reliable price needs the design requirements first.");
llmsLines.push("");
llmsLines.push("## Public-claim policy");
llmsLines.push("- We publish only statements supported by current product, factory, quotation, packaging or quality-control records.");
llmsLines.push("- We do not publish an MOQ, a production time, a certification or a performance claim that is not held in a record. Where a figure differs by SKU, it is confirmed with the quotation rather than printed across a whole category.");
llmsLines.push("- Decoration methods are named once confirmed for the material of the selected SKU. Certification and food-contact documentation are confirmed per model and per destination market.");
llmsLines.push("- Food-contact test reports for the destination market can be arranged on request.");
llmsLines.push("");
llmsLines.push("## FAQ");
llmsLines.push(`- [All questions](${settings.domain}/faq/): supplier scope, ordering and MOQ, decoration and packaging, FOB dispatch and duty, samples and payment, materials and documentation.`);
llmsLines.push("- Homepage FAQ covers supplier scope and the quote route. Category pages answer category procurement questions. SKU pages answer the buying objection for that exact model, including its specification, MOQ route, packing, gift-set route, sample route, FOB dispatch time and care instruction.");
llmsLines.push("- FAQ answers are gated: an answer is published only when the facts behind it are held in a record for that SKU, and no MOQ, price or lead time is shown for a SKU that has not been confirmed.");
llmsLines.push("");
llmsLines.push("## How to request a quote");
llmsLines.push(`- Submit a structured request at ${settings.domain}/quote/ or email ${settings.salesEmail} with model numbers, quantities, decoration requirements and destination.`);
llmsLines.push("");
llmsLines.push("## Documentation");
llmsLines.push(`- [Full product catalogue](${settings.domain}/llms-full.txt)`);
llmsLines.push(`- [Sitemap](${settings.domain}/sitemap.xml)`);
llmsLines.push(`- [FAQ](${settings.domain}/faq/)`);
llmsLines.push(`- [About](${settings.domain}/about/)`);
writeFileSafe(path.join(DIST, "llms.txt"), llmsLines.join("\n") + "\n");

// ---------- llms-full.txt ----------
const full = [];
full.push(`# ${settings.brand} — full product catalogue (machine readable)`);
full.push("");
full.push(`> ${settings.llmsIntro}`);
full.push("");
full.push(`Generated ${TODAY} from ${products.length} models in ${categories.length} product families.`);
full.push("");
full.push("## Company");
full.push(`${settings.legalName} / ${settings.legalNameAlt}`);
full.push(`${settings.addressFull}`);
full.push(`Sales ${settings.salesEmail} · Samples ${settings.sampleEmail} · ${settings.phone} · WhatsApp ${settings.whatsapp}`);
full.push("");
full.push("## Facts");
for (const f of settings.geoFacts) full.push(`- ${f}`);
full.push("");
full.push("## Terms");
for (const t of settings.quoteTerms) full.push(`- ${t}`);
full.push("");
// Pricing is quotation-only sitewide, so an AI crawler is given the pricing
// rule rather than a number: there is no public unit price, reference range or
// MOQ figure for any SKU.
function llmsPriceLine() {
  return "- Pricing: on request — quoted per project against your confirmed specification, quantity, decoration, packaging and destination. OEM and ODM briefs welcome. No unit price, price range or minimum order quantity is published for any SKU.";
}

for (const c of categories) {
  full.push(`## ${c.name}`);
  full.push(`${c.blurb}`);
  full.push(`${c.longDesc}`);
  full.push(`Material focus: ${c.materialFocus}. Best for: ${c.bestFor.join(", ")}. Pricing: quotation per SKU.`);
  full.push(`Collection page: ${settings.domain}/collections/${c.slug}/`);
  full.push("");
  for (const p of products.filter((x) => x.category === c.slug)) {
    full.push(`### ${p.name} (model ${p.sku})`);
    full.push(`- URL: ${settings.domain}/products/${p.slug}/`);
    full.push(`- Material: ${p.material}`);
    full.push(`- Capacity: ${p.capacity}`);
    full.push(`- Dimensions: ${p.dimensions}`);
    full.push(`- Unit weight: ${p.unitWeight}`);
    full.push(`- Carton: ${p.carton}`);
    full.push(llmsPriceLine());
    full.push(`- Washing: ${/Tritan|PP|AS/i.test(p.material) ? "top-rack commercial wash (material guidance)" : "hand wash recommended"}`);
    full.push(`- Customisation: OEM and ODM supported — logo, Pantone colour matching, retail colour box, hang tag and UPC barcode to specification; method and minimum confirmed per SKU in the quotation`);
    full.push(`- Description: ${p.description[1]}`);
    full.push("");
  }
}
full.push("## Guides");
for (const p of posts) {
  full.push(`### ${p.title}`);
  full.push(`URL: ${settings.domain}/resources/${p.slug}/`);
  full.push(p.excerpt);
  for (const sec of p.sections) {
    full.push(`#### ${sec.h2}`);
    for (const para of sec.body || []) full.push(para);
    for (const b of sec.bullets || []) full.push(`- ${b}`);
  }
  full.push("");
}
writeFileSafe(path.join(DIST, "llms-full.txt"), full.join("\n"));

// ---------- feed ----------
const feedItems = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${settings.domain}/resources/${p.slug}/</link>
      <guid isPermaLink="true">${settings.domain}/resources/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`
  )
  .join("\n");
writeFileSafe(
  path.join(DIST, "feed.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${esc(settings.brand)} sourcing guides</title>
  <link>${settings.domain}/resources/</link>
  <description>${esc(settings.defaultSeoDescription)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${feedItems}
</channel></rss>`
);

// ---------- search index ----------
// No price, price range or MOQ field is emitted: pricing is quotation-only, and
// this file is fetched by any visitor, so an internal reference figure must not
// travel in it.
const searchIndex = products.map((p) => ({
  s: p.slug,
  n: p.name,
  k: p.sku,
  c: p.categoryName,
  m: p.material,
  pm: "quoteOnly",
  q: "Quotation per SKU",
  u: `/products/${p.slug}/`,
  i: p.images[0]
}));
writeFileSafe(path.join(DIST, "search-index.json"), JSON.stringify(searchIndex));

// ---------- host config ----------
writeFileSafe(
  path.join(DIST, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=()
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
/*.xml
  Content-Type: application/xml; charset=utf-8
`
);
writeFileSafe(
  path.join(DIST, "_redirects"),
  `/admin/* /404.html 404
`
);
writeFileSafe(
  path.join(DIST, "site.webmanifest"),
  JSON.stringify(
    {
      name: settings.brand,
      short_name: settings.brand,
      description: settings.tagline,
      start_url: "/",
      display: "standalone",
      background_color: "#f7f4ef",
      theme_color: "#14171c",
      icons: [{ src: "/assets/img/favicon.svg", sizes: "any", type: "image/svg+xml" }]
    },
    null,
    2
  )
);

// ---------- FAQ audit + publication gate (pack section 8) ----------
const faqText = gate.faqBlocks.join("\n");
const siteText = gate.pages
  .join("\n")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");
const faqGate = gateScan(faqText);
const siteGate = gateScan(siteText);

const BANDS = { homepage: [4, 5], category: [5, 8], sku: [6, 10], guide: [6, 10], industry: [5, 8] };
const inBand = (n, band) => n >= band[0] && n <= band[1];
const band = (arr) => {
  const counts = arr.map((x) => (x.faqs || []).length);
  return counts.length ? { pages: counts.length, min: Math.min(...counts), max: Math.max(...counts) } : { pages: 0, min: 0, max: 0 };
};

const homeFaqCount = readJson(path.join(DATA, "home-faq.json"), { faqs: [] }).faqs.length;
const outOfBand = [];
if (!inBand(homeFaqCount, BANDS.homepage)) outOfBand.push(`homepage ${homeFaqCount}`);
for (const c of categories) if (!inBand((c.faqs || []).length, BANDS.category)) outOfBand.push(`category ${c.slug} ${(c.faqs || []).length}`);
for (const p of products) if (!inBand((p.faqs || []).length, BANDS.sku)) outOfBand.push(`sku ${p.sku} ${(p.faqs || []).length}`);
for (const p of posts) if (!inBand((p.faqs || []).length, BANDS.guide)) outOfBand.push(`guide ${p.slug} ${(p.faqs || []).length}`);
for (const p of pages) if (p.type === "industry" && !inBand((p.faqs || []).length, BANDS.industry)) outOfBand.push(`industry ${p.slug} ${(p.faqs || []).length}`);

const faqCount = (arr) => arr.reduce((n, x) => n + ((x.faqs || []).length), 0);

// Regression guard: no MOQ figure may be published by any route. The pack
// forbids printing an MOQ that is not held in a record, and it specifically
// forbids defaulting to 500 or 1,000 to make the form look accessible.
const publicMoqHits = [];
for (const text of gate.pages) {
  const clean = text.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  for (const m of clean.matchAll(/MOQ[\s:,]{0,3}([0-9][0-9,]*)\s*(?:\+)?\s*(?:pieces|pcs|sets|units)?/gi)) {
    publicMoqHits.push(m[0].trim());
  }
}
// Same check against the machine-readable surfaces AI crawlers read.
for (const rel of ["llms.txt", "llms-full.txt", "search-index.json"]) {
  const f = path.join(DIST, rel);
  if (!fs.existsSync(f)) continue;
  for (const m of fs.readFileSync(f, "utf8").matchAll(/"mq":\s*(?!null)[0-9]+/g)) publicMoqHits.push(`${rel} ${m[0]}`);
}
const publishedVerified = products.filter((p) => (p.moq_display_mode || "quote_only") === "published_verified").length;

// Regression guard: pricing is quotation-only sitewide, so neither a rendered
// page nor a machine-readable surface may carry a currency figure. A "$" followed
// by digits is the signature of a published price. The internal tier reference in
// data/*.json is intentionally excluded — it never reaches dist/.
const publicPriceHits = [];
const PRICE_RE = /\$\s?\d[\d,]*(?:\.\d{1,2})?/g;
for (const text of gate.pages) {
  const clean = text.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  for (const m of clean.matchAll(PRICE_RE)) publicPriceHits.push(m[0].trim());
}
for (const rel of ["llms.txt", "llms-full.txt", "search-index.json"]) {
  const f = path.join(DIST, rel);
  if (!fs.existsSync(f)) continue;
  for (const m of fs.readFileSync(f, "utf8").matchAll(PRICE_RE)) publicPriceHits.push(`${rel} ${m[0]}`);
}

const faqAudit = {
  generated: new Date().toISOString(),
  pack: "Boomspring FAQ implementation pack v1.0",
  lastVerifiedDate: settings.lastVerifiedDate || TODAY,
  faqTotal: faqCount(products) + faqCount(categories) + faqCount(pages) + faqCount(posts) + homeFaqCount,
  allocation: {
    homepage: homeFaqCount,
    sku: band(products),
    category: band(categories),
    guide: band(posts),
    industry: band(pages.filter((p) => p.type === "industry"))
  },
  bandsRequired: BANDS,
  outOfBand,
  moqDisplayModes: products.reduce((a, p) => {
    const m = p.moq_display_mode || "quote_only";
    a[m] = (a[m] || 0) + 1;
    return a;
  }, {}),
  leadTimeRoutes: products.reduce((a, p) => {
    const r = p.product_family === "electric_appliance" ? "electric_appliance" : "general";
    a[r] = (a[r] || 0) + 1;
    return a;
  }, {}),
  publicationGate: { faqBlocks: faqGate, site: siteGate },
  unresolvedTokens: [...new Set([...faqGate.tokens, ...siteGate.tokens])],
  publicMoqFigures: {
    publishedVerifiedSkus: publishedVerified,
    renderedFigures: [...new Set(publicMoqHits)],
    ok: publishedVerified === 0 ? publicMoqHits.length === 0 : true
  },
  pricingPolicy: "quotation_only",
  publicPriceFigures: {
    renderedFigures: [...new Set(publicPriceHits)],
    ok: publicPriceHits.length === 0
  },
  pendingItems: readJson(path.join(DATA, "faq-pending.json"), { items: [] }).items.map((i) => i.id)
};
writeFileSafe(path.join(DIST, "faq-audit.json"), JSON.stringify(faqAudit, null, 2));

if (outOfBand.length) stats.warnings.push(`FAQ count outside the pack bands: ${outOfBand.slice(0, 8).join(", ")}${outOfBand.length > 8 ? " …" : ""}`);
if (publicMoqHits.length && publishedVerified === 0) {
  stats.warnings.push(`Public MOQ figure published while no SKU is verified: ${[...new Set(publicMoqHits)].slice(0, 5).join(", ")}`);
}
if (publicPriceHits.length) {
  stats.warnings.push(`Price figure published while pricing is quotation-only: ${[...new Set(publicPriceHits)].slice(0, 5).join(", ")}`);
}
if (faqGate.tokens.length) stats.warnings.push(`Unresolved CMS tokens in FAQ: ${faqGate.tokens.join(", ")}`);
if (siteGate.tokens.length) stats.warnings.push(`Unresolved CMS tokens on pages: ${siteGate.tokens.join(", ")}`);
for (const b of siteGate.banned) stats.warnings.push(`Banned claim on site: ${b.pattern} ×${b.hits}`);

// ---------- SEO audit ----------
const audit = {
  generated: new Date().toISOString(),
  htmlPages: stats.html,
  products: products.length,
  collections: categories.length,
  pages: pages.length,
  posts: posts.length,
  missingSeoTitle: products.filter((p) => !p.seoTitle).length,
  missingSeoDescription: products.filter((p) => !p.seoDescription).length,
  titlesOver60: products.filter((p) => p.seoTitle.length > 70).length,
  descriptionsOver160: products.filter((p) => p.seoDescription.length > 175).length,
  missingImageAlt: products.filter((p) => !p.imageAlt).length,
  productsWithoutFaq: products.filter((p) => !p.faqs || p.faqs.length < 3).length,
  faqPagesOutOfBand: outOfBand.length,
  faqBannedClaims: siteGate.banned.length,
  faqAdvisories: siteGate.advisories.map((a) => `${a.pattern} ×${a.hits}`),
  warnings: stats.warnings
};
writeFileSafe(path.join(DIST, "seo-audit.json"), JSON.stringify(audit, null, 2));

console.log(`built ${stats.html} HTML pages and ${stats.images} images into dist/`);
console.log(`  products ${products.length} · collections ${categories.length} · pages ${pages.length} · guides ${posts.length}`);
console.log(`  FAQ ${faqAudit.faqTotal} answers · out-of-band ${outOfBand.length} · banned claims ${siteGate.banned.length} · tokens ${faqAudit.unresolvedTokens.length}`);
if (stats.warnings.length) console.log("  warnings:", stats.warnings.join("; "));
