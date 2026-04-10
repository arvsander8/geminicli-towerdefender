import * as THREE from 'three';
import { GRID, CELL } from '../core/config.js';
import { state } from '../core/state.js';

export function gridToWorld(gx, gz) {
  return new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2);
}

export function worldToGrid(x, z) {
  return [Math.floor(x / CELL + GRID / 2), Math.floor(z / CELL + GRID / 2)];
}

export function isOnPath(gx, gz, pathCurve) {
  const pos = gridToWorld(gx, gz);
  for (let t = 0; t <= 1; t += 0.005) {
    const pt = pathCurve.getPoint(t);
    if (pos.distanceTo(pt) < 1.5) return true;
  }
  return false;
}

export function isOccupied(gx, gz) {
  return state.towers.some(t => t.gx === gx && t.gz === gz);
}

export function isValidPlacement(gx, gz, pathCurve) {
  return gx >= 0 && gx < GRID && gz >= 0 && gz < GRID && !isOnPath(gx, gz, pathCurve) && !isOccupied(gx, gz);
}
