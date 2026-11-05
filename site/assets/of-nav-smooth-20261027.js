/* of-nav smooth behaviour — 20261027
   Desktop: hover opens dropdown, small close delay, summary click disabled.
   Mobile (<=1023px): untouched (native details tap).

   2026-10-30 修：原来只在页面首次加载时挂一次。浏览器后退回来时导航被重新渲染，
   data-of-smooth 标记和悬停行为都会丢 —— 等于把上一版的设置退回去了。
   现在：首次加载 / 后退(popstate) / 从缓存恢复(pageshow) / 切回标签页 都会重挂一次，
   并对导航内部新增节点做监听；已挂过的节点用 __ofBound 打标，不会重复绑定。 */
(function(){
  'use strict';
  function bind(nav){
    var mq=window.matchMedia('(min-width:1024px)');
    var timer=null;
    nav.querySelectorAll('details').forEach(function(d){
      if(d.dataset.ofSmooth) return;
      d.dataset.ofSmooth='1';
      var sum=d.querySelector('summary');
      d.addEventListener('mouseenter',function(){
        if(!mq.matches) return;
        clearTimeout(timer);
        nav.querySelectorAll('details[open]').forEach(function(o){ if(o!==d) o.removeAttribute('open'); });
        d.setAttribute('open','');
      });
      d.addEventListener('mouseleave',function(){
        if(!mq.matches) return;
        clearTimeout(timer);
        timer=setTimeout(function(){ d.removeAttribute('open'); },140);
      });
      if(sum) sum.addEventListener('click',function(e){
        if(mq.matches) e.preventDefault(); /* desktop: hover only */
      });
    });
  }

  function init(){
    var nav=document.querySelector('.of-nav');
    if(!nav) return;
    bind(nav);
    if(nav.__ofBound!==true){
      nav.__ofBound=true;
      if(typeof MutationObserver==='function'){
        new MutationObserver(function(){ bind(nav); }).observe(nav,{childList:true,subtree:true});
      }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  /* 后退回来 / 从缓存恢复 / 切回标签页 —— 这几种情况 DOM 常被重建，必须重挂 */
  window.addEventListener('pageshow',init);
  window.addEventListener('popstate',init);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) init(); });

  /* 兜底：正文由脚本现场渲染，前几秒可能在反复替换导航节点 */
  var n=0, t=setInterval(function(){ init(); if(++n>12) clearInterval(t); },600);
})();
