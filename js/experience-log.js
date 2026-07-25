(function () {
  const nums = document.querySelectorAll('.exp-runtime__num');
  if (!nums.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  nums.forEach((el) => {
    const target = parseFloat(el.dataset.target || '0');
    if (reduceMotion) { el.textContent = target; return; }

    let done = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !done) {
          done = true;
          const start = performance.now();
          const duration = 900;
          function tick(now) {
            const p = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(target * p);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(el);
  });
})();