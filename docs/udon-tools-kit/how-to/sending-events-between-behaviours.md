---
id: sending-events-between-behaviours
title: Send events between behaviours
sidebar_position: 1
---

# Send events between behaviours

An [EventEmitter](../reference/event-emitter) lets one behaviour tell others that something
happened, without either one referencing the other. Both reference the emitter instead.

1. Add an `EventEmitter` component to a GameObject in your scene.
2. Write the behaviour that emits. It names the event with a constant its listeners can use:

   ```csharp
   using Tsvrc.UdonToolsKit.Events;
   using UdonSharp;
   using UnityEngine;

   public class Scoreboard : UdonSharpBehaviour
   {
       public const string ScoredEvent = "Scored";

       [SerializeField] private EventEmitter _events;

       public void AddPoints(int points)
       {
           _events.Emit(ScoredEvent, points);
       }
   }
   ```

3. Write a behaviour that listens. It subscribes one of its public methods, and reads the value the
   emit carried from `Payload` inside that method:

   ```csharp
   using Tsvrc.UdonToolsKit.Events;
   using UdonSharp;
   using UnityEngine;

   public class ScoreDisplay : UdonSharpBehaviour
   {
       [SerializeField] private EventEmitter _events;

       private void Start()
       {
           _events.Subscribe(this, Scoreboard.ScoredEvent, nameof(_OnScored));
       }

       // Starts with _ so remote players can't call it as a network event.
       public void _OnScored()
       {
           Debug.Log($"Scored {_events.Payload.Int} points");
       }
   }
   ```

4. In the inspector, set the `Events` field of both behaviours to the GameObject with the
   `EventEmitter`.

When something calls `AddPoints(5)`, the display logs "Scored 5 points".

Use `nameof` for the callback name: the emitter calls it by name, and a name with a typo is skipped
without an error. The emitter delivers only on the client of the player who emits; it doesn't send
anything over the network.
