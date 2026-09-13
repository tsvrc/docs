---
id: running-a-timed-round
title: Run a full timed round with a lobby
sidebar_position: 9
---

# Run a full timed round with a lobby

How to drive a complete round, players gather in a lobby, a ready check gates the start,
a timed round runs with completion tracking, then the round ends, using
[`RankedGameSession`](../game-flow/ranked-game-session) instead of hand-rolling the lobby,
ready check, and timer yourself.

## Steps

1. Declare a `[WirePool]` field. `RankedGameSession` ships as [one of TsVRC's own default
   pool entries](../explanations/builtin-registrations), so there's nothing to register on
   the Configure window first:

   ```csharp
   public class MatchController : TsBehaviour
   {
       [WirePool][SerializeField] private RankedGameSession _match;

       protected override void TsStart()
       {
           _match.TsSubscribe(this, RankedGameSession.OnSessionStartedEvent, nameof(_OnMatchStarted));
           _match.TsSubscribe(this, RankedGameSession.OnSessionEndedEvent, nameof(_OnMatchOver));
           _match.TsSubscribe(this, RankedGameSession.OnSessionStoppedEvent, nameof(_OnMatchOver));
       }
   }
   ```

2. Build the lobby before you ever start a round, and let players join and leave it
   freely:

   ```csharp
   protected override void TsStart()
   {
       // ...continued from above
       _match.StartLobbyTracking();
   }

   public void OnPlayerRequestsToJoin(string playerId) => _match.AddLobbyPlayer(playerId);
   ```

3. Start the round from the lobby roster once you're ready to begin. This snapshots who's
   in the lobby and starts a ready check over them:

   ```csharp
   public void BeginMatch() => _match.StartSession();
   ```

   Each client marks itself ready from wherever your own UI exposes that:

   ```csharp
   public void PlayerIsReady() => _match.SetReady();
   ```

4. React to the round actually starting (the ready check completed) and to it ending:

   ```csharp
   public void _OnMatchStarted() => LogInfo("Match started with " + _match.LobbyPlayerIds.Length + " players.");

   public void _OnMatchOver()
   {
       // GamePlayerIds/CompletedPlayerIds are unreliable here, the sub-trackers are
       // already being torn down. Use the snapshot instead.
       foreach (string playerId in _match.LastEndedCompletedPlayerIds)
       {
           AwardCompletionReward(playerId);
       }
   }
   ```

5. Mark a player finished as your own game logic decides:

   ```csharp
   public void OnPlayerFinishedTheRound(string playerId) => _match.AddCompletedPlayer(playerId);
   ```

## Choosing what ends a round

`RankedGameSession` never invents its own win condition. Toggle whichever combination of
its Inspector-exposed end conditions your game actually needs (a countdown running out,
every active player having left, or every active player having completed) instead of
polling for them yourself, and call `StopSession()` for anything else (a host command, a
vote to end early). See [the reference page](../game-flow/ranked-game-session#ending-a-session)
for exactly what each condition maps to on `LastEndReason`.

## Reading a specific player's status

`GetPlayerStatus(playerId)` answers "where is this player right now" (not in the
session, in the lobby, loading, playing, or completed) from state that's already
available, so you don't have to cross-reference `LobbyPlayerIds`/`GamePlayerIds`/
`CompletedPlayerIds` by hand:

```csharp
public bool IsPlayerStillPlaying(string playerId) =>
    _match.GetPlayerStatus(playerId) == RankedGamePlayerStatus.Playing;
```

## Why this shape

See [`RankedGameSession`'s reference page](../game-flow/ranked-game-session) for the full
state machine, the nine lifecycle events, and a real asymmetry worth knowing before you
build a networked "force stop" button: `StopSession` reaches every client automatically
during the lobby's ready check, but not once a round is already in progress.
