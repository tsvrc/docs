---
id: intro
title: TsVRC
sidebar_position: 1
---

# TsVRC

TsVRC es un framework independiente, mantenido por la comunidad, para crear mundos de
VRChat con UdonSharp: inicialización estructurada, conexión de dependencias y
generación de código en el editor sobre el VRChat Worlds SDK.

:::note
TsVRC no está afiliado ni respaldado por VRChat Inc.
:::

## Empieza aquí

Si eres nuevo en TsVRC, sigue [Construye tu primer behaviour](./first-behaviour) para
tener un script funcionando en modo Play al final, apoyándote en
[Paquete y requisitos](./package) para saber de qué depende.

Si ya lo usas y buscas algo concreto:

- **Una tarea que quieres resolver** —
  [agrupar un prefab en un pool](./how-to/pooling-a-prefab),
  [mostrar las posiciones de los jugadores](./how-to/showing-player-positions),
  [transferir datos entre clientes](./how-to/transferring-data-between-clients),
  [conectar un ready check](./how-to/wiring-a-ready-check).
- **El comportamiento de un tipo concreto** — empieza por
  [Cómo encaja TsVRC](./core-concepts/how-it-fits-together) y sigue sus enlaces, o
  busca en la barra lateral.
- **Por qué TsVRC funciona como funciona** —
  [Codegen en vez de reflexión](./explanations/codegen-vs-reflection) y el resto de
  páginas en Explanations.

## Este sitio {/* #this-site */}

La documentación del framework tsvrc vive en `docs/tsvrc/`. Un proyecto que se una más
adelante obtiene su propia carpeta junto a esta (`docs/<otro-proyecto>/`): mismo
repositorio, mismo sitio, sin necesidad de conexión entre repos.
