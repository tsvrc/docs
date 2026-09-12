---
id: first-behaviour
title: Build your first behaviour
sidebar_position: 2
---

# Build your first behaviour

This walks you through initializing TsVRC in a scene and getting one script running in
play mode. By the end you'll have a world-specific behaviour that TsVRC constructs at
startup and that logs through the framework's own logger.

This assumes TsVRC is already installed. See [Add TsVRC to your
project](./add-to-your-project) first if your project doesn't have a **Tsvrc** menu in
the menu bar yet.

## Initialize TsVRC in your scene

Save your scene first. Open **Tsvrc > Configure**: on a scene that hasn't used TsVRC
before, the window tells you it isn't set up yet and offers a single button:
**Initialize Tsvrc**. Click it.

That button runs the same code generation pass you'll trigger again every time you add
something new later (its label switches to **Force Regenerate** afterward). It writes a
generated root script for your project and compiles it. Wait for Unity to finish
recompiling before continuing: the Configure window shows a "waiting for scripts to
compile" message while that's in progress.

This first run also links this scene to TsVRC, since only a saved scene has a file path
to link to. TsVRC reads its configuration from exactly that one linked scene from now on,
no matter what else is open. If your project uses more than one scene, see
[TsLinkedScene](./codegen/config/linked-scene) before you go further.

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

Adding the component to the scene isn't enough by itself: TsVRC only calls `TsStart` on
behaviours it's been told about. Back in **Tsvrc > Configure**, open the **Constructs**
tab and click **+ Add**. With `HelloWorld`'s GameObject selected, drag its `HelloWorld`
component (from the Inspector, not the GameObject from the Hierarchy) into the new slot.
TsVRC needs the actual component reference here and silently rejects anything else, a
GameObject included, with a console warning, so dropping the GameObject by mistake looks
like nothing happened.

Registering it here is what makes TsVRC call `TsStart` on it once at world startup. The
reference itself stays private: if another behaviour needs to reach `HelloWorld` directly,
wire it in the Inspector like any other field, or register it as a
[Global](./codegen/modules/global-module) instead if you want it reachable as
`_ts.HelloWorld`.

A footer appears at the bottom of the window once you've made this change: "You have
unapplied changes." Click **Apply** there. That single click both saves the entry and
runs codegen, so you don't need **Force Regenerate** afterward too, and can't: it's
disabled while a change is still unapplied.

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
