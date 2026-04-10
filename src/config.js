export const GRID = 16;
export const CELL = 2;
export const HALF = GRID * CELL / 2;
export const TOTAL_LEVELS = 5;

export const TOWER_DEFS = [
  { id:'arrow', name:'Arrow', icon:'🏹', cost:50, color:0x44cc66, range:6, damage:12, rate:0.6, projectileSpeed:30, projectileColor:0x88ff88,
    upgrades:[ {cost:40,damage:18,range:7,name:'Sharp'},{cost:80,damage:30,range:8,name:'Elite'} ] },
  { id:'cannon', name:'Cannon', icon:'💣', cost:80, color:0xcc6644, range:5, damage:35, rate:1.4, splash:2.5, projectileSpeed:20, projectileColor:0xff8844,
    upgrades:[ {cost:60,damage:55,splash:3,name:'Big Boom'},{cost:120,damage:90,splash:4,name:'Mega'} ] },
  { id:'ice', name:'Frost', icon:'❄️', cost:60, color:0x44aaff, range:5.5, damage:8, rate:0.8, slow:0.5, slowDur:2, projectileSpeed:25, projectileColor:0x88ddff,
    upgrades:[ {cost:50,slow:0.35,slowDur:3,name:'Deep Freeze'},{cost:100,slow:0.2,slowDur:4,damage:15,name:'Blizzard'} ] },
  { id:'laser', name:'Laser', icon:'⚡', cost:100, color:0xdd44ff, range:7, damage:5, rate:0.1, projectileSpeed:80, projectileColor:0xff66ff, continuous:true,
    upgrades:[ {cost:70,damage:8,range:8,name:'Pulse'},{cost:140,damage:14,range:9,name:'Plasma'} ] },
  { id:'flame', name:'Flame', icon:'🔥', cost:70, color:0xff6600, range:3.5, damage:18, rate:0.3, aoe:true, projectileSpeed:15, projectileColor:0xff4400,
    upgrades:[ {cost:55,damage:28,range:4,name:'Inferno'},{cost:110,damage:45,range:5,name:'Hellfire'} ] },
];

export const ENEMY_DEFS = [
  { id:'basic', name:'Grunt', color:0xaaaaaa, hp:60, speed:3, reward:10, size:0.4 },
  { id:'fast', name:'Scout', color:0xffcc00, hp:35, speed:5.5, reward:12, size:0.3 },
  { id:'tank', name:'Tank', color:0x448844, hp:200, speed:1.8, reward:25, size:0.6 },
  { id:'healer', name:'Healer', color:0x44ff88, hp:80, speed:2.8, reward:18, size:0.4, heals:true },
  { id:'boss', name:'Boss', color:0xff2222, hp:800, speed:1.2, reward:100, size:0.9 },
  { id:'flyer', name:'Flyer', color:0xaaccff, hp:50, speed:4, reward:15, size:0.35, flying:true },
];

export function generateWaves(level) {
  const waves = [];
  const base = 5 + level * 2;
  for (let w = 0; w < 3 + level; w++) {
    const enemies = [];
    const count = base + w * 3;
    for (let i = 0; i < count; i++) {
      let type;
      const r = Math.random();
      if (w === 2 + level && i === count - 1) type = 'boss';
      else if (level >= 3 && r < 0.1) type = 'healer';
      else if (level >= 2 && r < 0.2) type = 'flyer';
      else if (r < 0.25 + level * 0.03) type = 'tank';
      else if (r < 0.5) type = 'fast';
      else type = 'basic';
      enemies.push({ type, delay: i * (0.5 - Math.min(level * 0.03, 0.25)) });
    }
    waves.push(enemies);
  }
  return waves;
}
