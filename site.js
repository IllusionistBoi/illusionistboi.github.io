(function () {
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

   const heroVideo = document.getElementById('hero-video');
   const heroName = document.querySelector('.hero-name-main');
   if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.playsInline = true;
      try {
         heroVideo.pause();
      } catch (_) {
         /* ignore */
      }
      heroVideo.addEventListener(
         'canplay',
         () => {
            heroVideo.play().catch(() => {
               heroVideo.setAttribute('controls', 'controls');
            });
         },
         { once: true }
      );
   }

   document.querySelectorAll('.project').forEach((el) => {
      el.addEventListener('click', () => toggleProject(el));
   });

   document.querySelectorAll('.split').forEach((split) => {
      const right = split.querySelector('.split-right');
      if (!right) return;
      const on = () => split.classList.add('split-right-hover');
      const off = () => split.classList.remove('split-right-hover');
      right.addEventListener('mouseenter', on);
      right.addEventListener('mouseleave', off);
      right.addEventListener('focusin', on);
      right.addEventListener('focusout', (e) => {
         if (!right.contains(e.relatedTarget)) off();
      });
   });

   const fadeElements = document.querySelectorAll('.fade');
   let ticking = false;

   function updateScrollMotion() {
      if (prefersReducedMotion.matches) {
         fadeElements.forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            if (el.tagName === 'SECTION') {
               if (el.getBoundingClientRect().top < window.innerHeight * 0.85) el.classList.add('in-view');
               else el.classList.remove('in-view');
            }
         });
         ticking = false;
         return;
      }

      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.2;

      fadeElements.forEach((el) => {
         const rect = el.getBoundingClientRect();
         const progress = (start - rect.top) / (start - end);
         const t = Math.max(0, Math.min(1, progress));
         const eased = 1 - Math.pow(1 - t, 3);
         const speed = Number(el.dataset.speed) || 1;

         el.style.opacity = String(eased);
         el.style.transform = `translateY(${(1 - eased) * 24 * speed}px) scale(${0.98 + eased * 0.02})`;

         if (t > 0.4) el.classList.add('in-view');
         else el.classList.remove('in-view');
      });

      if (heroName && !prefersReducedMotion.matches) {
         const rect = heroName.getBoundingClientRect();
         const progress = Math.min(Math.max((vh - rect.top) / vh, 0), 1);
         const shift = progress * 60;
         document.documentElement.style.setProperty('--hero-gradient-shift', `${shift}%`);
      }
      ticking = false;
   }

   updateScrollMotion();
   window.addEventListener(
      'scroll',
      () => {
         if (!ticking) {
            requestAnimationFrame(() => {
               updateScrollMotion();
            });
            ticking = true;
         }
      },
      { passive: true }
   );
   window.addEventListener('resize', updateScrollMotion);
   prefersReducedMotion.addEventListener('change', updateScrollMotion);

   function syncProjectHeights() {
      document.querySelectorAll('.project.open .project-details').forEach((details) => {
         details.style.setProperty('--content-height', `${details.scrollHeight}px`);
      });
   }

   window.addEventListener('resize', () => {
      if (!prefersReducedMotion.matches) syncProjectHeights();
   });

   function toggleProject(el) {
      const details = el.querySelector('.project-details');
      if (!details) return;

      const willOpen = !el.classList.contains('open');

      if (willOpen) {
         details.style.setProperty('--content-height', `${details.scrollHeight}px`);
         el.classList.add('open');
         requestAnimationFrame(() => {
            details.style.setProperty('--content-height', `${details.scrollHeight}px`);
         });
      } else if (prefersReducedMotion.matches) {
         el.classList.remove('open');
         details.style.removeProperty('--content-height');
      } else {
         details.style.setProperty('--content-height', `${details.scrollHeight}px`);
         void details.offsetHeight;
         el.classList.remove('open');
         const onEnd = (e) => {
            if (e.propertyName !== 'max-height') return;
            details.removeEventListener('transitionend', onEnd);
            details.style.removeProperty('--content-height');
         };
         details.addEventListener('transitionend', onEnd);
      }

      el.setAttribute('aria-expanded', el.classList.contains('open') ? 'true' : 'false');
      updateScrollMotion();
   }

   const canvas = document.getElementById('hills');
   if (canvas && !prefersReducedMotion.matches) {
      const ctx = canvas.getContext('2d');
      let canvasCssW = window.innerWidth;
      const canvasCssH = 200;
      let t = 0;
      let mouseX = 0;

      window.addEventListener(
         'mousemove',
         (e) => {
            mouseX = e.clientX * 0.002;
         },
         { passive: true }
      );

      function resize() {
         const dpr = window.devicePixelRatio || 1;
         canvasCssW = window.innerWidth;
         canvas.width = canvasCssW * dpr;
         canvas.height = canvasCssH * dpr;
         canvas.style.width = `${canvasCssW}px`;
         canvas.style.height = `${canvasCssH}px`;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function draw() {
         ctx.clearRect(0, 0, canvasCssW, canvasCssH);
         ctx.beginPath();
         for (let x = 0; x < canvasCssW; x++) {
            const y =
               canvasCssH -
               40 +
               Math.sin(x * 0.01 + t + mouseX) * 20 +
               Math.sin(x * 0.02 + t * 0.5) * 10;
            ctx.lineTo(x, y);
         }
         ctx.strokeStyle = 'rgba(255,122,26,0.15)';
         ctx.lineWidth = 1;
         ctx.stroke();
         t += 0.004;
         requestAnimationFrame(draw);
      }

      window.addEventListener('resize', resize);
      resize();
      draw();
   } else if (canvas && prefersReducedMotion.matches) {
      const ctx = canvas.getContext('2d');
      const canvasCssH = 200;
      let canvasCssW = window.innerWidth;
      function resizeStill() {
         const dpr = window.devicePixelRatio || 1;
         canvasCssW = window.innerWidth;
         canvas.width = canvasCssW * dpr;
         canvas.height = canvasCssH * dpr;
         canvas.style.width = `${canvasCssW}px`;
         canvas.style.height = `${canvasCssH}px`;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
         ctx.clearRect(0, 0, canvasCssW, canvasCssH);
         ctx.beginPath();
         for (let x = 0; x < canvasCssW; x++) {
            const y = canvasCssH - 40 + Math.sin(x * 0.01) * 20 + Math.sin(x * 0.02) * 10;
            ctx.lineTo(x, y);
         }
         ctx.strokeStyle = 'rgba(255,122,26,0.12)';
         ctx.lineWidth = 1;
         ctx.stroke();
      }
      window.addEventListener('resize', resizeStill);
      resizeStill();
   }
})();
