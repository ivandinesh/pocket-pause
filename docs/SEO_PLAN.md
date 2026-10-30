# DoPop SEO implementation plan — 30 October 2026

## Aim and current baseline

Increase relevant discovery and successful visits while retaining DoPop's minimal
home screen, game rules, individual scores, themes, local saves and offline play.
Page-one rankings cannot be promised, particularly for broad competitive terms
such as “free games” or “Sudoku”. Prioritize useful pages for specific player needs.

The current source already generates 26 canonical routes: home, a games directory
and 24 static game guides. Guides contain unique titles/descriptions, rules,
controls, tips, related links and a Play link. Content is available without JS.
The build includes robots.txt, a sitemap, social artwork and factual structured
data. Preview pages use noindex; unknown paths remain 404s. The security release
preserves those pages while externalizing executable scripts.

No Search Console query/impression/indexing data was available for this plan.
Existing Faro performance and visit signals are useful for user experience, but
do not establish Google rankings or which URLs Google has indexed. Public search
results are not a replacement for the owner's Search Console reports.

## 1. Verify indexing and establish a baseline

- Verify a Search Console domain property through the owner’s DNS account, or the
  canonical URL-prefix property. The existing GOOGLE_SITE_VERIFICATION build
  variable accepts a public HTML verification token; never use an OAuth/access token.
- Submit https://www.dopop.fun/sitemap.xml. Inspect home, /games, /games/ants-apart,
  /games/words and /games/sudoku for crawlability, rendered content, selected
  canonical, indexing state and blocked resources under the new CSP.
- Audit the 26 routes after deployment: status, one canonical, unique title and
  description, headings, valid internal links, robots policy and structured data.
  Verify HTTP/apex/HTML/trailing-slash variants resolve or canonicalize consistently.
- Record a 28-day baseline by landing page, query, device and country. Mark changes
  with deployment dates. Lack of traffic/field data is “insufficient data”, not zero
  errors or a successful ranking result.

Acceptance: sitemap accepted, representative URLs inspected, unexpected exclusions
explained, and a dated report using actual Search Console data.

## 2. Improve existing guide usefulness before adding pages

Use seo/games.json and scripts/build_seo.py as the single content/generation path.
Start with Ants Apart and Words for distinctive queries, plus Word Search, Number
Path and Sudoku as initial test candidates. These priorities are provisional until
query data shows demand; they are not search-volume claims.

- Explain each game's actual rules, keyboard/touch controls, hints/retries where
  available, progress saving and offline behavior accurately.
- Add one concise worked example per priority guide, using original SVG diagrams
  or small static illustrations. For Ants Apart explain direct player contact,
  unfinished-line loss and the difference between hearts and free retry.
- Match titles/descriptions to a clear intent: for example “Ants Apart — Rules,
  Controls & Free Browser Game”. Keep readable language; avoid keyword repetition.
- Clarify offline installation: users must first open the app online and wait for
  readiness. Do not describe a first-time uncached guide visit as offline-capable.
- Maintain descriptive HTML links between genuinely related games. Do not add
  footer keyword lists, duplicated location pages, hidden text or thin level pages.

Acceptance: five guides provide specific, correct examples; mobile readability,
Play links and game/save behavior pass. No extra permanent home-screen controls.

## 3. Make discovery semantic without changing interaction

Assess converting game cards into real links to their existing guide routes while
preserving normal in-app Play behavior with progressive enhancement. Define and
test keyboard, middle-click/new-tab and back-navigation behavior before changing
cards; they currently act as buttons. This is a separate change from content edits.
The existing visible Game guides link already provides a crawl path.

Add BreadcrumbList data only where it matches visible breadcrumbs. Validate current
WebApplication/VideoGame markup and its factual properties. Do not add invented
ratings, unsupported review claims or FAQ markup solely to pursue rich results.
Structured data does not guarantee a search feature.

Acceptance: all 24 games remain equally easy to launch; source-HTML links are
crawlable; assistive semantics and expected browser link behavior are correct.

## 4. Measure performance, then change only demonstrated bottlenecks

Measure home, /games and representative guides on mobile and desktop. Use
PageSpeed/Lighthouse for diagnosis and existing Faro plus Search Console/CrUX for
field evidence where available. Lab results and field results must stay separate.
Targets for good field experience are p75 LCP <= 2.5 seconds, INP <= 200 ms and
CLS <= 0.1, evaluated separately for the relevant device populations.

Inspect main-thread initialization, dictionary parsing, blocking script order and
rendered layout. If measured as a problem, consider caching immutable hashed assets,
preloading only critical theme assets, or deferring nonessential initialization.
Do not split/lazy-load game engines without reworking and testing the atomic offline
contract: all 24 games must remain available after readiness. Preserve the early
theme initialization to avoid flashes and keep existing CSP/SRI protections.

Acceptance: before/after traces show improvement or no regression. All-game layout,
input, save, dark/light theme, offline reload and safe-update checks remain green.
Do not add new tracking, session replay or a custom monitoring dashboard.

## 5. Earn relevant discovery and review results

After technical/content checks, share the actual game collection through appropriate
project profiles, relevant communities and genuine recommendations. Use the DoPop
name consistently and retain license attribution. Avoid purchased links, bulk
submissions, fabricated endorsements and mass-generated guide variants.

Review Search Console after 28 days and again after 8–12 weeks. Compare relevant
impressions, clicks, CTR and positions for comparable page/query/device groups;
use existing usage events to assess whether visitors actually start games. These
are evaluation windows, not ranking deadlines. Prioritize the next guide changes
from evidence rather than publishing all possible categories at once.

## Delivery order and boundaries

1. Verify the security release and its crawlable output.
2. Establish Search Console ownership/indexing evidence and baseline.
3. Improve five guides with original examples; add content/link/schema gates.
4. Address measured performance issues as a separate tested change.
5. Review outcomes before expanding content or changing the home card semantics.

This is a plan, not a change to game mechanics or additional instrumentation.
Search Console setup requires the owner's access. No SEO changes should weaken
security headers, create a login requirement for production or interrupt offline play.

## Primary references

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Search Console Core Web Vitals report](https://support.google.com/webmasters/answer/9205520)
