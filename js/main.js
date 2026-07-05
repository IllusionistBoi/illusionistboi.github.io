/* Scroll choreography and interactions. Canvas sims live in demos.js. */
(function () {
   'use strict';

   document.documentElement.classList.add('js');

   const html = document.documentElement;
   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);

   if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

   /* -------------------------------------------------------- INTRO
      Greeting sequence with a live counter; the panels split apart to
      reveal the page. Plays on every load, never under reduced motion,
      always with failsafes. */
   (function intro() {
      const el = document.getElementById('intro');
      if (!el) return;

      const finish = () => {
         el.classList.add('gone');
         html.classList.add('intro-done');
         html.classList.remove('intro-lock');
      };

      /* pages restored from the back/forward cache do not re-run scripts */
      window.addEventListener('pageshow', (e) => { if (e.persisted) finish(); });

      if (REDUCED) { finish(); return; }

      html.classList.add('intro-lock');

      /* eighteen greetings, then the doors open */
      const words = [
         'Hello', 'नमस्ते', 'Dia dhuit', 'Bonjour', 'Hola', 'こんにちは',
         '안녕하세요', '你好', 'Ciao', 'Olá', 'Hallo', 'Привет', 'مرحبا',
         'Γειά σου', 'Merhaba', 'Xin chào', 'Hej', "Let's get you in."
      ];
      const wordEl = document.getElementById('intro-word');
      const countEl = document.getElementById('intro-count');
      let i = 0;

      const delayFor = (idx) => {
         if (idx >= words.length - 1) return 1450;           /* let the closer breathe */
         const mid = words.length / 2;
         const dist = Math.abs(idx - mid) / mid;             /* 0 center, 1 edges */
         return 90 + dist * dist * 130;                      /* 90ms center, ~220ms edges */
      };

      /* timestamp-driven: background-tab timer throttling cannot strand
         the sequence; on wake it snaps to the correct position */
      const bounds = [];
      let total = 460;
      for (let k = 1; k < words.length; k++) { bounds.push(total); total += delayFor(k); }
      const t0 = performance.now();

      const swap = (text, final) => {
         wordEl.textContent = text;
         if (!wordEl.animate) return;
         if (final) {
            /* the closer settles in softly instead of snapping */
            wordEl.animate(
               [
                  { opacity: 0, transform: 'translateY(18px) scale(0.95)', filter: 'blur(8px)' },
                  { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
               ],
               { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
            );
         } else {
            wordEl.animate(
               [
                  { opacity: 0.2, transform: 'translateY(10px)', filter: 'blur(5px)' },
                  { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
               ],
               { duration: 120, easing: 'ease-out' }
            );
         }
      };

      const openDoors = () => {
         el.classList.add('done');
         html.classList.add('intro-done');
         html.classList.remove('intro-lock');
         el.querySelector('.ip-top').addEventListener('transitionend', () => el.classList.add('gone'), { once: true });
         setTimeout(() => el.classList.add('gone'), 1500); /* failsafe */
      };

      let timer = 0;
      const drive = () => {
         clearTimeout(timer);
         const t = performance.now() - t0;
         if (countEl) countEl.textContent = String(Math.min(100, Math.round(t / total * 100))).padStart(2, '0');

         let idx = 0;
         for (let k = 0; k < bounds.length; k++) if (t >= bounds[k]) idx = k + 1;
         if (idx !== i) {
            i = idx;
            const isFinal = i === words.length - 1;
            swap(words[i], isFinal);
            if (isFinal) wordEl.classList.add('intro-final');
         }

         if (t >= total) {
            document.removeEventListener('visibilitychange', drive);
            openDoors();
         } else {
            timer = setTimeout(drive, 50);
         }
      };
      drive();
      document.addEventListener('visibilitychange', drive);
      setTimeout(finish, 9000); /* absolute failsafe */
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

   /* ------------------------------------- CHART CLICK NAVIGATION
      Bars and ascent milestones jump to the matching role or section. */
   const goTo = (target) => {
      if (!target) return;
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      target.classList.remove('flash');
      void target.offsetWidth;
      target.classList.add('flash');
   };

   document.querySelectorAll('.tr-row').forEach((row) => {
      row.addEventListener('click', () => {
         goTo(document.querySelector(`.trace-role[data-trace="${row.dataset.trace}"]`));
      });
   });

   document.querySelectorAll('.ascent-mark[data-goto]').forEach((mark) => {
      mark.addEventListener('click', () => {
         const target = document.querySelector(mark.dataset.goto);
         if (!target) return;
         if (mark.dataset.goto === '#education') {
            target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
            target.querySelectorAll('.edu-card').forEach((c) => {
               c.classList.remove('flash');
               void c.offsetWidth;
               c.classList.add('flash');
            });
         } else {
            goTo(target);
         }
      });
   });

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

   /* --------------------------------------- PRINCIPLES (scrubbed)
      The three lines brighten and settle with the scroll itself, so
      the section never pops; reversing is free. */
   if (HAS_GSAP && !REDUCED) {
      const lines = gsap.utils.toArray('.principles-list li');
      if (lines.length) {
         gsap.fromTo(lines,
            { autoAlpha: 0.12, x: -30 },
            {
               autoAlpha: 1,
               x: 0,
               stagger: 0.4,
               ease: 'none',
               scrollTrigger: {
                  trigger: '.principles',
                  start: 'top 78%',
                  end: 'top 18%',
                  scrub: 0.5
               }
            }
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

      /* the revealed footer rises with the curtain instead of sitting
         statically underneath it */
      if (HAS_GSAP && !REDUCED && mq.matches) {
         const items = contact.querySelectorAll('.contact-inner > *');
         gsap.fromTo(items,
            { y: 48, autoAlpha: 0 },
            {
               y: 0,
               autoAlpha: 1,
               stagger: 0.08,
               ease: 'none',
               scrollTrigger: {
                  start: () => ScrollTrigger.maxScroll(window) - contact.offsetHeight,
                  end: () => ScrollTrigger.maxScroll(window),
                  scrub: 0.4
               }
            }
         );
      }
   })();

   /* ------------------------------------------- EMAIL COPY-BURST
      Click copies the address; the letters shatter into particles and
      the line reassembles as a confirmation, then restores itself.
      If the clipboard is unavailable, the mailto link works as normal. */
   (function emailMagic() {
      const email = document.querySelector('.contact-email');
      if (!email) return;

      const address = email.textContent.trim();
      email.setAttribute('aria-label', address);

      const inner = document.querySelector('.contact-inner');
      const HINT_REST = 'click the address to copy it';
      const hint = document.createElement('p');
      hint.className = 'email-hint';
      hint.textContent = HINT_REST;
      email.insertAdjacentElement('afterend', hint);

      const copy = () => navigator.clipboard
         ? navigator.clipboard.writeText(address)
         : Promise.reject(new Error('no clipboard'));

      /* minimal path: copy still works, no theatrics */
      if (!HAS_GSAP || REDUCED) {
         email.addEventListener('click', (e) => {
            e.preventDefault();
            copy().then(() => {
               hint.textContent = 'copied';
               hint.classList.add('is-copied');
               setTimeout(() => { hint.textContent = HINT_REST; hint.classList.remove('is-copied'); }, 1800);
            }).catch(() => { window.location.href = email.href; });
         });
         return;
      }

      const setChars = (text) => {
         email.textContent = '';
         return text.split('').map((ch) => {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch;
            s.setAttribute('aria-hidden', 'true');
            email.appendChild(s);
            return s;
         });
      };
      let chars = setChars(address);

      /* particle overlay lives on the footer, above everything in it */
      const cv = document.createElement('canvas');
      cv.className = 'email-burst';
      inner.appendChild(cv);
      const ctx = cv.getContext('2d');
      let particles = [], burstRaf = 0;

      function burstFrom(spans) {
         const box = inner.getBoundingClientRect();
         cv.width = Math.round(box.width * 2);
         cv.height = Math.round(box.height * 2);
         cv.style.width = box.width + 'px';
         cv.style.height = box.height + 'px';
         ctx.setTransform(2, 0, 0, 2, 0, 0);

         particles = [];
         spans.forEach((s) => {
            const r = s.getBoundingClientRect();
            const cx = r.left - box.left + r.width / 2;
            const cy = r.top - box.top + r.height / 2;
            for (let p = 0; p < 5; p++) {
               particles.push({
                  x: cx + (Math.random() - 0.5) * r.width,
                  y: cy + (Math.random() - 0.5) * r.height,
                  vx: (Math.random() - 0.5) * 190,
                  vy: -40 - Math.random() * 150,
                  size: 1 + Math.random() * 2.2,
                  life: 0.9 + Math.random() * 0.5,
                  warm: Math.random() < 0.75
               });
            }
         });

         let last = performance.now();
         cancelAnimationFrame(burstRaf);
         (function frame(now) {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            ctx.clearRect(0, 0, cv.width, cv.height);
            let alive = false;
            particles.forEach((pt) => {
               if (pt.life <= 0) return;
               alive = true;
               pt.life -= dt * 1.1;
               pt.vy += 260 * dt;                             /* gravity */
               pt.x += pt.vx * dt;
               pt.y += pt.vy * dt;
               ctx.globalAlpha = Math.max(0, pt.life);
               ctx.fillStyle = pt.warm ? '#ff7a1a' : '#f5f1e9';
               ctx.beginPath();
               ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
               ctx.fill();
            });
            ctx.globalAlpha = 1;
            if (alive) burstRaf = requestAnimationFrame(frame);
            else ctx.clearRect(0, 0, cv.width, cv.height);
         })(last);
      }

      /* showcase the interaction: letters ripple on hover, and once
         when the footer first comes into view */
      let busy = false;
      const wave = () => {
         if (busy) return;
         gsap.to(email.querySelectorAll('.char'), {
            y: -7,
            duration: 0.18,
            stagger: 0.013,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
         });
      };

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
         email.addEventListener('pointerenter', () => {
            if (busy) return;
            wave();
            hint.textContent = 'go on, click';
            hint.classList.add('is-hot');
         });
         email.addEventListener('pointerleave', () => {
            if (busy) return;
            hint.textContent = HINT_REST;
            hint.classList.remove('is-hot');
         });
      }

      let waved = false;
      ScrollTrigger.create({
         start: () => ScrollTrigger.maxScroll(window) - document.getElementById('contact').offsetHeight * 0.6,
         end: () => ScrollTrigger.maxScroll(window) + 1,
         onEnter() {
            if (waved) return;
            waved = true;
            setTimeout(wave, 700);
         }
      });

      email.addEventListener('click', (e) => {
         e.preventDefault();
         if (busy) return;

         copy().then(() => {
            busy = true;
            hint.textContent = 'in your clipboard';
            hint.classList.add('is-copied');

            burstFrom(chars);
            gsap.set(chars, { opacity: 0 });

            setTimeout(() => {
               chars = setChars('Copied.');
               gsap.fromTo(chars,
                  { opacity: 0, y: 14, rotateX: -60 },
                  { opacity: 1, y: 0, rotateX: 0, stagger: 0.045, duration: 0.4, ease: 'back.out(1.8)' }
               );
            }, 260);

            setTimeout(() => {
               gsap.to(email.querySelectorAll('.char'), {
                  opacity: 0, y: -10, duration: 0.2, stagger: 0.02,
                  onComplete() {
                     chars = setChars(address);
                     gsap.fromTo(chars,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, stagger: 0.014, duration: 0.35, ease: 'power3.out' }
                     );
                     hint.textContent = HINT_REST;
                     hint.classList.remove('is-copied', 'is-hot');
                     busy = false;
                  }
               });
            }, 2100);
         }).catch(() => { window.location.href = email.href; });
      });
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

   /* positions shift as fonts/media settle; re-measure once loaded */
   if (HAS_GSAP) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
   }

   /* -------------------------------------------------- EASTER EGG  */
   try {
      console.log(
         '%cHey, fellow engineer. %cThe source is unminified on purpose: read away.\nhttps://github.com/IllusionistBoi/illusionistboi.github.io\n%cmcp_servers_in_production: true',
         'color:#ff7a1a;font-weight:600;font-family:monospace;',
         'color:#a3a3a8;font-family:monospace;',
         'color:#3ecf8e;font-family:monospace;'
      );
   } catch (_) { /* ignore */ }
})();
