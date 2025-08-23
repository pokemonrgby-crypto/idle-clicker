import { game, load, save, addGold, grantOffline, recompute } from './game.js';
import { draw, bind, drawAchievements, useSVG, setImage, checkDaily } from './ui.js';

load();
recompute();
bind();
drawAchievements();
if(!game.imageUrl) useSVG(); else setImage(game.imageUrl);
const offlineChanged = grantOffline();
if(offlineChanged) drawAchievements();
checkDaily();

let lastSave = Date.now();
function tick(){
  const step = 0.1; // seconds
  const changed = addGold(game.gps * step);
  if(changed) drawAchievements();
  if(Date.now()-lastSave>20000){ game.time = Date.now(); save(); lastSave=Date.now(); }
  checkDaily();
}

function loop(){
  draw();
  requestAnimationFrame(loop);
}

setInterval(tick, 100);
loop();

window.addEventListener('beforeunload', ()=>{ game.time = Date.now(); save(); });
