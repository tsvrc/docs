---
id: tsvrc-timer
title: TsvrcTimer
sidebar_position: 2
---

# TsvrcTimer

`Tsvrc.Timing.TsvrcTimer` is a networked, pausable timer built on top of
[Process](../core-concepts/process). Its generated shadow is `TsTimer`. All clients share the same
server-time anchors and compute elapsed time locally — there's no per-tick network
traffic while it's running.

## Usage

Drag the shipped `TsTimer` prefab into your scene, reference it from a behaviour, and start it:

```csharp
public class RoundClock : TsBehaviour
{
    [SerializeField] private TsvrcTimer _timer;

    protected override void TsStart()
    {
        _timer.TsSubscribe(this, TsvrcTimer.OnTimerCompletedEvent, nameof(_OnRoundEnded));
        _timer.StartTimer(60_000); // 60-second round
    }

    public void _OnRoundEnded() => LogInfo("Round timer finished.");
}
```

Anything displaying the countdown reads `_timer.GetRemainingSeconds()` on its own update
loop rather than waiting for `OnTimerUpdatedEvent` — that event exists for reacting to state
changes, not for driving a per-frame UI redraw.

## Starting, stopping, pausing

- **`StartTimer()`** — open-ended, counts up indefinitely (`DurationMs` stays `0`).
- **`StartTimer(int durationMilliseconds)`** — auto-completes once elapsed time reaches the
  given duration. A negative value is coerced to `0` (open-ended) rather than rejected.
  Calling either overload while already running is a silent no-op that leaves the current
  run's duration untouched — it does not restart the timer or change its duration mid-run.
- **`StopTimer()`** / inherited `CompleteProcess()` — stop before or at completion. Forwards
  to the owner over the network if called by a non-owner, same as `Process`.
- **`PauseTimer()`** / **`ResumeTimer()`** — freeze and unfreeze elapsed time. Pausing
  extends the effective run time: `OnProcessUpdate`'s auto-complete check uses
  `GetElapsedMilliseconds()`, which returns the frozen offset while paused, so a duration is
  always fully observed regardless of how long a pause lasts. Both forward to the owner when
  called by a non-owner, through their own `[NetworkCallable]` targets
  (`RequestPauseTimer`/`RequestResumeTimer`, rate-limited to 2/second) — the same
  dual-authority pattern `Process` itself uses for stop/complete.

## Reading elapsed and remaining time

`GetElapsedMilliseconds()`/`GetElapsedSeconds()` compute from the synced server-time anchor
while running, or return the frozen offset while stopped or paused. `GetRemainingMilliseconds()`/
`GetRemainingSeconds()` derive from `DurationMs - GetElapsedMilliseconds()`, clamped to `0`
for an open-ended timer, a timer already past its duration, or a completed timer.
`LastElapsedMilliseconds` holds the last value computed by the internal update loop — read
that instead of calling `GetElapsedMilliseconds()` yourself if you just need "what the timer
last reported," since it's kept current by the same 0.25s local loop that drives
`OnTimerUpdatedEvent`.

## Events

Two names for essentially the same thing: a `protected virtual` hook to override in a
subclass, and a public string constant to subscribe to via `TsSubscribe` from anywhere
else. Both fire on every client, hook before event, for the matching transition:

| Hook | Event constant | Fires when |
|---|---|---|
| `OnTimerStarted` | `OnTimerStartedEvent` | Timer starts, including a late joiner observing an already-running timer |
| `OnTimerStopped` | `OnTimerStoppedEvent` | Timer stops before completion |
| `OnTimerCompleted` | `OnTimerCompletedEvent` | Timer completes (duration reached, or `CompleteProcess` called) |
| `OnTimerPaused` | `OnTimerPausedEvent` | Timer pauses (including a late joiner discovering the timer is already paused) |
| `OnTimerResumed` | `OnTimerResumedEvent` | Timer resumes |
| `OnTimerUpdated` | `OnTimerUpdatedEvent` | The locally observed elapsed time, running state, or paused state actually changed |
| `OnTimerDeserialization` | `OnTimerDeserializationEvent` | Every `OnDeserialization` call, regardless of whether anything changed |

## How non-owner clients detect transitions

The owner gets its lifecycle hooks called directly from `Process`'s own
`OnProcessStarted`/`Stopped`/`Completed`. A non-owner has no such direct call — it derives
the same events by diffing synced state inside `OnDeserialization`, comparing the newly
received running/paused flags against what it last observed. This diffing approach has two
sharp edges worth knowing if you're relying on exact event sequencing:

- **A late joiner arriving mid-run** sees running go from "never observed" to `true` in one
  packet. That's treated the same as a fresh start: `OnTimerStarted` fires, and if the timer
  happens to already be paused, `OnTimerPaused` fires right after it in the same
  deserialization call — the joiner doesn't need to separately poll `_isPaused`.
- **A stop-then-restart coalesced into one packet** — possible because VRChat coalesces
  multiple `RequestSerialization` calls made in the same frame, so a listener that reacts to
  `OnTimerStopped`/`OnTimerCompleted` by synchronously starting a new run can produce a
  single outbound packet where a remote client's view of "is it running" never actually
  toggled to `false` in between. A plain running-state diff would see no transition at all
  and silently drop the entire stop-then-restart. `TsvrcTimer` detects this case with an
  internal run counter (`_runId`, incremented on every `OnProcessStarted`): if the running
  flag stayed `true` across a packet but the run ID changed, it treats it as a fresh start
  for event purposes. The old run's actual stopped-vs-completed outcome is not recoverable
  at that point (it was already overwritten before the packet was even sent) — only the new
  run's start (and pause state, if applicable) gets surfaced.

## Edge cases worth knowing

- All the numeric read accessors return sane zero defaults on a timer that's never been
  started — none of them throw on an unstarted timer.
- Elapsed-time arithmetic is clamped to never go negative, including in the specific case
  of `_elapsedOffsetMs + delta` overflowing `int` — it clamps to `0` rather than wrapping
  into a negative value.
- `OnProcessCleanup` (inherited from `Process`) preserves the final run's server-time
  anchors rather than clearing them, specifically so a non-owner can still display the
  correct final elapsed time after the timer stops. Those anchors are only reset in
  `OnProcessStarted`, at the beginning of the *next* run — not at cleanup time.
