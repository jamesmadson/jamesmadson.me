# Colophon page — design spec

Date: 2026-07-28
Branch: `feature/lab` (renamed in spirit to colophon work; branch not renamed)

## Purpose

The site currently reads as a freelance product designer's portfolio, but James is
positioning for design engineer roles at companies like Anthropic, Stripe, and
Google. Those reviewers look for evidence of build skill, not just visual taste.
The site itself — hand-built Eleventy, no framework, a flash-free theme system —
is real evidence, but nothing on the site points at it. A colophon page makes
the site's own construction part of the portfolio and gives a prominent,
inspectable link to the repo.

## Non-goals

- Not building the "Lab" prototypes section (separate, deferred effort)
- Not rewriting git history to shrink the 1.2GB `.git` folder (destructive,
  out of scope — flag to James as a possible future task)
- Not removing or replacing `bourbon`/`neat` — they are live dependencies
  compiled into `styles.css` via `npm run build:css`, not dead code
- Not adding the page to primary nav or the mobile menu — footer link only

## Page: `/colophon/`

Standalone HTML file (`colophon.html`) following the existing pattern used by
`about.html` / `contact.html` / `work.html`: full `<head>`, `{% include
"partials/site-nav.njk" %}`, own `<main>`, `{% include "partials/footer.njk" %}`.
Front matter: `permalink: /colophon/`. No use of the unused `_includes/layouts/`
system (confirmed dead — no top-level page references it).

### Header

Reuses the About/Work header pattern: `grid_3` block with `<h1 class="jm_title">Colophon</h1>`,
`grid_9 about_header_meta` block with a one-line description, e.g.
*"How this site is built, and why."*

### Section 1 — Stack

Label/value rows, styled with the existing `cs_meta_row` / `cs_meta_item`
classes from case studies. Confirmed these are not case-study-scoped — the
base rules at `styles.css:3020-3085` work standalone, with their own
`.theme-light` overrides at `styles.css:3292` and `styles.css:4482`, so no new
CSS is needed to reuse them on the colophon page.

Content (verified against the repo, not invented):

| Item | Value |
|---|---|
| Framework | Eleventy (11ty), Nunjucks templates |
| Styles | Hand-rolled Sass, compiled via `npm run build:css`; still built on vendored Bourbon/Neat grid mixins rather than an npm package — an old-school choice, stated plainly |
| JavaScript | Vanilla JS, no framework (`assets/js/site.js`, `hero-scroll.js`, `marquee.js`) |
| Fonts | Google Fonts (IBM Plex Mono, Instrument Sans) — not self-hosted yet |
| Hosting | GitHub Actions build → FTP deploy to shared hosting (`ftp.jamesmadson.me`) |
| Analytics | Google Analytics (gtag) |

Do not claim self-hosted fonts or anything not currently true — the point of
this page is credibility, and an inspectable repo will catch any overstatement.

### Section 2 — Decisions

4–5 short entries, each a subhead + 2–3 sentence "why." Candidates:

1. **Flash-free theme switching** — the inline script in `<head>` (see
   `index.html:49`) runs synchronously before first paint, reading
   `localStorage` (falling back to `prefers-color-scheme`) so there's never a
   flash of the wrong theme. Include this one as an actual inline `<pre><code>`
   snippet — it's the strongest single piece of evidence of engineering
   judgment on the site. Style with the already-loaded IBM Plex Mono; no new
   font weight needed. Keep the snippet short (it's ~1 line minified in the
   source — reproduce it readably, not as literal minified text).
2. **No framework** — why vanilla JS was enough for this site's needs.
3. **Accessible marquee** — the client-logo list is manually duplicated in
   markup with `aria-hidden`/`tabindex="-1"` on the repeated half
   (`index.html:107-214`), and `assets/js/marquee.js` then clones further
   copies at runtime to fill the container width, carrying those attributes
   along via `cloneNode(true)`. Explain the reasoning briefly — real links
   stay keyboard/AT-reachable exactly once, decorative repeats don't.
4. **Hand-rolled grid over a framework grid system** — ties to the
   Bourbon/Neat note in the stack section; explain why it's stayed this way.
5. (Optional, if it doesn't feel padded) One more — e.g. the case-study page's
   view-toggle (case-study vs. image-feed) as a small UX/engineering choice.

Don't force five if four reads better — content quality over a fixed count.

### Section 3 — A brief history

Short timeline, 3–4 lines, not a heavy visual component. Real dates from git
history (do not invent or embellish beyond what's below):

- **2016** — first version of the site
- **2018–2019** — Jekyll-based rewrite; HTTPS, cleaner URLs
- **2025** — rebuilt on Eleventy — the current site

Plain text or a simple unordered list; no new CSS component needed unless the
existing typographic scale doesn't already handle it well.

### Section 4 — Repo

A callout box reusing the existing `view_project` arrow-link style (the same
pattern used for "naturequant.com/naturedose ↗" elsewhere on the site).

- Primary link: `https://github.com/jamesmadson/jamesmadson.me`
- 2–3 deep links straight to interesting lines, using GitHub's line-anchor
  URL format (`#L49` etc.), so a reviewer lands on the good parts instead of
  the repo root:
  - The theme-flash-prevention script (`index.html`)
  - `assets/js/marquee.js` (the runtime-clone logic referenced above)
  - `_sass/styles.scss` (Sass entry point)

Deep-link line numbers must be re-verified against `master` right before
publishing, since a rebase/reformat could shift them.

### Footer

Add a `Colophon` link to `_includes/partials/footer.njk`, alongside the
existing name/tagline. Not added to `site-nav.njk` (desktop dropdown) or the
mobile nav accordion — footer only, per James's choice.

## Repo cleanup (bundled into this branch)

Required because the colophon prominently links the repo — the cleanup must
land before or alongside the page, not after.

1. `git rm` the 27 tracked `.bak` files (see list below) and the entire
   `.backup/` directory (15 tracked files) — dead Jekyll-migration debris.
2. Add `_site/` to `.gitignore`; `git rm -r --cached _site/` to stop tracking
   the 957 build-output files currently committed.
3. Do **not** touch `bourbon/` or `neat/` — confirmed live dependencies via
   `_sass/styles.scss` imports and the `build:css` script.
4. Do **not** attempt to shrink `.git` (1.2GB) — that requires history
   rewriting (e.g. `git filter-repo`), which is destructive and needs its own
   explicit, separate decision from James. Mention it to him as a follow-up
   idea, don't act on it.

Tracked `.bak` files to remove:
```
.backup/.eleventy.js.bak
.backup/.eleventy.js.bak2
.backup/README.html.bak
.backup/TemplateLayoutPathResolver.js.bak
.backup/example-project.md.bak
.backup/example-project.md.bak.bak
.backup/liquid.browser.min.js.bak
.backup/liquid.browser.min.js.map.bak
.backup/liquid.browser.umd.js.bak
.backup/liquid.browser.umd.js.bak.bak
.backup/liquid.browser.umd.js.map.bak
.backup/motion-v.js.map.bak
.backup/page.njk.bak.bak.bak
.backup/project.njk.bak.bak.bak
.eleventy.js.bak
_includes/layouts/page.njk.bak
_includes/layouts/page.njk.bak.bak
_includes/layouts/project.njk.bak
_includes/layouts/project.njk.bak.bak
_includes/partials/footer.njk.bak
_layouts.jekyll.bak/default.html
_layouts.jekyll.bak/page.html
_layouts.jekyll.bak/page.html.bak
_site/case_studies/example-project.md.bak
about.html.bak
case_studies/example-project.md.bak
index.html.bak
work.html.bak
```
(Note: `_site/case_studies/example-project.md.bak` is removed as part of the
broader `_site/` untracking in step 2, not separately.)

## Verification plan

Since this is a static content page with no interactivity beyond standard
links:

1. Run the Eleventy dev server (`npm run dev`), confirm `/colophon/` builds
   with no errors.
2. Screenshot the page in both light and dark theme (the site's existing
   flash-free toggle should apply here with no extra work).
3. Screenshot at mobile width (375px) to confirm the header and stack table
   don't overflow or need their own responsive rules.
4. Click the footer link from another page to confirm it resolves to
   `/colophon/`.
5. Click each repo deep-link to confirm the line anchors actually land on the
   intended lines on GitHub (requires the branch to be pushed, or verify line
   numbers manually against `master` if not pushing yet).
6. Confirm `git status` after cleanup shows the `.bak` files and `_site/` as
   removed, and `bourbon`/`neat` untouched.

