---
id: running-a-countdown
title: Run a synced countdown
sidebar_position: 7
---

# Run a synced countdown

How to run a countdown every client sees identically, using
[`TsvrcTimer`](../networking-data/tsvrc-timer).

## Steps

1. Declare a `[WirePool]` field. `TsvrcTimer` ships as [one of TsVRC's own default pool
   entries](../explanations/builtin-registrations), so there's nothing to register on the
   Configure window first:

   ```csharp
   public class RoundClock : TsBehaviour
   {
       [WirePool][SerializeField] private TsvrcTimer _timer;
       [SerializeField] private TextMeshProUGUI _countdownText;

       protected override void TsStart()
       {
           _timer.TsSubscribe(this, TsvrcTimer.OnTimerCompletedEvent, nameof(_OnRoundEnded));
       }

       public void StartRound() => _timer.StartTimer(60_000); // 60 seconds

       public void _OnRoundEnded() => LogInfo("Round timer finished.");
   }
   ```

2. Read the remaining time from your own per-frame update, not from
   `OnTimerUpdatedEvent`: that event exists for reacting to a state change (started,
   paused, completed), not for driving a UI redraw every frame.

   ```csharp
   private void Update()
   {
       if (!_timer.IsProcessRunning()) return;
       int seconds = (int)_timer.GetRemainingSeconds();
       _countdownText.text = $"{seconds / 60:00}:{seconds % 60:00}";
   }
   ```

3. Pause and resume it from anywhere, owner or not; both forward to the real owner over
   the network if the caller isn't it:

   ```csharp
   public void PauseRound() => _timer.PauseTimer();
   public void ResumeRound() => _timer.ResumeTimer();
   ```

## Reacting to a late joiner mid-round

A client that joins while the timer is already running still needs its `_countdownText`
to catch up. Read the current state once in `TsStart` instead of assuming `StartTimer`
already ran on this client:

```csharp
protected override void TsStart()
{
    _timer.TsSubscribe(this, TsvrcTimer.OnTimerCompletedEvent, nameof(_OnRoundEnded));

    if (_timer.IsProcessRunning())
    {
        _countdownText.gameObject.SetActive(true);
    }
}
```

## Why this shape

See [`TsvrcTimer`'s reference page](../networking-data/tsvrc-timer) for the full event
table, how pausing interacts with the timer's own auto-complete check, and the two sharp
edges around detecting a late joiner or a stop-then-restart landing in the same network
packet.
