import { esNombreValido, estaDuplicado, sortear } from './sorteo.js';

const input = document.getElementById('amigo');
const btnAgregar = document.querySelector('.button-add');
const btnSortear = document.querySelector('.button-draw');
const listaAmigos = document.getElementById('listaAmigos');
const resultado = document.getElementById('resultado');
const aviso = document.getElementById('aviso');
const clearZone = document.getElementById('clearZone');

const amigos = [];
let editando = null;
let confirmandoVaciar = false;

let avisoTimer;
function mostrarAviso(mensaje) {
    aviso.textContent = mensaje;
    aviso.classList.add('visible');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('visible'), 3800);
}

function limpiarResultado() {
    resultado.innerHTML = '';
}

const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICONO_QUITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const ICONO_GUARDAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
const ICONO_CANCELAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

function crearBoton(icono, etiqueta, alHacerClic, clase) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = clase;
    boton.innerHTML = icono;
    boton.setAttribute('aria-label', etiqueta);
    boton.addEventListener('click', alHacerClic);
    return boton;
}

function crearBotonTexto(texto, alHacerClic, clase, icono = '') {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = clase;
    boton.innerHTML = icono;
    boton.append(document.createTextNode(texto));
    boton.addEventListener('click', alHacerClic);
    return boton;
}

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

function quitarAmigo(indice) {
    amigos.splice(indice, 1);
    editando = null;
    limpiarResultado();
    actualizarLista();
    input.focus();
}

function confirmarEdicion(indice, valor) {
    const nombre = valor.trim();

    if (!esNombreValido(nombre)) {
        mostrarAviso('Ingresá un nombre válido (al menos una letra).');
        return;
    }
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
    confirmandoVaciar = false;
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

    renderZonaVaciar();
}

function renderZonaVaciar() {
    clearZone.innerHTML = '';
    if (amigos.length === 0) return;

    if (confirmandoVaciar) {
        const texto = document.createElement('span');
        texto.className = 'clear-confirm-text';
        texto.textContent = '¿Vaciar la lista?';

        const si = crearBotonTexto('Sí, vaciar', () => {
            amigos.length = 0;
            editando = null;
            limpiarResultado();
            actualizarLista();
            input.focus();
        }, 'button-clear-yes');
        si.setAttribute('aria-label', 'Sí, vaciar la lista');

        const no = crearBotonTexto('Cancelar', cancelarVaciar, 'button-clear-no');
        no.setAttribute('aria-label', 'Cancelar, no vaciar la lista');

        [si, no].forEach((boton) => boton.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') cancelarVaciar();
        }));

        clearZone.append(texto, si, no);
        no.focus();
    } else {
        const vaciar = crearBotonTexto('Vaciar lista', () => {
            confirmandoVaciar = true;
            renderZonaVaciar();
        }, 'button-clear', ICONO_QUITAR);
        vaciar.setAttribute('aria-label', 'Vaciar la lista de participantes');
        clearZone.append(vaciar);
    }
}

function cancelarVaciar() {
    confirmandoVaciar = false;
    renderZonaVaciar();
    const boton = clearZone.querySelector('.button-clear');
    if (boton) boton.focus();
}

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

    const pares = sortear(amigos);

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

const infoMenu = document.querySelector('.info-menu');
if (infoMenu) {
    document.addEventListener('click', (evento) => {
        if (infoMenu.open && !infoMenu.contains(evento.target)) {
            infoMenu.open = false;
        }
    });
}
