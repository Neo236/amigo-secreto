# Amigo Secreto

[![CI](https://github.com/Neo236/amigo-secreto/actions/workflows/ci.yml/badge.svg)](https://github.com/Neo236/amigo-secreto/actions/workflows/ci.yml)

Un sorteo de amigo secreto que corre entero en el navegador. Cargás los nombres, tocás
sortear y te arma la ronda completa de una: a cada persona le asigna a quién le regala, sin
que a nadie le toque su propio nombre.

Salió del challenge de **Alura Latam** (programa Oracle Next Education). Partí de la base
visual del challenge y encima le puse la lógica del sorteo con sus tests, la gestión de la
lista (agregar, editar, quitar, vaciar), el resultado a colores y varios detalles de
accesibilidad.

**[Probalo online →](https://neo236.github.io/amigo-secreto/)**

![La app con cinco participantes y el sorteo resuelto, cada nombre con su color](assets/captura-de-pantalla.png)

## Qué hace

- Armás la lista a mano: agregar, editar, quitar, o vaciarla entera (te pregunta antes de
  borrar).
- La validación es en la misma página, sin los `alert` del navegador: te avisa si el nombre
  está vacío, repetido o es larguísimo.
- El sorteo necesita al menos 3 personas y arma la ronda completa. Cada nombre sale con su
  color y, como todo es un único círculo, seguís de un vistazo quién le regala a quién.
- Se maneja con teclado: Enter agrega; editando un nombre, Enter guarda y Escape cancela.

## Cómo funciona el sorteo

Es la parte que tiene algo de miga. Si sorteás cada regalo por separado, podés terminar con
dos personas regalándose entre ellas y el resto por otro lado. Para que no pase, mezclo la
lista (Fisher-Yates) y hago que cada uno le regale al siguiente, y el último al primero.
Queda un solo círculo:

```
Mezclada:  Ana · Beto · Caro
Ronda:     Ana → Beto → Caro → Ana
```

Así nadie se toca a sí mismo y no quedan subgrupos cerrados.

## Correrlo

La app no necesita nada: abrí `index.html` con doble clic y listo. No hay build ni servidor,
y los scripts se cargan de forma clásica, así que funciona directo desde el disco. Lo único
que baja de afuera son las tipografías de Google Fonts; si no cargan, usa las del sistema.

¿Querés solo la app para guardarla o pasarla? Bajá el zip de la última
[release](https://github.com/Neo236/amigo-secreto/releases): trae nada más que el HTML, el
CSS, el JS y las imágenes.

## Tests

La lógica del sorteo vive en `sorteo.js`, aparte del DOM, y tiene su tanda de tests en
`sorteo.test.js`. Corren con el runner que ya trae Node (`node --test`): no hay librerías ni
`node_modules`, solo hace falta tener Node 20 o más instalado.

```bash
node --test        # o, si preferís: npm test
```

Son 22 tests. El que más me importa recorre el resultado como un grafo y comprueba que sea un
solo ciclo: sin esa verificación, un sorteo podría partirse en subgrupos y nadie se daría
cuenta.

## Cómo está armado

```
index.html      la pantalla
style.css       los estilos (base de Alura + lo que agregué)
sorteo.js       la lógica, sin tocar el DOM
app.js          conecta la lógica con la pantalla
sorteo.test.js  los tests
```

## Accesibilidad

El resultado va en una región `aria-live`, así un lector de pantalla lo lee al aparecer. Los
botones de ícono tienen su `aria-label`, el foco de teclado se ve al navegar, y los nombres se
insertan con `textContent`, nunca con `innerHTML`.

## Licencia

MIT — ver [LICENSE](LICENSE).

---

Hecho por Lautaro Sebastian Mambrin (Neo236).
