/* Scroll choreography and interactions. Canvas sims live in demos.js. */
(function () {
   'use strict';

   document.documentElement.classList.add('js');

   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   /* ---------------------------------------------------------- NAV */
   const nav = document.getElementById('nav');
   if (nav) {
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;height:48px;width:1px;pointer-events:none;';
      document.body.prepend(sentinel);
      new IntersectionObserver(([entry]) => {
         nav.classList.toggle('is-stuck', !entry.isIntersecting);
      }).observe(sentinel);
   }

   /* ------------------------------------------------------ REVEALS */
   const revealables = Array.from(document.querySelectorAll('[data-reveal]'));

   /* stagger siblings that arrive together */
   const groups = new Map();
   revealables.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      el.style.setProperty('--reveal-delay', `${groups.get(parent) * 0.09}s`);
      groups.set(parent, groups.get(parent) + 1);
   });

   const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealIO.unobserve(entry.target);
         }
      });
   }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

   revealables.forEach((el) => revealIO.observe(el));

   /* --------------------------------------------- TRACE SPAN DRAW  */
   const trace = document.querySelector('.trace');
   if (trace && !REDUCED) {
      const spans = trace.querySelectorAll('.trace-span');
      spans.forEach((s) => s.style.setProperty('--span-grow', '0'));
      new IntersectionObserver(([entry], io) => {
         if (!entry.isIntersecting) return;
         spans.forEach((s, i) => {
            setTimeout(() => s.style.setProperty('--span-grow', '1'), 260 + i * 180);
         });
         io.disconnect();
      }, { threshold: 0.35 }).observe(trace);
   }

   /* ------------------------------------- STATEMENT (pinned scrub) */
   const statement = document.querySelector('.statement');
   if (statement && window.gsap && window.ScrollTrigger && !REDUCED) {
      gsap.registerPlugin(ScrollTrigger);

      /* split each part into word spans */
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
         { opacity: 0.1 },
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

   /* -------------------------------------------------- EASTER EGG  */
   try {
      console.log(
         '%cHey, fellow engineer. %cThe source is unminified on purpose: read away.\nhttps://github.com/IllusionistBoi/illusionistboi.github.io',
         'color:#ff7a1a;font-weight:600;font-family:monospace;',
         'color:#a3a3a8;font-family:monospace;'
      );
   } catch (_) { /* ignore */ }
})();
