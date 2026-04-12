import { ENEMY_DEFS } from '../core/config.js';
import { state } from '../core/state.js';
import { Grunt } from './enemies/Grunt.js';
import { Scout } from './enemies/Scout.js';
import { Tank } from './enemies/Tank.js';
import { Healer } from './enemies/Healer.js';
import { Boss } from './enemies/Boss.js';
import { Flyer } from './enemies/Flyer.js';

const ENEMY_CLASSES = {
  basic: Grunt,
  fast: Scout,
  tank: Tank,
  healer: Healer,
  boss: Boss,
  flyer: Flyer,
};

export function spawnEnemy(typeId, pathCurve) {
  const def = ENEMY_DEFS.find(e => e.id === typeId);
  if (!def) return;

  const EnemyClass = ENEMY_CLASSES[typeId] || Grunt;
  const enemy = new EnemyClass(def, pathCurve);
  
  state.enemies.push(enemy);
}
