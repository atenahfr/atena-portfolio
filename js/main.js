function initMagnetic(selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    const wrap = btn.closest('.magnetic-wrap') || btn.parentElement;
    wrap.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    wrap.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
}

function initTilt(selector) {
  document.querySelectorAll(selector).forEach((card) => {
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateX(${-py * 12}deg) rotateY(${px * 12}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMagnetic('.magnetic');
  initTilt('.tilt');
  document.querySelectorAll('.chip').forEach((chip, i) => {
  chip.style.animationDelay = `${i * 0.15}s`;
  });
});