---
id: building-a-list-ui
title: Build a paginated list UI
sidebar_position: 15
---

# Build a paginated list UI

How to show a scrollable, paginated list of rows (a leaderboard, a settings list, a
roster) that reuses a fixed pool of row instances instead of instantiating one per
entry, using [`TsvrcList`](../ui-components/list/tsvrc-list) and
[`ListItem`](../ui-components/list/list-item).

## Steps

1. In the scene, add a `TsvrcList` next to a `ScrollRect`. Assign the `ScrollRect`'s
   `Content` transform as its item container, a prefab carrying your `ListItem`
   subclass as its item prefab, and a page size (or `-1` to show every row without
   pagination) in the Inspector.
2. Subclass `ListItem` to populate one row from its bound data:

   ```csharp
   public class LeaderboardRow : ListItem
   {
       [SerializeField] private TextMeshProUGUI _nameText;
       [SerializeField] private TextMeshProUGUI _scoreText;

       protected override void _OnBind()
       {
           _nameText.text = _itemData.GetValue("name").String;
           _scoreText.text = _itemData.GetValue("score").Int.ToString();
       }
   }
   ```

   Wire the row prefab's own button, if it has one, to call `_OnItemPressed()` from its
   `OnClick`. That's what tells the owning list which row was selected.

3. Feed it data and react to a selection:

   ```csharp
   public class LeaderboardController : TsBehaviour
   {
       [SerializeField] private TsvrcList _list;

       protected override void TsStart()
       {
           _list.TsSubscribe(this, TsvrcList.OnItemSelectedEvent, nameof(_OnRowSelected));
       }

       public void ShowLeaderboard(DataList entries) => _list.SetData(entries);

       public void _OnRowSelected() => LogInfo("Selected index " + _list.SelectedIndex);
   }
   ```

4. Move between pages with `_list.NextPage()`/`PreviousPage()`, and check
   `_list.HasNextPage`/`HasPreviousPage` to enable or disable your own page buttons.

## Showing a loading state

Call `_list.SetLoadingState()` before you have data ready (while waiting on a
[`DataTransferer`](./transferring-data-between-clients) or similar), then `SetData` once
it arrives. Passing `null` or an empty list to `SetData` shows the empty state instead,
if one's assigned in the Inspector.

## Why this shape

See [`TsvrcList`](../ui-components/list/tsvrc-list) and
[`ListItem`](../ui-components/list/list-item)'s reference pages for exactly how row
instances get reused across pages instead of destroyed and recreated, and what
`Bind`/`Unbind` guarantee about `_itemData`'s lifetime inside `_OnUnbind`.
