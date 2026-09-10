---
id: intro
title: TsVRC
sidebar_position: 1
---

# TsVRC

TsVRC is an independent, community-maintained framework for building VRChat worlds with
UdonSharp: structured initialization, dependency wiring, and editor codegen on top of the
VRChat Worlds SDK.

## Start here

New to TsVRC: follow [Build your first behaviour](./first-behaviour) for a script running
in play mode by the end, backed by [Package and requirements](./package) for what it
depends on.

Already using it and looking for something specific:

- **A task you're trying to do** — [pooling a prefab](./how-to/pooling-a-prefab),
  [showing player positions](./how-to/showing-player-positions),
  [transferring data between clients](./how-to/transferring-data-between-clients),
  [wiring a ready check](./how-to/wiring-a-ready-check).
- **A specific type's behavior** — start from
  [How TsVRC fits together](./core-concepts/how-it-fits-together) and follow its links, or
  search the sidebar.
- **Why TsVRC works the way it does** —
  [Codegen instead of reflection](./explanations/codegen-vs-reflection) and the other pages
  under Explanations.

## This site {/* #this-site */}

Docs for the `tsvrc` org live under `docs/tsvrc/`. A project joining the org later gets its
own folder next to this one (`docs/<other-project>/`) — same repo, same site, no cross-repo
wiring required.
