# New games: source review and implementation plan

Research date: 2026-10-31. Status: proposal; no new games imported, implemented or deployed by this review.

## Recommendation

There are at least 16 credible additions, with 10 prioritized for a staged roadmap. Start with **Memory Pairs, Flip Lights and Peg Solitaire**. They introduce memory, reversible state puzzles and jump planning without adding complicated controls or another vocabulary dependency. Then add Domino Pairs, Rectangles, Tents and Slant; follow with Dot Sweep, Greater Grid and Skyline.

The remaining six are worthwhile later candidates, rather than a commitment to ship all of them: Symmetry Islands, Magnets, Four Regions, Cage Sums, Tracks and Hidden Rays. Their generators, clues or interaction models need more work.

This is a practical survey of a complete, relevant 40-game open-source collection plus an independently authored memory-game proposal, not an exhaustive inventory of every open-source game on the internet. It considers DoPop's existing 24 games, phone-sized boards, child-friendly content, offline operation, licensing and the recent mobile PageSpeed results. Popularity, search demand and retention estimates are not available; recommendations below are product/engineering judgments, not measured audience demand.

## Rights and evidence

**No license does not mean no owner.** GitHub explains that ordinary copyright restrictions apply when a repository has no license. Public visibility or a Fork button does not supply a redistribution license. Exclude no-license projects, unclear asset packs, scraped puzzle books and commercial daily puzzle feeds from the implementation source pool. [GitHub licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

Game ideas and methods are distinct from protected code, artwork and written expression. The US Copyright Office makes this distinction, but this is not a worldwide finding that a whole game is unowned, nor trademark or patent clearance. Proposed DoPop names are working labels. Use our own interface, icons, help text and generated boards; avoid commercial branding and copied layouts. [US Copyright Office: games](https://www.copyright.gov/register/tx-games.html)

The 15 non-memory candidates have implementations in Simon Tatham's Portable Puzzle Collection, distributed under MIT. The official repository was inspected at commit **`616da16f25da428ccda805536209095bd062676e`**. Its root `LICENCE` and the selected C source files were read/identified; SHA-256 fingerprints are recorded in [the evidence manifest](research/new-game-sources-2026-10-31.json). This confirms a permissive source route, not that the underlying puzzle names, every third-party contribution or all possible assets are cleared. The collection itself acknowledges that many puzzle concepts came from other creators. [Official collection](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/index.html), [MIT license](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/licence.html)

MIT permits modification and redistribution, including commercial use, with the required copyright and permission notice. A translated or adapted solver must retain attribution; writing it in JavaScript does not make borrowed implementation original. Before importing anything, inspect its complete file/dependency closure and bundle the **exact revision's full root license and any additional file notices**. The source license has a fuller contributor list than the web manual; use the source notice. Record code imports separately from rule references and original generated content in `THIRD_PARTY.md` and offline Credits & licenses.

Memory Pairs is proposed as new DoPop code and new geometric SVG assets. No existing repository is claimed as its source, and no public-domain status is claimed for third-party implementations. DoPop's own code does not acquire an open-source license merely by being newly written; the repository's existing licensing policy still applies.

## Ranked shortlist

Effort is an initial estimate in focused engineering days per game, including core rules, generator/pack, interface and game-specific tests. Shared foundation, cross-game browser QA, accessibility review and device testing are additional. These are planning ranges, not delivery promises. Every name is provisional.

| Order | Proposed game / internal ID | Source route | New value for DoPop | Main difficulty | Estimate |
|---|---|---|---|---|---|
| 1 | Memory Pairs / `memoryPairs` | Original code and assets | Visual memory, accessible to beginning players | Hide unrevealed identities from accessibility labels; robust mismatch timing | 1–2 days |
| 2 | Flip Lights / `flipLights` | MIT Flip reference/optional adaptation | Tap-only reversible state puzzle | Solvability and trustworthy move guidance | 2–3 |
| 3 | Peg Solitaire / `pegSolitaire` | MIT Pegs reference/optional adaptation | Pure dots, strategic jumps | Proven reachable boards and recovery hints | 2–4 |
| 4 | Domino Pairs / `dominoPairs` | MIT Dominosa | Pairing and exact-cover deduction | Each unordered pair used once; unique tiling | 4–6 |
| 5 | Rectangles / `rectangles` | MIT Rectangles | Spatial area reasoning and drawing | Unique partition; finger-friendly selection | 4–6 |
| 6 | Tents / `tents` | MIT Tents | Nature theme and local/global deduction | Perfect tree/tent matching | 5–8 |
| 7 | Slant / `slant` | MIT Slant | Minimal diagonals and vertex clues | Global cycle prevention | 4–6 |
| 8 | Dot Sweep / `dotSweep` | MIT Mines | Familiar exploration with neutral hidden dots | Genuine no-guess generation | 6–10 |
| 9 | Greater Grid / `greaterGrid` | MIT Unequal | Number ordering beyond Sudoku | Latin-square uniqueness with inequality clues | 4–7 |
| 10 | Skyline / `skyline` | MIT Towers | Visibility reasoning | Bidirectional clues and unique Latin square | 4–7 |
| 11 | Symmetry Islands / `symmetryIslands` | MIT Galaxies | Especially close to DoPop's dot identity | Connected rotationally symmetric regions | 7–12 |
| 12 | Magnets / `magnets` | MIT Magnets | Polarity/count reasoning | Distinguish unknown from confirmed empty | 6–10 |
| 13 | Four Regions / `fourRegions` | MIT Map | Graph coloring with shape/symbol support | Uniqueness and color-permutation symmetry | 4–7 |
| 14 | Cage Sums / `cageSums` | MIT Keen | Arithmetic puzzle family | Arithmetic edge cases and age-appropriate onboarding | 6–10 |
| 15 | Tracks / `tracks` | MIT Tracks | Route deduction from row/column counts | No branches, disconnected fragments or extra loops | 6–10 |
| 16 | Hidden Rays / `hiddenRays` | MIT Black Box | Observation-based deduction | Equivalent hidden layouts and beam edge cases | 5–8 |

## Game specifications

### 1. Memory Pairs

**Play and presentation:** turn over two cards to find matching geometric symbols. Use circles, arcs, triangles and dot patterns authored as DoPop SVG geometry; avoid emoji, branded characters, pictures from the web and color-only differences. Start with six pairs in a 3×4 layout; later boards use eight or ten pairs, sized to the available width. Card faces use restrained blue accents in both themes.

**Core and content:** deterministic seeded shuffles, exactly two instances of each identity, stable level layouts and a bounded input state machine. Keep a mismatch visible briefly, then hide it; backgrounding, resizing or reloading must not leave the board locked or permit a third simultaneous reveal. Store card IDs, matches and the pending pair, not a DOM snapshot. Randomization alone is not calibrated difficulty; use number of pairs and symbol distinctness as the initial progression.

**Controls and help:** tap/Enter flips; arrows move focus. A hidden card's accessible name is its position and state, not its secret symbol. An optional free preview hint marks the attempt assisted. Track fewest pair attempts separately from assisted results; no mandatory timer. First flip starts play.

**Acceptance:** duplicate-identity checks, same-card double tap, input during mismatch, screen-reader labels, reduced-motion transitions, background/reload recovery and completion counted once.

### 2. Flip Lights

**Play and distinction:** tap a dot to toggle it and its orthogonal neighbors; bring every dot to one state. Unlike Light Up, this is a reversible toggle puzzle, not illumination from placed lamps. Use hollow/filled dots plus a non-color state label. [Flip reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/flip.html)

**Core and generation:** begin from a solved board and apply a recorded set of legal flips. Use 3×3, then 4×4 and 5×5 boards. Reject solved starts, trivial one-move boards in later bands and duplicates under rotation/reflection. Solve the binary linear system over GF(2) to verify reachability and generate hints. Multiple move sequences can legitimately solve a board; uniqueness is not a requirement here.

**Controls and scoring:** tap/Space acts immediately; undo reverses a flip. A hint identifies a valid next toggle for the current state. Store fewest moves and assisted status. Do not call a solution or score “optimal” unless the solver proves the minimum over the applicable solution space.

**Acceptance:** toggling twice restores the board, border/corner neighborhoods are correct, every pack board solves, hints remain valid after arbitrary moves, and unsupported minimum-move claims never appear.

### 3. Peg Solitaire

**Play and presentation:** jump one dot orthogonally over another into an empty hole, removing the jumped dot, until one remains. This fits the existing visual language directly. Start with small authored board masks, then larger cross shapes; a central final position is required only when the level explicitly marks it. [Pegs reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/pegs.html)

**Generation:** construct boards by reversing legal jumps from a one-peg finish, and retain a witness solution. A connected mask alone does not prove solvability. Reject repeated masks/positions and check that the forward witness follows every rule. Multiple valid solutions are welcome. Don't generate a random set of pegs and assume it is winnable.

**Controls and hints:** tap a peg, then a legal destination; dragging and keyboard select/direction are alternatives. Show legal destinations without an extra Play button. A hint searches the current state. If that state has no completion, offer undo rather than replaying an invalid step from the starting witness. Distinguish reaching a dead end from finishing with one peg. Use a completion mark or remaining-peg best, not redundant scoring of move count: all successful runs from the same start use the same number of jumps.

**Acceptance:** hole-mask boundaries, occupied destinations, removal counts, legal reverse/forward witnesses, dead-end detection, undo and save validation.

### 4. Domino Pairs

**Play:** cover a number/pip grid with dominoes so every unordered pair in the selected set appears exactly once. Introduce double-two, then double-three and double-four sets, yielding 4×3, 5×4 and 6×5 boards. Do not start on an 8×7 adult board. [Dominosa reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/dominosa.html)

**Generator/solver:** make a legal tiling using the complete pair set, expose its numbers, and count compatible tilings with an exact-cover solver. Stop counting at two and reject ambiguity. Treat 1–2 and 2–1 as the same pair. Include zero as a meaningful value; give empty-pip tiles a clear “zero” accessible label.

**Interaction:** tap two adjacent cells or drag across them to place a domino. A second tap can remove it. Optional “not paired” marks belong in the contextual tools, not a permanent crowded palette. A hint highlights a forced pairing and gives a short reason. Progress is solved levels and assisted completion, with reversible placement rather than lives.

**Acceptance:** no overlap, full coverage, exact pair inventory, uniqueness checked independently, rotate/view changes preserve coordinates, and touch placement never requires clicking a one-pixel boundary.

### 5. Rectangles

**Play:** partition the board into rectangles, each with one clue equal to its area. Start 4×4, advance to 5×5 and 6×6. Neutral outlined regions distinguish this from Color Paths and Picture Grid. [Rectangles reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/rect.html), [original publisher's rule description](https://www.nikoli.co.jp/en/puzzles/shikaku/)

**Generator:** create a complete rectangular partition, place one area clue per region, enumerate legal clue-containing rectangles and solve the resulting exact-cover problem. A generated solution is not enough: reject puzzles with a second partition. Rank difficulty by deductions and candidate count rather than only board area.

**Controls/hints:** drag between opposite corners, or tap a start and end cell; arrows/Enter provide the same action. Preview the candidate rectangle and cancel on Escape, pointer cancellation or resize. A free hint shows a logically forced region from the current valid state. Save rectangles and undo history in grid coordinates.

**Acceptance:** areas, one clue per rectangle, full coverage, no overlap, uniqueness, cancellation without state loss and accessible drag alternatives. Write original help and boards; do not reuse publisher examples.

### 6. Tents

**Play:** place a tent for every tree, meeting row and column counts; tents cannot touch, including diagonally. Trees are dot-and-stem outlines and tents are simple triangles. A tent may neighbor several trees: the finished arrangement needs a valid one-to-one tree/tent matching. “Every tent touches a tree” is an insufficient validator. [Tents reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/tents.html)

**Generator:** construct separated tent locations and an associated tree matching; derive counts, then solve independently for a unique tent layout. Multiple possible matchings for that same tent layout are not multiple puzzle answers. Start 5×5, then 6×6 and 7×7 only where controls remain comfortable.

**Controls/hints:** tap cycles unknown → tent → confirmed grass → unknown. Keyboard and an optional contextual mark action avoid a long-press requirement. A hint may explain a satisfied row, diagonal exclusion or matching constraint. Keep the row/column labels visible in both themes.

**Acceptance:** Hall/matching counterexamples, diagonal contacts, fixed trees, unknown versus grass, exact counts, unique layouts and hints that do not falsely assign a tent to the wrong adjacent tree.

### 7. Slant

**Play:** choose one diagonal in each cell. Numbered vertices specify incident-line counts and the complete diagonal graph must have no cycle. This is deliberately different from Loop, where making one closed loop is the goal. Use 4×4 through 6×6 boards. [Slant reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/slant.html)

**Generator/solver:** create acyclic diagonal arrangements, compute clues, then remove clues while retaining a unique solution and the intended deduction difficulty. Use a disjoint-set/cycle check in the validator; a solver that backtracks needs rollback support or a fresh graph reconstruction.

**Controls/hints:** tap cycles blank, slash, backslash; keyboard `/`, `\` and Delete support direct entry. Cycle controls remain reversible with Undo. A hint explains a vertex count or cycle restriction. Line widths, dots and clue circles use theme tokens.

**Acceptance:** boundary vertices, small and large cycles, clue-free invalid loops, every cell completed, solver uniqueness and all three editable states surviving saves.

### 8. Dot Sweep

**Play:** a child-friendly hidden-dot version of the Mines rules: reveal safe cells and use neighbor counts to mark hidden dots. Use no explosion artwork, war framing, death counter or paid retries. An accidental reveal can end the attempt with an immediate free retry/undo choice. [Mines reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mines.html)

**Generation:** start with a known safe opening already revealed, and certify every campaign board with a deduction solver from that exact opening. This keeps fixed level identities and avoids moving hidden dots after the first tap. A first-safe-square guarantee is not the same as a no-guess guarantee. Reject layouts requiring guessing under the supported beginner/intermediate rule set, even if exhaustive search can solve them. Start with 5×5 and 6×6 boards; a larger free-play mode can wait.

**Controls/hints:** tap reveals; a clearly labeled Reveal/Mark control provides touch flagging. Right-click or a keyboard shortcut is an extra, not a requirement. Never reveal a marked cell on a normal tap. Only show a hint if it is a proven safe reveal/mark from the current consistent evidence; an incorrect player mark must not make the hint unsafe. Automatic opening does not count as the player's first accepted gameplay input.

**Acceptance:** adjacency counts, zero-cell flood reveal, safe opening, wrong flags, no-guess proof, stable retry, and no hidden-information leakage in accessible cell names.

### 9. Greater Grid

**Play:** fill a small Latin square with values 1–N, once per row/column, satisfying greater-than clues. This adds inequalities and has no Sudoku sub-boxes. Start 4×4 and 5×5; keep the alternative adjacency-rule variant out of the first release. [Unequal reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/unequal.html)

**Generator:** produce valid Latin squares using more than one base pattern, add inequality/fixed clues, and remove clues while a bounded solver still finds exactly one answer. Mere row/column permutations of a single construction are insufficient variety. Rate levels using deduction depth, not clue count alone.

**UI/hints:** reuse the visual language of the Sudoku keypad through a new instance, not its mutable state. Inequalities must remain legible and have spoken labels such as “row 2 column 1 is greater than row 2 column 2.” A hint explains an ordering or row/column elimination. Keep notes contextual and avoid a second always-visible keyboard.

**Acceptance:** transposed and vertical inequalities, fixed cells, Latin constraints, uniqueness, notes, clear/undo and independent save keys.

### 10. Skyline

**Play:** each row/column contains heights 1–N; outside clues count visible towers, with taller towers hiding shorter ones. This is a line-of-sight number puzzle, unlike Sightline's contiguous-cell visibility. Show numbers first and optional short height marks, with no 3D assets. [Towers reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/towers.html)

**Generator:** construct Latin squares, derive all four sets of sight counts, then remove clues/givens while retaining uniqueness and a logical solve route. Begin 4×4, then 5×5. Do not assume four edge counts make every Latin square unique.

**UI/hints:** tap a cell for the same compact numeric controls used by Greater Grid. Keep all edge clues readable; highlight the corresponding line on focus. A hint explains, for example, why a visible count of one forces the tallest tower first.

**Acceptance:** counts from each direction, clue alignment after responsive changes, partially filled line bounds, unique solution and no text collision at 320 CSS pixels.

### 11. Symmetry Islands

**Play:** divide a grid into connected regions, each centered on one dot and invariant under 180° rotation. Dots can lie on cells, edges or vertices, so store centers in doubled integer coordinates instead of rounded CSS coordinates. [Galaxies reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/galaxies.html)

**Generator/solver:** construct symmetric connected regions, then prove that the centers determine exactly one valid partition. Start with cell centers only; introduce half-cell centers after a small onboarding set. A pretty symmetric picture does not prove unique or interesting deduction.

**Interaction/hints:** draw/remove boundaries with generous hit regions and provide keyboard edge navigation. Mirrored candidate shading can explain a hint, but should not silently place every paired boundary in ordinary play. Use dot IDs and outlines in addition to tinting.

**Acceptance:** exactly one center per region, connectivity, reflection of every cell, no extra internal boundaries, half-coordinate centers, uniqueness and usable edge selection on phones. This is a strong visual fit but belongs after generator validation, not in the first low-risk batch.

### 12. Magnets

**Play:** fixed domino outlines contain either a positive/negative magnet or a neutral pair. Like poles cannot touch orthogonally; outside counts constrain polarities. Start on even-sized 4×4 and 4×6 boards. [Magnets reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/magnets.html)

**Core/generation:** use separate states for unknown, plus/minus, minus/plus and confirmed neutral. Neutral is not an unfilled puzzle slot. Generate assignments on a domino tiling, derive counts and prove unique assignments after clue removal. Equal neighboring neutral ends are allowed; matching non-neutral poles are not.

**Controls/hints:** tap cycles a whole domino, not one pole independently. Plus/minus glyphs and neutral marks remain meaningful without color. A hint cites a count or adjacent-pole restriction. Row/column clue hit areas must not crowd the board.

**Acceptance:** polarity orientation, complete domino pairing, missing clue handling, confirmed neutral state, uniqueness and save/hint behavior after flips.

### 13. Four Regions

**Play:** color an abstract region map with four symbol-coded colors so regions sharing an edge differ. Regions touching only at a point may match. The working name refers to four colors, not a fixed total of four regions. This is graph coloring rather than Flood's spreading mechanics. [Map reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/map.html)

**Generator:** make connected planar regions and derive their adjacency graph from shared boundaries. Add enough fixed colors to anchor the four labels and yield one solution; otherwise global color permutations can masquerade as different answers. Verify uniqueness relative to the fixed labels. Use 8–12 generously sized regions first, not tiny slivers.

**Interaction/hints:** select a region then one of four compact color+symbol choices; keyboard 1–4 is equivalent. Pattern/symbol overlays make this playable without color discrimination. A hint shows a forced exclusion/assignment. Preserve fixed clues on all editing paths.

**Acceptance:** edge versus corner contact, narrow regions, adjacency extraction, color-permutation accounting, immutable givens and unique labeling. The reference manual describes an authored puzzle design; do not market it as an ancient unowned game.

### 14. Cage Sums

**Play:** complete a Latin square while satisfying arithmetic targets in connected cages. Use the descriptive working label, not a commercial puzzle brand or its logo. Start 3×3/4×4 with addition; introduce multiplication, then two-cell subtraction/division with clear examples. [Keen reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/keen.html)

**Core/generation:** cage arithmetic must be explicit. Subtraction/division use two cells with order-independent absolute difference/exact integer ratio. A number may repeat within a cage if it does not repeat in a row/column. Do not accidentally import Killer Sudoku's different cage rule. Enumerate cage candidates and enforce a unique Latin-square solution.

**Interaction/hints:** compact numeric keypad and notes; cage labels remain readable in dark mode. A hint explains a candidate combination or Latin elimination. Store best unassisted completion, not a reward wallet.

**Acceptance:** multiplication bounds, zero/fraction rejection, integer division, valid repeated cage values, connected cages, uniqueness and age-appropriate early levels. Branding/source review remains required despite the MIT implementation route.

### 15. Tracks

**Play:** connect A to B with one non-branching orthogonal route, satisfying row/column occupancy counts and fixed track clues. Unlike Number Path, it does not fill every cell or visit numbered checkpoints. Use a thin dotted route rather than imported train graphics. [Tracks reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/tracks.html)

**Generator:** build a self-avoiding route, derive counts and chosen fixed segments, then prove a unique route. Local degree constraints alone permit an extra disconnected cycle; the completed validator must enforce one connected A–B component and no extraneous fragments. Begin 5×5/6×6.

**UI/hints:** drag short segments or tap adjoining cells; mark cells excluded through a contextual control. Preserve tentative segments in undo. Hints explain a saturated count or forced continuation. Session metrics start on the first accepted edit, not when the sample route animates.

**Acceptance:** endpoints, degree, crossings, isolated cycles, row/column counts, clues, unique route, resize cancellation and keyboard construction. Existing path games reduce implementation cost but also make novelty moderate.

### 16. Hidden Rays

**Play:** probe the border of a grid and infer hidden dots from absorbed, reflected and deflected rays. Start 4×4 with two hidden dots and an optional visual explanation of a single probe. Use original border glyphs, not a commercial board game's artwork. The reference identifies the original Black Box board game; this is not claimed as an unowned concept. [Black Box reference](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/blackbox.html)

**Core/content:** specify rule precedence for a direct hit, diagonal deflection and immediate reflection at the entrance. Track ray states to avoid an accidental infinite loop. Different hidden layouts can give identical observations: either certify unique observational signatures for the small campaign boards or accept any placement of the stated dot count producing the same complete border-probe signature. Comparing only against one stored arrangement can reject a correct answer.

**UI/hints:** tap border probes, tap interior guesses and use one explicit Check action. This action is part of submitting a hypothesis, not an extra Play/Resume step. Hints explain an observed ray result instead of claiming that one hidden arrangement is the only answer. No penalty currency.

**Acceptance:** all direction/edge cases, equivalent layouts, full-probe signature comparison, finite ray tracing, keyboard border access and a small tutorial that does not overwhelm the play area. Defer until the interaction tests show that the rules feel natural on phones.

## Complete reference-collection screening

The official collection currently lists these 40 games. All share the collection's stated MIT route; classifications below concern DoPop fit, not a separate finding of legal clearance.

**Already represented: 12.** Bridges → Bridges; Fifteen → Slide; Flood → Flood; Guess → Color Code; Light Up → Light Up; Loopy → Loop; Net → Rotate Network; Pattern → Picture Grid; Range → Sightline; Solo → Sudoku; Unruly → Binary Grid; Untangle → Untangle. These are conceptual overlaps, not assertions that DoPop imported their code. Avoid counting renames or rule variants as wholly new additions.

**Selected: 15.** Flip, Pegs, Dominosa, Rectangles, Tents, Slant, Mines, Unequal, Towers, Galaxies, Magnets, Map, Keen, Tracks and Black Box. The independent Memory Pairs proposal makes 16 planned additions.

**Deferred: 13.** Each was checked against its official manual; links below are rule references, not a license to copy publisher boards.

| Reference | Assessment | Why defer |
|---|---|---|
| [Filling](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/filling.html) | Good next reserve: same-number regions have matching sizes | Another numeric/region solver; introduce after the first spatial family |
| [Palisade](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/palisade.html) | Good reserve: equal-sized regions constrained by border counts | Edge interaction overlaps Rectangles/Symmetry Islands; connectivity solver needs care |
| [Singles](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/singles.html) | Good reserve: remove duplicate numbers while keeping the unshaded area connected | Numeral-heavy appearance overlaps Sudoku/Binary Grid; teach its distinct connectivity rule |
| [Mosaic](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mosaic.html) | Feasible: local 3×3 filled-cell counts | Looks close to Picture Grid/Sightline; trace its noted implementation lineage before any code adaptation |
| [Pearl](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/pearl.html) | Feasible: loop through circles with turning/straight rules | Strong visual fit, but another loop game; preserve as a later family expansion |
| [Signpost](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/signpost.html) | Feasible: connect consecutive numbers along arrows | Similar purpose to Number Path, with more arrow/number clutter |
| [Same Game](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/samegame.html) | Feasible: remove adjacent groups and collapse the board | Much overlap with Dot Connect/Flood; don't label random boards fully clearable without proof |
| [Netslide](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/netslide.html) | Feasible: network repair by shifting rows/columns | Close to Rotate Network and Slide; less new value |
| [Sixteen](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/sixteen.html) | Feasible: wrap entire tile rows/columns into order | Another sliding-number variant |
| [Twiddle](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/twiddle.html) | Feasible: rotate groups of tiles | Moderate mobile hit-target complexity and overlap with Slide; no borrowed commercial artwork |
| [Cube](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/cube.html) | Possible later: transfer colors between board and rolling solid | Orientation/3D explanation works against the present flat minimal interface |
| [Inertia](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/inertia.html) | Possible with neutral theming: slide a ball through obstacles | Eight-direction motion, long moves and hazard rules add control complexity |
| [Undead](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/undead.html) | Defer for this product direction | Monster vocabulary conflicts with the recent child-friendly-content request; neutral re-theming still needs careful rule teaching |

Chess, Go, Reversi, draughts, card solitaire and Sokoban are outside this collection and not source-cleared by this review. They may be future candidates, but opponents, rules variants, art licensing, long sessions or puzzle-pack provenance need a separate source review. In particular, generic pushing mechanics do not make somebody else's Sokoban levels reusable. No no-license repository is recommended.

## Minimalist product contract

Use the current DoPop shell: one board, original geometric icon, brief status and compact actions. The home footer stays at three actions. No new permanent footer links, onboarding carousel, points wallet, ads, account system or mandatory Play/Resume controls. First accepted board interaction starts play. Undo, Help and Level remain familiar; a contextual tool or Check button appears only where it performs a necessary game action.

Keep the existing blue dots observable on both light and navy surfaces. Clues and game marks use theme roles; no inversion filters. Symbols and text accompany color. Appearance remains in the established location. Completion is calm and respects reduced motion; don't force a new level while a dialog owns input or the page is hidden.

Mobile boards use a single column with reachable actions. Desktop boards sit with controls alongside using the existing responsive conventions; do not duplicate state/controllers for two layouts. Maintain visible focus and cancel incomplete gestures on resize. Aim for 44 CSS-pixel primary controls and comfortable cell sizes; check dense board/edge targets against WCAG 2.2's 24 CSS-pixel minimum or applicable spacing alternatives rather than assuming that visually large board cells make every edge target accessible. Provide tap/keyboard alternatives to dragging and no essential long-press action. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

At 40 eventual home cards, browsing itself needs validation. First extend the existing grid by three cards. Test discovery at 27, 31 and 34 games before changing navigation. Do not automatically add category tabs, a search bar, favorites and sorting all at once; use the existing game directory and only introduce one simple browsing aid if observed use justifies it.

## Scores, hints and progression

Keep results local to each game. Memory can record pair attempts; Flip can record moves; Pegs records completion/remaining pegs; deduction games record completed and assisted levels. Optional solve duration belongs in the result/detail view, not a persistent ticking clock. Retries and normal hints remain free; no cross-game currency or locked lives.

Hints must operate on the current state, explain the applicable rule and avoid corrupting progress. An invalid assumption should lead to a correction/undo suggestion. A stored solution is not sufficient for a hint in a game with multiple valid answers. Assisted status is per attempt and does not erase an existing better unassisted result. Saving/reloading cannot double-award a result.

Start with 30 verified fixed levels per campaign, usually ten introductory, ten intermediate and ten later levels, rather than promising 1,000 near-duplicates. Memory uses stable seeded layouts; the other packs include solver certificates or witness routes as appropriate. Gradually expand to 60/100 after difficulty review. Board size is only one difficulty factor; count deduction types, branching needed by the generator verifier and beginner solve steps. Avoid timed or reading-heavy requirements in early levels.

## Technical integration

### Foundation with limited impact on the existing 24 games

1. Add new isolated game cores with pure `fresh`, `apply`, `validate`, `complete` and `hint` operations. Exact names can follow the repository style; the required property is that rules do not depend on DOM, storage, clock or audio. Reuse small tested utilities for coordinates, deterministic RNG, history and clue rendering. Do not rewrite existing engines as part of adding games.
2. Generate and verify level packs at build time. Commit stable IDs, content version, generator version, source fingerprints and pack SHA-256. Derive local seeds from game/version/level; pin output content so a later generator change cannot silently change somebody's saved board. Bound solver retries and computation; fail the build instead of shipping an uncertain puzzle.
3. Extend the existing shell for new games with an idempotent mount/unmount contract. `app/responsive.js` currently enumerates known boards once; a deferred game needs a small explicit registration hook that applies the current layout and observes its board exactly once. Keep the old registrations and controller ownership intact. Lazy-mounted canvases/boards also need theme repaint registration.
4. Use new save namespaces such as `pocketpause.v1.memoryPairs` and `pocketpause.v1.flipLights`. Retain content version, stable level ID, current attempt, bounded undo and per-level result. Register both the base schema in `pwa/save-safety.js` and the semantic validator in `pwa/save-validators.js`; `register` currently rejects an unknown key. Never loosen the key allowlist. Preserve readiness leases, multi-tab restore exclusion and generation-marker behavior.
5. Deferred modules must not weaken backup validation before first open. Load their small validators from the startup validation registry, and retain enough pack information to validate unopened-game saves; expensive generation/solving stays out of startup. Test importing/exporting a new-game save without first opening that game.
6. Add each game to `seo/games.json`, original guide copy, the home catalogue, responsive board mapping, first-input ownership hooks, backup coverage, release-count assertions and source/notice records. Keep the existing metadata-only SEO policy for home branding. Add one meaningful indexable guide per game; avoid empty or near-duplicate level pages.
7. If the existing opted-in usage events cover a new game, update catalogue IDs and the first-accepted-input wiring only. No new tracker, event category, user identifier or board/answer payload. Loading a module or automatically revealing a starting clue is not gameplay.

### Startup and offline performance

The recent lab reports showed mobile performance 89 with 3.1-second LCP and desktop performance 97. Those are individual measurements, not real-user percentiles. Adding 16 eagerly parsed engines would work against the mobile improvement goal.

Prefer a small catalogue/shell and locally served, hashed game modules loaded on first open. Existing modules may remain as they are initially; do not turn this into an all-game bundler migration. New game assets are included in the complete hashed offline release, so deferred execution does **not** eliminate their installation/download cost. Preserve atomic cache installation, safe old-release updates and honest “all games ready” status. Don't mark the full app offline-ready until all required new modules/packs are verified.

Planning budgets, subject to measurement: no extra blocking script on the home critical path; target at most 5 KB compressed new catalogue/bootstrap code for the first batch and at most 30 KB compressed engine+pack per simple new game. Larger solver-based games need an explicit budget review. Do not download a remote CDN game, embed an iframe or add a Wasm/C toolchain merely because an upstream web build exists. First inspect which part of a mature C implementation is actually needed; upstream file length includes UI and generator machinery as well as rules.

`scripts/build_security.py` currently externalizes scripts and rebuilds offline digests. New local modules must be emitted under the hashed asset contract and included before final digest assembly. Avoid circular content-hash dependencies. Keep `script-src 'self'` compatible loading, no `eval`, no inline event handlers and no external game APIs. Benchmark cold first load, repeat visit, first open of a new game and fully offline entry separately.

## Rollout plan

| Stage | Deliverable | Exit condition |
|---|---|---|
| 0 — preparation | Source/notice decisions, state schema, small registration/loading support, accessible input primitives | Existing 24 games pass unchanged behavior/save checks; no first-paint regression |
| 1 — three simple additions | Memory Pairs, Flip Lights, Peg Solitaire; 30 verified levels/layouts each | New controls work without Play; current-state hints, safe recovery and both themes pass |
| 2 — four spatial additions | Domino Pairs, Rectangles, Tents, Slant | Unique campaigns proven where applicable; matching/cycle and touch edge cases pass |
| 3 — reach ten new games | Dot Sweep, Greater Grid, Skyline | No-guess claim certified; independent Latin/visibility checks; new offline/save coverage passes |
| 4 — optional six | Symmetry Islands, Magnets, Four Regions, Cage Sums, Tracks, Hidden Rays | Each passes a separate usability, source and solver gate; don't ship just to meet a count |

Allow roughly 3–5 focused engineering days for the shared preparation, plus cross-game/device QA and contingency beyond the per-game ranges. The first three games estimate 5–9 game-specific days; the first ten estimate 36–59 game-specific days. These numbers should be revised after the first vertical slice, especially for touch usability and solver ports. Packaging all ten into one unreviewed release is not recommended.

Each stage should be a reviewable branch/PR with original-code versus adapted-code attribution, fixed content hashes, screenshots in both themes, tests, payload measurements and rollback instructions. User authorization is required before production push/deploy under this repository's rules. This document is not that authorization. Keep the pending word-safety changes separate from game additions.

## Validation and release gates

For every level, validate rules independently from the generator. Count up to two solutions for unique deduction puzzles; accept known alternatives in multi-solution action puzzles. For solvable-action games, replay the witness. For no-guess claims, replay the documented deduction engine. Do not make the solver merely return the generator's stored answer. Test invalid near-solutions deliberately, especially matching failures, stray cycles, duplicate pairs and observationally equivalent hidden layouts.

Test actual play: first touch, pointer cancellation, keyboard editing, focus order, Undo, Hint, retry, level switching, reload, hidden-tab resume and dialog ownership. Malformed saves and old-version records must fail safely without resetting other games. Test storage refusal/quota, failed restore, importing a save for an unopened deferred game, multi-tab exclusion and no duplicate result recording.

Extend `scripts/test_responsive_browser.cjs` with every new board selector. At the current eight viewport/two-theme coverage, 27 total games produce 432 game views; 34 produce 544; 40 produce 640. Also test real iPhone Safari and Android Chrome: browser viewport emulation alone does not establish physical touch behavior or platform accessibility. Check contrast for clues, state glyphs, notes and focus indicators, not just the home icon.

Run the existing build and security/browser gates. Confirm all previously saved games still load, the service worker upgrades safely while an old game remains open, every new game and guide works offline, and a failed new-asset download leaves the last complete release usable. Maintain source notices offline, strict CSP and existing telemetry opt-out behavior. Repeat comparable mobile lab measurements across several runs and use available real-user data without adding tracking. Investigate a reproducible regression before adding the next batch.

Rollback removes a new game from catalogue/loading while retaining its save namespace for a future compatible return. Never recycle its ID or regenerate levels under the same version. Rebuild the release descriptor and service-worker contract through the normal pipeline.

## Immediate next implementation slice

Build **Flip Lights** first as a technical slice: one verified 3×3 board, tap/keyboard play, undo, an explained hint, a saved attempt, both themes, direct guide entry and offline caching. It exercises the shared contract with little visual or content risk. Then grow it to 30 verified boards and add Memory Pairs/Peg Solitaire using the same bounded shell. This ordering balances early product variety with proving the integration before a more complex solver game.
