import * as THREE from 'three';
import { GRID, CELL } from '../core/config.js';

export const PATH_NODES = [
    [2, 15], [4, 11], [2, 6], [2, 1], [4, 1], [5, 4], [6, 9], [9, 10], [8, 5], [11, 5], [12, 11], [8, 13], [8, 15], [14, 15], [15, 9], [15, 1], [11, 0], [8, 0]
].map(([gx, gz]) => new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2));