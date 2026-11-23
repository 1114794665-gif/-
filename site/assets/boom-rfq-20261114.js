/* BOOM RFQ 2026-11-14 — 四页共用的项目询盘组件
   字段：类别 / 型号 / 数量 / 材质 / 定制要求 / 图稿 / 目的国 / 交期 / 邮箱 / 电话 / 项目说明
   复用既有 /api/enquiries：一次性令牌、幂等键、邮件通知、附件存储都不变。 */
(function () {
  'use strict';
  if (window.__boomRfqLoaded) return;
  window.__boomRfqLoaded = 1;

  var MAX_FILE = 10 * 1024 * 1024;
  var MAX_TOTAL = 25 * 1024 * 1024;
  var OK_EXT = /\.(pdf|png|jpe?g|webp|dxf|dwg|step|stp)$/i;

  function zh() { return /^\/(zh\/)?/.test(location.pathname) && location.pathname.indexOf('/zh/') === 0; }
  var T = zh() ? {
    kicker: '项目询盘',
    title: '把型号、数量和交期一次说清',
    lead: '填完这张表，报价就按你的实际项目来算，不用来回追问基础信息。',
    list: ['按型号报价，不套一个「大概价」', '图稿可随询盘一起上传，直接进打样评审', '邮件同步给项目负责人，附询盘编号'],
    meta: '附件：单个文件 10MB 以内，合计 25MB 以内；支持 PDF、PNG、JPG、WEBP、DXF、DWG、STEP。',
    f_category: '产品类别', f_sku: '型号 / 规格', f_qty: '目标数量', f_material: '材质偏好',
    f_custom: '定制要求', f_files: '图稿 / 参考文件', f_country: '目的国家', f_date: '要求交期',
    f_email: '邮箱', f_phone: '电话', f_brief: '项目说明', f_name: '联系人（选填）',
    opt_any: '还不确定', opt_pp: 'PP', opt_ps: 'PS', opt_pet: 'PET', opt_acrylic: '亚克力', opt_tritan: 'Tritan', opt_silicone: '硅胶',
    files_hint: '单个 10MB · 合计 25MB',
    sample: '先寄样品确认（打样费与运费按报价单确认）',
    submit: '提交项目询盘',
    sending: '正在上传并提交…',
    ok: '已收到，询盘编号：',
    oknote: '邮件已同步给项目负责人。',
    err_files: '请检查附件：单个 10MB、合计 25MB 以内，格式限 PDF/PNG/JPG/WEBP/DXF/DWG/STEP。',
    err_required: '请填写邮箱和项目说明。',
    err: '提交未确认，请重试；已填内容和附件会保留。',
    required: '必填'
  } : {
    kicker: 'PROJECT ENQUIRY',
    title: 'Model, quantity and date — in one pass',
    lead: 'Fill this once and the quotation is built around your actual project, not a generic price list.',
    list: ['Priced by model, not by a vague "from" figure', 'Artwork uploads go straight into the sample review', 'The project owner is copied by email with your reference'],
    meta: 'Attachments: 2 MB each, 5 MB total. PDF, PNG, JPG, WEBP, DXF, DWG, STEP.',
    f_category: 'Product category', f_sku: 'SKU / model', f_qty: 'Target quantity', f_material: 'Material preference',
    f_custom: 'Customization requirements', f_files: 'Artwork / reference file', f_country: 'Destination country', f_date: 'Required delivery date',
    f_email: 'Email', f_phone: 'Phone', f_brief: 'Project brief', f_name: 'Contact name (optional)',
    opt_any: 'Not sure yet', opt_pp: 'PP', opt_ps: 'PS', opt_pet: 'PET', opt_acrylic: 'Acrylic', opt_tritan: 'Tritan', opt_silicone: 'Silicone',
    files_hint: '2 MB each · 5 MB total',
    sample: 'Send a sample first (sample and freight cost confirmed in the quotation)',
    submit: 'Send project enquiry',
    sending: 'Uploading and submitting…',
    ok: 'Received. Your reference: ',
    oknote: 'The project owner has been notified by email.',
    err_files: 'Check the attachments: 2 MB each, 5 MB total, PDF/PNG/JPG/WEBP/DXF/DWG/STEP only.',
    err_required: 'Add an email address and a project brief.',
    err: 'Receipt not confirmed. Please retry; your entries and files are kept.',
    required: 'required'
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function track(name, params) {
    try {
      if (typeof window.__evercupTrack === 'function') { window.__evercupTrack(name, params || {}); return; }
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('evercup:measurement-observed', { detail: { event: name } })); } catch (e) {}
  }

  function mount(section) {
    if (!section || section.getAttribute('data-rfq-mounted') === '1') return;
    section.setAttribute('data-rfq-mounted', '1');
    var cat = section.getAttribute('data-category') || '';
    var sku = section.getAttribute('data-sku') || '';
    var cats = (section.getAttribute('data-categories') || '').split('|').filter(Boolean);

    var options = cats.map(function (c) {
      return '<option value="' + esc(c) + '"' + (c === cat ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    section.className = 'boom-rfq';
    section.innerHTML =
      '<div class="boom-rfq__inner">' +
        '<div>' +
          '<p class="boom-rfq__kicker">' + esc(T.kicker) + '</p>' +
          '<h2 class="boom-rfq__title">' + esc(T.title) + '</h2>' +
          '<p class="boom-rfq__lead">' + esc(T.lead) + '</p>' +
          '<ul class="boom-rfq__list">' + T.list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          '<p class="boom-rfq__meta">' + esc(T.meta) + '</p>' +
        '</div>' +
        '<div class="boom-rfq__card">' +
          '<form class="boom-rfq__form" novalidate>' +
            '<div class="boom-rfq__grid">' +
              '<label><span>' + esc(T.f_category) + '</span><select name="category">' + options + '</select></label>' +
              '<label><span>' + esc(T.f_sku) + '</span><input type="text" name="sku" value="' + esc(sku) + '" maxlength="120" placeholder="BT-016 / HJB-073"></label>' +
              '<label><span>' + esc(T.f_qty) + '</span><input type="number" name="quantity" min="1" step="1" inputmode="numeric" placeholder="500"></label>' +
              '<label><span>' + esc(T.f_material) + '</span><select name="material">' +
                '<option value="">' + esc(T.opt_any) + '</option>' +
                '<option>PP</option><option>PS</option><option>PET</option>' +
                '<option value="Acrylic">' + esc(T.opt_acrylic) + '</option>' +
                '<option>Tritan</option><option value="Silicone">' + esc(T.opt_silicone) + '</option>' +
              '</select></label>' +
              '<label class="boom-rfq__full"><span>' + esc(T.f_custom) + '</span><textarea name="customization" rows="2" maxlength="600"></textarea></label>' +
              '<label class="boom-rfq__full boom-rfq__files"><span>' + esc(T.f_files) + '</span>' +
                '<input type="file" name="attachments" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.dxf,.dwg,.step,.stp">' +
                '<small>' + esc(T.files_hint) + '</small></label>' +
              '<label><span>' + esc(T.f_country) + '</span><input type="text" name="country" autocomplete="country-name" maxlength="80"></label>' +
              '<label><span>' + esc(T.f_date) + '</span><input type="date" name="deliveryDate"></label>' +
              '<label><span>' + esc(T.f_email) + ' *</span><input type="email" name="email" autocomplete="email" required maxlength="200"></label>' +
              '<label><span>' + esc(T.f_phone) + '</span><input type="tel" name="phone" autocomplete="tel" maxlength="40"></label>' +
              '<label class="boom-rfq__full"><span>' + esc(T.f_brief) + ' *</span><textarea name="message" rows="3" required maxlength="2000" placeholder="' + esc(zh() ? '用途、包装要求、预算区间或任何必须满足的条件' : 'Use, packing requirements, budget range or anything that must be met') + '"></textarea></label>' +
              '<label class="boom-rfq__full"><span>' + esc(T.f_name) + '</span><input type="text" name="name" autocomplete="name" maxlength="100"></label>' +
              '<label class="boom-rfq__sample boom-rfq__full"><input type="checkbox" name="sampleRequest" value="1"><span>' + esc(T.sample) + '</span></label>' +
              '<label class="boom-rfq__honey" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
            '</div>' +
            '<div class="boom-rfq__actions"><button type="submit" class="boom-rfq__submit">' + esc(T.submit) + ' →</button></div>' +
            '<p class="boom-rfq__status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</div>';

    var form = section.querySelector('form');
    var status = section.querySelector('.boom-rfq__status');
    var btn = section.querySelector('.boom-rfq__submit');
    var busy = false;
    var idem = null;

    // rfq_form_view：整块进入视口只记一次
    var seen = false;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!seen && en.isIntersecting && en.intersectionRatio > 0.35) {
            seen = true;
            track('rfq_form_view', {});
            io.disconnect();
          }
        });
      }, { threshold: [0.35, 0.6] });
      io.observe(section);
    }

    form.addEventListener('input', function () { if (idem === null) idem = null; });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (busy) return;
      var fd = new FormData(form);
      var files = fd.getAll('attachments').filter(function (f) { return typeof f !== 'string' && f.size; });
      fd.delete('attachments');
      var total = files.reduce(function (n, f) { return n + f.size; }, 0);
      if (files.some(function (f) { return f.size > MAX_FILE || !OK_EXT.test(f.name); }) || total > MAX_TOTAL) {
        status.setAttribute('data-state', 'error'); status.textContent = T.err_files; return;
      }
      if (!fd.get('email') || String(fd.get('email')).indexOf('@') < 1 || !fd.get('message')) {
        status.setAttribute('data-state', 'error'); status.textContent = T.err_required; return;
      }
      files.forEach(function (f) { fd.append('attachments', f, f.name); });
      fd.set('productInterest', (fd.get('sku') || fd.get('category') || 'Project enquiry'));
      fd.set('locale', zh() ? 'zh' : 'en');
      fd.set('sourcePath', location.pathname);
      fd.set('pageUrl', location.origin + location.pathname);
      if (!idem) idem = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

      busy = true; btn.disabled = true;
      var label = btn.textContent; btn.textContent = T.sending;
      status.removeAttribute('data-state'); status.textContent = T.sending;
      try {
        var sres = await fetch('/api/enquiries/session', { cache: 'no-store' });
        var sj = await sres.json();
        if (!sres.ok || !sj.token) throw new Error('NO_TOKEN');
        var res = await fetch('/api/enquiries', {
          method: 'POST', body: fd,
          headers: { 'X-Enquiry-Token': sj.token, 'Idempotency-Key': idem },
          signal: AbortSignal.timeout(120000)
        });
        var out = await res.json();
        if (!res.ok || !out.ok) throw new Error(out.code || 'FAILED');
        status.setAttribute('data-state', 'ok');
        status.textContent = T.ok + out.id + ' · ' + T.oknote;
        form.querySelectorAll('input,select,textarea,button').forEach(function (el) { el.disabled = true; });
        track('rfq_received', { modelCount: fd.get('sku') ? 1 : 0 });
        if (fd.get('sampleRequest')) track('sample_request', {});
      } catch (err) {
        status.setAttribute('data-state', 'error');
        status.textContent = T.err;
        track('rfq_failed', {});
        btn.disabled = false; btn.textContent = label;
      } finally {
        busy = false;
      }
    });
  }

  var ROUTES = {
    '/custom-ice-buckets/': { cat: 'Custom ice buckets', sku: '', zh: '定制冰桶',
      cats: 'Custom ice buckets|LED light-up cups|Tasting cups for events|Wine tasting accessories|Bar accessories' },
    '/led-light-up-cups/': { cat: 'LED light-up cups', sku: '', zh: 'LED 发光杯',
      cats: 'LED light-up cups|Custom ice buckets|Tasting cups for events|Wine tasting accessories|Bar accessories' },
    '/tasting-events-drinkware/': { cat: 'Tasting cups for events', sku: '', zh: '品鉴活动杯具',
      cats: 'Tasting cups for events|Wine tasting accessories|Custom ice buckets|LED light-up cups|Bar accessories' },
    '/wine-tasting-accessories/': { cat: 'Wine tasting accessories', sku: 'BT-016 / HJB-073 / BPJJ-004', zh: '品酒配件',
      cats: 'Wine tasting accessories|Tasting cups for events|Custom ice buckets|LED light-up cups|Bar accessories' }
  };
  var ZH_CATS = '定制冰桶|LED 发光杯|品鉴活动杯具|品酒配件|酒具配件';

  function routeKey() {
    var p = location.pathname;
    if (p.indexOf('/zh/') === 0) p = p.slice(3);
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  function ensureMount() {
    var cfg = ROUTES[routeKey()];
    if (!cfg) return null;
    var el = document.getElementById('boom-rfq');
    if (el) return el;
    el = document.createElement('section');
    el.id = 'boom-rfq';
    el.setAttribute('data-boom-rfq', '');
    el.setAttribute('data-category', zh() ? cfg.zh : cfg.cat);
    el.setAttribute('data-sku', cfg.sku);
    el.setAttribute('data-categories', zh() ? ZH_CATS : cfg.cats);
    var anchor = document.querySelector('section.ec-internal-links') || document.querySelector('footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor);
    else (document.querySelector('main') || document.body).appendChild(el);
    return el;
  }

  function scan() {
    var el = ensureMount();
    if (el) mount(el);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
  // React 重画整页时重新挂载
  var mo = new MutationObserver(function () { scan(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  [900, 2200, 4000].forEach(function (t) { setTimeout(scan, t); });
})();
