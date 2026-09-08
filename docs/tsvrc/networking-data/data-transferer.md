---
id: data-transferer
title: DataTransferer
sidebar_position: 9
---

# DataTransferer

`Tsvrc.DataTransfer.DataTransferer` is the end of the chain and the type you actually use.
Its generated shadow is `TsDataTransferer`. Everything it does is inherited from
[DataChunker](./data-chunker) through [DataSenderReceiver](./data-sender-receiver) — read
those pages first if you haven't; this page only covers what `DataTransferer` itself adds.

## What it adds

Four public event constants that simply forward `DataSenderReceiver`'s reception-focused
events under transfer-focused names — `OnTransferStartedEvent`, `OnTransferStoppedEvent`,
`OnTransferCompletedEvent`, `OnTransferChunkEvent` — plus one small piece of defensive
history: `DataTransferer` still overrides `OnOwnerAbandonedProcess`, but the override's body
is now just a call to `base`. The base chain (`ChunkedTransferSession`'s
`OnOwnerAbandonedProcess`, inherited unchanged through `DataSender`, `DataChunkReceiver`, and
`DataSenderReceiver`) already calls `StopReadyCheck()` and fully cleans up transfer state
during a handover. The override exists to carry a comment warning against re-adding an
earlier version's extra `CancelDataTransfer()` call here, which would run against an
already-stopped process and log a spurious warning.

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

`LastPlayerIds` (inherited from `PlayerTracker`, several layers down) is populated on
`OnTransferStarted`/`Stopped`/`Completed`, carried over from the corresponding
`OnTracking*` broadcast underneath — read it if you need to know who the transfer targeted,
alongside `LastData`, `LastChunkIndex`, and `LastTotalChunks` for the reception-specific
details.

## Where the real behavior lives

Every failure mode worth knowing about — what happens when a target player leaves
mid-transfer, what happens across an ownership handover, why chunks are validated the way
they are, why events are deferred by a frame — is documented on the layer that actually
implements it. Start from [the chain overview](./data-transfer-overview) if you're
debugging something that doesn't match this page's description of the surface.
