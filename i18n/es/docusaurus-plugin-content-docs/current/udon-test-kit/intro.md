---
id: intro
title: Udon Test Kit
sidebar_position: 1
---

# Udon Test Kit

Udon Test Kit te permite probar un mundo de VRChat con Unity Test Framework. Los tests de modo Play
ejecutan una sesión real de ClientSim con jugadores `VRCPlayerApi` reales, y el kit resuelve los
problemas del VRChat SDK y de ClientSim que de otro modo rompen esos tests.

Un test extiende `ClientSimTestBase` e inicia su `Session`. A partir de ahí puede crear y quitar
jugadores remotos, elegir quién es el master, darle un dueño a cualquier GameObject y comprobar qué
hicieron tus behaviours con todo eso. Cada test puede ejecutarse en una escena propia, incluida la
escena de tu propio mundo. Los spies registran las llamadas que tu código hace por nombre de
método, como `SendCustomEvent`, y un elemento de menú crea en un solo paso los assemblies de test
que necesita un mundo.

El kit solo se compila cuando Unity Test Framework incluye los tests, así que nada de él llega a la
build de un mundo. Funciona en cualquier mundo hecho con UdonSharp, con o sin TsVRC. Las
herramientas de testing de TsVRC se apoyan en él: si tu mundo usa el framework, consulta también
[Probar tu mundo](/docs/tsvrc/testing/testing-your-world).
