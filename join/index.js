(function () {
  var form = document.getElementById('join-build-page-form');
  if (!form) return;
  var errorEl = document.getElementById('join-error');
  var submitBtn = document.getElementById('join-submit');

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  form.addEventListener('focusin', function () {
    if (window.ekTrack) window.ekTrack('join_the_build_start', { source_page: 'join', form_name: 'join_the_build' });
  }, { once: true });

  form.addEventListener('submit', function (e) {
    clearError();
    var first = form.querySelector('[name="first_name"]');
    var email = form.querySelector('[name="email"]');
    var consent = form.querySelector('[name="consent"]');
    var honey = form.querySelector('[name="_honey"]');

    if (honey && honey.value) {
      e.preventDefault();
      return;
    }
    if (!first || !first.value.trim()) {
      e.preventDefault();
      showError('Please enter your first name.');
      first && first.focus();
      return;
    }
    if (!email || !email.value.trim() || email.value.indexOf('@') === -1) {
      e.preventDefault();
      showError('Please enter a valid email address.');
      email && email.focus();
      return;
    }
    if (!consent || !consent.checked) {
      e.preventDefault();
      showError('Please agree to receive updates before joining.');
      consent && consent.focus();
      return;
    }

    var interest = form.querySelector('[name="interest"]');
    if (window.ekTrack) {
      window.ekTrack('join_the_build_submit', {
        form_name: 'join_the_build',
        interest_selection: interest && interest.value ? interest.value : 'none'
      });
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining…';
      submitBtn.classList.add('ek-btn-disabled');
    }
    // Allow native FormSubmit POST + _next redirect
  });
})();
