/* 页尾 CTA 询盘窗口（2026-10-31）
 *
 * 为什么用脚本注入而不是直接改 HTML：
 *   这个收尾板块在多个页面共用同一段静态结构，直接改 HTML 每页都要跟一遍，
 *   后面换版式还得回头找。脚本只在页面出现 .tn-cta 时把它改成两栏并挂一张询盘卡。
 *
 * 提交走站点原有的 /api/enquiries：先领通行证，再 POST。
 * 幂等：打 .rq-on 标记 + #rq-card 存在性判断，重复执行不叠加。
 */
(function () {
  'use strict';
  if (window.__rqCta) return;
  window.__rqCta = 1;

  var VER = '20261031a';
  var CARD_ID = 'rq-card';
  var tries = 0;

  function isZh() {
    return /^\/zh(\/|$)/.test(location.pathname);
  }

  var T = isZh()
    ? {
        kick: '获取报价',
        title: '把你的需求交给我们',
        sub: '工厂的业务直接看，一个工作日内回复。',
        name: '称呼',
        email: '工作邮箱',
        company: '公司',
        country: '国家 / 地区',
        need: '需要什么？',
        ph: '例如：16 oz 折叠硅胶杯，3000 只，印单色 logo，单个 OPP 袋，发洛杉矶',
        submit: '提交询盘 →',
        sending: '正在提交…',
        note: '图稿、参考图可随后邮件补充。我们不会把你的资料转给第三方。',
        errEmpty: '请填写邮箱和需求说明。',
        errMail: '邮箱格式看起来不对，请再检查一下。',
        errNet: '暂时没提交成功，内容还在，请再点一次。',
        doneH: '已收到，编号如下',
        doneP: '客户经理会在一个工作日内回复你。',
        ref: '询盘编号：',
        six: ['做什么', '数量', '材质', '工艺', '包装', '到哪儿']
      }
    : {
        kick: 'Request a quote',
        title: 'Tell us what you need',
        sub: 'Read by the factory, not a call centre. One working day.',
        name: 'Your name',
        email: 'Work email',
        company: 'Company',
        country: 'Country',
        need: 'What do you need?',
        ph: 'e.g. 16 oz collapsible silicone cup, 3,000 pcs, 1-colour logo, individual polybag, Los Angeles',
        submit: 'Send enquiry →',
        sending: 'Sending…',
        note: 'Artwork and references can follow by email. We do not pass your details on.',
        errEmpty: 'Please add your email and a short description.',
        errMail: 'That email address does not look right.',
        errNet: 'Not confirmed yet — your text is still here, please press send again.',
        doneH: 'Enquiry received',
        doneP: 'An account manager replies within one working day.',
        ref: 'Reference: ',
        six: ['Model or use case', 'Quantity', 'Material', 'Decoration', 'Packing', 'Destination']
      };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function sixHtml() {
    return '<ul class="rq-six">' + T.six.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  }

  function cardHtml() {
    return (
      '<aside class="rq-card" id="' + CARD_ID + '" data-ver="' + VER + '">' +
        '<p class="rq-kicker">' + esc(T.kick) + '</p>' +
        '<h3>' + esc(T.title) + '</h3>' +
        '<p class="rq-sub">' + esc(T.sub) + '</p>' +
        '<form novalidate>' +
          '<div class="rq-row">' +
            '<label><span>' + esc(T.name) + '</span><input name="name" autocomplete="name" maxlength="100"></label>' +
            '<label><span>' + esc(T.email) + ' *</span><input name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" required></label>' +
          '</div>' +
          '<div class="rq-row">' +
            '<label><span>' + esc(T.company) + '</span><input name="company" autocomplete="organization" maxlength="120"></label>' +
            '<label><span>' + esc(T.country) + '</span><input name="country" autocomplete="country-name" maxlength="80"></label>' +
          '</div>' +
          '<label><span>' + esc(T.need) + ' *</span>' +
            '<textarea name="productInterest" rows="3" maxlength="1500" required placeholder="' + esc(T.ph) + '"></textarea></label>' +
          '<label class="rq-hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></label>' +
          '<button type="submit" class="rq-btn">' + esc(T.submit) + '</button>' +
          '<p class="rq-status" role="status" aria-live="polite"></p>' +
          '<p class="rq-note">' + esc(T.note) + '</p>' +
        '</form>' +
      '</aside>'
    );
  }

  function bind() {
    var card = document.getElementById(CARD_ID);
    if (!card || card.getAttribute('data-bound') === '1') return;
    card.setAttribute('data-bound', '1');

    var form = card.querySelector('form');
    if (!form) return;
    var status = card.querySelector('.rq-status');
    var button = card.querySelector('.rq-btn');
    var key = null;
    var busy = false;

    form.addEventListener('input', function () { key = null; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;

      var fd = new FormData(form);
      var val = function (k) { return String(fd.get(k) || '').trim(); };
      var email = val('email');
      var need = val('productInterest');

      status.className = 'rq-status';
      if (!email || !need) { status.textContent = T.errEmpty; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = T.errMail; return; }

      if (!key) key = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'k' + Date.now() + Math.random();

      var payload = {
        name: val('name'),
        email: email,
        company: val('company'),
        country: val('country'),
        productInterest: need,
        message: need,
        website: val('website'),
        locale: isZh() ? 'zh' : 'en',
        source: 'cta-rfq',
        sourcePath: location.pathname,
        page: location.pathname
      };

      busy = true;
      button.disabled = true;
      var label = button.textContent;
      button.textContent = T.sending;
      status.textContent = T.sending;

      fetch('/api/enquiries/session', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (s) {
          if (!s || !s.token) throw new Error('no token');
          return fetch('/api/enquiries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Enquiry-Token': s.token,
              'Idempotency-Key': key
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(60000)
          });
        })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !res.d.ok) throw new Error(res.d && res.d.code ? res.d.code : 'failed');
          card.innerHTML =
            '<div class="rq-done">' +
              '<h4>' + esc(T.doneH) + '</h4>' +
              '<p>' + esc(T.doneP) + '</p>' +
              '<p>' + esc(T.ref) + '<b>' + esc(res.d.id || '') + '</b></p>' +
            '</div>';
        })
        .catch(function () {
          busy = false;
          button.disabled = false;
          button.textContent = label;
          status.className = 'rq-status is-error';
          status.textContent = T.errNet;
        });
    });
  }

  function head2(sec) {
    var out = { h2: null, p: null };
    for (var i = 0; i < sec.children.length; i++) {
      var el = sec.children[i];
      if (el.tagName === 'H2' && !out.h2) out.h2 = el;
      else if (el.tagName === 'P' && !out.p) out.p = el;
    }
    return out;
  }

  function build() {
    var sec = document.querySelector('section.tn-cta');
    if (!sec) return false;

    var band = sec.querySelector('.rq-band');
    if (sec.classList.contains('rq-on') && band && document.getElementById(CARD_ID)) return true;

    // 框架重渲染把卡冲掉了：两栏还在就直接把卡挂回去
    if (band && !document.getElementById(CARD_ID)) {
      var copy = band.querySelector('.rq-copy');
      if (copy && !copy.querySelector('.rq-six')) copy.insertAdjacentHTML('beforeend', sixHtml());
      band.insertAdjacentHTML('beforeend', cardHtml());
      sec.classList.add('rq-on');
      bind();
      return true;
    }

    var old = head2(sec);
    if (!old.h2) return false;

    band = document.createElement('div');
    band.className = 'rq-band';

    var copyEl = document.createElement('div');
    copyEl.className = 'rq-copy';
    copyEl.appendChild(old.h2);
    if (old.p) copyEl.appendChild(old.p);
    copyEl.insertAdjacentHTML('beforeend', sixHtml());

    band.appendChild(copyEl);
    band.insertAdjacentHTML('beforeend', cardHtml());
    sec.insertBefore(band, sec.firstChild);
    sec.classList.add('rq-on');
    bind();
    return true;
  }

  function start() {
    if (build()) return;
    var timer = setInterval(function () {
      if (build() || ++tries > 40) clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // 框架二次渲染可能把注入的节点冲掉 —— 掉了补回来（有限次数，避免死循环）
  var repaired = 0;
  if ('MutationObserver' in window) {
    var pending = null;
    new MutationObserver(function () {
      if (pending || repaired > 5) return;
      pending = setTimeout(function () {
        pending = null;
        if (!document.getElementById(CARD_ID)) { repaired++; build(); }
      }, 400);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
