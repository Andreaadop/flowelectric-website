/* ============================================================
   FLOW ELECTRIC INC — SHARED JS
   ============================================================ */

import { gsap } from '/node_modules/gsap/index.js';
import { ScrollTrigger } from '/node_modules/gsap/ScrollTrigger.js';
import Lenis from '/node_modules/lenis/dist/lenis.mjs';

/* ─── INLINE CHAR SPLITTER (replaces Splitting.js) ───────── */
function Splitting({ targets }) {
  document.querySelectorAll(targets).forEach(el => {
    el.classList.add('splitting');
    el.setAttribute('aria-label', el.textContent);
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const frag = document.createDocumentFragment();
        [...node.textContent.trim()].forEach(c => {
          const span = document.createElement('span');
          span.className = 'char';
          if (c === ' ') { span.textContent = '\u00a0'; span.style.display = 'inline'; }
          else span.textContent = c;
          frag.appendChild(span);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(processNode);
      }
    };
    [...el.childNodes].forEach(processNode);
  });
}

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

/* ─── SPLITTING.JS TEXT REVEALS ───────────────────────────── */
Splitting({ targets: '[data-splitting]' });

document.querySelectorAll('[data-splitting]').forEach(el => {
  const chars = el.querySelectorAll('.char');
  if (!chars.length) return;

  const isHero = !!el.closest('.hero, .page-hero');

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
    // Other headings: animate via IntersectionObserver
    const animate = () => gsap.to(chars, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.018 });
    if (el.getBoundingClientRect().top < window.innerHeight) {
      animate();
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { animate(); io.disconnect(); }
      }, { threshold: 0.1 });
      io.observe(el);
    }
  }
});

/* ─── SCROLL REVEALS (IntersectionObserver) ───────────────── */
function addIn(el) { el.classList.add('in'); }

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      addIn(e.target);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  if (el.getBoundingClientRect().top < window.innerHeight) {
    addIn(el);
  } else {
    revealObs.observe(el);
  }
});

// Stagger children
document.querySelectorAll('.reveal-stagger').forEach(el => {
  const triggerStagger = () => el.querySelectorAll(':scope > *').forEach(item => item.classList.add('in'));
  if (el.getBoundingClientRect().top < window.innerHeight) {
    triggerStagger();
  } else {
    const staggerObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          triggerStagger();
          staggerObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });
    staggerObs.observe(el);
  }
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

/* ─── INSTAGRAM REELS ─────────────────────────────────────── */
document.querySelectorAll('.ig-reel').forEach(reel => {
  const video = reel.querySelector('.ig-reel__video');
  if (!video) return;

  reel.addEventListener('mouseenter', () => {
    video.play().catch(() => {});
    reel.classList.add('is-playing');
  });

  reel.addEventListener('mouseleave', () => {
    video.pause();
    reel.classList.remove('is-playing');
    reel.style.removeProperty('--tilt-x');
    reel.style.removeProperty('--tilt-y');
  });

  // 3D tilt follows cursor within the phone
  reel.addEventListener('mousemove', e => {
    const phone = reel.querySelector('.ig-reel__phone');
    if (!phone) return;
    const rect = phone.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    reel.style.setProperty('--tilt-x', `${(-y * 10).toFixed(1)}deg`);
    reel.style.setProperty('--tilt-y', `${( x * 10).toFixed(1)}deg`);
  });
});

/* ─── SERVICE AREA CURSOR PARALLAX ───────────────────────── */
(function () {
  const section = document.querySelector('.service-area');
  const mapWrap = section?.querySelector('.service-area__map-wrap');
  if (!section || !mapWrap) return;

  const MAX_X = 28; // px
  const MAX_Y = 18;
  const LERP  = 0.055;

  let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null;

  function tick() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    mapWrap.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
    rafId = requestAnimationFrame(tick);
  }

  section.addEventListener('mousemove', e => {
    const r = section.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width  - 0.5) * -MAX_X * 2;
    ty = ((e.clientY - r.top)  / r.height - 0.5) * -MAX_Y * 2;
  }, { passive: true });

  section.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  // Start the loop once, keep it alive
  tick();
})();

/* ─── BOLT SCENE ──────────────────────────────────────────── */
(function () {
  const scene  = document.querySelector('.bolt-scene');
  const bolt   = document.querySelector('.bolt-scene__bolt');
  const layerA = document.querySelector('.bolt-scene__layer--a');
  const textB   = document.querySelector('.bolt-scene__text--b');
  const bgLines = document.querySelector('.bolt-scene__bg-lines');
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
    if (textB)   textB.classList.toggle('is-visible',   phase3 > 0.4);
    if (bgLines) bgLines.classList.toggle('is-visible', phase3 > 0.2);

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
