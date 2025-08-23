import { game, fmt, itemCost, prestigeAvailable, buy, buyMax, save, addGold, recompute, achievementList, doPrestige, hardReset } from './game.js';

const E = id => document.getElementById(id);
const S = sel => document.querySelector(sel);

export function pop(e, txt){
  if(!game.showPop) return;
  const host = S('#clickArea');
  const el = document.createElement('div');
  el.className='pop'; el.textContent=txt; el.style.left=(e.offsetX||host.clientWidth/2)+'px'; el.style.top=(e.offsetY||host.clientHeight/2)+'px'; el.style.transform='translate(-50%,-50%)';
  host.appendChild(el);
  el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-120%) scale(1.2)',opacity:0}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=()=>el.remove();
}

export function draw(){
  recompute();
  E('gold').textContent = fmt(game.gold);
  E('gps').textContent  = fmt(game.gps);
  E('cpc').textContent  = fmt(game.cpc);
  const add = prestigeAvailable();
  E('prestige').textContent = `프레스티지(+${add}%)`;
  E('prestige').disabled = add<=0;
  const box = E('store'); box.innerHTML='';
  game.items.forEach(it=>{
    const cost = itemCost(it);
    const div = document.createElement('div'); div.className='item';
    const info = it.type==='gen' ? `초당 +${it.dps}` : `클릭당 +${it.delta}`;
    div.innerHTML = `<div style="font-weight:800">${it.name}</div>
      <div class="mut">Lv. ${it.lvl} · ${info}</div>
      <div style="display:flex;gap:4px">
        <button class="buy" ${game.gold>=cost?'':'disabled'} data-id="${it.id}">구매(${fmt(cost)})</button>
        <button class="buy" ${game.gold>=cost?'':'disabled'} data-max="1" data-id="${it.id}">최대</button>
      </div>`;
    box.appendChild(div);
  });
}

export function drawAchievements(){
  const box = E('achievements'); if(!box) return;
  box.innerHTML='';
  achievementList.forEach(a=>{
    const done = game.achievements[a.id];
    const div = document.createElement('div');
    div.className = 'item' + (done ? ' done' : '');
    div.innerHTML = `<div style="font-weight:800">${a.name}</div>`+
      `<div class="mut">${a.desc}</div>`+
      `<div>${done?'✓':''}</div>`;
    box.appendChild(div);
  });
}

export function click(e){
  let amount = game.cpc;
  if(game.crit && Math.random()<0.05){ amount *= 10; pop(e, `✦ +${fmt(amount)}`); }
  else if(game.showPop){ pop(e, `+${fmt(amount)}`); }
  game.totalClicks++;
  const changed = addGold(amount);
  if(changed) drawAchievements();
  draw();
}

export function setImage(url){
  const t = E('target');
  if(!url){ t.removeAttribute('src'); t.style.display='none'; E('empty').style.display='grid'; return; }
  t.src = url; t.onload=()=>{ t.style.display='block'; E('empty').style.display='none'; save(); };
  t.onerror=()=>{ t.style.display='none'; E('empty').style.display='grid'; };
}

export function useSVG(){
  const svg = `data:image/svg+xml;utf8,`+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'>
    <defs><radialGradient id='g' cx='50%' cy='45%'><stop offset='0%' stop-color='%23a5b4fc'/><stop offset='100%' stop-color='%23223146'/></radialGradient></defs>
    <rect width='100%' height='100%' fill='%230b1220'/>
    <g transform='translate(400,400)'>
      <circle r='180' fill='url(%23g)' stroke='%2333497a' stroke-width='12' />
      <circle r='120' fill='none' stroke='%235b7bd5' stroke-width='10' stroke-dasharray='20 16'>
        <animateTransform attributeName='transform' type='rotate' from='0' to='360' dur='12s' repeatCount='indefinite'/>
      </circle>
    </g>
    <text x='50%' y='94%' fill='%23cbd5e1' font-family='system-ui' font-size='36' text-anchor='middle'>CLICK!</text>
  </svg>`);
  game.imageUrl = svg; setImage(svg);
}

export function checkDaily(){
  const btn = E('daily'); if(!btn) return;
  const now = Date.now();
  btn.disabled = (now - game.lastDaily) < 86400000;
}

export function claimDaily(){
  const now = Date.now();
  if((now - game.lastDaily) < 86400000) return;
  const reward = 500;
  const changed = addGold(reward);
  alert(`일일 보상으로 ${fmt(reward)} 골드를 받았어!`);
  game.lastDaily = now;
  save();
  checkDaily();
  if(changed) drawAchievements();
  draw();
}

export function bind(){
  E('clickArea').addEventListener('click', (e)=>{
    if(e.target.id==='target' || e.target.id==='clickArea'){
      click(e);
    }
  });
  E('store').addEventListener('click', (e)=>{
    const b = e.target.closest('button.buy'); if(!b) return;
    if(b.dataset.max) buyMax(b.dataset.id); else buy(b.dataset.id);
    draw();
  });
  E('save').onclick = ()=>{ save(); alert('저장했어!'); };
  E('reset').onclick = ()=>{ if(confirm('정말 초기화할까?')) hardReset(); };
  E('prestige').onclick = ()=>{ doPrestige(); draw(); };
  E('daily').onclick = claimDaily;
  E('applyImg').onclick = ()=>{ const url=E('imgUrl').value.trim(); if(url){ game.imageUrl=url; setImage(url); } };
  E('useSVG').onclick = useSVG;
  E('pop').onchange = (e)=>{ game.showPop = e.target.checked; save(); };
  E('crit').onchange = (e)=>{ game.crit = e.target.checked; save(); };
}
