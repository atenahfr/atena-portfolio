(function () {
  const section = document.querySelector('.skills-mesh');
  if (!section) return;

  const isSmall = window.matchMedia('(max-width: 700px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REVEAL_ORDER = [
    'node:python', 'node:java', 'edge:python-java',
    'node:c', 'edge:java-c',
    'node:javascript', 'edge:c-javascript',
    'node:rust', 'edge:javascript-rust',
    'node:haskell', 'edge:rust-haskell',
    'node:flask', 'edge:python-flask',
    'node:sqlite', 'edge:flask-sqlite',
    'node:docker', 'edge:flask-docker',
    'node:rbac', 'edge:rbac-flask',
    'node:owasp', 'edge:rbac-owasp', 'edge:owasp-flask',
    'node:aes', 'edge:owasp-aes',
    'node:threshold', 'edge:aes-threshold',
    'node:agile', 'node:leadership', 'edge:agile-leadership', 'edge:leadership-flask',
    'node:writing', 'edge:leadership-writing',
    'node:spss', 'edge:writing-spss',
    'edge:threshold-rust',
  ];

  function getEl(type, id) {
    return type === 'node'
      ? section.querySelector('.skill-node[data-id="' + id + '"]')
      : section.querySelector('.skill-edge[data-id="' + id + '"]');
  }

  const edgeEls = Array.from(section.querySelectorAll('.skill-edge'));
  edgeEls.forEach((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    line.dataset.length = length;
  });

  const neighborMap = {};
  edgeEls.forEach((line) => {
    const [a, b] = line.dataset.id.split('-');
    (neighborMap[a] = neighborMap[a] || []).push({ neighbor: b, edge: line });
    (neighborMap[b] = neighborMap[b] || []).push({ neighbor: a, edge: line });
  });

  function setState(el, type, visible) {
    if (!el) return;
    el.classList.toggle('is-visible', visible);
    if (type === 'edge') el.style.strokeDashoffset = visible ? 0 : el.dataset.length;
  }

  if (reduceMotion) {
    REVEAL_ORDER.forEach((entry) => {
      const [type, id] = entry.split(':');
      setState(getEl(type, id), type, true);
    });
  } else if (isSmall) {
    let played = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !played) {
          played = true;
          const start = performance.now();
          const duration = 2200;
          function tick(now) {
            const p = Math.min(1, (now - start) / duration);
            const revealCount = Math.round(p * REVEAL_ORDER.length);
            REVEAL_ORDER.forEach((item, i) => {
              const [type, id] = item.split(':');
              setState(getEl(type, id), type, i < revealCount);
            });
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(section);
  } else {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 65%',
      scrub: 0.5,
      onUpdate: (self) => {
        const revealCount = Math.round(self.progress * REVEAL_ORDER.length);
        REVEAL_ORDER.forEach((entry, i) => {
          const [type, id] = entry.split(':');
          setState(getEl(type, id), type, i < revealCount);
        });
      },
    });
  }

  Array.from(section.querySelectorAll('.skill-node')).forEach((node) => {
    const id = node.dataset.id;
    function activate() {
      section.classList.add('is-hovering');
      node.classList.add('is-active');
      (neighborMap[id] || []).forEach(({ neighbor, edge }) => {
        edge.classList.add('is-active');
        const n = getEl('node', neighbor);
        if (n) n.classList.add('is-active');
      });
    }
    function deactivate() {
      section.classList.remove('is-hovering');
      node.classList.remove('is-active');
      (neighborMap[id] || []).forEach(({ neighbor, edge }) => {
        edge.classList.remove('is-active');
        const n = getEl('node', neighbor);
        if (n) n.classList.remove('is-active');
      });
    }
    node.addEventListener('mouseenter', activate);
    node.addEventListener('mouseleave', deactivate);
    node.addEventListener('touchstart', (e) => { e.stopPropagation(); activate(); }, { passive: true });
  });

  document.addEventListener('touchstart', () => {
    section.classList.remove('is-hovering');
    section.querySelectorAll('.skill-node.is-active').forEach((n) => n.classList.remove('is-active'));
    section.querySelectorAll('.skill-edge.is-active').forEach((e) => e.classList.remove('is-active'));
  });
})();