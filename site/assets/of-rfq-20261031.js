/* 首页流程板块右侧询盘表（2026-10-31）
 *
 * 为什么用脚本注入而不是直接改 HTML：
 *   首页正文是框架渲染的，静态 HTML 里手改的结构在页面启动后被覆盖。
 *   所以在渲染完成后再把「流程列 + 询盘卡」包成两栏。
 *
 * 提交走站点原有的 /api/enquiries：先领通行证，再 POST。
 * 幂等：打 data-rfq 标记，重复执行不叠加。
 */
(function () {
  'use strict';
  if (window.__ofRfq) return;
  window.__ofRfq = 1;

  var VER = '20261031a';
  var CARD_ID = 'of-rfq-card';
  var tries = 0;

  function isZh() {
    return /^\/zh(\/|$)/.test(location.pathname);
  }

  var T = isZh()
    ? {
        kick: '获取报价',
        title: '把你的需求交给我们',
        lede: '告诉我们做什么杯子、多少数量、什么时候要。一个工作日内回复。',
        name: '称呼',
        email: '工作邮箱',
        company: '公司',
        country: '国家 / 地区',
        need: '需要什么？（产品 / 数量 / 交期）',
        submit: '提交询盘 →',
        sending: '正在提交…',
        note: '图稿、参考图可后续邮件补充。我们不会把你的资料转给第三方。',
        errEmpty: '请填写邮箱和需求说明。',
        errMail: '邮箱格式看起来不对，请再检查一下。',
        errNet: '暂时没提交成功，内容还在，请再点一次。',
        doneH: '已收到，编号如下',
        doneP: '一份确认已生成，客户经理会在一个工作日内回复你。',
        ref: '询盘编号：'
      }
    : {
        kick: 'Request a quote',
        title: 'Tell us what you need',
        lede: 'Product, quantity and when you need it. We reply within one working day.',
        name: 'Your name',
        email: 'Work email',
        company: 'Company',
        country: 'Country',
        need: 'What do you need? (product / quantity / date)',
        submit: 'Send enquiry →',
        sending: 'Sending…',
        note: 'Artwork and references can follow by email. We do not pass your details to third parties.',
        errEmpty: 'Please add your email and a short description.',
        errMail: 'That email address does not look right.',
        errNet: 'Not confirmed yet — your text is still here, please press send again.',
        doneH: 'Enquiry received',
        doneP: 'A reference has been created. Our account manager replies within one working day.',
        ref: 'Reference: '
      };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cardHtml() {
    return (
      '<aside class="of-rfq" id="' + CARD_ID + '" data-ver="' + VER + '">' +
        '<p class="of-rfq-kicker">' + esc(T.kick) + '</p>' +
        '<h3>' + esc(T.title) + '</h3>' +
        '<p class="of-rfq-lede">' + esc(T.lede) + '</p>' +
        '<form novalidate>' +
          '<label><span>' + esc(T.name) + '</span><input name="name" autocomplete="name" maxlength="100"></label>' +
          '<label><span>' + esc(T.email) + ' *</span><input name="email" type="email" autocomplete="email" maxlength="200" required></label>' +
          '<div class="of-rfq-row">' +
            '<label><span>' + esc(T.company) + '</span><input name="company" autocomplete="organization" maxlength="120"></label>' +
            '<label><span>' + esc(T.country) + '</span><input name="country" autocomplete="country-name" maxlength="80"></label>' +
          '</div>' +
          '<label><span>' + esc(T.need) + ' *</span><textarea name="productInterest" rows="3" maxlength="1500" required></textarea></label>' +
          '<label class="of-rfq-hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></label>' +
          '<button type="submit" class="of-rfq-submit">' + esc(T.submit) + '</button>' +
          '<p class="of-rfq-status" role="status" aria-live="polite"></p>' +
          '<p class="of-rfq-note">' + esc(T.note) + '</p>' +
        '</form>' +
      '</aside>'
    );
  }

  function bind() {
    var card = document.getElementById(CARD_ID);
    if (!card || card.getAttribute('data-bound') === '1') return;
    card.setAttribute('data-bound', '1');

    var form = card.querySelector('form');
    var status = card.querySelector('.of-rfq-status');
    var button = card.querySelector('.of-rfq-submit');
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

      status.className = 'of-rfq-status';
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
        source: 'home-process-rfq',
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
            '<div class="of-rfq-done">' +
              '<h4>' + esc(T.doneH) + '</h4>' +
              '<p>' + esc(T.doneP) + '</p>' +
              '<p>' + esc(T.ref) + '<b>' + esc(res.d.id || '') + '</b></p>' +
            '</div>';
        })
        .catch(function () {
          busy = false;
          button.disabled = false;
          button.textContent = label;
          status.className = 'of-rfq-status is-error';
          status.textContent = T.errNet;
        });
    });
  }

  function build() {
    var sec = document.querySelector('.of-process');
    if (!sec) return false;
    if (sec.getAttribute('data-rfq') === '1' && document.getElementById(CARD_ID)) return true;

    var wrap = sec.querySelector('.of-wrap');
    if (!wrap) return false;
    var steps = wrap.querySelector('.of-steps');
    if (!steps || !steps.querySelector('.of-step')) return false;

    var split = steps.parentElement;
    if (!split || !split.classList.contains('of-rfq-split')) {
      split = document.createElement('div');
      split.className = 'of-rfq-split';
      wrap.insertBefore(split, steps);
      split.appendChild(steps);
    }
    if (!document.getElementById(CARD_ID)) {
      split.insertAdjacentHTML('beforeend', cardHtml());
    }
    sec.setAttribute('data-rfq', '1');
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
