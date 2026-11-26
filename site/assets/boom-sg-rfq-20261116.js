/* BOOM — RFQ wiring for the static shot-glass pages (2026-11-16)
   The form itself is plain HTML in the page (works with JS off, readable to crawlers).
   This script only validates, uploads and posts to the existing /api/enquiries endpoint:
   one-time session token, Idempotency-Key, multipart body, same file rules as the worker
   (10 MB each, 25 MB total, pdf/png/jpg/webp/dxf/dwg/step/stp). */
(function () {
  'use strict';
  if (window.__boomSgRfq) return;
  window.__boomSgRfq = 1;

  var MAX_FILE = 10 * 1024 * 1024;
  var MAX_TOTAL = 25 * 1024 * 1024;
  var OK_EXT = /\.(pdf|png|jpe?g|webp|dxf|dwg|step|stp)$/i;
  var FILE_ERROR = 'Check the attachments: 10 MB each, 25 MB total. PDF, PNG, JPG, WEBP, DXF, DWG, STEP only.';
  var REQUIRED_ERROR = 'Add an email address so the quotation can be sent.';
  var FAIL_ERROR = 'Receipt not confirmed. Please retry — your entries and files are kept.';

  function track(name, params) {
    try { if (typeof window.__evercupTrack === 'function') { window.__evercupTrack(name, params || {}); return; } } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('evercup:measurement-observed', { detail: { event: name } })); } catch (e) {}
  }

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && el.value ? String(el.value).trim() : '';
  }

  function buildMessage(form) {
    var rows = [];
    var extra = val(form, 'message');
    if (extra) rows.push(extra);
    var pairs = form.getAttribute('data-summary') || '';
    pairs.split('|').forEach(function (pair) {
      var bits = pair.split('=');
      if (bits.length !== 2) return;
      var v = val(form, bits[1]);
      var el = form.querySelector('[name="' + bits[1] + '"]');
      if (v && el && el.type === 'select-one') {
        var opt = el.options[el.selectedIndex];
        v = opt ? (opt.textContent || v).trim() : v;
      }
      if (v) rows.push(bits[0] + ': ' + v);
    });
    var sample = form.querySelector('[name="sampleRequest"]');
    if (sample && sample.checked) rows.push('Sample requested before bulk.');
    return rows.join('\n');
  }

  function wire(form) {
    if (form.getAttribute('data-sg-wired') === '1') return;
    form.setAttribute('data-sg-wired', '1');

    var status = form.querySelector('.sg-status');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    var busy = false;
    var idem = null;

    form.addEventListener('input', function () { idem = null; });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (busy) return;

      var email = val(form, 'email');
      var message = buildMessage(form);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.setAttribute('data-state', 'error'); status.textContent = REQUIRED_ERROR;
        var em = form.querySelector('[name="email"]'); if (em) em.focus();
        return;
      }

      var fileInputs = form.querySelectorAll('input[type="file"]');
      var files = [];
      for (var i = 0; i < fileInputs.length; i++) {
        for (var j = 0; j < fileInputs[i].files.length; j++) files.push(fileInputs[i].files[j]);
      }
      var total = files.reduce(function (n, f) { return n + f.size; }, 0);
      if (files.some(function (f) { return f.size > MAX_FILE || !OK_EXT.test(f.name); }) || total > MAX_TOTAL) {
        status.setAttribute('data-state', 'error'); status.textContent = FILE_ERROR;
        return;
      }

      var fd = new FormData(form);
      /* files travel under one field name; the rest of the payload stays intact */
      var manifest = [];
      for (var k = 0; k < fileInputs.length; k++) {
        var input = fileInputs[k];
        for (var m = 0; m < input.files.length; m++) {
          manifest.push((input.getAttribute('data-label') || input.name) + ': ' + input.files[m].name);
        }
      }
      fd.delete('attachments');
      fileInputs.forEach(function (input) { fd.delete(input.name); });
      files.forEach(function (f) { fd.append('attachments', f, f.name); });
      fd.set('attachmentManifest', manifest.join(' | '));

      fd.set('message', message);
      fd.set('productInterest', form.getAttribute('data-interest') || val(form, 'category') || 'Shot glass project');
      fd.set('projectType', form.getAttribute('data-project-type') || '');
      fd.set('formPage', form.getAttribute('data-form-page') || '');
      fd.set('locale', /^\/zh(\/|$)/.test(location.pathname) ? 'zh' : 'en');
      fd.set('sourcePath', location.pathname);
      fd.set('pageUrl', location.origin + location.pathname);

      if (!idem) idem = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random();

      busy = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Uploading and sending…'; }
      status.removeAttribute('data-state');
      status.textContent = 'Uploading and sending…';
      track('rfq_submit', { page: location.pathname });

      try {
        var sres = await fetch('/api/enquiries/session', { cache: 'no-store' });
        var sj = await sres.json();
        if (!sres.ok || !sj.token) throw new Error('NO_TOKEN');

        var res = await fetch('/api/enquiries', {
          method: 'POST',
          body: fd,
          headers: { 'X-Enquiry-Token': sj.token, 'Idempotency-Key': idem },
          signal: AbortSignal.timeout(120000)
        });
        var out = await res.json();
        if (!res.ok || !out.ok) throw new Error((out && out.code) || 'FAILED');

        status.setAttribute('data-state', 'ok');
        status.textContent = 'Received. Your reference: ' + out.id + (out.duplicate ? ' (already submitted — not saved twice)' : '') +
          '. A copy of the project details is stored against that reference.';
        form.querySelectorAll('input,select,textarea,button').forEach(function (el) { el.disabled = true; });
        if (btn) btn.textContent = 'Enquiry sent';
        track('rfq_received', { reference: out.id, attachments: out.attachmentCount || 0 });
      } catch (err) {
        status.setAttribute('data-state', 'error');
        status.textContent = FAIL_ERROR;
        track('rfq_failed', { reason: String(err && err.message || err) });
        if (btn) { btn.disabled = false; btn.textContent = label; }
      } finally {
        busy = false;
      }
    });
  }

  function labelFiles(input) {
    var box = input.closest ? input.closest('.sg-file') : null;
    var name = box ? box.querySelector('.sg-file__name') : null;
    if (!name) return;
    var n = input.files ? input.files.length : 0;
    if (!n) { name.textContent = 'No file chosen'; return; }
    if (n === 1) { name.textContent = input.files[0].name; return; }
    name.textContent = n + ' files selected';
  }

  function boot() {
    var forms = document.querySelectorAll('form[data-sg-rfq]');
    for (var i = 0; i < forms.length; i++) wire(forms[i]);
    var inputs = document.querySelectorAll('.sg-file input[type="file"]');
    for (var j = 0; j < inputs.length; j++) {
      (function (input) {
        input.addEventListener('change', function () { labelFiles(input); });
      })(inputs[j]);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
