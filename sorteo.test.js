import { describe, expect, it } from 'vitest';
import {
    MAX_LARGO_NOMBRE,
    esNombreValido,
    estaDuplicado,
    generarPares,
    mezclar,
    sortear,
} from './sorteo.js';

describe('esNombreValido', () => {
    it('acepta un nombre común', () => {
        expect(esNombreValido('Juan')).toBe(true);
    });

    it('acepta acentos y ñ', () => {
        expect(esNombreValido('María')).toBe(true);
        expect(esNombreValido('Iñaki')).toBe(true);
    });

    it('acepta nombres compuestos', () => {
        expect(esNombreValido('Ana María de la Cruz')).toBe(true);
    });

    it('rechaza una cadena vacía o con solo espacios', () => {
        expect(esNombreValido('')).toBe(false);
        expect(esNombreValido('   ')).toBe(false);
    });

    it('rechaza algo sin ninguna letra', () => {
        expect(esNombreValido('123')).toBe(false);
        expect(esNombreValido('!!!')).toBe(false);
    });

    it('rechaza un nombre desmesuradamente largo', () => {
        // Regresión: sin tope, un pegado de texto rompía el layout de la lista.
        expect(esNombreValido('a'.repeat(MAX_LARGO_NOMBRE + 1))).toBe(false);
    });

    it('acepta un nombre justo en el límite', () => {
        expect(esNombreValido('a'.repeat(MAX_LARGO_NOMBRE))).toBe(true);
    });
});

describe('estaDuplicado', () => {
    it('encuentra el nombre exacto', () => {
        expect(estaDuplicado('Juan', ['Ana', 'Juan'])).toBe(true);
    });

    it('no distingue mayúsculas', () => {
        expect(estaDuplicado('JUAN', ['juan'])).toBe(true);
    });

    it('devuelve falso si no está', () => {
        expect(estaDuplicado('Pedro', ['Ana', 'Juan'])).toBe(false);
    });

    it('sobre una lista vacía devuelve falso', () => {
        expect(estaDuplicado('Ana', [])).toBe(false);
    });
});

describe('mezclar', () => {
    it('no modifica el arreglo original', () => {
        const original = ['a', 'b', 'c'];
        mezclar(original);
        expect(original).toEqual(['a', 'b', 'c']);
    });

    it('conserva todos los elementos', () => {
        const nombres = ['Ana', 'Juan', 'Pedro', 'Luz'];
        expect(mezclar(nombres).sort()).toEqual([...nombres].sort());
    });

    it('con azar fijo da un resultado determinista', () => {
        // Fisher-Yates con random()=0 siempre intercambia con la posición 0:
        // i=2 deja ['c','b','a'] e i=1 deja ['b','c','a'].
        expect(mezclar(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a']);
    });

    it('aguanta listas vacías y de un elemento', () => {
        expect(mezclar([])).toEqual([]);
        expect(mezclar(['solo'])).toEqual(['solo']);
    });
});

describe('generarPares', () => {
    it('arma un par por participante', () => {
        expect(generarPares(['a', 'b', 'c'])).toHaveLength(3);
    });

    it('encadena a cada uno con el siguiente y cierra el círculo', () => {
        expect(generarPares(['a', 'b', 'c'])).toEqual([
            { de: 'a', para: 'b' },
            { de: 'b', para: 'c' },
            { de: 'c', para: 'a' },
        ]);
    });

    it('con dos participantes se regalan entre sí', () => {
        expect(generarPares(['a', 'b'])).toEqual([
            { de: 'a', para: 'b' },
            { de: 'b', para: 'a' },
        ]);
    });
});

describe('sortear', () => {
    const participantes = ['Ana', 'Juan', 'Pedro', 'Luz', 'Marta'];

    it('nadie se regala a sí mismo', () => {
        for (let i = 0; i < 200; i++) {
            expect(sortear(participantes).every((par) => par.de !== par.para)).toBe(true);
        }
    });

    it('cada participante regala exactamente una vez', () => {
        const dan = sortear(participantes).map((par) => par.de);
        expect(new Set(dan).size).toBe(participantes.length);
    });

    it('cada participante recibe exactamente una vez', () => {
        const reciben = sortear(participantes).map((par) => par.para);
        expect(new Set(reciben).size).toBe(participantes.length);
    });

    it('forma un único círculo, sin subgrupos cerrados', () => {
        // Lo importante del sorteo: si hubiera dos ciclos, un par se intercambiaría
        // entre sí y quedaría aislado del resto.
        for (let i = 0; i < 50; i++) {
            const pares = sortear(participantes);
            const siguiente = new Map(pares.map((par) => [par.de, par.para]));

            let actual = participantes[0];
            const visitados = new Set();
            while (!visitados.has(actual)) {
                visitados.add(actual);
                actual = siguiente.get(actual);
            }

            expect(visitados.size).toBe(participantes.length);
            expect(actual).toBe(participantes[0]);
        }
    });
});
