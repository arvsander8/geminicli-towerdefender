import * as THREE from 'three';
import { state } from '../core/state.js';
import { createPathMesh, buildPathCurve } from './MapSystem.js';
import { GRID, CELL } from '../core/config.js';
import { scene } from '../core/engine.js';

export function toggleEditor(active) {
  state.editorMode = active;
  document.getElementById('controls').style.display = active ? 'none' : 'flex';
  document.getElementById('editor-controls').style.display = active ? 'flex' : 'none';
  document.getElementById('tower-panel').style.display = active ? 'none' : 'flex';
  document.getElementById('hud').style.display = active ? 'none' : 'flex';
  document.getElementById('level-display').style.display = active ? 'none' : 'flex';

  if (active) {
    state.editorNodes = [];
    // Clear current path mesh
    createPathMesh([]);
  } else {
    // Reload current level to restore game state
    // We'll call this from main.js or pass a callback
  }
}

export function addEditorNode(gx, gz) {
  state.editorNodes.push([gx, gz]);
  updateEditorPath();
}

export function undoEditorNode() {
  state.editorNodes.pop();
  updateEditorPath();
}

export function clearEditorNodes() {
  state.editorNodes = [];
  updateEditorPath();
}

function updateEditorPath() {
  const nodes = state.editorNodes.map(([gx, gz]) => 
    new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2)
  );
  createPathMesh(nodes);
}

export function exportPath() {
  const nodesStr = state.editorNodes.map(([gx, gz]) => `[${gx}, ${gz}]`).join(', ');
  const code = `export const PATH_NODES = [\n  ${nodesStr}\n].map(([gx, gz]) => new THREE.Vector3((gx - GRID / 2) * CELL + CELL / 2, 0, (gz - GRID / 2) * CELL + CELL / 2));`;
  
  document.getElementById('export-text').value = code;
  document.getElementById('export-modal').style.display = 'block';
}
