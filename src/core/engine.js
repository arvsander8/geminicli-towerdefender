import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GRID, CELL } from './config.js';

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.012);

export const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 28, 28);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2.3;
controls.minDistance = 12;
controls.maxDistance = 50;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
dirLight.position.set(15, 25, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
scene.add(dirLight);

export const pointLight1 = new THREE.PointLight(0x64c8ff, 0.8, 40);
pointLight1.position.set(-10, 8, -10);
scene.add(pointLight1);

export const pointLight2 = new THREE.PointLight(0xff6644, 0.5, 35);
pointLight2.position.set(10, 6, 10);
scene.add(pointLight2);

const groundGeo = new THREE.PlaneGeometry(GRID * CELL + 4, GRID * CELL + 4);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e, roughness: 0.9, metalness: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(GRID * CELL, GRID, 0x222244, 0x1a1a33);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

export const bgParticles = [];
for (let i = 0; i < 60; i++) {
  const geo = new THREE.SphereGeometry(0.06, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.8, 0.6), transparent: true, opacity: 0.6 });
  const p = new THREE.Mesh(geo, mat);
  p.position.set((Math.random() - 0.5) * GRID * CELL, 2 + Math.random() * 10, (Math.random() - 0.5) * GRID * CELL);
  p.userData.speed = 0.3 + Math.random() * 0.5;
  p.userData.phase = Math.random() * Math.PI * 2;
  scene.add(p);
  bgParticles.push(p);
}

const skyGeo = new THREE.SphereGeometry(80, 32, 32);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x0a0a1a, side: THREE.BackSide });
scene.add(new THREE.Mesh(skyGeo, skyMat));

const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 500; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.5;
  const r = 70;
  starPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) + 10, r * Math.sin(phi) * Math.sin(theta));
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.7 })));

export const raycaster = new THREE.Raycaster();
export const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

const ghostGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 8);
const ghostMat = new THREE.MeshBasicMaterial({ color: 0x64c8ff, transparent: true, opacity: 0.3 });
export const ghost = new THREE.Mesh(ghostGeo, ghostMat);
ghost.visible = false;
scene.add(ghost);

const rangeRingGeo = new THREE.RingGeometry(1, 1.05, 64);
const rangeRingMat = new THREE.MeshBasicMaterial({ color: 0x64c8ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
export const rangeRing = new THREE.Mesh(rangeRingGeo, rangeRingMat);
rangeRing.rotation.x = -Math.PI / 2;
rangeRing.visible = false;
scene.add(rangeRing);

export function updateBackground(time, level) {
  bgParticles.forEach(p => {
    p.position.y += Math.sin(time * p.userData.speed + p.userData.phase) * 0.005;
    p.material.opacity = 0.3 + Math.sin(time * 2 + p.userData.phase) * 0.3;
  });

  pointLight1.intensity = 0.6 + Math.sin(time * 0.7) * 0.3;
  pointLight2.intensity = 0.4 + Math.sin(time * 1.1 + 1) * 0.2;

  const hue = 0.55 + level * 0.08;
  scene.fog.color.setHSL(hue, 0.3, 0.05);
}
