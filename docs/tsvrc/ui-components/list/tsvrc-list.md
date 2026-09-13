---
id: tsvrc-list
title: TsvrcList
sidebar_position: 1
---

# TsvrcList

`Tsvrc.UI.TsvrcList` is a pooled, paginated list view: it instantiates one
[`ListItem`](./list-item) per visible row rather than one per data entry, so a list backed
by thousands of rows only ever pays for however many are on screen at once. Its generated
shadow is `TsList`. Local-only and unsynced: each client's own list state is independent.
See [Build a paginated list UI](../../how-to/building-a-list-ui) for a task-oriented
walkthrough.

## Setup

Wire up in the inspector: `_itemContainer` (typically a `ScrollRect`'s `Content` transform)
and `_itemPrefab` (a prefab carrying a `ListItem` component). Set `_pageSize` to a positive
number to paginate, or `-1` to load every item on one page with no pagination at all.

## Usage

```csharp
list.SetData(dataList); // a VRC.SDK3.Data.DataList of DataDictionary entries
```

The list is always in one of three states, read via `ListState`: `STATE_LOADING`,
`STATE_EMPTY`, or `STATE_POPULATED`. `SetData` resets to the first page and picks between the
latter two based on what it's given: `STATE_EMPTY` if called with `null` or a zero-length
list (shows the empty indicator), `STATE_POPULATED` otherwise (rebuilds the item pool for the
current page). `SetData` never enters `STATE_LOADING`; only `SetLoadingState()` does that,
destroying all live items and showing the loading indicator if one is wired up.
`SelectedIndex`, `CurrentPage`, and
`PageCount` are all readable, along with `HasNextPage`/`HasPreviousPage` for wiring up
pagination controls (`NextPage()`/`PreviousPage()` call `SetPage` for you, and are no-ops at
either end of the range).

Each list entry is expected to be a `DataDictionary` token; a non-dictionary entry at a given
index is silently treated as an empty dictionary rather than causing an error, so a
`ListItem`'s `_OnBind` override should be written defensively against missing keys either
way.

## Selection

A [`ListItem`](./list-item) calls back into `OnItemSelected(dataIndex)` when pressed.
`TsvrcList` records the index and emits `OnItemSelectedEvent` via `TsEmit`, so anything
elsewhere in your world can subscribe via `TsSubscribe` rather than needing a direct
reference to the specific pressed item. `ClearSelection()` resets `SelectedIndex` to `-1`
without touching anything else.

## Pool rebuild behavior

`SetPage`, `SetData`, and `SetLoadingState` all destroy every currently-live `ListItem`
(calling `Unbind()` on each first) before creating whatever the new state needs. There's no
attempt to diff and reuse items across a page change or state transition. This keeps the
pooling logic simple at the cost of a full rebuild on every page turn; if a prefab's
`_OnBind`/`_OnUnbind` are expensive, that cost is paid on every page change, not just once.
A prefab instance that comes back from `Instantiate` without a `ListItem` component attached
is destroyed immediately and skipped, rather than left in the pool in a broken state.
