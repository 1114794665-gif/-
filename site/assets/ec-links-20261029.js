/* 内链补丁 2026-10-29
   背景：站内 28 个页面没有任何入口、43 个页面只有一个入口。其中多数是最值钱的
        买家类型页（私标 / 大批量 / 空白杯 / 小批量 / 促销 / 企业定制 / 球队杯）
        和材质页（亚克力 / 玻璃替代 / PET）与场景页（家庭活动 / 品鉴会）。
   做法：三处补链，全部在水合之后改 DOM（React 页手改 HTML 会被覆盖）
        ① 页脚加「采购方式 / 材质与场合」索引条 —— 全站 496 页同时生效
        ② 首页买家卡：改一张错配的指向，再补三张（3 张 → 6 张，两行三列）
        ③ 「The next useful pages」板块补 3 张兄弟卡 —— 让同类页不再互相孤岛
   幂等：每处都打 data 版本号，重复执行不会叠加 */

(function () {
  if (window.__ecLinks) return;
  window.__ecLinks = 1;

  var VER = '20261106-seo2';

  function isZh() {
    return /^\/zh(\/|$)/.test(location.pathname);
  }

  /* ── ① 页脚索引条 ───────────────────────────────── */
  var FOOT = {
    en: {
      a1: 'Buying Methods',
      a2: 'Materials & Occasions',
      a3: 'Guides & Service',
      g1: [
        ['/bulk-drinkware/', 'Bulk & Wholesale'],
        ['/blank-drinkware/', 'Blank Cups'],
        ['/private-label-drinkware/', 'Private Label'],
        ['/no-minimum-custom-cups/', 'Small & Trial Orders'],
        ['/promotional-drinkware-supplier/', 'Promotional & Event'],
        ['/personalized-drinkware/', 'Personalized Gifts'],
        ['/sports-team-cups/', 'Sports Teams']
      ],
      g2: [
        ['/acrylic-drinkware/', 'Acrylic'],
        ['/unbreakable-drinkware/', 'Unbreakable / Glass-Free'],
        ['/pet-plastic-cups/', 'PET Cups'],
        ['/family-event-cups/', 'Family Events'],
        ['/tasting-events-drinkware/', 'Tasting Events']
      ],
      g3: [
        ['/blog/', 'Buying Guides'],
        ['/free-samples/', 'Free Samples'],
        ['/our-service/', 'Our Service'],
        ['/contact/', 'Request a Quote'],
        ['/catalog-download/', 'Request a Catalog'],
        ['/case-studies/', 'Project Planning Examples'],
        ['/distributor-program/', 'Distributor & Agency Supply']
      ]
    },
    zh: {
      a1: '采购方式',
      a2: '材质与场合',
      a3: '指南与服务',
      g1: [
        ['/zh/bulk-drinkware/', '批量采购'],
        ['/zh/blank-drinkware/', '空白杯'],
        ['/zh/private-label-drinkware/', '自有品牌'],
        ['/zh/no-minimum-custom-cups/', '小批量试单'],
        ['/zh/promotional-drinkware-supplier/', '促销礼品'],
        ['/zh/personalized-drinkware/', '企业定制'],
        ['/zh/sports-team-cups/', '运动球队']
      ],
      g2: [
        ['/zh/acrylic-drinkware/', '亚克力'],
        ['/zh/unbreakable-drinkware/', '玻璃替代'],
        ['/zh/pet-plastic-cups/', 'PET 杯'],
        ['/zh/family-event-cups/', '家庭活动'],
        ['/zh/tasting-events-drinkware/', '品鉴活动']
      ],
      g3: [
        ['/zh/blog/', '采购指南'],
        ['/zh/free-samples/', '免费样品'],
        ['/zh/our-service/', '我们的服务'],
        ['/zh/contact/', '询价'],
        ['/zh/catalog-download/', '索取产品目录'],
        ['/zh/case-studies/', '项目规划参考'],
        ['/zh/distributor-program/', '经销商与代理商供货']
      ]
    }
  };

  function row(list) {
    var out = '';
    var cur = location.pathname;
    for (var i = 0; i < list.length; i++) {
      if (list[i][0] === cur) continue;   /* 当前页不链自己 */
      out += '<a href="' + list[i][0] + '" data-discover="true">' + list[i][1] + '</a>';
    }
    return out;
  }

  function patchFooter() {
    var foot = document.querySelector('footer.byf-footer');
    if (!foot) return;
    var grid = foot.querySelector('.bx-footer-grid') || foot.querySelector('.byf-footer-grid');
    if (!grid) return;

    var lang = isZh() ? 'zh' : 'en';
    var stamp = VER + '-' + lang;
    var old = grid.querySelector('nav.ec-foot-links');
    if (old && old.getAttribute('data-ecfoot') === stamp) return;
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var d = FOOT[lang];
    var nav = document.createElement('nav');
    nav.className = 'ec-foot-links';
    nav.setAttribute('data-ecfoot', stamp);
    nav.setAttribute('data-lang', lang);
    nav.setAttribute('aria-label', d.a1 + ' / ' + d.a2);
    nav.innerHTML =
      '<h3>' + d.a1 + '</h3><div class="ec-fl-row">' + row(d.g1) + '</div>' +
      '<h3>' + d.a2 + '</h3><div class="ec-fl-row">' + row(d.g2) + '</div>' +
      '<h3>' + d.a3 + '</h3><div class="ec-fl-row">' + row(d.g3) + '</div>';
    grid.appendChild(nav);
  }

  /* ── ② 首页买家卡 ───────────────────────────────── */
  var NEW_CARDS = {
    en: [
      {
        href: '/private-label-drinkware/',
        img: '/img/real-shots-20261028/product-close/sil-01-gjb-001-1200.webp',
        alt: 'Branded silicone cup held on a beach, printed with the buyer logo',
        title: 'Private Label &amp; Own Brand',
        text: 'Your label on the cup, the carton and the hangtag — not the factory name.'
      },
      {
        href: '/bulk-drinkware/',
        img: '/img/main-packaging-20261029/bt-001-3e72412d0f44.webp',
        alt: 'Retail gift box and export carton prepared for a bulk drinkware order',
        title: 'Bulk &amp; Wholesale Quantities',
        text: 'Mixed models, carton planning and a repeat-order specification on file.'
      },
      {
        href: '/no-minimum-custom-cups/',
        img: '/img/real-shots-20261028/product-close/sil-02-gjb-001-1200.webp',
        alt: 'Single sample cup with printed logo on a wooden table',
        title: 'Small &amp; Trial Orders',
        text: 'Start below the usual minimum, then scale once the sample is approved.'
      }
    ],
    zh: [
      {
        href: '/zh/private-label-drinkware/',
        img: '/img/real-shots-20261028/product-close/sil-01-gjb-001-1200.webp',
        alt: '海边手持印有客户 logo 的硅胶杯',
        title: '自有品牌定制',
        text: '杯身、彩盒、吊牌都是你的品牌，工厂名字不出现。'
      },
      {
        href: '/zh/bulk-drinkware/',
        img: '/img/main-packaging-20261029/bt-001-3e72412d0f44.webp',
        alt: '大批量订单的零售礼盒与出口纸箱',
        title: '大批量采购',
        text: '混款、装箱规划、返单规格存档，不用每次重新说一遍。'
      },
      {
        href: '/zh/no-minimum-custom-cups/',
        img: '/img/real-shots-20261028/product-close/sil-02-gjb-001-1200.webp',
        alt: '木桌上印好 logo 的单只样品杯',
        title: '小批量试单',
        text: '先低于常规起订量，样品确认后再放量。'
      }
    ]
  };

  function patchHome() {
    var path = location.pathname;
    if (path !== '/' && path !== '/zh/') return;
    var zh = path === '/zh/';
    var apps = document.querySelector('.of-applications');
    if (!apps) return;

    /* 原来「促销活动代理」这张卡链去了企业礼品页，属于配错；促销买家专页一直是零入口。
       企业礼品页另有 90 多个入口，改这张不影响它。 */
    var promo = apps.querySelector('a[href="' + (zh ? '/zh/corporate-gifts/' : '/corporate-gifts/') + '"]');
    if (promo) {
      promo.setAttribute('href', zh ? '/zh/promotional-drinkware-supplier/' : '/promotional-drinkware-supplier/');
      promo.setAttribute('data-ecfix', VER);
    }

    if (apps.getAttribute('data-ecbuyers') === VER) return;
    if (apps.querySelectorAll('a').length >= 6) {
      apps.setAttribute('data-ecbuyers', VER);
      return;
    }
    var list = NEW_CARDS[zh ? 'zh' : 'en'];
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      html +=
        '<a class="of-application" href="' + c.href + '" data-eccard="' + VER + '">' +
          '<figure><img src="' + c.img + '" width="1200" height="1200"' +
          ' loading="lazy" alt="' + c.alt + '" decoding="async"></figure>' +
          '<div class="of-app-body"><h3>' + c.title + '</h3><p>' + c.text +
          '</p><span class="of-textlink">' + (zh ? '查看可选项' : 'Explore options') + ' \u2192</span></div>' +
        '</a>';
    }
    apps.insertAdjacentHTML('beforeend', html);
    apps.className += ' ec-buyers-6';
    apps.setAttribute('data-ecbuyers', VER);
  }

  /* ── ③ 「The next useful pages」补兄弟卡 ─────────── */
  var SIB = [
    ['/bulk-drinkware/', 'Bulk & Wholesale', 'Quantities, mixed models and carton planning.'],
    ['/private-label-drinkware/', 'Private Label', 'Your brand on the cup and the pack.'],
    ['/no-minimum-custom-cups/', 'Small & Trial Orders', 'Start below the usual minimum.'],
    ['/blank-drinkware/', 'Blank Cups', 'Undecorated stock for decorators and resellers.'],
    ['/promotional-drinkware-supplier/', 'Promotional & Event', 'Logo decoration, gift sets and arrival dates.'],
    ['/personalized-drinkware/', 'Personalized Gifts', 'Names, teams and one-off pieces.'],
    ['/sports-team-cups/', 'Sports Teams', 'Squad artwork and quantities per version.'],
    ['/family-event-cups/', 'Family Events', 'Reunions and milestone parties.'],
    ['/tasting-events-drinkware/', 'Tasting Events', 'Small pours, flight trays and labelling.'],
    ['/acrylic-drinkware/', 'Acrylic', 'Rigid, clear and reusable.'],
    ['/unbreakable-drinkware/', 'Glass-Free', 'Where glass is not allowed.'],
    ['/pet-plastic-cups/', 'PET Cups', 'Crystal-clear PET formats.']
  ];

  function patchRelated() {
    var grids = document.querySelectorAll('.bx-related-grid');
    for (var g = 0; g < grids.length; g++) {
      var grid = grids[g];
      if (grid.getAttribute('data-ecsib') === VER) continue;

      var links = grid.querySelectorAll('a');
      var have = [];
      for (var i = 0; i < links.length; i++) have.push(links[i].getAttribute('href'));

      var need = 6 - have.length;
      if (need <= 0) {
        grid.setAttribute('data-ecsib', VER);
        continue;
      }

      var cur = location.pathname.replace(/\/$/, '/');
      var html = '';
      for (var j = 0; j < SIB.length && need > 0; j++) {
        var href = SIB[j][0];
        if (have.indexOf(href) >= 0 || href === cur) continue;
        html += '<a href="' + href + '" class="bx-related" data-ecsib-card="' + VER + '">' +
          '<h3>' + SIB[j][1] + '</h3><p>' + SIB[j][2] + '</p><strong>Explore \u2192</strong></a>';
        have.push(href);
        need--;
      }
      if (html) grid.insertAdjacentHTML('beforeend', html);
      grid.setAttribute('data-ecsib', VER);
    }
  }

  /* ── 调度 ─────────────────────────────────────── */
  /* ── ④ 证书页：补「规定原文在哪」 ───────────────
     全站只有一个对外链接（WhatsApp），说抽样按 ISO、说过了德国食品级，
     却没有任何一处指得出去。这一块把 6 份政府 / 欧盟原文挂到证书页，
     位置在「买家常问」之后、「下一步」之前。 */
  var CERT = {
    en: {
      kicker: 'WHERE THE RULES ARE PUBLISHED',
      h2: 'Every paper on this page is issued against a public rule',
      lead: 'None of these certificates was invented by us. Each is issued against a rule that anyone can read. The six links below go to the issuing body itself — not a reseller, not a summary blog, not a copy on our server — so you can read the clause before you accept our word for it.',
      cols: ['Rule', 'What it actually covers', 'Original text'],
      rows: [
        ['FDA — Food Ingredients &amp; Packaging', 'The US framework: what counts as a food contact substance and how it is cleared before sale', 'https://www.fda.gov/food/food-ingredients-packaging', 'fda.gov'],
        ['21 CFR Part 177', 'Indirect food additives — the permitted base polymers, including polypropylene and rubber articles', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-177', 'ecfr.gov'],
        ['EU 1935/2004', 'Framework regulation for any material intended to touch food in the EU', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R1935', 'eur-lex.europa.eu'],
        ['EU 10/2011', 'The plastic-specific rules: authorised substances, migration limits, declaration of compliance', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R0010', 'eur-lex.europa.eu'],
        ['LFGB (Germany)', 'German food and feed code — what an LFGB report is issued against, and what it leaves out', 'https://www.gesetze-im-internet.de/lfgb/', 'gesetze-im-internet.de'],
        ['California Prop 65', 'Warning requirement for listed chemicals; it reaches decorated and printed drinkware sold in California', 'https://oehha.ca.gov/proposition-65', 'oehha.ca.gov']
      ],
      note: 'Six government or EU publications. None of them says your cup passes — they say what a laboratory has to test. Which clause applies depends on the material, the market and whether the cup is aimed at children. Send the model and the destination and we will name the clause, not just the standard number.',
      anchor: /BUYER QUESTIONS/i
    },
    zh: {
      kicker: '这些规定发布在哪里',
      h2: '这一页每一份文件，背后都有一份公开的规定',
      lead: '这些证书没有一份是我们自己写的。每一份都依据一份谁都能读到的规定签发。下面六个链接直接指向发布机构本身——不是中间商，不是二手解读，也不是存在我们自己服务器上的副本。你可以先读完条款，再决定信不信我们。',
      cols: ['规定', '它到底管什么', '原文在哪'],
      rows: [
        ['FDA — 食品配料与包装', '美国的框架：什么叫食品接触物质，上市前要经过什么程序', 'https://www.fda.gov/food/food-ingredients-packaging', 'fda.gov'],
        ['21 CFR 第 177 部分', '间接食品添加剂——允许使用的基础聚合物，含聚丙烯与橡胶制品', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-177', 'ecfr.gov'],
        ['欧盟 1935/2004', '欧盟任何会接触食品的材料的总框架法规', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R1935', 'eur-lex.europa.eu'],
        ['欧盟 10/2011', '塑料专项：允许使用的物质、迁移限量、符合性声明', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R0010', 'eur-lex.europa.eu'],
        ['德国 LFGB', '德国食品与饲料法典——LFGB 报告依据什么出，又不覆盖什么', 'https://www.gesetze-im-internet.de/lfgb/', 'gesetze-im-internet.de'],
        ['加州 Prop 65', '对列名化学物质的警告要求；在加州销售的印刷、装饰杯也在范围内', 'https://oehha.ca.gov/proposition-65', 'oehha.ca.gov']
      ],
      note: '六份政府或欧盟出版物。没有一份说你的杯子合格——它们只说明实验室该测什么。你的订单该套哪一条，取决于材质、销售市场、以及这个杯子是不是给孩子用的。把型号和目的国发给我们，我们指出具体条款，而不是只报一个标准号。',
      anchor: /买家常问/
    }
  };

  function patchCertLinks() {
    var path = location.pathname;
    if (!/\/certificates\/$/.test(path)) return;
    if (document.querySelector('[data-ec-ext]')) return;
    var cfg = /^\/zh\//.test(path) ? CERT.zh : CERT.en;
    var secs = document.querySelectorAll('.bx-section');
    var host = null;
    for (var i = 0; i < secs.length; i++) {
      if (cfg.anchor.test(secs[i].innerText || '')) { host = secs[i]; break; }
    }
    if (!host) return;
    var cell = 'padding:12px 14px;border-top:1px solid #e8e8e8;vertical-align:top';
    var trs = cfg.rows.map(function (r) {
      return '<tr>' +
        '<td style="' + cell + '"><b>' + r[0] + '</b></td>' +
        '<td style="' + cell + ';color:#4a4a4a">' + r[1] + '</td>' +
        '<td style="' + cell + '"><a href="' + r[2] + '" target="_blank" rel="noopener" style="color:#1f8fb0">' + r[3] + ' \u2197</a></td>' +
        '</tr>';
    }).join('');
    var th = 'text-align:left;padding:10px 14px;background:#fafafa;border-bottom:1px solid #ddd;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#666;font-weight:500';
    var wrap = document.createElement('div');
    wrap.className = 'bx-wrap bx-section';
    wrap.setAttribute('data-ec-ext', VER);
    wrap.innerHTML =
      '<div class="bx-section-heading"><div><p class="bx-kicker">' + cfg.kicker + '</p><h2>' + cfg.h2 + '</h2></div></div>' +
      '<p class="bx-lead" style="max-width:900px;margin:0 0 24px">' + cfg.lead + '</p>' +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.55"><thead><tr>' +
      cfg.cols.map(function (c) { return '<th style="' + th + '">' + c + '</th>'; }).join('') +
      '</tr></thead><tbody>' + trs + '</tbody></table></div>' +
      '<p style="margin:18px 0 0;font-size:13px;color:#666;max-width:900px">' + cfg.note + '</p>';
    host.insertAdjacentElement('afterend', wrap);
  }

  function run() {
    try { patchFooter(); } catch (e) {}
    try { patchRelated(); } catch (e) {}
    try { patchHome(); } catch (e) {}
    try { patchCertLinks(); } catch (e) {}
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      run();
    });
  }

  function boot() {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);

    /* React 会把 body 整个换掉，所以观察点必须挂在 documentElement 上 */
    try {
      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (e) {}

    /* 客户端路由：点站内链接不重新加载文档，靠比对路径触发 */
    var last = location.pathname;
    setInterval(function () {
      if (location.pathname === last) return;
      last = location.pathname;
      setTimeout(run, 350);
      setTimeout(run, 1200);
    }, 500);
    window.addEventListener('popstate', function () { setTimeout(run, 350); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
