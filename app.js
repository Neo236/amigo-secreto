// Une el DOM con la lógica del sorteo. La lógica en sí —validación, mezcla y armado de
// pares— vive en sorteo.js, aparte y con tests, porque es lo único que puede fallar en
// silencio. Acá manejamos la pantalla: la lista editable de participantes (agregar,
// editar, quitar), los avisos en la página y el render del sorteo.
import { esNombreValido, estaDuplicado, sortear } from './sorteo.js';

const input = document.getElementById('amigo');
const btnAgregar = document.querySelector('.button-add');
const btnSortear = document.querySelector('.button-draw');
const listaAmigos = document.getElementById('listaAmigos');
const resultado = document.getElementById('resultado');
const aviso = document.getElementById('aviso');

const amigos = [];
let editando = null; // índice del nombre en edición, o null

// --- Aviso en la página (reemplaza los alert() del navegador) ---
let avisoTimer;
function mostrarAviso(mensaje) {
    aviso.textContent = mensaje;
    aviso.classList.add('visible');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('visible'), 3800);
}

// El resultado del sorteo deja de ser válido apenas cambia la lista.
function limpiarResultado() {
    resultado.innerHTML = '';
}

function crearBoton(texto, etiqueta, alHacerClic, clase) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = clase;
    boton.textContent = texto;
    boton.setAttribute('aria-label', etiqueta);
    boton.addEventListener('click', alHacerClic);
    return boton;
}

// --- Agregar ---
function agregarAmigo() {
    const nombre = input.value.trim();

    if (!esNombreValido(nombre)) {
        mostrarAviso('Ingresá un nombre válido (al menos una letra).');
        return;
    }
    if (estaDuplicado(nombre, amigos)) {
        mostrarAviso('Ese nombre ya está en la lista.');
        input.value = '';
        input.focus();
        return;
    }

    amigos.push(nombre);
    editando = null;
    limpiarResultado();
    actualizarLista();

    input.value = '';
    input.focus();
}

// --- Quitar ---
function quitarAmigo(indice) {
    amigos.splice(indice, 1);
    editando = null;
    limpiarResultado();
    actualizarLista();
    input.focus();
}

// --- Editar (confirma el nuevo nombre de un participante) ---
function confirmarEdicion(indice, valor) {
    const nombre = valor.trim();

    if (!esNombreValido(nombre)) {
        mostrarAviso('Ingresá un nombre válido (al menos una letra).');
        return;
    }
    // Al editar, el nombre no cuenta como duplicado de sí mismo.
    const otros = amigos.filter((_, i) => i !== indice);
    if (estaDuplicado(nombre, otros)) {
        mostrarAviso('Ese nombre ya está en la lista.');
        return;
    }

    amigos[indice] = nombre;
    editando = null;
    limpiarResultado();
    actualizarLista();
    input.focus();
}

function salirDeEdicion() {
    editando = null;
    actualizarLista();
    input.focus();
}

function actualizarLista() {
    listaAmigos.innerHTML = '';

    amigos.forEach((amigo, i) => {
        const li = document.createElement('li');
        li.className = 'name-item';

        if (editando === i) {
            const campo = document.createElement('input');
            campo.type = 'text';
            campo.className = 'edit-input';
            campo.value = amigo;
            campo.maxLength = 40;
            campo.setAttribute('aria-label', `Editar el nombre ${amigo}`);
            campo.addEventListener('keydown', (evento) => {
                if (evento.key === 'Enter') confirmarEdicion(i, campo.value);
                else if (evento.key === 'Escape') salirDeEdicion();
            });

            const guardar = crearBoton('✓', 'Guardar cambios', () => confirmarEdicion(i, campo.value), 'name-btn ok');
            const cancelar = crearBoton('✕', 'Cancelar edición', salirDeEdicion, 'name-btn');

            li.append(campo, guardar, cancelar);
            listaAmigos.appendChild(li);
            campo.focus();
            campo.select();
        } else {
            const texto = document.createElement('span');
            texto.className = 'name-text';
            texto.textContent = amigo;

            const editar = crearBoton('✎', `Editar ${amigo}`, () => {
                editando = i;
                actualizarLista();
            }, 'name-btn');
            const quitar = crearBoton('✕', `Quitar ${amigo}`, () => quitarAmigo(i), 'name-btn del');

            li.append(texto, editar, quitar);
            listaAmigos.appendChild(li);
        }
    });
}

// --- Sortear ---
function sortearAmigo() {
    if (amigos.length < 3) {
        mostrarAviso('Agregá al menos 3 amigos: con menos, cada uno sabría de una a quién le tocó.');
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
