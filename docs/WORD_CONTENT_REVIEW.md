# Word content review — 2026-10-31

The general-purpose source dictionaries contained profanity, sexual terms, slurs and other sensitive vocabulary, including the examples reported by the user. The review covers Words targets and bonus words, Word Guess answers and accepted guesses, and Word Search themes and generated letters.

## Editorial selection

`games/word-safety-policy.json` records whole-word exclusions for profanity, explicit sexual content, derogatory language, drugs/alcohol/tobacco, graphic violence and vulgar bodily terms. These terms are excluded as puzzle vocabulary even where they also have an innocent sense. Neutral identities, educational vocabulary and harmless fragments are not automatically excluded: GRAPE, GRASS, SHELL, TITLE, CLASS, ASSIST, CUMIN and WHISK remain available. This is a maintained editorial selection, not a universal age-rating certification or a guarantee against every regional interpretation.

- Words: removed 539 entries, leaving 23,609 accepted target/bonus words. The 1,000 reviewed levels are pinned in `games/word-levels.json`; 896 retain exactly their original racks and targets. Only 104 levels need target or rack changes, including 13 changed rack labels. Rack lengths remain 4/5/6/7 in the original 100/300/350/250 bands; target counts remain 3/4/5/6 in four 250-level bands. Replacements prefer the original target's length and must be spellable from the rack.
- Word Guess: removed 242 accepted guesses, leaving 14,613. Fourteen answers were replaced in place with five-letter animals, foods and everyday objects, such as BLOOD → OTTER and DRUNK → KOALA. All 1,000 answers remain distinct and playable. Exact slot replacements are in `games/word-content-manifest.json`.
- Word Search: the eight themes retain their identities. The kitchen theme uses LADLE and COOKIE instead of KNIFE and COFFEE. All themes belong to the filtered lexicon. Generated rows, columns and diagonals are screened in both directions for a narrower list of severe sequences, including random filler and intersections. A clean original seed is retained; otherwise deterministic alternate seeds are tried. Each theme has a tested deterministic fallback seed family. Every intended word must be placed. This intentionally does not reject every short ambiguous fragment: doing so would also ban SHELL because it contains HELL, for example.

Source licenses, notices and archive fingerprints remain intact. New hashes identify the editorial subsets; the original normalized 12dicts hash is retained in the provenance manifest. No remote moderation service, tracking or dictionary download was added.

## Save compatibility

Words keeps content version 2, level numbers and accumulated score. Safe found targets, bonus words and matching hint reveals are retained; removed or replaced entries are discarded. An affected completed puzzle may need its replacement target solved. Hints and point values are unchanged; no global save reset is performed.

Word Guess keeps its save key, level/date IDs, daily permutation, selected level and preferences. Older rounds for the 14 changed answer slots restart once, including any daily rounds mapped to those slots. Rounds containing guesses removed from the dictionary are rejected by the existing validator. Other valid rounds remain. `vocabularyVersion: 1` prevents another reset on subsequent reloads. Statistics are derived from retained rounds, so discarded results are no longer counted. Old backup imports undergo the same validation; a backup containing a now-excluded guess may be rejected instead of displayed.

Word Search has no persisted board/selection to migrate. Other games, themes, controls and save keys are unchanged.

## Release checks

The build runs `scripts/test_word_safety.py` and `scripts/test_word_safety.cjs`. They check dictionary exclusions and hashes, all 1,000 Words levels and target solvability, stable unaffected slots, all 1,000 Word Guess answers, changed-round save/reload behavior, and 2,048 deterministic Word Search boards (including large puzzle indices) with an independent scanner in all eight directions. Existing release checks continue to cover the other games, licenses, offline hashes and security packaging.

When changing the dictionaries, review whole entries rather than using substring deletion; keep level slots fixed, record any replacement/migration, update content hashes, and rerun the full build. Revisit regional slang and parent feedback as new examples are reported.
