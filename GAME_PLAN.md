# dopop: Dot Connect and 2048

## Reference and scope
- Two Dots official rules: https://dots.helpshift.com/hc/en/3-two-dots/faq/368-how-do-i-play-two-dots/
- Original 2048: https://classic.play2048.co/

Original implementation, own level generation and visual assets. No copied artwork, music, branding, purchase systems or lives restrictions.

## Theme and layout
White full-height pages, existing dopop heading and home-icon grid, roomy board, bottom actions. Soft blue, green, amber and pink/violet dots. Dot symbols distinguish colors. 2048 uses the established four palettes and round/square segmented controls. No background dots outside the board. Pointer gestures and the site-wide Safari double-tap guard remain in effect.

## Dot Connect
100 deterministic levels. Connect at least two orthogonally adjacent dots of one color; trace backward to shorten a chain. Close a loop of at least four to clear all dots of that color. Collection goals and a move budget, no timer. Refill under gravity. Frost appears from level 21 and clears with its dot. Dead boards get a legal connection without charging a move. Undo, retry, help and level selection. Completion advances after a short pause while the page is active. Level 100 stays on its completion screen.

Progression: 1–10: 5×5, three colors, two goals; 11–30: 6×6, three colors, three goals; 31–60: four colors; 61–100: five colors, four goals. Target counts and frost increase within these bands. Random refill means difficulty varies; no claim of a uniquely solvable or perfectly calibrated campaign.

## 2048
Classic 4×4 movement. Equal tiles merge only once per move; merged value adds to score. Only effective moves spawn a tile (90% 2, 10% 4). Reach 2048 and choose Keep going; loss requires no legal moves. Swipe, arrow keys/WASD, and on-screen arrows. Animated slide, undo and confirmed restart. No artificial level picker for an endless game.

## Persistence and audio
Separate versioned localStorage records for each board, score, level, random seed, and one-step undo. Existing saves untouched. Original synthesized pentatonic music is optional, off by default, and starts only following interaction. Audio suspends off-page and when hidden. Respect reduced-motion settings.

## Verification
Build and syntax validation; rule tests in scripts/test_new_games.cjs; browser checks for entry, interaction, undo, level selection, reload and responsive layout. Desktop Chrome phone-size preview is not a substitute for physical iPhone Safari testing.

## Further game additions

The [new-games research and implementation plan](docs/NEW_GAMES_RESEARCH_AND_PLAN.md) reviews the full 40-game reference collection against DoPop's original catalogue and proposes 16 additions, including 10 prioritized games. It records source/license evidence, mobile controls, solver and hint requirements, performance/offline constraints, save integration and staged release gates. All 16 were subsequently implemented with 30 levels each; see the [implementation and validation record](docs/SIXTEEN_GAMES_IMPLEMENTATION.md).
