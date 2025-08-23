export const playerDefaults = {
  hp: 100,
  atk: 1,
  level: 1,
  xp: 0,
  equipment: {}
};

export const equipmentList = [
  { id:'sword', name:'검', stat:'atk', base:50, mult:1.15, bonus:1 },
  { id:'armor', name:'방어구', stat:'hp', base:40, mult:1.15, bonus:5 }
];

export function levelExp(lvl){
  return 100 + (lvl-1) * 50;
}
