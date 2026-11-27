import { APPS } from './apps.js';

const host = (url) => new URL(url).host;
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
};

/* ---------- App cards + menu ---------- */
function renderApps() {
  const grid = document.querySelector('[data-app-grid]');
  grid.replaceChildren(
    ...APPS.map((app, i) =>
      el('a', { class: 'app-card', href: app.url, rel: 'noopener', 'data-app': app.name },
        el('div', { class: 'app-top' },
          el('span', {}, String(i + 1).padStart(2, '0')),
          el('span', { class: 'app-arrow', 'aria-hidden': 'true' }, '→')),
        el('div', {},
          el('h3', {}, app.name),
          el('span', { class: 'app-domain' }, host(app.url))),
        el('p', { class: 'app-desc' }, app.description),
        el('ul', { class: 'app-tags' }, ...app.tags.map((t) => el('li', {}, t))))),
    el('div', { class: 'app-card soon', 'aria-hidden': 'true' },
      el('strong', {}, 'Sắp có thêm'),
      el('span', {}, 'Công cụ tiếp theo đang được Agent xây dựng.')),
  );

  const menu = document.querySelector('[data-app-menu]');
  menu.replaceChildren(
    ...APPS.map((app) => el('li', {}, el('a', { href: app.url, rel: 'noopener' }, app.name, el('small', {}, host(app.url))))),
  );
}

/* ---------- Menu ---------- */
function setupMenu() {
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (btn.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 300);
    }
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a') || e.target === menu) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* ---------- Scroll state ---------- */
function setupScroll() {
  const bar = document.querySelector('.topbar');
  const orb = document.querySelector('.orb');
  const onScroll = () => {
    const y = window.scrollY;
    bar.classList.toggle('scrolled', y > 40);
    const fade = Math.max(0, 1 - y / 300);
    orb.style.opacity = fade;
    orb.style.pointerEvents = fade < 0.1 ? 'none' : '';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Particle sphere ---------- */
function setupSphere() {
  const canvas = document.querySelector('.hero-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 520;
  // Fibonacci sphere: evenly spread points on a unit sphere
  const pts = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(t) * r, y, Math.sin(t) * r, 0.6 + ((i * 7919) % 100) / 250];
  });
  let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
  let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, w, h);
    tiltX += (targetX - tiltX) * 0.04;
    tiltY += (targetY - tiltY) * 0.04;
    const R = Math.min(Math.max(w * 0.4, 230), h * 0.55, 520);
    const cx = w / 2, cy = h + R * 0.28;
    const a = time * 0.00006 + tiltX;
    const b = -0.35 + tiltY;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    for (const [x, y, z, s] of pts) {
      const x1 = x * ca - z * sa;
      const z1 = x * sa + z * ca;
      const y2 = y * cb - z1 * sb;
      const z2 = y * sb + z1 * cb;
      const depth = (z2 + 1) / 2; // 0 back → 1 front
      const persp = 1 / (1.9 - z2 * 0.6);
      const px = cx + x1 * R * persp * 1.3;
      const py = cy + y2 * R * persp * 1.3;
      if (py < -10 || py > h + 10) continue;
      const fadeTop = Math.min(1, Math.max(0, (py - h * 0.6) / (h * 0.22)));
      const alpha = (0.08 + depth * 0.82) * fadeTop;
      if (alpha < 0.02) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, (0.5 + depth * 2.1) * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduce && visible) raf = requestAnimationFrame(draw);
  };

  const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  resize();
  start();
  window.addEventListener('resize', () => { resize(); if (reduce) start(); });
  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.25;
    }, { passive: true });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
}

renderApps();
setupMenu();
setupScroll();
setupSphere();
const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
