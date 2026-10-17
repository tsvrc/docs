---
id: private-field-access
title: PrivateFieldAccess
sidebar_position: 8
---

# PrivateFieldAccess

`Tsvrc.UdonTestKit.PrivateFieldAccess` reads and writes fields, and calls methods, by name on any
object or type, whatever their access level. Use it to arrange or check state that the public
members of a behaviour don't expose, without making that state public just for a test.

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
| `GetField<T>(object target, string fieldName)` | Returns the value of an instance field as `T`. |
| `GetField<T>(Type staticType, string fieldName)` | Returns the value of a static field as `T`. |
| `InvokeInstance(object target, string methodName, params object[] args)` | Calls an instance method and returns its result. |
| `InvokeStatic(Type staticType, string methodName, params object[] args)` | Calls a static method and returns its result. |

For a static class, pass `typeof(MyStaticClass)` as the type.

## Lookup

Each call looks for the member on the type of the target, then on each base class in turn, and
takes the first match, public or not. `Type.GetField` and `Type.GetMethod` alone don't find a
private member declared on a base class, which is the usual case for state a framework base class
keeps.

A method with overloads is called through the one the arguments fit, the most specific one when
several fit, on the type or the nearest base class with an overload that takes them. A null
argument fits a parameter of a reference type or a nullable value type. Passing `null` as the whole
argument array, as in `InvokeInstance(timer, "Reset", null)`, passes one null argument.

## Failure modes

- A name that isn't found on the type or any base class fails the test with a message such as
  `Field '_remaining' not found on Timer.`, so a test that uses a renamed member fails.
- Arguments that no overload of the method takes fail the test with a message such as
  `Method 'Tick' on Timer takes none of these arguments.` A method with type parameters takes none,
  since a call by name can't give it type arguments.
- Two overloads that take the arguments equally well fail the test with a message such as
  `Method 'Tick' on Timer has overloads that take these arguments equally well.`
- `GetField<T>` casts the value to `T`, so a wrong `T` throws `InvalidCastException`.
- An exception thrown by a method called through `InvokeInstance` or `InvokeStatic` reaches the
  test wrapped in a `TargetInvocationException`; its `InnerException` is the original.
