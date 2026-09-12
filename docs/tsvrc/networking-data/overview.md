---
id: data-transfer-overview
title: The data transfer chain
sidebar_position: 3
---

# The data transfer chain

`DataTransferer`, the type you actually use, is the last link in an eight-level
inheritance chain built on [Process](../core-concepts/process):
`Process → PlayerTracker → ReadyCheckProcess → DataChunker → ChunkedTransferSession →
DataSender → DataChunkReceiver → DataSenderReceiver → DataTransferer`. Each layer adds one
concern on top of the one below it, so this section documents them bottom-up in that same
order. Reading `DataTransferer`'s page without the ones before it skips the reasoning
behind most of what it does.

## The problem being solved

VRChat caps the [total parameter size of a single network
event](https://creators.vrchat.com/worlds/udon/networking/events/#parameter-size-limits-and-event-splitting)
at 16 KB and [Udon's overall outgoing
bandwidth](https://creators.vrchat.com/worlds/udon/networking/network-details/#bandwidth-limits)
to about 11 KB/s, so sending an arbitrary string to a set of players means splitting it
into chunks, sending them one at a time, and confirming each one actually arrived before
sending the next, all while players can join, leave, get suspended, or have ownership of
the sending object change mid-transfer. Each layer in the chain exists to handle one slice
of that: chunking the data, sequencing the chunks through a ready check, broadcasting
lifecycle events, validating and reassembling what arrives, and exposing a clean public API
on top.

## Reading order

Read these in order; each page assumes the ones before it:

1. [DataChunker](./data-transfer/data-chunker): splits and validates the raw string, no
   networking or process state of its own.
2. [ChunkedTransferSession](./data-transfer/chunked-transfer-session): sequences one chunk's
   ready check after another.
3. [DataSender](./data-transfer/data-sender): broadcasts the sequencing transitions as
   networked lifecycle events.
4. [DataChunkReceiver](./data-transfer/data-chunk-receiver): validates, stores, and
   acknowledges each incoming chunk.
5. [DataSenderReceiver](./data-transfer/data-sender-receiver): wraps the receiver's raw
   hooks into a clean `Last*`/event API.
6. [DataTransferer](./data-transfer/data-transferer): the type you actually use, adding only
   transfer-focused event names on top.

## What you actually use

Unless you're extending the chain itself, you only interact with `DataTransferer`: call
`TransferData(data, playerIds)`, subscribe to its events, read `LastData` when a transfer
completes. Everything on the intermediate pages exists to explain *why* `DataTransferer`
behaves the way it does under failure conditions (a player leaving mid-transfer, an
ownership handover between chunks, a malicious direct call to one of the network-callable
methods), not to hand you a separate API surface at each layer.
