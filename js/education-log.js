(function () {
  const terminal = document.querySelector('.edu-terminal');
  if (!terminal) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { terminal.classList.add('is-visible'); return; }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        terminal.classList.add('is-visible');
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(terminal);
})();