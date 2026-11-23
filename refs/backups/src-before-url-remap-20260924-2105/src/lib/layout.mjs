import { esc } from "./util.mjs";

export function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

export function organizationSchema(s) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${s.domain}/#organization`,
    name: s.brand,
    legalName: s.legalName,
    alternateName: s.legalNameAlt,
    url: `${s.domain}/`,
    description: s.defaultSeoDescription,
    logo: `${s.domain}/assets/img/logo.svg`,
    email: s.email,
    telephone: s.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.addressFull,
      addressLocality: "Shenzhen",
      addressRegion: "Guangdong",
      addressCountry: "CN"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: s.salesEmail,
        telephone: s.phone,
        availableLanguage: ["en", "zh"],
        areaServed: ["US", "CA", "GB", "AU", "EU"]
      }
    ],
    knowsAbout: [
      "Wholesale reusable drinkware",
      "Custom logo drinkware",
      "Bar tools and wine accessories",
      "Rechargeable kitchen electrics",
      "Hotel and event glassware supply"
    ],
    sameAs: Object.values(s.social || {}).filter(Boolean)
  };
}

export function websiteSchema(s) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${s.domain}/#website`,
    url: `${s.domain}/`,
    name: s.brand,
    publisher: { "@id": `${s.domain}/#organization` },
    inLanguage: s.locale,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${s.domain}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  };
}

export function breadcrumbSchema(s, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: `${s.domain}${it.href}`
    }))
  };
}

export function faqSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}

export function productSchema(s, product) {
  const cat = product.category;

  // ---------------------------------------------------------------------
  // Pricing policy: the site publishes NO unit price, price range or MOQ
  // figure. Colour, decoration, packaging, set contents, battery format and
  // plug standard are all configurable on our own tooling, so any published
  // number would be an invented claim rather than a held fact. The unit price
  // exists only inside a quotation document. Structured data therefore carries
  // an unpriced Offer with no availability assertion.
  // ---------------------------------------------------------------------
  const additionalProperty = [
    { "@type": "PropertyValue", name: "Capacity", value: product.capacity },
    { "@type": "PropertyValue", name: "Dimensions", value: product.dimensions },
    { "@type": "PropertyValue", name: "Unit weight", value: product.unitWeight },
    { "@type": "PropertyValue", name: "Carton", value: product.carton },
    {
      "@type": "PropertyValue",
      name: "Washing guidance",
      value: /Tritan|PP|AS/i.test(product.material)
        ? "Top-rack commercial wash (material guidance)"
        : "Hand wash recommended"
    },
    { "@type": "PropertyValue", name: "Pricing basis", value: "Quotation per SKU" },
    {
      "@type": "PropertyValue",
      name: "Customisation",
      value: "OEM and ODM supported — logo, colour, packaging and configuration built to specification"
    }
  ];

  const offers = {
    "@type": "Offer",
    "@id": `${s.domain}/products/${product.slug}/#offer`,
    priceCurrency: "USD",
    seller: { "@id": `${s.domain}/#organization` },
    url: `${s.domain}/products/${product.slug}/`,
    description:
      "Price on request — quoted per project against confirmed specification, quantity, decoration, packaging and destination. OEM and ODM projects welcome. The figure on the quotation is the firm price."
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${s.domain}/products/${product.slug}/#product`,
    name: product.name,
    sku: product.sku,
    mpn: product.sku,
    description: product.seoDescription,
    image: [`${s.domain}${product.images[0]}`],
    category: product.categoryName,
    material: product.material,
    brand: { "@type": "Brand", name: s.brand },
    manufacturer: { "@id": `${s.domain}/#organization` },
    countryOfOrigin: "CN",
    additionalProperty,
    offers,
    isRelatedTo: { "@type": "CollectionPage", name: `${product.categoryName} collection`, url: `${s.domain}/collections/${cat}/` }
  };
}

export function itemListSchema(s, name, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${s.domain}/products/${p.slug}/`,
      name: p.name
    }))
  };
}

export function articleSchema(s, post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${s.domain}/resources/${post.slug}/#article`,
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: s.locale,
    articleSection: post.category,
    author: { "@type": "Organization", name: post.author || s.brand, url: s.domain },
    publisher: { "@id": `${s.domain}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${s.domain}/resources/${post.slug}/` },
    about: (post.keywords || []).slice(0, 6).map((k) => ({ "@type": "Thing", name: k }))
  };
}

function navItem(item, activePath) {
  const active = activePath === item.href || (item.href !== "/" && activePath.startsWith(item.href));
  if (item.children) {
    return `<li class="nav-item has-sub">
      <button type="button" class="nav-link" aria-expanded="false">${esc(item.label)}<span class="caret" aria-hidden="true"></span></button>
      <ul class="sub-menu">${item.children
        .map((c) => `<li><a href="${c.href}"${activePath === c.href ? ' aria-current="page"' : ""}>${esc(c.label)}</a></li>`)
        .join("")}</ul>
    </li>`;
  }
  return `<li class="nav-item"><a class="nav-link${active ? " is-active" : ""}" href="${item.href}"${
    active ? ' aria-current="page"' : ""
  }>${esc(item.label)}</a></li>`;
}

/** Sitewide floating RFQ widget: name, wholesale purpose, work email. */
function rfqFloat(s) {
  const buyerOptions = [
    "Promotional product distributor",
    "Wedding or event caterer",
    "Hotel, resort or venue",
    "Bar or nightclub",
    "Winery or tasting room",
    "Retailer or e-commerce brand",
    "Importer or wholesaler"
  ];
  return `<div class="rfq-float" id="rfq-float" data-state="open">
  <button class="rfq-float-tab" id="rfq-float-tab" type="button" aria-expanded="true" aria-controls="rfq-float-panel">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v11H9l-5 4V5z"/></svg>
    <span>Get pricing</span>
  </button>
  <div class="rfq-float-panel" id="rfq-float-panel" role="dialog" aria-label="Quick pricing enquiry">
    <div class="rfq-float-head">
      <strong>Get a price in one business day</strong>
      <button class="rfq-float-close" id="rfq-float-close" type="button" aria-label="Minimise">&times;</button>
    </div>
    <p class="rfq-float-note">Tell us who you are, what you buy and your work email — we reply with pricing by volume tier.</p>
    <form id="rfq-float-form" data-endpoint="${esc(s.formEndpoint)}" data-sales-email="${esc(s.salesEmail)}" novalidate>
      <label>Name / title *<input type="text" name="name" required autocomplete="name" placeholder="e.g. Anna Smith, Purchasing Manager"></label>
      <label>What do you buy? *
        <select name="buyerType" required>
          <option value="">Select your business…</option>
          ${buyerOptions.map((o) => `<option>${esc(o)}</option>`).join("")}
        </select>
      </label>
      <label>Work email *<input type="email" name="email" required autocomplete="email" placeholder="name@company.com"></label>
      <input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary btn-block" type="submit">Send — get pricing</button>
      <p class="form-status" id="rfq-float-status" role="status" aria-live="polite"></p>
      <p class="form-note small">No spam. We reply within one business day, ${esc(s.hours)}.</p>
    </form>
  </div>
</div>`;
}

export function layout({ s, categories, page }) {
  const {
    title,
    description,
    canonical,
    ogImage = s.defaultOgImage,
    ogImages = null,
    schemas = [],
    breadcrumbs = [],
    bodyClass = "",
    content,
    activePath = "/"
  } = page;

  const fullTitle = title.includes(s.brand) ? title : `${title} | ${s.brand}`;
  const canonicalUrl = `${s.domain}${canonical}`;
  const ogUrl = `${s.domain}${ogImage}`;
  const analytics =
    s.analytics && s.analytics.provider === "plausible" && s.analytics.id
      ? `<script defer data-domain="${esc(s.analytics.id)}" src="https://plausible.io/js/script.js"></script>`
      : "";

  const bcHtml = breadcrumbs.length
    ? `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${breadcrumbs
        .map((b, i) =>
          i === breadcrumbs.length - 1
            ? `<li aria-current="page">${esc(b.label)}</li>`
            : `<li><a href="${b.href}">${esc(b.label)}</a></li>`
        )
        .join("")}</ol></nav>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonicalUrl}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
<meta name="author" content="${esc(s.legalName)}">
<meta name="theme-color" content="#14171c">
<link rel="alternate" hreflang="en-us" href="${canonicalUrl}">
<link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
<link rel="alternate" type="application/rss+xml" title="${esc(s.brand)} guides" href="${s.domain}/feed.xml">
<meta property="og:site_name" content="${esc(s.brand)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogUrl}">
${Array.isArray(ogImages) && ogImages.length > 1 ? ogImages.slice(1).map((src) => `<meta property="og:image" content="${s.domain}${esc(src)}">`).join("\n") : ""}
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogUrl}">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/favicon.svg">
<link rel="stylesheet" href="/assets/styles.css">
${schemas.filter(Boolean).map(jsonLd).join("\n")}
${analytics}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="announce">${esc(s.announcement)}</div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${esc(s.brand)} home">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44" width="38" height="38" fill="none" focusable="false">
        <path d="M12 4h20c0 8.8-4.1 14.2-8.6 15.6V32h5.1a2.6 2.6 0 1 1 0 5.2H15.5a2.6 2.6 0 1 1 0-5.2h5.1V19.6C16.1 18.2 12 12.8 12 4Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M14.8 10.8c.5 3.4 2.4 5.9 5.2 7.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
        <path d="M17.5 8.6c0 .5-.4.9-.9.9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>
        <circle cx="34.6" cy="9.8" r="1.8" fill="currentColor"/>
        <circle cx="38.2" cy="15.2" r="1.15" fill="currentColor" opacity=".7"/>
        <circle cx="32.4" cy="16.8" r=".9" fill="currentColor" opacity=".45"/>
      </svg></span>
      <span class="brand-text"><strong>${esc(s.brand)}</strong><small>${esc(s.tagline)}</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span><span class="sr-only">Menu</span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul class="nav-list">${s.nav.map((i) => navItem(i, activePath)).join("")}</ul>
    </nav>
    <div class="header-actions">
      <a class="icon-btn" href="/search/" aria-label="Search products">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      </a>
      <a class="icon-btn quote-btn" href="/quote/" aria-label="Quote request">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18l-1.5 12H4.5L3 6z"/><path d="M8 6a4 4 0 018 0"/></svg>
        <span class="quote-count" data-quote-count hidden>0</span>
        <span class="quote-label">Quote list</span>
      </a>
      <a class="btn btn-primary btn-sm header-cta" href="/quote/">Request pricing</a>
    </div>
  </div>
</header>
<main id="main" class="${bodyClass}">
${bcHtml}
${content}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <strong>${esc(s.brand)}</strong>
      <p>${esc(s.defaultSeoDescription)}</p>
      <p class="footer-legal-line">${esc(s.legalName)}<br>${esc(s.legalNameAlt)}</p>
    </div>
    <div>
      <h3>Shop</h3>
      <ul>${categories
        .slice(0, 8)
        .map((c) => `<li><a href="/collections/${c.slug}/">${esc(c.name)}</a></li>`)
        .join("")}
      <li><a href="/shop/">All products</a></li></ul>
    </div>
    <div>
      <h3>Programmes</h3>
      <ul>
        <li><a href="/wholesale/">Wholesale programme</a></li>
        <li><a href="/custom-branding/">Custom branding</a></li>
        <li><a href="/industries/promotional-distributors/">Promotional distributors</a></li>
        <li><a href="/industries/weddings-events/">Weddings and events</a></li>
        <li><a href="/industries/hotels-resorts/">Hotels and resorts</a></li>
        <li><a href="/industries/bars-nightclubs/">Bars and nightclubs</a></li>
      </ul>
    </div>
    <div>
      <h3>Support</h3>
      <ul>
        <li><a href="/faq/">FAQ</a></li>
        <li><a href="/resources/">Guides</a></li>
        <li><a href="/about/">About us</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href="/quote/">Request a quote</a></li>
        <li><a href="/llms.txt">llms.txt</a></li>
      </ul>
    </div>
    <div>
      <h3>Contact</h3>
      <ul class="contact-list">
        <li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>
        <li>${esc(s.phone)}</li>
        <li>WhatsApp ${esc(s.whatsapp)}</li>
        <li>${esc(s.hours)}</li>
        <li>${esc(s.addressShort)}</li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>&copy; ${new Date().getFullYear()} ${esc(s.brand)}. All rights reserved. ${esc(s.legalName)} · ${esc(s.legalNameAlt)}</p>
    <p class="footer-note">Pricing is by quotation only: colour, decoration, packaging, set contents, battery format and plug standard are built to order, so the unit price is confirmed per SKU in the quotation you receive. OEM and ODM projects welcome. Import duty, taxes and clearance are the responsibility of the importer of record.</p>
  </div>
</footer>
${page.canonical === "/quote/" || page.canonical === "/contact/" ? "" : rfqFloat(s)}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

/**
 * Price line for cards and product pages.
 *
 * Site pricing policy is quotation-only: colour, decoration, packaging, set
 * contents, battery format and plug standard are all configurable, so a public
 * number would not be the price of anything. Kept as a function so a future
 * range that genuinely holds a published price can branch here.
 */
export function priceLineHtml() {
  return `<span class="price-on-request">Price on request</span> <span class="muted">· quoted per project</span>`;
}

/**
 * Case-pack quantity taken from the carton record, e.g. "72 pcs" or "36 sets".
 * Returns "" when the record has no leading count, so the caller can skip the
 * line instead of publishing a guess.
 */
export function casePackLabel(p) {
  const m = String(p && p.carton ? p.carton : "").match(/^(\d+)\s*(pcs|pieces|sets|units)\b/i);
  if (!m) return "";
  const unit = m[2].toLowerCase() === "pieces" ? "pcs" : m[2].toLowerCase();
  return `${m[1]} ${unit}`;
}

/** Pieces per set, derived from the product name only ("Set of 4", "5 in 1"). */
export function setPiecesLabel(p) {
  const name = String(p && p.name ? p.name : "");
  let m = name.match(/set of (\d+)/i);
  if (m) return { pieces: Number(m[1]), kind: "matched pieces" };
  m = name.match(/(\d+)\s*[- ]?in\s*[- ]?1/i);
  if (m) return { pieces: Number(m[1]), kind: "components in one unit" };
  return null;
}

export function productCard(p, opts = {}) {
  const pack = casePackLabel(p);
  return `<article class="card product-card">
  <a class="card-media" href="/products/${p.slug}/">
    <img src="${p.images[0]}" alt="${esc(p.imageAlt)}" width="800" height="800" loading="lazy" decoding="async">
    ${p.badges.length ? `<span class="badge-row">${p.badges.map((b) => `<span class="badge">${esc(b)}</span>`).join("")}</span>` : ""}
  </a>
  <div class="card-body">
    <p class="card-sku">${esc(p.sku)} · ${esc(p.material)}</p>
    <h3 class="card-title"><a href="/products/${p.slug}/">${esc(p.name)}</a></h3>
    <p class="card-meta">${esc(p.capacity)}${pack ? ` · ${esc(pack)}/case` : ""} · ${esc(p.categoryName)}</p>
    <p class="card-price">${priceLineHtml()}</p>
    ${opts.showAdd !== false ? `<button class="btn btn-outline btn-sm" type="button" data-add-quote data-slug="${p.slug}" data-sku="${esc(p.sku)}" data-name="${esc(p.name)}">Add to quote list</button>` : ""}
  </div>
</article>`;
}

/** Crawlable internal links attached to an FAQ answer (pack section 5). */
export function faqLinks(links) {
  const list = (links || []).filter((l) => l && l.href && l.label);
  if (!list.length) return "";
  return `<p class="faq-links">${list.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('<span aria-hidden="true"> · </span>')}</p>`;
}

export function faqBlock(faqs, heading = "Frequently asked questions", opts = {}) {
  if (!faqs || !faqs.length) return "";
  const introHtml = opts.intro ? `<p class="section-sub">${esc(opts.intro)}</p>` : "";
  const head = opts.center
    ? `<div class="section-head section-head--center">
    ${opts.script ? `<p class="sh-script">${esc(opts.script)}</p>` : ""}
    <h2>${esc(heading)}</h2>
    ${introHtml}
  </div>`
    : `<h2>${esc(heading)}</h2>
    ${introHtml}`;
  return `<section class="section faq-section"${opts.id ? ` id="${esc(opts.id)}"` : ""}>
  <div class="wrap">
    ${head}
    <div class="faq-list${opts.center ? " faq-list--center" : ""}">
      ${faqs
        .map(
          (f) => `<details class="faq-item">
        <summary><h3>${esc(f.q)}</h3></summary>
        <div class="faq-answer"><p>${esc(f.a)}</p>${faqLinks(f.links)}</div>
      </details>`
        )
        .join("")}
    </div>
  </div>
</section>`;
}

/** GEO answer-ready facts block (pack section 7). */
export function factsBlock(rows, heading = "Answer-ready product facts") {
  if (!rows || !rows.length) return "";
  return `<div class="facts-block">
  <h3>${esc(heading)}</h3>
  <dl>${rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join("")}</dl>
</div>`;
}

/** Quick-answer table used at the top of the FAQ hub. */
export function quickFactTable(rows) {
  if (!rows || !rows.length) return "";
  return `<table class="spec-table quick-facts"><tbody>${rows
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("")}</tbody></table>`;
}

export function specTable(rows) {
  return `<table class="spec-table"><tbody>${rows
    .filter((r) => r && r[1] !== undefined && r[1] !== "" && r[1] !== "—")
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`)
    .join("")}</tbody></table>`;
}
