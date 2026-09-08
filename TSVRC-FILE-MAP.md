# tsvrc/tsvrc file map

Snapshot of every real file in the `tsvrc/tsvrc` repo (`D:\vrc\tsvrc`), as of this writing.
This is a raw inventory, not documentation content — it exists so `TSVRC-DOCUMENTATION-PLAN.md`
has a ground truth to check itself against ("did every file end up under some checklist item?").

**Excluded on purpose:**
- `*.meta` files (Unity-generated, one per asset, carry no content of their own).
- `docs/` (this repo, the docs site itself — not part of the thing being documented).
- `.git/`.

Labels are inferred from path and filename only — nothing here was read in depth. Treat
labels as a starting hypothesis for whoever documents that file, not a verified fact.

## Package root

- `package.json` — VPM/UPM package manifest (name `com.tsvrc.core`, VRChat Worlds SDK dependency).

## Editor/CodeGen — the code generation engine

Config sources the generator reads:
- `Editor/CodeGen/Config/TsBuiltinConfig.cs`
- `Editor/CodeGen/Config/TsLinkedSceneConfig.cs`
- `Editor/CodeGen/Config/TsTranslationConfig.cs`

Pluggable generator modules (one file each, one concern each):
- `Editor/CodeGen/Modules/ConstructModule.cs`
- `Editor/CodeGen/Modules/FactoryModule.cs`
- `Editor/CodeGen/Modules/GlobalModule.cs`
- `Editor/CodeGen/Modules/InstanceModule.cs`
- `Editor/CodeGen/Modules/LogModule.cs`
- `Editor/CodeGen/Modules/MemoryModule.cs`
- `Editor/CodeGen/Modules/PoolModule.cs`
- `Editor/CodeGen/Modules/ScaffoldModule.cs`
- `Editor/CodeGen/Modules/TranslationModule.cs`
- `Editor/CodeGen/Modules/TsSingleComponentModule.cs`

Generator core/orchestration:
- `Editor/CodeGen/ModuleEntrySnapshot.cs`
- `Editor/CodeGen/PackagePaths.cs`
- `Editor/CodeGen/ScriptIndex.cs`
- `Editor/CodeGen/TsAssetWatcher.cs` — watches asset changes to trigger regeneration
- `Editor/CodeGen/TsBuildCompile.cs`
- `Editor/CodeGen/TsDomainReloadHandler.cs`
- `Editor/CodeGen/TsGenerator.cs` — top-level generator entry point
- `Editor/CodeGen/TsLinkedScene.cs`
- `Editor/CodeGen/TsModule.cs` — base type/contract for a generator module
- `Editor/CodeGen/TsPaths.cs`
- `Editor/CodeGen/TsUsageScanner.cs`
- `Editor/CodeGen/UdonWriter.cs` — emits generated Udon-compatible code

## Editor/Configure — editor UI for authoring a tsvrc setup

- `Editor/Configure/ObjectListGUI.cs`
- `Editor/Configure/TsAbout.cs`
- `Editor/Configure/TsBuiltinConfigInspector.cs`
- `Editor/Configure/TsConfigInspector.cs`
- `Editor/Configure/TsEditorGUI.cs`
- `Editor/Configure/TsGroupTreeGUI.cs`
- `Editor/Configure/TsPendingConfigEdit.cs`
- `Editor/Configure/TsRootInspector.cs`
- `Editor/Configure/TsWindow.cs` — the main custom editor window

## Editor/Drawers — custom property drawers

- `Editor/Drawers/ReadOnlyDrawer.cs`
- `Editor/Drawers/WirePoolAttributeDrawer.cs`

## Editor/Tools — standalone editor utilities

- `Editor/Tools/MeshCombiner/MeshCombinerTool.cs`
- `Editor/Tools/MeshCombiner/MeshCombinerWindow.cs`
- `Editor/Tools/Translation/TsTranslationWindow.cs`

## Editor plumbing

- `Editor/AssemblyInfo.cs`
- `Editor/Tsvrc.Editor.asmdef`

## Runtime/Config — configuration data model

- `Runtime/Config/TsBuiltinConfig.asset` — a config instance
- `Runtime/Config/TsConfig.cs`
- `Runtime/Config/TsGroup.cs`
- `Runtime/Config/TsGroupedEntry.cs`

## Runtime/Core — bootstrapping, DI, lifecycle (the framework's spine)

- `Runtime/Core/Instance.cs`
- `Runtime/Core/Process.cs` — appears to model a running process/lifecycle unit
- `Runtime/Core/TsCodegenIgnoreAttribute.cs`
- `Runtime/Core/TsRoot.cs` — root/bootstrap component the generator wires into
- `Runtime/Core/TsvrcBehaviour.cs` — base behaviour class consumers extend
- `Runtime/Core/TsWorldExtensionPointAttribute.cs`
- `Runtime/Core/WirePoolAttribute.cs`

## Runtime/DataTransfer — chunked networked data transfer

- `Runtime/DataTransfer/ChunkedTransferSession.cs`
- `Runtime/DataTransfer/DataChunker.cs`
- `Runtime/DataTransfer/DataChunkReceiver.cs`
- `Runtime/DataTransfer/DataSender.cs`
- `Runtime/DataTransfer/DataSenderReceiver.cs`
- `Runtime/DataTransfer/DataTransferer.cs`
- `Runtime/DataTransfer/DataTransferer.asset`
- `Prefabs/DataTransfer/DataTransferer.prefab`

## Runtime/Player — per-player behaviour

- `Runtime/Player/HeadClipGuard.cs` — prevents camera/head clipping through geometry
- `Runtime/Player/HeadClipGuard.asset`
- `Prefabs/Player/HeadClipGuard.prefab`
- `Runtime/Player/PlayerColorAssigner.cs`
- `Runtime/Player/PlayerColorAssigner.asset`
- `Runtime/Player/TsPlayer.cs` — player identity/reference wrapper

## Runtime/Session — ranked game session

- `Runtime/Session/RankedGameSession.cs`
- `Runtime/Session/RankedGameSession.asset`
- `Prefabs/Session/RankedGameSession.prefab`

## Runtime/StateMachine

- `Runtime/StateMachine/StateManager.cs`
- `Runtime/StateMachine/StateManager.asset`
- `Prefabs/StateMachine/StateManager.prefab`

## Runtime/Timing

- `Runtime/Timing/TsvrcTimer.cs`
- `Runtime/Timing/TsvrcTimer.asset`
- `Prefabs/Timing/TsTimer.prefab`

## Runtime/Tracking — player tracking and ready-check flow

- `Runtime/Tracking/AutoPlayerTracker.cs`
- `Runtime/Tracking/AutoPlayerTracker.asset`
- `Prefabs/Tracking/AutoPlayerTracker.prefab`
- `Runtime/Tracking/PlayerTracker.cs`
- `Runtime/Tracking/PlayerTracker.asset`
- `Prefabs/Tracking/PlayerTracker.prefab`
- `Runtime/Tracking/ReadyCheckProcess.cs`
- `Runtime/Tracking/ReadyCheckProcess.asset`
- `Prefabs/Tracking/ReadyCheckProcess.prefab`

## Runtime/UI

- `Runtime/UI/List/ListItem.cs`
- `Runtime/UI/List/TsvrcList.cs`
- `Runtime/UI/List/TsvrcList.asset`
- `Runtime/UI/Overlay/PlayerMarkerRenderer.cs`
- `Runtime/UI/Overlay/PlayerMarkerRenderer.asset`
- `Runtime/UI/Overlay/PlayerPositionOverlay.cs`
- `Runtime/UI/Overlay/PlayerPositionOverlay.asset`
- `Runtime/UI/Overlay/RasterPlayerMarkerRenderer.cs`
- `Runtime/UI/Overlay/RasterPlayerMarkerRenderer.asset`
- `Prefabs/UI/1920_1080_Display.prefab`
- `Runtime/UI/Utils/TextureGraphics2D.cs` — software rasterizing primitives (lines, circles, triangles)

## Runtime/Utils — shared low-level utilities

- `Runtime/Utils/ReadOnlyAttribute.cs`
- `Runtime/Utils/TsArray.cs`
- `Runtime/Utils/TsJson.cs`
- `Runtime/Utils/TsvrcLogger.cs`
- `Runtime/Utils/TsvrcLogger.asset`
- `Runtime/Utils/TsvrcMemory.cs` — shared/synced key-value-style memory
- `Runtime/Utils/TsvrcMemory.asset`

## Runtime plumbing

- `Runtime/Tsvrc.Runtime.asmdef`
- `Runtime/Tsvrc.Runtime.asset`

## Testing — reusable test infrastructure shipped with the package

- `Testing/Behaviours/TsCallbackRecorder.cs`
- `Testing/Behaviours/Tsvrc.Testing.Behaviours.asmdef`
- `Testing/Behaviours/Tsvrc.Testing.Behaviours.asset`
- `Testing/Framework/AutomaticTriggersSetUpFixtureBase.cs`
- `Testing/Framework/ClientSimPersistenceLeakFixup.cs`
- `Testing/Framework/ClientSimPlayerEnvironment.cs`
- `Testing/Framework/FixupRegistry.cs`
- `Testing/Framework/IPlayModeEnvironmentFixup.cs`
- `Testing/Framework/PrivateFieldAccess.cs`
- `Testing/Framework/README.md` — **already documented**, contributor-facing, not org-docs content
- `Testing/Framework/TsPlayModeTestBase.cs`
- `Testing/Framework/TsRootBuilder.cs`
- `Testing/Framework/Tsvrc.Testing.Framework.asmdef`
- `Testing/Framework/UnityEventFilterAllowlistFixup.cs`
- `Testing/UI/Tsvrc.Testing.UI.asmdef`
- `Testing/UI/Tsvrc.Testing.UI.asset`
- `Testing/UI/TsvrcListTestBuilder.cs`

## Tests — EditMode, PlayMode, TestDoubles

~280 files under `Tests/EditMode/**`, `Tests/PlayMode/**`, and `Tests/TestDoubles/**`, mirroring
the Runtime/Editor module structure above (one test-class family per behavior: lifecycle,
ownership, deserialization, edge cases, race conditions, etc.). Not enumerated file-by-file
here — they don't get their own doc pages. Their value is as the most reliable source of
truth for a module's actual behavior and edge cases (see the documentation plan's per-module
"read its tests" step). Browse `Tests/EditMode/<Area>/` and `Tests/PlayMode/<Area>/` next to
the matching `Runtime/<Area>/` or `Editor/CodeGen/<Area>/` when documenting that area.

## Totals (informational, re-derive if this drifts)

- Non-meta files: 360
- Of those, `Tests/**` + `Testing/**`: ~300
- Real product surface (`package.json`, `Runtime/**`, `Editor/**`, `Prefabs/**`): ~60
