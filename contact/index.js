(function () {
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-status');
  var errorEl = document.getElementById('contact-error');
  if (!form) return;

  // Replace with your Formspree form ID (e.g. from https://formspree.io/ → Get form endpoint)
  var endpoint = 'https://formspree.io/f/xjvnqxyz';

  function showStatus(msg, isError) {
    if (statusEl) {
      statusEl.style.display = isError ? 'none' : 'block';
      statusEl.textContent = isError ? '' : msg;
    }
    if (errorEl) {
      errorEl.style.display = isError ? 'block' : 'none';
      errorEl.textContent = isError ? msg : '';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showStatus('', false);

    var body = new FormData(form);
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    fetch(endpoint, {
      method: 'POST',
      body: body,
      headers: { Accept: 'application/json' }
    })
      .then(function (r) {
        if (r.ok) {
          showStatus('Thanks! I\'ll get back to you within 24 hours.', false);
          form.reset();
        } else {
          return r.json().then(function (data) {
            showStatus(data.error || 'Something went wrong. Please try again or email elombekisala@gmail.com.', true);
          }, function () {
            showStatus('Something went wrong. Please try again or email elombekisala@gmail.com.', true);
          });
        }
      })
      .catch(function () {
        showStatus('Network error. Please try again or email elombekisala@gmail.com.', true);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      });
  });
})();
