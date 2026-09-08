---
id: construct-module
title: ConstructModule
sidebar_position: 11
---

# ConstructModule

`Tsvrc.Editor.ConstructModule` is the generator behind the [tutorial](../first-behaviour)'s
onboarding step — registering a `TsvrcBehaviour` on the Configure window's **Constructs**
tab is what this module turns into a generated field, an accessor, and a startup
`TsConstruct` call. It's the module directly responsible for `_ts.Name` reaching a
`TsStart()` override at all.

## Usage

Register a `TsvrcBehaviour` on the Configure window's Constructs tab, then reach it from any
other behaviour by its generated accessor:

```csharp
_ts.GameManager.StartRound();
```

## What it generates, and why both a field and an accessor

Each construct entry becomes a private backing field
(`[HideInInspector][SerializeField] private {Type} _construct{Name};`) plus, normally, a
public accessor (`public {Type} {Name} => _construct{Name};`) — and, inside
`_TsConstructStart()`, a `{FieldName}.TsConstruct(this);` call. The accessor is the only
part that's ever conditionally omitted: if another module's registration collides on the
same name (see below), the field and its `TsConstruct` call still generate — the behaviour
still gets initialized — but the public accessor is dropped so the other registration's own
accessor is what `_ts.Name` actually resolves to.

## Naming and requirements

A construct must be a component and must be a `TsvrcBehaviour` — `EntryPolicy` enforces both
(`RequireComponent`/`RequireTsvrcBehaviour`), unlike Global, which accepts any scene object.
An entry with no explicit name defaults to its own component type name.

## Precedence over Global

`ConstructModule` reports `FieldNamePrecedence = 100`, above Global's default `0` — so
registering the same object as both a Global and a Construct resolves to the Construct's
accessor, with the Global entry itself dropped by `GlobalModule.ExcludeFieldNames` and a
warning suggesting removing the redundant registration. A tie between two Constructs (or
between a Construct and some other same-precedence module) suppresses the accessor on both
rather than picking an arbitrary winner — `ConstructModule.ExcludeFieldNames` handles that
case by tracking which of *its own* entries lost the tie in `_suppressedAccessors`, keeping
the construct's initialization but dropping its public accessor, with a warning suggesting a
distinct name.
