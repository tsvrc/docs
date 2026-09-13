---
id: transferring-data-between-clients
title: Send a string payload to other players
sidebar_position: 3
---

# Send a string payload to other players

How to move an arbitrary string from one client to a set of others, using
[`DataTransferer`](../networking-data/data-transfer/data-transferer) to handle chunking, sequencing, and
reassembly for you. See [the chain overview](../networking-data/overview.md) if you want to
understand what's happening underneath this API.

## Steps

1. Declare a `[WirePool]` field for it. `DataTransferer` ships as [one of TsVRC's own
   default pool entries](../explanations/builtin-registrations), so there's nothing to
   register on the Configure window first.
2. Subscribe to completion before you ever call `TransferData`, so you don't miss a transfer
   that finishes on the same frame it starts:

   ```csharp
   public class ScoreSync : TsBehaviour
   {
       [WirePool][SerializeField] private DataTransferer _transferer;

       protected override void TsStart()
       {
           _transferer.TsSubscribe(this, DataTransferer.OnTransferCompletedEvent, nameof(_OnScoresReceived));
       }

       public void _OnScoresReceived()
       {
           string payload = _transferer.LastData;
           // parse and apply payload
       }
   }
   ```

3. Send it from whichever client has the data, to whichever players should receive it:

   ```csharp
   public void BroadcastScores(string serializedScores, string[] targetPlayerIds)
   {
       _transferer.TransferData(serializedScores, targetPlayerIds);
   }
   ```

That's the whole public surface. `DataTransferer` is the type you interact with regardless
of how large the payload is or how many chunks it takes to arrive.

## Serializing structured data

`TransferData` takes a string, so send structured data through [`TsJson`](../utilities/ts-json)
first:

```csharp
public void BroadcastScores(DataDictionary scores, string[] targetPlayerIds)
{
    _transferer.TransferData(TsJson.Serialize(scores), targetPlayerIds);
}
```

```csharp
public void _OnScoresReceived()
{
    DataDictionary scores = TsJson.Deserialize(_transferer.LastData);
    if (scores != null)
    {
        // use scores
    }
}
```

## Showing transfer progress

Subscribe to `OnTransferChunkEvent` to drive a progress bar while a large payload arrives.
`LastChunkIndex`/`LastTotalChunks` are set before this event fires, so both are safe to
read from inside the handler:

```csharp
public class ScoreSyncProgress : TsBehaviour
{
    [WirePool][SerializeField] private DataTransferer _transferer;
    [SerializeField] private Slider _progressBar;

    protected override void TsStart()
    {
        _transferer.TsSubscribe(this, DataTransferer.OnTransferChunkEvent, nameof(_OnChunkReceived));
        _transferer.TsSubscribe(this, DataTransferer.OnTransferCompletedEvent, nameof(_OnTransferDone));
    }

    public void _OnChunkReceived()
    {
        // LastChunkIndex is 1-based (it's "how many chunks have arrived so far").
        _progressBar.value = (float)_transferer.LastChunkIndex / _transferer.LastTotalChunks;
    }

    public void _OnTransferDone() => _progressBar.value = 1f;
}
```

## Handling a target player leaving mid-transfer

You don't need to: `DataTransferer` already handles a target player leaving, getting
suspended, or the sending object changing owners mid-transfer. See
[the chain overview](../networking-data/overview.md) and the individual layer pages if you need
the exact guarantees (what "completed" means when the recipient list shrank, for instance).

## Why this shape

VRChat caps individual network event payloads well below what most real payloads need, so a
single call has to become a sequenced chunk transfer underneath. The
[chain overview](../networking-data/overview.md) explains why that's split across eight small
layers instead of one large class.
