---
id: memory-module
title: MemoryModule
sidebar_position: 7
---

# MemoryModule

`Tsvrc.Editor.MemoryModule` generates the `_memory` field, the `Memory` property override,
and the `_TsMemoryStart()` startup call that wire a scene
[`TsvrcMemory`](../networking-data/tsvrc-memory) into the generated root. It's a direct subclass of
[`TsSingleComponentModule`](./ts-single-component-module) with no additional behavior of its
own — every mechanic (self-healing scene object, tree-shaking, usage detection via plain
`_ts.Memory` member access) is exactly what that shared base implements. Unlike
[`LogModule`](./log-module), there's no indirect-access wrapper equivalent to
`LogInfo`/`LogWarning`/`LogError` to account for, so `MemoryModule` doesn't override
`AdditionalUsageMethodNames`.
