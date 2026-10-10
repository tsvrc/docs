---
id: fixing-clientsim-project-settings
title: Fix the project settings ClientSim rejects
sidebar_position: 9
---

# Fix the project settings ClientSim rejects

ClientSim checks a few project settings before it starts. When a Play Mode test fails before
ClientSim starts, with a message such as this one, your project fails that check:

```
ClientSim's project settings check fails on: input type, collision matrix. Fix them with Tools > TsVRC > Udon Test Kit > Fix ClientSim Project Settings.
```

## Steps

1. Run **Tools > TsVRC > Udon Test Kit > Fix ClientSim Project Settings**. It changes each
   setting that fails and logs which ones it changed. Settings that already pass are left alone.
2. Commit the changed files under `ProjectSettings`, so the tests pass on every machine that runs
   them, including a build server.

You only need to do this once per project, unless something changes those settings again.

See [ClientSimProjectSettings](../reference/clientsim-project-settings) for what each setting is
and the change it gets.
