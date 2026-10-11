---
id: data-sender
title: DataSender
sidebar_position: 3
---

# DataSender

`Tsvrc.DataTransfer.DataSender` adds networking to the sequence hooks of
[ChunkedTransferSession](./chunked-transfer-session): it turns `OnChunkSequenceStarted`, `Stopped`
and `Completed` into `[NetworkCallable]` broadcasts to every player in the instance. It exposes them
as three events (`OnDataTransferStartedEvent`, `...StoppedEvent` and `...CompletedEvent`) with
matching `protected virtual` hooks (`OnTransferStarted`, `OnTransferStopped` and
`OnTransferCompleted`). None of the three updates a `Last*` property. It's one layer of [the data
transfer chain](../data-transfer-overview), which names the type to use.

## Owner-only broadcasts, checked per call

Each `Notify*` broadcast method checks that the caller is the owner of the object before acting.
Any player can call a
[`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/#legacy-events-and-security)
method directly, so without the check a forged call could fire the start, stop or complete events
on every client and stall a running transfer for everyone. The owner skips the check during its own
broadcast, tracked by the inherited `_isBroadcasting` flag, because `CallingPlayer` isn't reliable
there.

## Why the rate limit is 100 per second

The three broadcasts use `maxEventsPerSecond: 100`, the [maximum VRChat
allows](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting). VRChat keeps the
order of events from one sender only while none of them hits its own rate limit. At the default
rate, a quick cancel and restart could let a later event of the transfer, such as a chunk, overtake
the start notification on another client. That client would drop the chunk and the transfer would
stall with nothing to recover it. A subclass that adds events to the transfer needs the same limit
to keep that order.

## Deferred stop and complete events

The broadcast handlers `NotifyTrackedPlayersDataTransferStopped` and `...Completed` call the
`OnTransferStopped` and `OnTransferCompleted` hooks right away, but emit the public events one frame
later: they set a pending flag and schedule `_EmitDataTransferStopped` or
`_EmitDataTransferCompleted` with `SendCustomEventDelayedSeconds`. On the owner, the handler runs
inside the stop or complete call, before [the cleanup of the process](../../core-concepts/process#lifecycle).
A subscriber that started a new transfer from the event right away would have the new state cleared
by that cleanup. Waiting a frame lets the cleanup finish first.

`NotifyTrackedPlayersDataTransferStarted` clears both pending flags, so when a subscriber starts a
new transfer within that frame, the deferred stop or complete event of the old transfer doesn't fire
after the new one began.
