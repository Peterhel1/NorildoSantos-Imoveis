const barra = document.getElementById('barra-lateral');
const fundo = document.getElementById('fundo-escuro');

function alternarBarra() {
    barra.classList.toggle('aberta');
    fundo.classList.toggle('visivel');
    document.body.classList.toggle('travado');
}

document.getElementById('abrir-barra').addEventListener('click', alternarBarra);
document.getElementById('fechar-barra').addEventListener('click', alternarBarra);
fundo.addEventListener('click', alternarBarra);
