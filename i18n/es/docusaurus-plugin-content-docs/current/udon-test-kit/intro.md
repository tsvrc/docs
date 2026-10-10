---
id: intro
title: Udon Test Kit
sidebar_position: 1
---

# Udon Test Kit

Udon Test Kit te permite escribir tests automatizados para un mundo de VRChat con Unity Test
Framework. Los tests de modo Play ejecutan tus behaviours de UdonSharp en una sesión real de
ClientSim, con jugadores reales.

## Qué puedes hacer con él

- Crear y quitar jugadores, y elegir quién es el master.
- Darle un dueño a cualquier GameObject, para probar lo que ve un jugador que no es su dueño.
- Conservar los datos guardados entre sesiones, como un jugador que sale y vuelve a entrar.
- Registrar las llamadas que tu código hace por nombre, como con `SendCustomEvent`.
- Ejecutar cada test en una escena propia, vacía o la de tu mundo.
- Crear desde un elemento de menú los assemblies de test que necesita tu mundo.

El kit solo se compila para los tests, así que nada de él llega a la build de tu mundo.

También incluye `Invoke-UnityTests.ps1`, un script de PowerShell independiente que ejecuta los
tests de un proyecto con un solo comando y muestra solo lo que falló. Funciona en cualquier
proyecto de Unity, con o sin el kit.

## Empieza aquí

1. [Añade Udon Test Kit a tu proyecto](./add-to-your-project)
2. [Escribe tu primer test](./first-test)

## Tareas comunes

- [Ejecutar tests en una escena propia](./how-to/running-tests-in-their-own-scene)
- [Probar qué pasa con un jugador que no es el dueño](./how-to/testing-a-player-who-isnt-the-owner)
- [Comprobar que los datos guardados sobreviven al volver a entrar](./how-to/testing-saved-data)
- [Ejecutar tests desde la línea de comandos](./how-to/running-tests-from-the-command-line)

## Referencia y contexto

- [ClientSimSession](./reference/clientsim-session), donde empieza la mayoría de los tests
- [Lo que el kit resuelve](./explanations/what-the-kit-works-around)
- [Nota de decisión: una sesión nueva para cada test](./explanations/a-fresh-session-for-every-test)
