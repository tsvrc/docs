---
id: tsvrc-behaviour
title: TsvrcBehaviour
sidebar_position: 2
---

# TsvrcBehaviour

`Tsvrc.Core.TsvrcBehaviour` is the base class every other TsVRC runtime type extends,
directly or indirectly. It's an
[`UdonSharpBehaviour`](https://udonsharp.docs.vrchat.com/) with structured, one-time
initialization and a small publish/subscribe event system built in. Its generated shadow
class is `TsBehaviour`. See [How TsVRC fits together](./how-it-fits-together) for why
your own scripts extend the shadow rather than this class directly.

## Usage

In practice, you only write one method yourself: `TsStart`. That's where your setup code
goes. Logging and the event system (`LogInfo`, `LogWarning`, `LogError`, `TsSubscribe`,
`TsEmit`) are already built for you, so you just call them.

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

Another behaviour reacts to that event by subscribing to it, once, during its own
`TsStart`:

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

A `TsvrcBehaviour` doesn't do anything until something calls `TsConstruct` on it. That
call assigns `_ts` and runs `TsStart()`, and it only ever does this once: calling
`TsConstruct` again on an already-constructed behaviour is a silent no-op, no matter which
overload you use. `_ts` is never reassigned, and `TsStart` never runs a second time.

That one-time guarantee is the whole point. It's what lets `TsStart` safely do things
that would break if run twice, like subscribing to an event or starting a timer, without
needing to guard against being re-entered. `_ts` is set before `TsStart` runs, so
`TsStart` can rely on it being there immediately.

There are two ways to construct a behaviour:

- **`TsConstruct(TsRoot tsvrc)`** is the root form. Registering something on the
  Configure window's Constructs, Pools, or Factories tab ultimately generates a call to
  this, wiring the behaviour directly to the project's root object.
- **`TsConstruct(TsvrcBehaviour parent)`** is the propagating form, for a behaviour that
  should share an already-constructed behaviour's `_ts` reference instead of being wired
  to the root itself. It reads `parent._ts` and forwards to the root overload.

A few edge cases fall out of how that guard works:

- Passing a `null` root to `TsConstruct(TsRoot)` is allowed. `_ts` becomes `null`, and
  `TsStart` still runs once. A second call, even with a real root this time, still
  changes nothing: the first call already used up the one construction.
- Passing a `null` parent to `TsConstruct(TsvrcBehaviour)` throws a
  `NullReferenceException`, but only on a behaviour's *first* construction. The no-op
  guard only checks for a second call, so the first call dereferences `parent._ts`
  without checking it first. Once a behaviour has already been constructed, a later
  `TsConstruct(null)` call is safe: the guard catches it before `parent` is ever touched.
- Passing a real, non-null parent that was itself never constructed doesn't throw.
  `parent._ts` is just `null` in that case, and propagating a null root is fine. It's
  only a null *parent reference* that throws.
- Propagation chains through any number of hops. Construct `C` against `B`, which was
  constructed against `A`, which was constructed against the real root, and `C` ends up
  holding that same original root reference.

## Events: TsSubscribe and TsEmit

A `TsvrcBehaviour` can broadcast events that other behaviours react to: one side
subscribes to a named event, the other side emits it, and every subscriber gets called.

Call `TsSubscribe(listener, eventName, callbackName)` to register a listener. From then
on, whenever this behaviour calls `TsEmit(eventName)`, `listener` gets a
[`SendCustomEvent(callbackName)`](https://udonsharp.docs.vrchat.com/vrchat-api/#methods-5)
call. There's no way to unsubscribe: once a listener
signs up, it stays subscribed for the rest of the world's lifetime. Pass both
`eventName` and `callbackName` through `nameof()` instead of a plain string, so renaming
either one later doesn't silently break the wiring.

A few things worth knowing about how subscriptions behave:

- Subscribing the same listener to the same event twice registers two separate
  deliveries, not one. `TsSubscribe` doesn't check for duplicates.
- Listeners are called in the order they subscribed.
- Subscribing to an event from inside that same event's own callback (a reentrant
  subscribe) doesn't take effect until the *next* time it's emitted. `TsEmit` works off
  a snapshot taken before it starts calling listeners, so a subscription added mid-emit
  can't affect the emit already in progress.

Two failure modes matter here, and they're handled differently on purpose:

- A listener that was already `null` when it subscribed throws a
  `NullReferenceException`, but not until `TsEmit` actually reaches it. Subscribing
  `null` itself doesn't fail; emitting to it does. Any listener earlier in the list
  still gets called normally before that throw happens.
- A listener whose GameObject got destroyed *after* subscribing is treated differently:
  `TsEmit` just skips it, and every other listener still fires. This works because
  Unity's [`==` operator](https://docs.unity3d.com/ScriptReference/Object-operator_eq.html)
  treats a destroyed object as equal to `null`, but `TsEmit` casts to `object` first to
  check whether the reference is genuinely null (never assigned) versus just destroyed,
  and only throws for the first case.

One more detail, about performance rather than behavior: the storage backing
subscriptions grows by doubling instead of by one slot per subscription, so repeated
`TsSubscribe` calls stay cheap on average instead of reallocating every time.

## Logging

Use `LogInfo`, `LogWarning`, and `LogError` to log from a `TsvrcBehaviour` subclass,
rather than calling `TsvrcLogger` or `Debug.Log` directly. See
[TsvrcLogger](../utilities/tsvrc-logger) for the full message format and how the toggles
work. Two things specific to calling it from here:

- Every message is tagged with this instance's own runtime class name, via
  `GetUdonTypeName()`. You never pass the tag yourself.
- `IsTsvrcInternal` (`false` by default) decides which of a message's paired toggles
  applies: the "Tsvrc Internal" one or the "Your World" one. Only override it to `true`
  if you're writing a framework base class that should be classified as part of TsVRC
  itself. Every subclass of a class that overrides it inherits that classification
  automatically. Leave it alone in ordinary world scripts.

If you call `LogInfo`, `LogWarning`, or `LogError` before `TsConstruct` has run, or after
it ran against a root whose `Log` is `null`, these methods fall back to
`Debug.Log`/`LogWarning`/`LogError` directly. The tag and message format stay the same,
but there's no project prefix (there's no `TsvrcLogger` instance to read one from) and no
toggle filtering at all. A message logged this early always prints, no matter how
logging is configured elsewhere.

## Destruction

`TsDestroy()` is `virtual` and defaults to calling Unity's own
[`Destroy(gameObject)`](https://docs.unity3d.com/ScriptReference/Object.Destroy.html). In
play mode, that defers the actual removal to the end of the current frame rather than
happening instantly. Outside play mode, in the editor, Unity refuses to run it
synchronously at all. Override `TsDestroy()` if a behaviour needs to do something other
than remove its whole GameObject. An override replaces the default entirely: there's no
"your override runs, then the base behavior also runs" chaining, so call
`Destroy(gameObject)` yourself if you still need it.

## What subclasses actually override

In practice, a subclass overrides `TsStart()` (a no-op by default) and, rarely,
`IsTsvrcInternal` or `TsDestroy()`. Everything else on this page is inherited behavior
you call, not something you override.
