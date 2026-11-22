// ---------- tokoh (siswa, guru, satpam) ----------
function makePerson(o = {}) {
  const g = new THREE.Group();
  g.rotation.order = 'YXZ';
  const add = (geo, c, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const shirt = o.shirt ?? 0xffffff, bottom = o.bottom ?? 0x6d6f73, skin = o.skin ?? 0xf0c8a0;
  if (o.putri) {
    add(new THREE.CylinderGeometry(0.36, 0.5, 0.95, 14), bottom, 0, 0.48, 0);
    g.legL = new THREE.Object3D(); g.legR = new THREE.Object3D();
    add(new THREE.BoxGeometry(0.8, 0.8, 0.48), shirt, 0, 1.3, 0);
    add(new THREE.ConeGeometry(0.62, 0.75, 18), o.hijab ?? 0xf4f4f4, 0, 1.55, 0);
    add(new THREE.SphereGeometry(0.42, 18, 14), o.hijab ?? 0xf4f4f4, 0, 1.97, -0.02);
    add(new THREE.SphereGeometry(0.27, 14, 10), skin, 0, 1.95, 0.2);
  } else {
    g.legL = new THREE.Group(); g.legL.position.set(-0.2, 0.8, 0); g.add(g.legL);
    g.legR = new THREE.Group(); g.legR.position.set(0.2, 0.8, 0); g.add(g.legR);
    add(new THREE.BoxGeometry(0.32, 0.8, 0.32), bottom, 0, -0.4, 0, g.legL);
    add(new THREE.BoxGeometry(0.32, 0.8, 0.32), bottom, 0, -0.4, 0, g.legR);
    add(new THREE.BoxGeometry(0.85, 0.85, 0.5), shirt, 0, 1.22, 0);
    if (o.tie !== false) add(new THREE.BoxGeometry(0.12, 0.5, 0.05), o.tie ?? 0x7a7d82, 0, 1.3, 0.27);
    add(new THREE.SphereGeometry(0.38, 16, 12), skin, 0, 1.95, 0);
    if (o.peci) add(new THREE.CylinderGeometry(0.34, 0.36, 0.3, 16), o.peci, 0, 2.25, 0);
    else add(new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), 0x222222, 0, 2.0, -0.03);
  }
  if (o.bag) add(new THREE.BoxGeometry(0.62, 0.68, 0.28), o.bag, 0, 1.25, -0.4);
  const sleeve = o.sleeve ?? shirt;
  g.armL = new THREE.Group(); g.armL.position.set(-0.52, 1.6, 0); g.add(g.armL);
  g.armR = new THREE.Group(); g.armR.position.set(0.52, 1.6, 0); g.add(g.armR);
  add(new THREE.BoxGeometry(0.22, 0.78, 0.22), sleeve, 0, -0.38, 0, g.armL);
  add(new THREE.BoxGeometry(0.22, 0.78, 0.22), sleeve, 0, -0.38, 0, g.armR);
  add(new THREE.SphereGeometry(0.12, 8, 6), skin, 0, -0.8, 0, g.armR);
  add(new THREE.SphereGeometry(0.12, 8, 6), skin, 0, -0.8, 0, g.armL);
  g.anim = null; g.walkT = 0;
  return g;
}
