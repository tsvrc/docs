---
id: event-emitter
title: EventEmitter
sidebar_position: 1
---

# EventEmitter

`Tsvrc.UdonToolsKit.Events.EventEmitter` is an UdonSharp component that delivers named events from
publishers to the behaviours subscribed to them. A publisher and its listeners each reference the
same emitter, so neither references the other.
[Send events between behaviours](../how-to/sending-events-between-behaviours) walks through it.

## Members

- `Subscribe(UdonSharpBehaviour listener, string eventName, string callbackName)` subscribes the
  listener to the event, so each emit of it calls the public method `callbackName` on the listener.
  The subscription lasts until `Unsubscribe` removes it or the listener is destroyed. Subscribing
  the same listener twice gives two calls per emit.
- `Unsubscribe(UdonSharpBehaviour listener, string eventName, string callbackName)` removes one
  subscription with that listener, event and callback, and does nothing when there's none.
- `Emit(string eventName)` emits the event without a payload.
- `Emit(string eventName, DataToken payload)` emits the event with a payload. To pass several
  values, put them in a `DataList` or `DataDictionary`.
- `Payload` is the payload of the emit being delivered, for a listener to read in its callback. Its
  `TokenType` is `Null` for an emit without one.
- `MaxQueuedEmits` is how many emits one delivery can queue: 100.

## Delivery

An emit calls each listener subscribed to its event, in the order they subscribed.

- An emit made while the emitter is delivering, such as by one of its listeners, is delivered after
  the current one, with its own payload, in the order it was made.
- A listener that subscribes during a delivery is called from the next emit on.
- A listener unsubscribed during a delivery isn't called by it if it hasn't been called yet.
- Each listener reads the payload of the emit, even when a listener before it wrote to `Payload`.
  Once the delivery ends, `Payload` is a `Null` token again.

## Failure modes

- `Subscribe` with a listener that isn't valid, or an empty event or callback name, logs an error
  and subscribes nothing. `Emit` with an empty event name logs an error and emits nothing.
- A callback name the listener has no public method for is skipped, with no error. Use `nameof`.
- A listener that throws doesn't stop the delivery: the emitter goes on to the next listener.
- A listener destroyed after subscribing is skipped, and its subscription is dropped.
- When more than `MaxQueuedEmits` emits are made during one delivery, the emitter drops them and
  any later one until the delivery ends, with one error. Listeners that keep emitting during a
  delivery, such as two that emit in response to each other, cause this.

## Networking

The component has
[sync mode None](https://creators.vrchat.com/worlds/udon/udonsharp/attributes/#behavioursyncmode),
which network events don't reach, so no player can call it over the network. Emits are delivered on
the client of the player who emits. Start the names of callbacks with `_`, so remote players can't
call them as network events either; see
[legacy events and security](https://creators.vrchat.com/worlds/udon/networking/events/#legacy-events-and-security).
