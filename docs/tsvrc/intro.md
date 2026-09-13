---
id: intro
title: TsVRC
sidebar_position: 1
---

# TsVRC

TsVRC is an open-source, community-maintained framework for building VRChat worlds with
UdonSharp: structured initialization, dependency wiring, and an editor tool that generates
the code for both automatically (codegen), on top of the VRChat Worlds SDK.

:::note
TsVRC is still pre-1.0. Everything documented here, including edge-case behavior on
reference pages, describes what the code does today, not a locked API contract.
:::

## New to TsVRC?

Start with [Add TsVRC to your project](./add-to-your-project), then
[Build your first behaviour](./first-behaviour): by the end you'll have a script running
in play mode.

## Already using it?

Jump straight to what you need:

- **Doing a specific task** — [pooling a prefab](./how-to/pooling-a-prefab),
  [showing player positions](./how-to/showing-player-positions),
  [transferring data between clients](./how-to/transferring-data-between-clients), or
  [wiring a ready check](./how-to/wiring-a-ready-check).
- **Looking up a type's behavior** — start from
  [How TsVRC fits together](./core-concepts/how-it-fits-together) and follow its links, or
  browse Reference in the sidebar, grouped by area: players, networking, UI, codegen, and
  so on.
- **Understanding why TsVRC works the way it does** —
  [Codegen instead of reflection](./explanations/codegen-vs-reflection) and the other pages
  under Explanations.
