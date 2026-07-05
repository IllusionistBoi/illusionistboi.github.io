# illusionistboi.github.io, Ronit Dahiya's portfolio

Personal portfolio, deployed via **GitHub Pages** from `main` (user site repo, no build step).
Live at https://illusionistboi.github.io and the syssimulator.com link points outward.

## Architecture

Zero-build static site. Push to `main` = deploy. Keep it that way unless there is a strong reason not to.

| File | Purpose |
|---|---|
| `index.html` | Single page. Semantic sections: hero, statement, work, experience, principles, contact |
| `styles.css` | All styling. Design tokens at the top in `:root` |
| `main.js` | Nav, scroll choreography (GSAP ScrollTrigger), reveal logic, reduced-motion handling |
| `demos.js` | All canvas animations: hero system map + 4 per-project live demos |
| `vendor/` | gsap.min.js + ScrollTrigger.min.js (vendored, no CDN dependency) |
| `fonts/` | Geist + Geist Mono variable woff2 (self-hosted) |
| `favicon/`, `favicon.ico` | Unchanged from previous site |
| `hero.jpg`, `backgroundHero.mp4` | **Legacy assets from the old site, no longer referenced.** Kept until owner decides to delete. The mp4 is 14MB; removing it slims the repo |

`node_modules/` is untracked leftovers from an old experiment (three.js etc.) and is not used by the site.

## Design system (2026-07 redesign)

**Concept: "the page is a system under load."** Ronit's positioning is *how systems fail*, so the
site demonstrates it: the hero is a live service network where nodes fail and traffic reroutes;
each project card runs a live canvas demo of that project's core mechanic; the career timeline is
drawn as a distributed-trace waterfall.

- **Theme:** dark, locked at page level (deliberate; not dual-mode). Background `#0a0a0b` family.
- **Accent:** single accent, brand orange `#ff7a1a` (carried over from previous site). Red is
  reserved strictly for *semantic failure states* inside the canvas demos.
- **Type:** Geist (display + body) and Geist Mono (annotations, chips, axis labels). Self-hosted.
  No serifs. No Inter.
- **Motion:** GSAP ScrollTrigger for scrubbed storytelling (statement text, trace spans),
  IntersectionObserver for reveals and for pausing offscreen canvases. Everything honors
  `prefers-reduced-motion` (canvases render a static frame, scrubs become visible-by-default).
  Never `window.addEventListener('scroll')`.
- **Copy rules:** no em-dashes anywhere. Recruiter-first: impact and stack visible by default,
  nothing hidden behind clicks. Impact numbers (~35%, ~30%) come from the owner's original copy;
  do not invent new metrics.

## Who Ronit actually is (owner-confirmed 2026-07-04, overrides older copy)

- **Full-stack software developer and problem solver.** NOT a "distributed systems / failure
  engineer". The old site's copy over-indexed on that; do not resurrect it.
- At **Evernorth**, part of a team managing **Private Cloud in Cigna Healthcare** (team Unity).
  Current work: **building an AI chatbot with custom MCP capabilities**.
  - NDA caution: confirm with owner which internal names (Unity, project specifics) may appear
    on a public site before publishing them.
- **System Design Simulator origin story (the true one):** in college he struggled to understand
  system design, so he built a tool to visualize it. Tell it as a story, not his literal words.
  The old "~35% faster iteration loops" metric is dropped.
- Theme that IS true and worth building the site around: *he builds things to understand them
  and uses AI to simplify life.* The live canvas demos fit this ethos.
- Old signature line "I care less about whether systems work..." is being replaced.
- "Operating principles" to be rewritten as pragmatic developer values (owner will veto drafts).
- **Never invent facts.** When in doubt, ask the owner.
- **2026-07-04, owner provided full history + mid-year review. Nothing is NDA; all fine to use.**
  Facts now on the page: Evernorth (Jul 2025+, Galway): UnITy AI chatbot end-to-end (FastMCP/MCP
  integrations, LLM token-cost optimization, SAST/SCA remediation, Playwright release automation,
  CloudBolt). Ericsson SWE (Jul 2023 to Jul 2025): PHP to Django migration of the Software
  Provisioning Tool, vApp/Jenkins automation, VMware licensing cost cuts, Key Contributor award.
  Ericsson Graduate (Jul 2022 to Jul 2023): Python/Java/Docker/K8s, CI tooling, Stratus-to-Tools
  transfers, Node/AngularJS/MongoDB. Ericsson Intern (Mar to Aug 2021): internal tools, search
  usage +40%, Java 11 modernization. GDSC UCD Technology Lead (Sep 2021 to May 2022): +30%
  membership. UCD BSc (Hons) CS with Data Science, 2018 to 2022. The +40%/+30% figures are the
  owner's own resume numbers.

## Constraints / decisions log

- **2026-07-04** Full overhaul. Dropped the 14MB hero video (LCP killer) in favor of a lightweight
  canvas system map. Merged the three near-identical philosophy sections (Context / Principles /
  What I Focus On) into one Principles section. Project details made visible by default (old site
  hid stack + impact behind click-to-expand). Replaced Fraunces/Inter with Geist/Geist Mono.
  Kept: orange accent, dark theme, voice ("Occasionally touches grass."), all factual content,
  project links, email/GitHub/LinkedIn.
- Facts on the page (roles, dates, project claims) came from the previous site's copy. Verify with
  the owner before changing any of them.
- OG image: currently `hero.jpg` (legacy). TODO: generate a branded 1200x630 og-image.

## Work log

- **2026-07-04** Redesign session (Claude Fable 5): audit of old site, new design direction,
  full rebuild of index.html/styles.css/main.js/demos.js, vendored GSAP, self-hosted fonts,
  CLAUDE.md created. Mid-session the owner corrected the positioning (full-stack dev, not
  systems specialist) and supplied his full history + mid-year review; all copy rewritten
  around it. Added: hero eyebrow with official title, Toolbox section, 5-span trace
  (intern to senior advisor, 2021 to 2026) + GDSC + education, "How I work" principles,
  SysSimulator origin story. Verified desktop (1280) and mobile (375) in preview.
  Known harness quirk: the preview screenshot tool draws a white box around the nav brand
  chip; computed styles prove the page itself is correct. Committed locally; owner pushes
  to publish.

- **2026-07-05** v2 "alive" pass from owner feedback: warm ember atmosphere (drifting glows +
  grain) instead of flat black, Clash Display for all display type (self-hosted, Fontshare),
  layout widened to 1440px, scroll animations now REVERSE on scroll-up (GSAP toggleActions),
  scroll-progress hairline, scrollspy nav, pointer-tracking spotlight borders on all panels.
  Experience redesigned as a proper trace chart (label gutter + shared axis + gridlines) with
  hover linking between chart bars and role rows; pulsing "live" dot removed (owner: AI tell).
  Projects now use real media: assets/luggagebot.mp4 + assets/pokerplanning.mp4 (converted via
  ffmpeg from owner's gifs, 10.8MB to 226KB and 2.4MB to 283KB; source gifs gitignored),
  SysSimulator expects assets/syssimulator.png (owner to provide; graceful "pending" fallback).
  Pixel Pals copy corrected to Python/Pygame. LuggageBot copy: Mask R-CNN/segmentation,
  pre-GPT flavor. Poker Planning: COVID origin story + Rive teddy. demos.js trimmed to hero
  mesh + BFS. Fixed real bugs: IntersectionObserver handlers now read the LAST batched entry
  (stale-first-entry bug), video autoplay race vs pause-observer.
  NOTE: the preview panel tab reports visibility:hidden when occluded; rAF/IO/screenshots all
  freeze then. Verify with the panel actually visible, or via owner-provided screenshots.

- **2026-07-05** Media consistency pass: owner provided the SysSimulator screenshot (copied from
  Pictures/Screenshots into assets/syssimulator.png, 300KB, + 52KB webp for the page via
  <picture>). og:image now points at it. ALL project media locked to a uniform 16:10 frame with
  object-fit cover (owner: mismatched asset sizes looked unstructured). Print-safety CSS added so
  full-page captures/printing never show blank sections (scroll reveals hide below-fold content
  until triggered; that is expected live behavior but capture tools caught it). Statement resting
  word opacity raised 0.1 to 0.16.

- **2026-07-05** v3 pass from owner feedback: (1) hello-preloader (Apple/skiper8 style, cycling
  greetings incl. Devanagari + Irish, once per sessionStorage, reduced-motion skip, failsafes);
  (2) right-edge scroll RULER (41 ticks + moving orange cursor + percent, desktop >=1100px,
  replaces top hairline there; hairline remains on mobile); (3) ASCENT: scroll-drawn SVG line
  2018 student -> 2025 senior advisor with milestone dots/labels, in Experience above the trace
  (hidden <861px); (4) curtain-reveal footer (skiper39 style): .page-above is an opaque z-2
  curtain, footer position:fixed z-1 beneath, page reserves footer height via JS ResizeObserver;
  anchor #contact intercepted to scroll to document end (fixed elements have no anchor position);
  footer excluded from IO scrollspy (fixed = always intersecting), handled via scroll progress
  instead; (5) giant stencil wordmark "Ronit Dahiya" in footer (Big Shoulders Stencil variable,
  self-hosted; the Neocultural Couture font the owner liked is commercial, stencil accent is the
  legal stand-in, swappable if owner licenses the real one); (6) Key Contributor Award surfaced
  as an orange badge chip in the Ericsson SWE role; (7) Education section: UCD degree + GDSC
  Technology Lead as separate cards; GDSC removed from the work trace (now 4 employment spans);
  (8) Toolbox groups color-coded like SysSimulator's component categories (orange/violet/green/
  pink tints; deliberate owner-requested exception to the one-accent rule); (9) new hi-res
  SysSimulator capture from owner: assets/syssimulator.webp (40KB page) + .jpg (112KB fallback +
  og:image); heavy 1.8MB png removed. Atmosphere moved to z-10 (additive glow over the opaque
  curtain). All verified in visible preview at 1440px + curtain/footer/ruler/ascent confirmed.

## TODO / ideas

- [ ] Decide whether to delete backgroundHero.mp4 + hero.jpg from the repo (both unreferenced now)
- [ ] Optional: custom 404.html in the same design language
- [ ] Optional: light "console easter egg" for engineers who open devtools
