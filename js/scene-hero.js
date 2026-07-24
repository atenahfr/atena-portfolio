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

  function makeCodeTexture() {
    const cw = 220, ch = 480;
    const cnv = document.createElement('canvas');
    cnv.width = cw; cnv.height = ch;
    const cctx = cnv.getContext('2d');
    cctx.fillStyle = '#020306';
    cctx.fillRect(0, 0, cw, ch);
    const fontSize = 16;
    const cols = Math.floor(cw / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -30);
    const speeds = new Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.9);
    const tex = new THREE.CanvasTexture(cnv);
    return { cnv, cctx, tex, fontSize, cols, drops, speeds };
  }
  const chars = '01023456789ABCDEF{}<>/;';
  function updateTexture(t) {
    const { cnv, cctx, tex, fontSize, cols, drops, speeds } = t;
    cctx.fillStyle = 'rgba(2,3,6,0.18)';
    cctx.fillRect(0, 0, cnv.width, cnv.height);
    cctx.font = fontSize + 'px monospace';
    for (let i = 0; i < cols; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      cctx.fillStyle = '#eafcff';
      cctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
      cctx.fillStyle = 'rgba(120,220,255,0.55)';
      cctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
      drops[i] += speeds[i];
      if (y > cnv.height && Math.random() > 0.97) drops[i] = Math.random() * -10;
    }
    tex.needsUpdate = true;
  }

  const curtainGroup = new THREE.Group();
  scene.add(curtainGroup);

  const leftTexObj = makeCodeTexture();
  const rightTexObj = makeCodeTexture();
  const planeGeo = new THREE.PlaneGeometry(4.6, 7.4);
  const leftPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: leftTexObj.tex, transparent: true }));
  const rightPlane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: rightTexObj.tex, transparent: true }));
  leftPlane.rotation.y = 0.08; rightPlane.rotation.y = -0.08;
  curtainGroup.add(leftPlane, rightPlane);

  const group = new THREE.Group();
  scene.add(group);

  const seal = new THREE.Group();
  const hexEdges = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 6));
  const hexLine = new THREE.LineSegments(hexEdges, new THREE.LineBasicMaterial({ color: 0xff7a3d }));
  hexLine.rotation.x = Math.PI / 2;
  seal.add(hexLine);
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.14), new THREE.MeshStandardMaterial({ color: 0x171b2e, metalness: 0.6, roughness: 0.3 }));
  lockBody.position.y = -0.1;
  seal.add(lockBody);
  const shackleGroup = new THREE.Group();
  const lockShackle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff7a3d }));
  shackleGroup.add(lockShackle);
  shackleGroup.position.set(0, 0.16, 0);
  seal.add(shackleGroup);
  seal.position.z = 0.6;
  group.add(seal);

  const colorOpen = new THREE.Color(0xff7a3d);
  const colorSealed = new THREE.Color(0x5df0c4);
  let heroProgress = 0;
  let lockOpen = true;
  let lockCloseAmount = 0;

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => { heroProgress = self.progress; }
    });
  }

  container.style.cursor = 'pointer';
  container.addEventListener('click', () => { lockOpen = !lockOpen; });

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

    const maxGap = 1.1;
    const gapExtra = maxGap * (1 - heroProgress);
    leftPlane.position.x = -(1.0 + gapExtra);
    rightPlane.position.x = (1.0 + gapExtra);
    curtainGroup.position.x += (targetX * 0.15 - curtainGroup.position.x) * 0.04;
    curtainGroup.position.y += (-targetY * 0.1 - curtainGroup.position.y) * 0.04;

    lockCloseAmount += ((lockOpen ? 0 : 1) - lockCloseAmount) * 0.08;
    const arc = 0.4 + lockCloseAmount * (Math.PI * 2 - 0.4);
    if (seal.userData.lastArc === undefined || Math.abs(seal.userData.lastArc - arc) > 0.01) {
      hexLine.geometry.dispose();
      hexLine.geometry = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 6));
      seal.userData.lastArc = arc;
    }
    const col = colorOpen.clone().lerp(colorSealed, lockCloseAmount);
    hexLine.material.color.copy(col);
    lockShackle.material.color.copy(col);
    shackleGroup.rotation.z = (1 - lockCloseAmount) * -0.9;
    shackleGroup.position.x = (1 - lockCloseAmount) * 0.16;
    seal.rotation.z += 0.002;

    seal.position.x += (targetX * 0.6 - seal.position.x) * 0.08;
    seal.position.y += (-targetY * 0.4 - seal.position.y) * 0.08;

    const idle = Math.sin(Date.now() * 0.0005) * 0.08;
    group.rotation.z = idle * 0.4;
    group.rotation.y += (targetX * 0.5 - group.rotation.y) * 0.06;
    group.rotation.x += (targetY * 0.5 + idle - group.rotation.x) * 0.06;

    camera.position.x += (targetX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-targetY * 0.3 - camera.position.y) * 0.05;
    camera.position.z = 7.5 - heroProgress * 2.2;
    camera.lookAt(0, 0, 0);

    scanPass.uniforms.time.value += 0.01;
    composer.render();
  }

  if (!isSmallScreen) {
    animate();
  } else {
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