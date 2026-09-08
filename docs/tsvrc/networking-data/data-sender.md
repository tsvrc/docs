---
id: data-sender
title: DataSender
sidebar_position: 6
---

# DataSender

`Tsvrc.DataTransfer.DataSender` puts real networking under
[ChunkedTransferSession](./chunked-transfer-session)'s sequencing hooks: it translates
`OnChunkSequenceStarted`/`Stopped`/`Completed` into `[NetworkCallable]` broadcasts to every
player in the instance, and exposes them as three events (`OnDataTransferStartedEvent`,
`...StoppedEvent`, `...CompletedEvent`) plus matching `protected virtual` hooks
(`OnTransferStarted`, `OnTransferStopped`, `OnTransferCompleted`). You never call it directly
— see [DataTransferer](./data-transferer) for the type a consumer actually uses.

## Owner-only broadcasts, verified per call

Each `Notify*` broadcast method checks that the caller is genuinely the object's owner
before acting — any player can invoke a `[NetworkCallable]` method directly, so without this
a malicious call could reset every client's receiver state (corrupting the expected-sender
tracking the next layer relies on) and stall the transfer for everyone. The check is skipped
only during the owner's own inline broadcast (tracked by the inherited `_isBroadcasting`
flag), because `CallingPlayer` isn't reliable there.

## Why the rate limit is 100/second, not the default

All three broadcasts, and the chunk-delivery event defined one layer up, share a
`maxEventsPerSecond: 100` limit. VRChat only guarantees relative delivery ordering between
two event types from the same sender when *neither* exceeds its own rate limit — at the
default rate, a rapid cancel-then-restart could let a chunk event overtake the "transfer
started" notification on a remote client, which would see `_transferActive` still false when
that chunk arrives, silently drop it, and stall forever with no automatic recovery. Keeping
every event in this family at the same, generous rate is what keeps that ordering guarantee
in force.

## Deferred stop/complete emission

The broadcast handlers behind these events, `NotifyTrackedPlayersDataTransferStopped`/
`Completed`, call the `OnTransferStopped`/`OnTransferCompleted` hooks synchronously but
don't emit the public events yet — they set a pending flag first and schedule the actual
emission (`_EmitDataTransferStopped`/`_EmitDataTransferCompleted`) one frame later via
`SendCustomEventDelayedSeconds`. This matters because, on the owner, `ExecuteStop`/
`ExecuteComplete` (from `Process`) are still on the call stack when the broadcast handler
runs — internal cleanup hasn't run yet. If a subscriber reacted to the event synchronously
by starting a new transfer, that new transfer's state would be corrupted by the
still-pending cleanup of the old one. Deferring the event by a frame lets cleanup finish
first.

The pending flags exist specifically to handle a new transfer starting inside that one-frame
gap: `NotifyTrackedPlayersDataTransferStarted` clears both flags immediately, so if a
subscriber restarts the transfer before the deferred call fires, the stale stop/complete
event for the *old* transfer is suppressed rather than firing after the new one has already
begun.
