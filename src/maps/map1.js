import * as THREE from 'three';
import { GRID, CELL } from '../core/config.js';

export const PATH_NODES = [
  [0, 2], [4, 2], [4, 6], [1, 6], [1, 10], [5, 10], [5, 13], [10, 13], [10, 10], [13, 10], [13, 6], [9, 6], [9, 2], [15, 2]
].map(([gx, gz]) => new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2));
