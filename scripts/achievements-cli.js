const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const achievementsPath = path.join(__dirname, '..', 'src', 'achievements.json');

function ask(q){
  return new Promise(res => rl.question(q, ans => res(ans.trim())));
}

async function main(){
  const id = await ask('id: ');
  const name = await ask('name: ');
  const description = await ask('description: ');
  const condition = await ask('condition (e.g., g.totalClicks >= 100): ');
  const rewardStr = await ask('reward: ');
  const reward = Number(rewardStr) || 0;

  const raw = fs.readFileSync(achievementsPath, 'utf8');
  const list = JSON.parse(raw);
  list.push({ id, name, description, condition, reward });
  fs.writeFileSync(achievementsPath, JSON.stringify(list, null, 2));
  console.log('Achievement added.');
  rl.close();
}

main().catch(err => { console.error(err); rl.close(); });
