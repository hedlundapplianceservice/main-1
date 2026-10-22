(() => {
  const gallery = document.getElementById('repair-gallery');
  if (!gallery) return;
  const slides = Array.from(gallery.querySelectorAll('.repair-gallery-slide'));
  const dots = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));
  const play = gallery.querySelector('[data-gallery-play]');
  const count = gallery.querySelector('[data-gallery-count]');
  const status = gallery.querySelector('[data-gallery-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer, visible = false, hovered = false;
  let playing = !reducedMotion.matches;
  const stop = () => { window.clearInterval(timer); timer = undefined; };
  function schedule() {
    stop();
    if (playing && visible && !hovered && !document.hidden && !gallery.contains(document.activeElement)) {
      timer = window.setInterval(() => show(index + 1), 6000);
    }
  }
  function updatePlay() {
    play.textContent = playing ? 'Pause slides' : 'Play slides';
    play.setAttribute('aria-label', playing ? 'Pause automatic slideshow' : 'Start automatic slideshow');
  }
  function show(next, announce = false) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    dots.forEach((dot, i) => { dot.setAttribute('aria-current', String(i === index)); });
    count.textContent = `${index + 1} / ${slides.length}`;
    if (announce) status.textContent = `Photo ${index + 1} of ${slides.length}: ${slides[index].querySelector('h3').textContent}`;
  }
  function manual(next) { playing = false; updatePlay(); stop(); show(next, true); }
  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => manual(index - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => manual(index + 1));
  dots.forEach(dot => dot.addEventListener('click', () => manual(Number(dot.dataset.gallerySlide))));
  play.addEventListener('click', () => { playing = !playing; updatePlay(); schedule(); });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); manual(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  gallery.addEventListener('mouseenter', () => { hovered = true; stop(); });
  gallery.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  gallery.addEventListener('focusin', stop);
  gallery.addEventListener('focusout', () => window.setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) playing = false; updatePlay(); schedule(); });
  let touch;
  gallery.addEventListener('touchstart', event => { const t = event.touches[0]; touch = { x: t.clientX, y: t.clientY }; }, { passive: true });
  gallery.addEventListener('touchend', event => {
    if (!touch) return;
    const t = event.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) manual(index + (dx < 0 ? 1 : -1));
    touch = undefined;
  }, { passive: true });
  gallery.classList.add('is-ready');
  gallery.querySelector('.repair-gallery-controls').hidden = false;
  show(0); updatePlay();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .25 }).observe(gallery);
  } else { visible = true; schedule(); }
})();
