# dopop

Little games. Good moments. https://www.dopop.fun/

A mobile-first collection of calm puzzles, arcade games and tactile fidgets. No accounts, advertisements or purchases. Browser-local progress, optional sound and an installable offline experience. GitHub main deploys to the existing pocket-pause Vercel project and dopop.fun domains.

## Game collection

| Game | Interaction and progression |
| --- | --- |
| Words | Circular letter wheel; connect letters; 1,000 distinct letter sets; saved progress and level selection |
| Word Search | Find hidden words; puzzle selector and automatic progression |
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

New Light Up, Bridges and Slide games include independent saves, undo (last 30 moves), reset confirmation, level selection, appearance controls and automatic advancement after completion. These are original generated puzzles; a known solution is checked, but uniqueness of every solution and human difficulty have not been proven. Bridges uses nearest-neighbor rectilinear island grids, so legal bridge segments cannot cross. Future expansions should improve puzzle variety after playtesting.

## Theme and interface contract

- Plain white outside play areas. Restrained pale-blue dots may appear within boards and home artwork.
- Blue is the default accent (#4f78ec); use the shared SNAKE_COLORS palette rather than inventing competing options.
- Rounded geometry, soft borders, clear dark text and ample spacing. Offer round/square choices where the mechanics permit.
- Home is a compact app-icon grid with readable game labels. Preserve familiar icon placement when adding games.
- Game pages use a compact back/title/sound header, a generous play area, and bottom level/actions controls. Avoid repeating the site masthead inside games.
- Respect viewport height and device safe areas. On short landscape screens, scrolling is preferable to overlapping controls.
- Color swatches must have equal width/height, zero inherited padding, a centered dot and a centered selected ring. Word Guess has scoped dialog overrides for this reason.
- Word Guess clue colors retain their meanings regardless of accent: green correct, amber misplaced, gray absent. Optional symbols and accessible labels complement color.
- Animations should be gentle, with reduced-motion support for animated effects. Sound is opt-in. Never require audio to solve a puzzle.
- Keep help available and explain controls. Every control needs a descriptive accessible label; keep native button keyboard behavior and visible focus.

## Input and mobile behavior

Games use touch/pointer controls, with keyboard support where implemented. Word Guess provides a persistent on-screen keyboard plus physical keyboard input. Bridges taps the spaces between islands; Slide taps tiles; Light Up taps cells. Do not rely on hover.

Existing site-wide gesture safeguards prevent accidental selection, context menus and repeated-tap zoom during games. Preserve editable input behavior and pinch zoom where supported. CSS/browser emulation does not establish physical iPhone Safari correctness: device QA remains a separate release step.

## State and saves

Progress lives in localStorage on the current browser and origin. Existing keys are contracts: do not rename, clear or silently migrate them without a tested migration. Switching between dopop.fun, www.dopop.fun and older Vercel origins can produce separate saves.

- Existing games primarily use pocketpause.v1.*; Number Path also uses pocketpause.zip.progress.v1.
- Word Guess: pocketpause.v1.wordguess.v1, with independent date/level rounds, guesses, unfinished entry, preferences and derived statistics.
- Light Up/Bridges/Slide: pocketpause.v1.logic.lightUp, pocketpause.v1.logic.bridges, pocketpause.v1.logic.slide.
- New games fit the existing backup allowlist. Offline & saves exports/imports JSON, validates allowed keys and asks before replacing progress.
- Clearing site data removes saves. Browser storage can be evicted or refused. Exported backups are recommended; installation is not a permanent backup.
- No accounts or cloud sync. Saves are not shared across devices. Arcade resume behavior follows each game's implementation.

Word Guess answer IDs and the answer manifest must stay fixed. Its Daily uses the device's local date and a deterministic 1,000-day permutation; it is not the NYT schedule. Older unfinished daily rounds remain saved when choosing Today. Hard mode locks after the first submitted guess. Completed rounds are not counted twice. The bundled accepted-guess list is broader than the curated answer list.

## Offline architecture

All games, styles and dictionaries are bundled into dist/index.html. No runtime dictionary download is needed. scripts/build_offline.py creates icons, the web manifest, the release descriptor and a versioned service worker. Release assets are checked with SHA-256 before installation succeeds. The complete release is cached together; failed downloads do not replace a usable older release.

The client displays Ready for offline play only after a worker cache check. Updates install in the background; the Update ready action requires open clients to be safely at home before activation. Keep this protocol intact to avoid interrupting active play. The worker also supports cache checking/repair.

Install: open online, wait for readiness, use Safari Add to Home Screen or Android Install app, and open the installed app online once before disconnecting. HTTPS is required (a normal HTTP preview cannot verify service-worker installation). New releases regenerate hashes automatically, including CSS-only changes.

## Source map

| Path | Responsibility |
| --- | --- |
| index.html | Tracked base application; build scripts patch this source in sequence |
| scripts/build.py | Ordered assembly and test gate |
| scripts/patch_*.py | Existing game additions and targeted compatibility patches |
| games/calm-trio.* | Color Paths, Untangle, Flood |
| games/word-guess* | Word Guess mechanics, UI, styling, fixed answers, dictionary and license |
| games/logic-trio.* | Light Up, Bridges, Slide generators, mechanics and UI |
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

The build runs Word Guess rules first, then assembles games and offline assets, then runs:

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

## Remaining roadmap

Previously discussed but not implemented here: Loop, Color Code, Peg Solitaire and Rotate. Prioritize puzzle variety, accessible inputs and physical-device QA before increasing level counts. Accounts, analytics, advertising, purchases and cloud synchronization are outside the current design.

## Compact layout and feedback setup

The homepage uses 3 columns on phones, 4 on tablets and 6 on wide desktops.
Sudoku retains square cells; Light Up uses equal grid tracks. Slide distinguishes
its blank tile, and Bridges shows connection targets. Dialogs scroll on short screens.

Feedback uses Google Forms, configured in `feedback-config.json` with the public
responder URL. The homepage link opens in a new tab. Google Forms and Tally HTTPS
responder URLs are accepted; other destinations fail the build. Enable Responses →
Get email notifications for new responses in Google Forms, and verify inbox delivery.
No backend or SMTP credentials are needed. Submission requires internet; games
continue to work offline.

### Release device checklist

Test all 17 game pages at 320x568, 360x640, 390x844, 412x915, tablet portrait/
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
  opening dialogs or hiding the document. Resume is explicit. Editable controls
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
remain unchanged. Generated levels and Word Guess answer IDs are unchanged.
Maze Chase now uses a diamond navigator, ring drones and ring beacons, with its
existing seeded maze generator. No external character art or audio was added.
