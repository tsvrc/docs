---
id: codegen-vs-reflection
title: "Decision note: codegen instead of runtime reflection"
sidebar_position: 1
---

# Decision note: codegen instead of runtime reflection

TsVRC resolves a project's own concrete types — which class is your `Instance` subclass,
which behaviours are registered as Constructs, which prefabs are pooled — once, at edit
time, and bakes the result into generated C# with direct field references and typed
accessors. A framework built the same way in ordinary C# would more commonly reach for
runtime reflection or a dependency-injection container to do this lookup dynamically,
lazily, whenever it's actually needed. TsVRC doesn't have that option, for a concrete,
checkable reason: the runtime environment it targets doesn't support it.

## What Udon-compiled code can't do

UdonSharp compiles against a fixed set of APIs the Udon VM exposes ("externs"), determined
by walking the .NET type system at compile time — not at the compiled program's own runtime.
`System.Reflection` is not part of that exposed surface: nothing in a compiled Udon program
can inspect its own or another type's members, invoke a method by name, or otherwise do at
runtime what a normal C# program's `System.Reflection` would let it do. (The reflection
calls you'll find inside UdonSharp's own tooling — for example, on the Editor-side proxy
object every `UdonSharpBehaviour` has — run in the Unity Editor's own C# context while
compiling or inspecting a script; they never execute as part of the compiled Udon bytecode
itself.)

Generics compound the problem: per UdonSharp's own documentation, generic classes and
generic non-static methods don't work in Udon. A typical reflection-or-DI-based framework
leans on both together — reflect over a type, then resolve or construct it generically. With
neither tool available in compiled Udon code, that whole approach is closed off, not just
inconvenient.

Object creation is restricted the same way: Udon's compiled `Instantiate` surface only
exposes a plain, non-generic `GameObject Instantiate(GameObject original, ...)` — there's no
generic `Instantiate<T>()` that hands back an arbitrary, runtime-determined component type.
Reading a component back off a freshly instantiated object has the same limitation, which is
part of why generated factory code (see [`FactoryModule`](../codegen/modules/factory-module))
resolves its type at generation time and emits a concrete, non-generic
`GetComponent<ConcreteType>()` call rather than anything parameterized.

## What TsVRC does instead

None of that machinery exists in compiled Udon, but all of it is perfectly ordinary,
supported C# in the Unity Editor, where TsVRC's own reflection happens — scanning loaded
assemblies for an `Instance` subclass, or a class tagged
[`[TsWorldExtensionPoint]`](../core-concepts/attributes.md), runs entirely in the editor's own C#
runtime, at generate time, never inside a compiled UdonSharpBehaviour. The generator does
the type resolution once, while it still has full reflection and generics available to it,
and writes the *result* — a concrete field, a concrete property, a concrete method
signature — as plain generated code that the Udon compiler then compiles like any other
UdonSharp script. By the time a world is actually running, there's no lookup left to do at
all: `_ts.Name` is a real, direct field access, not a dictionary lookup or a reflected member
access, because the framework already did that resolution before the world was ever built.
