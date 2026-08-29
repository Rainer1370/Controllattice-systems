(() => {
  const endpoint = 'https://script.google.com/macros/s/AKfycbwS1mWml8VqK2NyQe1r0N7mSjPwl1ay_yn79O6Z-MOy03i8m6QmoOkiU-fqdoOb85sZ/exec';
  const form = document.querySelector('#contact-form');

  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('#form-status');
  const defaultButtonText = button.textContent;

  function showStatus(message, state) {
    status.textContent = message;
    status.className = 'form-status' + (state ? ' ' + state : '');
  }

  function showFallback() {
    status.textContent = 'The form could not connect. Please email ';
    const link = document.createElement('a');
    link.href = 'mailto:contact@controllattice.com';
    link.textContent = 'contact@controllattice.com';
    status.append(link, '.');
    status.className = 'form-status error';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    data.set('source_page', window.location.href);

    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Sending your inquiry…');

    try {
      await fetch(endpoint, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      });

      form.reset();
      showStatus('Thank you. Your inquiry has been sent to ControlLattice Systems.', 'success');
    } catch (error) {
      showFallback();
    } finally {
      button.disabled = false;
      button.textContent = defaultButtonText;
      form.removeAttribute('aria-busy');
    }
  });
})();
