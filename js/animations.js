gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



if (prefersReducedMotion) {
  document.querySelectorAll('[data-reveal]').forEach((el) => { el.style.opacity = 1; });
} else {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const dir = el.dataset.reveal;
    const x = dir === 'left' ? -40 : dir === 'right' ? 40 : 0;
    const y = dir === 'up' ? 40 : 0;
    gsap.fromTo(el,
      { opacity: 0, x, y },
      {
        opacity: 1, x: 0, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      }
    );
  });
}