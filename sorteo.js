export const MAX_LARGO_NOMBRE = 40;

export const esNombreValido = (nombre) => {
    const limpio = nombre.trim();
    return limpio.length > 0 && limpio.length <= MAX_LARGO_NOMBRE && /\p{L}/u.test(limpio);
};

export const estaDuplicado = (nombre, lista) =>
    lista.some((item) => item.toLowerCase() === nombre.toLowerCase());

export const mezclar = (arreglo, aleatorio = Math.random) => {
    const mezclado = [...arreglo];
    for (let i = mezclado.length - 1; i > 0; i--) {
        const j = Math.floor(aleatorio() * (i + 1));
        [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
    }
    return mezclado;
};

// Cada uno le regala al siguiente y el último al primero: un solo ciclo. Así nadie se
// toca a sí mismo y no quedan subgrupos cerrados.
export const generarPares = (listaMezclada) =>
    listaMezclada.map((de, indice) => ({
        de,
        para: listaMezclada[(indice + 1) % listaMezclada.length],
    }));

export const sortear = (participantes, aleatorio = Math.random) =>
    generarPares(mezclar(participantes, aleatorio));
