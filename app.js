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

// Íconos SVG estáticos (sin datos de usuario) para los controles de la lista.
const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICONO_QUITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const ICONO_GUARDAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
const ICONO_CANCELAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

// Crea un botón de ícono. El SVG es estático (no hay datos de usuario), por eso innerHTML
// es seguro; los nombres de participantes siempre se ponen con textContent.
function crearBoton(icono, etiqueta, alHacerClic, clase) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = clase;
    boton.innerHTML = icono;
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

            const guardar = crearBoton(ICONO_GUARDAR, 'Guardar cambios', () => confirmarEdicion(i, campo.value), 'name-btn ok');
            const cancelar = crearBoton(ICONO_CANCELAR, 'Cancelar edición', salirDeEdicion, 'name-btn');

            li.append(campo, guardar, cancelar);
            listaAmigos.appendChild(li);
            campo.focus();
            campo.select();
        } else {
            const texto = document.createElement('span');
            texto.className = 'name-text';
            texto.textContent = amigo;

            const editar = crearBoton(ICONO_EDITAR, `Editar ${amigo}`, () => {
                editando = i;
                actualizarLista();
            }, 'name-btn');
            const quitar = crearBoton(ICONO_QUITAR, `Quitar ${amigo}`, () => quitarAmigo(i), 'name-btn del');

            li.append(texto, editar, quitar);
            listaAmigos.appendChild(li);
        }
    });
}

// --- Sortear ---

// Color por lugar en el ciclo: hues repartidos parejo por el círculo cromático, arrancando
// en azul. Tinte claro de fondo + borde y texto del mismo hue (legible sobre el crema).
function colorDeNombre(indice, total) {
    const hue = Math.round((220 + (indice * 360) / total) % 360);
    return {
        fondo: `hsl(${hue} 85% 93%)`,
        borde: `hsl(${hue} 70% 45%)`,
        texto: `hsl(${hue} 72% 30%)`,
    };
}

function chipResultado(nombre, color) {
    const chip = document.createElement('span');
    chip.className = 'result-chip';
    chip.textContent = nombre;
    chip.style.backgroundColor = color.fondo;
    chip.style.borderColor = color.borde;
    chip.style.color = color.texto;
    return chip;
}

function sortearAmigo() {
    if (amigos.length < 3) {
        mostrarAviso('Agregá al menos 3 amigos: con menos, cada uno sabría de una a quién le tocó.');
        return;
    }

    // Un solo ciclo: cada uno le regala al siguiente y el último al primero. Así a nadie
    // le toca su propio nombre y nadie se queda sin regalo.
    const pares = sortear(amigos);

    // Cada participante recibe un color según su lugar en el ciclo (el orden de los "de").
    // Como es un solo círculo, el color de quien recibe es el del siguiente que regala.
    const orden = pares.map((par) => par.de);
    const colorPorNombre = new Map();
    orden.forEach((nombre, i) => colorPorNombre.set(nombre, colorDeNombre(i, orden.length)));

    resultado.innerHTML = '';
    for (const { de, para } of pares) {
        const li = document.createElement('li');
        li.className = 'result-item';

        const flecha = document.createElement('span');
        flecha.className = 'result-arrow';
        flecha.textContent = '→';
        flecha.setAttribute('aria-hidden', 'true');

        const paraLector = document.createElement('span');
        paraLector.className = 'sr-only';
        paraLector.textContent = ' le regala a ';

        li.append(
            chipResultado(de, colorPorNombre.get(de)),
            flecha,
            paraLector,
            chipResultado(para, colorPorNombre.get(para)),
        );
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
