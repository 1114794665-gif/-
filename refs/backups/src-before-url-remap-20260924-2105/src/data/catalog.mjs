// BYF BOOM 产品目录原始数据
// 来源：Catalogue of BYF BOOM 260914.pdf（深圳博盈丰精密模具 / 深圳邦普林贸易）
// 字段：model|name|category|material|capacity|size|weight|carton|indicativePriceUSD|flags
// flags: f=首页推荐 n=新品 g=电镀/金色版本 b=最优价

export const CATEGORY_DEFS = [
  {
    slug: "tritan-drinkware",
    name: "Tritan Drinkware",
    h1: "Tritan™ Reusable Drinkware for Wholesale",
    kicker: "Premium line",
    blurb: "Crystal-clear, repeat-wash Tritan™ stemware and stemless glasses engineered for hotels, resorts and venues where glass is banned.",
    longDesc: "Our Tritan™ line is the premium tier of the BYF BOOM catalogue. Tritan™ copolyester delivers the clarity and thin rim of fine crystal with the impact resistance of engineering plastic, which is why it is the material of choice for pool decks, rooftop bars, stadium suites and resort restaurants that cannot risk broken glass. Every piece is moulded for repeated commercial washing and intended for repeat service rather than single use. The exact polymer grade, its safety data sheet and any food-contact test report for the grade supplied are issued with the quotation. Choose Tritan™ when the guest experience has to look like glass and survive like plastic.",
    materialFocus: "Tritan™ copolyester",
    bestFor: ["Hotels and resorts", "Pool and beach service", "Rooftop bars", "Cruise and yacht operations"],
    priceBand: "$3.80 – $8.50 / unit"
  },
  {
    slug: "stemless-wine-glasses",
    name: "Stemless Wine Glasses",
    h1: "Wholesale Stemless Wine Glasses — PET and Gold Rim",
    kicker: "Event volume line",
    blurb: "Lightweight stemless wine glasses and champagne flutes in PET, with optional gold-rim finishing for weddings and gifting.",
    longDesc: "Stemless PET drinkware is the workhorse of event and wedding service. Because there is no stem to snap, packed cases survive freight and tent setup far better than traditional stemware, and the low unit weight keeps shipping cost per guest down. This range covers the two sizes venues order most — 12 oz and 16 oz wine, plus a 9 oz flute — with plain and gold-rim versions so you can run a matched table setting at two different price points without changing silhouette.",
    materialFocus: "PET, PET with gold rim",
    bestFor: ["Wedding and event caterers", "Party rental companies", "Promotional distributors", "Airline and hospitality gifting"],
    priceBand: "$2.20 – $3.20 / unit"
  },
  {
    slug: "wine-glasses",
    name: "Wine Glasses",
    h1: "Wholesale Plastic Wine Glasses for Events and Hospitality",
    blurb: "Moulded wine glasses and goblets in PS, PP, AS and acrylic — the volume alternative to breakable stemware.",
    kicker: "Core range",
    longDesc: "This is the broadest range in the catalogue: classic stemmed wine glasses from 7 oz tasting pours up to 21 oz generous pours, in polystyrene for everyday volume, polypropylene for a softer hand feel, and acrylic for the closest visual match to real glass. Every mould is our own, so rim thickness, base weight and box counts are consistent order after order — which matters when you are promising a venue or a retail chain the same glass next season.",
    materialFocus: "PS, PP, AS, acrylic",
    bestFor: ["Bars and restaurants", "Event caterers", "Retail and e-commerce brands", "Wine tasting rooms"],
    priceBand: "$2.40 – $5.20 / unit"
  },
  {
    slug: "champagne-flutes",
    name: "Champagne Flutes",
    h1: "Wholesale Reusable Champagne Flutes",
    blurb: "Classic, ribbed and square champagne flutes from 4.5 oz to 11 oz, ready for logo printing and colour matching.",
    kicker: "Celebration line",
    longDesc: "Champagne service is where breakage hurts most — a dropped flute stops the toast and creates a safety issue on a dance floor. These flutes are moulded in one piece with a reinforced foot and a rolled rim that will not split. The range spans traditional round flutes, ribbed textures that read as premium in photography, and square profiles that stack more efficiently in storage. All styles can be produced in a custom colour and printed with your client's logo.",
    materialFocus: "PS, PP/PS",
    bestFor: ["Wedding and event planners", "Hotels and ballrooms", "Wineries and tasting rooms", "Promotional distributors"],
    priceBand: "$2.20 – $3.60 / unit"
  },
  {
    slug: "coupe-martini-margarita",
    name: "Coupe, Martini & Margarita",
    h1: "Wholesale Coupe, Martini and Margarita Glasses",
    blurb: "Cocktail silhouettes built for pool decks, lounges and high-volume outdoor bar programmes.",
    kicker: "Cocktail line",
    longDesc: "Coupe, martini and margarita glasses are the hardest shapes to keep intact in glass: a wide bowl on a narrow stem is exactly the geometry that fails on a wet floor. Moulding them in one piece removes the weakest joint and lets you run cocktail service outdoors, poolside and on boats without a glass ban. The ribbed coupe in particular photographs like a premium crystal piece while costing a fraction of one.",
    materialFocus: "PS, acrylic",
    bestFor: ["Bars and nightclubs", "Pool and beach venues", "Catering companies", "Cocktail bars"],
    priceBand: "$2.60 – $4.20 / unit"
  },
  {
    slug: "beer-glasses-mugs",
    name: "Beer Glasses & Mugs",
    h1: "Wholesale Plastic Beer Glasses, Mugs and Steins",
    blurb: "Steins, tulip pints, hiball tumblers and heavy-base mugs for high-throughput beer service.",
    kicker: "Draught service",
    longDesc: "Beer service at volume punishes drinkware: mugs get stacked wet, knocked off trays and dumped into bus tubs. This range uses heavier base walls and reinforced handles so the glass feels substantial in the hand and survives commercial handling. Tulip pints and pilsner shapes present a proper head, while the plain hiball tumbler is the most economical route to a matched house glass across every drink on your menu.",
    materialFocus: "PS, PP",
    bestFor: ["Bars and brewpubs", "Stadiums and festivals", "Hotels and resorts", "Beer gardens"],
    priceBand: "$1.90 – $3.40 / unit"
  },
  {
    slug: "pitchers-jugs",
    name: "Pitchers & Jugs",
    h1: "Wholesale Plastic Beer Pitchers and Jugs",
    blurb: "1.4 L to 2 L pitchers, with or without lids, for sharing serves and table service.",
    kicker: "Table service",
    longDesc: "Plastic pitchers remove two problems at once: weight on the server's wrist and breakage at the table. This range runs from a 1.4 L pour-your-own pitcher to a lidded 2 L jug for sangria and batch cocktails, all with a moulded lip that pours cleanly and a wide mouth that a commercial wash cycle can reach.",
    materialFocus: "PS, PP",
    bestFor: ["Bars and restaurants", "Beer gardens", "Hotels and resorts", "Festivals"],
    priceBand: "$6.50 – $9.50 / unit"
  },
  {
    slug: "shot-glasses",
    name: "Shot Glasses",
    h1: "Wholesale Shot Glasses and Novelty Spirits Glassware",
    blurb: "Standard shots, tasting minis, novelty sets and a 12-piece LED shot glass set for party retail.",
    kicker: "Impulse and novelty",
    longDesc: "Shot glasses are the most gifted and most collected drinkware category, which makes them the easiest add-on for retail, promotional and venue programmes. Alongside standard 1.4 oz shots and 3 oz tasting minis, this range carries the pieces that sell on sight: a 12-gauge shotgun set, a 50-caliber bullet set, glow-illuminated LED shots and a cowboy boot shot glass that has become a staple in country and western themed venues.",
    materialFocus: "PS, PS with plating, PS with LED",
    bestFor: ["Retail and gift stores", "Promotional distributors", "Themed bars", "Nightclubs"],
    priceBand: "$0.65 – $3.20 / unit",
    keywords: ["wholesale novelty shot glasses", "LED shot glasses bulk", "bullet shot glass set wholesale"]
  },
  {
    slug: "novelty-drinkware",
    name: "Novelty Drinkware",
    h1: "Novelty Drinkware — Disco Ball Cups and Beer Bats",
    blurb: "Statement pieces that sell the photograph: mirror-finish disco ball cups and 22 oz beer bats with optional stand.",
    kicker: "Statement pieces",
    longDesc: "Some products exist to be photographed and posted, and that is exactly what this line does. The electroplated disco ball cup ships with a straw and turns any cocktail into a mirror-ball moment; the 22 oz beer bat is a proven revenue driver at sports bars, festivals and themed venues where guests buy the vessel, not just the drink. Both are available with colour-box packaging and logo printing for retail and gifting programmes.",
    materialFocus: "PS with electroplating, PP, ABS",
    bestFor: ["Themed bars and nightclubs", "Sports bars", "Festivals", "Retail and e-commerce brands"],
    priceBand: "$2.80 – $4.60 / unit"
  },
  {
    slug: "ice-buckets-coolers",
    name: "Ice Buckets & Coolers",
    h1: "Wholesale Ice Buckets, LED Ice Buckets and Wine Tasting Spittoons",
    blurb: "1 L to 12 L ice buckets, double-wall coolers, LED-lit buckets, spittoon buckets, ice tongs and bottle racks.",
    kicker: "Service and storage",
    longDesc: "This range covers everything that holds, chills or clears away: tabletop 1 L buckets, classic 4 L and 8 L champagne buckets, a 12 L double-wall cooler for bottle service, and a boat-shaped 5 L bucket built for seafood and grazing displays. The LED versions add rechargeable illumination for bottle service and evening terrace service, and the wine tasting spittoon buckets give tasting rooms a hygienic, purpose-built solution for guided flights.",
    materialFocus: "PS, PP, PET, PS with LED module",
    bestFor: ["Hotels and resorts", "Bars and nightclubs", "Wineries and tasting rooms", "Catering companies"],
    priceBand: "$3.60 – $22.00 / unit"
  },
  {
    slug: "wine-stoppers-pourers",
    name: "Wine Stoppers & Pourers",
    h1: "Wholesale Wine Stoppers, Pourers and Champagne Sippers",
    blurb: "Vacuum stoppers, champagne sippers, aerator pourers and bottle stoppers — the highest-volume items in the catalogue.",
    kicker: "Bar essentials",
    longDesc: "Small, light and endlessly reorderable, wine stoppers and pourers are how you build a repeat-order account. This range runs from a 0.55-cent-class universal pourer through silicone vacuum stoppers with a 31-day freshness dial, stainless vacuum stoppers, and the champagne sipper family — including electroplated and branded versions that clients order as event favours and gift-with-purchase items. Custom logo moulding is available on the highest-volume shapes.",
    materialFocus: "ABS, silicone, TPR, acrylic, stainless steel",
    bestFor: ["Promotional distributors", "Wineries and tasting rooms", "Restaurants and hotels", "Gift and retail"],
    priceBand: "$0.55 – $3.80 / unit"
  },
  {
    slug: "corkscrews-openers",
    name: "Corkscrews & Wine Openers",
    h1: "Wholesale Corkscrews, Electric Wine Openers and Dispensers",
    blurb: "Manual openers, wing corkscrews, air-pump openers, USB rechargeable openers, aerating dispensers and kits.",
    kicker: "Higher-ticket line",
    longDesc: "Rechargeable wine tools carry the strongest margin in the catalogue and the least tariff exposure, because they classify as electrical goods rather than plastic tableware. This range spans simple ABS foil cutters and air-pump openers up to aluminium-alloy rechargeable openers, aerating dispensers and five- to six-piece gift kits that sell as boxed sets. All electric units ship without batteries for ocean freight and can be configured with USB-C charging, gift boxes and your client's logo.",
    materialFocus: "ABS, aluminium alloy, stainless steel, zinc alloy",
    bestFor: ["Retail and e-commerce brands", "Promotional distributors", "Gift and corporate programmes", "Kitchenware retailers"],
    priceBand: "$1.20 – $18.50 / unit",
    keywords: ["wholesale rechargeable wine opener", "electric corkscrew bulk supplier", "wine opener gift set wholesale"]
  },
  {
    slug: "milk-frothers",
    name: "Milk Frothers",
    h1: "Wholesale Electric and Rechargeable Milk Frothers",
    blurb: "Battery and USB rechargeable milk frothers, with interchangeable heads, stands and retail gift cases.",
    kicker: "Kitchen electrics",
    blurbShort: "Handheld frothers in battery and rechargeable versions, with 2- and 3-head configurations.",
    longDesc: "Handheld milk frothers are a proven high-turn retail item with a light shipping profile and a strong gift and kitchen-shop sell-through. This range covers battery models and USB rechargeable models, with single, double and triple whisk heads, optional countertop stands, and colour-box or travel-case packaging for retail. Because they are sold as small kitchen electrics rather than plastic tableware, they sit in a materially better duty band than drinkware.",
    materialFocus: "ABS, stainless steel 304, iron",
    bestFor: ["Kitchenware retailers", "Retail and e-commerce brands", "Gift programmes", "Coffee shops and cafes"],
    priceBand: "$2.60 – $6.20 / unit"
  },
  {
    slug: "salt-pepper-grinders",
    name: "Salt & Pepper Grinders",
    h1: "Wholesale Electric Salt and Pepper Grinders",
    blurb: "Battery and USB rechargeable grinders, gravity models, and 2-pack sets with bases — for retail and gift programmes.",
    kicker: "Kitchen electrics",
    longDesc: "Electric grinders are the highest-value kitchen electric in the catalogue and one of the easiest to sell as a two-pack gift. This range includes classic push-button models, gravity-activated grinders that mill one-handed, USB rechargeable units, and matched two-pack sets with wooden or charging bases. A clear feature set — adjustable ceramic or stainless burr, visible fill window, washable grinder body — is what lets a retailer sell these without a salesperson.",
    materialFocus: "ABS, PMMA, acrylic, stainless steel",
    bestFor: ["Kitchenware retailers", "Gift and corporate programmes", "Retail and e-commerce brands", "Hotels and restaurants"],
    priceBand: "$5.50 – $13.50 / unit"
  },
  {
    slug: "coffee-grinders",
    name: "Coffee Grinders",
    h1: "Wholesale Rechargeable and Manual Coffee Grinders",
    blurb: "USB rechargeable and manual burr coffee grinders for travel, gifting and coffee retail.",
    kicker: "Coffee line",
    longDesc: "Portable coffee grinders sell to the same buyer as drinkware and bar tools, which makes them an efficient line extension for a gift or kitchen assortment. Two rechargeable models share one body platform for easier assortment planning, and the manual aluminium-alloy grinder covers the lower price point and the no-battery requirement for some gift programmes.",
    materialFocus: "ABS, AS, aluminium alloy",
    bestFor: ["Coffee retailers", "Gift and corporate programmes", "Retail and e-commerce brands", "Promotional distributors"],
    priceBand: "$8.50 – $14.00 / unit"
  },
  {
    slug: "bar-sets-gifts",
    name: "Bar Sets & Gift Kits",
    h1: "Wholesale Bar Tool Sets and Boxed Gift Kits",
    blurb: "Boxed corkscrew and bar-tool kits plus a three-tier salt rimmer — the gift-ready end of the catalogue.",
    kicker: "Gift ready",
    longDesc: "Boxed sets solve the two things gift and promotional buyers complain about most: artworking the pack and getting a coherent assortment. These kits ship in moulded cases and colour boxes with matched accessories — corkscrew, foil cutter, stopper, pourer, drop stop — in black or wood-finish handles, ready for a logo on the case or the tool. They are the fastest route to a sellable gift SKU without building a pack from components.",
    materialFocus: "ABS, wood, metal",
    bestFor: ["Gift and corporate programmes", "Promotional distributors", "Retail and e-commerce brands", "Wineries"],
    priceBand: "$6.50 – $16.50 / unit"
  }
];

export const RAW_PRODUCTS = `
TT031|Tritan Wine Glass 15.5 oz|tritan-drinkware|Tritan copolyester|445 ml / 15.5 oz|60 x 80 x 215 mm|82 g|72 pcs / 58x52x50 cm / 11 kg|6.90|f
TT010|Tritan Wine Glass 12 oz|tritan-drinkware|Tritan copolyester|360 ml / 12 oz|60 x 80 x 224 mm|82 g|96 pcs / 63x63x51 cm / 17 kg|6.80|f
TT041|Tritan Wine Glass 16 oz|tritan-drinkware|Tritan copolyester|455 ml / 16 oz|63 x 80 x 216 mm|80 g|72 pcs / 54x54x51 cm / 11 kg|7.00|
TT030|Tritan Wine Glass 17.5 oz|tritan-drinkware|Tritan copolyester|500 ml / 17.5 oz|62 x 80 x 220 mm|81 g|72 pcs / 52x50x52 cm / 11 kg|7.20|
TT040|Tritan Wine Glass 18.5 oz|tritan-drinkware|Tritan copolyester|530 ml / 18.5 oz|60 x 80 x 220 mm|81 g|72 pcs / 60x55x51 cm / 10 kg|7.40|
TT007|Tritan Champagne Flute 5 oz|tritan-drinkware|Tritan copolyester|150 ml / 5 oz|47 x 70 x 230 mm|92 g|160 pcs / 55x61x52 cm / 16 kg|7.60|f
T1812|Tritan Stemless Wine Glass 12 oz|tritan-drinkware|Tritan copolyester|350 ml / 12 oz|66 x 80 x 90 mm|32 g|210 pcs / 62x52x46 cm / 9 kg|3.80|f
T1816|Tritan Stemless Wine Glass 16 oz|tritan-drinkware|Tritan copolyester|470 ml / 16 oz|65 x 83 x 115 mm|35 g|168 pcs / 60x54x45 cm / 8 kg|4.20|
PG8900|ISO Standard Wine Tasting Glass - Tritan|tritan-drinkware|Tritan copolyester|220 ml / 7.5 oz|45 x 60 x 155 mm|53 g|100 pcs / 63x33x34 cm / 6.5 kg|4.60|f
S1812|Stemless Wine Glass 12 oz - PET|stemless-wine-glasses|PET|350 ml / 12 oz|66 x 80 x 90 mm|20 g|210 pcs / 62x52x46 cm / 9 kg|2.20|f
S1816|Stemless Wine Glass 16 oz - PET|stemless-wine-glasses|PET|470 ml / 16 oz|65 x 83 x 115 mm|35 g|168 pcs / 60x54x45 cm / 8 kg|2.40|
S1914|Ribbed Stemless Wine Glass 14 oz - PET|stemless-wine-glasses|PET|410 ml / 14 oz|65 x 90 x 90 mm|27 g|150 pcs / 52x47x45 cm / 8 kg|2.50|
S17|Stemless Champagne Flute 9 oz - PET|stemless-wine-glasses|PET|260 ml / 9 oz|45 x 57 x 142 mm|20 g|216 pcs / 52x47x45 cm / 8 kg|2.30|
S1812R|Stemless Wine Glass 12 oz + Gold Rim|stemless-wine-glasses|PET with gold rim|350 ml / 12 oz|66 x 80 x 90 mm|20 g|210 pcs / 62x52x46 cm / 9 kg|2.90|g
S2014R|Stemless Wine Glass 12 oz + Gold Rim (Alt Mould)|stemless-wine-glasses|PET with gold rim|350 ml / 12 oz|66 x 80 x 90 mm|25 g|150 pcs / 50x43x48 cm / 7 kg|2.95|g
S17R|Stemless Champagne Flute 9 oz + Gold Rim|stemless-wine-glasses|PET with gold rim|260 ml / 9 oz|45 x 57 x 142 mm|20 g|216 pcs / 52x47x45 cm / 8 kg|3.05|g
CF607|Plastic Wine Glass 20.5 oz|wine-glasses|AS|588 ml / 20.5 oz|93 x 80 x 205 mm|87 g|24 pcs / 47x36x45 cm / 4 kg|4.80|
CF1842|Plastic Wine Glass 18 oz|wine-glasses|PS|540 ml / 18 oz|70 x 80 x 225 mm|91 g|96 pcs / 65x48x53 cm / 9 kg|3.40|
CF1846|Plastic Wine Glass 16 oz|wine-glasses|Acrylic|460 ml / 16 oz|65 x 75 x 222 mm|102 g|96 pcs / 66x50x52 cm / 10 kg|5.20|
CF1093|Plastic Wine Glass 10.5 oz|wine-glasses|PP / PS|300 ml / 10.5 oz|80 x 80 x 195 mm|82 g|96 pcs / 70x55x50 cm / 13 kg|2.90|
CF0914|Plastic Wine Glass 8 oz|wine-glasses|PS|240 ml / 8 oz|75 x 72 x 137 mm|119 g|24 pcs / 50x35x20 cm / 4 kg|2.70|
YY1170|Plastic Wine Glass 7 oz|wine-glasses|PS|210 ml / 7 oz|69 x 67 x 165 mm|59 g|100 pcs / 55x39x58 cm / 7 kg|2.40|
YY1220|Plastic Wine Glass 7.5 oz|wine-glasses|PS|225 ml / 7.5 oz|70 x 68 x 168 mm|60 g|90 pcs / 48x40x37 cm / 7 kg|2.45|
GXBN024|Plastic Wine Glass 21 oz|wine-glasses|Acrylic|600 ml / 21 oz|96 x 85 x 225 mm|108 g|72 pcs / 57x51x55 cm / 10 kg|5.40|
GXBH324|Plastic Wine Glass 14 oz|wine-glasses|Acrylic|400 ml / 14 oz|90 x 75 x 224 mm|84 g|72 pcs / 53x50x40 cm / 8 kg|4.90|
GXBH025|Plastic Wine Glass 16 oz|wine-glasses|Acrylic|460 ml / 16 oz|100 x 74 x 200 mm|81 g|72 pcs / 52x46x50 cm / 8 kg|5.00|
CF1133|Plastic Wine Goblet 15 oz|wine-glasses|PP|450 ml / 15 oz|80 x 80 x 220 mm|100 g|50 pcs / 51x42x35 cm / 6 kg|3.10|f
CF1133R|Plastic Wine Goblet 15 oz + Gold Rim|wine-glasses|PP with gold rim|450 ml / 15 oz|80 x 80 x 220 mm|100 g|50 pcs / 51x42x35 cm / 7.5 kg|3.80|g
KF-CF1133GP|Plastic Wine Goblet 15 oz + Gold Plating|wine-glasses|PP with gold plating|450 ml / 15 oz|80 x 80 x 220 mm|100 g|50 pcs / 51x42x35 cm / 7.5 kg|4.10|g
YY1150|Plastic Champagne Flute 5 oz|champagne-flutes|PS|150 ml / 5 oz|41 x 70 x 248 mm|100 g|72 pcs / 55x45x35 cm / 9 kg|2.75|
YY1165|Plastic Champagne Flute 5.8 oz|champagne-flutes|PS|165 ml / 5.8 oz|45 x 70 x 245 mm|76 g|72 pcs / 55x45x35 cm / 8 kg|2.60|
YY1180|Plastic Champagne Flute 8 oz|champagne-flutes|PS|240 ml / 8 oz|58 x 68 x 220 mm|65 g|72 pcs / 55x45x35 cm / 7 kg|2.50|f
YY1240|Plastic Champagne Flute 8.5 oz|champagne-flutes|PS|240 ml / 8.5 oz|61 x 71 x 240 mm|75 g|96 pcs / 70x55x50 cm / 8.5 kg|2.80|
YY9988|Plastic Champagne Flute 6 oz|champagne-flutes|PP / PS|170 ml / 6 oz|58 x 67 x 205 mm|65 g|96 pcs / 59x46x47 cm / 8.5 kg|2.35|
YY1603|Plastic Champagne Flute 5.5 oz|champagne-flutes|PS|165 ml / 5.5 oz|50 x 68 x 224 mm|69 g|120 pcs / 55x40x60 cm / 10 kg|2.30|
CF1125|Plastic Champagne Flute 5 oz|champagne-flutes|PP / PS|150 ml / 5 oz|57 x 65 x 190 mm|45 g|96 pcs / 48x45x38 cm / 6.5 kg|2.20|b
CF1120|Plastic Champagne Flute 5.5 oz|champagne-flutes|PP / PS|165 ml / 5.5 oz|50 x 67 x 220 mm|72 g|96 pcs / 55x45x50 cm / 11 kg|2.45|
CF1042|Plastic Champagne Flute 6 oz|champagne-flutes|PS|180 ml / 6 oz|52 x 66 x 190 mm|145 g|144 pcs / 64x56x43 cm / 22 kg|2.90|
YY1130|Injected Plastic Champagne Flute 4.5 oz|champagne-flutes|PS|130 ml / 4.5 oz|50 x 65 x 205 mm|127 g|96 pcs / 55x46x49 cm / 14 kg|3.20|
YY1160|Ribbed Plastic Champagne Flute 5.6 oz|champagne-flutes|PS|160 ml / 5.6 oz|47 x 72 x 245 mm|69 g|72 pcs / 55x45x35 cm / 8 kg|2.85|f
YY1321|Ribbed Square Champagne Flute 11 oz|champagne-flutes|PS|320 ml / 11 oz|70 x 70 x 195 mm|84 g|72 pcs / 55x45x35 cm / 9 kg|3.20|
YY1320|Square Champagne Flute 11 oz|champagne-flutes|PS|320 ml / 11 oz|71 x 71 x 195 mm|75 g|72 pcs / 55x45x35 cm / 8 kg|3.00|
YY1300|Ribbed Coupe / Cocktail Glass 10.5 oz|coupe-martini-margarita|PS|300 ml / 10.5 oz|106 x 70 x 140 mm|68 g|54 pcs / 53x40x36 cm / 5 kg|3.40|f
PG1061|Plastic Martini Glass 6.3 oz|coupe-martini-margarita|PS|180 ml / 6.3 oz|100 x 66 x 136 mm|50 g|144 pcs / 72x55x46 cm / 10 kg|2.70|
PG0909|Plastic Martini Glass 10 oz|coupe-martini-margarita|PS|300 ml / 10 oz|117 x 80 x 190 mm|108 g|24 pcs / 65x45x21 cm / 4 kg|3.60|
CF0911|Plastic Margarita Glass 15 oz|coupe-martini-margarita|PS|440 ml / 15 oz|125 x 90 x 158 mm|118 g|48 pcs / 70x48x35 cm / 7 kg|4.20|f
KF-C16|Plastic Cocktail Glass 7 oz|coupe-martini-margarita|PS|200 ml / 7 oz|105 x 60 x 100 mm|100 g|120 pcs / 61x58x40 cm / 18 kg|3.10|
PG1044|Plastic Beer Mug 12 oz|beer-glasses-mugs|PS|350 ml / 12 oz|74 x 65 x 130 mm|125 g|144 pcs / 63x48x44 cm / 20.5 kg|2.60|
PG1053|Plastic Beer Mug 22 oz|beer-glasses-mugs|PP / PS|650 ml / 22 oz|94 x 70 x 126 mm|105 g|96 pcs / 61x60x43 cm / 13.5 kg|3.10|
PG1070|Plastic Beer Mug 27 oz|beer-glasses-mugs|PS|800 ml / 27 oz|92 x 82 x 160 mm|114 g|72 pcs / 58x41x54 cm / 11 kg|3.40|
PG1104|Plastic Hiball Tumbler 12 oz|beer-glasses-mugs|PS|350 ml / 12 oz|78 x 53 x 120 mm|60 g|144 pcs / 53x52x35 cm / 10 kg|1.90|b
PG1108|Plastic Beer Stein 12 oz|beer-glasses-mugs|PS|350 ml / 12 oz|80 x 53 x 135 mm|115 g|144 pcs / 52x34x63 cm / 18 kg|2.80|
PG1054|Plastic Tulip Pint / Pilsner 19 oz|beer-glasses-mugs|PS|570 ml / 19 oz|90 x 55 x 154 mm|68 g|144 pcs / 56x56x42 cm / 11 kg|2.50|f
PG2601|Plastic Beer Glass 17 oz|beer-glasses-mugs|PS|500 ml / 17 oz|80 x 75 x 135 mm|120 g|100 pcs / 58x47x47 cm / 13 kg|2.70|
PG1214|Plastic Beer Pitcher 1.4 L|pitchers-jugs|PS|1.4 L|122 x 120 x 210 mm|310 g|12 pcs / 51x43x23 cm / 5 kg|7.50|
PG1216|Plastic Beer Pitcher 1.5 L|pitchers-jugs|PS|1.5 L|135 x 116 x 230 mm|335 g|12 pcs / 56x43x26 cm / 5 kg|7.90|
PG1211|Plastic Beer Pitcher with Lid 2 L|pitchers-jugs|PP|2 L|130 x 120 x 230 mm|243 g|40 pcs / 68x58x50 cm / 11 kg|9.50|f
KF-C20|Plastic Juice Cup with Lid & Straw 21 oz|pitchers-jugs|PC|600 ml / 21 oz|70 x 180 mm|135 g|80 pcs / 60x40x51 cm / 13 kg|8.20|
SG888|Plastic Shot Glass 1.4 oz|shot-glasses|PS|40 ml / 1.4 oz|43 x 30 x 66 mm|16 g|840 pcs / 53x31x35 cm / 15 kg|0.65|b
PG900|12 Gauge Shotgun Shot Glass Set of 4|shot-glasses|PS with plating|4 x 40 ml / 1.5 oz|92 x 32 x 36 mm|28 g each|100 sets / 38x38x41 cm / 14 kg|2.60|f
KF-PG982|50 Caliber Bullet Shot Glass Set of 4|shot-glasses|PS with plating|4 x 90 ml / 3 oz|50 x 52 x 69 mm|40 g each|50 sets / 55x23x39 cm / 9 kg|2.90|f
SG999|Tequila Shot Glass Set of 4|shot-glasses|PS|4 x 60 ml / 2 oz|50 x 35 x 85 mm|40 g each|100 sets / 58x55x35 cm / 20 kg|2.40|
KF-BZ001|LED Shot Glass Set of 12|shot-glasses|PS with LED|12 x 50 ml / 1.7 oz|46 x 34 x 60 mm|17 g each|60 sets / 50x45x30 cm / 16 kg|3.20|f
SG888D|Shot Glass Dispenser Set of 7|shot-glasses|PS|6 x 40 ml + dispenser|assembled set|—|48 sets / 58x44x58 cm / 8 kg|3.60|
KF-D015|Golf Ball Shaped Shot Glass Set of 3|shot-glasses|PS|3 x 50 ml / 1.7 oz|53 x 56 mm|24 g each|90 sets / 55x32x37 cm / 10 kg|2.20|
PG1017|Mini Cowboy Boot Shot Glass with Necklace|shot-glasses|PS|30 ml / 1 oz|30 x 65 mm + 40 cm cord|35 g|400 pcs / 45x35x50 cm / 16 kg|1.40|f
PG1017L|Plastic Cowboy Boot Glass 17 oz|shot-glasses|PS|500 ml / 17 oz|75 x 127 x 167 mm|96 g|60 pcs / 67x43x40 cm / 8 kg|2.10|
KF-C15|Plastic Whiskey Glass Mini 3 oz|shot-glasses|PS|90 ml / 3 oz|55 x 50 x 64 mm|23 g|240 pcs / 48x36x42 cm / 8 kg|0.95|
KF-C14S|Detachable Mini Wine Glass 3 oz|shot-glasses|PS|90 ml / 3 oz|52 x 52 x 130 mm|35 g|240 pcs / 48x36x50 cm / 10 kg|1.30|
YY1322|Ribbed Plastic Whiskey Glass 9.5 oz|shot-glasses|PS|275 ml / 9.5 oz|68 x 66 x 95 mm|55 g|100 pcs / 40x40x45 cm / 7 kg|1.90|
DB100|Plated Disco Ball Cup with Straw 20 oz|novelty-drinkware|PS with electroplating|580 ml / 20 oz|ball 105 mm / straw 230 mm|60 g|75 pcs / 57x57x36 cm / 5 kg|3.60|f
YCA100|Beer Bat Cup 22 oz|novelty-drinkware|PP|640 ml / 22 oz|60 mm dia x 610 mm|165 g|50 pcs / 68x42x34 cm / 11 kg|4.20|f
YCA100H|Beer Bat Cup 22 oz with Stand|novelty-drinkware|PP and ABS|640 ml / 22 oz|60 mm dia x 610 mm|152 g cup / 95 g stand|50 sets / 68x50x45 cm / 15 kg|4.60|
FJ-A117|Ice Bucket 1 L|ice-buckets-coolers|PS|1 L / 34 oz|125 x 130 mm|225 g|36 pcs / 42x42x50 cm / 10 kg|3.60|b
FJ-IB01|Ice Bucket 3 L|ice-buckets-coolers|PP / PS|3 L|193 x 190 x 240 mm|330 g / 460 g|24 pcs / 43x43x54 cm / 13 kg|6.20|f
FJ-IB0683|Ice Bucket 4 L|ice-buckets-coolers|PS|4 L|270 x 195 x 195 mm|560 g|10 pcs / 43x30x47 cm / 7 kg|7.50|f
FJ-IB0683D|Double Wall Ice Bucket 4 L|ice-buckets-coolers|PS double wall|4 L|270 x 195 x 195 mm|560 g|10 pcs / 43x30x47 cm / 7 kg|8.40|n
KF-IB0685|Boat Shape Ice Bucket 5 L|ice-buckets-coolers|PET|5 L|420 x 180 x 170 mm|860 g|8 pcs / 45x38x51 cm / 9 kg|9.80|n
FJ-IB0682|Ice Bucket 8 L|ice-buckets-coolers|PS|8 L|330 x 205 x 255 mm|980 g|10 pcs / 55x37x55 cm / 11 kg|11.50|f
FJ-IB0682D|Double Wall Ice Bucket 8 L|ice-buckets-coolers|PS double wall|8 L|330 x 205 x 255 mm|980 g|10 pcs / 55x37x55 cm / 11 kg|12.80|n
FJ-IB0684|Ice Bucket 12 L|ice-buckets-coolers|PS|12 L|415 x 277 x 255 mm|1325 g|5 pcs / 45x32x57 cm / 8 kg|16.00|
YJ303|Champagne Ice Bucket 3.2 L|ice-buckets-coolers|PP / PS|3.2 L|213 x 142 x 302 mm|635 g|10 pcs / 77x46x26 cm / 9 kg|8.60|f
YJ314|LED Ice Bucket 4 L with Charger|ice-buckets-coolers|PS and ABS with LED|4 L|270 x 195 x 230 mm|650 g|10 pcs / 44x31x46 cm / 9 kg|14.50|f
YJ318|LED Ice Bucket 8 L with Charger|ice-buckets-coolers|PS and ABS with LED|8 L|350 x 180 x 285 mm|1.1 kg|5 pcs / 38x30x55 cm / 7 kg|18.00|
YJ312|LED Ice Bucket 12 L with Charger|ice-buckets-coolers|PS and ABS with LED|12 L|415 x 280 x 290 mm|1.6 kg|5 pcs / 45x32x57 cm / 10 kg|22.00|
IB200|Wine Tasting Spittoon Bucket 3.7 L|ice-buckets-coolers|PP|3.7 L|205 x 140 x 210 mm|306 g|24 pcs / 44x44x67 cm / 10 kg|5.40|f
IB201|Wine Tasting Spittoon Bucket Mini|ice-buckets-coolers|PP|700 ml / 20.5 oz|122 x 70 x 160 mm|133 g|50 pcs / 70x38x30 cm / 9.5 kg|2.90|
FJ-IB062T|Ice Tong|ice-buckets-coolers|PS|160 mm length|16 x 1.6 cm|23 g|500 pcs / 46x36x27 cm / 13 kg|0.55|b
FJ-BR0685|Foldable Bottle Rack for 6 Bottles|ice-buckets-coolers|PP|6 bottles|270 x 180 x 330 mm|320 g|40 pcs / 57x55x60 cm / 15 kg|5.80|
CS50|Bottle Stopper and Wine Charm 2-in-1|wine-stoppers-pourers|PP and silicone|—|22 x 65 x 95 mm|68 g|200 pcs / 48x35x23 cm / 15 kg|1.60|f
WS02|Funny Design Bottle Stopper|wine-stoppers-pourers|ABS and silicone|—|93 x 53 mm|35 g|240 pcs / 36x37x57 cm / 10 kg|1.20|f
CS55S|Stopper and Pourer 2-in-1 with Silver Foil|wine-stoppers-pourers|PP, silicone, aluminium foil|—|13 x 40 x 90 mm|18 g|400 pcs / 48x35x43 cm / 9 kg|0.95|
CS01G|Branded Champagne Sipper with Moet Logo|wine-stoppers-pourers|ABS with plating|—|80 x 35 x 15 mm|8 g|1,500 pcs / 52x42x37 cm / 13.5 kg|1.10|g
CS02|Champagne Sipper for 16.1 mm Bottle|wine-stoppers-pourers|ABS|—|80 x 35 x 15 mm|9 g|1,500 pcs / 52x42x37 cm / 15 kg|0.75|f
CS03|Champagne Sipper for 17-19 mm Bottle|wine-stoppers-pourers|ABS and silicone|—|80 x 35 x 17 mm|10 g|1,500 pcs / 52x42x37 cm / 16 kg|0.80|f
CS04|Universal Sipper and Pourer 16-19 mm|wine-stoppers-pourers|ABS and silicone|—|84 x 35 x 15 mm|11 g|1,500 pcs / 52x42x37 cm / 17 kg|0.85|
CS05|Universal Sipper and Pourer 16-19 mm|wine-stoppers-pourers|ABS and silicone|—|84 x 38 x 17 mm|10 g|1,400 pcs / 52x42x37 cm / 16 kg|0.90|
CS02G|Plated Champagne Sipper|wine-stoppers-pourers|ABS with plating|—|80 x 35 x 15 mm|9 g|1,500 pcs / 52x42x37 cm / 13.5 kg|1.05|g
CS03G|Plated Champagne Sipper 17-19 mm|wine-stoppers-pourers|ABS with plating|—|80 x 35 x 17 mm|10 g|1,500 pcs / 52x42x37 cm / 14 kg|1.10|g
CS04G|Plated Universal Sipper and Pourer|wine-stoppers-pourers|ABS with plating|—|84 x 35 x 15 mm|11 g|1,500 pcs / 52x42x37 cm / 17 kg|1.15|g
WP-002|Tulip Shape Bottle Pourer|wine-stoppers-pourers|Acrylic and TPE|—|53 x 40 x 95 mm|15 g|550 pcs / 43x51x29 cm / 9 kg|0.80|
WP-015|Bottle Pourer|wine-stoppers-pourers|Acrylic and TPE|—|27 mm dia x 96 mm|15 g|550 pcs / 43x51x29 cm / 9 kg|0.75|b
WP-011|Wine Aerator Pourer|wine-stoppers-pourers|Acrylic and TPE|—|36 x 118 mm|27 g|240 pcs / 48x40x32 cm / 11 kg|1.40|f
WP-003|Wine Pourer and Stopper 2-in-1|wine-stoppers-pourers|ABS and silicone|—|54 x 50 x 94 mm|29 g|200 pcs / 53x27x42 cm / 10 kg|1.30|
WP150|Hawk Wine Aerator Pourer|wine-stoppers-pourers|AS and silicone|—|160 x 45 mm|122 g|50 pcs / 43x40x35 cm / 9 kg|3.40|
LN1258S|Stainless Champagne Stopper|wine-stoppers-pourers|Stainless steel and TPR|—|38 x 38 x 55 mm|56 g|200 pcs / 43x26x20 cm / 11 kg|2.40|f
LN1258P|Plated Champagne Stopper|wine-stoppers-pourers|Plated stainless steel and TPR|—|38 x 38 x 55 mm|50 g|200 pcs / 43x26x20 cm / 11 kg|2.60|g
SP-011|Champagne Stopper for 17.5-18 mm|wine-stoppers-pourers|ABS and silicone|—|40 mm dia x 32 mm|18 g|200 pcs / 24x24x31 cm / 6 kg|0.85|
SP-019|Wine Stopper for 18-19 mm|wine-stoppers-pourers|ABS and silicone|—|40 mm dia x 40 mm|23 g|240 pcs / 35x27x25 cm / 8 kg|0.90|
SP-016|Vacuum Wine Stopper - 7 Day Freshness|wine-stoppers-pourers|PC and TPE|—|31 x 90 mm|23 g|300 pcs / 34x20x32 cm / 9 kg|1.10|f
SP-002-A|Vacuum Wine Stopper with 31 Day Date Scale|wine-stoppers-pourers|ABS and silicone|—|47 mm dia x 72 mm|48 g|144 pcs / 33x43x27 cm / 10 kg|1.80|
SP-002S|Stainless Vacuum Wine Stopper with Date Scale|wine-stoppers-pourers|Stainless steel|—|48 mm dia x 72 mm|80 g|96 pcs / 35x45x20 cm / 11 kg|3.20|
KVS-20|Vacuum Pump with 4 Stoppers - Set of 5|wine-stoppers-pourers|ABS and silicone|—|70 x 132 mm|130 g|48 sets / 33x31x28 cm / 8 kg|3.80|f
XH-SD01|Vacuum Soda Stopper|wine-stoppers-pourers|PP and silicone|—|45 x 50 mm|20 g|240 pcs / 46x30x36 cm / 8 kg|1.05|
KH1-002002|Plastic Beer Opener|corkscrews-openers|ABS|—|48 mm dia x 83 mm|68 g|120 pcs / 43x28x30 cm / 10 kg|1.20|bf
E6006|Wing Corkscrew|corkscrews-openers|Zinc alloy|—|60 x 190 x 38 mm|200 g|39 pcs / 45x23x35 cm / 12 kg|4.60|
E5001|Goose Head Manual Wine Opener|corkscrews-openers|Zinc alloy and ABS|—|150 x 130 x 40 mm|400 g|32 pcs / 52x35x42 cm / 16 kg|8.20|
KH1-002101|Air Pump Wine Opener|corkscrews-openers|ABS|—|21 mm dia x 203 mm|45 g|240 pcs / 43x33x29 cm / 16 kg|1.60|f
KH1-002001|Manual Wine Opener with Foil Cutter - Set of 2|corkscrews-openers|ABS|—|64 x 41 x 165 mm|110 g|72 sets / 34x34x39 cm / 11 kg|3.20|
SGS-KH1-002001|Manual Wine Opener Kit - Set of 4|corkscrews-openers|ABS and stainless steel|—|opener, foil cutter, stopper, pourer|—|60 sets / 43x39x37 cm / 13 kg|6.50|f
KB1P-602301|Electric Wine Opener|corkscrews-openers|ABS|—|45 mm dia x 225 mm|210 g|50 pcs / 32x32x50 cm / 14 kg|9.50|
KB1-601901A|Electric Wine Opener - Set of 2|corkscrews-openers|ABS|—|48 mm dia x 231 mm|234 g|36 sets / 35x35x28 cm / 12 kg|10.50|
KB1-602002|Electric Wine Opener - Set of 2|corkscrews-openers|Stainless steel and PC|—|48.5 mm dia x 224.5 mm|300 g|36 sets / 35x35x28 cm / 14 kg|12.80|
EC-A|Rechargeable Wine Opener with USB|corkscrews-openers|ABS and PC|—|45 mm dia x 185 mm|235 g|50 pcs / 52x28x25 cm / 14 kg|12.50|f
EC-A-SET|Rechargeable Wine Opener Kit - Set of 5|corkscrews-openers|ABS and PC|—|opener, vacuum stopper, foil cutter, pourer, USB|—|40 sets / 46x45x25 cm / 14 kg|15.80|f
EC-A-GS|Rechargeable Wine Opener Kit with Base - Set of 6|corkscrews-openers|ABS and PC|—|opener, vacuum stopper, foil cutter, base, USB|—|30 sets / 58x46x35 cm / 16 kg|18.50|f
KP3P-372203A|Rechargeable Wine Opener with USB|corkscrews-openers|ABS|—|48 mm dia x 200 mm|245 g|40 pcs / 45x30x26 cm / 11 kg|13.20|
KP1P-372401A|Rechargeable Wine Opener - Set of 3|corkscrews-openers|ABS and PC|—|48 mm dia x 215 mm|250 g|36 sets / 40x40x30 cm / 12 kg|14.60|
KP3-372201C-6|Rechargeable Wine Opener - Set of 3|corkscrews-openers|Aluminium alloy, stainless steel and PC|—|48 mm dia x 183 mm|—|30 sets / 52x45x24 cm / 12 kg|15.40|
KP1125|Rechargeable Wine Opener Kit - Set of 6|corkscrews-openers|Mixed materials|—|opener, pourer, vacuum stopper, foil cutter, base, USB|—|25 sets / 46x45x24 cm / 12 kg|17.20|f
KD-7|Rechargeable Wine Aerator and Dispenser|corkscrews-openers|ABS and silicone|—|55 x 114 x 120 mm|145 g|36 sets / 38x37x30 cm / 10 kg|11.50|f
KD-8|Rechargeable Wine Aerator and Dispenser|corkscrews-openers|ABS and stainless steel|—|55 x 114 x 120 mm|191 g|36 sets / 38x37x30 cm / 12 kg|13.60|f
SGS-KD-9-P|Rechargeable Wine Opener and Dispenser Kit - Set of 5|corkscrews-openers|Mixed materials|—|opener, vacuum stopper, foil cutter, KD9 dispenser, USB|—|25 sets / 63x36x23 cm / 14 kg|18.00|f
KJBQ-93|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|34 x 258 mm|71 g|120 pcs / 50x45x26 cm / 12 kg|3.40|
KJBQ-64|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|34 x 225 mm|—|110 pcs / 47x43x26 cm / 14 kg|3.20|
KJBQ-24|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|35 x 214 mm|60 g|150 pcs / 57x45x27 cm / 15 kg|2.80|
KJBQ-12|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|35 x 225 x 198 mm|40 g|200 pcs / 44x32x45 cm / 14 kg|2.60|b
KJBQ-4|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|35 x 270 x 224 mm|61 g|120 pcs / 45x42x27 cm / 11 kg|3.00|
KJBQ-4-BS|Electric Milk Frother with Stand|milk-frothers|Stainless steel and ABS|—|68 x 237 mm|100 g|80 pcs / 61x40x53 cm / 14 kg|3.80|
KJBQ-9|Electric Milk Frother with Stand|milk-frothers|Stainless steel and ABS|—|35 x 214 mm|100 g|120 pcs / 55x48x27 cm / 17 kg|3.90|
KJBQ-5|Electric Milk Frother|milk-frothers|Stainless steel and ABS|—|35 x 214 mm|80 g|120 pcs / 55x48x27 cm / 14 kg|3.10|
KJBQ-5-BS|Electric Milk Frother with Stand|milk-frothers|Stainless steel, ABS and iron|—|68 x 227 mm|130 g|80 pcs / 61x40x52 cm / 15 kg|4.10|
EF-A|Rechargeable Milk Frother with USB|milk-frothers|ABS and SUS304|—|32 x 233 mm|90 g|80 pcs / 42x35x32 cm / 12 kg|4.60|f
EF-A-S|Rechargeable Milk Frother with USB - Silver|milk-frothers|ABS and SUS304|—|32 x 233 mm|90 g|80 pcs / 42x35x32 cm / 12 kg|4.70|
EF-B|Rechargeable Milk Frother with USB|milk-frothers|ABS and SUS304|—|32 x 221 mm|75 g|120 pcs / 40x40x31 cm / 14 kg|4.40|bf
EF-B-SET|Rechargeable Milk Frother with 3 Heads|milk-frothers|ABS and SUS304|—|32 x 221 mm|95 g|100 pcs / 50x42x35 cm / 15 kg|5.40|f
EF-B-Box2|Rechargeable Milk Frother with 3 Heads and Case|milk-frothers|ABS and SUS304|—|32 x 221 mm|95 g|40 pcs / 50x40x22 cm / 12 kg|5.90|n
KJBQ-65|Rechargeable Milk Frother|milk-frothers|Stainless steel and ABS|—|32 x 224 mm|114 g|80 pcs / 43x35x35 cm / 14 kg|5.20|
KJBQ-31|Rechargeable Milk Frother|milk-frothers|Stainless steel and ABS|—|32 x 224 mm|106 g|80 pcs / 41x31x31 cm / 14 kg|5.00|
KJBQ-31-BS|Rechargeable Milk Frother with Stand|milk-frothers|Stainless steel, ABS and iron|—|68 x 237 mm|152 g|60 pcs / 47x40x53 cm / 15 kg|6.20|f
KJBQ-7X|Rechargeable Milk Frother|milk-frothers|Stainless steel and ABS|—|35 x 230 mm|110 g|120 pcs / 55x47x28 cm / 18 kg|5.10|
KJBQ-13X|Rechargeable Milk Frother with 2 Heads|milk-frothers|ABS, stainless steel and iron|—|34 x 230 mm|163 g|45 pcs / 58x43x26 cm / 12 kg|5.60|
KJBQ-23X|Rechargeable Milk Frother with 3 Heads|milk-frothers|Stainless steel and ABS|—|32 x 280 mm|166 g|50 pcs / 40x35x38 cm / 13 kg|6.20|
JF-J-17|Rechargeable Milk Frother with 3 Heads|milk-frothers|ABS and stainless steel|—|26 x 37 mm|125 g|60 pcs / 51x46x35 cm / 15 kg|5.30|
JF-J-3|Rechargeable Milk Frother with 2 Heads|milk-frothers|ABS and stainless steel|—|26 x 30 mm|140 g|60 pcs / 60x50x35 cm / 16 kg|5.50|
JF-J-3S|Rechargeable Milk Frother with 2 Heads and Stand|milk-frothers|ABS and stainless steel|—|26 x 30 mm|140 g|24 pcs / 52x50x35 cm / 10 kg|6.10|
KYMQ-16B|Electric Salt and Pepper Grinder|salt-pepper-grinders|ABS and stainless steel|70 ml|55 x 50 x 180 mm|264 g|40 pcs / 32x28x43 cm / 13 kg|6.80|
KYMQ-43B-01|Electric Salt and Pepper Grinder|salt-pepper-grinders|ABS and stainless steel|70 ml|50 x 180 mm|280 g|40 pcs / 50x33x23 cm / 14 kg|6.90|
KYMQ-53B|Gravity Salt and Pepper Grinder|salt-pepper-grinders|Stainless steel and ABS|135 ml|63 x 200 mm|350 g|35 pcs / 48x35x25 cm / 15 kg|9.60|f
KYMQ-50B|Gravity Salt and Pepper Grinder|salt-pepper-grinders|ABS and AS|135 ml|63 x 200 mm|330 g|35 pcs / 48x35x25 cm / 14 kg|8.40|f
KYMQ-14|Electric Salt and Pepper Grinder|salt-pepper-grinders|ABS|70 ml|55 x 50 x 180 mm|200 g|60 pcs / 40x30x43 cm / 16 kg|5.60|b
KYMQ-44B|Electric Salt and Pepper Grinder|salt-pepper-grinders|ABS and PMMA|70 ml|50 x 180 mm|216 g|50 pcs / 33x33x42 cm / 14 kg|6.20|
DGS-KYMQ-50B|Gravity Salt and Pepper Grinder - Set of 2|salt-pepper-grinders|ABS and AS|2 x 135 ml|63 x 200 mm|330 g each|18 sets / 43x42x25 cm / 15 kg|14.80|f
KYMQ-14-BS|Salt and Pepper Grinder - 2 Pack|salt-pepper-grinders|ABS|2 x 70 ml|55 x 50 x 180 mm|200 g each|25 sets / 58x48x22 cm / 16 kg|9.80|
EG-A|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|ABS and PMMA|70 ml|46 x 185 mm|197 g|50 pcs / 29x29x45 cm / 13 kg|10.50|f
EG-A-BS|Rechargeable Salt and Pepper Grinder - 2 Pack|salt-pepper-grinders|ABS and PMMA|2 x 70 ml|46 x 185 mm|197 g each|25 sets / 53x42x23 cm / 15 kg|18.60|
EG-B|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|Stainless steel and PMMA|70 ml|46 x 185 mm|290 g|35 pcs / 45x33x25 cm / 15 kg|12.40|b
EG-B-BS|Rechargeable Salt and Pepper Grinder - 2 Pack|salt-pepper-grinders|Stainless steel and PMMA|2 x 70 ml|46 x 185 mm|290 g each|15 sets / 48x36x26 cm / 13 kg|22.00|f
KYMQ-82A|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|ABS and stainless steel|30 ml|38 x 144 mm|185 g|50 sets / 35x35x41 cm / 13 kg|8.60|n
KYMQ-15A|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|ABS|70 ml|55 x 50 x 180 mm|200 g|50 pcs / 33x31x48 cm / 14 kg|7.80|f
KYMQ-17A|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|ABS and stainless steel|70 ml|55 x 50 x 210 mm|295 g|35 pcs / 43x35x28 cm / 14 kg|9.20|
KYMQ-37A|Rechargeable Salt and Pepper Grinder with USB|salt-pepper-grinders|ABS and stainless steel|70 ml|53 x 180 mm|281 g|35 pcs / 45x33x25 cm / 14 kg|8.90|
KYMQ-32A-H52|Rechargeable Salt and Pepper Grinder|salt-pepper-grinders|ABS and stainless steel|95 ml|53 x 190 mm|302 g|35 pcs / 47x32x25 cm / 14 kg|9.80|
KYMQ-15C|Rechargeable Salt and Pepper Grinder - 2 Pack|salt-pepper-grinders|ABS|2 x 70 ml|165 x 73 x 200 mm|239 g each|20 sets / 48x47x23 cm / 14 kg|13.90|
KYMQ-17C|Rechargeable Salt and Pepper Grinder - 2 Pack|salt-pepper-grinders|ABS and stainless steel|2 x 70 ml|165 x 73 x 225 mm|295 g each|15 sets / 48x36x26 cm / 13 kg|16.40|
KMDJ-2AW|Rechargeable Coffee Grinder with USB|coffee-grinders|ABS and AS|—|80 x 186 mm|420 g|24 pcs / 37x28x44 cm / 14 kg|11.50|f
KMDJ-3AW|Rechargeable Coffee Grinder with USB|coffee-grinders|ABS and AS|—|80 x 186 mm|420 g|24 pcs / 50x40x25 cm / 13 kg|11.80|f
KMDJ-A4|Manual Coffee Grinder|coffee-grinders|Aluminium alloy and ABS|—|50 x 148 x 78 mm|310 g|24 pcs / 42x42x35 cm / 14 kg|8.60|bf
LN-WB01BS|Mini Bottle Bar Set - 3 Accessories|bar-sets-gifts|ABS and metal|—|235 x 62 x 30 mm|210 g|42 sets / 55x46x28 cm / 14 kg|6.50|b
LN-WB01B|Black Head Bottle Bar Set - 5 Accessories|bar-sets-gifts|ABS and metal|—|325 x 74 x 74 mm|350 g|30 sets / 52x45x38 cm / 14 kg|12.50|f
LN-WB03W|Red Head Wood Handle Bar Set - 5 Accessories|bar-sets-gifts|Wood and metal|—|325 x 74 x 74 mm|330 g|30 sets / 52x45x38 cm / 14 kg|16.50|f
KF-525|Bar Salt Rimmer - 3 Tier|bar-sets-gifts|ABS|—|155 x 200 x 70 mm|333 g|24 pcs / 52x40x35 cm / 12 kg|7.60|n
`;

// ---------------------------------------------------------------------------
// Pricing display modes — 不同品类采用不同报价方式
// tiered        公开阶梯参考价（标准化程度高，客户主要比较单价和起订量）
// startingPrice 显示起步价 + 询价（电池、插头、认证、包装会改变价格）
// priceRange    显示价格区间 + 询价（套装组合不同，成本差异大）
// moqRange      显示起订量 + 参考区间（标识工艺、模具、尺寸、灯光方案影响报价）
// quoteOnly     只提供询价（新开模产品，不了解设计要求时无法给可靠价格）
// ---------------------------------------------------------------------------
export const CATEGORY_PRICING = {
  "tritan-drinkware": "tiered",
  "stemless-wine-glasses": "tiered",
  "wine-glasses": "tiered",
  "champagne-flutes": "tiered",
  "coupe-martini-margarita": "tiered",
  "beer-glasses-mugs": "tiered",
  "pitchers-jugs": "tiered",
  "shot-glasses": "tiered",
  "novelty-drinkware": "tiered",
  "ice-buckets-coolers": "tiered", // 普通 standardized 桶走阶梯价；LED/定制款由下方规则升级
  "wine-stoppers-pourers": "tiered",
  "corkscrews-openers": "tiered", // 手动开瓶器走阶梯价；电动款由下方规则升级
  "milk-frothers": "startingPrice",
  "salt-pepper-grinders": "startingPrice",
  "coffee-grinders": "startingPrice",
  "bar-sets-gifts": "priceRange"
};

// 产品级覆盖：型号 → 模式。新开模 / 定制模具产品在此登记为 "quoteOnly"。
export const PRODUCT_PRICING_OVERRIDES = {
  // 例: "KF-XXX": "quoteOnly"
};
