# Word Guess release

New, isolated game: five-letter words, six tries, local-date Daily and 1,000 selectable levels. Fixed answer manifest is immutable: never reorder existing IDs in future updates. Broader accepted-guess dictionary is bundled locally. All answers are curated from everyday vocabulary before the later challenge section; familiarity and repeated-letter complexity increase broadly, not strictly for each individual word.

Daily v1 uses a fixed permutation of the answer manifest, repeating after 1,000 days. The device's local calendar date determines the puzzle. An unfinished older daily stays open; Today switches without deleting that round. Date/clock manipulation is not prevented offline.

Save key: pocketpause.v1.wordguess.v1. Each level/date stores guesses, unfinished input and hard-mode setting. Statistics are derived from rounds to prevent double-counting. Level changes preserve attempts. Hard mode is locked after first submission. No reset of scored daily rounds. Existing export/import prefix includes this save unchanged.

Dictionary source: https://github.com/tabatkins/wordle-list (words).
MIT license retained in games/word-guess-LICENSE.txt and embedded in the browser bundle.
The answer selection is an original fixed selection and is not the NYT answer schedule.

Build: patch_word_guess.py inserts only the new game after existing patches, before build_offline.py hashes the complete release. pwa/client.js updates the game count to 14; service-worker behavior, cache strategy, domain settings and existing saves are unchanged.

Checks: node scripts/test_word_guess.cjs; existing game and offline tests; browser entry, typing, duplicate letters, win/loss, levels, hard mode, settings, modal keyboard isolation, reload, small-screen overflow. Offline release hash must include the full dictionary and code. Physical iPhone/Android airplane-mode verification is separate from browser-sized preview QA.

Rollback: revert the Word Guess release commit. Keep its storage key untouched so reinstalling can recover progress. Use a fresh source directory for each build because the inherited build pipeline patches index.html in place.
