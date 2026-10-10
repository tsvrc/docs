---
id: adding-a-screen-state-machine
title: Give a screen or flow its own state machine
sidebar_position: 12
---

# Give a screen or flow its own state machine

How to drive a UI screen or a local flow (idle → loading → active → done) through named
states with enter/exit callbacks, using [`StateManager`](../game-flow/state-manager)
instead of a pile of booleans.

## Steps

1. Spawn one for the screen or flow that needs it. `StateManager` ships as [one of
   TsVRC's own default factory entries](../explanations/builtin-registrations), so
   there's nothing to register on the Configure window first. Give each screen its own
   instance rather than sharing one across unrelated screens:

   ```csharp
   public class SettingsScreen : TsBehaviour
   {
       private const int StateIdle = 0;
       private const int StateLoading = 1;
       private const int StateReady = 2;

       [SerializeField] private GameObject _panel;
       [SerializeField] private GameObject _spinner;
       private StateManager _state;

       protected override void TsStart()
       {
           _state = _ts.CreateStateManager(transform);
           _state.RegisterState(StateIdle, this, enterMethod: nameof(OnEnterIdle));
           _state.RegisterState(StateLoading, this, enterMethod: nameof(OnEnterLoading), exitMethod: nameof(OnExitLoading));
           _state.RegisterState(StateReady, this, enterMethod: nameof(OnEnterReady));
           _state.SetState(StateIdle);
       }

       public void OnEnterIdle() => _panel.SetActive(false);
       public void OnEnterLoading() => _spinner.SetActive(true);
       public void OnExitLoading() => _spinner.SetActive(false);
       public void OnEnterReady() => _panel.SetActive(true);
   }
   ```

2. Trigger transitions from wherever your own logic decides, not from inside another
   state's own enter/exit method chain:

   ```csharp
   public void StartLoadingSettings() => _state.SetState(StateLoading);
   ```

3. If something outside this screen needs to react to every transition generically
   (analytics, a shared loading spinner), subscribe to the state manager's own event
   instead of duplicating calls at every `SetState` call site:

   ```csharp
   _state.TsSubscribe(this, "OnStateChanged", nameof(_OnAnyStateChanged));
   ```

## Why one instance per screen

A `StateManager` instance only knows the states you've registered on it. Sharing one
across unrelated screens means their state numbers collide (`StateLoading = 1` on one
screen is a different concept than `StateLoading = 1` on another) unless you're careful
to give every screen's states globally unique numbers. A fresh instance per screen avoids
that entirely, and costs nothing extra: `_ts.CreateStateManager` is a cheap, local,
non-networked spawn.

## Why this shape

See [`StateManager`'s reference page](../game-flow/state-manager) for what happens if an
enter/exit method or a subscriber throws mid-transition, how a reentrant `SetState` call
from inside an enter/exit method is queued rather than interleaved, and why `StateManager`
needs no `TsConstruct` at all if you want to skip the factory and use one completely
manually.
