/* ------------------------------------------------------------------
   Live canvas simulations.
   - #system-map: a service mesh where nodes fail and traffic reroutes
   - [data-demo="bfs"]: breadth-first search chase on a grid
   Every animation pauses when offscreen and renders a single static
   frame under prefers-reduced-motion.
------------------------------------------------------------------- */
(function () {
   'use strict';

   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const DPR = Math.min(window.devicePixelRatio || 1, 2);

   const C = {
      text: 'rgba(240,239,236,0.55)',
      faint: 'rgba(240,239,236,0.16)',
      ghost: 'rgba(240,239,236,0.07)',
      accent: '#ff7a1a',
      accentDim: 'rgba(255,122,26,0.35)',
      accentFaint: 'rgba(255,122,26,0.12)',
      danger: '#ff5347',
      dangerDim: 'rgba(255,83,71,0.4)',
      panel: '#111113'
   };

   /* Shared runner: sizing, offscreen pause, reduced-motion static frame */
   function runCanvas(canvas, sim) {
      const ctx = canvas.getContext('2d');
      let w = 0, h = 0, visible = false, rafId = 0, last = 0;

      function resize() {
         const rect = canvas.getBoundingClientRect();
         if (!rect.width || !rect.height) return;
         w = rect.width;
         h = rect.height;
         canvas.width = Math.round(w * DPR);
         canvas.height = Math.round(h * DPR);
         ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
         sim.init(w, h);
         if (REDUCED) {
            sim.warmup && sim.warmup(w, h);
            ctx.clearRect(0, 0, w, h);
            sim.draw(ctx, w, h);
         }
      }

      function frame(now) {
         if (!visible) { rafId = 0; return; }
         const dt = Math.min(50, now - (last || now));
         last = now;
         sim.step(dt / 1000, w, h);
         ctx.clearRect(0, 0, w, h);
         sim.draw(ctx, w, h);
         rafId = requestAnimationFrame(frame);
      }

      new ResizeObserver(resize).observe(canvas);
      resize();

      if (REDUCED) return;

      new IntersectionObserver((entries) => {
         visible = entries[entries.length - 1].isIntersecting;
         if (visible && !rafId) {
            last = 0;
            rafId = requestAnimationFrame(frame);
         }
      }, { rootMargin: '60px' }).observe(canvas);
   }

   const rand = (a, b) => a + Math.random() * (b - a);
   const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
   const lerp = (a, b, t) => a + (b - a) * t;

   function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
   }

   /* ------------------------------------------------------------- */
   /* HERO: service mesh with failures and rerouting                 */
   /* ------------------------------------------------------------- */
   function heroSystem() {
      let nodes = [], edges = [], packets = [];
      let failTimer = 3.5;
      let pointer = { x: 0.5, y: 0.5 };

      const hero = document.querySelector('.hero');
      if (hero && !REDUCED) {
         hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            pointer.x = (e.clientX - r.left) / r.width;
            pointer.y = (e.clientY - r.top) / r.height;
         }, { passive: true });
      }

      function neighborsOf(i) {
         const out = [];
         for (const [a, b] of edges) {
            if (a === i) out.push(b);
            if (b === i) out.push(a);
         }
         return out;
      }

      return {
         init(w, h) {
            const count = w < 700 ? 10 : 16;
            nodes = [];
            const cols = Math.ceil(Math.sqrt(count * (w / h)));
            const rows = Math.ceil(count / cols);
            let n = 0;
            for (let r = 0; r < rows && n < count; r++) {
               for (let c = 0; c < cols && n < count; c++, n++) {
                  nodes.push({
                     hx: (c + 0.5 + rand(-0.3, 0.3)) / cols * w,
                     hy: (r + 0.5 + rand(-0.3, 0.3)) / rows * h,
                     x: 0, y: 0,
                     depth: rand(0.35, 1),
                     phase: rand(0, Math.PI * 2),
                     state: 'ok',      /* ok | down | recovering */
                     stateT: 0,
                     activity: 0
                  });
               }
            }
            nodes.forEach((nd) => { nd.x = nd.hx; nd.y = nd.hy; });

            /* connect each node to its 2 nearest neighbors, dedupe */
            const seen = new Set();
            edges = [];
            nodes.forEach((nd, i) => {
               const near = nodes
                  .map((m, j) => ({ j, d: (m.hx - nd.hx) ** 2 + (m.hy - nd.hy) ** 2 }))
                  .filter((o) => o.j !== i)
                  .sort((a, b) => a.d - b.d)
                  .slice(0, 2);
               near.forEach(({ j }) => {
                  const key = Math.min(i, j) + '-' + Math.max(i, j);
                  if (!seen.has(key)) { seen.add(key); edges.push([i, j]); }
               });
            });

            packets = [];
            const target = Math.round(nodes.length * 1.3);
            for (let p = 0; p < target; p++) {
               const [a, b] = pick(edges);
               packets.push({ from: a, to: b, t: Math.random(), speed: rand(0.25, 0.5) });
            }
         },

         warmup() { /* static frame shows the resting mesh */ },

         step(dt, w, h) {
            const time = performance.now() / 1000;

            /* schedule failures */
            failTimer -= dt;
            if (failTimer <= 0) {
               const healthy = nodes.filter((n) => n.state === 'ok');
               if (healthy.length > 4) {
                  const victim = pick(healthy);
                  victim.state = 'down';
                  victim.stateT = 0;
               }
               failTimer = rand(4.5, 7.5);
            }

            nodes.forEach((nd, i) => {
               /* gentle drift + pointer parallax */
               const px = (pointer.x - 0.5) * 26 * nd.depth;
               const py = (pointer.y - 0.5) * 18 * nd.depth;
               const wx = Math.sin(time * 0.3 + nd.phase) * 7 * nd.depth;
               const wy = Math.cos(time * 0.24 + nd.phase * 1.7) * 7 * nd.depth;
               nd.x = lerp(nd.x, nd.hx + wx + px, 0.04);
               nd.y = lerp(nd.y, nd.hy + wy + py, 0.04);
               nd.activity = Math.max(0, nd.activity - dt * 1.6);

               if (nd.state === 'down') {
                  nd.stateT += dt;
                  if (nd.stateT > 2.4) { nd.state = 'recovering'; nd.stateT = 0; }
               } else if (nd.state === 'recovering') {
                  nd.stateT += dt;
                  if (nd.stateT > 1.4) { nd.state = 'ok'; nd.stateT = 0; }
               }
            });

            packets.forEach((pk) => {
               /* packets headed into a down node turn around (reroute) */
               if (nodes[pk.to].state === 'down') {
                  const back = pk.from;
                  pk.from = pk.to;
                  pk.to = back;
                  pk.t = 1 - pk.t;
               }
               pk.t += pk.speed * dt;
               if (pk.t >= 1) {
                  const arrived = pk.to;
                  nodes[arrived].activity = 1;
                  const options = neighborsOf(arrived).filter(
                     (j) => nodes[j].state !== 'down' && j !== pk.from
                  );
                  const fallback = neighborsOf(arrived).filter((j) => nodes[j].state !== 'down');
                  const next = options.length ? pick(options) : (fallback.length ? pick(fallback) : pk.from);
                  pk.from = arrived;
                  pk.to = next;
                  pk.t = 0;
               }
            });
         },

         draw(ctx) {
            /* edges */
            edges.forEach(([a, b]) => {
               const na = nodes[a], nb = nodes[b];
               const dead = na.state === 'down' || nb.state === 'down';
               ctx.strokeStyle = dead ? 'rgba(255,83,71,0.10)' : C.ghost;
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.moveTo(na.x, na.y);
               ctx.lineTo(nb.x, nb.y);
               ctx.stroke();
            });

            /* packets */
            packets.forEach((pk) => {
               const na = nodes[pk.from], nb = nodes[pk.to];
               const x = lerp(na.x, nb.x, pk.t);
               const y = lerp(na.y, nb.y, pk.t);
               ctx.fillStyle = C.accentDim;
               ctx.beginPath();
               ctx.arc(x, y, 3.4, 0, Math.PI * 2);
               ctx.fill();
               ctx.fillStyle = C.accent;
               ctx.beginPath();
               ctx.arc(x, y, 1.6, 0, Math.PI * 2);
               ctx.fill();
            });

            /* nodes */
            const time = performance.now() / 1000;
            nodes.forEach((nd) => {
               let ring = 'rgba(240,239,236,0.35)';
               let core = 'rgba(240,239,236,0.55)';
               if (nd.state === 'down') {
                  const flicker = Math.sin(time * 24 + nd.phase) > -0.4 ? 1 : 0.35;
                  ring = `rgba(255,83,71,${0.65 * flicker})`;
                  core = `rgba(255,83,71,${0.85 * flicker})`;
               } else if (nd.state === 'recovering') {
                  ring = 'rgba(255,122,26,0.55)';
                  core = 'rgba(255,122,26,0.8)';
               }

               if (nd.activity > 0 && nd.state === 'ok') {
                  ctx.fillStyle = `rgba(255,122,26,${nd.activity * 0.14})`;
                  ctx.beginPath();
                  ctx.arc(nd.x, nd.y, 8, 0, Math.PI * 2);
                  ctx.fill();
               }

               ctx.strokeStyle = ring;
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.arc(nd.x, nd.y, 5.5, 0, Math.PI * 2);
               ctx.stroke();
               ctx.fillStyle = core;
               ctx.beginPath();
               ctx.arc(nd.x, nd.y, 2, 0, Math.PI * 2);
               ctx.fill();
            });
         }
      };
   }

   /* ------------------------------------------------------------- */
   /* BFS: enemy recomputes shortest path to the player every move   */
   /* ------------------------------------------------------------- */
   function bfsDemo() {
      const CELL = 24;
      let cols = 0, rows = 0, walls = null;
      let player = null, enemy = null, path = [], dist = null;
      let moveT = 0, playerT = 0, wave = 1, flash = 0;

      const idx = (x, y) => y * cols + x;
      const free = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && !walls[idx(x, y)];

      function bfs(from, to) {
         const q = [from];
         const d = new Int16Array(cols * rows).fill(-1);
         d[idx(from.x, from.y)] = 0;
         const prev = new Int32Array(cols * rows).fill(-1);
         while (q.length) {
            const cur = q.shift();
            if (cur.x === to.x && cur.y === to.y) break;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
               const nx = cur.x + dx, ny = cur.y + dy;
               if (free(nx, ny) && d[idx(nx, ny)] === -1) {
                  d[idx(nx, ny)] = d[idx(cur.x, cur.y)] + 1;
                  prev[idx(nx, ny)] = idx(cur.x, cur.y);
                  q.push({ x: nx, y: ny });
               }
            }
         }
         dist = d;
         const out = [];
         let cur = idx(to.x, to.y);
         if (d[cur] === -1) return [];
         while (cur !== idx(from.x, from.y) && cur !== -1) {
            out.unshift({ x: cur % cols, y: Math.floor(cur / cols) });
            cur = prev[cur];
         }
         return out;
      }

      function randomFree() {
         for (let tries = 0; tries < 200; tries++) {
            const x = Math.floor(rand(0, cols));
            const y = Math.floor(rand(0, rows));
            if (free(x, y)) return { x, y };
         }
         return { x: 0, y: 0 };
      }

      function generate() {
         walls = new Uint8Array(cols * rows);
         for (let i = 0; i < walls.length; i++) walls[i] = Math.random() < 0.16 ? 1 : 0;
         player = randomFree();
         enemy = randomFree();
         /* ensure the chase is possible; carve straight through otherwise */
         if (bfs(enemy, player).length === 0) {
            const x0 = Math.min(enemy.x, player.x), x1 = Math.max(enemy.x, player.x);
            for (let x = x0; x <= x1; x++) walls[idx(x, enemy.y)] = 0;
            const y0 = Math.min(enemy.y, player.y), y1 = Math.max(enemy.y, player.y);
            for (let y = y0; y <= y1; y++) walls[idx(player.x, y)] = 0;
         }
         path = bfs(enemy, player);
         wave = 1;
      }

      return {
         init(w, h) {
            cols = Math.max(8, Math.floor(w / CELL));
            rows = Math.max(6, Math.floor(h / CELL));
            generate();
         },
         warmup(w, h) {
            for (let i = 0; i < 90; i++) this.step(1 / 30, w, h);
         },
         step(dt) {
            flash = Math.max(0, flash - dt * 2);
            wave = Math.min(60, wave + dt * 46);

            playerT += dt;
            if (playerT > 0.55) {
               playerT = 0;
               /* player prefers moves that increase distance from the enemy */
               const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
                  .map(([dx, dy]) => ({ x: player.x + dx, y: player.y + dy }))
                  .filter((p) => free(p.x, p.y));
               if (opts.length) {
                  opts.sort((a, b) =>
                     (Math.hypot(b.x - enemy.x, b.y - enemy.y)) -
                     (Math.hypot(a.x - enemy.x, a.y - enemy.y)));
                  player = Math.random() < 0.75 ? opts[0] : pick(opts);
               }
            }

            moveT += dt;
            if (moveT > 0.42) {
               moveT = 0;
               path = bfs(enemy, player);
               wave = 1;
               if (path.length) enemy = path[0];
               if (enemy.x === player.x && enemy.y === player.y) {
                  flash = 1;
                  player = randomFree();
               }
            }
         },
         draw(ctx, w, h) {
            const ox = (w - cols * CELL) / 2;
            const oy = (h - rows * CELL) / 2;

            /* BFS frontier: cells light up in expanding waves of distance */
            if (dist) {
               for (let y = 0; y < rows; y++) {
                  for (let x = 0; x < cols; x++) {
                     const d = dist[idx(x, y)];
                     if (d > 0 && d < wave) {
                        const a = Math.max(0, 0.09 - d * 0.004);
                        if (a > 0.008) {
                           ctx.fillStyle = `rgba(255,122,26,${a})`;
                           ctx.fillRect(ox + x * CELL + 1, oy + y * CELL + 1, CELL - 2, CELL - 2);
                        }
                     }
                  }
               }
            }

            /* walls */
            ctx.fillStyle = 'rgba(240,239,236,0.09)';
            for (let y = 0; y < rows; y++) {
               for (let x = 0; x < cols; x++) {
                  if (walls[idx(x, y)]) {
                     ctx.fillRect(ox + x * CELL + 1, oy + y * CELL + 1, CELL - 2, CELL - 2);
                  }
               }
            }

            /* path */
            if (path.length > 1) {
               ctx.strokeStyle = C.accentDim;
               ctx.lineWidth = 1.5;
               ctx.beginPath();
               ctx.moveTo(ox + (enemy.x + 0.5) * CELL, oy + (enemy.y + 0.5) * CELL);
               path.forEach((p) => ctx.lineTo(ox + (p.x + 0.5) * CELL, oy + (p.y + 0.5) * CELL));
               ctx.stroke();
            }

            /* catch flash (semantic failure red) */
            if (flash > 0) {
               ctx.fillStyle = `rgba(255,83,71,${flash * 0.25})`;
               ctx.fillRect(ox + enemy.x * CELL, oy + enemy.y * CELL, CELL, CELL);
            }

            /* player */
            ctx.fillStyle = 'rgba(240,239,236,0.9)';
            roundRect(ctx, ox + player.x * CELL + 5, oy + player.y * CELL + 5, CELL - 10, CELL - 10, 4);
            ctx.fill();

            /* enemy */
            ctx.fillStyle = C.accent;
            roundRect(ctx, ox + enemy.x * CELL + 5, oy + enemy.y * CELL + 5, CELL - 10, CELL - 10, 4);
            ctx.fill();
         }
      };
   }

   /* ------------------------------------------------------------- */

   function boot() {
      const heroCanvas = document.getElementById('system-map');
      if (heroCanvas) runCanvas(heroCanvas, heroSystem());

      const factories = {
         bfs: bfsDemo
      };

      document.querySelectorAll('canvas[data-demo]').forEach((canvas) => {
         const make = factories[canvas.dataset.demo];
         if (make) runCanvas(canvas, make());
      });
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
   } else {
      boot();
   }
})();
