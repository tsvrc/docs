---
id: ts-array
title: TsArray
sidebar_position: 2
---

# TsArray

`Tsvrc.Utils.TsArray` is a static helper class for array operations that Udon can't express
generically. UdonSharp doesn't support generic methods, so there's no single `Add<T>` —
instead `TsArray` overloads each operation for `string[]` and `UdonSharpBehaviour[]`, the
two element types TsVRC itself needs this for.

## What it's for

Every method allocates and returns a new array; none of them mutate their inputs. That
makes them safe to call on an array you're still holding a reference to elsewhere, at the
cost of an allocation per call — don't reach for these in a tight per-frame loop over large
arrays.

## Methods

- **`Add(original, items)`** — returns a new array with every element of `original`
  followed by every element of `items`.
- **`Remove(original, items)`** — returns a new array with every occurrence of any element
  in `items` removed from `original`. All matches are removed, not just the first, and
  order is preserved.
- **`Contains(array, value)`** — returns whether `value` is present in `array`, compared by
  `==` (reference equality for `UdonSharpBehaviour[]`, value equality for `string[]`).
- **`Dedupe(original)`** *(strings only)* — returns a new array with repeated values
  collapsed to their first occurrence, order preserved.

## Usage

```csharp
private string[] _activeTags = new string[0];

public void AddTag(string tag)
{
    if (!TsArray.Contains(_activeTags, tag))
    {
        _activeTags = TsArray.Add(_activeTags, new[] { tag });
    }
}

public void RemoveTag(string tag)
{
    _activeTags = TsArray.Remove(_activeTags, new[] { tag });
}
```

Each call reassigns `_activeTags` to the returned array rather than mutating it in place —
skipping the reassignment silently keeps the old array, since nothing here mutates it.

## Edge cases worth knowing

- **No null guards.** Passing `null` for any array parameter throws
  `NullReferenceException` — these methods trust the caller, they don't validate input.
- **Always allocates, even when nothing changes.** `Remove` with no matches and `Dedupe`
  with no duplicates still return a new array instance, never the original reference. Code
  that relies on reference equality to detect "nothing changed" will not see it that way.
- **`null` is a comparable value, not a special case.** `Contains(array, null)` matches a
  literal `null` element in the array, and `Dedupe` treats `null` as a value it can
  deduplicate like any other.
- **Zero-length inputs behave like any other array** — no special-cased fast path, just an
  empty result where you'd expect one.
