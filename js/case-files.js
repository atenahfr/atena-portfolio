(function () {
  const isSmall = window.matchMedia('(max-width: 700px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const caseFiles = document.querySelectorAll('.case-file');
  if (!caseFiles.length) return;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function mapRange(p, start, end) { return clamp((p - start) / (end - start), 0, 1); }

  caseFiles.forEach((section) => {
    const typeEl = section.querySelector('.case-file__type');
    const fullText = typeEl ? typeEl.dataset.fullText || '' : '';
    const tag = section.querySelector('.case-file__tag');
    const title = section.querySelector('.case-file__title');
    const desc = section.querySelector('.case-file__desc');
    const links = section.querySelector('.case-file__links');
    const stats = section.querySelectorAll('.case-stat__num');
    const sticky = section.querySelector('.case-file__sticky');

    if (isSmall || reduceMotion) {
      if (typeEl) typeEl.textContent = fullText;
      [tag, title, desc, links].forEach((el) => { if (el) { el.style.opacity = 1; el.style.transform = 'none'; } });
      stats.forEach((el) => { el.textContent = el.dataset.target; });
      return;
    }

    function render(p) {
      const typeP = mapRange(p, 0, 0.15);
      if (typeEl) typeEl.textContent = fullText.slice(0, Math.round(fullText.length * typeP));

      const revealP = mapRange(p, 0.15, 0.35);
      [tag, title, desc].forEach((el, i) => {
        if (!el) return;
        const local = clamp(revealP - i * 0.1, 0, 1);
        el.style.opacity = local;
        el.style.transform = `translateY(${16 * (1 - local)}px)`;
      });

      const statP = mapRange(p, 0.35, 0.6);
      stats.forEach((el) => {
        const target = parseFloat(el.dataset.target || '0');
        el.textContent = Math.round(target * statP);
      });

      const linkP = mapRange(p, 0.6, 0.75);
      if (links) {
        links.style.opacity = linkP;
        links.style.transform = `translateY(${16 * (1 - linkP)}px)`;
      }
    }

    render(0);

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: sticky,
      scrub: 0.4,
      onUpdate: (self) => render(self.progress),
    });
  });
})();