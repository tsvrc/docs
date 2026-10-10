---
id: chunked-transfer-session
title: ChunkedTransferSession
sidebar_position: 2
---

# ChunkedTransferSession

`Tsvrc.DataTransfer.ChunkedTransferSession` sequences delivery of a
[DataChunker](./data-chunker)-split message: each chunk runs its own
[ready check](../../players-tracking/ready-check-process) (every target player must acknowledge it)
before the next chunk starts. It has no networking of its own yet: that's added by
`DataSender` above it. This layer only owns the chunk-by-chunk sequencing state machine. You
never call it directly. See [DataTransferer](./data-transferer) for the type a consumer
actually uses.

## The sequencing loop

`TransferData(data, playerIds)` stores the data and starts a ready check over the target
players. Each completed ready check (`OnProcessCompleted`) either starts the next chunk's
ready check or, on the last chunk, fires `OnChunkSequenceCompleted`. Four `protected virtual`
hooks mark the transitions a subclass overrides to broadcast lifecycle events:
`OnChunkSequenceStarted` (chunk index 1 about to send), `OnChunkSequenceStopped` (cancelled,
or all targets departed), `OnChunkSequenceCompleted` (last chunk's ready check completed),
and `OnDataChunkSendRequested(dataChunk, chunkIndex, totalChunks, playerIds)` (fired for
every chunk in sequence: this is the actual "send this chunk" signal a subclass hooks to do
networking).

If every tracked player leaves or gets suspended while a chunk's ready check is active, the
check itself can't auto-complete: [`ReadyCheckProcess`](../../players-tracking/ready-check-process)'s
own completion poll returns early on an empty tracked list rather than treating "nobody
left to wait on" as "everyone's ready." `ChunkedTransferSession` overrides `OnProcessUpdate`
to detect exactly that (an active process with zero tracked players) and calls
`CancelDataTransfer()` itself, so a transfer with no remaining targets doesn't stall
forever waiting for a ready check that can never complete on its own.

## The inter-chunk gap

Between chunks, the underlying `Process` is briefly not running: a `ReadyCheckProcess`'s
"stopped" state doesn't distinguish "the whole transfer is done" from "this chunk's check
finished, the next one hasn't started yet." `ChunkedTransferSession` tracks that window
itself with an internal, synced `_pendingNextChunk` flag, deferring the actual start of the
next ready check to the following frame (`SendCustomEventDelayedSeconds(...,0f)`) so the
previous chunk's tick loop fully exits first. Synced, so a new owner (see below) can detect
being mid-gap rather than mistaking it for "no transfer active."

At the start of the next ready check, the target player list is re-filtered against
currently active, non-suspended players. `OnPlayerLeft`/`OnPlayerSuspendChanged` don't fire
this filtering themselves between chunks, since both guard on `IsProcessRunning()`, which is
false during the gap.

## Ownership handover mid-transfer

Transfer state (`_dataChunks`, chunk indices) is deliberately **not** synced: only the
owner needs it, and keeping it off the wire means the remaining message text is never
re-sent as a side effect of `Process`'s own [periodic
auto-resync](../../core-concepts/process#the-tick-loop-and-auto-resync), which re-broadcasts
every synced field every 5 seconds while a process runs. That means a new owner, promoted
after the old one leaves, starts with empty chunk state no matter where in the transfer the
old owner was. `OnOwnerAbandonedProcess` handles this by stopping any in-flight ready check
outright (a false "all chunks equal, transfer complete" read on zeroed indices would
otherwise be possible) and, if the handover happened during the inter-chunk gap,
broadcasting the stopped event so receivers clean up rather than waiting forever for a
chunk that will never come. `OnDeserialization` adds two more narrow-race recoveries for
stale-packet orderings specific to this handover: a late "still in the gap" packet arriving
after the takeover already resolved it, and a "zombie" state where a stale packet
resurrects `_isRunning=true` with no actual chunk data behind it. Both are documented in
detail in the source's own inline comments if you're debugging a handover edge case
specifically.

## Cancellation

`CancelDataTransfer()` is safe to call at any point, including mid-gap, and is a no-op if no
transfer is active. Its behavior depends on exactly where the transfer currently is: during
the gap it resets state and fires the stopped hook immediately; in the narrow window after a
chunk's ready check has completed but cleanup hasn't run yet, it can't act immediately
(`StopReadyCheck` would no-op there) so it sets an internal flag that the next
`OnProcessCleanup` reads to abort instead of advancing to the next chunk. That same window
also covers the moment right after the *last* chunk's ready check completes: cancelling
there is a no-op too, since the transfer is already finishing on its own by that point.

## Edge case worth knowing

`CanAcceptTrackedPlayerAdditions` is overridden here to reject adding tracked players
mid-transfer (once `_currentChunkIndex > 0`, spanning both in-flight chunks and inter-chunk
gaps). A player added after the first chunk already broadcast would fail every subsequent
chunk's own player-list check, be unable to ever call `SetReady`, and stall the ready check
permanently. Rejecting the addition outright, with a warning, is safer than letting that
happen silently. Removing a tracked player mid-transfer has no equivalent restriction: that's
the ordinary departure path, already handled by the mechanisms above.
