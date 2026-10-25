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

  /* ---------- Menu lateral (telas pequenas) ---------- */
  const botaoMenu = $('[data-sidebar-toggle]');
  const fundoMenu = $('.sidebar-backdrop');

  const definirMenu = (aberto) => {
    document.body.classList.toggle('sidebar-open', aberto);
    if (botaoMenu) {
      botaoMenu.setAttribute('aria-expanded', String(aberto));
      botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    }
  };

  if (botaoMenu) {
    botaoMenu.addEventListener('click', () =>
      definirMenu(!document.body.classList.contains('sidebar-open'))
    );
  }

  if (fundoMenu) fundoMenu.addEventListener('click', () => definirMenu(false));

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') definirMenu(false);
  });

  window.matchMedia('(min-width: 901px)').addEventListener('change', (evento) => {
    if (evento.matches) definirMenu(false);
  });

  /* ---------- Imagens ausentes: mostra o gradiente de fundo ---------- */
  $$('img[data-fallback]').forEach((img) => {
    const esconder = () => img.style.visibility = 'hidden';
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });

  /* ---------- Busca no topo + exclusão de linhas ---------- */
  const campoBusca = $('[data-filter]');
  const tabela = campoBusca ? $(campoBusca.dataset.filter) : null;

  if (campoBusca && tabela) {
    const vazio = $('.table-empty', tabela);

    const filtrar = () => {
      const termo = normalizar(campoBusca.value);
      const linhas = $$('tbody tr:not(.table-empty)', tabela);
      let visiveis = 0;

      linhas.forEach((linha) => {
        const combina = !termo || normalizar(linha.textContent).includes(termo);
        linha.hidden = !combina;
        if (combina) visiveis += 1;
      });

      if (vazio) vazio.hidden = visiveis > 0;
    };

    campoBusca.addEventListener('input', filtrar);

    tabela.addEventListener('click', (evento) => {
      const botao = evento.target.closest('[data-action="excluir"]');
      if (!botao) return;

      const linha = botao.closest('tr');
      const nome = $('.property__name', linha)?.textContent ?? 'este item';

      if (window.confirm(`Excluir "${nome}"?`)) {
        linha.remove();
        filtrar();
      }
    });
  }

  /* ---------- Relatórios: gráfico de vendas mensais ---------- */
  const grafico = $('#grafico-vendas');

  if (grafico) {
    const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const VENDAS = [0.5, 0.8, 0.9, 0.85, 0.8, 0.9, 2.3, 2.2, 1.4, 0.7, 0.5, 2.35]; // R$ milhões
    const MAXIMO = 2.6;

    // Curva suave que não "estoura" entre os pontos (interpolação monotônica).
    const caminhoSuave = (pontos) => {
      const n = pontos.length;

      if (n < 3) {
        return pontos.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
      }

      const dx = [];
      const m = [];
      const t = new Array(n);

      for (let i = 0; i < n - 1; i += 1) {
        dx[i] = pontos[i + 1][0] - pontos[i][0];
        m[i] = (pontos[i + 1][1] - pontos[i][1]) / dx[i];
      }

      t[0] = m[0];
      t[n - 1] = m[n - 2];

      for (let i = 1; i < n - 1; i += 1) {
        t[i] = m[i - 1] * m[i] <= 0
          ? 0
          : (3 * (dx[i - 1] + dx[i])) /
            ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
      }

      let d = `M${pontos[0][0]},${pontos[0][1]}`;

      for (let i = 0; i < n - 1; i += 1) {
        const h = dx[i] / 3;
        d += ` C${pontos[i][0] + h},${pontos[i][1] + t[i] * h}`
          + ` ${pontos[i + 1][0] - h},${pontos[i + 1][1] - t[i + 1] * h}`
          + ` ${pontos[i + 1][0]},${pontos[i + 1][1]}`;
      }

      return d;
    };

    const desenhar = (quantidade) => {
      const L = 560;
      const A = 250;
      const margem = { esq: 24, dir: 24, topo: 12, base: 36 };
      const largura = L - margem.esq - margem.dir;
      const altura = A - margem.topo - margem.base;
      const base = margem.topo + altura;

      const meses = MESES.slice(-quantidade);
      const valores = VENDAS.slice(-quantidade);
      const passo = quantidade > 6 ? 2 : 1;

      const pontos = valores.map((valor, i) => [
        Number((margem.esq + (i * largura) / (quantidade - 1)).toFixed(2)),
        Number((margem.topo + altura - (valor / MAXIMO) * altura).toFixed(2)),
      ]);

      const linha = caminhoSuave(pontos);
      const area = `${linha} L${pontos[quantidade - 1][0]},${base} L${pontos[0][0]},${base} Z`;

      const rotulos = meses
        .map((mes, i) => (i % passo === 0
          ? `<text x="${pontos[i][0]}" y="${base + 24}">${mes}</text>`
          : ''))
        .join('');

      const alvos = pontos
        .map(([x, y], i) => {
          const valor = valores[i].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
          return `<circle class="chart__hit" cx="${x}" cy="${y}" r="8"><title>${meses[i]}: R$ ${valor} mi</title></circle>`;
        })
        .join('');

      grafico.innerHTML = `
        <svg viewBox="0 0 ${L} ${A}" role="img" aria-label="Gráfico de vendas mensais, em milhões de reais">
          <defs>
            <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#545f7a" stop-opacity="0.14"/>
              <stop offset="1" stop-color="#545f7a" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g class="chart__grid">
            <line class="is-dashed" x1="0" x2="${L}" y1="${margem.topo}" y2="${margem.topo}"/>
            <line class="is-dashed" x1="0" x2="${L}" y1="${margem.topo + altura / 2}" y2="${margem.topo + altura / 2}"/>
            <line x1="0" x2="${L}" y1="${base}" y2="${base}"/>
          </g>
          <path d="${area}" fill="url(#grad-area)"/>
          <path class="chart__line" d="${linha}"/>
          <g>${alvos}</g>
          <g class="chart__labels">${rotulos}</g>
        </svg>`;
    };

    const seletor = $('#periodo-vendas');
    desenhar(Number(seletor?.value ?? 12));

    if (seletor) {
      seletor.addEventListener('change', () => desenhar(Number(seletor.value)));
    }

    const filtrar = $('[data-action="filtrar"]');
    if (filtrar && seletor) {
      filtrar.addEventListener('click', () => {
        seletor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        seletor.focus();
      });
    }
  }

  /* ---------- Relatórios: exportar PDF (impressão do navegador) ---------- */
  const exportar = $('[data-action="exportar"]');
  if (exportar) exportar.addEventListener('click', () => window.print());
})();
