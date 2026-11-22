import DATA from '../sched.json';
import TEACH from '../teachers.json';
import * as THREE from 'three';

// ---------- konversi koordinat denah (piksel) ke dunia 3D ----------
const P = (x, z) => [x, z]; // koordinat dunia langsung (1 unit ≈ 1 meter)

// ---------- renderer & scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });   // mencegah lantai berkedip (z-fighting)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3f5);
scene.fog = new THREE.Fog(0xbfe3f5, 140, 320);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.3, 600);
const CAM_OFF = new THREE.Vector3();
const CAMS = [['Dekat', 0.6], ['Sedang', 1], ['Jauh', 1.7], ['Atas (denah)', 0]];
let camIdx = 1;
function setCam(){ const portrait = innerWidth < innerHeight; const k = CAMS[camIdx][1]; if (k === 0) CAM_OFF.set(0, portrait ? 105 : 80, portrait ? 9 : 7); else CAM_OFF.set(0, (portrait ? 42 : 30) * k, (portrait ? 22 : 16) * k); camera.fov = portrait ? 62 : 52; camera.far = 600; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
setCam();

scene.add(new THREE.HemisphereLight(0xffffff, 0x88a070, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(-50, 90, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -115, right: 115, top: 85, bottom: -85, near: 1, far: 260 });
sun.shadow.bias = -0.0005;
scene.add(sun);

const matCache = {};
const mat = (c) => (matCache[c] ||= new THREE.MeshLambertMaterial({ color: c }));
const colliders = []; // {x1,z1,x2,z2} kotak, atau {cx,cz,r} lingkaran

function plane(x1, y1, x2, y2, color, y = 0.02) {
  const [ax, az] = P(x1, y1), [bx, bz] = P(x2, y2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(bx - ax, bz - az), mat(color));
  m.rotation.x = -Math.PI / 2;
  m.position.set((ax + bx) / 2, y, (az + bz) / 2);
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

function box(cx, cy, cz, w, h, d, color, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(cx, cy, cz);
  m.castShadow = shadow;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

function building(x1, y1, x2, y2, h, wall, roof, collide = true) {
  const [ax, az] = P(x1, y1), [bx, bz] = P(x2, y2);
  const w = bx - ax, d = bz - az, cx = (ax + bx) / 2, cz = (az + bz) / 2;
  box(cx, h / 2, cz, w, h, d, wall);
  box(cx, h + 0.3, cz, w + 0.9, 0.6, d + 0.9, roof);
  if (collide) colliders.push({ x1: ax, z1: az, x2: bx, z2: bz });
  return { ax, az, bx, bz, cx, cz, h };
}

// jendela memanjang di satu sisi bangunan
function windowBand(b, face, floors = 1) {
  for (let f = 0; f < floors; f++) {
    const y = 2.1 + f * 3.3;
    if (face === 'S') box(b.cx, y, b.bz + 0.06, (b.bx - b.ax) * 0.86, 1.1, 0.12, 0x5aa9d6, false);
    if (face === 'N') box(b.cx, y, b.az - 0.06, (b.bx - b.ax) * 0.86, 1.1, 0.12, 0x5aa9d6, false);
    if (face === 'E') box(b.bx + 0.06, y, b.cz, 0.12, 1.1, (b.bz - b.az) * 0.86, 0x5aa9d6, false);
    if (face === 'W') box(b.ax - 0.06, y, b.cz, 0.12, 1.1, (b.bz - b.az) * 0.86, 0x5aa9d6, false);
  }
}

function door(x, z, face, color = 0x8a5a2b) {
  if (face === 'S' || face === 'N') box(x, 1.3, z, 1.8, 2.6, 0.25, color, false);
  else box(x, 1.3, z, 0.25, 2.6, 1.8, color, false);
}

// ---------- label melayang ----------
const sceneLabels = [];
function label(text, x, y, z, size = 1.6, accent = false) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const fs = 56;
  const font = `800 ${fs}px Nunito, system-ui, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width + fs * 1.1);
  const h = Math.ceil(fs * 1.7);
  c.width = w; c.height = h;
  ctx.font = font;
  ctx.fillStyle = accent ? '#ffd84d' : '#ffffff';
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 6;
  const r = 22;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, r);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  size *= 1.4;
  sp.scale.set((w / h) * size, size, 1);
  sp.position.set(x, y, z);
  sp.renderOrder = 5;
  scene.add(sp); sceneLabels.push(sp);
  return sp;
}

