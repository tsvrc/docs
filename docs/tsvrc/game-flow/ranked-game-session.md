---
id: ranked-game-session
title: RankedGameSession
sidebar_position: 2
---

# RankedGameSession

`Tsvrc.Session.RankedGameSession` composes the rest of the tracking and timing stack into a
full round-based game session: a lobby, a synchronized ready-check-gated start, an active
game phase with completion tracking, and a configurable end condition. Its generated shadow
is `TsRankedGameSession`. It's the single most dependent runtime type in the package —
everything documented on the pages before this one is a real dependency of this class, not
just related reading.

## What it's built from

Five pooled ([`WirePoolAttribute`](../core-concepts/attributes.md)) sub-behaviours, wired up by codegen
rather than assigned by hand:

- `_lobbyTracker` (`PlayerTracker`) — who's in the lobby, before a round starts.
- `_readyCheck` (`ReadyCheckProcess`) — gates the transition from lobby to active game.
- `_gameTracker` (`PlayerTracker`) — who's actively playing the current round.
- `_completedTracker` (`PlayerTracker`) — who has finished the current round.
- `_timer` (`TsvrcTimer`) — an optional round duration.

`RankedGameSession` itself carries no state about *why* a game is won or lost — it only
manages phase transitions and player-set bookkeeping; your own subclass or event subscribers
decide what "completed" or "should end" actually means for your game.

## The state machine

`CurrentState` is one of `RankedGameSessionState.Idle`, `Loading`, or `InGame`. Transitions
happen only through the composed sub-behaviours' own events (subscribed once, in `TsStart`),
never by directly setting the field elsewhere — the one exception is `TsStart` itself, which
derives an initial value once from the sub-trackers' live state, safe only there because a
late-joining client's sub-trackers are already fully synced by the time its own scripts
start running; deriving it that way on every read, instead of caching it, would go stale on
any client that doesn't itself own that particular sub-process.

```
Idle --StartSession--> Loading --(ready check completes)--> InGame --(end condition)--> Idle
  ^                        |                                    |
  |                        +--StopSession/empty lobby-----------+--StopSession/natural end
  +------------------------------------------------------------------------------------+
```

## Running a session

```csharp
session.StartLobbyTracking();
session.AddLobbyPlayer(somePlayerId);
// ... later ...
session.StartSession();
// each client, once ready:
session.SetReady();
// ... a round is now InGame; your game logic calls:
session.AddCompletedPlayer(somePlayerId);
```

`StartSession` snapshots the current lobby roster and starts the ready check over it. It
takes an optional `additionalKnownPresentPlayerIds` — extra IDs unioned into that initial
snapshot even if `_lobbyTracker`'s own synced state hasn't caught up to them yet, since a
caller's own local knowledge (say, a trigger volume's roster) can be ahead of what's
propagated over the network. Starting with an empty roster is rejected outright with an
error, rather than allowed to silently hang: `ReadyCheckProcess.CheckAllPlayersReady` never
auto-completes on a zero-length tracked list, so an empty-lobby start would otherwise leave
the session stuck in `Loading` forever with nothing able to complete it except a manual
`StopSession`.

`AddLoadingParticipant` lets a player join an *already-running* ready check that they
weren't part of the original snapshot — useful for a game that becomes eligible to more
players over time without waiting for the next round. It's a no-op outside `Loading` and for
a player already tracked, matching the underlying `AddTrackedPlayers` semantics it forwards
to.

## Ending a session

Four independent, individually toggleable natural end conditions
(`_endOnTimerComplete`, `_endOnAllGamePlayersLeft`, `_endOnAllPlayersCompleted`,
`_stopOnEmptyLobbyDuringLoading`) plus an explicit `StopSession()` call. Each maps to its own
`RankedGameSessionEndReason` value, readable via `LastEndReason` once the corresponding event
fires. `_stopOnEmptyLobbyDuringLoading` exists for the same underlying reason the empty-lobby
start guard does: `CheckAllPlayersReady` can't complete a check with nobody left tracked, so
losing every remaining player during `Loading` needs an explicit stop or the session hangs
there permanently, one phase earlier than the equivalent `_endOnAllGamePlayersLeft` check.

**`StopSession` is local-only** — it runs its effects only on the calling client.
`RankedGameSession` carries no authorization or broadcast policy of its own (who's allowed to
stop a session, and how that reaches every client) — that's entirely the caller's
responsibility. A networked "force stop" button needs to broadcast the `StopSession` call to
itself across clients; `RankedGameSession` won't do that for you.

## Reading player state safely from inside an end event

`GamePlayerIds`/`CompletedPlayerIds` read live off the sub-trackers, which are already
stopped and cleared by the time `OnSessionEndedEvent`/`OnSessionStoppedEvent` actually fire —
reading them from inside those events' handlers would see an empty result. Use
`LastEndedGamePlayerIds`/`LastEndedCompletedPlayerIds` instead: both are snapshotted
immediately before the sub-trackers are torn down, specifically so a subscriber to the end
events has accurate data to work with. `LoadingPlayerIds` has a related but distinct
subtlety: it reads the ready check's own roster (which can be broader than `LobbyPlayerIds`,
thanks to `additionalKnownPresentPlayerIds`), so use it rather than `LobbyPlayerIds` to check
whether a player is part of the round currently loading.

```csharp
session.TsSubscribe(this, RankedGameSession.OnSessionEndedEvent, nameof(_OnRoundOver));
session.TsSubscribe(this, RankedGameSession.OnSessionStoppedEvent, nameof(_OnRoundOver));

public void _OnRoundOver()
{
    // GamePlayerIds would already read empty here - the sub-trackers are torn down
    // by the time this fires. Use the snapshot instead.
    if (TsArray.Contains(session.LastEndedGamePlayerIds, localPlayerId))
        AwardCompletionBonus();
}
```

## GetPlayerStatus

`GetPlayerStatus(playerId)` derives a single `RankedGamePlayerStatus` value
(`NotInSession`/`InLobby`/`Loading`/`Playing`/`Completed`) from the tracker arrays already
available on any client at any moment — it introduces no new synced state, just a
consumer-friendly read over state that already exists, replacing what would otherwise be
manual cross-referencing of three or four separate ID arrays.
