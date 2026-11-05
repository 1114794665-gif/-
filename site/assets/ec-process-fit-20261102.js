/* 器皿×工艺 适配表 运行时补丁 2026-11-02
   React 会整页重画，静态表会被抹掉。这里按标题定位、把表重新插回去。 */
(function(){
  var ROWS=[{"key":"pint","zh":{"type":"啤酒杯 / 品脱杯","mat":"PP · PS · PC · Tritan","best":["丝印","热转印","变色油墨"],"ok":["UV 打印","水转印"],"note":"直身锥形最好上版。PP 印前要过一道火焰处理，不过这一道，墨一擦就掉。"},"en":{"type":"Beer & pint cups","mat":"PP · PS · PC · Tritan","best":["Screen print","Heat transfer","Colour-change ink"],"ok":["UV print","Hydro dip"],"note":"The straight taper takes a screen cleanly. PP goes through a flame pass first — skip it and the ink lifts with a thumb."}},{"key":"handled","zh":{"type":"带手柄杯 / 大把杯","mat":"PC · PP","best":["丝印","水转印"],"ok":["UV 打印","变色油墨"],"note":"手柄挡住丝网，印刷区只能落在柄的两侧；要整只包覆只能走水转印。"},"en":{"type":"Handled mugs & steins","mat":"PC · PP","best":["Screen print","Hydro dip"],"ok":["UV print","Colour-change ink"],"note":"The handle blocks the screen, so print lands either side of it. For a full wraparound, hydro dip is the only route."}},{"key":"stemmed","zh":{"type":"高脚杯（红酒杯 / 香槟杯 / 马天尼）","mat":"Acrylic · PS · PET · Tritan","best":["丝印","激光雕刻"],"ok":["UV 打印","热转印","变色油墨"],"note":"亚克力打激光出来是磨砂白，是这类杯最干净的一种标。柄上不印，只印杯身。"},"en":{"type":"Stemmed wine, champagne & cocktail","mat":"Acrylic · PS · PET · Tritan","best":["Screen print","Laser engraving"],"ok":["UV print","Heat transfer","Colour-change ink"],"note":"A laser on acrylic leaves a frosty white mark — the cleanest logo these shapes take. Print goes on the bowl, never the stem."}},{"key":"shot","zh":{"type":"烈酒杯 / 子弹杯","mat":"PS · Acrylic · PP","best":["丝印","UV 打印"],"ok":["激光雕刻","变色油墨"],"note":"杯身矮，环印放不下整幅图，建议单色标或小尺寸图。"},"en":{"type":"Shot & shooter glasses","mat":"PS · Acrylic · PP","best":["Screen print","UV print"],"ok":["Laser engraving","Colour-change ink"],"note":"Short body: there is no room for a full wrap. One colour or a small mark works better than a big graphic."}},{"key":"tumbler","zh":{"type":"随行杯 / 双层吸管杯","mat":"Acrylic · PP · Tritan · PC","best":["热转印","UV 打印"],"ok":["丝印","激光雕刻"],"note":"整圈满印走热转印。双层杯只能印外层，夹层印不了。"},"en":{"type":"Tumblers & double-wall straw cups","mat":"Acrylic · PP · Tritan · PC","best":["Heat transfer","UV print"],"ok":["Screen print","Laser engraving"],"note":"A full wrap is heat transfer work. On a double wall only the outside can be printed — never between the walls."}},{"key":"shaped","zh":{"type":"异形杯（棒球棒杯 / 鱼缸杯 / 球面杯）","mat":"PP · PS · Acrylic","best":["水转印"],"ok":["UV 打印","变色油墨"],"note":"曲面太急，丝印和热转印都上不了版；只有水转印能把一整只包住。"},"en":{"type":"Shaped cups (bat, fishbowl, sphere)","mat":"PP · PS · Acrylic","best":["Hydro dip"],"ok":["UV print","Colour-change ink"],"note":"The curvature is too tight for a screen or a transfer. Only hydro dipping wraps the whole body."}},{"key":"colourchange","zh":{"type":"变色杯（遇冷 / 遇热）","mat":"PP · PS","best":["变色油墨"],"ok":["丝印（打底）","UV 打印"],"note":"先打白底再盖温变墨，两层都得烤干。素色杯身做不了，得留印刷位。"},"en":{"type":"Colour-change cups (cold or heat)","mat":"PP · PS","best":["Colour-change ink"],"ok":["Screen print (base)","UV print"],"note":"A white base goes down first, then the thermochromic layer, and both are cured. A plain moulded body cannot change colour — it needs printed area."}},{"key":"silicone","zh":{"type":"硅胶杯（直身 / 大肚 / 带柄啤酒桶）","mat":"硅胶 · 模压厚件","best":["模压成型色","模内立体字"],"ok":["硅胶丝印 / 移印"],"note":"硅胶的颜色是长在料里的，不是印上去的。要印得用硅胶专用油墨，印完再烘一遍定型。"},"en":{"type":"Silicone cups (pint, stein, barrel)","mat":"Silicone · compression moulded","best":["Colour in the material","Moulded-in 3D logo"],"ok":["Silicone screen / pad print"],"note":"Silicone takes its colour in the material, not on the surface. Printing needs a silicone-specific ink and a second heat cure."}},{"key":"collapsible","zh":{"type":"折叠硅胶杯","mat":"硅胶 + 尼龙 / 钢圈","best":["模压成型色"],"ok":["硅胶移印（避开折痕）"],"note":"折痕位置印上去，折两次就裂。只能印在杯身那圈平整的平台上。"},"en":{"type":"Collapsible silicone cups","mat":"Silicone + nylon ring","best":["Colour in the material"],"ok":["Silicone pad print (away from folds)"],"note":"Ink on a fold cracks after a couple of collapses. Print only on the flat band of the body."}},{"key":"siliconetumbler","zh":{"type":"硅胶随行杯 / 硅胶烈酒杯","mat":"硅胶（含盖与吸管）","best":["模压成型色","模内立体字"],"ok":["硅胶丝印"],"note":"盖子和吸管可以另配颜色凑一套。小件上不了大面积印刷，标要小、要简。"},"en":{"type":"Silicone tumblers & shot cups","mat":"Silicone, with lid and straw","best":["Colour in the material","Moulded-in 3D logo"],"ok":["Silicone screen print"],"note":"Lids and straws can be moulded in a second colour to make a set. Small parts take no large print — keep the mark small and simple."}}];
  var COPY={"en":{"kicker":"PROCESS FIT / BY BODY TYPE","h2":"Which decoration fits which cup","sub":"Ten body types, seven processes. Solid means we recommend it for that shape — best cost, best yield. Outline means it can be done, with the caveat in the last column. Anything not listed does not hold up in use, so we will not quote it.","legendBest":"Recommended","legendOk":"Possible, with a caveat","th1":"Body type","th2":"Body material","th3":"Decoration that fits","th4":"What decides it","foot":"Every body type on this page is our own mould, moulded and decorated in our own plant — so the entry is 10 pcs, plain or printed, one colour or many. Screens and ink matching are charged as setup on top of the unit price, never as a minimum order.","footLink":"See the four order tiers","footHref":"/customization/"},"zh":{"kicker":"工艺适配 / 按器型分","h2":"这个杯型能上哪些工艺","sub":"十种器型，七种工艺。实心是我们推荐的——成本和成品率都最好；空心是能做、但有前提，前提写在最后一列。没列的工艺就是实际用起来撑不住，我们不报。","legendBest":"推荐","legendOk":"可做，有前提","th1":"器型","th2":"材质","th3":"能上的工艺","th4":"为什么","foot":"这张表上的器型都是我们自己的模具、自己注塑或模压、自己印——所以起订量 10 件，素杯或印刷、单色或多色都一样。版费和调墨费按一次性费用单收，不拿来当起订门槛。","footLink":"看四档起订量怎么算","footHref":"/zh/customization/"}};
  var ANCHORS={
    plastic:{en:'Common questions',zh:'让定制要求变得具体'},
    silicone:{en:'Common questions',zh:'下单前真正要核的几件事'}
  };
  function lang(){return (document.documentElement.lang||'').toLowerCase().indexOf('zh')===0?'zh':'en';}
  function which(){
    var p=location.pathname;
    if(p.indexOf('/custom-plastic-cups')>=0)return 'plastic';
    if(p.indexOf('/custom-silicone-cups')>=0)return 'silicone';
    return null;
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function body(L){return ROWS.map(function(r){var d=r[L];
    var chips=d.best.map(function(x){return '<span class="pf-chip pf-chip-best">'+esc(x)+'</span>';}).join('')
             +d.ok.map(function(x){return '<span class="pf-chip pf-chip-ok">'+esc(x)+'</span>';}).join('');
    return '<div class="pf-row"><div class="pf-cell pf-cell-type"><b>'+esc(d.type)+'</b><span>'+esc(d.mat)+'</span></div><div class="pf-cell pf-cell-chips">'+chips+'</div><p class="pf-note">'+esc(d.note)+'</p></div>';
  }).join('');}
  function build(L){var c=COPY[L];
    return '<div class="pf-wrap"><p class="pf-kicker">'+esc(c.kicker)+'</p><h2 class="pf-h2">'+esc(c.h2)+'</h2><p class="pf-sub">'+esc(c.sub)+'</p>'
      +'<div class="pf-legend"><span class="pf-chip pf-chip-best">'+esc(c.legendBest)+'</span><span class="pf-chip pf-chip-ok">'+esc(c.legendOk)+'</span></div>'
      +'<div class="pf-grid"><div class="pf-row pf-head"><div class="pf-cell pf-cell-type">'+esc(c.th1)+'</div><div class="pf-cell pf-cell-chips">'+esc(c.th3)+'</div><p class="pf-note">'+esc(c.th4)+'</p></div>'
      +body(L)+'</div><p class="pf-foot">'+esc(c.foot)+' <a href="'+c.footHref+'">'+esc(c.footLink)+' →</a></p></div>';
  }
  function inject(){
    var key=which(); if(!key)return;
    if(document.querySelector('.pf-sec'))return;
    var want=ANCHORS[key][lang()];
    var h2s=document.querySelectorAll('h2'),target=null;
    for(var i=0;i<h2s.length;i++){if((h2s[i].textContent||'').indexOf(want)>=0){target=h2s[i];break;}}
    if(!target)return;
    var host=target.closest('section')||target;
    var sec=document.createElement('section');
    sec.className='pf-sec'; sec.setAttribute('data-pf','1');
    sec.innerHTML=build(lang());
    host.parentNode.insertBefore(sec,host);
  }
  function boot(){
    inject();
    var root=document.getElementById('root');
    if(root&&window.MutationObserver){
      var mo=new MutationObserver(function(){ if(!document.querySelector('.pf-sec')) inject(); });
      mo.observe(root,{childList:true,subtree:true});
      setTimeout(function(){mo.disconnect();},12000);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
