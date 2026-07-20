import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import './sorteo.js';

const {
    MAX_LARGO_NOMBRE,
    esNombreValido,
    estaDuplicado,
    generarPares,
    mezclar,
    sortear,
} = globalThis.Sorteo;

describe('esNombreValido', () => {
    it('acepta un nombre común', () => {
        assert.equal(esNombreValido('Juan'), true);
    });

    it('acepta acentos y ñ', () => {
        assert.equal(esNombreValido('María'), true);
        assert.equal(esNombreValido('Iñaki'), true);
    });

    it('acepta nombres compuestos', () => {
        assert.equal(esNombreValido('Ana María de la Cruz'), true);
    });

    it('rechaza una cadena vacía o con solo espacios', () => {
        assert.equal(esNombreValido(''), false);
        assert.equal(esNombreValido('   '), false);
    });

    it('rechaza algo sin ninguna letra', () => {
        assert.equal(esNombreValido('123'), false);
        assert.equal(esNombreValido('!!!'), false);
    });

    it('rechaza un nombre desmesuradamente largo', () => {
        // Regresión: sin tope, un pegado de texto rompía el layout de la lista.
        assert.equal(esNombreValido('a'.repeat(MAX_LARGO_NOMBRE + 1)), false);
    });

    it('acepta un nombre justo en el límite', () => {
        assert.equal(esNombreValido('a'.repeat(MAX_LARGO_NOMBRE)), true);
    });
});

describe('estaDuplicado', () => {
    it('encuentra el nombre exacto', () => {
        assert.equal(estaDuplicado('Juan', ['Ana', 'Juan']), true);
    });

    it('no distingue mayúsculas', () => {
        assert.equal(estaDuplicado('JUAN', ['juan']), true);
    });

    it('devuelve falso si no está', () => {
        assert.equal(estaDuplicado('Pedro', ['Ana', 'Juan']), false);
    });

    it('sobre una lista vacía devuelve falso', () => {
        assert.equal(estaDuplicado('Ana', []), false);
    });
});

describe('mezclar', () => {
    it('no modifica el arreglo original', () => {
        const original = ['a', 'b', 'c'];
        mezclar(original);
        assert.deepEqual(original, ['a', 'b', 'c']);
    });

    it('conserva todos los elementos', () => {
        const nombres = ['Ana', 'Juan', 'Pedro', 'Luz'];
        assert.deepEqual(mezclar(nombres).sort(), [...nombres].sort());
    });

    it('con azar fijo da un resultado determinista', () => {
        // Fisher-Yates con random()=0 siempre intercambia con la posición 0:
        // i=2 deja ['c','b','a'] e i=1 deja ['b','c','a'].
        assert.deepEqual(mezclar(['a', 'b', 'c'], () => 0), ['b', 'c', 'a']);
    });

    it('aguanta listas vacías y de un elemento', () => {
        assert.deepEqual(mezclar([]), []);
        assert.deepEqual(mezclar(['solo']), ['solo']);
    });
});

describe('generarPares', () => {
    it('arma un par por participante', () => {
        assert.equal(generarPares(['a', 'b', 'c']).length, 3);
    });

    it('encadena a cada uno con el siguiente y cierra el círculo', () => {
        assert.deepEqual(generarPares(['a', 'b', 'c']), [
            { de: 'a', para: 'b' },
            { de: 'b', para: 'c' },
            { de: 'c', para: 'a' },
        ]);
    });

    it('con dos participantes se regalan entre sí', () => {
        assert.deepEqual(generarPares(['a', 'b']), [
            { de: 'a', para: 'b' },
            { de: 'b', para: 'a' },
        ]);
    });
});

describe('sortear', () => {
    const participantes = ['Ana', 'Juan', 'Pedro', 'Luz', 'Marta'];

    it('nadie se regala a sí mismo', () => {
        for (let i = 0; i < 200; i++) {
            assert.equal(sortear(participantes).every((par) => par.de !== par.para), true);
        }
    });

    it('cada participante regala exactamente una vez', () => {
        const dan = sortear(participantes).map((par) => par.de);
        assert.equal(new Set(dan).size, participantes.length);
    });

    it('cada participante recibe exactamente una vez', () => {
        const reciben = sortear(participantes).map((par) => par.para);
        assert.equal(new Set(reciben).size, participantes.length);
    });

    it('forma un único círculo, sin subgrupos cerrados', () => {
        // Lo importante del sorteo: si hubiera dos ciclos, un par se intercambiaría entre
        // sí y quedaría aislado del resto.
        for (let i = 0; i < 50; i++) {
            const pares = sortear(participantes);
            const siguiente = new Map(pares.map((par) => [par.de, par.para]));

            let actual = participantes[0];
            const visitados = new Set();
            while (!visitados.has(actual)) {
                visitados.add(actual);
                actual = siguiente.get(actual);
            }

            assert.equal(visitados.size, participantes.length);
            assert.equal(actual, participantes[0]);
        }
    });
});
