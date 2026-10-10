---
id: private-field-access
title: PrivateFieldAccess
sidebar_position: 5
---

# PrivateFieldAccess

`Tsvrc.UdonTestKit.PrivateFieldAccess` reads and writes fields, and calls methods, by name on any object
or type, whatever their access level. Use it to arrange or check state that a behaviour's public
members don't expose, without making that state public just for a test.

```csharp
int remaining = PrivateFieldAccess.GetField<int>(timer, "_remainingSeconds");
PrivateFieldAccess.SetField(timer, "_remainingSeconds", 1);
PrivateFieldAccess.InvokeInstance(timer, "Tick");
```

It works in Edit Mode and Play Mode tests.

## Members

| Member | Does |
| --- | --- |
| `SetField(object target, string fieldName, object value)` | Sets an instance field. |
| `SetField(Type staticType, string fieldName, object value)` | Sets a static field. |
| `GetField<T>(object target, string fieldName)` | Returns an instance field's value as `T`. |
| `GetField<T>(Type staticType, string fieldName)` | Returns a static field's value as `T`. |
| `InvokeInstance(object target, string methodName, params object[] args)` | Calls an instance method and returns its result. |
| `InvokeStatic(Type staticType, string methodName, params object[] args)` | Calls a static method and returns its result. |

For a static class, pass `typeof(MyStaticClass)` as the type.

## Lookup

Each call looks for the member on the target's type, then on each base class in turn, and takes
the first match, public or not. `Type.GetField` and `Type.GetMethod` alone don't find a private
member declared on a base class, which is the usual case for state a framework base class keeps.

## Failure modes

- A name that isn't found on the type or any base class fails the test with a message such as
  `Field '_remaining' not found on Timer.` A renamed member shows up as a failing test, not as a
  silent no-op.
- Methods are found by name alone. A type that declares several overloads of the method throws
  `AmbiguousMatchException`.
- `GetField<T>` casts the value to `T`, so a wrong `T` throws `InvalidCastException`.
- An exception thrown by a method called through `InvokeInstance` or `InvokeStatic` reaches the
  test wrapped in a `TargetInvocationException`; its `InnerException` is the original.
