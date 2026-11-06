// 类目页结构化数据（2026-10-29）
// 为什么要在浏览器里再生成一遍：这套页面的 React 在启动时会把它不认识的
// JSON-LD 全部移除，只留下自己渲染的那一条。所以静态文件里放一份（给不跑 JS 的
// 抓取端），页面稳定后再补一份（给跑 JS 的抓取端）。两份内容由同一段逻辑生成。
(function () {
  var SITE = 'https://www.boomdrinkware.com';

  function build() {
    var path = location.pathname.replace(/\/?$/, '/');
    var h1 = document.querySelector('h1');
    var name = h1 ? h1.textContent.trim() : document.title.split('|')[0].trim();

    // 面包屑：优先用页面上真实可见的那条
    var items = [];
    var crumbs = [].slice.call(document.querySelectorAll('.bx-breadcrumb a, nav[aria-label="Breadcrumb"] a'));
    if (crumbs.length) {
      crumbs.forEach(function (a, i) {
        items.push({ '@type': 'ListItem', position: i + 1, name: a.textContent.trim(), item: SITE + (a.getAttribute('href') || '/') });
      });
      items.push({ '@type': 'ListItem', position: items.length + 1, name: name, item: SITE + path });
    } else {
      items = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: SITE + '/products/' },
        { '@type': 'ListItem', position: 3, name: name, item: SITE + path }
      ];
    }

    var blocks = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }];

    // 问答：只取页面上真的能看到的
    // 三套结构都要认：.opt-faq（型号区原有）、.bx-qa（批发/私标/低起订的问答板块）、
    // .bx-faq-restore（后面补进去的那份）
    var qa = [].slice.call(document.querySelectorAll('.opt-faq details, .bx-qa details, .bx-faq-restore details')).map(function (d) {
      var q = d.querySelector('summary'), a = d.querySelector('p');
      if (!q || !a) return null;
      var t = a.textContent.replace(/\s+/g, ' ').trim();
      if (t.length < 20) return null;
      return { '@type': 'Question', name: q.textContent.replace(/\s+/g, ' ').trim(), acceptedAnswer: { '@type': 'Answer', text: t } };
    }).filter(Boolean);

    if (qa.length) {
      blocks.push({
        '@context': 'https://schema.org', '@type': 'FAQPage', '@id': SITE + path + '#faq',
        url: SITE + path, inLanguage: 'en', mainEntity: qa
      });
    }
    return blocks;
  }

  function strip() {
    [].slice.call(document.querySelectorAll('script[data-ec-schema]')).forEach(function (s) { s.remove(); });
  }

  function apply() {
    strip();
    var blocks = build();
    blocks.forEach(function (b) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-ec-schema', '1');
      s.textContent = JSON.stringify(b);
      document.body.appendChild(s);
    });
  }

  window.__ecApplySchema = apply; // 供问答恢复脚本插入内容后回调

  function start() {
    apply();
    // 页面在软导航后会重渲染，稍后再补一次；只补两次，不做常驻监听，避免死循环
    setTimeout(apply, 1800);
  }

  if (document.readyState === 'complete') setTimeout(start, 600);
  else window.addEventListener('load', function () { setTimeout(start, 600); });
})();

// 站内软导航到 OEM / ODM 页时，按需把版面补丁加载进来（2026-10-29）
// 背景：客户端路由不会重新加载文档，页面自带的 script 不会执行；其它页面不预载这个脚本。
(function () {
  if (window.__ecOemPatchLoader) return;
  window.__ecOemPatchLoader = 1;
  function need() { return /^\/(zh\/)?oem-manufacturer\/?$/.test(location.pathname); }
  function load() {
    if (!need() || document.querySelector('script[src*="ec-oem-patch-20261029"]')) return;
    var s = document.createElement('script');
    s.src = '/assets/ec-oem-patch-20261029.js?v=20261106-terms1';
    s.defer = true;
    document.head.appendChild(s);
  }
  var last = location.pathname;
  setInterval(function () {
    if (location.pathname === last) return;
    last = location.pathname;
    setTimeout(load, 450);
  }, 500);
  window.addEventListener('popstate', function () { setTimeout(load, 450); });
})();
