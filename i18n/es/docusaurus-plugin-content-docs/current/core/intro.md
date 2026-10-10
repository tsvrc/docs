---
id: intro
title: TsVRC Core
sidebar_position: 1
---

# TsVRC Core

TsVRC Core es un framework de código abierto, mantenido por la comunidad, para crear mundos de
VRChat con UdonSharp: inicialización estructurada, conexión de dependencias y
generación de código en el editor (codegen) que escribe ese código de conexión por ti,
sobre el VRChat Worlds SDK.

:::warning[Experimental y pre-1.0]
Core es un experimento, y herramientas de programación con IA generaron parte de sus funciones. No
está hecho por completo con vibe coding, pero la IA tuvo una gran participación al escribirlo.
Además, todavía es pre-1.0: todo lo documentado aquí, incluyendo el comportamiento de casos límite
en las páginas de referencia, describe lo que el código hace hoy, no un contrato de API cerrado.

Prueba el comportamiento del que depende tu mundo antes de publicarlo. Si buscas proyectos listos
para usar, mira [Udon Test Kit](/docs/udon-test-kit/intro) y
[Udon Tools Kit](https://github.com/tsvrc/udon-tools-kit).
:::

## ¿Eres nuevo en Core?

Empieza por [Añade TsVRC Core a tu proyecto](./add-to-your-project) y luego
[Construye tu primer behaviour](./first-behaviour): al final tendrás un script
funcionando en modo Play.

## ¿Ya lo usas?

Ve directo a lo que necesitas:

- **Resolver una tarea concreta** —
  [agrupar un prefab en un pool](./how-to/pooling-a-prefab),
  [mostrar las posiciones de los jugadores](./how-to/showing-player-positions),
  [transferir datos entre clientes](./how-to/transferring-data-between-clients) o
  [conectar un ready check](./how-to/wiring-a-ready-check).
- **Buscar el comportamiento de un tipo concreto** — busca su nombre, empieza por
  [Cómo encaja Core](./core-concepts/how-it-fits-together) y sigue sus enlaces, o
  explora Reference en la barra lateral, agrupado por área: jugadores, red, UI, codegen,
  etc.
- **Entender por qué Core funciona como funciona** —
  [Codegen en vez de reflexión](./explanations/codegen-vs-reflection) y el resto de
  páginas en Explanations.
