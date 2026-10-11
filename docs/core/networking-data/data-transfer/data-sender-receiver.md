---
id: data-sender-receiver
title: DataSenderReceiver
sidebar_position: 5
---

# DataSenderReceiver

`Tsvrc.DataTransfer.DataSenderReceiver` builds on [DataChunkReceiver](./data-chunk-receiver) and
only changes how reception is exposed. It turns the raw hooks of the receiver (`OnTransferStarted`,
`OnChunksAssembled`, `OnChunkStored` and others) into `LastData`, `LastChunkIndex`,
`LastTotalChunks` and four events, `OnDataReceptionStartedEvent`, `...StoppedEvent`,
`...CompletedEvent` and `OnDataChunkReceivedEvent`, each with a matching `protected virtual` hook. A
subclass overrides those hooks without touching the chunk arrays. It's one layer of [the data
transfer chain](../data-transfer-overview), which names the type to use.

The started and stopped events don't update a `Last*` property. `LastChunkIndex` and
`LastTotalChunks` are set before `OnDataChunkReceivedEvent` fires, and `LastData` before
`OnDataReceptionCompletedEvent`, so a subscriber can read them inside its handler.

## Deferred stop and complete events

`DataSenderReceiver` emits `OnDataReceptionStopped` and `Completed` one frame late, [like the
transfer events of DataSender](./data-sender#deferred-stop-and-complete-events) and for the same
reason: they fire inside the stop or complete call, before [the cleanup of the
process](../../core-concepts/process#lifecycle), and a new transfer started from the event right
away would lose its state to that cleanup.

The assembled data waits in the private `_pendingCompletionData` field instead of going straight to
`LastData`. A new transfer that starts within that frame resets the receiver state, and this keeps
it from clearing the data before the deferred event reads it. `LastData` is set in the same step
that fires the completion event.

`ResetReceiverState`, which runs when a new transfer starts, clears both pending flags
(`_pendingCompletion` and `_pendingStop`). A deferred call for an older transfer still fires, finds
its flag cleared, and emits nothing.

## Validation

This layer adds no checks. Sender verification, duplicate suppression and the chunk-count bounds
are [done by DataChunkReceiver](./data-chunk-receiver#validation-layer-by-layer).

## Usage

To build your own type on this layer, override `OnDataReceptionCompleted` and read `LastData`:

```csharp
protected override void OnDataReceptionCompleted()
{
    string received = LastData;
    // ...
}
```
