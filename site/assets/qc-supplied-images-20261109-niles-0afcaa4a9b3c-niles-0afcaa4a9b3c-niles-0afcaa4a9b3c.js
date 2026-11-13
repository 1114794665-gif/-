(function(){
 function update(){
  if(!/^\/oem-manufacturer\/?$/.test(location.pathname))return;
  const cards=document.querySelectorAll('.of-factory-grid .oemx-card');
  const descriptions=['Material and specification workflow illustration supplied by the site owner; displayed dimensions are illustrative','Artwork and sample approval workflow illustration supplied by the site owner'];
  for(let i=0;i<2;i++){
   const img=cards[i]?.querySelector('figure img'),figure=img?.closest('figure');if(!img)continue;
   const src='/img/oem-review-supplied-20261109/qc-workflow-reference.png';
   if(img.getAttribute('src')!==src)img.setAttribute('src',src);
   if(img.alt!==descriptions[i])img.alt=descriptions[i];
   if(!figure.classList.contains('qc-supplied-crop'))figure.classList.add('qc-supplied-crop');
   if(figure.dataset.panel!==String(i))figure.dataset.panel=String(i);
  }
  const grid=document.querySelector('.of-factory-grid .oemx-cards');
  if(grid&&!grid.parentElement.querySelector('.qc-supplied-caption')){const p=document.createElement('p');p.className='qc-supplied-caption';p.textContent='Material and artwork visuals are workflow illustrations. Confirm the material, dimensions, finish and acceptance requirements for your selected model in the approved project specification.';grid.insertAdjacentElement('afterend',p);}
 }
 let pending=false;new MutationObserver(()=>{if(!pending){pending=true;setTimeout(()=>{pending=false;update();},80);}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);else update();
})();
