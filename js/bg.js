/* ═══ 3D NEURAL AUTOMATION NETWORK — Three.js background ═══ */
(function () {
  if (!window.THREE) return;
  const canvas = document.getElementById('bg3d');
  const isMobile = matchMedia('(max-width:860px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06060d, 0.055);
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 14;

  const N = isMobile ? 220 : 560;
  const SPREAD = { x: 30, y: 18, z: 16 };
  const pos = new Float32Array(N * 3);
  const phase = new Float32Array(N);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * SPREAD.x;
    pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD.y;
    pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD.z - 2;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.3 + Math.random() * 0.7;
  }

  /* nodes */
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
  const nodeMat = new THREE.PointsMaterial({
    size: 0.075, transparent: true, opacity: 0.9,
    color: new THREE.Color(0x8f7bff),
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(nodeGeo, nodeMat);
  scene.add(points);

  /* edges — connect near neighbours (precompute) */
  const edges = [];
  const MAXD = isMobile ? 3.4 : 3.0;
  for (let i = 0; i < N; i++) {
    let links = 0;
    for (let j = i + 1; j < N && links < 3; j++) {
      const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < MAXD * MAXD) { edges.push([i, j]); links++; }
    }
  }
  const linePos = new Float32Array(edges.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x5b4bd8, transparent: true, opacity: 0.16,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  /* data packets — glowing dots that travel along random edges */
  const P = isMobile ? 6 : 16;
  const packGeo = new THREE.BufferGeometry();
  const packPos = new Float32Array(P * 3);
  packGeo.setAttribute('position', new THREE.BufferAttribute(packPos, 3));
  const packMat = new THREE.PointsMaterial({
    size: 0.22, color: 0x38e8ff, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const packets = new THREE.Points(packGeo, packMat);
  scene.add(packets);
  const packState = Array.from({ length: P }, () => ({
    edge: Math.floor(Math.random() * edges.length),
    t: Math.random(), v: 0.004 + Math.random() * 0.012
  }));

  /* interaction state */
  let mx = 0, my = 0, scrollP = 0, running = true;
  addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
  addEventListener('scroll', () => {
    const h = document.documentElement;
    scrollP = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const colA = new THREE.Color(0x8f7bff), colB = new THREE.Color(0x38e8ff), colC = new THREE.Color(0x38f2c8);
  const nodeCol = new THREE.Color(), lineCol = new THREE.Color();
  const cur = nodeGeo.attributes.position.array;
  let t = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!running || reduced) return;
    t += 0.0045;

    /* drift nodes */
    for (let i = 0; i < N; i++) {
      const p = phase[i], s = speed[i];
      cur[i * 3] = pos[i * 3] + Math.sin(t * s + p) * 0.55;
      cur[i * 3 + 1] = pos[i * 3 + 1] + Math.cos(t * s * 0.8 + p * 1.3) * 0.45;
      cur[i * 3 + 2] = pos[i * 3 + 2] + Math.sin(t * s * 0.6 + p * 0.7) * 0.4;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    /* edges follow */
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      linePos[e * 6] = cur[a * 3]; linePos[e * 6 + 1] = cur[a * 3 + 1]; linePos[e * 6 + 2] = cur[a * 3 + 2];
      linePos[e * 6 + 3] = cur[b * 3]; linePos[e * 6 + 4] = cur[b * 3 + 1]; linePos[e * 6 + 5] = cur[b * 3 + 2];
    }
    lineGeo.attributes.position.needsUpdate = true;

    /* packets travel */
    for (let k = 0; k < P; k++) {
      const st = packState[k];
      st.t += st.v;
      if (st.t >= 1) { st.t = 0; st.edge = Math.floor(Math.random() * edges.length); }
      const [a, b] = edges[st.edge];
      packPos[k * 3] = cur[a * 3] + (cur[b * 3] - cur[a * 3]) * st.t;
      packPos[k * 3 + 1] = cur[a * 3 + 1] + (cur[b * 3 + 1] - cur[a * 3 + 1]) * st.t;
      packPos[k * 3 + 2] = cur[a * 3 + 2] + (cur[b * 3 + 2] - cur[a * 3 + 2]) * st.t;
    }
    packGeo.attributes.position.needsUpdate = true;

    /* scroll hue morph: violet → cyan → mint */
    if (scrollP < 0.5) { nodeCol.lerpColors(colA, colB, scrollP * 2); }
    else { nodeCol.lerpColors(colB, colC, (scrollP - 0.5) * 2); }
    nodeMat.color.copy(nodeCol);
    lineCol.copy(nodeCol).multiplyScalar(0.6);
    lineMat.color.copy(lineCol);

    /* camera parallax + slow orbit */
    camera.position.x += (mx * 1.6 - camera.position.x) * 0.03;
    camera.position.y += (-my * 1.0 - camera.position.y) * 0.03;
    camera.position.z = 14 - scrollP * 3.5;
    scene.rotation.y = Math.sin(t * 0.35) * 0.06 + scrollP * 0.5;
    scene.rotation.x = Math.cos(t * 0.28) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  frame();
  if (reduced) renderer.render(scene, camera);
})();
