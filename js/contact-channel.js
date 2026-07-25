(function () {
  const statusText = document.querySelector('.channel-status__text');
  const statusDot = document.querySelector('.channel-status__dot');
  if (!statusText || !statusDot) return;

  setTimeout(() => {
    statusText.textContent = 'CHANNEL OPEN — READY TO RECEIVE';
    statusDot.classList.add('is-open');
  }, 1200);
})();