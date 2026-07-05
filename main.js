/* Scroll choreography and interactions. Canvas sims live in demos.js. */
(function () {
   'use strict';

   document.documentElement.classList.add('js');

   const html = document.documentElement;
   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);

   if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

   /* -------------------------------------------------------- INTRO
      Apple-style hello sequence: once per session, never under
      reduced motion, always with a failsafe. */
   (function intro() {
      const el = document.getElementById('intro');
      if (!el) return;

      const finish = () => {
         el.classList.add('gone');
         html.classList.add('intro-done');
         html.classList.remove('intro-lock');
      };

      let seen = false;
      try { seen = sessionStorage.getItem('rd-intro') === '1'; } catch (_) { /* ignore */ }

      if (REDUCED || seen) { finish(); return; }

      try { sessionStorage.setItem('rd-intro', '1'); } catch (_) { /* ignore */ }
      html.classList.add('intro-lock');

      const words = ['Hello', 'नमस्ते', 'Dia dhuit', 'Bonjour', 'こんにちは', 'Hola', 'Hello'];
      const wordEl = document.getElementById('intro-word');
      let i = 0;

      const step = () => {
         i += 1;
         if (i < words.length) {
            wordEl.textContent = words[i];
            setTimeout(step, i === words.length - 1 ? 340 : 150);
         } else {
            el.classList.add('done');
            html.classList.add('intro-done');
            html.classList.remove('intro-lock');
            el.addEventListener('transitionend', () => el.classList.add('gone'), { once: true });
            setTimeout(() => el.classList.add('gone'), 1200); /* failsafe */
         }
      };
      setTimeout(step, 300);
      setTimeout(finish, 4000); /* absolute failsafe */
   })();

   /* ---------------------------------------------------------- NAV */
   const nav = document.getElementById('nav');
   if (nav) {
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;height:48px;width:1px;pointer-events:none;';
      document.body.prepend(sentinel);
      new IntersectionObserver((entries) => {
         nav.classList.toggle('is-stuck', !entries[entries.length - 1].isIntersecting);
      }).observe(sentinel);

      /* scrollspy for in-flow sections; the fixed footer is handled
         by scroll progress further down */
      const links = new Map();
      nav.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
         const id = a.getAttribute('href').slice(1);
         if (id !== 'contact') links.set(id, a);
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

   /* the footer is position:fixed on desktop, so anchor-scrolling to it
      does nothing; scroll to the end of the document instead */
   document.querySelectorAll('a[href="#contact"]').forEach((a) => {
      a.addEventListener('click', (e) => {
         e.preventDefault();
         window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: REDUCED ? 'auto' : 'smooth'
         });
      });
   });

   /* ------------------------------------- SCROLL PROGRESS + RULER */
   const progressEl = document.querySelector('.scroll-progress i');
   const navContact = document.getElementById('nav-contact');

   if (HAS_GSAP && !REDUCED && progressEl) {
      gsap.to(progressEl, {
         scaleX: 1,
         ease: 'none',
         scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
      });
   }

   (function ruler() {
      const wrap = document.getElementById('ruler');
      if (!wrap || !HAS_GSAP) return;
      if (!window.matchMedia('(min-width: 1100px)').matches) return;

      const ticksBox = document.getElementById('ruler-ticks');
      for (let i = 0; i < 41; i++) ticksBox.appendChild(document.createElement('i'));
      wrap.classList.add('ready');
      html.classList.add('ruler-on');

      const cursor = document.getElementById('ruler-cursor');
      const num = document.getElementById('ruler-num');

      ScrollTrigger.create({
         start: 0,
         end: 'max',
         onUpdate(self) {
            const travel = ticksBox.offsetHeight - 1;
            cursor.style.transform = `translateY(${self.progress * travel}px)`;
            num.textContent = Math.round(self.progress * 100);
            if (navContact) navContact.classList.toggle('active', self.progress > 0.96);
         }
      });
   })();

   /* fallback contact spy when the ruler is off (mobile / no ruler) */
   if (HAS_GSAP && navContact && !html.classList.contains('ruler-on')) {
      ScrollTrigger.create({
         start: 0,
         end: 'max',
         onUpdate(self) {
            navContact.classList.toggle('active', self.progress > 0.96);
         }
      });
   }

   /* ------------------------------------------------------ REVEALS
      Reversible: in on the way down, back out on the way up. Without
      GSAP or with reduced motion, content simply stays visible. */
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

   /* --------------------------------------------- ASCENT (journey) */
   (function ascent() {
      const wrap = document.querySelector('.ascent');
      if (!wrap || !HAS_GSAP || REDUCED) return;
      if (!window.matchMedia('(min-width: 861px)').matches) return;

      const path = wrap.querySelector('.ascent-path');
      const marks = wrap.querySelectorAll('.ascent-mark');
      const len = path.getTotalLength();
      if (!len) return;

      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

      const tl = gsap.timeline({
         scrollTrigger: {
            trigger: wrap,
            start: 'top 84%',
            end: 'bottom 40%',
            scrub: 0.5
         }
      });

      tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      marks.forEach((m, i) => {
         tl.fromTo(m,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.09 },
            (i / marks.length) * 0.88
         );
      });
   })();

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

   /* ------------------------------------------ FOOTER CURTAIN SIZE
      The fixed footer needs the page above to reserve its height. */
   (function footerReveal() {
      const page = document.getElementById('page-above');
      const contact = document.getElementById('contact');
      if (!page || !contact) return;

      const mq = window.matchMedia('(min-width: 861px)');
      let t = 0;
      const size = () => {
         page.style.marginBottom = mq.matches ? contact.offsetHeight + 'px' : '';
         if (HAS_GSAP) {
            clearTimeout(t);
            t = setTimeout(() => ScrollTrigger.refresh(), 150);
         }
      };

      new ResizeObserver(size).observe(contact);
      mq.addEventListener('change', size);
      size();
   })();

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

   /* ------------------------------------------------ VIDEO LIFECYCLE */
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
