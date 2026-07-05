/* Scroll choreography and interactions. Canvas sims live in demos.js. */
(function () {
   'use strict';

   document.documentElement.classList.add('js');

   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);

   if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

   /* ---------------------------------------------------------- NAV */
   const nav = document.getElementById('nav');
   if (nav) {
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;height:48px;width:1px;pointer-events:none;';
      document.body.prepend(sentinel);
      new IntersectionObserver((entries) => {
         nav.classList.toggle('is-stuck', !entries[entries.length - 1].isIntersecting);
      }).observe(sentinel);

      /* scrollspy: underline the section currently in view */
      const links = new Map();
      nav.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
         links.set(a.getAttribute('href').slice(1), a);
      });
      const spy = new IntersectionObserver((entries) => {
         entries.forEach((entry) => {
            const link = links.get(entry.target.id);
            if (link) link.classList.toggle('active', entry.isIntersecting);
         });
      }, { rootMargin: '-40% 0px -55% 0px' });
      links.forEach((_, id) => {
         const target = document.getElementById(id);
         if (target) spy.observe(target);
      });
   }

   /* -------------------------------------------------- SCROLL PROGRESS */
   const progress = document.querySelector('.scroll-progress i');
   if (progress && HAS_GSAP && !REDUCED) {
      gsap.to(progress, {
         scaleX: 1,
         ease: 'none',
         scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
      });
   }

   /* ------------------------------------------------------ REVEALS
      GSAP-driven and reversible: elements animate in on the way down
      and back out when you scroll up past them. IO fallback keeps
      content visible when GSAP is unavailable. */
   if (HAS_GSAP && !REDUCED) {
      const groups = new Map();
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
         const parent = el.parentElement;
         const idx = groups.get(parent) || 0;
         groups.set(parent, idx + 1);

         gsap.fromTo(el,
            { y: 34, autoAlpha: 0 },
            {
               y: 0,
               autoAlpha: 1,
               duration: 0.9,
               delay: idx * 0.08,
               ease: 'power3.out',
               scrollTrigger: {
                  trigger: el,
                  start: 'top 88%',
                  toggleActions: 'play none none reverse'
               }
            }
         );
      });
   }

   /* --------------------------------------------- TRACE: bars + hover */
   const trace = document.querySelector('.trace');
   if (trace) {
      const bars = trace.querySelectorAll('.tr-bar');
      if (HAS_GSAP && !REDUCED && bars.length) {
         gsap.fromTo(bars,
            { scaleX: 0 },
            {
               scaleX: 1,
               duration: 1,
               stagger: 0.12,
               ease: 'power3.out',
               scrollTrigger: {
                  trigger: trace,
                  start: 'top 75%',
                  toggleActions: 'play none none reverse'
               }
            }
         );
      }

      /* hovering a role row lights up its span in the chart (and back) */
      const link = (fromSel) => {
         trace.querySelectorAll(fromSel).forEach((el) => {
            const idx = el.dataset.trace;
            const peers = trace.querySelectorAll(`[data-trace="${idx}"]`);
            el.addEventListener('pointerenter', () => peers.forEach((p) => p.classList.add('hot')));
            el.addEventListener('pointerleave', () => peers.forEach((p) => p.classList.remove('hot')));
         });
      };
      link('.trace-role');
      link('.tr-row');
   }

   /* ------------------------------------- STATEMENT (pinned scrub) */
   const statement = document.querySelector('.statement');
   if (statement && HAS_GSAP && !REDUCED) {
      statement.querySelectorAll('.statement-part').forEach((part) => {
         const words = part.textContent.trim().split(/\s+/);
         part.textContent = '';
         words.forEach((w) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = w;
            part.appendChild(span);
         });
      });

      const words = statement.querySelectorAll('.word');
      const after = statement.querySelector('.statement-after');
      if (after) after.removeAttribute('data-reveal');

      const tl = gsap.timeline({
         scrollTrigger: {
            trigger: statement,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6
         }
      });

      tl.fromTo(words,
         { opacity: 0.16 },
         { opacity: 1, stagger: 0.6, duration: 2, ease: 'none' }
      );

      if (after) {
         tl.fromTo(after,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 3, ease: 'power2.out' },
            '>-1'
         );
      }
   }

   /* ----------------------------------------------- SPOTLIGHT PANELS */
   if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.spotlight').forEach((panel) => {
         panel.addEventListener('pointermove', (e) => {
            const r = panel.getBoundingClientRect();
            panel.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
            panel.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
         }, { passive: true });
      });
   }

   /* ------------------------------------------------ VIDEO LIFECYCLE
      Autoplay only while on screen; never autoplay under reduced motion. */
   document.querySelectorAll('video').forEach((video) => {
      if (REDUCED) {
         video.removeAttribute('autoplay');
         video.pause();
         video.setAttribute('controls', 'controls');
         return;
      }
      /* autoplay races the observer, so take manual control */
      video.removeAttribute('autoplay');
      video.pause();
      new IntersectionObserver((entries) => {
         if (entries[entries.length - 1].isIntersecting) video.play().catch(() => {});
         else video.pause();
      }, { rootMargin: '80px' }).observe(video);
   });

   /* -------------------------------------------------- EASTER EGG  */
   try {
      console.log(
         '%cHey, fellow engineer. %cThe source is unminified on purpose: read away.\nhttps://github.com/IllusionistBoi/illusionistboi.github.io',
         'color:#ff7a1a;font-weight:600;font-family:monospace;',
         'color:#a3a3a8;font-family:monospace;'
      );
   } catch (_) { /* ignore */ }
})();
