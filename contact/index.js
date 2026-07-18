(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = document.getElementById('contact-status');
  var errorEl = document.getElementById('contact-error');
  var submitBtn = document.getElementById('contact-submit');

  if (typeof location !== 'undefined' && location.search.indexOf('sent=1') !== -1 && statusEl) {
    statusEl.style.display = 'block';
    statusEl.textContent = 'Thanks — your message was sent. I’ll reply as soon as I can.';
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  form.addEventListener('submit', function (e) {
    if (errorEl) errorEl.style.display = 'none';
    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) {
      e.preventDefault();
      return;
    }
    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var reason = form.querySelector('[name="reason"]');
    var message = form.querySelector('[name="message"]');
    if (!name.value.trim() || !email.value.trim() || !reason.value || !message.value.trim()) {
      e.preventDefault();
      showError('Please complete all required fields.');
      return;
    }
    if (window.ekTrack) {
      window.ekTrack('contact_form_submit', { form_name: 'contact', destination: reason.value });
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
  });
})();
