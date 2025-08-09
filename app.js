// El principal objetivo de este desafío es fortalecer tus habilidades en lógica de programación. Aquí deberás desarrollar la lógica para resolver el problema.
let amigos = [];

function agregarAmigo()
{
    let nombreAmigoInput = document.getElementById('amigo');
    let nombreAmigo = nombreAmigoInput.value.trim();

    if (nombreAmigo === '')
    {
        alert("Por favor, inserte un nombre.");
        return;
    }

    if (amigos.includes.nombreAmigo)
    {
        alert("Este nombre ya ha sido agregado. Por favor, inserte un nombre diferente.");
        nombreAmigoInput.value = '';
        return;
    }

    amigos.push(nombreAmigo);

    actualizarLista();
    
    nombreAmigoInput.value = '';
    nombreAmigoInput.focus();
}

function actualizarLista() {
    let listaHTML = document.getElementById('listaAmigos');

    listaHTML.innerHTML = "";

    for (let i = 0; i < amigos.length; i++) {
        let elementoAmigo = document.createElement('li');
        elementoAmigo.textContent = amigos[i];
        listaHTML.appendChild(elementoAmigo)
    }
}

function sortearAmigo() {
    if (amigos.length < 2) {
        alert("Debes agregar al menos 2 amigos para realizar el sorteo.");
        return;
    }

    let indiceAleatorio = Math.floor(Math.random() * amigos.length);

    let amigoSorteado = amigos[indiceAleatorio];

    let resultado = document.getElementById('resultado');
    resultado.innerHTML = `El amigo secreto es: <strong>${amigoSorteado}</strong>`;
}
