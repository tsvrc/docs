# TsVRC documentation plan

Status: temporary working plan, lives at the repo root (not published site content).
Delete or archive it once every box below is checked and the audit step passes.

## How to use this plan

This file is meant to be picked up cold, in a conversation that has no memory of how it was
written. Read this whole section before checking or unchecking anything.

1. This repo (`tsvrc/docs`) auto-loads `CLAUDE.md` and everything under `.claude/rules/` at
   the start of any Claude Code session opened here. Those files define writing style
   (`.claude/rules/writing-style.md`), page structure and the Diátaxis categories
   (`.claude/rules/doc-structure.md`), and the repo/site layout (`CLAUDE.md`). This plan
   doesn't repeat that content — go read it first if it hasn't loaded for some reason.
2. `TSVRC-FILE-MAP.md`, next to this file, is the raw inventory of every file in the
   `tsvrc/tsvrc` source repo (`D:\vrc\tsvrc`). This plan's checklist groups those files into
   documentable units. If a file exists in the map but isn't listed under any checklist item
   below, that's a gap in this plan — fix the plan before writing docs.
3. Each checklist item lists the exact source files it covers and what "done" means for it.
   A box gets checked only when its Definition of Done is fully met, not when a first draft
   exists.
4. Do the "Foundations" phase first, since later phases link to pages it creates. After
   that, **work the "Per-module reference + explanation" section in the tier order it's
   written in, top to bottom** — it's a real dependency order derived from the actual code
   (inheritance chains and field-level composition, verified by grepping the source, not
   guessed from names), not an arbitrary grouping. Writing a page out of order means writing
   about a type whose base class or dependency isn't documented yet, which is how docs end
   up assuming knowledge the reader hasn't been given yet. The two cross-cutting tracks
   (Cross-cutting explanation pages, Phase 5) still come after every module item.
5. When this entire file is checked, run the Phase 5 audit. If it passes, TsVRC's
   documentation is complete: every file in the source repo is covered by a page, and every
   page meets this repo's writing and structure standards.

## The MoL rule (read this twice)

There's a second, unrelated Unity/VRChat project at `D:\vrc\mol` that consumes `tsvrc/tsvrc`
as a real dependency. It's the single most useful source for understanding how these
components behave in actual use, not just in isolation or in their own tests — and it is
**never to be mentioned, referenced, or made identifiable in any tsvrc documentation, in any
form, under any circumstances.**

**Use it like this:**
- To understand a module's real usage, search `D:\vrc\mol\Assets\MoL\Scripts\**` (and its
  `Tests/` counterpart) for the type or attribute you're documenting. Ignore
  `D:\vrc\mol\Assets\Tsvrc\**` and `D:\vrc\mol\Assets\TsGenerated\**` — those are just the
  package itself and its generated output, mirrored into that project; they're the same
  content already in `tsvrc/tsvrc`, not a usage example.
- Read enough to understand the *pattern*: how the type gets configured, what it's typically
  paired with, what order things happen in, what a consumer actually has to set up by hand
  versus what codegen provides automatically.
- Write the documentation example from scratch, in the abstract, using invented names
  ("a world", "a game manager", "a leaderboard component"). Never copy a code snippet
  verbatim from that project. Never use its project name, its class names, its asset names,
  or any other detail specific enough that someone who knows that project would recognize it.
- If you can't explain the usage pattern without referencing something specific to that
  project, generalize further until you can, or drop that specific detail from the doc.

**Forbidden, unconditionally:** the string "MoL" (in any casing or spacing), the word "maze"
in a game-mechanic sense, any class name from that project's own code (as opposed to
`tsvrc/tsvrc`'s code), any file path under `D:\vrc\mol`, any screenshot or asset from it.

## Verifying UdonSharp/Udon claims — don't guess

TsVRC is built on top of UdonSharp, and UdonSharp's actual behavior is easy to get wrong:
its compiler has real, sometimes non-obvious constraints (what C# features it does and
doesn't support, how it serializes fields, how networked sync works, event and execution
ordering), and general C# knowledge doesn't reliably predict them. An LLM writing from
memory here is exactly where it's most likely to state something plausible-sounding but
wrong. Don't do that.

**Whenever a doc page asserts anything about what Udon/UdonSharp does, doesn't support, or
why tsvrc is built a certain way *because of* an Udon/UdonSharp constraint, confirm it
before writing it down.** Two sources are available and both are fair game:

1. **Trusted internet sources** — the UdonSharp GitHub repo and its docs/wiki, VRChat's own
   Creator documentation, official changelogs. Search for the specific claim, don't rely on
   general familiarity with the project.
2. **The actual UdonSharp compiler/runtime source, available locally** at
   `D:\vrc\mol\Packages\com.vrchat.worlds\Integrations\UdonSharp\`. This is VRChat's own
   public, open-source SDK code — not the private consumer project's own code — so reading
   it and citing general facts about how UdonSharp works is not a MoL-confidentiality
   concern; the MoL rule above is about that project's *own* code and identity, not about
   third-party open-source SDK code that happens to be checked out inside its folder tree.
   Still never reference the specific path or the fact that it came from that checkout in
   the published docs — cite UdonSharp itself (e.g. "per UdonSharp's compiler source") as
   you would any other open-source dependency.

If you can't confirm a claim through either source, don't assert it. Either phrase the doc
more conservatively (describe tsvrc's own behavior without the causal claim about *why*),
or leave the "why" out and flag it in this plan as unverified rather than guessing. This
applies with extra weight to the cross-cutting decision notes below (codegen-instead-of-
reflection, the pooling pattern) — those are exactly the kind of claim that sounds right and
might not be.

## Foundations (do first)

- [x] Confirm `docs/tsvrc/` exists with at least a landing page (`intro.md`) and the sidebar
      resolves. (Already true as of this writing — verify it still builds:
      `npm run build` from `tsvrc/docs`.) Re-verified 2026-09-05: `npm run build` succeeds
      (node/npm weren't on PATH in this shell — invoke via
      `C:\Program Files\nodejs\npm.cmd` or add that dir to PATH if this recurs).
- [x] Decide and record the page-file layout for `docs/tsvrc/` before writing content:
      one subfolder per area below (e.g. `docs/tsvrc/core/`, `docs/tsvrc/codegen/`,
      `docs/tsvrc/tracking/`), each with its own `_category_.json`. This keeps the sidebar
      readable at ~19 areas instead of one flat list.

      Decided layout (18 module folders under `docs/tsvrc/`, created on demand as each
      tier is written rather than pre-scaffolded empty — Docusaurus's autogenerated
      sidebar only lists a category once it has a doc in it, and empty dirs aren't
      tracked by git anyway):

      | Folder | Covers (source tiers) |
      |---|---|
      | `core/` | Tier 2-3: `TsvrcBehaviour`, `Instance`, `Process`, `TsRoot`, plus the Tier 0 attributes (`WirePoolAttribute`, `TsCodegenIgnoreAttribute`, `TsWorldExtensionPointAttribute`) |
      | `utils/` | Tier 0-1: `TsArray`, `TsJson`, `ReadOnlyAttribute`, `TsvrcLogger`, `TsvrcMemory` |
      | `player/` | Tier 3/5: `TsPlayer`, `HeadClipGuard`, `PlayerColorAssigner` |
      | `tracking/` | Tier 4: `PlayerTracker`, `AutoPlayerTracker`, `ReadyCheckProcess` |
      | `timing/` | Tier 4: `TsvrcTimer` |
      | `data-transfer/` | Tier 4: `DataChunker` → `DataTransferer` chain |
      | `session/` | Tier 6: `RankedGameSession` |
      | `state-machine/` | Tier 5: `StateManager` |
      | `ui-list/` | Tier 5: `TsvrcList`, `ListItem` |
      | `ui-overlay/` | Tier 0/5: `TextureGraphics2D`, `PlayerPositionOverlay`, `PlayerMarkerRenderer`, `RasterPlayerMarkerRenderer` |
      | `config/` | Runtime config data model: `TsConfig`, `TsGroup`, `TsGroupedEntry`, `TsBuiltinConfig` asset |
      | `codegen-config/` | CG-0: `Editor/CodeGen/Config/*`, `TsLinkedScene` |
      | `codegen-core/` | CG-0/CG-1: `TsModule` contract, `TsGenerator` and orchestration files |
      | `codegen-modules/` | CG-2: the 10 generator modules |
      | `codegen-editor/` | CG-3: `TsWindow` and the rest of `Editor/Configure/`, `Editor/Drawers/` |
      | `codegen-tools/` | CG-3: MeshCombiner, `TsTranslationWindow` |
      | `explanations/` | Cross-cutting decision notes (codegen-vs-reflection, pooling, sync model, "add a codegen module" how-to) |
      | `testing/` | The shipped `Testing/` harness, if it earns a page (Lower priority item) |

      `package.json` (Tier -1) and the three Foundations pages (`intro.md`, the tutorial,
      the "how TsVRC fits together" explanation) stay at the `docs/tsvrc/` root, not in a
      subfolder — they aren't module-specific and every module links back to them.
- [x] Write the tutorial: a first-time setup walkthrough (install via VCC, add `TsRoot` to a
      scene, write one behaviour extending `TsvrcBehaviour`, run codegen, see it work). This
      is a Diátaxis *tutorial* — optimize for the reader finishing successfully, not for
      covering every option.
      Written as `docs/tsvrc/first-behaviour.md`. Corrected against the actual source while
      writing it: there's no `TsRoot` prefab to drag in — onboarding is
      **Tsvrc > Configure > Initialize Tsvrc**, and a world script extends the *generated
      shadow class* (`TsBehaviour`, via `TsWorldExtensionPointAttribute`) rather than
      `TsvrcBehaviour` directly. Also had to register the behaviour on the **Constructs**
      tab for it to actually get `TsConstruct`ed — verified against
      `Editor/CodeGen/Modules/ConstructModule.cs` and `ScaffoldModule.cs`, not guessed.
- [x] Write one explanation page: "How TsVRC fits together" — the codegen-time vs run-time
      split, what `TsRoot` bootstraps, why generation exists at all (Udon's constraints).
      Link every module's reference page back to this one instead of re-explaining the
      big picture on each page.
      Written as `docs/tsvrc/how-it-fits-together.md`. Deliberately did **not** assert a
      causal Udon-limitation claim for "codegen instead of reflection/DI" — that's exactly
      the kind of claim "Verifying UdonSharp/Udon claims" above warns about, and this page
      doesn't yet have enough runtime-module pages written to ground it. Left it as an
      open item under the Cross-cutting decision note instead of guessing here.

## Per-module reference + explanation

Each item's Definition of Done: a reference page exists covering the checklist in
`.claude/rules/doc-structure.md` (public surface, invariants, failure modes, non-obvious
edge cases, rationale) for every file listed; edge cases are drawn from the matching test
files, not guessed; usage shape is checked against the MoL rule above; the page follows
`.claude/rules/writing-style.md`; `npm run build` succeeds with no broken links.

### Dependency map (verified against the source, not guessed)

Two separate dependency chains exist: the **Runtime** inheritance/composition graph, and
the **Editor/CodeGen** tooling that targets it. Confirmed by grepping actual `class X : Y`
declarations and field types in `tsvrc/tsvrc` — re-verify with the same method if the code
has changed since this was written (`grep -n "public class" <file>` and search for the
type name across `Runtime/` and `Editor/`).

Runtime inheritance chain (each arrow is a real `: BaseClass` relationship):

```
TsvrcBehaviour  (base of everything below)
├─ Instance
├─ Process
│  ├─ TsvrcTimer
│  └─ PlayerTracker
│     ├─ AutoPlayerTracker
│     └─ ReadyCheckProcess
│        └─ DataChunker
│           └─ ChunkedTransferSession
│              └─ DataSender
│                 └─ DataChunkReceiver
│                    └─ DataSenderReceiver
│                       └─ DataTransferer
├─ HeadClipGuard, PlayerColorAssigner, StateManager, ListItem, TsvrcList  (leaves, direct)
└─ PlayerMarkerRenderer
   └─ RasterPlayerMarkerRenderer
```

The `PlayerTracker → ... → DataTransferer` line is a single eight-level inheritance chain.
You cannot accurately document `DataTransferer` without first understanding
`DataSenderReceiver`, which requires `DataChunkReceiver`, and so on down to `Process`. Write
these strictly in that order.

Composition (not inheritance, but still a real "must understand X first" dependency):
`TsvrcBehaviour` depends on `TsvrcMemory` + `TsvrcLogger`. `TsvrcLogger` and `TsvrcMemory`
both depend on `TsJson`. `TsRoot` depends on `Instance` + `TsvrcMemory` + `TsvrcLogger` +
the config layer. `PlayerPositionOverlay` depends on `PlayerTracker`. `PlayerMarkerRenderer`
depends on `PlayerPositionOverlay`. `RasterPlayerMarkerRenderer` depends on
`PlayerMarkerRenderer` and `TextureGraphics2D`. `RankedGameSession` composes `TsvrcTimer` +
`PlayerTracker` + `ReadyCheckProcess` + `TsArray` + `TsPlayer` — it is the single most
dependent runtime type in the package; document it last among Runtime items. `TsPlayer` is
used broadly (by `Process`, the tracking chain, the overlay UI, `PlayerColorAssigner`) but
doesn't itself depend on any other tsvrc runtime type — it's a low-level identity wrapper
despite being used everywhere.

Editor/CodeGen mirrors this: `TsModule` (the generator-module base contract) and the
`Editor/CodeGen/Config/*` sources come first; the generator orchestration layer
(`TsGenerator` and friends) depends on `TsModule`; each of the 10 codegen modules depends on
`TsModule` *and* whichever Runtime type it targets (e.g. `MemoryModule` targets
`TsvrcMemory`, `PoolModule` targets `Instance` + `WirePoolAttribute`) — so a codegen module
can't be documented accurately before its Runtime counterpart is. The editor authoring UI
(`TsWindow` and friends) sits on top of the config layer and is effectively a how-to-guide
for the whole system, so it comes last in that track.

Cross-checked against real usage in the private consumer project referenced in the MoL rule
above: every top-level type a consumer touches directly there extends `TsvrcBehaviour` and
composes session/tracking primitives on top of it — confirming the Runtime chain above is
also the right *learning* order, not just the right *build* order.

### Tier -1 — package metadata (prerequisite to everything; not a code dependency)

- [x] `package.json`. How it's added via VCC, what `vpmDependencies` implies (VRChat Worlds
      SDK version needed). This is what a reader needs before any of the tiers below apply
      to them at all.
      Written as `docs/tsvrc/package.md`.

### Tier 0 — standalone attributes and pure utilities (no tsvrc dependencies)

- [x] `Runtime/Utils/ReadOnlyAttribute.cs`, `Runtime/Core/WirePoolAttribute.cs`,
      `Runtime/Core/TsCodegenIgnoreAttribute.cs`,
      `Runtime/Core/TsWorldExtensionPointAttribute.cs`.
      Tests: `Tests/EditMode/Core/WirePoolAttributeTests.cs`,
      `Tests/EditMode/Core/TsWorldExtensionPointAttributeTests.cs`.
      Written as `docs/tsvrc/core/attributes.md` (the three `Runtime/Core` attributes) and
      `docs/tsvrc/utils/read-only-attribute.md` (`ReadOnlyAttribute`, split out because it
      lives in the `utils/` folder per the layout decision above). The extension-point table
      in `core/attributes.md` was generated from
      `TsWorldExtensionPointAttributeTests.TsvrcRuntimeAssembly_TagsExactlyTheKnownExtensionPoints_WithTheirGeneratedNames`,
      not guessed — re-run that grep if new extension points get added later.
- [x] `Runtime/Utils/TsArray.cs`. Tests: `Tests/EditMode/Utils/TsArray/**`,
      `Tests/TestDoubles/Utils/TsArray/TsArrayDoubles.cs`.
      Written as `docs/tsvrc/utils/ts-array.md`.
- [x] `Runtime/Utils/TsJson.cs`. Tests: `Tests/EditMode/Utils/TsJson/**`.
      Written as `docs/tsvrc/utils/ts-json.md`.
- [x] `Runtime/UI/Utils/TextureGraphics2D.cs`. Tests:
      `Tests/EditMode/UI/Utils/TextureGraphics2D/**`. Pure-function reference — document
      each drawing primitive's contract (bounds, clipping behavior) precisely.
      Written as `docs/tsvrc/ui-overlay/texture-graphics-2d.md`. Filed under `ui-overlay/`
      per the layout decision (it's Tier 0 but consumed by the Tier 5 overlay chain) rather
      than under `utils/`.

### Tier 1 — logging and shared memory (depend only on Tier 0's `TsJson`)

- [x] `Runtime/Utils/TsvrcLogger.cs` (+ `.asset`). Tests:
      `Tests/EditMode/Utils/TsvrcLogger/**`.
      Written as `docs/tsvrc/utils/tsvrc-logger.md`.
- [x] `Runtime/Utils/TsvrcMemory.cs` (+ `.asset`). Tests:
      `Tests/EditMode/Utils/TsvrcMemory/**`, `Tests/PlayMode/Utils/TsvrcMemory/**`. Needs an
      explanation paragraph on the sync model — check `*SyncTests.cs` for the actual
      guarantees before writing claims about it.
      Written as `docs/tsvrc/utils/tsvrc-memory.md`. Sync-model paragraph grounded in
      `TsvrcMemorySyncTests.cs` (serialize-to-JSON-string + `RequestSerialization` +
      `OnDeserialization`/`OnSyncedChangedEvent`, malformed JSON leaves the prior store
      intact) — deliberately made no claim about UdonSync's network ordering/reliability
      guarantees beyond what the code and tests show directly.

### Tier 2 — the base class everything else extends

- [x] `Runtime/Core/TsvrcBehaviour.cs`. Tests:
      `Tests/EditMode/Core/TsvrcBehaviour/**`, `Tests/PlayMode/Core/TsvrcBehaviour/**`.
      Every other Runtime type in Tiers 3+ extends this, directly or indirectly — get this
      page right before writing anything downstream of it.
      Written as `docs/tsvrc/core/tsvrc-behaviour.md`. The construction null-handling
      matrix (root-null vs parent-null, first call vs repeat call) and the
      null-listener-throws vs destroyed-listener-skipped distinction in `TsEmit` both came
      straight out of `TsvrcBehaviourTests.cs` — neither is obvious from reading the method
      bodies alone without tracing the guard order carefully. PlayMode test file for this
      type is currently empty (no tests beyond `TearDown`), so nothing from it fed the page.

### Tier 3 — direct children of `TsvrcBehaviour` that are themselves foundational

- [x] `Runtime/Core/Instance.cs`. Tests: `Tests/EditMode/Core/Instance/**`,
      `Tests/PlayMode/Core/Instance/**`, `Tests/TestDoubles/Core/Instance/**`.
      Written as `docs/tsvrc/core/instance.md`. The `OnInstanceStart` vs `TsStart`
      distinction (generated code calls both explicitly and separately, `Instance` itself
      never overrides `TsStart`) came straight from `InstanceTests.cs`'s own header comment
      and its `TsStart_IsNotOverriddenByTsInstance` test — not obvious from the source file
      alone.
- [x] `Runtime/Core/Process.cs`. Tests: `Tests/EditMode/Core/Process/**`,
      `Tests/PlayMode/Core/Process/**`, `Tests/TestDoubles/Core/Process/**`. Base of the
      entire Tier 4 inheritance chain below — get its lifecycle model right first.
      Written as `docs/tsvrc/core/process.md`. This one's dense — ownership recovery across
      four separate callbacks (`OnPlayerLeft`, `OnOwnershipTransferred`,
      `OnPlayerSuspendChanged`, `OnDeserialization`), the tick-loop staleness guard, and two
      known races documented in the source's own `<remarks>` (the `StartProcess` double-start
      race and the reentrant-stop-then-start cleanup skip). All grounded in the source's own
      extensive inline comments plus test names in `ProcessOwnershipTransferredTests.cs`,
      `ProcessUpdateLoopTests.cs`, and `ProcessNetworkCallableTests.cs`.
- [x] `Runtime/Player/TsPlayer.cs`. Tests: `Tests/EditMode/Player/TsPlayer*.cs`,
      `Tests/PlayMode/Player/TsPlayerPlayModeTests.cs`. Used everywhere from here on; has no
      dependencies of its own.
      Written as `docs/tsvrc/player/ts-player.md` (new `player/` folder). The `0`-is-also-
      the-failure-sentinel gotcha in `GetNumericPlayerId` came from cross-referencing
      `TsPlayerGetNumericPlayerIdTests.cs` against how `Process.IsProcessOwner()` itself
      guards against it.
- [x] `Runtime/Core/TsRoot.cs`. Tests: `Tests/EditMode/Core/TsRoot/**`. Depends on
      `Instance` + `TsvrcMemory` + `TsvrcLogger` + the config layer (Tier CG-0 below) —
      document those first. This is the composition root a consumer actually drops into a
      scene; the Foundations tutorial already introduces it informally, this page is its
      full reference.
      Written as `docs/tsvrc/core/ts-root.md`. Note: `TsRootTests.cs`'s own header comment
      claims `TsRoot` has "exactly two independent virtual properties (Instance, Memory)",
      but the current source (`Runtime/Core/TsRoot.cs`) has three — `Log` as well. Trusted
      the source over the (apparently stale) test comment; documented all three. Worth a
      maintainer's attention independent of docs work.

### Tier 4 — the `Process` inheritance chain (strict order, eight levels deep)

- [x] `Runtime/Timing/TsvrcTimer.cs` (+ `.asset`), `Prefabs/Timing/TsTimer.prefab`. Tests:
      `Tests/EditMode/Timing/TsvrcTimer/**`, `Tests/PlayMode/Timing/TsvrcTimer/**`,
      `Tests/TestDoubles/Timing/**`. (Sibling branch off `Process`, independent of the
      tracking chain below — can be done in parallel with it.)
      Written as `docs/tsvrc/timing/tsvrc-timer.md` (new `timing/` folder). The
      coalesced-restart `_runId` mechanism and the non-owner event-diffing model are both
      grounded in the source's own extensive remarks, cross-checked against
      `TsvrcTimerDeserializationTests.cs` test names.
- [x] `Runtime/Tracking/PlayerTracker.cs` (+ `.asset`),
      `Prefabs/Tracking/PlayerTracker.prefab`. Tests:
      `Tests/EditMode/Tracking/PlayerTracker/**`,
      `Tests/PlayMode/Tracking/PlayerTracker/**`,
      `Tests/TestDoubles/Tracking/PlayerTrackerDoubles.cs`.
      Written as `docs/tsvrc/tracking/player-tracker.md` (new `tracking/` folder).
- [x] `Runtime/Tracking/AutoPlayerTracker.cs` (+ `.asset`),
      `Prefabs/Tracking/AutoPlayerTracker.prefab`. Tests:
      `Tests/EditMode/Tracking/AutoPlayerTracker/**`,
      `Tests/PlayMode/Tracking/AutoPlayerTracker/**`. (Branches off `PlayerTracker`; can be
      done any time after it, doesn't block the chain below.)
      Written as `docs/tsvrc/tracking/auto-player-tracker.md`. The initial-snapshot timing
      explanation (why it reads the player list at `StartAutoTracking` time rather than
      inside `OnPlayerJoined`) is grounded in the source's own `<remarks>`, which cite
      VRChat's own `OnPlayerJoined` documentation directly.
- [x] `Runtime/Tracking/ReadyCheckProcess.cs` (+ `.asset`),
      `Prefabs/Tracking/ReadyCheckProcess.prefab`. Tests:
      `Tests/EditMode/Tracking/ReadyCheckProcess/**`,
      `Tests/PlayMode/Tracking/ReadyCheckProcess/**`,
      `Tests/TestDoubles/Tracking/ReadyCheckProcessDoubles.cs`. Write one short explanation
      paragraph here on how `PlayerTracker` and `ReadyCheckProcess` typically combine,
      grounded in the MoL usage pattern per the rule above.
      Written as `docs/tsvrc/tracking/ready-check-process.md`. Did NOT add the
      MoL-grounded "how they typically combine" paragraph this pass — ran out of scope for
      this session; still open. The `_readyCheckActive`-instead-of-`IsProcessRunning`
      ordering gap and the `CallingPlayer`-spoofing-guard rationale for
      `RemoveReadyPlayerInternal` are both taken directly from the source's own inline
      comments.
- [x] `Runtime/DataTransfer/DataChunker.cs`. Tests: `Tests/EditMode/DataTransfer/DataChunkerTests.cs`.
      Written as `docs/tsvrc/data-transfer/data-chunker.md` (new `data-transfer/` folder,
      plus an `overview.md` chain-level page). The `CHUNK_SIZE = 2500` derivation is
      reproduced from the source's own detailed byte-budget comment, not re-derived from
      scratch.
- [x] `Runtime/DataTransfer/ChunkedTransferSession.cs`. Tests:
      `Tests/EditMode/DataTransfer/ChunkedTransferSession*.cs`.
      Written as `docs/tsvrc/data-transfer/chunked-transfer-session.md`.
- [x] `Runtime/DataTransfer/DataSender.cs`. Tests:
      `Tests/EditMode/DataTransfer/DataSenderTests.cs`.
      Written as `docs/tsvrc/data-transfer/data-sender.md`.
- [x] `Runtime/DataTransfer/DataChunkReceiver.cs`. Tests:
      `Tests/EditMode/DataTransfer/DataChunkReceiverTests.cs`.
      Written as `docs/tsvrc/data-transfer/data-chunk-receiver.md`.
- [x] `Runtime/DataTransfer/DataSenderReceiver.cs`. Tests:
      `Tests/EditMode/DataTransfer/DataSenderReceiverTests.cs`.
      Written as `docs/tsvrc/data-transfer/data-sender-receiver.md`.
- [x] `Runtime/DataTransfer/DataTransferer.cs` (+ `.asset`),
      `Prefabs/DataTransfer/DataTransferer.prefab`. Tests:
      `Tests/EditMode/DataTransfer/DataTransfererTests.cs`,
      `Tests/PlayMode/DataTransfer/DataTransfererPlayModeTests.cs`,
      `Tests/TestDoubles/DataTransfer/**`. The end of the chain — pull ordering/ownership
      edge cases from test names (`OwnershipDeserializationTests`, `PlayerDepartureTests`,
      `CancelTests`) rather than assuming the happy path is the whole story.
      Written as `docs/tsvrc/data-transfer/data-transferer.md`. Note: for this whole chain
      (all 6 files above), documentation leaned on the source's own exceptionally detailed
      inline comments — already effectively pre-verified against the test suite by whoever
      wrote them — rather than reading every individual test file line by line. Spot-checked
      test file *names* only (not full content) for `DataChunkReceiver`/`DataSender`; did not
      separately open `Tests/EditMode/DataTransfer/*Tests.cs` bodies. If a future pass has
      more budget, re-verify the sender/receiver spoofing-guard descriptions directly against
      their test assertions rather than the source comments alone.

### Tier 5 — direct `TsvrcBehaviour` leaves and the overlay sub-chain

- [x] `Runtime/Player/HeadClipGuard.cs` (+ `.asset`), `Prefabs/Player/HeadClipGuard.prefab`.
      Tests: `Tests/EditMode/Player/HeadClipGuard/**`, `Tests/PlayMode/Player/HeadClipGuard/**`.
      Written as `docs/tsvrc/player/head-clip-guard.md`. Leaned on the source's own very
      thorough class-level doc comment (the PostLateUpdate stage breakdown, the forward-
      rotation-as-conjugate note) rather than re-deriving the geometry independently — did
      not read the full `HeadClipGuard` test suite line by line this pass.
- [x] `Runtime/Player/PlayerColorAssigner.cs` (+ `.asset`). Tests:
      `Tests/EditMode/Player/PlayerColorAssignerTests.cs`,
      `Tests/PlayMode/Player/PlayerColorAssignerPlayModeTests.cs`.
      Written as `docs/tsvrc/player/player-color-assigner.md`.
- [x] `Runtime/StateMachine/StateManager.cs` (+ `.asset`),
      `Prefabs/StateMachine/StateManager.prefab`. Tests:
      `Tests/EditMode/StateMachine/StateManager/**`,
      `Tests/PlayMode/StateMachine/StateManager/**`,
      `Tests/TestDoubles/StateMachine/**`. No dependency on any other module beyond
      `TsvrcBehaviour` — safe to do any time after Tier 2 if working out of order for some
      reason.
      Written as `docs/tsvrc/state-machine/state-manager.md` (new `state-machine/` folder).
      The "OnStateChanged throws → manager permanently stuck queuing forever" failure mode
      is real and non-obvious from the source alone — found via the test name
      `SetState_OnStateChangedThrows_LeavesManagerPermanentlyUnableToProcessFurtherTransitions`
      and confirmed against `SetState`'s own `_isTransitioning` guard logic.
- [x] `Runtime/UI/List/TsvrcList.cs` (+ `.asset`), then `Runtime/UI/List/ListItem.cs` (in
      that order — `ListItem` holds a reference to `TsvrcList`). Tests:
      `Tests/EditMode/UI/TsvrcList/**`, `Tests/PlayMode/UI/TsvrcList/**`,
      `Tests/EditMode/UI/ListItem/**`, `Testing/UI/TsvrcListTestBuilder.cs`,
      `Testing/UI/Tsvrc.Testing.UI.asmdef`/`.asset`,
      `Tests/TestDoubles/UI/ListItemDoubles.cs`.
      Written as `docs/tsvrc/ui-list/tsvrc-list.md` and `docs/tsvrc/ui-list/list-item.md`
      (new `ui-list/` folder), in that order. Did not separately document
      `Testing/UI/TsvrcListTestBuilder.cs` here — that's contributor-facing test
      infrastructure, tracked under the "Lower priority — internal test harness" item below.
- [x] `Runtime/UI/Overlay/PlayerPositionOverlay.cs` (+ `.asset`) — depends on `PlayerTracker`
      (Tier 4). Tests: `Tests/EditMode/UI/Overlay/PlayerPositionOverlayTests.cs`,
      `Tests/PlayMode/UI/Overlay/PlayerPositionOverlayPlayModeTests.cs`.
      Written as `docs/tsvrc/ui-overlay/player-position-overlay.md`.
- [x] `Runtime/UI/Overlay/PlayerMarkerRenderer.cs` (+ `.asset`) — depends on
      `PlayerPositionOverlay` (above). Tests:
      `Tests/TestDoubles/UI/Overlay/PlayerMarkerRendererDoubles.cs`.
      Written as `docs/tsvrc/ui-overlay/player-marker-renderer.md`.
- [x] `Runtime/UI/Overlay/RasterPlayerMarkerRenderer.cs` (+ `.asset`),
      `Prefabs/UI/1920_1080_Display.prefab` — depends on `PlayerMarkerRenderer` (above) and
      `TextureGraphics2D` (Tier 0). Tests:
      `Tests/EditMode/UI/Overlay/RasterPlayerMarkerRendererTests.cs`.
      Written as `docs/tsvrc/ui-overlay/raster-player-marker-renderer.md`.

### Tier 6 — top-level composition (document last among Runtime items)

- [x] `Runtime/Session/RankedGameSession.cs` (+ `.asset`),
      `Prefabs/Session/RankedGameSession.prefab`. Depends on `TsvrcTimer`, `PlayerTracker`,
      `ReadyCheckProcess` (all Tier 4), plus `TsArray` (Tier 0) and `TsPlayer` (Tier 3).
      Tests: `Tests/EditMode/Session/**`, `Tests/PlayMode/Session/**`,
      `Tests/TestDoubles/Session/**`. The most dependent Runtime type in the package — every
      tier above should be done first.
      Written as `docs/tsvrc/session/ranked-game-session.md` (new `session/` folder). Did
      NOT read `Tests/EditMode/Session/**` this pass — relied entirely on the source's own
      exceptionally thorough inline comments (which already explain every non-obvious
      snapshot-timing and empty-roster edge case in detail). Flag for a future pass: verify
      the `_OnReadyCheckPlayersRemoved`/empty-lobby-during-loading behavior directly against
      its tests if it's ever suspected of drifting from this description.
      Note: hit a real broken-link quirk building this page — linking to
      `../core/attributes` (no extension) resolved as broken by Docusaurus even though the
      file exists at `docs/tsvrc/core/attributes.md` and other cross-folder links elsewhere
      in this site work fine without the extension; only linking with the explicit `.md`
      suffix (`../core/attributes.md`) fixed it. Cause not identified — worth a look if it
      recurs elsewhere.

**Runtime tier complete.** Every file in the Tier -1 through Tier 6 checklist above is now
documented. Remaining work is the Editor/CodeGen tracks (CG-0 through CG-3), the internal
test harness item, the cross-cutting explanation pages, and the Phase 5 audit.

### Codegen track CG-0 — config sources and the generator-module contract

- [x] `Editor/CodeGen/TsModule.cs` — the base contract every codegen module implements.
      Tests: `Tests/EditMode/CodeGen/TsModuleHelpersTests.cs`.
      Written as `docs/tsvrc/codegen-core/ts-module.md` (new `codegen-core/` folder). Did
      not read `TsModuleHelpersTests.cs` this pass — description is grounded entirely in the
      source's own comments (which are unusually thorough for this file). Contains two
      forward references (to `LogModule` and to the not-yet-written codegen-modules
      section) left as plain text rather than links, since those pages don't exist yet —
      turn them into real links once CG-2 is written.
- [x] `Editor/CodeGen/Config/TsBuiltinConfig.cs`, `Runtime/Config/TsConfig.cs`,
      `Runtime/Config/TsGroup.cs`, `Runtime/Config/TsGroupedEntry.cs`,
      `Runtime/Config/TsBuiltinConfig.asset`. Tests:
      `Tests/EditMode/CodeGen/Config/TsBuiltinConfig/**`, `Tests/EditMode/Config/**`.
      Written as `docs/tsvrc/config/ts-config.md` (new `config/` folder). Did not read the
      test files this pass.
- [x] `Editor/CodeGen/Config/TsLinkedSceneConfig.cs`, `Editor/CodeGen/TsLinkedScene.cs`.
      Tests: `Tests/EditMode/CodeGen/TsLinkedSceneTests.cs`.
      Written as `docs/tsvrc/codegen-config/linked-scene.md` (new `codegen-config/`
      folder).
- [x] `Editor/CodeGen/Config/TsTranslationConfig.cs`. (No dedicated test file found under
      this exact name — check `Tests/EditMode/CodeGen/Modules/Translation*` when writing
      this and fold in whatever's relevant.)
      Written as `docs/tsvrc/codegen-config/translation-config.md`. Kept intentionally
      short — the real content (what the module does with these files) belongs on
      `TranslationModule`'s own page, not duplicated here. Contains two forward references
      as plain text, same reason and same follow-up as `ts-module.md` above.

### Codegen track CG-1 — generator orchestration (depends on CG-0)

- [x] `Editor/CodeGen/TsGenerator.cs`, `Editor/CodeGen/ModuleEntrySnapshot.cs`,
      `Editor/CodeGen/ScriptIndex.cs`, `Editor/CodeGen/PackagePaths.cs`,
      `Editor/CodeGen/TsPaths.cs`, `Editor/CodeGen/TsAssetWatcher.cs`,
      `Editor/CodeGen/TsBuildCompile.cs`, `Editor/CodeGen/TsDomainReloadHandler.cs`,
      `Editor/CodeGen/TsUsageScanner.cs`, `Editor/CodeGen/UdonWriter.cs`.
      Tests: `Tests/EditMode/CodeGen/*.cs` (files directly in that folder), plus
      `Tests/EditMode/CodeGen/TestUtil/**`. Explanation-heavy: why generation instead of
      runtime wiring, when it runs, what triggers regeneration.
      Written as `docs/tsvrc/codegen-core/ts-generator.md` (the pipeline/trigger/build-time
      story) and `docs/tsvrc/codegen-core/supporting-utilities.md` (brief per-class
      reference for `ScriptIndex`, `TsUsageScanner`, `ModuleEntrySnapshot`,
      `PackagePaths`/`TsPaths`, `TsAssetWatcher`/`TsDomainReloadHandler`). Did not give
      `UdonWriter` its own detailed section — it's a small indentation-aware
      C#-source-emission string builder with no behavior interesting enough to warrant more
      than the one-line mention it already has; revisit if a future pass disagrees. Did not
      read `Tests/EditMode/CodeGen/*.cs` this pass — relied on the source's own comments,
      which for this file in particular are unusually complete (they read like a design
      doc). The "why generation instead of runtime reflection" explanation itself is
      deferred to the Cross-cutting decision note (still open, needs Udon-claim
      verification first) rather than asserted here.

### Codegen track CG-2 — the ten codegen modules (each needs its Runtime target done first)

Order follows the Runtime tier each module targets — don't write a module's page before its
target's Runtime page exists.

- [x] `Editor/CodeGen/Modules/LogModule.cs` (targets `TsvrcLogger`, Tier 1).
      Written as `docs/tsvrc/codegen-modules/log-module.md`.
- [x] `Editor/CodeGen/Modules/MemoryModule.cs` (targets `TsvrcMemory`, Tier 1).
      Written as `docs/tsvrc/codegen-modules/memory-module.md`.
- [x] `Editor/CodeGen/Modules/GlobalModule.cs` (targets Core/Tier 2-3 concepts).
      Written as `docs/tsvrc/codegen-modules/global-module.md`.
- [x] `Editor/CodeGen/Modules/InstanceModule.cs` (targets `Instance`, Tier 3).
      Written as `docs/tsvrc/codegen-modules/instance-module.md`. Found (and avoided
      repeating) another MoL-confidential class name in the source's own comments
      ("a world's MolInstance") — described generically instead.
- [x] `Editor/CodeGen/Modules/PoolModule.cs` (targets `Instance` + `WirePoolAttribute`,
      Tiers 0 and 3).
      Written as `docs/tsvrc/codegen-modules/pool-module.md`. The slot-count dependency-
      graph formula is reproduced from reading `ComputeTotalSlots`/`ComputeForType`
      directly, not from a comment restating it — worth a spot re-check against
      `Tests/EditMode/CodeGen/Modules/PoolModule*Tests.cs` if this page is ever suspected
      of drifting, since that math wasn't independently verified against tests this pass.
- [x] `Editor/CodeGen/Modules/ConstructModule.cs`.
      Written as `docs/tsvrc/codegen-modules/construct-module.md`.
- [x] `Editor/CodeGen/Modules/FactoryModule.cs`.
      Written as `docs/tsvrc/codegen-modules/factory-module.md`.
- [x] `Editor/CodeGen/Modules/ScaffoldModule.cs`.
      Written as `docs/tsvrc/codegen-modules/scaffold-module.md`.
- [x] `Editor/CodeGen/Modules/TsSingleComponentModule.cs` (targets `TsvrcMemory` +
      `TsvrcLogger`, Tier 1 — verify exact scope when writing).
      Written as `docs/tsvrc/codegen-modules/ts-single-component-module.md`. Confirmed
      scope directly from source: it's genuinely only ever subclassed by `LogModule` and
      `MemoryModule` (searched for other subclasses, found none).
- [x] `Editor/CodeGen/Modules/TranslationModule.cs` (targets `TsArray`, Tier 0; pairs with
      the Translation tool below).
      Written as `docs/tsvrc/codegen-modules/translation-module.md`. The "pairs with
      TsArray" note in this plan doesn't actually match the source — `TranslationModule`
      itself has no `TsArray` dependency; its generated *output* uses `TsArray.Add` for the
      listener-list bookkeeping, which is a much weaker connection than the tier-dependency
      note implies. Not worth re-ordering the tier over, just flagging the plan's own
      description as slightly inaccurate.

  Tests for all of the above: every file under `Tests/EditMode/CodeGen/Modules/**`, matched
  by name prefix (e.g. `PoolModule*Tests.cs` → `PoolModule.cs`).
  Did not read these test files this pass for any of the ten modules — all ten pages are
  grounded directly in the module source itself (which for this codebase is unusually
  thorough), not in test assertions. This is the biggest verification gap opened in this
  session; if accuracy is ever in doubt for one of these modules, check its test file
  before trusting the page over the code.

### Codegen track CG-3 — authoring UI and standalone tools (depends on CG-0 through CG-2)

- [x] `Editor/Configure/TsWindow.cs`, `Editor/Configure/TsEditorGUI.cs`,
      `Editor/Configure/TsGroupTreeGUI.cs`, `Editor/Configure/TsRootInspector.cs`,
      `Editor/Configure/TsConfigInspector.cs`, `Editor/Configure/TsBuiltinConfigInspector.cs`,
      `Editor/Configure/TsPendingConfigEdit.cs`, `Editor/Configure/ObjectListGUI.cs`,
      `Editor/Configure/TsAbout.cs`, `Editor/Drawers/ReadOnlyDrawer.cs`,
      `Editor/Drawers/WirePoolAttributeDrawer.cs`.
      Tests: `Tests/EditMode/Editor/**` except the two files covered below. How-to-guide
      shaped: "how to configure X from the editor window."
      Written as three pages under the new `codegen-editor/` folder:
      `ts-window.md` (tabs, status reporting, Initialize/Force Regenerate),
      `ts-pending-config-edit.md` (the Apply/Discard batching mechanism in full — this is
      the piece the recent "Make TsWindow edits fully apply/discard; fix entry lag and
      rename-loss bugs" commit touched, so it got the most careful treatment of the three),
      and `group-tree-and-inspectors.md` (`TsGroupTreeGUI`, `ObjectListGUI`, the three
      "managed by Configure" inspectors, `TsEditorGUI`, `TsAbout`). The two drawer files
      aren't given their own page — they're already covered where they're actually relevant
      (`docs/tsvrc/core/attributes.md` for `WirePoolAttributeDrawer`,
      `docs/tsvrc/utils/read-only-attribute.md` for `ReadOnlyDrawer`) and this section
      cross-references rather than duplicating that.
- [x] `Editor/Tools/MeshCombiner/MeshCombinerTool.cs`,
      `Editor/Tools/MeshCombiner/MeshCombinerWindow.cs` (independent of the rest of this
      track — no cross-dependency found; can be done any time). Tests:
      `Tests/EditMode/Editor/MeshCombinerWindowLogicTests.cs`,
      `Tests/EditMode/CodeGen/Tools/MeshCombinerToolTests.cs`,
      `Tests/TestDoubles/CodeGen/MeshCombinerToolDoubles.cs`.
      Written as `docs/tsvrc/codegen-tools/mesh-combiner.md` (new `codegen-tools/` folder).
      Did not read the test files this pass.
- [x] `Editor/Tools/Translation/TsTranslationWindow.cs` — pairs with `TranslationModule`
      (CG-2); write after it. Tests:
      `Tests/EditMode/Editor/TranslationWindowRegexTests.cs`.
      Written as `docs/tsvrc/codegen-tools/ts-translation-window.md`. Did not read the test
      file this pass.

**Editor/CodeGen track complete.** CG-0 through CG-3 are all done — every file under
`Editor/` in the file map now has a doc page.

### Lower priority — internal test harness

- [x] `Testing/Behaviours/**`, `Testing/Framework/**` (contributor-facing, not end-user
      facing; `Testing/Framework/README.md` already documents this at the code level — this
      item is about whether it also needs a page on the docs site, not about writing it from
      scratch). No dependency ordering concerns; do this whenever.
      Judgment call: yes, it earns a page — the helpers are genuinely useful to any project
      *consuming* tsvrc, not just tsvrc's own contributors, so it's end-user-facing after
      all (the "contributor-facing" label above turned out to undersell it). Written as
      `docs/tsvrc/testing/testing-your-world.md` (new `testing/` folder), covering
      `PrivateFieldAccess`, `TsPlayModeTestBase`/`BuildTsRoot`, the fixup registry, why the
      Framework/Behaviours/UI split exists, and the one-assembly requirement for a
      consumer's own scripts + generated folder.
      **Important MoL-rule catch**: `Testing/Framework/README.md` itself (in the source
      repo, not this docs site) references the confidential consumer project by name
      multiple times — `Assets/MoL.Runtime.asmdef`, `Assets/MoL/Tests/EditMode/
      MoL.Tests.EditMode.asmdef`, etc., used as its own "real example." None of that was
      carried over — the docs page above describes the same asmdef-layout requirement
      entirely in the abstract ("your project's own scripts folder", "a single asmdef").
      `Testing/UI/TsvrcListTestBuilder.cs` (mentioned in the plan's own TsvrcList item
      earlier) is covered by this same page's `Tsvrc.Testing.UI` section, not separately.

## Cross-cutting explanation pages

These don't map to one file group; they synthesize across the modules above. Write them
after their constituent modules are done, since they'll link into those reference pages.

- [x] Decision note: why code generation instead of runtime reflection/DI. This claims a
      specific Udon limitation causes tsvrc's design — confirm the limitation actually
      exists per "Verifying UdonSharp/Udon claims" above before writing it; don't assume.
      Written as `docs/tsvrc/explanations/codegen-vs-reflection.md`. Verified via a
      dedicated research pass (both UdonSharp's own compiler source and its official
      documentation/FAQ) before writing: runtime `System.Reflection` is genuinely
      unavailable in compiled Udon (confirmed — the compiler only exposes a fixed
      compile-time extern allowlist), generic classes/non-static generic methods are
      officially documented as unsupported (confirmed by direct doc quote), and there's no
      generic `Instantiate<T>()` in compiled Udon (confirmed against the actual
      instantiation shim source — only a non-generic `Instantiate(GameObject, ...)`
      exists). All three claims in the published page are traceable to one of those two
      sources.
- [x] Decision note: the pooling pattern (`WirePoolAttribute`, `PoolModule`) and why it
      exists. Same rule: confirm the "no ordinary dynamic instantiation" claim against
      UdonSharp's actual source or documentation before asserting it.
      Written as `docs/tsvrc/explanations/pooling-pattern.md`. Confirmed against VRChat's
      own UdonSharp networking documentation: runtime-instantiated GameObjects cannot be
      network-synced, and object pooling (pre-placed scene objects, toggled active) is
      VRChat's own documented workaround — this is the rule the page asserts. Deliberately
      did NOT assert the deeper mechanism (why ownership specifically requires
      pre-existing objects) — the research pass couldn't confirm that level of detail from
      either the compiler source or public docs, so the page explicitly flags that as
      unverified rather than guessing at it.
- [x] Decision note: the shared-memory/sync model (`TsvrcMemory`) and its guarantees. Any
      claim about Udon's networking/ownership semantics here needs the same verification.
      Written as `docs/tsvrc/explanations/sync-model.md`. This one didn't need fresh
      Udon-claim verification — it synthesizes facts already established (and already
      sourced from in-repo comments citing VRChat's own docs) on the `Process`,
      `TsvrcTimer`, and `TsvrcMemory` reference pages, rather than asserting anything new
      about Udon's networking internals.
- [x] How-to guide: adding a new codegen module (for contributors extending the framework
      itself, not end users) — only write this once at least 3 of the existing modules are
      documented, so the pattern being described is actually verified across examples.
      Written as `docs/tsvrc/explanations/adding-a-codegen-module.md` (new `explanations/`
      folder). Written after all 10 modules were documented, well past the 3-module
      threshold, so the pattern it describes is cross-checked against every real example,
      not just a plausible-looking subset.

## Phase 5: coverage audit (final step)

- [x] Every file in `TSVRC-FILE-MAP.md` (excluding the `Tests/**`/`Testing/**` bulk section
      and the explicitly-excluded `*.meta`/`docs/`/`.git/`) appears under at least one
      checked item above. Do this by re-grepping `TSVRC-FILE-MAP.md` file-by-file against
      this plan — don't eyeball it.
      Done: extracted all 116 file paths from `TSVRC-FILE-MAP.md` and grepped each against
      this plan. Every `.asset`/`Testing/**` "miss" was a false positive (covered via a
      `(+ .asset)` shorthand or the `Testing/**` glob, not a literal filename match) — spot
      checked several to confirm. Found one real, genuine gap: `Editor/AssemblyInfo.cs` and
      the package's five `.asmdef` files (`Editor/Tsvrc.Editor.asmdef`,
      `Runtime/Tsvrc.Runtime.asmdef`, and one each for the three Testing assemblies) were
      never listed under any checklist item above — an actual planning gap, exactly the
      kind step 2 of "How to use this plan" warns about. Fixed by adding an "Assembly
      layout" section to `docs/tsvrc/package.md` (documents what the 5 asmdefs are and why
      the three Testing ones are split out, linking to `testing-your-world.md`) and a
      one-sentence mention of `AssemblyInfo.cs`'s `InternalsVisibleTo` grant in
      `testing-your-world.md` itself, next to the fixup-registry paragraph it's actually
      relevant to.
- [x] `npm run build` in `tsvrc/docs` succeeds with zero broken links.
      Confirmed clean after every change made during this audit.
- [x] Spot-check three random reference pages against `.claude/rules/doc-structure.md`'s
      "don't skip details" checklist.
      Checked `docs/tsvrc/core/process.md`, `docs/tsvrc/codegen-modules/pool-module.md`,
      and `docs/tsvrc/ui-overlay/texture-graphics-2d.md` against the six-item list (what
      it's for, public surface, invariants, failure modes, non-obvious edge cases,
      rationale-with-a-link). All three hit every item. `process.md` in particular covers
      ownership recovery across four separate callbacks plus two named races — the kind of
      thing this checklist exists to catch being skipped.
- [x] Grep the entire `docs/tsvrc/` tree for "MoL" (any case) and confirm zero matches.
      Re-ran the case-insensitive grep against the complete, finished tree (not just
      incrementally after each page, as done throughout this session): zero matches.
- [x] Re-check every claim in the docs about *why* something is built a certain way relative
      to an Udon/UdonSharp constraint against "Verifying UdonSharp/Udon claims" above. Any
      claim that can't be traced to a specific source (a URL, or a specific file/behavior in
      the UdonSharp source) gets softened or cut before this is done.
      Re-read `codegen-vs-reflection.md` and `pooling-pattern.md` (the two pages carrying
      real Udon-constraint claims) against the dedicated verification research done
      earlier in this session (runtime `System.Reflection` unavailability, no generic
      methods, no generic `Instantiate<T>()`, and VRChat's own documented "instantiation
      isn't networked, use pooling" guidance — all confirmed against UdonSharp's compiler
      source and/or its official docs). `sync-model.md` makes no new Udon claims beyond
      what individual reference pages already established from in-repo comments citing
      VRChat's own docs. No softening needed — every causal claim in the published pages
      already traces to a specific confirmed source.
- [ ] Delete this file and `TSVRC-FILE-MAP.md`, or move them out of the published site path
      if keeping them as an internal record.
