# dopop

Little games. Good moments. https://www.dopop.fun/

A mobile-first collection of calm puzzles, arcade games and tactile fidgets. No accounts, advertisements or purchases. Browser-local progress, optional sound and an installable offline experience. GitHub main deploys to the existing pocket-pause Vercel project and dopop.fun domains.

## Game collection

| Game | Interaction and progression |
| --- | --- |
| Words | Circular letter wheel; connect letters; 1,000 deterministic, distinct letter sets generated from the attributed 12dicts lexicon; saved progress and level selection |
| Word Search | Find hidden words in deterministic grids; eight themed sets from the same attributed lexicon; puzzle selector and automatic progression |
| Word Guess | Five letters, six guesses; Daily and 1,000 fixed levels; hard mode, clue symbols, keyboard, statistics and streaks |
| Sudoku | Number placement; puzzle selection and automatic progression |
| Snake | Dot body and larger head with eyes; smooth movement, colors, shapes and speed selection |
| Falling Blocks | Falling blocks; starting level and appearance choices |
| Number Path | Ordered number connections covering the board; walls; editable path, flowing highlights, saved path and level picker |
| Maze Chase | Continuous movement, queued turns, power dots, changing mazes, appearance and level controls |
| Fidget | Free play; several spinner modes; Connected has ten varied gears, Spin and particles |
| Dot Connect | 100 levels; matching-color chains, loop clears, goals, move limits and frost |
| 2048 | Classic 4×4 merges; undo, saved board and best score; optional music |
| Color Paths | 50 levels; join matching pairs and fill all cells without crossing |
| Untangle | 50 levels; move nodes until edges do not cross or pass through nodes |
| Flood | 50 levels; expand the corner region with colors within a move budget |
| Light Up | 50 levels; illuminate every open cell; lights cannot see one another; numbered walls constrain adjacent lights |
| Bridges | 50 levels; tap between islands to cycle zero/single/double bridges; match island totals and connect the entire network |
| Slide | 50 levels; slide adjacent numbered tiles into the empty cell; 3×3 then 4×4; starts generated through legal moves |
| Binary Grid | 50 levels; balance two tile types with no triples or duplicate rows/columns |
| Sightline | 50 levels; mark cells open or blocked to satisfy visibility clues |
| Ants Apart | 36 levels; separate ants with cuts; saved boards and unfinished trails, inline opening guide, pause/resume and best cut counts |
| Rotate Network | 30 unique-solution levels; rotate and lock tiles to connect a network without loops |
| Loop | 30 unique-solution levels; draw one loop to satisfy numbered edge clues |
| Color Code | 30 fixed codes; four colors with shape symbols, eight guesses, duplicate-aware feedback |
| Picture Grid | 30 unique-solution levels; row/column run clues reveal original abstract patterns |
| Memory Pairs | 30 fixed levels/layouts; Tap two cards. Find every matching shape. |
| Flip Lights | 30 fixed levels/layouts; Tap a dot to toggle it and its neighbors. Clear every filled dot. |
| Peg Solitaire | 30 fixed levels/layouts; Select a dot, then jump over a neighbor into an empty ring. |
| Domino Pairs | 30 fixed levels/layouts; Choose two neighboring cells to place a domino. Use each pair once. |
| Rectangles | 30 fixed levels/layouts; Draw a rectangle containing one clue and exactly that many squares. |
| Tents | 30 fixed levels/layouts; Place tents beside trees. Match the counts; keep tents apart. |
| Slant | 30 fixed levels/layouts; Choose a diagonal in every square. Meet the vertex counts without a loop. |
| Dot Sweep | 30 fixed levels/layouts; Reveal safe squares. Numbers count nearby hidden dots. |
| Greater Grid | 30 fixed levels/layouts; Fill each row and column once. Follow the greater-than clues. |
| Skyline | 30 fixed levels/layouts; Place each height once per row and column. Match the views from every side. |
| Symmetry Islands | 30 fixed levels/layouts; Choose a numbered center, then assign squares to its symmetric island. |
| Magnets | 30 fixed levels/layouts; Turn each domino into a magnet or a neutral pair. Match the pole counts. |
| Four Regions | 30 fixed levels/layouts; Choose a symbol, then color regions. Neighbors sharing an edge must differ. |
| Cage Sums | 30 fixed levels/layouts; Fill each row and column once. Meet every outlined cage’s arithmetic clue. |
| Tracks | 30 fixed levels/layouts; Connect A to B. The counts say how many squares your route visits. |
| Hidden Rays | 30 fixed levels/layouts; Probe the edges. Infer the hidden dots, then check your arrangement. |

New Light Up, Bridges and Slide games include independent saves, undo (last 30 moves), reset confirmation, level selection, appearance controls and automatic advancement after completion. These are original generated puzzles; a known solution is checked, but uniqueness of every solution and human difficulty have not been proven. Bridges uses nearest-neighbor rectilinear island grids, so legal bridge segments cannot cross. Future expansions should improve puzzle variety after playtesting.

## Theme and interface contract

- Use white surfaces in Light mode and navy surfaces in Dark mode. Keep DoPop’s restrained dot pattern visible on home and dotted play fields.
- Blue is the default accent (#4f78ec); use the shared SNAKE_COLORS palette rather than inventing competing options.
- Rounded geometry, soft borders, readable text in both themes and ample spacing. Offer round/square choices where the mechanics permit.
- Home is a compact app-icon grid with readable game labels. Preserve familiar icon placement when adding games.
- Game pages use a compact back/title/sound header, a generous play area, and bottom level/actions controls. Avoid repeating the site masthead inside games.
- Respect viewport height and device safe areas. On short landscape screens, scrolling is preferable to overlapping controls.
- Color swatches must have equal width/height, zero inherited padding, a centered dot and a centered selected ring. Word Guess has scoped dialog overrides for this reason.
- Word Guess clue colors retain their meanings regardless of accent: green correct, amber misplaced, gray absent. Optional symbols and accessible labels complement color.
- Animations should be gentle, with reduced-motion support for animated effects. Sound is opt-in. Never require audio to solve a puzzle.
- Keep help available and explain controls. Every control needs a descriptive accessible label; keep native button keyboard behavior and visible focus.

## Appearance

Home → **Appearance** offers System, Light and Dark. System is the default and follows device changes; an explicit choice stays in this browser. The preference uses `pocketpause.v1.appearance` and is included in Offline & saves backups. Theme selection applies before game rendering and does not reset progress or resume paused play.

Both palettes retain blue accents and the DoPop dots. The dark palette uses navy surfaces, readable neutral text, visible borders and the existing semantic colors. The build converts presentation colors into shared CSS tokens; dynamic inline SVG/HTML colors use the same palette. Canvas paint mapping preserves native gradients and leaves gameplay engines unchanged. Static canvases repaint on theme changes without advancing a round. Word Guess clues retain distinct green, amber and gray states, and color/symbol puzzles retain their color identities. No image or page inversion filter is used.

Validation includes theme preference/OS/storage checks, native canvas paint checks, all 24 dark game pages and home icons, 46 settings/help/level dialogs, active arcade play, clue feedback, 320px phone and landscape layouts, saved overrides and offline reopening. The initial-screen text contrast scan reports no failures. Physical iOS/Android and installed-app status-bar behavior still need device QA.

## Input and mobile behavior

Games use touch/pointer controls, with keyboard support where implemented. Word Guess provides a persistent on-screen keyboard plus physical keyboard input. Bridges taps the spaces between islands; Slide taps tiles; Light Up taps cells. Do not rely on hover.

Existing site-wide gesture safeguards prevent accidental selection, context menus and repeated-tap zoom during games. Preserve editable input behavior and pinch zoom where supported. CSS/browser emulation does not establish physical iPhone Safari correctness: device QA remains a separate release step.

## State and saves

Progress lives in localStorage on the current browser and origin. Existing keys are contracts: do not rename, clear or silently migrate them without a tested migration. Switching between dopop.fun, www.dopop.fun and older Vercel origins can produce separate saves.

- Existing games primarily use pocketpause.v1.*; Number Path also uses pocketpause.zip.progress.v1.
- Word Guess: pocketpause.v1.wordguess.v1, with independent date/level rounds, guesses, unfinished entry, preferences and derived statistics.
- Light Up/Bridges/Slide: pocketpause.v1.logic.lightUp, pocketpause.v1.logic.bridges, pocketpause.v1.logic.slide.
- Rotate Network, Loop, Color Code and Picture Grid use `pocketpause.v1.rotateNetwork`, `pocketpause.v1.loop`, `pocketpause.v1.colorCode` and `pocketpause.v1.pictureGrid`, with independent attempts and undo history per level. Ants Apart keeps `pocketpause.v1.antsApartPrototype` and migrates its payload to version 2.
- New games fit the existing backup allowlist. Offline & saves exports/imports JSON, validates allowed keys and asks before replacing progress.
- Words retains its existing save key and level number. On first load after the lexicon update, the current attempt and hints are cleared while level and score are kept; the save records content version 2. Word Search keeps its current puzzle number; found words were not persisted.
- Clearing site data removes saves. Browser storage can be evicted or refused. Exported backups are recommended; installation is not a permanent backup.
- No accounts or cloud sync. Saves are not shared across devices. Arcade resume behavior follows each game's implementation.

Word Guess answer IDs must stay fixed. Reviewed vocabulary replacements are recorded by slot in the word-content manifest; affected older rounds restart once, while other rounds and preferences remain saved. Its Daily uses the device's local date and a deterministic 1,000-day permutation; it is not the NYT schedule. Older unfinished daily rounds remain saved when choosing Today. Hard mode locks after the first submitted guess. Completed rounds are not counted twice. The bundled accepted-guess list is broader than the curated answer list. Words targets, bonus words and Word Guess guesses use the same editorial exclusions; Word Search also screens accidental severe terms in every direction. See [word content review](docs/WORD_CONTENT_REVIEW.md) for coverage and save compatibility.

## Offline architecture

All games, styles and dictionaries are packaged locally in dist/index.html and content-addressed scripts under dist/assets/. No remote dictionary download is needed. scripts/build_security.py externalizes executable scripts after assembly, preserving execution order, and regenerates the final offline hashes. scripts/build_offline.py creates icons, the web manifest, the release descriptor and a versioned service worker. Release assets are checked with SHA-256 before installation succeeds. The complete release is cached together; failed downloads do not replace a usable older release.

The client displays Ready for offline play only after a worker cache check. Updates install in the background; the Update ready action requires open clients to be safely at home before activation. Keep this protocol intact to avoid interrupting active play. The worker also supports cache checking/repair.

Install: open online, wait for readiness, use Safari Add to Home Screen or Android Install app, and open the installed app online once before disconnecting. HTTPS is required, with the browser’s localhost exception available for development previews. New releases regenerate hashes automatically, including CSS-only changes.

## Source map

| Path | Responsibility |
| --- | --- |
| index.html | Tracked base application; build scripts patch this source in sequence |
| scripts/build.py | Ordered assembly and test gate |
| scripts/patch_*.py | Existing game additions and targeted compatibility patches |
| scripts/word_content.py | Deterministic Words rack generation from the pinned lexicon |
| games/words-lexicon.txt | Normalized 3–7 letter 12dicts 3of6game subset |
| games/word-search-themes.json | DoPop’s themed selection from the normalized lexicon |
| games/word-content-manifest.json | Source release, archive and derived-data hashes, transformation rules and level-generation contract |
| games/12dicts-NOTICE.txt | Offline attribution for derived word data |
| games/puzzle-set-* and games/puzzle-set.js | New puzzle rules, interface, fixed levels and provenance manifest |
| games/ants-apart.* | Ant separation game, board persistence and inline guide |
| games/calm-trio.* | Color Paths, Untangle, Flood |
| games/word-guess* | Word Guess mechanics, UI, styling, fixed answers, dictionary and license |
| games/logic-trio.* | Light Up, Bridges, Slide generators, mechanics and UI |
| app/theme.js, app/theme-colors.js, app/theme.css | Appearance preference, shared light/dark palette and canvas/inline presentation integration |
| scripts/patch_theme.py | Build-time CSS tokens and static-board repaint hooks |
| pwa/client.js | Registration, readiness, update UI, installation and backup controls |
| pwa/sw.js | Worker template, release cache verification and update coordination |
| pwa/style.css | Offline management UI |
| scripts/build_offline.py | Offline release and icon generation |
| vercel.json | Build/output configuration and service-worker/manifest cache headers |

## Build and verify

Requirements: Python 3 and Node.js. There are no frontend package dependencies to install for this static build.

Run from a **fresh source checkout**:

    python3 scripts/build.py

Output is dist/. The build patches a disposable source copy; tracked index.html remains unchanged and repeated builds are supported. Never commit generated HTML over the tracked base.

The build checks Word Guess, Binary Grid/Sightline, the new puzzle pack and theme behavior before assembly, then checks the generated games and offline release. Relevant checks include:

    node scripts/test_puzzle_set.cjs
    node scripts/test_theme.cjs
    node scripts/test_ants_apart.cjs
    node scripts/test_logic_trio.cjs
    node scripts/test_new_games.cjs
    node scripts/test_calm_trio.cjs
    node scripts/test_offline.cjs

Checks cover answer validity, duplicate letters, hard constraints, win/loss, deterministic daily schedules, save validation, 2048 merge rules, Dot Connect rules, generated puzzle solutions, Slide parity, backup validation, cache-only navigation, hash mismatch failures, cache repair and multi-tab update safety. A failing check exits the build unsuccessfully.

Browser QA should cover game entry, interactions, completion, level changes, undo/reset, modal controls, refresh/resume, small phone portrait and landscape, reduced motion, offline reopening and an update from the prior release. Known-solution validation does not replace interaction testing or physical device testing.

## Release and rollback

1. Fetch the latest main and compare against the working copy. Preserve unrelated changes.
2. Keep changes scoped; use stable save keys and deterministic level IDs.
3. Build/test in fresh source. Review the exact changed files, including license and offline integration.
4. Commit to connected GitHub main. Vercel auto-deploys to the existing project; do not recreate the project or change domains.
5. Verify the production deployment commit and READY status; inspect live gameplay and offline readiness.
6. Installed users may need to return home and apply Update ready.

Rollback by reverting the release commit or using the platform's deployment rollback procedure. Preserve new save keys so a subsequent restored release can recover progress. Verify domain assignment and automatic deployments after a platform rollback.

## Dependencies and license notices

The Word Guess accepted dictionary comes from https://github.com/tabatkins/wordle-list under MIT. Its full notice is in games/word-guess-LICENSE.txt and embedded in the bundle. Answer selection and puzzle generators are dopop's own content. Do not copy third-party game branding, artwork or proprietary puzzle schedules. This repository does not declare a blanket license for all original application code.

## Puzzle expansion and Ants Apart

Rotate Network, Loop, Color Code and Picture Grid are implemented with 30 pinned levels each. The four pages share theme-aware surfaces, blue accents, restrained borders and a compact action row. Progression is explicit through Next level. Each game supports keyboard/touch input, validated per-level attempts, 30 undo steps, confirmed reset, help and offline play. Color Code uses the four existing DoPop colors plus distinct shapes; no sound or animation is required.

`games/puzzle-set-core.js` contains the mechanics and authoring generators. `games/puzzle-set-levels.json` pins level IDs; its SHA-256 and rule references are recorded in `games/puzzle-set-manifest.json`. Network boards are non-wrapping 4×4/5×5 trees; Loop uses 5×5 edge grids; Picture Grid uses 5×5/7×7 original abstract patterns. Solver checks require one solution for every Network, Loop and Picture Grid level. `scripts/test_puzzle_set.cjs` also independently audits graph structure, exhaustively checks small loop/picture fixtures and checks all 65,536 four-symbol code feedback pairs. These checks establish the documented rules and uniqueness, not human difficulty calibration.

Rule references: [Net](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/net.html), [Loopy](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/loopy.html), [Guess](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/guess.html) and [Pattern](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/pattern.html). The new implementations and generated content were written for DoPop; no reference code, boards, artwork or dictionaries were imported. These references do not imply a license or name clearance for the whole application.

Ants Apart retains its existing `pocketpause.v1.antsApartPrototype` key and the original 12 level identities, with 24 additional levels. Version 2 reads older progress/best scores and adds validated boards per level: completed cuts, ant positions, the unfinished trail, player direction and the movement RNG state. Returning to an unfinished board waits for a fresh direction or swipe. Boards save approximately once per second while playing, on important cut events, on pause and on page exit; sudden termination may lose the most recent second of movement. Malformed attempts fall back to a fresh board while valid progress is retained. Storage failures are surfaced.

Help, level selection and backgrounding pause Ants Apart. Collisions discard the unfinished cut while preserving completed lines. Completion waits for Next level. Held directions no longer postpone movement, region topology is cached until a cut changes the board, and reduced-motion mode removes player interpolation. The first level has a short inline guide. Ants and the navigator use original canvas geometry on a field that follows the selected theme; short landscape layouts can scroll. Its controller checks cover saves, migration, RNG continuation, collision recovery and pause ownership. Further difficulty tuning needs playtesting.

Verification: the full build passes, including fixed-level uniqueness, save compatibility, backup validation, offline packaging and license gates. Chrome checks covered first and final levels, undo/reset, level selection, native keyboard input, save/reload, Ants Apart trail restoration, successful backup import and rollback after a simulated storage failure. Viewports were 320×568, 390×844, 844×390 and 768×1024; actions remained reachable with no horizontal page overflow. Reduced-motion mode and an actual service-worker offline reload of all 24 games were checked. These are desktop Chrome viewport checks; physical iOS/Android and installed-device QA remain separate.

Prioritize puzzle variety, accessible inputs and physical-device QA before increasing level counts. Accounts, advertising, purchases and cloud synchronization are outside the current design.

## Compact layout and feedback setup

The homepage uses 3 columns on phones, 4 on tablets and 6 on wide desktops.
Sudoku retains square cells; Light Up uses equal grid tracks. Slide distinguishes
its blank tile, and Bridges shows connection targets. Dialogs scroll on short screens.

The home footer has three actions: Game guides, Feedback and About DoPop.
About DoPop contains Appearance, installation, Offline & saves, Privacy & analytics,
and Credits & licenses. Appearance also remains available through the top icon.
Only one utility sheet opens at a time; closing it returns to About DoPop and its
originating control. Installation is hidden in standalone mode. Routine offline
readiness stays inside About DoPop; offline download/storage problems also appear
on the home screen.

Scores belong to individual games. Words retains its existing points and hint costs
inside its game; there is no header balance or shared currency. Other games keep
their existing scores, levels and best results. Ants Apart retries remain free,
and Fidget remains unscored. Existing save formats are unchanged.

Optional footer browser QA (after building and starting the local preview):

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright BROWSER_EXECUTABLE=/path/to/browser node scripts/test_home_footer_browser.cjs
```

Feedback uses Google Forms, configured in `feedback-config.json` with the public
responder URL. The homepage link opens in a new tab. Google Forms and Tally HTTPS
responder URLs are accepted; other destinations fail the build. Enable Responses →
Get email notifications for new responses in Google Forms, and verify inbox delivery.
No backend or SMTP credentials are needed. Submission requires internet; games
continue to work offline.

### Release device checklist

Test all 24 game pages at 320x568, 360x640, 390x844, 412x915, tablet portrait/
landscape and desktop. Check Safari/iOS and Android Chrome both in browser and
installed mode. For each game: launch, interact, undo/reset, select a level,
return home, reopen and reload. Verify first/middle/final levels, invalid picker
values, completion with dialogs/backgrounding, theme persistence, touch dragging,
keyboard focus, reduced motion, 200% zoom, and offline saves/update recovery.
Physical-device results must be recorded separately from responsive browser checks.

## Automatic release updates

Online foreground sessions check for new releases on open, reconnect, focus and
periodically (checks throttled to one minute). A downloaded release activates only
when every open dopop window acknowledges the home screen with no open dialog.
Playing or unresponsive windows defer activation; home controls are briefly locked
during the handshake. No reload is requested during gameplay. Failed downloads
retain the running release; progress storage is untouched. The manual Update ready
button remains available. Older cached clients may need one final manual update
to receive this automatic-update logic. Physical multi-device testing remains required.

## Consistency and reliability update — 27 October 2026

Changes were staged in four branches: repeatable build, game lifecycle, update
coordination, and puzzle progress/controls. Each stage was checked before the next.

- Builds patch a disposable source copy, leaving tracked `index.html` unchanged.
- `app/game-session.js` pauses Snake, Falling Blocks and Maze Chase when leaving play,
  opening dialogs or hiding the document. Resume requires fresh movement input. Editable controls
  and dialogs do not leak keyboard input into games; Sudoku timing also stops
  while hidden or a dialog is open.
- `app/level-picker.js` provides validated integer selection, Play/Cancel and
  focus restoration. It is used by the five original form-based games, Word
  Guess, and the logic/calm trios. Choosing the current level leaves it intact.
  Maze Chase retains an adapter that applies changes only on Play; Cancel restores
  the label and value immediately. Number Path and Dot Connect retain their pickers.
- Light Up, Bridges, Slide, Color Paths, Untangle and Flood retain attempts and undo
  history per level. Version 2 saves preserve the existing storage keys and read
  older current-attempt saves. Explicit Reset/Play again starts fresh.
- Numeric dialogs share spacing, focus styles and minimum control sizing.
  Browser zoom is enabled. Failed storage writes display a save warning.
- Update checks are serialized. A changed set of open clients rejects activation;
  rejected checks release the temporary home-screen locks immediately.

Validation: repeated builds were deterministic; the final build passed lifecycle,
update deferral, puzzle generation/rules, save backup and mocked offline/cache
checks. Browser checks covered all 17 launch/back routes, Maze Chase Play/Cancel,
and Light Up/Flood attempt restoration (including Light Up reload persistence).
The HTTP preview cannot exercise real service workers. Physical iOS/Android,
installed-app updates and real HTTPS multi-tab update timing remain release QA
items. This is an incremental shared-control migration, not a complete rewrite
of the legacy game engines or all settings panels.

## Intellectual property and third-party content

DoPop aims to use its own implementations and presentation, with locally generated
puzzles where documented. Third-party open-source content retains its required
notices; the Word Guess dictionary MIT notice is embedded in the offline bundle.
Game names and presentation are intended to avoid implying affiliation with
commercial game publishers. Proprietary schedules, art, music and levels are not
intentionally copied. This is not a claim that every element is copyright-free
or that any name has trademark clearance.

See [the risk and license inventory](docs/IP_REVIEW.md) for source evidence and
remaining provenance/trademark questions. Falling Blocks, Maze Chase, Number Path
and Color Paths are descriptive display names; legacy internal IDs and save keys
remain unchanged. Word Guess answer IDs remain fixed; reviewed word-content replacements are documented separately.
Maze Chase now uses a diamond navigator, ring drones and ring beacons, with its
existing seeded maze generator. No external character art or audio was added.

### Credits and provenance

Home → **Credits & licenses** displays the full notice for the confirmed Word
Guess dictionary import, the derived 12dicts word data, and the licensed 2048
movement engine, and retains the Q42 notices in a separate puzzle-rule
acknowledgments section. Notices are included in the hashed offline app; following
upstream source links requires internet. Public credits identify actual imported
content separately from inspiration and do not imply a license for every game.

The [content provenance follow-up](docs/CONTENT_PROVENANCE.md) records the source
replacement for Words and Word Search and the remaining evidence gaps for historical
content. Current builds use a filtered 12dicts 6.0.2 word-game list with an offline
attribution; the original unverified data is removed from current source and output.
Words uses a versioned save migration that keeps level and score. The pinned MIT
2048 engine still has 16,368 compatibility comparisons for moves, scores and
animation destinations. The `main` history is rewritten to remove prior word
data; older remote feature-branch refs still need separate review if retained.

## Search visibility and monitoring

The app links to a lightweight `/games` directory and 24 static game guides with rules, controls, tips and direct Play links. Accurate descriptions, production canonicals, social metadata, structured data, `robots.txt` and `sitemap.xml` are generated with the release. Preview builds use `noindex`. An owner must verify Search Console and submit the sitemap after deployment; indexing and ranking are not guaranteed.

The existing Faro implementation adds allowlisted game views, foreground view timing, startup readiness and offline/update/save/backup outcomes. It keeps the production and opt-out gates, 100% sampling and pinned SDK. Custom signals are bounded and exclude game input and save contents; automatic click/frustration capture is disabled. The new events have not been assessed against private dashboard traffic in this checkout.

Run `python3 scripts/check_site.py` after publishing to verify the canonical site, guide URLs, metadata, sitemap and 404 behavior. The full build includes SEO and telemetry regression checks.

### Direct arcade controls

Ants Apart uses a small person outline, with ↑ above ← ↓ → in its touch D-pad. Arrow/WASD keys, direction buttons and swipes start or resume its saved board with that same direction. Snake, Falling Blocks and Maze Chase also accept movement to start/resume; their Play buttons remain optional, where present. No extra Resume button is inserted. Ants Apart and Maze Chase retain a Pause control.

Dialogs, background tabs and leaving a game pause play. Closing a dialog or returning does not resume automatically. A held keyboard arrow cannot resume a paused session until released and pressed again; editable fields keep their arrow keys. Saves, level identities and game engines are unchanged.

Validation: `python3 scripts/build.py` includes controller checks for all Ants Apart Arrow/WASD directions, first-input start/resume, held-key suppression and dialog ownership. Browser checks covered D-pad placement and 44px touch targets, light/dark layouts at 320/390/768px, arcade starts and Maze Chase keyboard/swipe resume.

### Ants Apart level expansion

There are now 36 fixed levels. Levels 1–12 retain their exact starting positions and speeds. Levels 13–36 rotate through an open field and five layouts with partial blue lines attached to the edge. These lines are safe paths; every opening still has one connected region, so none starts already solved.

| Levels | Ants | Ant step interval |
| --- | --- | --- |
| 1–12 | 2–5 | Original 293–216 ms |
| 13–18 | 6 | 213–198 ms |
| 19–24 | 7 | 208–193 ms |
| 25–30 | 8 | 203–188 ms |
| 31–36 | 8 | 188–178 ms |

The player keeps the same 88 ms movement interval. Adding an ant gives a small speed respite before the next ramp. Ants now avoid occupied cells: previously they could stack and appear to disappear, including on older levels. Save keys, version 2 payloads, existing scores and attempts remain supported.

The controller audit checks all 36 openings for unique layouts, expected ant counts, spacing, connectivity and constructive ant-free separation cuts. It also checks 21,600 moving-ant states for bounds, wall avoidance and overlapping ants; every level is saved/reloaded with continued RNG checks. Opening geometry certificates hold ant positions fixed; they do not prove moving-ant timing or a perfect human difficulty curve. Those still benefit from playtesting.

### Ants Apart hearts

Each level attempt has three hearts shown beside the ant count. Only direct contact between an ant and the player costs one heart. If an ant eats an unfinished seed trail away from the player, the line vanishes and the player returns to the exact point where that line started, with no heart lost. Completed lines remain safe, and a fresh direction starts the next cut. At zero hearts, movement stops and the existing Restart control becomes Retry level. Retry resets that board and refills its hearts while retaining best scores and other levels.

Hearts are saved per level in the existing version 2 attempt payload. Older attempts without a heart count start with three; exhausted attempts stay exhausted after reload. Touching a completed blue line remains safe.

Game usage monitoring separates game opens from the first accepted gameplay input, and reports observed visits ending without a start. All 40 game controllers are covered. Counts represent visits, not unique people or completed rounds; foreground duration includes reading and paused time. The existing Faro collector is reused; localhost does not send analytics.

### Desktop and mobile layouts

DoPop now uses a continuous dotted background and responsive game workspaces. At widths of at least 1024px and heights of at least 600px, existing boards and controls are grouped side by side. Compact windows restore the original vertical arrangement. Each game retains one board and one set of controls, with the same input handlers and saves. Home uses three, four or six game columns according to available width and groups its existing utility links together.

Sudoku docks its existing number pad on desktop and restores the mobile popover, including all nine digits. Canvas games repaint when their containers resize. Existing levels, engines, pause rules, hearts, undo and offline behavior are retained. The theme compiler preserves selector whitespace so responsive descendant rules remain valid.

The implementation is in `app/responsive.css`, `app/responsive.js` and `scripts/patch_responsive.py`. The normal `python3 scripts/build.py` remains the release check. Optional Playwright suites exercise all 40 games in eight window sizes and both themes, plus state preservation during reflow:

```sh
node scripts/test_responsive_browser.cjs
node scripts/test_responsive_state.cjs
```

Run a built local preview first. These optional suites need Playwright installed in the development environment. `PLAYWRIGHT_MODULE` can point to an external Playwright installation, `BROWSER_EXECUTABLE` can select Chrome, and `DOPOP_PREVIEW_URL` defaults to `http://localhost:8765/`. The state suite only permits localhost URLs and adds temporary read-only controller probes to its isolated browser response; they are never written into the release. Viewport checks do not replace physical-device or Safari/Firefox QA.

Home Appearance is a labeled icon button beside the points in the top bar. Privacy & analytics and Credits & licenses share one legal row beneath Feedback on compact screens. Footer groups use layout spacing rather than separator text, with install/save actions kept together.


## Security checks and release controls

Backups are validated against supported game/preference keys and bounded schemas.
Existing pure puzzle validators also check restored attempts and undo state.
A failed initial snapshot never deletes progress. Failed writes report successful
rollback or incomplete recovery accurately. Other current app tabs hold shared
Web Locks leases, so restoring requires closing them; the worker also checks for
other clients, including older tabs. On browsers without Web Locks, the worker
check provides a fallback, with weaker protection against a tab opening during
that check. A browser-restored page reloads if a backup changed while it was away.
No game save format, scoring rule or theme setting is migrated by this hardening.

Executable scripts are same-origin assets. CSP blocks inline JavaScript, inline
event attributes and eval; existing inline styles remain supported for themes.
The optional Faro SDK retains its pinned URL and SRI check. Its asset identity is
recorded in scripts/runtime-inventory.json. OSV checks cover that exact package and
the locked browser tooling; this does not establish every transitive component
inside the upstream CDN bundle.

```sh
python3 scripts/build.py
python3 scripts/check_secrets.py
python3 scripts/check_dependencies.py
npm ci --ignore-scripts --prefix tooling
npx --prefix tooling playwright install chromium
python3 scripts/preview.py
```

With the preview running in another terminal:

```sh
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_home_footer_browser.cjs
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_responsive_state.cjs
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_quiet_browser.cjs
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_quiet_offline_browser.cjs
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_security_browser.cjs
PLAYWRIGHT_MODULE="$PWD/tooling/node_modules/playwright" node scripts/test_responsive_browser.cjs
```

Use an absolute PLAYWRIGHT_MODULE path (for example, the workspace path followed
by /tooling/node_modules/playwright); relative require paths resolve from scripts/.
BROWSER_EXECUTABLE optionally selects an installed browser. Security browser
checks intercept telemetry locally; they send no events to Grafana. The dedicated
security suite applies production headers while regular layout tests use the
local preview. Test-only source readers inspect packaged JS without changing the
served release or weakening CSP.

The new GitHub workflows run release/browser checks and CodeQL with SHA-pinned
actions and minimal permissions. After these workflows are published and pass on
remote main, review `.github/main-ruleset.json` and run:

```sh
python3 scripts/configure_repository_security.py
python3 scripts/configure_repository_security.py --apply
```

The script refuses activation until both real GitHub Actions checks pass on the
current remote main commit. It binds checks to the reporting app and rechecks the
head before enabling PR/check requirements, high-severity CodeQL merge protection,
and force-push/deletion protection. No extra reviewer is required for the current
solo-maintainer setup. Do not enable this before publishing the workflows.

After an authorized deployment, verify the actual artifact and headers:

```sh
python3 scripts/check_deployment.py --commit FULL_DEPLOYED_COMMIT_SHA
```

For rollback, select a previously verified Vercel deployment. Keep the canonical
origin and save keys. Open clients complete their safe-update handshake before
using a replacement worker; existing offline clients can continue using a cached
release until they reconnect. Verify the rolled-back deployment with its commit
and keep exported progress backups before any data-format migration.

See docs/SECURITY_REVIEW.md for evidence, account-setting changes and remaining
Vercel/Grafana/DNS checks. Monitoring exports and local design files remain ignored.

## Sixteen deferred puzzle additions

The catalogue now contains 40 games. The [implementation and validation notes](docs/SIXTEEN_GAMES_IMPLEMENTATION.md) explain the 480 new levels, independent saves, deferred engines, optional free hints, bounded undo, source notices and preview checks. New engines and packs load only when opened and remain covered by the verified complete offline cache. Preview review comes before commit/push.
