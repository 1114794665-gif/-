const BG = "#f7f4ef";
const SAND = "#e6ddce";
const GLASS = "#dfe6ea";
const GLASS_STROKE = "#8fa2ad";
const BRASS = "#b08d4a";

const SHAPES = {
  stemless: `
    <path d="M300 250 Q300 240 312 240 L488 240 Q500 240 500 250 L488 520 Q486 545 462 545 L338 545 Q314 545 312 520 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M300 300 L500 300" stroke="${BRASS}" stroke-width="3" opacity=".65"/>`,
  stemmed: `
    <path d="M290 210 Q290 200 302 200 L498 200 Q510 200 510 210 Q510 360 470 410 Q440 448 400 452 Q360 448 330 410 Q290 360 290 210 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="392" y="452" width="16" height="150" rx="6" fill="${GLASS_STROKE}"/>
    <ellipse cx="400" cy="615" rx="105" ry="17" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M296 260 L504 260" stroke="${BRASS}" stroke-width="3" opacity=".65"/>`,
  flute: `
    <path d="M330 180 Q330 168 344 168 L456 168 Q470 168 470 180 Q470 400 430 440 Q414 456 400 458 Q386 456 370 440 Q330 400 330 180 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="393" y="458" width="14" height="145" rx="6" fill="${GLASS_STROKE}"/>
    <ellipse cx="400" cy="615" rx="95" ry="16" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>`,
  coupe: `
    <path d="M250 250 Q250 236 268 236 L532 236 Q550 236 550 250 Q550 330 490 356 Q440 378 400 380 Q360 378 310 356 Q250 330 250 250 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="393" y="380" width="14" height="220" rx="6" fill="${GLASS_STROKE}"/>
    <ellipse cx="400" cy="615" rx="105" ry="17" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>`,
  mug: `
    <path d="M290 240 L510 240 L494 560 Q492 580 470 580 L330 580 Q308 580 306 560 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M510 300 Q580 310 580 380 Q580 450 510 462" fill="none" stroke="${GLASS_STROKE}" stroke-width="16" stroke-linecap="round"/>
    <path d="M300 330 L500 330" stroke="${BRASS}" stroke-width="3" opacity=".6"/>`,
  pitcher: `
    <path d="M320 220 L500 220 L470 580 Q468 600 446 600 L348 600 Q326 600 324 580 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M320 220 Q300 214 296 190" fill="none" stroke="${GLASS_STROKE}" stroke-width="4" stroke-linecap="round"/>
    <path d="M500 280 Q570 300 566 380 Q562 460 498 470" fill="none" stroke="${GLASS_STROKE}" stroke-width="15" stroke-linecap="round"/>`,
  shot: `
    <path d="M330 340 L470 340 L452 560 Q450 576 434 576 L366 576 Q350 576 348 560 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M336 400 L464 400" stroke="${BRASS}" stroke-width="3" opacity=".65"/>`,
  novelty: `
    <circle cx="400" cy="330" r="150" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M290 250 L340 300 M510 250 L460 300 M280 340 L340 340 M520 340 L460 340 M400 180 L400 240" stroke="${SAND}" stroke-width="6" stroke-linecap="round"/>
    <rect x="393" y="480" width="14" height="130" rx="6" fill="${GLASS_STROKE}"/>
    <ellipse cx="400" cy="620" rx="80" ry="14" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>`,
  bucket: `
    <path d="M280 300 L520 300 L470 580 Q466 600 444 600 L356 600 Q334 600 330 580 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="262" y="272" width="276" height="34" rx="10" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M320 290 Q400 220 480 290" fill="none" stroke="${GLASS_STROKE}" stroke-width="4"/>
    <path d="M300 420 L500 420" stroke="${BRASS}" stroke-width="3" opacity=".55"/>`,
  tool: `
    <path d="M352 300 L448 300 L448 600 Q448 618 430 618 L370 618 Q352 618 352 600 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="336" y="230" width="128" height="80" rx="14" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M368 200 L432 200 L432 240 L368 240 Z" fill="${BRASS}" opacity=".8"/>
    <path d="M370 460 L430 460" stroke="${BRASS}" stroke-width="3" opacity=".6"/>`,
  appliance: `
    <rect x="368" y="180" width="64" height="330" rx="30" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="360" y="160" width="80" height="40" rx="14" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M400 510 Q400 570 400 610 M400 610 Q360 640 336 610 M400 610 Q440 640 464 610" fill="none" stroke="${GLASS_STROKE}" stroke-width="7" stroke-linecap="round"/>`,
  grinder: `
    <path d="M340 240 L460 240 L452 560 Q450 578 432 578 L368 578 Q350 578 348 560 Z"
      fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="336" y="196" width="128" height="48" rx="12" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <circle cx="400" cy="250" r="14" fill="${BRASS}"/>
    <path d="M348 380 L452 380" stroke="${BRASS}" stroke-width="3" opacity=".55"/>`,
  set: `
    <path d="M240 330 L312 330 L300 560 Q299 572 288 572 L252 572 Q241 572 240 560 Z" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <path d="M356 260 L428 260 L418 560 Q417 574 406 574 L368 574 Q357 574 356 560 Z" fill="${GLASS}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="470" y="300" width="120" height="30" rx="10" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="470" y="360" width="120" height="30" rx="10" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>
    <rect x="470" y="420" width="120" height="30" rx="10" fill="${SAND}" stroke="${GLASS_STROKE}" stroke-width="3"/>`
};

const CATEGORY_SHAPE = {
  "tritan-drinkware": "stemmed",
  "stemless-wine-glasses": "stemless",
  "wine-glasses": "stemmed",
  "champagne-flutes": "flute",
  "coupe-martini-margarita": "coupe",
  "beer-glasses-mugs": "mug",
  "pitchers-jugs": "pitcher",
  "shot-glasses": "shot",
  "novelty-drinkware": "novelty",
  "ice-buckets-coolers": "bucket",
  "wine-stoppers-pourers": "tool",
  "corkscrews-openers": "appliance",
  "milk-frothers": "appliance",
  "salt-pepper-grinders": "grinder",
  "coffee-grinders": "grinder",
  "bar-sets-gifts": "set"
};

function frame(shapeKey, label, sub) {
  const shape = SHAPES[shapeKey] || SHAPES.stemless;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img">
<rect width="800" height="800" fill="${BG}"/>
<circle cx="400" cy="380" r="268" fill="${SAND}" opacity="0.55"/>
${shape}
<text x="400" y="714" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#14171c">${label}</text>
<text x="400" y="754" text-anchor="middle" font-family="system-ui, Segoe UI, Arial, sans-serif" font-size="22" fill="#6b7280">${sub}</text>
</svg>`;
}

export function productImage(product) {
  const shape = CATEGORY_SHAPE[product.category] || "stemless";
  return frame(shape, product.sku, `${product.material} · ${product.capacity}`);
}

export function collectionImage(category) {
  const shape = CATEGORY_SHAPE[category.slug] || "stemless";
  return frame(shape, category.name, `${category.productCount} products`);
}

export function heroImage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
<rect width="1600" height="900" fill="#14171c"/>
<circle cx="1180" cy="420" r="300" fill="#22272f"/>
<g transform="translate(880 120) scale(1.1)">
  <path d="M290 210 Q290 200 302 200 L498 200 Q510 200 510 210 Q510 360 470 410 Q440 448 400 452 Q360 448 330 410 Q290 360 290 210 Z" fill="#2b3138" stroke="#4d5860" stroke-width="3"/>
  <rect x="392" y="452" width="16" height="150" rx="6" fill="#4d5860"/>
  <ellipse cx="400" cy="615" rx="105" ry="17" fill="#2b3138" stroke="#4d5860" stroke-width="3"/>
</g>
<g transform="translate(520 260) scale(0.8)">
  <path d="M330 180 Q330 168 344 168 L456 168 Q470 168 470 180 Q470 400 430 440 Q414 456 400 458 Q386 456 370 440 Q330 400 330 180 Z" fill="#2b3138" stroke="#4d5860" stroke-width="3"/>
</g>
<text x="120" y="430" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="#f7f4ef">Built for events,</text>
<text x="120" y="520" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="#b08d4a">venues and gifting</text>
<text x="120" y="600" font-family="system-ui, Segoe UI, Arial, sans-serif" font-size="30" fill="#a8b0b8">Factory direct · custom logo · colour matched</text>
</svg>`;
}

export function ogImage(title) {
  const safe = String(title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const line = safe.length > 42 ? safe.slice(0, 40) + "…" : safe;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img">
<rect width="1200" height="630" fill="#14171c"/>
<circle cx="980" cy="315" r="240" fill="#22272f"/>
<text x="90" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="52" fill="#f7f4ef">${line}</text>
<text x="90" y="380" font-family="system-ui, Segoe UI, Arial, sans-serif" font-size="28" fill="#a8b0b8">Wholesale drinkware, bar tools and kitchen electrics</text>
<text x="90" y="470" font-family="system-ui, Segoe UI, Arial, sans-serif" font-size="30" fill="#b08d4a">BYF BOOM</text>
</svg>`;
}
