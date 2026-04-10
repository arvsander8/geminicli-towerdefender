import { PATH_NODES } from '../maps/map1.js';

export const level1 = {
  id: 1,
  name: 'First Steps',
  map: {
    pathNodes: PATH_NODES
  },
  waves: [
    [
      { type: 'basic', delay: 0 },
      { type: 'basic', delay: 1 },
      { type: 'basic', delay: 2 },
      { type: 'basic', delay: 3 },
      { type: 'basic', delay: 4 },
    ],
    [
      { type: 'basic', delay: 0 },
      { type: 'fast', delay: 1 },
      { type: 'basic', delay: 2 },
      { type: 'fast', delay: 3 },
      { type: 'basic', delay: 4 },
    ],
    [
      { type: 'basic', delay: 0 },
      { type: 'tank', delay: 2 },
      { type: 'basic', delay: 4 },
    ]
  ],
  startingGold: 150,
  startingHp: 20
};
