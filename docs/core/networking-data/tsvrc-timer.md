---
id: tsvrc-timer
title: TsvrcTimer
sidebar_position: 2
---

# TsvrcTimer

`Tsvrc.Timing.TsvrcTimer` is a networked, pausable timer built on [Process](../core-concepts/process).
Its generated shadow is `TsTimer`. All clients share [server
time](https://udonsharp.docs.vrchat.com/vrchat-api/#methods-4) anchors and compute elapsed time
locally, so a running timer sends nothing per tick beyond the periodic [resync of
`Process`](../core-concepts/process#the-tick-loop). See [Run a synced
countdown](../how-to/running-a-countdown) for a task-oriented walkthrough.

## Getting an instance

`TsvrcTimer` is one of the [builtin pool entries](../explanations/builtin-registrations), so a
`[WirePool]` field of this type resolves with nothing to register, and codegen calls `TsConstruct`
on it. If you place the shipped `TsTimer` prefab in your scene yourself instead, call
[`TsConstruct`](../core-concepts/tsvrc-behaviour#construction) on it before using it.

## Usage

```csharp
public class RoundClock : TsBehaviour
{
    [WirePool][SerializeField] private TsvrcTimer _timer;

    protected override void TsStart()
    {
        _timer.TsSubscribe(this, TsvrcTimer.OnTimerCompletedEvent, nameof(_OnRoundEnded));
        _timer.StartTimer(60_000); // 60-second round
    }

    public void _OnRoundEnded() => LogInfo("Round timer finished.");
}
```

To show the countdown, read `_timer.GetRemainingSeconds()` from your own update loop.
`OnTimerUpdatedEvent` is for reacting to state changes, not for redrawing a UI every frame.

## Starting, stopping, pausing

- **`StartTimer()`** counts up with no end. `DurationMs` stays `0`.
- **`StartTimer(int durationMilliseconds)`** completes once elapsed time reaches the duration. A
  negative value counts as `0`, a timer with no end.

Either overload makes the calling player the owner first, so the timer runs on the player who
starts it. Calling either one while the timer runs does nothing: it doesn't restart the timer or
change its duration.

- **`StopTimer()`** and the inherited `CompleteProcess()` end the timer early or complete it. Both
  [send the call to the owner](../core-concepts/process#lifecycle) when another player makes it.
- **`PauseTimer()`** and **`ResumeTimer()`** freeze and unfreeze elapsed time. A pause extends the
  run: the completion check in `OnProcessUpdate` uses `GetElapsedMilliseconds()`, which stays frozen
  while paused, so the full duration always runs. Another player calling either one sends it to the
  owner through `RequestPauseTimer` or `RequestResumeTimer`, both
  [`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting)
  and limited to two calls per second.

## Reading elapsed and remaining time

`GetElapsedMilliseconds()` and `GetElapsedSeconds()` compute from the synced server-time anchor
while running, and return the frozen offset while stopped or paused. `GetRemainingMilliseconds()`
and `GetRemainingSeconds()` return `DurationMs - GetElapsedMilliseconds()`, and `0` for a timer
with no end, one past its duration, or a completed one.

`LastElapsedMilliseconds` holds the last value the timer computed. Read it when you need what the
timer last reported: it updates on every start, stop, pause, resume and deserialization, and every
0.25 seconds while running and not paused, from the same local loop that drives
`OnTimerUpdatedEvent`.

## Events

Each transition has a `protected virtual` hook to override in a subclass and a string constant to
pass to `TsSubscribe`. Both fire on every client, the hook first:

| Hook | Event constant | Fires when |
|---|---|---|
| `OnTimerStarted` | `OnTimerStartedEvent` | The timer starts, including when a late joiner finds it running |
| `OnTimerStopped` | `OnTimerStoppedEvent` | The timer stops before completion |
| `OnTimerCompleted` | `OnTimerCompletedEvent` | The timer completes: duration reached, or `CompleteProcess` called |
| `OnTimerPaused` | `OnTimerPausedEvent` | The timer pauses, including when a late joiner finds it paused |
| `OnTimerResumed` | `OnTimerResumedEvent` | The timer resumes |
| `OnTimerUpdated` | `OnTimerUpdatedEvent` | The elapsed time, running state or paused state seen locally changed |
| `OnTimerDeserialization` | `OnTimerDeserializationEvent` | Every `OnDeserialization` call, whether or not anything changed |

## How other players detect transitions

On the owner, the `OnProcessStarted`, `Stopped` and `Completed` hooks of `Process` call the timer
hooks directly. Other players compare the running and paused flags in each packet against what they
saw last, inside `OnDeserialization`. Two cases matter if you rely on the exact order of events:

- **A late joiner arriving mid-run** sees the timer go from never seen to running in one packet.
  That counts as a start: `OnTimerStarted` fires, and `OnTimerPaused` right after it if the timer
  is paused.
- **A stop and a restart in one packet.** Manual sync doesn't send on `RequestSerialization` right
  away. It [waits for its rate limit and sends whatever the synced fields hold at that
  moment](https://creators.vrchat.com/worlds/udon/networking/network-details/#manual-synchronization).
  A listener that starts a new run from `OnTimerStopped` or `OnTimerCompleted` (possible because
  [`SendCustomNetworkEvent(All, ...)` runs on the sender right
  away](https://creators.vrchat.com/worlds/udon/networking/events/#event-targeting)) can produce one
  packet in which the timer never stopped. `TsvrcTimer` counts runs in `_runId`, increased in every
  `OnProcessStarted`. When the timer stays running across a packet but `_runId` changed, the timer
  treats it as a new start. Whether the old run stopped or completed is lost by then, so only the
  start of the new run (and its pause, if any) fires.

## Edge cases

- The read methods return `0` on a timer that never started, and none of them throw.
- Elapsed time never goes negative. If `_elapsedOffsetMs + delta` overflows `int`, it becomes `0`
  instead of wrapping to a negative value.
- `OnProcessCleanup` keeps the server-time anchors of the last run, so other players can still
  show the final elapsed time after the timer stops. `OnProcessStarted` resets them at the start of
  the next run.
