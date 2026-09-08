---
id: tsvrc-behaviour
title: TsvrcBehaviour
sidebar_position: 2
---

# TsvrcBehaviour

`Tsvrc.Core.TsvrcBehaviour` is the base class every other TsVRC runtime type extends,
directly or indirectly. It's an `UdonSharpBehaviour` with structured, one-time
initialization and a lightweight publish/subscribe event system bolted on. Its generated
shadow class is `TsBehaviour` — see
[How TsVRC fits together](./how-it-fits-together) for why your own scripts extend the
shadow rather than this class directly.

## Usage

A typical subclass only overrides `TsStart` and uses the inherited `Log*`/`TsSubscribe`/
`TsEmit` methods — everything else on this page is inherited behavior, not something you
reimplement:

```csharp
public class RoundTimer : TsBehaviour
{
    protected override void TsStart()
    {
        LogInfo("Round timer ready.");
    }

    public void OnRoundEnded()
    {
        TsEmit("RoundEnded");
    }
}
```

Another behaviour reacts to that event by subscribing to it, once, during its own `TsStart`:

```csharp
public class ScoreTracker : TsBehaviour
{
    public RoundTimer roundTimer;

    protected override void TsStart()
    {
        roundTimer.TsSubscribe(this, "RoundEnded", nameof(OnRoundEnded));
    }

    public void OnRoundEnded()
    {
        LogInfo("Recording final scores.");
    }
}
```

## Construction

A `TsvrcBehaviour` doesn't do anything useful until something calls `TsConstruct` on it.
Two overloads exist:

- **`TsConstruct(TsRoot tsvrc)`** — the root form. Assigns `_ts` and calls `TsStart()`.
  Used for behaviours constructed directly against the project's root object (this is what
  registering something on the Configure window's Constructs, Pools, or Factories tab
  ultimately generates a call to).
- **`TsConstruct(TsvrcBehaviour parent)`** — the propagating form, for a behaviour that
  should share an already-constructed behaviour's `_ts` reference rather than being wired
  to the root directly. It reads `parent._ts` and forwards to the root overload.

Construction runs **at most once per instance**. A second call, through either overload, is
a silent no-op — `_ts` is not reassigned and `TsStart` does not run again. This is what lets
`TsStart` safely do non-idempotent setup (subscribing to events, starting a timer) without
guarding against being re-entered. `_ts` is assigned before `TsStart` runs, so `TsStart` can
rely on it immediately.

A few edge cases follow directly from that guard:

- `TsConstruct(root)` with `root` itself `null` is accepted: `_ts` becomes `null` and
  `TsStart` still runs once. Calling it a second time, even with a different non-null root,
  changes nothing — the first call already consumed the one construction.
- `TsConstruct(parent)` with `parent` itself `null` **throws `NullReferenceException`** on
  a behaviour's first construction — the null check only guards against a *second* call,
  so the very first call dereferences `parent._ts` unconditionally. Once a behaviour has
  already been constructed once, a later `TsConstruct(null)` call is safe (the no-op guard
  is checked before `parent` is ever touched).
- `TsConstruct(parent)` where `parent` is a real, non-null behaviour that was itself never
  constructed propagates `parent._ts` as `null` without throwing — a null root is a valid
  value to propagate, only a null *parent reference* throws.
- Propagation is transitive through any number of hops: constructing `C` against `B`
  against `A` against a root ends with `C` holding that same original root reference.

## Events: TsSubscribe / TsEmit / TsSubscribe

A `TsvrcBehaviour` can act as an event publisher. `TsSubscribe(listener, eventName,
callbackName)` records that `listener` should receive `SendCustomEvent(callbackName)`
whenever this instance later calls `TsEmit(eventName)`. Subscriptions are **world-lifetime
and never cleared** — there's no unsubscribe. Use `nameof()` for both string arguments so a
rename doesn't silently break the wiring.

Behavior worth knowing before relying on this:

- The same listener can subscribe to the same event more than once; each subscription
  delivers its own callback invocation, so a double-subscribe means a double-invoke.
- Delivery order matches subscription order.
- `TsEmit` snapshots its internal arrays before iterating. A listener that subscribes
  during its own callback (a reentrant subscribe mid-`TsEmit`) is not invoked until the
  *next* `TsEmit` call for that event, never the one currently running.
- A listener that was `null` at subscribe time throws `NullReferenceException` when
  `TsEmit` reaches it — subscribing `null` doesn't fail immediately, emitting does. Any
  listener earlier in subscription order still receives its callback before that throw
  happens.
- A listener whose `GameObject` was destroyed *after* subscribing is different: it's
  skipped silently rather than throwing, and other listeners still receive their callbacks.
  `TsEmit` distinguishes "genuinely never assigned" from "was valid, now destroyed" by
  casting to `object` before comparing to `null`, bypassing Unity's overridden `==` for a
  true reference check — Unity's own `==` can't tell the two cases apart on its own.
- The backing storage grows by doubling, not by one slot per subscription, so repeated
  `TsSubscribe` calls are amortized O(1) rather than a reallocation each time.

## Logging

`LogInfo`, `LogWarning`, and `LogError` are the intended way to log from a `TsvrcBehaviour`
subclass, over calling `TsvrcLogger` or `Debug.Log` directly — see
[TsvrcLogger](../utilities/tsvrc-logger) for the full format and toggle behavior. Two details
specific to the caller side:

- The tag in every message is this instance's own runtime class name
  (`GetUdonTypeName()`) — you never pass it yourself.
- `IsTsvrcInternal` (`false` by default) decides which of a message's paired
  internal/world toggles applies. Only override it to `true` if you're writing a framework
  base class meant to be classified as part of TsVRC itself; every subclass of a class that
  overrides it inherits that classification. Ordinary world scripts should leave it alone.

Before `TsConstruct` has run — or if it ran against a root whose `Log` is `null` — these
methods fall back to calling `Debug.Log`/`LogWarning`/`LogError` directly, using the same
tag and message format but with no project `Prefix` (there's no `TsvrcLogger` instance to
read one from) and **no toggle filtering at all**. A message logged this early always
prints, regardless of how logging is configured elsewhere.

## Destruction

`TsDestroy()` is `virtual` and defaults to `Destroy(gameObject)` — Unity's own destroy,
which defers the actual removal to the end of the current frame in play mode (and refuses
to run synchronously in the editor outside play mode). Override it if a behaviour needs to
do something other than remove its whole GameObject — an override replaces the default
entirely; there's no combined "your override, then the base behavior" chaining.

## What subclasses actually override

In practice, a subclass overrides `TsStart()` (the initialization hook, a no-op by
default) and, rarely, `IsTsvrcInternal` or `TsDestroy()`. Everything else on this page is
inherited behavior you call, not override.
