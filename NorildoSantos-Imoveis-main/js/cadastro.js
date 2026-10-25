const botaoSenha = document.querySelector('.ver-senha');
const campoSenha = document.getElementById('senha');

botaoSenha.addEventListener('click', () => {
    const mostrar = campoSenha.type === 'password';
    campoSenha.type = mostrar ? 'text' : 'password';
    botaoSenha.querySelector('.icone').textContent = mostrar ? 'visibility' : 'visibility_off';
});

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    location.href = 'login.html';
});
