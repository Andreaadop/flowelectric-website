/* ============================================================
   FLOW ELECTRIC INC — SHARED JS
   ============================================================ */

import { gsap } from '/node_modules/gsap/dist/gsap.min.js';
import { ScrollTrigger } from '/node_modules/gsap/dist/ScrollTrigger.min.js';
import Lenis from '/node_modules/lenis/dist/lenis.min.js';
import Splitting from '/node_modules/splitting/dist/splitting.min.js';

gsap.registerPlugin(ScrollTrigger);

/* ─── LENIS SMOOTH SCROLL ─────────────────────────────────── */
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ─── NAV ─────────────────────────────────────────────────── */
const nav = document.querySelector('.o-nav');

// Scrolled state — green border appears after 80px
window.addEventListener('scroll', () => {
  nav?.classList.toggle('is-scrolled', window.scrollY > 80);
}, { passive: true });

// Mobile menu
const burger = document.querySelector('.o-nav__burger');
if (burger) {
  burger.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('-isMenuOpen');
    burger.setAttribute('aria-expanded', isOpen);
  });
}
document.querySelectorAll('.o-menu__link').forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('-isMenuOpen');
    burger?.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.body.classList.remove('-isMenuOpen');
    burger?.setAttribute('aria-expanded', 'false');
  }
});

// Services dropdown — click toggle + outside click to close
document.querySelectorAll('.o-nav__dropdown-wrap').forEach(wrap => {
  const trigger = wrap.querySelector('.o-nav__dropdown-trigger');
  wrap.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = wrap.classList.toggle('is-open');
    trigger?.setAttribute('aria-expanded', isOpen);
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.o-nav__dropdown-wrap.is-open').forEach(el => {
    el.classList.remove('is-open');
    el.querySelector('.o-nav__dropdown-trigger')?.setAttribute('aria-expanded', 'false');
  });
});

/* ─── ACTIVE NAV LINK ─────────────────────────────────────── */
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll('.o-nav__link[href]').forEach(link => {
  const href = link.getAttribute('href').replace(/\/$/, '') || '/';
  if (href === currentPath) link.classList.add('is-active');
});

/* ─── CUSTOM CURSOR ───────────────────────────────────────── */
const cursor = document.querySelector('.cursor');
if (cursor && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}

/* ─── SPLITTING.JS TEXT REVEALS ───────────────────────────── */
Splitting({ targets: '[data-splitting]' });

document.querySelectorAll('[data-splitting]').forEach(el => {
  const chars = el.querySelectorAll('.char');
  if (!chars.length) return;

  const isHero = !!el.closest('.hero');

  if (isHero) {
    // Hero headline: animate immediately on page load
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.022,
      delay: 0.2,
    });
  } else {
    // Other headings: animate on scroll
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.018,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  }
});

/* ─── SCROLL REVEALS ──────────────────────────────────────── */
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => el.classList.add('in'),
  });
});

// Stagger children
document.querySelectorAll('.reveal-stagger').forEach(el => {
  const items = el.querySelectorAll(':scope > *');
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => items.forEach(item => item.classList.add('in')),
  });
});

/* ─── HERO VIDEO TRIGGER ──────────────────────────────────── */
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      heroVideo.play().catch(() => {
        // Autoplay blocked — video stays paused (no error shown)
      });
      heroVideo.addEventListener('ended', () => heroVideo.pause(), { once: true });
    },
  });
}

/* ─── BOLT SCENE ──────────────────────────────────────────── */
(function () {
  const scene  = document.querySelector('.bolt-scene');
  const bolt   = document.querySelector('.bolt-scene__bolt');
  const layerA = document.querySelector('.bolt-scene__layer--a');
  const textB  = document.querySelector('.bolt-scene__text--b');
  if (!scene || !bolt || !layerA) return;

  const lerp   = (a, b, t) => a + (b - a) * t;
  const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const easeIO = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  let raf;
  function update() {
    const rect       = scene.getBoundingClientRect();
    const scrollable = scene.offsetHeight - window.innerHeight;
    const raw        = clamp(-rect.top / scrollable, 0, 1);

    // Phase 1 (0 → 0.35): draw bolt top to bottom via clip-path
    const p1e        = easeIO(clamp(raw / 0.35, 0, 1));
    const clipBottom = (1 - p1e) * 100;

    // Phase 2 (0.35 → 0.80): scale + rotate + fade layerA revealing green bg
    const phase2 = clamp((raw - 0.35) / 0.45, 0, 1);
    const p2e    = easeIO(phase2);
    const scale  = lerp(1, 18, p2e);
    const rotate = lerp(0, 40, p2e);
    layerA.style.opacity = (1 - p2e).toFixed(3);

    // Phase 3 (0.80 → 1.00): text B appears
    const phase3 = clamp((raw - 0.80) / 0.20, 0, 1);
    if (textB) textB.classList.toggle('is-visible', phase3 > 0.4);

    if (phase2 === 0) {
      bolt.style.clipPath  = `inset(0 0 ${clipBottom.toFixed(1)}% 0 round 2px)`;
      bolt.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
    } else {
      bolt.style.clipPath  = 'none';
      bolt.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`;
    }
    raf = null;
  }

  window.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
})();
