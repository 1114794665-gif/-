/* OEM / ODM 页版面补强（2026-10-29，第十二批）
 *
 * 背景：/oem-manufacturer/ 这一页由 React 渲染，直接改 HTML 会被水合过程覆盖，
 * 所以统一在水合之后改 DOM。
 *
 * 做两件事：
 *   1) 「五步流程」区块：原来的网格是 4 列（序号 / 图 / 标题 / 你要-我们来），
 *      没有图的步骤会有两列空着，右半边整片留白。这里改成两栏：左流程、右询盘卡。
 *   2) 「制造与项目管理」区块：拿掉左侧那张大图，三条要点改成图文卡，补一条工厂数字。
 *
 * 表单提交走站点既有的 /api/enquiries（和 /contact/ 同一套接收端）；
 * 接收端没连上时自动降级成邮件，内容已写好，点一下就发出，不会让询盘丢掉。
 */
(function () {
  'use strict';

  var MAIL = 'christoph_enrico@hotmail.com';
  var WA = 'https://wa.me/8613059173747';

  var T = {
    zh: {
      kicker: '项目询盘',
      title: '把你的情况发过来',
      sub: '不用写得完整。缺哪一项，我们在回复里列成待确认清单问你，不替你猜。',
      l1: '要做什么：型号、用途，或一句话',
      p1: '例：16oz 塑料杯，印我们的 logo，海边活动 800 只',
      l2: '数量（件）',
      l3: '需要到货日期',
      l4: '邮箱',
      l5: '称呼 / 公司',
      btn: '提交询盘 ·工作日12小时内回复',
      sending: '正在提交…',
      fine: '只用于本次询盘跟进。两个以上文件，请直接发邮件。',
      alt: '也可以直接联系',
      ok1: '收到了。',
      ok2: '12 小时内回你，缺的资料会列成待确认清单。',
      ref1: '询盘编号',
      fail1: '网站接收这次没连上。',
      fail2: '内容已经写在一封邮件里，点下面这一步发出去就到我们手上，不用重填。',
      failBtn: '用邮件发送这份询盘',
      mail: '邮箱',
      nextT: '接下来',
      next: [
        '12 小时内回一封邮件，把所有待定项列清楚',
        '有图稿就发到 <a href="mailto:' + MAIL + '">' + MAIL + '</a>，邮件里写上询盘编号',
        '要加急，WhatsApp 说一声就行'
      ],
      inclT: '报价里会写清这四项',
      incl: [
        '单价按数量分段，不给一个笼统价',
        '开模费用单列，包含什么、不包含什么',
        '打样周期，以及从哪一天起算',
        '包装方式与送货方式：门到门，或送到你的货代'
      ]
    },
    en: {
      kicker: 'PROJECT ENQUIRY',
      title: 'Send what you have.',
      sub: 'It does not need to be complete. Whatever is missing comes back as a short list of open points, not a guess.',
      l1: 'What you need — model, use, or one sentence',
      p1: 'e.g. 16 oz plastic cup, our logo printed, 800 pcs for a beach event',
      l2: 'Quantity (pieces)',
      l3: 'Required arrival date',
      l4: 'Email',
      l5: 'Name / company',
      btn: 'Send enquiry · reply within 12 hours on business days',
      sending: 'Sending…',
      fine: 'Used only to follow up this enquiry. For two or more files, email us directly.',
      alt: 'Or reach us directly',
      ok1: 'Received.',
      ok2: 'You get a reply within 12 hours on business days, with anything missing listed as open points.',
      ref1: 'Enquiry reference',
      fail1: 'The website receiving service did not connect.',
      fail2: 'Your details are already written into an email — one click below sends it, nothing to re-enter.',
      failBtn: 'Send this enquiry by email',
      mail: 'Email',
      nextT: 'What happens next',
      next: [
        'A reply within 12 hours on business days, with every open point listed',
        'Have artwork? Email it to <a href="mailto:' + MAIL + '">' + MAIL + '</a> and quote the reference',
        'Need it sooner? One WhatsApp message is enough'
      ],
      inclT: 'What the quote spells out',
      incl: [
        'Unit price by quantity break, not one vague number',
        'Tooling cost on its own line, with what it does and does not cover',
        'Sampling lead time, and the day it starts counting',
        'Packing method and delivery route — door to door, or to your forwarder'
      ]
    }
  };

  var CARDS = {
    zh: [
      {
        n: '01',
        t: '材料与规格',
        d: '尺寸、配件、实际用途写进同一份规格单。杯身、盖子、吸管分开列清楚，避免看着一样的两个件，到最后装不上。',
        img: '/img/archive-real-20261103/081-56ed5ab019.webp',
        alt: '宝源丰车间里的注塑机台'
      },
      {
        n: '02',
        t: '图稿与样品确认',
        d: '图稿版本、颜色参考、样品本身，三样一次确认。生产等的是这一个签字，不是三封邮件来回。',
        img: '/img/archive-real-20261103/070-bf8b50e360.webp',
        alt: '宝源丰模具房，模具制作与修模'
      },
      {
        n: '03',
        t: '检验与包装要求',
        d: '验收点开机前就定下来：AQL 等级或你自己的清单。报告对着这份清单出，不另写一套。',
        img: '/img/manufacturing-20261105/qc-mask-cap-optimized.webp',
        alt: '质检人员逐只检查定制塑胶红酒杯'
      }
    ],
    en: [
      {
        n: '01',
        t: 'Material & specification',
        d: 'Dimensions, components and intended use on one sheet. Body, lid and straw listed separately, so two parts that look alike cannot arrive unable to fit.',
        img: '/img/archive-real-20261103/081-56ed5ab019.webp',
        alt: 'Injection moulding floor at the Baoyuanfeng factory in Shenzhen'
      },
      {
        n: '02',
        t: 'Artwork & sample approval',
        d: 'Artwork version, colour reference and the physical sample approved once. Production waits for that single sign-off, not three email threads.',
        img: '/img/archive-real-20261103/070-bf8b50e360.webp',
        alt: 'Tooling shop at the Baoyuanfeng factory — mould making and repair'
      },
      {
        n: '03',
        t: 'Inspection & packing requirements',
        d: 'Acceptance points are fixed before the machine starts: an AQL level or your own checklist. The report is written against that list, not a separate one.',
        img: '/img/manufacturing-20261105/qc-mask-cap-optimized.webp',
        alt: 'QC staff checking a custom plastic wine glass by hand'
      }
    ]
  };

  var FACTS = {
    zh: [
      ['4 名', 'QA/QC 质检'],
      ['65 台', '生产设备总数'],
      ['4 条', '自有生产线'],
      ['4 名', '研发工程师']
    ],
    en: [
      ['4', 'QA/QC inspectors'],
      ['65', 'Production machinery'],
      ['4', 'Self-owned production lines'],
      ['4', 'R&D engineers']
    ]
  };

  function isZh() { return /^\/zh\//.test(location.pathname); }
  function onOem() { return /^\/(zh\/)?oem-manufacturer\/?$/.test(location.pathname); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 1. 询盘卡 ---------- */

  function buildRfq(t) {
    var aside = document.createElement('aside');
    aside.className = 'oemx-rfq';
    aside.setAttribute('aria-label', t.kicker);
    aside.innerHTML =
      '<p class="oemx-kicker">' + esc(t.kicker) + '</p>' +
      '<h3>' + esc(t.title) + '</h3>' +
      '<p class="oemx-sub">' + esc(t.sub) + '</p>' +
      '<form class="oemx-form" novalidate>' +
        '<label class="oemx-field"><span>' + esc(t.l1) + '</span>' +
          '<textarea name="productInterest" required maxlength="600" placeholder="' + esc(t.p1) + '"></textarea></label>' +
        '<div class="oemx-row2">' +
          '<label class="oemx-field"><span>' + esc(t.l2) + '</span>' +
            '<input type="number" name="quantity" min="1" step="1" inputmode="numeric"></label>' +
          '<label class="oemx-field"><span>' + esc(t.l3) + '</span>' +
            '<input type="date" name="arrival"></label>' +
        '</div>' +
        '<label class="oemx-field"><span>' + esc(t.l4) + ' *</span>' +
          '<input type="email" name="email" required autocomplete="email" maxlength="160"></label>' +
        '<label class="oemx-field"><span>' + esc(t.l5) + '</span>' +
          '<input type="text" name="company" autocomplete="organization" maxlength="160"></label>' +
        '<label class="oemx-hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<button type="submit">' + esc(t.btn) + '</button>' +
      '</form>' +
      '<p class="oemx-fine">' + esc(t.fine) + ' <a href="mailto:' + MAIL + '">' + MAIL + '</a></p>' +
      '<div class="oemx-alt"><span>' + esc(t.alt) + '</span>' +
        '<a href="' + WA + '" target="_blank" rel="noopener noreferrer">WhatsApp +86 130 5917 3747</a></div>' +
      '<div class="oemx-incl"><p>' + esc(t.inclT) + '</p><ul>' +
        t.incl.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';

    var form = aside.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit(aside, form, t);
    });
    return aside;
  }

  function readForm(form) {
    var g = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
    return {
      productInterest: g('productInterest'),
      quantity: g('quantity'),
      arrival: g('arrival'),
      email: g('email'),
      company: g('company'),
      website: g('website')
    };
  }

  function submit(aside, form, t) {
    var v = readForm(form);
    if (v.website) return;                                   /* 机器人 */
    if (!v.productInterest || !v.email || v.email.indexOf('@') < 1) {
      var bad = !v.productInterest ? form.elements.productInterest : form.elements.email;
      if (bad) { bad.focus(); bad.style.borderColor = '#c2412d'; }
      return;
    }

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = t.sending;

    var payload = {
      productInterest: v.productInterest,
      message: v.productInterest,
      quantity: v.quantity,
      arrival: v.arrival,
      email: v.email,
      company: v.company,
      name: v.company,
      country: '',
      source: location.pathname,
      page: location.href
    };

    var settled = false;
    var timer = setTimeout(function () { if (!settled) { settled = true; showFail(aside, t, v); } }, 4000);

    fetch('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function (d) {
      if (settled) return;
      settled = true; clearTimeout(timer);
      var ref = (d && (d.id || d.reference || d.enquiryId)) || '';
      showOk(aside, t, ref);
    }).catch(function () {
      if (settled) return;
      settled = true; clearTimeout(timer);
      showFail(aside, t, v);
    });
  }

  function showOk(aside, t, ref) {
    aside.className = 'oemx-rfq oemx-state';
    aside.innerHTML =
      '<p class="oemx-kicker">' + esc(t.kicker) + '</p>' +
      '<h3>' + esc(t.ok1) + '</h3>' +
      (ref ? '<p><span class="oemx-ref">' + esc(t.ref1) + ' · ' + esc(ref) + '</span></p>' : '') +
      '<p>' + esc(t.ok2) + '</p>' +
      '<div class="oemx-next"><p>' + esc(t.nextT) + '</p><ul>' +
        t.next.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="oemx-alt"><span>' + esc(t.alt) + '</span>' +
        '<a href="' + WA + '" target="_blank" rel="noopener noreferrer">WhatsApp +86 130 5917 3747</a></div>';
  }

  function showFail(aside, t, v) {
    var lines = [];
    lines.push('What you need: ' + (v.productInterest || ''));
    if (v.quantity) lines.push('Quantity: ' + v.quantity);
    if (v.arrival) lines.push('Required arrival: ' + v.arrival);
    if (v.company) lines.push('Name / company: ' + v.company);
    if (v.email) lines.push('Email: ' + v.email);
    lines.push('Sent from: ' + location.href);
    var subject = (v.productInterest || 'Project enquiry').slice(0, 70);
    var href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));

    aside.className = 'oemx-rfq oemx-state';
    aside.innerHTML =
      '<p class="oemx-kicker">' + esc(t.kicker) + '</p>' +
      '<h3>' + esc(t.fail1) + '</h3>' +
      '<p>' + esc(t.fail2) + '</p>' +
      '<a class="oemx-big" href="' + href + '">' + esc(t.failBtn) + '</a>' +
      '<p class="oemx-fine" style="margin-top:12px"><a href="' + WA + '" target="_blank" rel="noopener noreferrer">WhatsApp +86 130 5917 3747</a> · <a href="mailto:' + MAIL + '">' + MAIL + '</a></p>';
  }

  /* ---------- 2. 改造两处 DOM ---------- */

  function patchProcess() {
    var sec = document.querySelector('.of-process');
    if (!sec || sec.querySelector('.oemx-rfq')) return;
    var wrap = sec.querySelector('.of-wrap');
    if (!wrap) return;

    var grid = document.createElement('div');
    grid.className = 'oemx-process-grid';
    var main = document.createElement('div');
    main.className = 'oemx-process-main';
    while (wrap.firstChild) main.appendChild(wrap.firstChild);
    grid.appendChild(main);
    grid.appendChild(buildRfq(T[isZh() ? 'zh' : 'en']));
    wrap.appendChild(grid);
  }

  function patchFactory() {
    var grid = document.querySelector('.of-factory-grid');
    if (!grid || grid.querySelector('.oemx-cards')) return;
    var host = grid.querySelector(':scope > div');
    if (!host) return;

    var fig = grid.querySelector('figure.of-reference');
    if (fig) fig.remove();
    grid.classList.add('oemx-factory');

    var ul = host.querySelector('ul.of-checklist');
    if (ul) ul.remove();

    var lang = isZh() ? 'zh' : 'en';
    var cards = document.createElement('div');
    cards.className = 'oemx-cards';
    cards.innerHTML = CARDS[lang].map(function (c) {
      return '<article class="oemx-card">' +
        '<figure><img src="' + c.img + '" width="700" height="525" alt="' + esc(c.alt) + '" loading="lazy" decoding="async"></figure>' +
        '<div class="oemx-card-body"><b>' + c.n + '</b><h3>' + esc(c.t) + '</h3><p>' + esc(c.d) + '</p></div>' +
      '</article>';
    }).join('');

    var facts = document.createElement('div');
    facts.className = 'oemx-facts';
    facts.innerHTML = FACTS[lang].map(function (f) {
      return '<div><strong>' + esc(f[0]) + '</strong><span>' + esc(f[1]) + '</span></div>';
    }).join('');

    /* 先把卡片和数字条接到导语后面（此时导语还在原来的位置） */
    var lead = host.querySelector('.of-lead');
    if (lead) {
      lead.insertAdjacentElement('afterend', cards);
      cards.insertAdjacentElement('afterend', facts);
    } else {
      host.appendChild(cards);
      host.appendChild(facts);
    }

    /* 再重排抬头：标题和导语原本一上一下堆在左边，去掉照片后右边整片空，
       这里改成页面上其它板块一致的「左标题 / 右导语」两栏。 */
    var eyebrow = host.querySelector('.of-eyebrow');
    var h2 = host.querySelector('h2');
    if (eyebrow && h2 && lead) {
      var head = document.createElement('div');
      head.className = 'of-heading oemx-head';
      var left = document.createElement('div');
      host.insertBefore(head, host.firstChild);
      left.appendChild(eyebrow);
      left.appendChild(h2);
      head.appendChild(left);
      head.appendChild(lead);
    }
  }

  function patch() {
    if (!onOem()) return;
    patchProcess();
    patchFactory();
  }

  /* 水合会重建 DOM，这里盯着：目标板块在、补丁不在，就再补一次 */
  var pending = null;
  function schedule() {
    if (pending) return;
    pending = setTimeout(function () {
      pending = null;
      try { patch(); } catch (e) { /* 静默，重复尝试即可 */ }
    }, 150);
  }

  /* 站内点导航是客户端路由，不会重新加载脚本，所以要自己盯着路由变化 */
  function onRouteChange() {
    [250, 800, 1600, 3200].forEach(function (t) { setTimeout(function () { try { patch(); } catch (e) {} }, t); });
  }

  function boot() {
    patch();
    setTimeout(patch, 700);
    setTimeout(patch, 1800);

    /* 站内点导航是客户端路由：window 不重载、body 会被整体换掉，
       所以观察点必须挂在 documentElement 上（挂 body 会被换掉而失效）。 */
    var lastPath = location.pathname;
    try {
      new MutationObserver(function () {
        if (location.pathname !== lastPath) {
          lastPath = location.pathname;
          onRouteChange();
          return;
        }
        schedule();
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) { /* 老浏览器就算了 */ }

    window.addEventListener('popstate', onRouteChange);
    /* 兜底：极少数情况下路由是 replaceState 静默改的，观察不到 DOM 变化 */
    setInterval(function () {
      if (location.pathname === lastPath) return;
      lastPath = location.pathname;
      onRouteChange();
    }, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
