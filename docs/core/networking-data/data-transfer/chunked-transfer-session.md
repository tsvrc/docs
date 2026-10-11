---
id: chunked-transfer-session
title: ChunkedTransferSession
sidebar_position: 2
---

# ChunkedTransferSession

`Tsvrc.DataTransfer.ChunkedTransferSession` sends a message split by [DataChunker](./data-chunker)
one chunk at a time: each chunk runs its own [ready
check](../../players-tracking/ready-check-process), in which every target player acknowledges it,
before the next chunk starts. It only owns the chunk sequence and sends nothing over the network
itself. It's one layer of [the data transfer chain](../data-transfer-overview), which names the type
to use.

## The sequence

`TransferData(data, playerIds)` stores the data and starts a ready check over the target players.
Each completed ready check (`OnProcessCompleted`) starts the ready check of the next chunk, or, after
the last chunk, fires `OnChunkSequenceCompleted`. A subclass overrides four `protected virtual` hooks
to broadcast the transitions:

- `OnChunkSequenceStarted`: chunk 1 is about to go out.
- `OnChunkSequenceStopped`: the transfer was cancelled, or every target left.
- `OnChunkSequenceCompleted`: the ready check of the last chunk completed.
- `OnDataChunkSendRequested(dataChunk, chunkIndex, totalChunks, playerIds)`: fires for every chunk,
  and is where a subclass sends it over the network.

If every tracked player leaves or is suspended during a ready check, [the check can't
complete](../../players-tracking/ready-check-process#edge-cases). `ChunkedTransferSession`
overrides `OnProcessUpdate` to find a running process with no tracked players and calls
`CancelDataTransfer()`, so the transfer doesn't wait forever.

## Between chunks

Between two chunks, the underlying `Process` isn't running, and a stopped `ReadyCheckProcess` looks
the same whether the transfer ended or the next chunk hasn't started yet. `ChunkedTransferSession`
marks that gap with the synced `_pendingNextChunk` flag, and starts the next ready check one frame
later (`SendCustomEventDelayedSeconds(..., 0f)`) so the tick loop of the previous chunk ends first.
The flag is synced so a new owner can tell it took over in the gap.

When the next ready check starts, the list of targets is filtered down to players who are present
and not suspended. `OnPlayerLeft` and `OnPlayerSuspendChanged` don't remove anyone during the gap,
since both check `IsProcessRunning()`.

## A new owner during a transfer

Transfer state (`_dataChunks` and the chunk indices) isn't synced. Only the owner needs it, and
keeping it off the network means the [periodic resync](../../core-concepts/process#the-tick-loop)
never sends the rest of the message again. A new owner therefore starts with no chunk state.

`OnBecameProcessOwner` handles that. If a ready check is running, it stops it, since a check on
zeroed indices could otherwise read as a completed transfer. If the handover happened in the gap
between chunks, it broadcasts the stopped event so receivers clean up instead of waiting for a chunk
that won't come.

`OnDeserialization` handles two late packets from the previous owner. A packet that says the
transfer is between chunks, arriving after the new owner already handled the gap, is turned into a
stop. A packet that marks the process running again with no chunk data behind it stops the ready
check. The comments in the source describe both orderings.

## Cancellation

`CancelDataTransfer()` can be called at any point, including between chunks, and does nothing when
no transfer is active. Between chunks it resets the state and fires the stopped hook right away.
After a ready check completed but before its cleanup ran, `StopReadyCheck` would do nothing, so it
sets an internal flag that the next `OnProcessCleanup` reads to stop instead of starting the next
chunk. After the ready check of the last chunk, cancelling does nothing, since the transfer is
already completing.

## Adding players during a transfer

`CanAcceptTrackedPlayerAdditions` rejects new tracked players with a warning once
`_currentChunkIndex > 0`, which covers chunks in flight and the gaps between them. A player added
after the first chunk would fail the player-list check of every later chunk, could never call
`SetReady`, and would block the ready check forever. Removing a tracked player during a transfer is
allowed, since that's how departures are handled.
