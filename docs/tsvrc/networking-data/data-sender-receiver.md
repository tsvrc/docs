---
id: data-sender-receiver
title: DataSenderReceiver
sidebar_position: 8
---

# DataSenderReceiver

`Tsvrc.DataTransfer.DataSenderReceiver` sits on top of
[DataChunkReceiver](./data-chunk-receiver) and is purely an ergonomics layer: it turns the
receiver's raw hooks (`OnTransferStarted`, `OnChunksAssembled`, `OnChunkStored`, ...) into a
clean, receiver-focused public API — `LastData`, `LastChunkIndex`, `LastTotalChunks`, and
four events (`OnDataReceptionStartedEvent`, `...StoppedEvent`, `...CompletedEvent`,
`OnDataChunkReceivedEvent`) with matching `protected virtual` hooks a subclass overrides
without ever touching the raw chunk arrays underneath.

## The same deferred-emission pattern, one layer up

Just as `DataSender` defers its stop/complete broadcasts by a frame, `DataSenderReceiver`
defers its own `OnDataReceptionStopped`/`Completed` emission the same way and for the same
reason: at the point these fire, `ExecuteStop`/`ExecuteComplete` is still on the call stack,
so a subscriber that reacts by immediately starting a new transfer would corrupt the new
transfer's state if the emission happened synchronously. The assembled data itself is
staged in a private field (`_pendingCompletionData`) rather than written straight to
`LastData`, specifically so a new transfer starting inside that one-frame gap — which resets
receiver state — can't clobber it before the deferred emit reads it. `LastData` is only ever
assigned atomically with the deferred completion event actually firing.

Both pending flags (`_pendingCompletion`, `_pendingStop`) are cleared by
`ResetReceiverState`, which runs when a new transfer starts. That's what suppresses a stale
emission for a transfer that's already been superseded: the deferred call still fires, finds
its flag already cleared, and returns without emitting anything.

## What this layer adds vs. what it doesn't

There's no new validation here; every correctness guarantee (sender verification, duplicate
suppression, chunk-count bounds) lives one layer down in `DataChunkReceiver` and isn't
repeated here.

## Usage

Most consumers use [`DataTransferer`](./data-transferer) directly and never touch this layer.
Subclass `DataSenderReceiver` itself only if you want the sender/receiver plumbing without
`DataTransferer`'s transfer-specific event names — override `OnDataReceptionCompleted` and
read `LastData`:

```csharp
protected override void OnDataReceptionCompleted()
{
    string received = LastData;
    // ...
}
```
