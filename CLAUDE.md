# illusionistboi.github.io, Ronit Dahiya's portfolio

Personal portfolio, deployed via **GitHub Pages** from `main` (user site repo, no build step).
Live at https://illusionistboi.github.io and the syssimulator.com link points outward.

## Architecture

Zero-build static site. Push to `main` = deploy. Keep it that way unless there is a strong reason not to.

| Path | Purpose |
|---|---|
| `index.html` | Single page: intro, hero, statement, work, experience (+ascent), education, toolbox, principles, contact |
| `404.html` | Custom GitHub Pages error page, same design language |
| `css/styles.css` | All styling. Design tokens at the top in `:root`. Font urls are `../fonts/` relative |
| `js/main.js` | Intro sequence, nav, scroll choreography (GSAP ScrollTrigger), ruler, ascent, copy-burst email |
| `js/demos.js` | Canvas sims: hero system map + BFS chase (offscreen-paused, reduced-motion static) |
| `assets/` | syssimulator.webp/.jpg (jpg doubles as og:image), luggagebot.mp4, pokerplanning.mp4 |
| `vendor/` | gsap.min.js + ScrollTrigger.min.js (vendored, no CDN dependency) |
| `fonts/` | Clash Display 500/600/700, Big Shoulders Stencil (variable), Geist + Geist Mono (variable) |
| `favicon/`, `favicon.ico` | Unchanged from previous site |

`node_modules/` and the source gifs are untracked/gitignored and not used by the site.
Legacy `hero.jpg`/`backgroundHero.mp4` were deleted from the repo on 2026-07-05.

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

- **2026-07-05** v4 final polish (owner: "last iteration", applying to Anthropic soon):
  hero name now Big Shoulders Stencil uppercase (the footer wordmark became "Illusionist Boi",
  his GitHub handle, so the stencil face repeats but the words do not); preloader expanded to
  18 greetings with an eased cadence (slow in, fast middle, held final Hello, ~3s once per
  session); Experience heading composed INTO the ascent graph's empty top-left corner
  (.exp-hero absolute overlay, verified no collision with milestone labels at 1440);
  lede rewritten to "Seven years, one direction."; trace/edu bullets rewritten in Google XYZ
  form using only the owner's real numbers (40% usage, ~25% productivity, 30% membership);
  category tints spread deliberately (principles highlights orange/green/violet, education
  cards tint-bars, ascent dots sample the line gradient via userSpaceOnUse); console easter
  egg now notes MCP servers in production (Anthropic reviewer bait, factual); custom 404.html:
  "This page failed predictably." in the same design language.

- **2026-07-05** v5 fixes from owner testing: (1) REFRESH BUG: returning visitors saw a stranded
  "Hello" overlay; fixed with a pre-paint inline head script that adds .intro-skip/.intro-done
  synchronously from sessionStorage (overlay can never strand again; also pageshow/bfcache
  handler + ScrollTrigger.refresh on load). (2) Intro now ends on "Let's get you in." with a
  scale-in hold, then the curtain lifts into the hero. (3) Ascent labels capitalized
  (Student/Intern/Graduate/Engineer/Senior Advisor), 2025 label reads "Senior Advisor,
  Evernorth" and sits 25px clear of the line (was 9px, read as overlap). (4) Chart click-through:
  trace bars and ascent milestones scroll to the matching role/education card with a flash
  highlight (ids: role-evernorth, role-ericsson-swe/-grad/-intern). (5) "First Class Honours"
  badge on the UCD card. (6) Principles now scrub with the scroll (brighten + slide, reversible)
  instead of popping; footer content rises with the curtain via a maxScroll-anchored scrub.
  (7) Email is an auto-looping typewriter (types, holds 3.2s, vanishes tail-first) that only
  runs while the footer is on screen; link keeps aria-label and stays clickable; reduced-motion
  gets static text.

- **2026-07-05** v6 + restructure: intro plays on EVERY load (owner request), timestamp-driven so
  background-tab timer throttling cannot strand it, live percent counter, split-panel "doors"
  reveal, closer "Let's get you in.". Email typewriter replaced with click-to-copy magic:
  particles burst from the letters (canvas overlay), "Copied." reassembles, then the address
  restores; clipboard failure falls back to mailto; reduced-motion gets plain copy. Awards are
  solid-orange bold badges, "Ericsson Key Contributor Award" is self-explanatory + title attr.
  Intern span corrected: Mar 2021 to Jul 2022 (owner: internship ran until the graduate role).
  Nav mark set in stencil (boxed chip looked bad). Repo restructured: css/ and js/ folders,
  legacy hero.jpg + backgroundHero.mp4 (14MB) deleted. The "Skip to content" pill visible
  mid-page in owner's full-page captures is a capture-stitching artifact of fixed elements,
  not a bug.

- **2026-07-05** v7 (pre-launch): intro closer softened (1.45s hold + 520ms blur-settle swap,
  owner: too abrupt). Flagship now uses owner's product VIDEO: assets/syssimulator.mp4
  (23.7MB source compressed to 764KB, 1600w/24fps; source gitignored root-only so the assets
  copy still commits), webp poster, jpg remains og:image. Poker Planning gained a live-app link
  (my-app-tau-seven-25.vercel.app). Email interaction made discoverable: hint reads "click the
  address to copy it", letters ripple on hover with "go on, click", and a one-time ripple plays
  when the footer first reveals. Owner's console errors were file:// protocol artifacts (fonts/
  manifest CORS-blocked when opening index.html from disk); zero errors over http.
  PUSHED TO PRODUCTION per owner instruction.

- **2026-07-05** v8 (post-launch fixes from owner testing): footer heading was clipping under
  the nav at max scroll on shorter viewports; the footer now MEASURES itself against
  (innerHeight - 88) and applies .contact-compact (smaller wordmark/spacing) when needed,
  re-measuring on window resize, font ready, and load (a ResizeObserver on the footer alone
  missed window-height changes). Principles scrub end moved from 'top 18%' to 'top 45%' so the
  last line completes ~900px before max scroll. Intro counter now maps to (total - closer hold):
  it reads 100 exactly when "Let's get you in." appears (was 64%, felt cut short); middle
  greeting delays raised to 110ms and drive tick tightened to 30ms so busy load frames cannot
  skip words. Note for future debugging: the preview panel tab freezes rAF when hidden, which
  also freezes GSAP scrubs; ScrollTrigger progress values read 0 there regardless of scroll.

## TODO / ideas
- [ ] Optional: custom 404.html in the same design language
- [ ] Optional: light "console easter egg" for engineers who open devtools
