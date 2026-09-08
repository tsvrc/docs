---
id: list-item
title: ListItem
sidebar_position: 2
---

# ListItem

`Tsvrc.UI.ListItem` is the base class for a single row in a [`TsvrcList`](./tsvrc-list).
Its generated shadow is `TsListItem`. You don't create or destroy instances yourself —
`TsvrcList` instantiates, binds, unbinds, and destroys them as its pool and pagination
require.

## Usage

Subclass it and override the two lifecycle hooks:

```csharp
public class MyRow : TsListItem
{
    protected override void _OnBind()
    {
        // _itemData, _dataIndex are populated here; populate your UI children from them.
    }

    protected override void _OnUnbind()
    {
        // _itemData and _dataIndex are STILL valid here — clear UI state before they're cleared.
    }
}
```

`_OnBind` runs when `TsvrcList` assigns this instance a row of data (`_itemData`, a
`DataDictionary`, and `_dataIndex`, its position in the full data list — not necessarily its
position on the current page). `_OnUnbind` runs when the list is done with this instance,
before `_dataIndex`/`_itemData` are actually cleared, so your override can still read them
one last time if cleanup needs to reference which row it was.

`IsBound` reports whether the item currently holds live data — `false` between
`Unbind()` and the next `Bind()` call, useful for guarding UI logic that shouldn't run on a
pooled-but-currently-unbound instance.

## Wiring selection

Wire `_OnItemPressed` to a `Button`'s `onClick`. It's a no-op if the item isn't currently
bound (guards against a stray press on a pooled item mid-transition) — otherwise it calls
back into the owning list's `OnItemSelected(dataIndex)`, which is what actually records the
selection and emits `TsvrcList.OnItemSelectedEvent`. `ListItem` itself never emits that event
directly; it only triggers the list's own handling of it.
