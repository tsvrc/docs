---
id: data-chunk-receiver
title: DataChunkReceiver
sidebar_position: 4
---

# DataChunkReceiver

`Tsvrc.DataTransfer.DataChunkReceiver` is where an incoming chunk actually gets validated,
stored, and acknowledged. It overrides [DataSender](./data-sender)'s
`OnDataChunkSendRequested` to broadcast each chunk via its own `[NetworkCallable]` method,
`BroadcastDataChunkReceived`, which every instance player receives and which validates the
chunk before storing it. You never call it directly. See
[DataTransferer](./data-transferer) for the type a consumer actually uses.

## Validation, layer by layer

`BroadcastDataChunkReceived` is reachable directly by any player, since [VRChat can't
restrict callers of a
`[NetworkCallable]` method](https://creators.vrchat.com/worlds/udon/networking/events/#legacy-events-and-security).
So every check inside it is defending against a chunk that didn't come from the legitimate
flow, not just handling malformed input:

- **Transfer must actually be active** — checked via an internal `_transferActive` flag
  rather than `IsProcessRunning()`, because the synced `_isRunning` field and network events
  aren't delivery-ordered relative to each other; a chunk could otherwise arrive and be
  dropped before `_isRunning` catches up. `_transferActive` is instead set from the
  `OnTransferStarted` hook, which is guaranteed to have already run by the time a chunk
  event can arrive, since network events from the same sender *are* ordered.
- **Sender must match the expected process owner** — an internal `_expectedSenderPlayerId`,
  captured in `OnTransferStarted` from `Networking.LocalPlayer` (if the local instance is
  the process owner) or from `NetworkCalling.CallingPlayer` (if not), rejects a chunk from
  anyone else. The owner's own broadcast bypasses this via the same inline-call flag pattern
  used elsewhere in the chain (here, `_isSendingChunk`).
- **`playerIds` must be non-null and include the local player** — otherwise the chunk isn't
  meant for this client and is ignored.
- **`dataChunk` must be non-null** — `StringBuilder.Append(null)` is a silent no-op, so a
  null chunk stored without this check would leave that slot looking filled while actually
  corrupting the reassembled message.
- **`totalChunks` is bounds-checked** against a computed maximum
  (`⌈MAX_MESSAGE_SIZE / CHUNK_SIZE⌉`) before it's ever used to size an array — an unbounded
  value from a malicious direct call could otherwise trigger an out-of-memory allocation on
  every client that receives it.
- **`chunkIndex` must fall within `1..totalChunks`** — otherwise it's rejected before it's
  ever used to index into `_receivedChunks`, which a malicious out-of-range value would
  crash on.
- **`totalChunks` is locked to the first chunk's value** for the rest of the transfer; a
  later chunk claiming a different total is rejected outright, since accepting it would
  silently reallocate the receive buffer and discard everything already assembled.
- **A chunk index already filled is ignored** — VRChat's own documentation [describes its
  internal splitting of large events as "almost
  transparent"](https://creators.vrchat.com/worlds/udon/networking/events/#parameter-size-limits-and-event-splitting),
  which leaves room for a duplicate delivery under some conditions (network anomalies, an
  ownership-transfer race). Without de-duplication a repeat would re-fire `OnChunkStored`
  and send a redundant acknowledgment.

## A second reason for the same rate limit

[`DataSender`](./data-sender) explains why every broadcast in this family shares
`maxEventsPerSecond: 100`: event ordering. `BroadcastDataChunkReceived` has an additional,
independent reason of its own: VRChat [splits any event payload over 1 KB into internal 1 KB
packets](https://creators.vrchat.com/worlds/udon/networking/events/#parameter-size-limits-and-event-splitting),
and each of those counts separately against the rate limit. A 2,500-character ASCII
chunk is already close to 2,500 bytes (roughly three internal packets); a CJK chunk near the
worst case discussed on [`DataChunker`](./data-chunker)'s page is closer to 7,500 bytes
(roughly eight). At the SDK's default of 5 events per second, even the ASCII case would take
over half a second to clear the rate limiter per chunk, and the CJK case over a second. A
100/second budget clears either in well under a tenth of a second, comfortably inside
VRChat's [global throughput cap](https://creators.vrchat.com/worlds/udon/networking/network-details/#bandwidth-limits)
of about 11 KB/s, which ends up being the real limit on how fast a transfer can go.

## Storing and acknowledging

A validated chunk is stored at `_receivedChunks[chunkIndex - 1]`, `OnChunkStored` fires
(subclass hook for updating public properties), and only then does `NotifyChunkReceived()`
run, which is just `SetReady()` under the hood, acknowledging via the same ready-check
mechanism the rest of the chain already uses. `OnChunkStored` firing *before* the
acknowledgment matters on the owner specifically: `SetReady` can synchronously cascade into
completing the whole ready check, so emitting the chunk-received signal first guarantees a
chunk event is never observed to arrive after the completion event it made possible.

## Reassembly, and a player tracked only partway through

`OnTransferCompleted` reassembles the message only if every chunk slot was actually filled
(`HasAllChunks`); if any slot is still `null`, the result is an empty string, the same
result an untracked bystander's never-touched array already produces. This is what a player
who was tracked for only part of the transfer sees: someone removed mid-transfer, or
filtered out during an inter-chunk gap because they left or suspended. Chunks sent
after their removal are addressed to a `playerIds` list that no longer includes them and are
silently ignored by the `playerIds`-membership check above. Reassembly deliberately doesn't
attempt a partial result in that case.
