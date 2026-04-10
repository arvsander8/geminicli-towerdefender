import { PATH_NODES } from '../maps/map2.js';

export const level2 = {
  id: 2,
  name: 'Snake Path',
  map: {
    pathNodes: PATH_NODES
  },
  waves: [
    [
      { type: 'basic', delay: 0 },
      { type: 'fast', delay: 1 },
      { type: 'basic', delay: 2 },
      { type: 'fast', delay: 3 },
    ],
    [
      { type: 'tank', delay: 0 },
      { type: 'basic', delay: 2 },
      { type: 'basic', delay: 3 },
    ],
    [
      { type: 'healer', delay: 0 },
      { type: 'tank', delay: 1 },
      { type: 'tank', delay: 2 },
    ]
  ],
  startingGold: 200,
  startingHp: 20
};
