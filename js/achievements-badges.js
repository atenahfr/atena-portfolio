(function () {
  const badges = document.querySelectorAll('.ach-badge');
  if (!badges.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  badges.forEach((badge, i) => {
    if (reduceMotion) { badge.classList.add('is-visible'); return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => badge.classList.add('is-visible'), i * 150);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(badge);
  });
})();