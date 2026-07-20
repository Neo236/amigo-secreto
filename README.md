# 🎁 Amigo Secreto

[![CI](https://github.com/Neo236/amigo-secreto/actions/workflows/ci.yml/badge.svg)](https://github.com/Neo236/amigo-secreto/actions/workflows/ci.yml)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e.svg)
![Sin dependencias](https://img.shields.io/badge/dependencias-0-brightgreen.svg)

> Challenge de **Alura Latam** · Programa **Oracle Next Education (ONE)**

Sorteo de amigo secreto en el navegador: cargás los participantes y la aplicación arma
todas las asignaciones de una vez, garantizando que nadie se toque a sí mismo. Conserva
la interfaz y los assets originales del challenge.

### 👉 [Probalo acá](https://neo236.github.io/amigo-secreto/)

![Amigo Secreto: participantes cargados y el sorteo ya resuelto](assets/captura-de-pantalla.png)

## ✨ Qué hace

* **Carga de participantes** con validación en la página: nada de nombres vacíos,
  repetidos, sin ninguna letra ni de largo desmedido. Los avisos salen en pantalla, no
  como alertas del navegador.
* **Editá y quitá** cualquier participante de la lista antes de sortear.
* **Sorteo completo:** no elige un ganador, arma la ronda entera. Cada participante le
  regala a otro y recibe de un tercero (mínimo 3 para que tenga sentido).
* **Soporte de teclado:** Enter agrega el nombre; en edición, Enter guarda y Escape
  cancela.
* **Cero dependencias en tiempo de ejecución:** HTML, CSS y JavaScript a secas. No hay
  build: lo que está en el repositorio es lo que corre en producción.

## 🧠 Cómo sortea

El truco está en cómo se arman los pares. Se mezcla la lista con Fisher-Yates y después
**cada uno le regala al siguiente, y el último al primero**: un solo círculo.

```
Mezclada: [María, Iñaki, Lautaro]

María ──▶ Iñaki ──▶ Lautaro
  ▲                    │
  └────────────────────┘
```

Eso resuelve dos problemas de una: nadie se toca a sí mismo, y no quedan subgrupos
cerrados —dos personas intercambiándose entre ellas mientras el resto queda aparte—, que
es exactamente lo que pasa si se sortea cada par por separado.

## 🚀 Cómo correrlo

La aplicación usa módulos ES, así que hay que servirla por HTTP (abrir el `index.html`
con doble clic no alcanza: el navegador bloquea los módulos sobre `file://`).

```bash
npx serve .        # o: python3 -m http.server
```

## 🧪 Tests

```bash
npm install
npm test
```

22 tests sobre la lógica del sorteo, que vive aparte del DOM en `sorteo.js`. El más
interesante recorre el resultado como un grafo y verifica que forme **un único ciclo**:
sin eso, un sorteo podría partirse en subgrupos y nadie se daría cuenta.

`vitest` es la única dependencia y es de desarrollo: la página no la usa.

## 📂 Estructura

```
├── assets/         Imágenes originales del challenge (logo e ícono de sortear)
├── index.html      Estructura
├── style.css       Estilos originales de Alura
├── sorteo.js       Lógica del sorteo — funciones puras, sin DOM
├── app.js          Une la lógica con la pantalla
└── sorteo.test.js  Tests de la lógica
```

## ♿ Accesibilidad

* El resultado vive en una región `aria-live="polite"`, así que un lector de pantalla
  anuncia el sorteo apenas aparece.
* El botón de sortear lleva `aria-label`: su ícono es una imagen, no texto.
* Los nombres se insertan con `textContent`, nunca con `innerHTML`: un participante
  llamado `<img onerror=...>` es texto, no código.

## 🧑‍💻 Autor

Desarrollado por **Lautaro "Neo" Mambrin**.
