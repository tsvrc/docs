---
id: state-manager
title: StateManager
sidebar_position: 1
---

# StateManager

`Tsvrc.StateMachine.StateManager` is a generic, local-only (unsynced) finite state machine:
states are plain integers, each with optional enter/exit method dispatch on a chosen target
behaviour. Its generated shadow is `TsStateManager`. It has no dependency on any other
TsVRC module beyond `TsvrcBehaviour`. See [Give a screen or flow its own state
machine](../how-to/adding-a-screen-state-machine) for a task-oriented walkthrough.

## Getting an instance

`StateManager` ships as one of [TsVRC's own default factory
entries](../explanations/builtin-registrations) (`TsBuiltinConfig`).

- **Default:** `_ts.CreateStateManager(parent)` just works, nothing to register in
  Configure first.
- **Manual:** skip the factory entirely. `AddComponent` it (or drag the shipped
  `StateManager` prefab into your scene) and start calling `RegisterState`/`SetState`
  directly. Unlike most other TsVRC runtime types, `StateManager` never overrides
  `TsStart` and never touches `_ts`, so it doesn't need `TsConstruct` to have run at all:
  first-class support for the fully manual path.

## Usage

```csharp
manager.RegisterState(StateIdle, this, exitMethod: nameof(OnExitIdle));
manager.RegisterState(StateActive, this, enterMethod: nameof(OnEnterActive));
manager.SetState(StateActive);
```

`RegisterState(state, target, enterMethod, exitMethod)` associates a state integer with a
target `UdonSharpBehaviour` and up to two method names, dispatched via `SendCustomEvent`.
Use `nameof()` for the method names so a rename doesn't silently break the wiring. Pass
`this` as the target for a `StateManager` subclass that hosts its own enter/exit methods.
Either method name is optional; a state can register only an exit, only an enter, or
neither (useful if you only need to react through `OnStateChanged` instead).
`UnregisterState` removes an entry entirely: a later transition into or out of an
unregistered state simply skips dispatch for it, without throwing.

`SetState(newState)` runs the transition: calls the current state's registered exit method
(skipped if no state has been entered yet, the initial state is `-1`), calls the virtual
`OnStateChanged(oldState, newState)` hook and emits an
[`"OnStateChanged"`](../core-concepts/tsvrc-behaviour#events-tssubscribe-and-tsemit) event
via `TsEmit`, then calls the new state's registered enter method. Calling `SetState` with the
state already current is a no-op: no dispatch happens at all, not even a redundant
exit/enter of the same state. `CurrentState`/`PreviousState` are also exposed as
`GetCurrentState()`/`GetPreviousState()` method calls returning the same values, useful
anywhere only a method, not a property getter, can be wired up, such as a `UnityEvent` bound
in the inspector.

## Reentrant SetState calls are queued, not interleaved

Calling `SetState` again from inside `OnStateChanged`, from an external subscriber to the
`OnStateChanged` event, or from an enter/exit method itself doesn't run that new transition
immediately: it's queued (only the most recently queued state survives if several arrive
before the current transition finishes) and runs only after the in-progress transition
completes in full. This guarantees a transition's exit → `OnStateChanged` → enter sequence
is never interrupted partway through by a reentrant call jumping the queue.

That queue drains in a loop inside the original `SetState` call, not in a separate future
tick: if a queued transition's own `OnStateChanged` (or dispatched method) immediately
queues yet another *different* state every time it runs, the loop keeps draining and never
returns control to whoever made the original call. It won't overflow the call stack the way
naive recursion would, but it will hang that calling frame indefinitely. Redirecting to a
state and stopping there is fine (already the pattern a reentrant redirect exists for); an
enter/exit chain that never settles is not.

## Failure mode worth knowing

`SetState` sets `_isTransitioning = true`, runs the transition, then sets it back to
`false`. UdonSharp can't compile `try`/`catch`/`finally`, so that reset can't be wrapped in a
`finally` block. If `OnStateChanged`, a dispatched enter/exit method, or an external
subscriber to the `"OnStateChanged"` event throws mid-transition, the exception unwinds
straight past the reset and `_isTransitioning` is left stuck `true`. Every subsequent
`SetState` call is then permanently treated as reentrant: it queues its state instead of
running it, and nothing ever processes the queue again, since nothing completes the
transition that's stuck "in progress." A `StateManager` instance that hits this is stuck for
good, silently swallowing every later `SetState` call rather than throwing again or
recovering. If your enter/exit methods or `OnStateChanged` override can throw, catch inside
them rather than letting an exception escape into `SetState`.

## Dispatch target lifetime

A registered target whose `GameObject` was destroyed after `RegisterState` is treated the
same as a `null` target: its dispatch is skipped silently rather than throwing, using the
same "compare to `null` through Unity's overridden equality" check used elsewhere in the
framework. A destroyed target for one state doesn't affect dispatch for any other
registered state.
