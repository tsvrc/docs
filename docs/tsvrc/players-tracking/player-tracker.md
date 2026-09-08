---
id: player-tracker
title: PlayerTracker
sidebar_position: 2
---

# PlayerTracker

`Tsvrc.Tracking.PlayerTracker` is a [Process](../core-concepts/process) that maintains a
networked, owner-managed set of tracked players, identified by
[`TsPlayer`](./ts-player) ID strings rather than live `VRCPlayerApi` references.
Its generated shadow is `TsPlayerTracker`. It's the base of `AutoPlayerTracker` and
`ReadyCheckProcess`.

## Usage

```csharp
public class SpectatorRoster : TsBehaviour
{
    [SerializeField] private PlayerTracker _spectators;

    protected override void TsStart()
    {
        _spectators.TsSubscribe(this, PlayerTracker.OnTrackingPlayersAddedEvent, nameof(_OnRosterChanged));
        _spectators.TsSubscribe(this, PlayerTracker.OnTrackingPlayersRemovedEvent, nameof(_OnRosterChanged));
        _spectators.StartPlayerTracking(new string[0]);
    }

    public void AddSpectator(string playerId) => _spectators.AddTrackedPlayers(new[] { playerId });

    public void _OnRosterChanged() => LogInfo(_spectators.LastPlayerIds.Length + " spectators.");
}
```

If every player should be tracked automatically instead of an explicit list you manage,
use [`AutoPlayerTracker`](./auto-player-tracker) instead — don't reimplement join/leave
handling on top of `PlayerTracker` directly.

## Starting and reading the tracked set

`StartPlayerTracking(playerIds, useProcessUpdate)` starts the process with an initial set.
The list is sanitized before use — `null` entries are stripped and duplicates are
collapsed — so the "no ID appears twice" invariant holds from the very first broadcast, not
just for later additions. Calling it while already running is a no-op inherited from
`Process.StartProcess`, and deliberately leaves the pending initial-list field untouched in
that case, so a rejected start can never corrupt the *next* legitimate start's initial set.

`LastPlayerIds` is the tracked set as of the last received broadcast or deserialization —
read it inside any `OnTracking*` callback for an accurate snapshot. `IsTrackedPlayer` (a
`protected` helper for subclasses) checks membership directly against the synced field
instead, which on a non-owner client can lag slightly behind a `Notify*` callback that just
fired; prefer `LastPlayerIds` inside those callbacks specifically for that reason.

## Adding and removing players while running

`AddTrackedPlayers`/`RemoveTrackedPlayers` are the public entry points. On the owner, they
apply directly; on a non-owner, they forward to the owner via
`SendCustomNetworkEvent(Owner, ...)`. The actual mutation happens in
`BroadcastAddTrackedPlayers`/`BroadcastRemoveTrackedPlayers` — both `[NetworkCallable]`, both
reachable directly by any player in the instance since VRChat can't restrict network-callable
callers, and both re-validate `IsProcessRunning() && IsProcessOwner()` themselves rather than
trusting that only the intended path reaches them. `BroadcastAddTrackedPlayers` also checks a
`CanAcceptTrackedPlayerAdditions()` hook (`true` by default) — override it to reject
additions under some condition; it's the single interception point for *both* the owner's
local fast path and a non-owner's remote call, because a `[NetworkCallable]` method itself
can't be `virtual`.

Both broadcast methods silently ignore IDs that don't apply (already tracked, for add; not
currently tracked, for remove) rather than erroring, and both deduplicate their payload
independently of the caller, so passing the same ID twice in one call never produces a
duplicate broadcast or a duplicate tracked entry.

## Automatic removal

Three separate paths remove a player without an explicit `RemoveTrackedPlayers` call, each
covering a different way a tracked player can stop being reachable:

- **`OnPlayerLeft`** — if the process is running and the departing player was tracked, the
  current owner removes them immediately.
- **`OnPlayerSuspendChanged`** — a suspended player can't run Udon code or respond to any
  network event, so leaving them tracked would permanently block any subclass logic waiting
  on a response from every tracked player. The current owner removes them on the transition
  to suspended; waking up needs no action, since the player was already removed on the way
  in.
- **`OnOwnerAbandonedProcess`** — covers the case where the *tracker's owner itself* leaves
  or suspends. The new owner (promoted by `Process`'s own ownership recovery) scans the
  entire tracked set against the current, non-suspended player list and removes anyone who's
  gone or suspended — this is what catches a tracked player who suspended while the process
  owner was the one who couldn't act on it (all non-owner clients skip that specific
  suspend-removal because they aren't the owner at the time).

## Events

Six `OnTracking*` hooks (`protected virtual`, all no-ops by default) paired with matching
`OnTracking*Event` string constants for `TsSubscribe`: `Started`, `Stopped`, `Completed`,
`Deserialization`, `PlayersAdded`, `PlayersRemoved`. Each hook's doc comment says which
`Last*Ids` property to read inside it. All the broadcast `Notify*` network-callable methods
that trigger these events are rate-limited at a uniform 100 events/second specifically so a
fast sequence of adds/removes can never overtake or fall behind a start/stop/complete
broadcast on a remote client — VRChat only guarantees relative ordering between two event
types from the same sender when neither hits its own rate limit, so keeping all of them at
the same limit is what makes that guarantee actually apply here.

## Edge cases worth knowing

- A network-callable `Notify*` method re-sanitizes its payload (null-strip, then dedupe)
  independently of what the sender already sanitized, and re-validates that the caller is
  actually the current owner (bypassed only for the owner's own inline broadcast, tracked by
  the internal `_isBroadcasting` flag) — because any player can invoke a `[NetworkCallable]`
  method directly, not just through the intended call path.
- Serialization packets and network events have no relative ordering guarantee, per VRChat's
  own documentation — `NotifyTrackedPlayersAdded` accounts for this by only adding IDs to
  `LastPlayerIds` that aren't already present, rather than assuming a clean delta.
