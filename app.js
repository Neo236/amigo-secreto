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
    let listaDeAmigos = document.getElementById('listaAmigos');
    listaDeAmigos.textContent = amigos.join(', ');
    nombreAmigoInput.value = '';
    nombreAmigoInput.focus();
}

