---
id: data-transferer
title: DataTransferer
sidebar_position: 6
---

# DataTransferer

`Tsvrc.DataTransfer.DataTransferer` is the last link of the chain and the type you use. Its
generated shadow is `TsDataTransferer`. Everything it does comes from [DataChunker](./data-chunker)
through [DataSenderReceiver](./data-sender-receiver), and this page covers only what
`DataTransferer` adds. See [Send a string payload to other
players](../../how-to/transferring-data-between-clients) for a task-oriented walkthrough.

## What it adds

Four public event constants that emit the reception events of `DataSenderReceiver` under transfer
names: `OnTransferStartedEvent`, `OnTransferStoppedEvent`, `OnTransferCompletedEvent` and
`OnTransferChunkEvent`.

## Getting an instance

`DataTransferer` is one of the [builtin pool entries](../../explanations/builtin-registrations), so a
`[WirePool]` field of this type resolves with nothing to register, and codegen calls `TsConstruct`
on it:

```csharp
[WirePool][SerializeField] private DataTransferer _transferer;
```

If you place the shipped `DataTransferer` prefab in your scene yourself instead, call
[`TsConstruct`](../../core-concepts/tsvrc-behaviour#construction) on it before using it. Its
`TsStart` stores the ID of the local player, and without it a receiver never finds itself among the
targets of a chunk, so it never acknowledges one and the transfer stalls.

## Usage

```csharp
transferer.TransferData(payload, targetPlayerIds);
transferer.TsSubscribe(this, TsDataTransferer.OnTransferCompletedEvent, nameof(OnTransferDone));
```

```csharp
public void OnTransferDone()
{
    string received = transferer.LastData;
    // ...
}
```

`LastPlayerIds`, inherited from `PlayerTracker`, holds the targets of the transfer when
`OnTransferStarted`, `Stopped` and `Completed` fire, carried over from the `OnTracking*` broadcast
before each one. `LastData`, `LastChunkIndex` and `LastTotalChunks` hold the reception details.

## Where the behavior is documented

Each failure case is documented on the layer that handles it: a target player leaving during a
transfer, a new owner taking over, how chunks are validated, and why events are deferred by a frame.
Start from [the chain overview](../data-transfer-overview) when a transfer doesn't behave the way
this page describes.
