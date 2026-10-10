---
id: clientsim-project-settings
title: ClientSimProjectSettings
sidebar_position: 7
---

# ClientSimProjectSettings

`UdonTestKit.ClientSimProjectSettings` knows the project settings ClientSim checks before it
starts, and the change that makes each one pass. Its menu item, **Tools > Udon Test Kit > Fix
ClientSim Project Settings**, applies the change for every setting that fails.

## The settings

| Setting | Change it makes |
| --- | --- |
| Input axes | ClientSim's own input axes, written over `ProjectSettings/InputManager.asset`. |
| Input type | **Active Input Handling** set to both input systems. |
| Audio spatializer | ClientSim's own audio settings. |
| VRChat layers | VRChat's layers, through the VRChat SDK. |
| Collision matrix | VRChat's layer collision matrix, through the VRChat SDK. |

All but one use ClientSim's or the VRChat SDK's own fix. For the input type, ClientSim's own
setter picks the Input System alone, which ClientSim's check then rejects, so the kit sets both
input systems, the value ClientSim's settings window asks for.

## Members

- `Fix()` is the menu item. It applies the change for each setting that fails ClientSim's check and
  logs the ones it changed, or that they were already correct. Settings that pass are left alone.
- `FixMenuPath` is the menu item's path, `"Tools/Udon Test Kit/Fix ClientSim Project Settings"`,
  for tooling that runs it with `EditorApplication.ExecuteMenuItem`.

## When it matters

[`ClientSimSession.Start`](./clientsim-session) runs ClientSim's check before ClientSim starts. When
the check fails, `Start` fails the test with a message such as:

```
ClientSim's project settings check fails on: input type, collision matrix. Fix them with Tools > Udon Test Kit > Fix ClientSim Project Settings.
```

Without that, ClientSim would open its settings window as it starts. In batch mode, that window
logs errors, and Unity Test Framework fails a test on any error log it didn't expect, so the test
fails without naming any setting.

The fix changes files under `ProjectSettings`. Commit them, so the check passes on every machine
that runs the tests, including a build server.
