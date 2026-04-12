import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { GRID, CELL } from '../core/config.js';

let pathGroup = new THREE.Group();
scene.add(pathGroup);

export function buildPathCurve(pathNodes) {
  return new THREE.CatmullRomCurve3(pathNodes, false, 'catmullrom', 0.3);
}

export function createPathMesh(pathNodes) {
  // Clear previous path
  while (pathGroup.children.length > 0) {
    pathGroup.remove(pathGroup.children[0]);
  }

  const curve = buildPathCurve(pathNodes);
  
  // Create a flat road shape
  const roadWidth = 1.4;
  const roadShape = new THREE.Shape([
    new THREE.Vector2(-roadWidth / 2, 0),
    new THREE.Vector2(roadWidth / 2, 0),
    new THREE.Vector2(roadWidth / 2, 0.1),
    new THREE.Vector2(-roadWidth / 2, 0.1),
  ]);

  const extrudeSettings = {
    steps: 150,
    bevelEnabled: false,
    extrudePath: curve
  };

  const roadGeo = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x223344, roughness: 0.8, metalness: 0.2,
    emissive: 0x112233, emissiveIntensity: 0.2
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.position.y = 0.01;
  road.receiveShadow = true;
  pathGroup.add(road);

  const points = curve.getPoints(300);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.9, linewidth: 2 });
  const line = new THREE.Line(lineGeo, lineMat);
  line.position.y = 0.15;
  pathGroup.add(line);

  for (let offset of [-0.7, 0.7]) {
    const edgePoints = [];
    for (let t = 0; t <= 1; t += 0.005) {
      const pt = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      edgePoints.push(new THREE.Vector3(pt.x + perp.x * offset, 0.12, pt.z + perp.z * offset));
    }
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x44aadd, transparent: true, opacity: 0.5 });
    pathGroup.add(new THREE.Line(edgeGeo, edgeMat));
  }

  const startGeo = new THREE.RingGeometry(0.8, 1.2, 16);
  const startMat = new THREE.MeshBasicMaterial({ color: 0x44ff66, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const startMarker = new THREE.Mesh(startGeo, startMat);
  startMarker.rotation.x = -Math.PI / 2;
  startMarker.position.copy(pathNodes[0]);
  startMarker.position.y = 0.2;
  pathGroup.add(startMarker);

  const endMarker = startMarker.clone();
  endMarker.material = new THREE.MeshBasicMaterial({ color: 0xff4466, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  endMarker.position.copy(pathNodes[pathNodes.length - 1]);
  endMarker.position.y = 0.2;
  pathGroup.add(endMarker);

  for (let t = 0.1; t < 0.95; t += 0.12) {
    const pt = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const arrowGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.35 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(pt.x, 0.2, pt.z);
    arrow.rotation.x = Math.PI / 2;
    arrow.lookAt(pt.x + tan.x, 0.2, pt.z + tan.z);
    arrow.rotateX(-Math.PI / 2);
    pathGroup.add(arrow);
  }
}
