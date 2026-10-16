---
id: clientsim-project-settings
title: ClientSimProjectSettings
sidebar_position: 12
---

# ClientSimProjectSettings

`Tsvrc.UdonTestKit.ClientSimProjectSettings` knows the project settings ClientSim checks before it
starts, and the change that makes each one pass. Its menu item,
**Tools > TsVRC > Udon Test Kit > Fix ClientSim Project Settings**, applies the change for every
setting that fails.

## The settings

| Setting | Change it makes |
| --- | --- |
| Input axes | The ClientSim input axes, written over `ProjectSettings/InputManager.asset`. |
| Input type | **Active Input Handling** set to both input systems. |
| Audio spatializer | The ClientSim audio settings. |
| VRChat layers | The VRChat layers, through the VRChat SDK. |
| Collision matrix | The VRChat layer collision matrix, through the VRChat SDK. |

All but one use the fix from ClientSim or the VRChat SDK. For the input type, the ClientSim
setter picks the Input System alone, which the ClientSim check then rejects, so the kit sets both
input systems, the value the ClientSim settings window asks for.

## Members

- `Fix()` is the menu item. It applies the change for each setting that fails the ClientSim check and
  logs the ones it changed, or that they were already correct. Settings that pass are left alone.
- `FixMenuPath` is the menu item's path,
  `"Tools/TsVRC/Udon Test Kit/Fix ClientSim Project Settings"`, for tooling that runs it with
  `EditorApplication.ExecuteMenuItem`.

## When it matters

[`ClientSimSession.Start`](./clientsim-session) runs the ClientSim check before ClientSim starts. When
the check fails, `Start` fails the test with a message such as:

```
The ClientSim project settings check fails on: input type, collision matrix. Fix them with Tools > TsVRC > Udon Test Kit > Fix ClientSim Project Settings.
```

Without that, ClientSim would open its settings window as it starts. In batch mode, that window
logs errors, and Unity Test Framework fails a test on any error log it didn't expect, so the test
fails without naming any setting.

The fix changes files under `ProjectSettings`. Commit them, so the check passes on every machine
that runs the tests, including a build server.
