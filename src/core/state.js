export const state = {
  gold: 150, score: 0, hp: 20, maxHp: 20,
  wave: 0, level: 0, paused: false, speed: 1,
  towers: [], enemies: [], projectiles: [], particles: [],
  selectedTower: null, placingTower: null,
  waveActive: false, waveQueue: [], nextWaveReady: true,
  gameState: 'playing', // playing | gameover | victory
  waveTimer: 0, waveSpawned: 0, waveTotal: 0, waveDone: 0,
  currentWaves: [],
  pathCurve: null,
  editorMode: false,
  editorNodes: [],
};

export function resetState() {
  state.gold = 150;
  state.score = 0;
  state.hp = 20;
  state.maxHp = 20;
  state.wave = 0;
  state.level = 0;
  state.paused = false;
  state.speed = 1;
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.particles = [];
  state.selectedTower = null;
  state.placingTower = null;
  state.waveActive = false;
  state.waveQueue = [];
  state.nextWaveReady = true;
  state.gameState = 'playing';
  state.waveTimer = 0;
  state.waveSpawned = 0;
  state.waveTotal = 0;
  state.waveDone = 0;
  state.currentWaves = [];
  state.pathCurve = null;
  state.editorMode = false;
  state.editorNodes = [];
}
