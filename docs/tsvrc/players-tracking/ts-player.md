---
id: ts-player
title: TsPlayer
sidebar_position: 1
---

# TsPlayer

`Tsvrc.Player.TsPlayer` is a static helper class for identifying and looking up players. It
has no dependency on any other TsVRC type, despite being used throughout the framework — by
`Process`, the tracking chain, the overlay UI, and `PlayerColorAssigner`.

## Why a custom player ID exists

VRChat's own `VRCPlayerApi.playerId` is only valid while a player is present in the current
instance — it can't be used to identify a player in data you send over the network to be
looked up later by a client whose own local `playerId` numbering may not agree. TsVRC's
own ID format, `displayName#playerId` (built by `GetPlayerID`), is what gets stored and
compared across clients throughout the framework instead.

## Usage

Store `GetPlayerID`'s result anywhere you need to refer to a player later, and resolve it
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
  scanning backward from the end for digits until a `#` or a non-digit. It's a manual
  parse, not `int.Parse`, for UdonSharp compatibility. A malformed string — no `#` at all,
  a `#` with nothing after it, or a non-digit character right after the last `#` — returns
  `0` rather than throwing. A display name that itself contains `#` characters is handled
  correctly: parsing works backward from the end, so it always finds the *last* `#`,
  which is the one `GetPlayerID` actually appended.
- **`FindPlayerByID(string)`** — finds the live `VRCPlayerApi` matching a `GetPlayerID`
  string among players currently in the instance, or `null` if none match (for example, the
  player already left).
- **`GetAllPlayers()`** / **`GetAllPlayerIDs()`** — the current player list, as
  `VRCPlayerApi[]` or as ID strings.
- **`ToPlayerIDs(VRCPlayerApi[])`** / **`ToPlayerApis(string[])`** — convert between the two
  representations. `ToPlayerApis` fetches the player list once and reuses it for every
  lookup, rather than calling `GetAllPlayers()` per ID, and its result array is trimmed to
  only the IDs that actually resolved to a live player — an ID for someone who's left the
  instance is silently dropped, not represented as a null entry.
- **`ToArray(string)`** — wraps a single player ID in a one-element array, for APIs that
  expect an array.

## Edge cases worth knowing

`GetNumericPlayerId("First#0")` returns `0` — the same value used to signal "no valid
numeric ID found". `Process.IsProcessOwner()` accounts for this ambiguity explicitly by
also checking that the ID isn't `0` before treating it as a real match, since VRChat's own
player IDs start at `1`; code that calls `GetNumericPlayerId` directly should apply the same
caution rather than treating `0` as an ordinary valid ID.
