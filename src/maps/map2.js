import * as THREE from 'three';
import { GRID, CELL } from '../core/config.js';

export const PATH_NODES = [
  [15, 2], [10, 2], [10, 6], [13, 6], [13, 10], [10, 10], [10, 13], [5, 13], [5, 10], [1, 10], [1, 6], [4, 6], [4, 2], [0, 2]
].map(([gx, gz]) => new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2));
