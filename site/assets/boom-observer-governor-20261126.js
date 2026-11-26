/* boom-observer-governor-20261126
 * 全站观察者节流阀。
 * 站内有一批补丁脚本用 MutationObserver 监听整页、又在回调里回写页面，
 * 彼此互相触发会形成死循环（实测每页每秒数千次 DOM 写入，导致整页抽搐）。
 * 这里统一收口：同一时刻只允许一个回调排队执行、两次执行至少间隔 70ms；
 * 页面稳定后自动断开所有观察，用户点击/切页时再短暂重开。
 */
(function () {
  'use strict';
  var W = window;
  var Native = W.MutationObserver;
  if (!Native || Native.__boomGoverned) return;

  var GAP = 70;          // 两次回调之间的最小间隔
  var regs = [];

  function isLive() { return W.__boomMoLive !== false; }

  function Patched(cb) {
    var inst = new Native(function (muts, ob) {
      if (!isLive()) return;
      if (inst.__q) return;          // 已有一次排队，丢弃本次（回调都是全量扫描）
      inst.__q = 1;
      setTimeout(function () {
        inst.__q = 0;
        if (!isLive()) return;
        try { cb.call(inst, muts, ob); } catch (e) {}
      }, GAP);
    });
    var rawObserve = inst.observe;
    var rawDisconnect = inst.disconnect;

    inst.observe = function (t, o) {
      inst.__t = t;
      inst.__o = o;
      if (!inst.__tracked) { inst.__tracked = 1; regs.push(inst); }
      inst.__on = true;
      return rawObserve.call(inst, t, o);
    };
    inst.disconnect = function () {
      inst.__on = false;
      return rawDisconnect.call(inst);
    };
    return inst;
  }
  Patched.prototype = Native.prototype;

  try {
    Object.defineProperty(W, 'MutationObserver', {
      configurable: true, writable: true, value: Patched
    });
  } catch (e) { W.MutationObserver = Patched; }
  try { Patched.__boomGoverned = true; } catch (e) {}

  function setLive(on) {
    W.__boomMoLive = !!on;
    for (var i = 0; i < regs.length; i++) {
      var m = regs[i];
      if (!m.__t) continue;
      if (on) {
        if (!m.__on) {
          m.__on = true;
          try { Native.prototype.observe.call(m, m.__t, m.__o); } catch (e) {}
        }
      } else if (m.__on) {
        m.__on = false;
        try { Native.prototype.disconnect.call(m); } catch (e) {}
        try { if (m.takeRecords) m.takeRecords(); } catch (e) {}
      }
    }
  }

  var pulseTimer = 0;
  function pulse(ms) {
    setLive(true);
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(function () { setLive(false); }, ms || 1500);
  }

  W.__boomMoLive = true;

  document.addEventListener('click', function () { pulse(1500); }, true);
  document.addEventListener('submit', function () { pulse(1800); }, true);
  W.addEventListener('popstate', function () { pulse(1600); });
  W.addEventListener('hashchange', function () { pulse(1600); });
  document.addEventListener('boom:client-ready', function () {
    pulse(1800);
  });
  W.addEventListener('load', function () {
    setTimeout(function () { setLive(false); }, 4000);
  });
  setTimeout(function () { setLive(false); }, 7000);   // 兜底
})();
