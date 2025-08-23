import { notify } from './notify.js';
import { playerDefaults, equipmentList, levelExp } from './rpg.js';

export const storeKey = 'idle.mvp.v1';

export const game = {
  gold: 0,
  cpc: 1,
  gps: 0,
  time: Date.now(),
  prestige: 0, // %
  imageUrl: '',
  showPop: true,
  crit: true,
  totalClicks: 0,
  totalGold: 0,
  lastDaily: 0,
  achievements: {},
  items: [
    { id:'click1', name:'강화된 클릭', type:'click', lvl:0, base:10,  mult:1.15, delta:1 },
    { id:'w1',     name:'일꾼',       type:'gen',   lvl:0, base:25,  mult:1.15, dps:0.2 },
    { id:'w2',     name:'작업장',     type:'gen',   lvl:0, base:120, mult:1.18, dps:1.2 },
    { id:'w3',     name:'공장',       type:'gen',   lvl:0, base:650, mult:1.2,  dps:6 },
    { id:'w4',     name:'연구소',     type:'gen',   lvl:0, base:3200, mult:1.22, dps:28 },
    { id:'w5',     name:'메가공장',   type:'gen',   lvl:0, base:20000, mult:1.25, dps:150 },
  ],
  player: { ...playerDefaults, equipment: {} }
};

export const achievementList = [
  { id:'click100', name:'클릭 100회', desc:'클릭을 100번 해요', cond:g=>g.totalClicks>=100, reward:100 },
  { id:'gold1000', name:'골드 1천', desc:'누적 골드 1,000', cond:g=>g.totalGold>=1000, reward:200 },
];

export function fmt(n){
  if (!isFinite(n)) return '∞';
  if (n < 1e6) return Math.floor(n).toLocaleString();
  const units = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
  let u = 0; let x = n;
  while (x >= 1000 && u < units.length-1) { x/=1000; u++; }
  return x.toFixed(2).replace(/\.00$/,'') + units[u];
}

export function save(){
  localStorage.setItem(storeKey, JSON.stringify(game));
}

export function load(){
  try{
    const raw = localStorage.getItem(storeKey);
    if(raw){
      const d=JSON.parse(raw);
      Object.assign(game, d);
      game.player = Object.assign({}, playerDefaults, d.player||{});
      game.player.equipment = Object.assign({}, d.player?.equipment||{});
    }
  }catch(e){}
}

export function recompute(){
  let gps=0; game.items.forEach(i=>{ if(i.type==='gen') gps += i.lvl * i.dps; });
  game.gps = gps * (1 + game.prestige/100);
  let clickBonus = 0; const click = game.items.find(i=>i.id==='click1'); if(click) clickBonus = click.lvl * click.delta;
  const p = game.player;
  let atkBonus=0; let hpBonus=0;
  equipmentList.forEach(eq=>{
    const lvl = p.equipment[eq.id]||0;
    if(eq.stat==='atk') atkBonus += lvl*eq.bonus;
    if(eq.stat==='hp') hpBonus += lvl*eq.bonus;
  });
  p.atk = playerDefaults.atk + atkBonus + (p.level-1);
  p.hp  = playerDefaults.hp  + hpBonus + (p.level-1)*5;
  game.cpc = (1 + clickBonus + p.atk) * (1 + game.prestige/100);
}

export function itemCost(it){
  return Math.floor(it.base * Math.pow(it.mult, it.lvl));
}

export function buy(id){
  const it = game.items.find(x=>x.id===id); if(!it) return;
  const cost = itemCost(it);
  if(game.gold < cost) return;
  game.gold -= cost; it.lvl++;
  recompute(); save();
}

export function buyMax(id){
  const it = game.items.find(x=>x.id===id); if(!it) return;
  let cost = itemCost(it);
  if(game.gold < cost) return;
  while(game.gold >= cost){
    game.gold -= cost; it.lvl++;
    cost = itemCost(it);
  }
  recompute(); save();
}

export function equipCost(eq){
  const lvl = game.player.equipment[eq.id] || 0;
  return Math.floor(eq.base * Math.pow(eq.mult, lvl));
}

export function buyEquip(id){
  const eq = equipmentList.find(e=>e.id===id); if(!eq) return;
  const cost = equipCost(eq);
  if(game.gold < cost) return;
  game.gold -= cost;
  const lvl = game.player.equipment[id] || 0;
  game.player.equipment[id] = lvl + 1;
  recompute(); save();
}

export function gainExp(amount){
  const p = game.player;
  p.xp += amount;
  let need = levelExp(p.level);
  while(p.xp >= need){
    p.xp -= need; p.level++; need = levelExp(p.level); }
}

export function prestigeAvailable(){
  return Math.floor(game.gold / 10000);
}

export function softReset(){
  const {prestige, imageUrl} = game;
  game.gold=0; game.cpc=1; game.gps=0;
  game.items.forEach(i=>i.lvl=0);
  game.imageUrl=imageUrl; game.time=Date.now(); game.prestige=prestige;
  save();
}

export function doPrestige(){
  const add = prestigeAvailable(); if(add<=0) return;
  game.prestige += add; softReset();
}

export function hardReset(){
  localStorage.removeItem(storeKey);
  location.reload();
}

export function addGold(amount){
  game.gold += amount;
  game.totalGold += amount;
  return checkAchievements();
}

export function checkAchievements(){
  let changed=false;
  achievementList.forEach(a=>{
    if(!game.achievements[a.id] && a.cond(game)){
      game.achievements[a.id]=true;
      changed=true;
      if(a.reward){ game.gold += a.reward; game.totalGold += a.reward; }
      notify(`업적 달성: ${a.name}!`);
    }
  });
  if(changed) save();
  return changed;
}

export function grantOffline(){
  const now = Date.now();
  const dt = Math.max(0, (now - game.time)/1000);
  const gain = game.gps * dt;
  let changed = false;
  if(gain>0){
    changed = addGold(gain);
    notify(`오프라인 동안 ${fmt(gain)} 골드를 벌었어! (약 ${Math.floor(dt)}초)`);
  }
  game.time = now; save();
  return changed;
}

export { equipmentList, levelExp };
