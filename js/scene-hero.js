(function () {
  const canvas = document.getElementById('hero-canvas');
  const container = document.getElementById('hero');
  let w = container.clientWidth, h = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 7.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.7, 0.4, 0.4);
  composer.addPass(bloomPass);

  const ScanShader = {
    uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float r = texture2D(tDiffuse, uv + vec2(0.0009, 0.0)).r;
float g = texture2D(tDiffuse, uv).g;
float b = texture2D(tDiffuse, uv - vec2(0.0009, 0.0)).b;
vec3 col = vec3(r, g, b);
col -= sin(uv.y * 700.0 + time * 3.0) * 0.012;
        gl_FragColor = vec4(col, 1.0);
      }`
  };
  const scanPass = new THREE.ShaderPass(ScanShader);
  composer.addPass(scanPass);

  scene.add(new THREE.AmbientLight(0x222233));
  const l1 = new THREE.PointLight(0x4de8ff, 3, 20); l1.position.set(3, 2, 4); scene.add(l1);
  const l2 = new THREE.PointLight(0x9b5cff, 3, 20); l2.position.set(-3, -2, 3); scene.add(l2);

  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 640; wallCanvas.height = 400;
  const wallCtx = wallCanvas.getContext('2d');
  const wallTexture = new THREE.CanvasTexture(wallCanvas);
  const monitors = [
    { x: 30,  y: 20,  w: 165, h: 100 },
    { x: 225, y: 20,  w: 165, h: 100 },
    { x: 420, y: 20,  w: 165, h: 100 },
    { x: 30,  y: 140, w: 165, h: 100 },
    { x: 420, y: 140, w: 165, h: 100 },
    { x: 225, y: 270, w: 165, h: 110 }
  ];
  const scrollOffsets = monitors.map(() => 0);
  function drawWall() {
    wallCtx.fillStyle = '#020402';
    wallCtx.fillRect(0, 0, wallCanvas.width, wallCanvas.height);
    monitors.forEach((m, idx) => {
      wallCtx.fillStyle = '#04120a';
      wallCtx.fillRect(m.x, m.y, m.w, m.h);
      wallCtx.strokeStyle = 'rgba(80,110,90,0.4)';
      wallCtx.strokeRect(m.x, m.y, m.w, m.h);
      wallCtx.save();
      wallCtx.beginPath();
      wallCtx.rect(m.x, m.y, m.w, m.h);
      wallCtx.clip();
      wallCtx.font = '9px monospace';
      scrollOffsets[idx] += 1.6;
      if (scrollOffsets[idx] > 11) scrollOffsets[idx] = 0;
      for (let row = -1; row < m.h / 11 + 1; row++) {
        const y = m.y + row * 11 + scrollOffsets[idx];
        let line = '';
        const len = Math.floor(m.w / 5.5);
        for (let c = 0; c < len; c++) line += Math.random() > 0.5 ? '0' : '1';
        wallCtx.fillStyle = Math.random() > 0.85 ? '#baffcb' : 'rgba(63,239,122,0.65)';
        wallCtx.fillText(line, m.x + 4, y);
      }
      wallCtx.restore();
    });
    wallCtx.fillStyle = 'rgba(2,4,2,0.92)';
    wallCtx.beginPath();
    wallCtx.ellipse(wallCanvas.width / 2, wallCanvas.height * 0.62, 46, 60, 0, 0, Math.PI * 2);
    wallCtx.fill();
    wallCtx.beginPath();
    wallCtx.moveTo(wallCanvas.width / 2 - 95, wallCanvas.height);
    wallCtx.quadraticCurveTo(wallCanvas.width / 2, wallCanvas.height * 0.66, wallCanvas.width / 2 + 95, wallCanvas.height);
    wallCtx.closePath();
    wallCtx.fill();
    wallTexture.needsUpdate = true;
  }
  const bgPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(11, 7),
  new THREE.MeshBasicMaterial({ map: wallTexture, transparent: true, opacity: 0.2 })
);
bgPlane.position.z = -6.5;
  scene.add(bgPlane);

  function makeCodeTexture() {
    const cw = 220, ch = 480;
    const cnv = document.createElement('canvas');
    cnv.width = cw; cnv.height = ch;
    const cctx = cnv.getContext('2d');
    cctx.fillStyle = '#020306';
    cctx.fillRect(0, 0, cw, ch);
    const tex = new THREE.CanvasTexture(cnv);
    return { cnv, cctx, tex };
  }
  const chars = '01023456789ABCDEF{}<>/;';
  function updateTexture(t) {
    const { cnv, cctx, tex } = t;
    cctx.drawImage(cnv, 0, 1, cnv.width, cnv.height - 1, 0, 0, cnv.width, cnv.height - 1);
    cctx.fillStyle = 'rgba(2,3,6,0.5)';
    cctx.fillRect(0, 0, cnv.width, 3);
    cctx.font = '15px monospace';
    for (let x = 0; x < cnv.width; x += 15) {
      if (Math.random() > 0.55) {
        const b = Math.random();
        cctx.fillStyle = b > 0.92 ? '#eafcff' : b > 0.6 ? 'rgba(120,220,255,0.85)' : 'rgba(50,120,160,0.4)';
        cctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, 14);
      }
    }
    tex.needsUpdate = true;
  }

  const group = new THREE.Group();
  scene.add(group);

  const leftTexObj = makeCodeTexture();
  const rightTexObj = makeCodeTexture();
  const planeGeo = new THREE.PlaneGeometry(3.4, 5.6);
  const leftPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: leftTexObj.tex, transparent: true }));
  const rightPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: rightTexObj.tex, transparent: true }));
  leftPlane.rotation.y = 0.15; rightPlane.rotation.y = -0.15;
  group.add(leftPlane, rightPlane);

  const seal = new THREE.Group();
  const hexEdges = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 6));
  const hexLine = new THREE.LineSegments(hexEdges, new THREE.LineBasicMaterial({ color: 0xff7a3d }));
  hexLine.rotation.x = Math.PI / 2;
  seal.add(hexLine);
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.14), new THREE.MeshStandardMaterial({ color: 0x171b2e, metalness: 0.6, roughness: 0.3 }));
  lockBody.position.y = -0.1;
  const lockShackle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff7a3d }));
  lockShackle.position.y = 0.16;
  seal.add(lockBody, lockShackle);
  seal.position.z = 0.6;
  group.add(seal);

  const sparkCount = 90;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkBase = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    sparkBase[i * 3] = (Math.random() - 0.5) * 0.5;
    sparkBase[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
    sparkBase[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkBase.slice(), 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0x9be8ff, size: 0.055, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  const colorOpen = new THREE.Color(0xff7a3d);
  const colorSealed = new THREE.Color(0x5df0c4);
  let heroProgress = 0;

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => { heroProgress = self.progress; }
    });
  }

  let targetX = 0, targetY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.8;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 1.8;
  });

  const isSmallScreen = window.innerWidth < 700;
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    if (frame % 2 === 0) { updateTexture(leftTexObj); updateTexture(rightTexObj); }
    if (frame % 3 === 0) drawWall();

    const maxGap = 0.9;
    const gapExtra = maxGap * (1 - heroProgress);
    leftPlane.position.x = -(1.2 + gapExtra);
    rightPlane.position.x = (1.2 + gapExtra);

    const col = colorOpen.clone().lerp(colorSealed, heroProgress);
    hexLine.material.color.copy(col);
    lockShackle.material.color.copy(col);
    seal.scale.setScalar(1 + heroProgress * 0.15);
    seal.rotation.z += 0.002;

    sparkMat.opacity = Math.max(0, (gapExtra / maxGap) * 0.85);
    const posAttr = sparkGeo.attributes.position;
    for (let i = 0; i < sparkCount; i++) {
      posAttr.array[i * 3 + 1] = sparkBase[i * 3 + 1] + Math.sin(Date.now() * 0.0018 + i) * 0.18;
    }
    posAttr.needsUpdate = true;

    const idle = Math.sin(Date.now() * 0.0005) * 0.08;
    group.rotation.z = idle * 0.4;
    group.rotation.y += (targetX - group.rotation.y) * 0.06;
    group.rotation.x += (targetY + idle - group.rotation.x) * 0.06;

    camera.position.x += (targetX * 0.9 - camera.position.x) * 0.05;
    camera.position.y += (-targetY * 0.6 - camera.position.y) * 0.05;
    camera.position.z = 7.5 - heroProgress * 2.2;
    camera.lookAt(0, 0, 0);

    scanPass.uniforms.time.value += 0.01;
    composer.render();
  }

  if (!isSmallScreen) {
    animate();
    drawWall();
  } else {
    drawWall();
    composer.render();
  }

  window.addEventListener('resize', () => {
    w = container.clientWidth; h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  });
})();