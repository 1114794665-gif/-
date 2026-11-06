/* 「工厂与质量」导航补丁 2026-11-04
   老板要求：
     ① 顶层「工厂与质量」本身就是链接，点一下直接进「关于我们的工厂」，不必先展开下拉
     ② 下拉里放全部子页：工厂介绍 / 质量测试 / 我们的服务 / 采购文章 / 常见问题 / 合作流程
     ③ 「质量控制」不再出现在导航里
     ④ 原来单独一栏「资源 / Resources」取消，内容并进「工厂与质量」
   中英文都管，靠 URL 前缀判断语言；内容一致时不写 DOM，避免和框架来回打架。 */
(function () {
  if (window.__ecFactoryNav) return;
  window.__ecFactoryNav = 1;

  var EN = [
    ["/factory/about/", "About Our Factory"],
    ["/factory/testing/", "Quality Testing"],
    ["/our-service/", "Our Service"],
    ["/blog/", "Buying Guides"],
    ["/faq/", "FAQ"],
    ["/how-to-work-with-us/", "How to Work With Us"]
  ];
  var ZH = [
    ["/zh/factory/about/", "工厂介绍"],
    ["/zh/factory/testing/", "质量测试"],
    ["/zh/our-service/", "我们的服务"],
    ["/zh/blog/", "采购文章"],
    ["/zh/faq/", "常见问题"]
  ];

  function isZh() {
    return /^\/zh(\/|$)/.test(location.pathname);
  }

  function target() {
    return (isZh() ? ZH : EN).map(function (t) {
      return { href: t[0], label: t[1] };
    });
  }

  function patch() {
    var groups = document.querySelectorAll("header details");
    var i, j;

    for (i = 0; i < groups.length; i++) {
      var d = groups[i];
      var s = d.querySelector("summary");
      if (!s) continue;
      var txt = (s.textContent || "").replace(/\s+/g, " ").trim();

      /* ④ 单独的「资源 / Resources」整栏收起 */
      if (/^(Resources|采购资源|资源)$/i.test(txt)) {
        d.style.display = "none";
        continue;
      }

      if (!/^(Factory\s*&\s*Quality|工厂与质量|工厂与品控)$/.test(txt)) continue;

      /* ①② 标题统一，并让标题本身成为链接 */
      var want = isZh() ? "工厂与质量" : "Factory & Quality";
      var href = isZh() ? "/zh/factory/about/" : "/factory/about/";
      var a = s.querySelector("a.ec-fq-root");
      if (!a) {
        s.innerHTML = '<a class="ec-fq-root" href="' + href + '">' + want + "</a>";
      } else {
        if (a.getAttribute("href") !== href) a.setAttribute("href", href);
        if ((a.textContent || "").trim() !== want) a.textContent = want;
      }

      /* 桌面端导航是「悬停展开」，summary 上有个 preventDefault 会吃掉链接跳转。
         这里在捕获阶段截住标题链接的点击，保证点标题就是进工厂介绍页。 */
      if (!s.__ecFqClick) {
        s.__ecFqClick = 1;
        s.addEventListener("click", function (e) {
          var t = e.target;
          if (t && t.closest && t.closest("a.ec-fq-root")) e.stopPropagation();
        }, true);
      }

      /* ③ 面板重写 */
      var panel = d.querySelector("div");
      if (!panel) continue;
      var items = target();
      var links = panel.querySelectorAll("a");
      if (links.length === items.length) {
        var same = true;
        for (j = 0; j < links.length; j++) {
          if (links[j].getAttribute("href") !== items[j].href) { same = false; break; }
        }
        if (same) continue;
      }
      var html = "";
      for (j = 0; j < items.length; j++) {
        html += '<a href="' + items[j].href + '" data-discover="true">' + items[j].label + "</a>";
      }
      panel.innerHTML = html;
    }
  }

  function boot() {
    if (!document.getElementById('ec-fq-css')) {
      var st = document.createElement('style');
      st.id = 'ec-fq-css';
      st.textContent = 'header summary a.ec-fq-root{color:inherit;text-decoration:none;display:inline-block}header summary a.ec-fq-root:hover{color:inherit}';
      document.head.appendChild(st);
    }
    patch();
    var scheduled = false;
    var mo = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () { scheduled = false; patch(); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    [150, 600, 1500, 3000, 5000].forEach(function (t) { setTimeout(patch, t); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* 站内软导航到 OEM / ODM 页时，按需加载版面补丁 */
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
