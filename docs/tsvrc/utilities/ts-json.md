---
id: ts-json
title: TsJson
sidebar_position: 3
---

# TsJson

`Tsvrc.Utils.TsJson` is a static helper class for converting VRChat's `DataDictionary` and
`DataToken` types to and from JSON, built on top of `VRCJson`. It exists to give the rest of
TsVRC a smaller, consistent surface than calling `VRCJson`'s `Try...` methods directly
everywhere a serialization step is needed.

## Methods

- **`Serialize(DataDictionary)`** / **`Deserialize(string)`** — convert a dictionary to and
  from a minified JSON string.
- **`SerializeToken(DataToken)`** / **`DeserializeToken(string)`** — the same, but for a raw
  `DataToken`, which can hold a dictionary, a list, or (on serialize) any other token type.
- **`Clone(DataDictionary)`** — deep-clones a dictionary by serializing it and immediately
  deserializing the result. Nested dictionaries and lists inside it are copied too, not
  shared by reference, exactly as if you'd round-tripped through JSON yourself.

## Usage

```csharp
var payload = new DataDictionary();
payload.SetValue("round", new DataToken(3));
payload.SetValue("mapName", new DataToken("Arena"));

string json = TsJson.Serialize(payload);   // send this over the network or into TsvrcMemory
DataDictionary restored = TsJson.Deserialize(json);
if (restored != null)
{
    int round = restored.GetValue("round").Int;
}
```

Always check `Deserialize`'s result for `null` before reading from it — see the failure
table below for why a bad string never throws instead.

## Failure handling

None of these methods throw on bad input. Every failure path logs an error through
`TsvrcLogger.Format` (tagged `[TsJson]`) and returns a safe empty value instead:

| Method | On failure, returns |
|---|---|
| `Serialize` | `string.Empty` |
| `Deserialize` | `null` |
| `SerializeToken` | `string.Empty` |
| `DeserializeToken` | `default(DataToken)` |
| `Clone` | `null` |

This means a caller that doesn't check the return value silently gets an empty string or a
null dictionary rather than an exception. If you're persisting the result (for example into
`TsvrcMemory`), check for `null`/empty before storing it.

## Edge cases worth knowing

- **`null` and empty string are rejected before ever reaching `VRCJson`** — both log
  `"Cannot deserialize null or empty JSON string."` But a **whitespace-only** string is not
  caught by that same guard (`string.IsNullOrEmpty(" ")` is `false`), so it falls through to
  `VRCJson`, fails to parse there instead, and logs a different message
  (`"Failed to deserialize JSON string..."`). Both end in `null`/default, but if you're
  matching on the exact log message, the two cases aren't interchangeable.
- **A bare scalar is not valid top-level JSON.** `VRCJson` requires an object or array at
  the top level, so deserializing `"5"` fails to parse entirely — it does not succeed with a
  non-dictionary/non-list token.
- **`Deserialize` additionally rejects anything that isn't a `DataDictionary`.** Valid JSON
  that parses to an array (`"[1,2,3]"`) still fails `Deserialize` (wrong shape) even though
  the same string succeeds through `DeserializeToken`.
- **`Clone(null)` logs twice.** It's implemented as `Deserialize(Serialize(original))`, so a
  `null` input fails `Serialize` (logs once, returns `""`) and then fails `Deserialize` on
  that empty string (logs again, returns `null`) — one call, two distinct error log lines.
