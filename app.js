// Une el DOM con la lógica del sorteo. La lógica en sí —validación, mezcla y armado
// de pares— vive en sorteo.js, aparte y con tests, porque es lo único que puede fallar
// en silencio. Acá solo leemos la pantalla y la actualizamos.
import { esNombreValido, estaDuplicado, sortear } from './sorteo.js';

const input = document.getElementById('amigo');
const btnAgregar = document.querySelector('.button-add');
const btnSortear = document.querySelector('.button-draw');
const listaAmigos = document.getElementById('listaAmigos');
const resultado = document.getElementById('resultado');

const amigos = [];

function agregarAmigo() {
    const nombre = input.value.trim();

    if (!esNombreValido(nombre)) {
        alert('Por favor, inserte un nombre válido.');
        return;
    }

    if (estaDuplicado(nombre, amigos)) {
        alert('Este nombre ya ha sido agregado. Por favor, inserte un nombre diferente.');
        input.value = '';
        input.focus();
        return;
    }

    amigos.push(nombre);
    actualizarLista();

    input.value = '';
    input.focus();
}

function actualizarLista() {
    listaAmigos.innerHTML = '';
    for (const amigo of amigos) {
        const li = document.createElement('li');
        li.textContent = amigo;
        listaAmigos.appendChild(li);
    }
}

function sortearAmigo() {
    if (amigos.length < 3) {
        alert('Debes agregar al menos 3 amigos para que el sorteo tenga sentido: con menos, cada uno sabría de una a quién le tocó.');
        return;
    }

    // Un solo ciclo: cada uno le regala al siguiente y el último al primero. Así nadie
    // se toca a sí mismo y no quedan subgrupos cerrados.
    const pares = sortear(amigos);

    resultado.innerHTML = '';
    for (const { de, para } of pares) {
        const li = document.createElement('li');
        li.textContent = `${de} → ${para}`;
        resultado.appendChild(li);
    }
}

btnAgregar.addEventListener('click', agregarAmigo);
btnSortear.addEventListener('click', sortearAmigo);
input.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') agregarAmigo();
});

// El menú de información se cierra al hacer clic afuera.
const infoMenu = document.querySelector('.info-menu');
if (infoMenu) {
    document.addEventListener('click', (evento) => {
        if (infoMenu.open && !infoMenu.contains(evento.target)) {
            infoMenu.open = false;
        }
    });
}
