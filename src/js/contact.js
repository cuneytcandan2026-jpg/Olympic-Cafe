// Sends the form to the configured endpoint. Success is only ever shown after the endpoint confirms
// delivery, and the visitor's text is only cleared at that point.
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submit = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  const errorBox = document.getElementById('form-error');
  const errorText = document.getElementById('form-error-text');
  const TIMEOUT_MS = 15000;

  const CHECKS = {
    name: (v) => (v ? '' : 'Please enter your name.'),
    email: (v) => {
      if (!v) return 'Please enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address, like name@example.com.';
    },
    message: (v) => (v ? '' : 'Please enter your message.'),
  };

  function setFieldError(name, message) {
    const input = form.elements[name];
    const error = document.getElementById(`${name}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validate() {
    let firstInvalid = null;
    Object.keys(CHECKS).forEach((name) => {
      const message = CHECKS[name](form.elements[name].value.trim());
      setFieldError(name, message);
      if (message && !firstInvalid) firstInvalid = form.elements[name];
    });
    return firstInvalid;
  }

  // Once an error shows, clear it as soon as the field is fixed.
  Object.keys(CHECKS).forEach((name) => {
    form.elements[name].addEventListener('input', () => {
      if (form.elements[name].getAttribute('aria-invalid') === 'true') {
        setFieldError(name, CHECKS[name](form.elements[name].value.trim()));
      }
    });
  });

  function showFailure(message) {
    errorText.textContent = message;
    errorBox.hidden = false;
    errorBox.focus();
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
    submit.textContent = busy ? 'Sending...' : 'Send message';
    submit.classList.toggle('opacity-70', busy);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    success.hidden = true;
    errorBox.hidden = true;

    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (response.ok && result.ok === true) {
        const firstName = form.elements.name.value.trim().split(/\s+/)[0];
        success.textContent = `Thanks ${firstName}, your message has been sent. We'll reply to ${form.elements.email.value.trim()}.`;
        success.hidden = false;
        form.reset();
        success.focus();
      } else if (response.status === 400 && result.fields) {
        Object.entries(result.fields).forEach(([name, message]) => setFieldError(name, message));
        showFailure('Please check the highlighted fields and try again.');
      } else if (response.status === 429) {
        showFailure('Too many messages have been sent just now, so yours was not sent.');
      } else {
        showFailure('Sorry, your message could not be sent.');
      }
    } catch {
      showFailure('Sorry, your message could not be sent. There was a connection problem.');
    } finally {
      clearTimeout(timer);
      setBusy(false);
      if (window.turnstile) window.turnstile.reset();
    }
  });
})();
