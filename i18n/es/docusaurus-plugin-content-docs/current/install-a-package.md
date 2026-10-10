---
id: install-a-package
title: Instalar un paquete de TsVRC
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Instalar un paquete de TsVRC

Todos los paquetes de TsVRC se instalan de la misma forma. La página de instalación de cada
proyecto indica qué paquete añadir, qué necesita y cómo comprobar que funcionó.

<Tabs>
<TabItem value="vcc" label="VRChat Creator Companion (recomendado)" default>

1. Añade el repositorio de TsVRC al Creator Companion, una vez por computadora: haz clic en
   [Add to VCC](vcc://vpm/addRepo?url=https%3A%2F%2Fvpm.tsvrc.com%2Findex.json), o añade
   `https://vpm.tsvrc.com/index.json` como se describe en la guía
   [Community Repositories](https://vcc.docs.vrchat.com/guides/community-repositories/) de VRChat.
2. Haz clic en **Manage Project** junto a tu proyecto y luego en **+** junto al paquete.

El Creator Companion añade el paquete a la carpeta `Packages` de tu proyecto, junto con los
paquetes de los que depende, y resuelve la versión del VRChat Worlds SDK que necesita.

</TabItem>
<TabItem value="unitypackage" label=".unitypackage">

1. Descarga el `.unitypackage` más reciente del paquete desde la página de releases de GitHub que
   enlaza su página de instalación.
2. Con tu proyecto abierto, haz doble clic en el archivo, o usa **Assets > Import Package > Custom
   Package**, e importa todo.

El paquete queda en la carpeta `Assets` de tu proyecto. Un `.unitypackage` no puede instalar los
paquetes de los que depende ni comprobar tu versión del VRChat Worlds SDK, así que importa esos
paquetes y comprueba la versión tú mismo. En un proyecto que usa el Creator Companion para otros
paquetes, úsalo también para este: las actualizaciones y dependencias de un paquete importado a
mano quedan a tu cargo.

</TabItem>
</Tabs>
