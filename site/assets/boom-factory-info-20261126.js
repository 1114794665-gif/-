(function () {
  'use strict';
  function curPath() { return location.pathname.replace(/\/?$/, '/'); }
  function zhNow() { return curPath().indexOf('/zh/') === 0; }
  var EN_ADDR = '1F, Building A2(1), Tonglu Industrial Zone, No. 70 Tongxin Road, Tongxin Community, Baolong Street, Longgang District, Shenzhen, Guangdong, China';
  var ZH_ADDR = '\u5e7f\u4e1c\u7701\u6df1\u5733\u5e02\u9f99\u5c97\u533a\u5b9d\u9f99\u8857\u9053\u540c\u5fc3\u793e\u533a\u540c\u5fc3\u8def70\u53f7\u540c\u8def\u5de5\u4e1a\u533aA2(1)\u680b1\u697c';
  var TEL = '+86 13059173747';

  function footerLine() {
    var zh = zhNow();
    var a0 = zh ? '\u5de5\u5382\u5730\u5740\uff1a' : 'Factory: ';
    var p = document.createElement('p');
    p.setAttribute('data-lang', zh ? 'zh' : 'en');
    p.className = 'byf-footer-factory';
    p.setAttribute('style', 'margin:10px 0 0;font-size:13px;line-height:1.75;opacity:.85');
    p.appendChild(document.createTextNode(a0 + (zh ? ZH_ADDR : EN_ADDR)));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode(zh ? '\u7535\u8bdd\uff1a' : 'Tel: '));
    var a = document.createElement('a');
    a.href = 'tel:+8613059173747';
    a.setAttribute('style', 'color:inherit;text-decoration:underline');
    a.textContent = TEL;
    p.appendChild(a);
    return p;
  }

  function paintFooter() {
    var f = document.querySelector('footer.byf-footer');
    if (!f) return;
    var old = f.querySelector('.byf-footer-factory');
    if (old) {
      if (old.getAttribute('data-lang') === (zhNow() ? 'zh' : 'en')) return;
      old.parentNode.removeChild(old);
    }
    var cell = f.firstElementChild && f.firstElementChild.firstElementChild;
    if (!cell || !cell.querySelector('h2')) return;
    cell.appendChild(footerLine());
  }

  var H3 = 'margin:0 0 6px;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:#596b60';
  var P = 'margin:6px 0 0;font-size:14.5px;line-height:1.65;color:#3d5248';
  var SM = 'margin:6px 0 0;font-size:13px;line-height:1.6;color:#6a7b70';

  function blockMarkup(where) {
    var zh = zhNow();
    var eyebrow = zh ? '\u5de5\u5382\u4e0e\u76f4\u63a5\u8054\u7cfb' : 'FACTORY &amp; DIRECT CONTACT';
    var title = zh ? '\u76f4\u63a5\u8054\u7cfb\u5de5\u5382' : 'Talk to the factory directly';
    var telNote = zh ? '\u7535\u8bdd\u54a8\u8be2\uff0c\u4e2d\u82f1\u6587\u5747\u53ef\u3002' : 'Call us. English and Chinese.';
    var addrMain = zh ? ZH_ADDR : EN_ADDR;
    var addrAlt = zh ? ('English: ' + EN_ADDR) : ('\u4e2d\u6587\u5730\u5740\uff1a' + ZH_ADDR);
    var thirdH, thirdP, thirdS;
    if (where === 'contact') {
      thirdH = zh ? '\u5230\u5382\u770b\u6837' : 'Factory visits';
      thirdP = zh ? '\u5468\u4e00\u5230\u5468\u516d\u53ef\u9884\u7ea6\u5230\u5382\uff0c\u51fa\u53d1\u524d\u628a\u65e5\u671f\u548c\u60f3\u770b\u7684\u578b\u53f7\u53d1\u7ed9\u6211\u4eec\u3002'
                  : 'Visits by appointment, Monday to Saturday. Send the date and the models you want to see before you travel.';
      thirdS = zh ? '\u6df1\u5733\u4ea4\u8d27\uff08FOB Shenzhen\uff09\u3002' : 'FOB Shenzhen.';
    } else {
      thirdH = zh ? '\u751f\u4ea7\u4e0e\u9a8c\u8d27' : 'Production &amp; inspection';
      thirdP = zh ? '\u6ce8\u5851\u4e0e\u7845\u80f6\u5728\u540c\u4e00\u56ed\u533a\uff0c\u6837\u54c1\u4e0e\u6279\u91cf\u5728\u540c\u4e00\u5957\u6d41\u7a0b\u91cc\u8ddf\u8fdb\u3002'
                  : 'Injection moulding and silicone sit in the same industrial zone, so samples and bulk run through one workflow.';
      thirdS = zh ? '\u62a5\u4ef7\u6309\u578b\u53f7\u3001\u6570\u91cf\u4e0e\u5de5\u827a\u786e\u8ba4\u3002' : 'Quotes are confirmed by model, quantity and process.';
    }
    return '<p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;font-weight:700;text-transform:uppercase;color:#596b60">' + eyebrow + '</p>'
      + '<h2 id="factory-contact-title" style="margin:0 0 18px;font-size:24px;line-height:1.3">' + title + '</h2>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px 30px">'
      + '<div><h3 style="' + H3 + '">' + (zh ? '\u7535\u8bdd / Telephone' : 'Telephone') + '</h3>'
      + '<a href="tel:+8613059173747" style="display:inline-block;margin:2px 0 0;font-size:20px;font-weight:700;color:#173d35;text-decoration:none">' + TEL + '</a>'
      + '<p style="' + P + '">' + telNote + '</p></div>'
      + '<div><h3 style="' + H3 + '">' + (zh ? '\u5de5\u5382\u5730\u5740' : 'Factory address') + '</h3>'
      + '<p style="' + P + '">' + addrMain + '</p><p style="' + SM + '">' + addrAlt + '</p></div>'
      + '<div><h3 style="' + H3 + '">' + thirdH + '</h3><p style="' + P + '">' + thirdP + '</p><p style="' + SM + '">' + thirdS + '</p></div>'
      + '</div>';
  }

  function paintBlock() {
    var path = curPath();
    var where = null;
    if (/\/contact\/$/.test(path)) where = 'contact';
    else if (/\/factory\/$/.test(path)) where = 'factory';
    if (!where) return;
    if (document.querySelector('.factory-contact-block')) return;
    var main = document.querySelector('main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.className = 'factory-contact-block';
    sec.id = 'factory-contact-block';
    sec.setAttribute('aria-labelledby', 'factory-contact-title');
    sec.setAttribute('style', 'max-width:1248px;margin:36px auto 8px;padding:26px 28px;border:1px solid #dfe5dd;border-radius:16px;background:#f7f9f4');
    sec.innerHTML = blockMarkup(where);
    var anchor = where === 'contact'
      ? main.querySelector('#buyer-decision-rewrite')
      : (main.querySelector('.bx-brief-strip') ? main.querySelector('.bx-brief-strip').parentNode : null);
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else main.appendChild(sec);
  }

  function paint() { paintFooter(); paintBlock(); }

  var queued = false;
  function schedule() { if (queued) return; queued = true; setTimeout(function () { queued = false; paint(); }, 140); }
  try { new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  document.addEventListener('boom:client-ready', schedule);
  window.addEventListener('load', schedule);
  window.addEventListener('popstate', schedule);
  schedule();
  [400, 1200, 2600].forEach(function (t) { setTimeout(paint, t); });
})();
