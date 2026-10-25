document.querySelectorAll('.cartao-imovel').forEach(cartao => {
    cartao.addEventListener('click', () => { location.href = 'detalhes.html'; });
});

document.querySelectorAll('.opcoes').forEach(grupo => {
    grupo.addEventListener('click', e => {
        const botao = e.target.closest('button');
        if (!botao) return;
        grupo.querySelectorAll('button').forEach(b => b.classList.remove('ativo'));
        botao.classList.add('ativo');
    });
});
