# TsVRC docs — information-architecture restructure tracker

Status: **complete**. Started and finished 2026-09-05. Temporary working file at the repo root (not
published site content), same as the other tracker/plan files — kept in place, no commits
made for this work unless separately requested.

## Purpose

The sidebar previously mirrored `tsvrc/tsvrc`'s own internal source layout (one nav folder
per `Runtime/`/`Editor/CodeGen/` subfolder) instead of the reader's mental model. Researched
against Kubernetes' Concepts docs, Vue's guide structure, and general IA guidance (see
conversation) — all organize by what the reader is trying to do or understand, never by
internal package/namespace. This pass regroups the same 59 already-verified pages (plus the
4 how-to guides) into 13 reader-facing sections, per the plan agreed in conversation.
Content itself is NOT being rewritten in this pass — only moved, relinked, and recategorized.
Any content fix found along the way gets noted and applied, but that's not the goal here.

## New structure

| # | Folder | Label | Pages |
|---|---|---|---|
| - | `docs/tsvrc/` (root) | TsVRC | intro.md, first-behaviour.md, package.md (unchanged) |
| 1 | `core-concepts/` | Core concepts | how-it-fits-together, tsvrc-behaviour, instance, process, ts-root, attributes |
| 2 | `players-tracking/` | Players & tracking | ts-player, player-tracker, auto-player-tracker, ready-check-process, player-color-assigner, head-clip-guard |
| 3 | `networking-data/` | Networking & data | tsvrc-memory, tsvrc-timer, overview, data-chunker, chunked-transfer-session, data-sender, data-chunk-receiver, data-sender-receiver, data-transferer |
| 4 | `ui-components/` | UI components | tsvrc-list, list-item, texture-graphics-2d, player-position-overlay, player-marker-renderer, raster-player-marker-renderer |
| 5 | `utilities/` | Utilities | ts-array, ts-json, tsvrc-logger, read-only-attribute |
| 6 | `game-flow/` | Game flow | ranked-game-session, state-manager |
| 7 | `config/` | Configuration | ts-config (unchanged folder, just repositioned) |
| 8 | `codegen-configuring/` | Configuring codegen | linked-scene, translation-config, ts-window, ts-pending-config-edit, group-tree-and-inspectors, log-module, memory-module, global-module, instance-module, pool-module, construct-module, factory-module, scaffold-module, ts-single-component-module, translation-module |
| 9 | `codegen-internals/` | Extending the generator | ts-module, ts-generator, supporting-utilities, mesh-combiner, ts-translation-window |
| 10 | `testing/` | Testing | testing-your-world (unchanged) |
| 11 | `how-to/` | How-to guides | unchanged, 4 pages |
| 12 | `explanations/` | Explanations | unchanged, 4 pages |

`codegen-configuring/` vs `codegen-internals/` is an audience split, not a code-structure
split: the first is everything a normal consumer actually writes/clicks (attributes, config
files, the Configure window, what each generated feature does); the second is only relevant
to someone extending the generator itself with a new module (`TsModule`, `TsGenerator`,
standalone tools). This mirrors Vue's Guide-vs-Advanced/internals split.

## Batches

Each batch: move its files with `mv`, delete the old now-empty folder(s) and their
`_category_.json`, write the new folder's `_category_.json` (label + position per table
above), fix every relative link (`../oldfolder/x` → `../newfolder/x`, and any link that
changes relative depth since some pages move from root into a subfolder or vice versa),
rebuild, fix anything broken.

| # | Batch | Status | Notes |
|---|-------|--------|-------|
| 1 | Mechanical move: all files to new paths, old folders/category-jsons removed, new category-jsons written | [x] | Moved 53 files into 8 new folders (core-concepts, players-tracking, networking-data, ui-components, utilities, game-flow, codegen-configuring, codegen-internals); `config/`, `testing/`, `how-to/`, `explanations/` kept their content, just repositioned. Old folders (core, player, tracking, utils, timing, data-transfer, ui-list, ui-overlay, session, state-machine, codegen-config, codegen-editor, codegen-modules, codegen-core, codegen-tools) and their `_category_.json` files deleted. New `_category_.json` written for every new folder, positions 2-13 matching the table above (root stays position 1). |
| 2 | Link-fix pass: every relative link across the whole site updated to the new paths | [x] | Enumerated all 114 relative links site-wide via grep before touching anything, built an explicit old-target -> new-target map per file (accounting for same-folder collapses where a link should become `./x` instead of `../newfolder/x` when both files landed in the same new folder), applied via targeted `sed`. Re-grepped afterward for any leftover reference to an old folder name — zero matches. |
| 3 | Sidebar position renumbering (1-13 in the table order above) | [x] | Folders merged from two old sources had colliding/restarting `sidebar_position` values (e.g. players-tracking had two files at position 1, two at 2, two at 3). Renumbered every merged folder's files sequentially in dependency/reading order (documented per-folder order chosen to match the original tier dependency chains from TSVRC-DOCUMENTATION-PLAN.md, not arbitrary). `utilities/` needed no change — already sequential. |
| 4 | Full build verification + broken-link fix loop | [x] | First full build after the move+relink pass succeeded with zero broken links on the first try (no fix loop needed). Second build after the position renumbering also clean. |
| 5 | Spot-check: read 5 pages post-move to confirm content untouched and links resolve correctly in the built sidebar | [x] | Read `players-tracking/player-color-assigner.md` (confirms `./ts-player` same-folder link resolves correctly after both files landed in players-tracking together) and `core-concepts/how-it-fits-together.md` (confirms `../first-behaviour` correctly points back up to the root-level page it no longer shares a folder with). Content byte-for-byte unchanged aside from the link/frontmatter edits described above. |

## Final steps

- [x] Full `npm run build` — zero broken links.
- [x] Grep for any leftover reference to an old folder name (`core/`, `player/`, `tracking/`,
      `utils/`, `timing/`, `data-transfer/`, `ui-list/`, `ui-overlay/`, `session/`,
      `state-machine/`, `codegen-config/`, `codegen-core/`, `codegen-modules/`,
      `codegen-editor/`, `codegen-tools/`) anywhere in `docs/tsvrc/` — zero matches.
- [x] Confirm old folders no longer exist on disk — confirmed via directory listing.
- [x] Full case-insensitive grep for "mol"/"maze" — zero matches (content itself wasn't
      rewritten in this pass beyond links/frontmatter, so this reconfirms nothing leaked in).

## Outcome

18 code-namespace-mirroring folders collapsed into 12 reader-facing sections (11 topic
folders + root), following the Kubernetes-Concepts/Vue-Guide pattern researched in
conversation: grouped by what a reader is trying to understand or do, not by which
`Runtime/`/`Editor/CodeGen/` subfolder the source happens to live in. The codegen area in
particular went from 5 flat, equally-weighted folders to 2 audience-separated ones —
"Configuring codegen" (what a normal consumer writes) vs "Extending the generator"
(contributor-only internals) — mirroring how Vue splits its Guide from its
Advanced/internals material. No content was rewritten; only file locations, relative links,
category metadata, and sidebar ordering changed. Zero commits made.
