---
id: tsvrc-logger
title: TsvrcLogger
sidebar_position: 4
---

# TsvrcLogger

`Tsvrc.Utils.TsvrcLogger` is TsVRC's centralized logging sink: a `TsvrcBehaviour` you reach
through `_ts.Log`, wrapping `Debug.Log`/`LogWarning`/`LogError` with a consistent message
format and independent on/off toggles per severity. Its generated shadow class is
`TsLogger`. Most code never calls it directly — prefer `TsvrcBehaviour`'s own `LogInfo`,
`LogWarning`, and `LogError` methods, which supply the tag and context automatically.

## Message format

Every message follows `[TsVRC] [prefix] [tag] message`, where:

- `TsVRC` is a fixed framework tag, always present, never configurable.
- `prefix` is your project's own optional tag (`Prefix`, empty by default) — set it once
  (for example to your world's name) to distinguish your logs from another package's in a
  shared console. Omitted entirely (no empty `[]`) when left blank.
- `tag` is the name of the class that logged the message.

Configure `Prefix` and the six enable toggles below either directly on the component or
through **Tsvrc > Configure > Logging**.

## The six toggles

Info, Warning, and Error are each independently gated by whether the call came from inside
the framework itself or from your world's own code — six toggles in total, all defaulting
to `true`:

| | Tsvrc internal | Your world |
|---|---|---|
| Info | `InternalInfoEnabled` | `WorldInfoEnabled` |
| Warning | `InternalWarningEnabled` | `WorldWarningEnabled` |
| Error | `InternalErrorEnabled` | `WorldErrorEnabled` |

Which column a message falls into is decided by the caller, not the message content: a
`TsvrcBehaviour` subclass reports itself as internal via `IsTsvrcInternal` (`true` for
framework classes like `Process` or `TsvrcMemory`, `false` by default, meaning every one of
your own scripts is "Your world" unless it deliberately opts in). Calling `Info`/`Warning`/
`Error` directly on the logger without going through a `TsvrcBehaviour` defaults
`isInternal` to `false`.

The two columns are independent: disabling `WorldInfoEnabled` doesn't touch
`InternalInfoEnabled`, and vice versa. Severity levels are independent of each other too —
turning off Info logging entirely still lets Warning and Error through.

## What happens before construction

`TsvrcBehaviour.LogInfo`/`LogWarning`/`LogError` read `_ts.Log`, which is `null` until
`TsConstruct` has run. Called before that point, they fall back to calling
`Debug.Log`/`LogWarning`/`LogError` directly, using the same message format with an empty
prefix — but that fallback path bypasses every one of the six toggles above, since there's
no `TsvrcLogger` instance yet to check them against. A message logged before construction
always prints, regardless of how logging is configured.

## Usage

From inside any `TsvrcBehaviour` subclass, log through the inherited wrappers rather than
touching `_ts.Log` directly:

```csharp
public class GameManager : TsBehaviour
{
    private void StartRound()
    {
        LogInfo("Round started");
        if (_players.Length == 0)
        {
            LogWarning("Starting a round with no players registered");
        }
    }
}
```

`LogInfo`/`LogWarning`/`LogError` fill in the `[GameManager]` tag and the "Your world"
column automatically — see the toggle table above for what controls whether this message
actually prints.

## Edge case worth knowing

Calling `Info`/`Warning`/`Error` on the logger directly, rather than through a
`TsvrcBehaviour`'s wrappers, means you supply your own `tag` string and `isInternal` value
by hand — there's no automatic class-name tag or `IsTsvrcInternal` lookup at that layer.
