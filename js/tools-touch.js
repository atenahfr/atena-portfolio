(function () {
  const cards = document.querySelectorAll('.tool-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      const isOpen = card.classList.contains('is-open');
      cards.forEach((c) => c.classList.remove('is-open'));
      if (!isOpen) card.classList.add('is-open');
    }, { passive: true });
  });

  document.addEventListener('touchstart', () => {
    cards.forEach((c) => c.classList.remove('is-open'));
  });
})();