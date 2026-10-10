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
build de un mundo.

## ¿Eres nuevo en el kit?

Empieza por [Añade Udon Test Kit a tu proyecto](./add-to-your-project) y luego
[Escribe tu primer test](./first-test): al final tendrás un test de modo Play con dos jugadores y un
test de modo Edit con un spy, ambos pasando en el Test Runner.

## ¿Ya lo usas?

Ve directo a lo que necesitas:

- **Resolver una tarea concreta** —
  [ejecutar tests en una escena propia](./how-to/running-tests-in-their-own-scene),
  [probar a un jugador que no es el dueño](./how-to/testing-a-player-who-isnt-the-owner),
  [comprobar que los datos guardados sobreviven al volver a entrar](./how-to/testing-saved-data) o
  [ejecutar tests desde la línea de comandos](./how-to/running-tests-from-the-command-line).
- **Buscar el comportamiento de un tipo concreto** — empieza por
  [ClientSimSession](./reference/clientsim-session) o explora Reference en la barra lateral.
- **Entender qué cambia el kit y por qué** —
  [Lo que el kit resuelve](./explanations/what-the-kit-works-around) y
  [una sesión nueva para cada test](./explanations/a-fresh-session-for-every-test).
