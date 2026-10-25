(() => {
  'use strict';

  const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
  const $$ = (seletor, contexto = document) => [...contexto.querySelectorAll(seletor)];

  const normalizar = (texto = '') =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  /* ---------- Ano no rodapé ---------- */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho: sombra ao rolar + menu mobile ---------- */
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const menu = $('#menu-principal');

  if (header) {
    const atualizarSombra = () =>
      header.classList.toggle('is-scrolled', window.scrollY > 8);

    atualizarSombra();
    window.addEventListener('scroll', atualizarSombra, { passive: true });
  }

  if (header && toggle && menu) {
    const definirAberto = (aberto) => {
      header.classList.toggle('is-open', aberto);
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    };

    toggle.addEventListener('click', () =>
      definirAberto(!header.classList.contains('is-open'))
    );

    menu.addEventListener('click', (evento) => {
      if (evento.target.closest('a')) definirAberto(false);
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') definirAberto(false);
    });

    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
      if (e.matches) definirAberto(false);
    });
  }

  /* ---------- Imagens ausentes: mostra o gradiente de fundo ---------- */
  $$('img[data-fallback]').forEach((img) => {
    const esconder = () => img.classList.add('is-missing');
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });

  /* ---------- Busca: filtra os imóveis em destaque ---------- */
  const formulario = $('#form-busca');
  const cards = $$('.card');
  const semResultados = $('#sem-resultados');

  if (formulario) {
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const dados = new FormData(formulario);
      const termo = normalizar(dados.get('q'));
      const cidade = normalizar(dados.get('cidade'));
      const bairro = normalizar(dados.get('bairro'));

      let visiveis = 0;

      cards.forEach((card) => {
        const combina =
          (!termo || normalizar(card.textContent).includes(termo)) &&
          (!cidade || normalizar(card.dataset.cidade) === cidade) &&
          (!bairro || normalizar(card.dataset.bairro) === bairro);

        card.hidden = !combina;
        if (combina) visiveis += 1;
      });

      if (semResultados) semResultados.hidden = visiveis > 0;

      const destino = $('#imoveis');
      if (destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();
