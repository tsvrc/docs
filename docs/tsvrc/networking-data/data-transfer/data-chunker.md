---
id: data-chunker
title: DataChunker
sidebar_position: 1
---

# DataChunker

`Tsvrc.DataTransfer.DataChunker` is a [ReadyCheckProcess](../../players-tracking/ready-check-process)
with no network or process state of its own: it only splits and validates string data,
purely as instance methods other classes in the chain call. It's the first link past
`ReadyCheckProcess` and exists to isolate the chunking math from everything that actually
moves chunks over the network. You never call it directly. See
[DataTransferer](./data-transferer) for the type a consumer actually uses.

## Public surface (all `protected`, for subclasses)

- **`ValidateMessage(message)`** — rejects a `null`/empty message (logs a warning) or one
  longer than `MAX_MESSAGE_SIZE` (500,000 characters; logs an error). Returns whether the
  message is safe to transfer.
- **`CreateDataChunks(data)`** — splits a string into an ordered array of chunks, each at
  most `CHUNK_SIZE` characters.
- **`CalculateTotalChunks(dataLength)`** / **`ExtractChunk(data, chunkIndex)`** — the
  underlying math, exposed separately so a subclass can compute chunk count without
  materializing every chunk, or extract one chunk on demand.

## Why CHUNK_SIZE is 2500, specifically

This is a real, checked constant, not a round number. VRChat caps the [total parameter size
of a single network
event](https://creators.vrchat.com/worlds/udon/networking/events/#parameter-size-limits-and-event-splitting)
at 16 KB (16,384 bytes), and the chunk-delivery event (`BroadcastDataChunkReceived`, defined
further up the chain) carries four parameters: the chunk string, its index, the total count,
and the target player ID array. The chunk string dominates that budget, encoded as UTF-8,
which means the true worst case isn't emoji (2 UTF-16 chars but only 4 UTF-8 bytes, i.e. 2
bytes/char) but CJK text in the U+0800-U+FFFF range, which costs 3 bytes per character. The
player ID array adds its own cost: IDs are `displayName#playerId` strings, and a busy
session with player turnover can produce 3-digit numeric IDs well past the concurrent
player cap (IDs are assigned in increasing order and never reused). The worst-case
calculation also assumes a 32-character CJK display name as a deliberately generous bound
(VRChat doesn't publish an official display name length limit), putting one player ID
entry's cost at 104 bytes. Worked out for a worst-case
80-player, all-CJK-name, all-CJK-data transfer, 2500 characters per chunk lands at roughly
15,828 of the 16,384 available bytes: close to the ceiling but safely under it. The same
math at `CHUNK_SIZE = 3000` already breaks the limit at 71 CJK-named players (16,392 bytes,
over the cap). An oversized event doesn't throw or degrade. VRChat silently drops it, the
receiver never acknowledges it, and the transfer stalls with no error anywhere. If you ever
need to change `CHUNK_SIZE`, redo this calculation against your own worst-case name length
and player count rather than picking a new number by feel.
