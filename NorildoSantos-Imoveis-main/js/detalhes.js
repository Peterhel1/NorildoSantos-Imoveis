const cabecalho = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    cabecalho.classList.toggle('rolado', window.scrollY > 50);
});

document.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    alert('Mensagem enviada!');
}));
