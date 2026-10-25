(() => {
  'use strict';

  const form = document.querySelector('#form-contato');
  const status = document.querySelector('#form-status');
  const telefone = document.querySelector('#telefone');
  const compartilhar = document.querySelector('[data-share]');

  /* ---------- Máscara de telefone: (00) 00000-0000 ---------- */
  if (telefone) {
    telefone.addEventListener('input', () => {
      const d = telefone.value.replace(/\D/g, '').slice(0, 11);
      let saida = d;

      if (d.length > 10) saida = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      else if (d.length > 6) saida = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      else if (d.length > 2) saida = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      else if (d.length > 0) saida = `(${d}`;

      telefone.value = saida;
    });
  }

  /* ---------- Envio do formulário ---------- */
  if (form && status) {
    form.addEventListener('submit', (evento) => {
      evento.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Aqui entra o envio real (fetch para a sua API ou serviço de e-mail).
      status.textContent = 'Mensagem enviada! Nossa equipe retornará em breve.';
      status.classList.add('is-success');
      form.reset();
    });

    form.addEventListener('input', () => {
      status.textContent = '';
      status.classList.remove('is-success');
    });
  }

  /* ---------- Compartilhar a página ---------- */
  if (compartilhar) {
    compartilhar.addEventListener('click', async () => {
      const dados = { title: document.title, url: window.location.href };

      try {
        if (navigator.share) {
          await navigator.share(dados);
          return;
        }

        await navigator.clipboard.writeText(dados.url);
        compartilhar.classList.add('is-copied');
        compartilhar.setAttribute('aria-label', 'Link copiado');
        compartilhar.title = 'Link copiado!';

        setTimeout(() => {
          compartilhar.classList.remove('is-copied');
          compartilhar.setAttribute('aria-label', 'Compartilhar esta página');
          compartilhar.removeAttribute('title');
        }, 2000);
      } catch (_) {
        /* O usuário cancelou o compartilhamento ou o navegador bloqueou a cópia. */
      }
    });
  }
})();
