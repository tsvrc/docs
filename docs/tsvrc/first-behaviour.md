---
id: first-behaviour
title: Build your first behaviour
sidebar_position: 2
---

# Build your first behaviour

This walks you through adding TsVRC to a Unity project and getting one script running in
play mode. By the end you'll have a world-specific behaviour that TsVRC constructs at
startup and that logs through the framework's own logger.

## Prerequisites

You need a Unity project with the VRChat Creator Companion set up and the VRChat Worlds
SDK already added. TsVRC targets Unity 2022.3 and depends on the Worlds SDK, so add TsVRC
through VCC rather than copying files in by hand — that's what resolves the SDK version it
needs.

## Add the package

Add `com.tsvrc.core` to your project through VCC. Once it's imported, Unity gains a
**Tsvrc** menu in the menu bar; everything below runs from there.

## Initialize TsVRC in your scene

Open **Tsvrc > Configure**. On a scene that hasn't used TsVRC before, the window tells you
it isn't set up yet and offers a single button: **Initialize Tsvrc**. Click it.

That button runs the same code generation pass you'll trigger again every time you add
something new later (its label switches to **Force Regenerate** afterward). It writes a
generated root script for your project and compiles it. Wait for Unity to finish
recompiling before continuing — the Configure window shows a "waiting for scripts to
compile" message while that's in progress.

## Write your behaviour

TsVRC generates a project-specific subclass of its internal root types so your code gets a
typed `_ts` reference back to your own project instead of a generic one. That means your
script extends the generated shadow class, not the framework class it shadows. For an
ordinary behaviour, that shadow class is called `TsBehaviour`:

```csharp
using Tsvrc.Core.Generated;

public class HelloWorld : TsBehaviour
{
    protected override void TsStart()
    {
        LogInfo("HelloWorld constructed.");
    }
}
```

`TsStart` is the framework's initialization hook, called once per instance. `LogInfo`
routes through TsVRC's own logger instead of `Debug.Log`, so the message respects whatever
log levels you've configured in **Tsvrc > Configure > Logging**.

Attach `HelloWorld` to a GameObject in your scene.

## Register it as a construct

Adding the component to the scene isn't enough by itself — TsVRC only calls `TsStart` on
behaviours it's been told about. Back in **Tsvrc > Configure**, open the **Constructs**
tab and add your `HelloWorld` GameObject. This makes TsVRC call `TsStart` on it once at
world startup. The reference itself stays private: if another behaviour needs to reach
`HelloWorld` directly, wire it in the Inspector like any other field, or register it as a
[Global](./codegen-configuring/global-module) instead if you want it reachable as
`_ts.HelloWorld`.

Click **Force Regenerate** (or let the automatic regeneration pick up the change — TsVRC
watches for edits to its config and reruns on its own in most cases).

## Run it

Enter play mode. You should see `HelloWorld constructed.` in the console, tagged with the
`HelloWorld` class name. If you don't see it, reopen **Tsvrc > Configure** and check for a
warning banner — the window surfaces the generator's own warnings and errors there instead
of leaving you to search the console for them.

## Where to go next

Read [How TsVRC fits together](./core-concepts/how-it-fits-together) for the bigger picture behind what
just happened: why there's a generation step at all, and how the pieces you touched here
(the root object, the construct registration, the generated shadow class) relate to each
other.
