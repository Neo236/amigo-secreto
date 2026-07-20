/**
 * Lógica del sorteo, sin nada del DOM.
 *
 * Vive separada de app.js para poder probarla: son funciones puras, sin estado ni
 * efectos, y son lo único de la aplicación que puede estar mal de forma silenciosa.
 */

/** Largo máximo de un nombre. Sin tope, un pegado de texto rompe el layout. */
export const MAX_LARGO_NOMBRE = 40;

/**
 * Un nombre vale si tiene al menos una letra (incluye acentos y ñ) y no es
 * desmesuradamente largo.
 * @param {string} nombre
 * @returns {boolean}
 */
export const esNombreValido = (nombre) => {
    const limpio = nombre.trim();
    return limpio.length > 0 && limpio.length <= MAX_LARGO_NOMBRE && /\p{L}/u.test(limpio);
};

/**
 * Indica si el nombre ya está en la lista, sin distinguir mayúsculas.
 * @param {string} nombre
 * @param {string[]} lista
 * @returns {boolean}
 */
export const estaDuplicado = (nombre, lista) =>
    lista.some((item) => item.toLowerCase() === nombre.toLowerCase());

/**
 * Mezcla un arreglo con Fisher-Yates. Devuelve uno nuevo: no toca el original.
 * @template T
 * @param {T[]} arreglo
 * @param {() => number} [aleatorio] Fuente de azar; se puede fijar para testear.
 * @returns {T[]}
 */
export const mezclar = (arreglo, aleatorio = Math.random) => {
    const mezclado = [...arreglo];
    for (let i = mezclado.length - 1; i > 0; i--) {
        const j = Math.floor(aleatorio() * (i + 1));
        [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
    }
    return mezclado;
};

/**
 * Arma los pares a partir de una lista ya mezclada.
 *
 * Cada uno le regala al siguiente y el último al primero: un solo ciclo. Eso garantiza
 * que nadie se toque a sí mismo y que no queden subgrupos cerrados —dos personas
 * intercambiándose entre ellas mientras el resto queda aparte—, que es justo lo que
 * puede pasar si se sortea cada par por separado.
 *
 * @param {string[]} listaMezclada
 * @returns {{de: string, para: string}[]}
 */
export const generarPares = (listaMezclada) =>
    listaMezclada.map((de, indice) => ({
        de,
        para: listaMezclada[(indice + 1) % listaMezclada.length],
    }));

/**
 * Sortea la lista completa: mezcla y arma los pares.
 * @param {string[]} participantes
 * @param {() => number} [aleatorio]
 * @returns {{de: string, para: string}[]}
 */
export const sortear = (participantes, aleatorio = Math.random) =>
    generarPares(mezclar(participantes, aleatorio));
