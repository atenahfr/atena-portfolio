(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paragraphs = document.querySelectorAll('.decrypt-p');
  if (!paragraphs.length) return;

  const CHARSET = '01ABCDEF#$%&*+-/?';

  function scrambleChar(ch) {
    if (ch === ' ' || ch === '\n') return ch;
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }

  const data = Array.from(paragraphs).map((el) => {
    const fullText = el.textContent.trim();
    return { el, fullText, length: fullText.length };
  });

  if (reduceMotion) {
    data.forEach(({ el, fullText }) => { el.textContent = fullText; });
    return;
  }

  const totalLength = data.reduce((sum, d) => sum + d.length, 0);
  let revealChars = 0;

  function render() {
    let remaining = revealChars;
    data.forEach(({ el, fullText, length }) => {
      const localReveal = Math.max(0, Math.min(length, remaining));
      remaining -= localReveal;

      const lockedPart = fullText.slice(0, localReveal);
      const scrambledPart = fullText.slice(localReveal).split('').map(scrambleChar).join('');

      el.innerHTML =
        '<span class="locked">' + lockedPart + '</span>' +
        '<span class="scrambled">' + scrambledPart + '</span>';
    });
  }

  render();

  let intervalId = null;
  function startTicking() { if (!intervalId) intervalId = setInterval(render, 70); }
  function stopTicking() { if (intervalId) { clearInterval(intervalId); intervalId = null; } }

  const section = document.querySelector('.about-decrypt');
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { entry.isIntersecting ? startTicking() : stopTicking(); });
  }, { threshold: 0 }).observe(section);

  ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    end: 'bottom 40%',
    scrub: 0.5,
    onUpdate: (self) => { revealChars = Math.round(self.progress * totalLength); },
  });
})();