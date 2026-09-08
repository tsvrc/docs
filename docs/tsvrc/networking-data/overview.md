---
id: data-transfer-overview
title: The data transfer chain
sidebar_position: 3
---

# The data transfer chain

`DataTransferer` — the type you actually use — is the last link in an eight-level
inheritance chain built on [Process](../core-concepts/process):
`Process → PlayerTracker → ReadyCheckProcess → DataChunker → ChunkedTransferSession →
DataSender → DataChunkReceiver → DataSenderReceiver → DataTransferer`. Each layer adds one
concern on top of the one below it, so this section documents them bottom-up in that same
order — reading `DataTransferer`'s page without the ones before it skips the reasoning
behind most of what it does.

## The problem being solved

VRChat's networking has a hard per-event payload limit (16 KB) and a global throughput cap,
so sending an arbitrary string to a set of players means splitting it into chunks, sending
them one at a time, and confirming each one actually arrived before sending the next — all
while players can join, leave, get suspended, or have ownership of the sending object
change mid-transfer. Each layer in the chain exists to handle one slice of that: chunking
the data, sequencing the chunks through a ready check, broadcasting lifecycle events,
validating and reassembling what arrives, and exposing a clean public API on top.

## What you actually use

Unless you're extending the chain itself, you only interact with `DataTransferer`: call
`TransferData(data, playerIds)`, subscribe to its events, read `LastData` when a transfer
completes. Everything on the intermediate pages exists to explain *why* `DataTransferer`
behaves the way it does under failure conditions — a player leaving mid-transfer, an
ownership handover between chunks, a malicious direct call to one of the network-callable
methods — not to hand you a separate API surface at each layer.
