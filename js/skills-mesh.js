(function () {
  const section = document.querySelector('.skills-mesh');
  const svg = document.getElementById('skills-svg');
  if (!section || !svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const isSmall = window.matchMedia('(max-width: 700px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // id, label, desktop x/y. Array order is the reveal order.
  const NODES = [
    ['python', 'Python', 70, 90], ['java', 'Java', 250, 55], ['c', 'C', 430, 100],
    ['js', 'JavaScript', 610, 65], ['ts', 'TypeScript', 790, 105],
    ['rust', 'Rust', 970, 70], ['haskell', 'Haskell', 1120, 115],

    ['oracle', 'Oracle SQL', 70, 250], ['pg', 'PostgreSQL', 245, 295], ['sqlite', 'SQLite', 420, 245],
    ['model', 'Relational modelling', 595, 290], ['flask', 'Flask', 770, 240],
    ['react', 'React', 945, 295], ['docker', 'Docker', 1120, 245],

    ['actions', 'GitHub Actions', 70, 430], ['linux', 'Linux/Unix', 270, 395], ['wireshark', 'Wireshark & Scapy', 470, 440],
    ['owasp', 'OWASP', 700, 400], ['rbac', 'RBAC', 900, 435], ['aes', 'AES', 1080, 400],

    ['threshold', 'Threshold cryptography', 100, 580], ['usable', 'Usable security', 400, 545],
    ['sklearn', 'scikit-learn', 680, 590], ['figma', 'Figma', 930, 550],

    ['agile', 'Agile/Scrum', 120, 700], ['leadership', 'Team leadership', 400, 665],
    ['writing', 'Technical writing', 700, 705], ['spss', 'SPSS', 980, 670],
  ];

  const EDGES = [
    ['python', 'java'], ['java', 'c'], ['c', 'js'], ['js', 'ts'], ['ts', 'rust'], ['rust', 'haskell'],
    ['ts', 'react'], ['python', 'flask'], ['python', 'sklearn'], ['python', 'wireshark'],
    ['flask', 'pg'], ['flask', 'sqlite'], ['flask', 'docker'], ['pg', 'oracle'], ['oracle', 'sqlite'],
    ['oracle', 'model'], ['sqlite', 'model'], ['docker', 'actions'], ['c', 'linux'], ['linux', 'docker'],
    ['linux', 'wireshark'], ['wireshark', 'owasp'], ['flask', 'owasp'], ['owasp', 'rbac'], ['owasp', 'aes'],
    ['aes', 'threshold'], ['threshold', 'rust'], ['threshold', 'usable'], ['usable', 'figma'], ['react', 'figma'],
    ['agile', 'leadership'], ['leadership', 'flask'], ['leadership', 'writing'], ['writing', 'spss'],
  ];

  // Phone layout: two columns, related skills kept in the same or neighbouring rows.
  const MOBILE_ORDER = [
    'python', 'java', 'c', 'js', 'ts', 'react', 'rust', 'haskell',
    'flask', 'docker', 'pg', 'actions', 'oracle', 'linux', 'sqlite', 'wireshark',
    'model', 'owasp', 'rbac', 'aes', 'threshold', 'usable', 'sklearn', 'figma',
    'agile', 'leadership', 'writing', 'spss',
  ];
  const M_X = [22, 200], M_Y0 = 34, M_STEP = 58;

  // positions
  const pos = {};
  const row = {};
  if (isSmall) {
    MOBILE_ORDER.forEach((id, i) => {
      row[id] = Math.floor(i / 2);
      pos[id] = [M_X[i % 2], M_Y0 + row[id] * M_STEP];
    });
    svg.setAttribute('viewBox', '0 0 360 ' + (M_Y0 + (Math.ceil(MOBILE_ORDER.length / 2) - 1) * M_STEP + 34));
    svg.classList.add('is-mobile');
  } else {
    NODES.forEach(([id, , x, y]) => { pos[id] = [x, y]; });
    svg.setAttribute('viewBox', '0 0 1240 760');
  }

  const edgeList = EDGES.filter(([a, b]) => !isSmall || Math.abs(row[a] - row[b]) <= 1);

  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k]));
    return e;
  }

  const edgesG = el('g', {});
  const nodesG = el('g', {});
  svg.appendChild(edgesG);
  svg.appendChild(nodesG);

  const edgeEls = {};
  edgeList.forEach(([a, b]) => {
    const line = el('line', {
      class: 'skill-edge', 'data-id': a + '-' + b,
      x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1],
    });
    edgesG.appendChild(line);
    edgeEls[a + '-' + b] = line;
  });

  const nodeEls = {};
  NODES.forEach(([id, label]) => {
    const g = el('g', { class: 'skill-node', 'data-id': id, transform: 'translate(' + pos[id][0] + ',' + pos[id][1] + ')' });
    g.appendChild(el('circle', { class: 'skill-node__hit', r: 22 }));
    g.appendChild(el('circle', { class: 'skill-node__dot', r: 8 }));
    const t = el('text', { x: 16, y: 5 });
    t.textContent = label;
    g.appendChild(t);
    nodesG.appendChild(g);
    nodeEls[id] = g;
  });

  // reveal order: each node, then any edge whose two ends are both visible
  const REVEAL = [];
  const seen = new Set();
  const placed = new Set();
  (isSmall ? MOBILE_ORDER : NODES.map((n) => n[0])).forEach((id) => {
    REVEAL.push(['node', id]);
    seen.add(id);
    edgeList.forEach(([a, b]) => {
      const key = a + '-' + b;
      if (!placed.has(key) && seen.has(a) && seen.has(b)) { placed.add(key); REVEAL.push(['edge', key]); }
    });
  });

  Object.keys(edgeEls).forEach((k) => {
    const line = edgeEls[k];
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.dataset.length = len;
  });

  const neighborMap = {};
  edgeList.forEach(([a, b]) => {
    const line = edgeEls[a + '-' + b];
    (neighborMap[a] = neighborMap[a] || []).push({ neighbor: b, edge: line });
    (neighborMap[b] = neighborMap[b] || []).push({ neighbor: a, edge: line });
  });

  function setState(type, id, visible) {
    const target = type === 'node' ? nodeEls[id] : edgeEls[id];
    if (!target) return;
    target.classList.toggle('is-visible', visible);
    if (type === 'edge') target.style.strokeDashoffset = visible ? 0 : target.dataset.length;
  }
  function revealUpTo(count) {
    REVEAL.forEach(([type, id], i) => setState(type, id, i < count));
  }

  if (reduceMotion || !window.ScrollTrigger) {
    revealUpTo(REVEAL.length);
  } else {
    ScrollTrigger.create({
      trigger: svg,
      start: isSmall ? 'top 80%' : 'top 85%',
      end: isSmall ? 'bottom 70%' : 'bottom 65%',
      scrub: 0.5,
      onUpdate: (self) => revealUpTo(Math.round(self.progress * REVEAL.length)),
    });
  }

  function clearActive() {
    section.classList.remove('is-hovering');
    section.querySelectorAll('.skill-node.is-active, .skill-edge.is-active').forEach((n) => n.classList.remove('is-active'));
  }
  Object.keys(nodeEls).forEach((id) => {
    const node = nodeEls[id];
    function activate() {
      clearActive();
      section.classList.add('is-hovering');
      node.classList.add('is-active');
      (neighborMap[id] || []).forEach(({ neighbor, edge }) => {
        edge.classList.add('is-active');
        nodeEls[neighbor].classList.add('is-active');
      });
    }
    node.addEventListener('mouseenter', activate);
    node.addEventListener('mouseleave', clearActive);
    node.addEventListener('touchstart', (e) => { e.stopPropagation(); activate(); }, { passive: true });
  });
  document.addEventListener('touchstart', clearActive, { passive: true });

  // Rebuild if the screen crosses the phone breakpoint (e.g. rotating a tablet)
  const mq = window.matchMedia('(max-width: 700px)');
  if (mq.addEventListener) mq.addEventListener('change', () => location.reload());
})();
