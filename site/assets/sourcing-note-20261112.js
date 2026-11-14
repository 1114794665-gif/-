(function(){
  var ROUTES=["/products/4in1-multipurpose-cocktail-mortar/", "/products/boston-shaker-kit/", "/products/champagne-stopper-with-plating-painting/", "/products/champagne-stopper/", "/products/christmas-silicone-bottle-cap-opener/",  "/products/engraved-wine-bottle-opener/", "/products/goose-head-manual-wine-opener/", "/products/hydaway-collapsible-pint/", "/products/keychain-bottle-opener/", "/products/metal-beer-opener/", "/products/metal-pocket-bottle-opener/", "/products/poker-card-bottle-opener/",  "/products/stainless-steel-credit-card-bottle-opener/", "/products/wing-corkscrew/"];
  var EN="Sourcing note: the metal parts on this model are sourced from vetted partner suppliers. Plastic and silicone parts are made in our own injection-moulding and silicone presses. We do not manufacture metal parts in-house.", ZH="配套说明：本型号的金属配件由合作供应商外购配套；塑料件与硅胶件为自有工厂注塑、模压生产。金属件非本厂自产。";
  var path=location.pathname.replace(/^\/zh/,'');
  if(ROUTES.indexOf(path)<0) return;
  function add(){
    if(document.querySelector('.byf-sourcing-note')) return true;
    var a=document.querySelector('dl.bx-spec-pills')||document.querySelector('h1');
    if(!a) return false;
    var p=document.createElement('p');
    p.className='byf-sourcing-note';
    p.setAttribute('style','display:block;width:100%;margin:14px 0;padding:10px 14px;border-left:3px solid #0b63c5;background:#f4f8fd;font-size:14px;line-height:1.6');
    p.textContent=/^\/zh\//.test(location.pathname)?ZH:EN;
    a.insertAdjacentElement('afterend',p);
    return true;
  }
  var t,mo;
  function schedule(){ clearTimeout(t); t=setTimeout(function(){ if(add()) mo.disconnect(); },700); }
  mo=new MutationObserver(schedule);
  mo.observe(document.documentElement,{childList:true,subtree:true});
  schedule();
  setTimeout(function(){ add(); mo.disconnect(); },12000);
})();
