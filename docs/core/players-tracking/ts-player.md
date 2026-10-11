---
id: ts-player
title: TsPlayer
sidebar_position: 1
---

# TsPlayer

`Tsvrc.Player.TsPlayer` is a static helper class for identifying and looking up players.
It depends on no other Core type. The tracking chain uses it
([`PlayerTracker`](./player-tracker), [`AutoPlayerTracker`](./auto-player-tracker),
[`ReadyCheckProcess`](./ready-check-process) and the data transfer built on them), as do the
overlay UI ([`PlayerPositionOverlay`](../ui-components/overlay/player-position-overlay),
[`PlayerMarkerRenderer`](../ui-components/overlay/player-marker-renderer)) and
[`PlayerColorAssigner`](./player-color-assigner).

## Why a custom player ID exists

The VRChat `VRCPlayerApi.playerId` only identifies a player while they're present in
the current instance:
[`GetPlayerById`](https://creators.vrchat.com/worlds/udon/players/getting-players/#getplayerbyid)
only resolves someone who's still around, and playerId numbering isn't guaranteed to
line up the same way for every client watching the instance. Neither is safe to store
and compare later. The Core ID format, `displayName#playerId` (built by
`GetPlayerID`), is what gets stored and compared across clients throughout the
framework instead.

## Usage

Store the result of `GetPlayerID` anywhere you need to refer to a player later, and resolve it
back to a live `VRCPlayerApi` with `FindPlayerByID` (which returns `null` once that player
has left):

```csharp
string winnerId = TsPlayer.GetPlayerID(Networking.LocalPlayer);
// ...sent over the network, stored, or compared later...
VRCPlayerApi winner = TsPlayer.FindPlayerByID(winnerId);
if (winner != null)
{
    LogInfo(winner.displayName + " is still here.");
}
```

## Methods

- **`GetPlayerID(VRCPlayerApi)`** — builds the `displayName#playerId` string for a player.
- **`GetNumericPlayerId(string)`** — extracts the numeric ID from a `GetPlayerID` string, by
  scanning backward from the end for digits until a `#` or a non-digit. It parses by hand
  instead of calling `int.Parse`, since Core avoids standard-library calls that the Udon
  runtime isn't guaranteed to support. A malformed string (no `#` at all, a `#` with nothing
  after it, or a non-digit character right after the last `#`) returns `0` instead of
  throwing. A display name that contains `#` works too: parsing from the end finds the last
  `#`, which is the one `GetPlayerID` appended.
- **`FindPlayerByID(string)`** — finds the live `VRCPlayerApi` matching a `GetPlayerID`
  string among players currently in the instance, or `null` if none match (for example, the
  player already left).
- **`GetAllPlayers()`** / **`GetAllPlayerIDs()`** — the current player list, as
  `VRCPlayerApi[]` or as ID strings.
- **`ToPlayerIDs(VRCPlayerApi[])`** / **`ToPlayerApis(string[])`** — convert between the two
  representations. `ToPlayerApis` fetches the player list once for all lookups instead of
  calling `GetAllPlayers()` per ID, and its result holds only the IDs that resolved to a live
  player: an ID for someone who left the instance is dropped, not returned as a `null` entry.
- **`ToArray(string)`** — wraps a single player ID in a one-element array, for APIs that
  expect an array.

## Edge cases

`GetNumericPlayerId("First#0")` returns `0`, the same value it returns for a string with no numeric
ID, so a caller can't tell the two apart from the result alone.
