function initFilters() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;

  filterBar.addEventListener('click', function (e) {
    const btn = e.target.closest('.crx-filter-btn');
    if (!btn) return;

    // Update active state
    document.querySelectorAll('.crx-filter-btn').forEach(function (b) {
      b.classList.remove('crx-active');
    });
    btn.classList.add('crx-active');

    activeFilter = btn.getAttribute('data-level');

    // Filter the courses array
    const filtered = activeFilter === 'All'
      ? allCourses
      : allCourses.filter(function (c) { return c.level === activeFilter; });

    // Hide lesson panel if open
    hideLessons();

    renderCourses(filtered);
  });
}




function showLessons(courseId) {
  // Find the course object
  const course = allCourses.find(function (c) { return c.id === courseId; });
  if (!course) return;

  const lessonSection = document.getElementById('lessonSection');
  const lessonHeader  = document.getElementById('lessonHeader');
  const lessonList    = document.getElementById('lessonList');

  // Build lesson header HTML
  lessonHeader.innerHTML = `
    <h2>${escapeHtml(course.title)}</h2>
    <div class="crx-lesson-meta">
      <span><i class="fas fa-layer-group"></i> ${escapeHtml(course.level)}</span>
      <span><i class="fas fa-clock"></i> ${escapeHtml(course.duration)}</span>
      <span><i class="fas fa-user-tie"></i> ${escapeHtml(course.instructor)}</span>
      <span><i class="fas fa-list-ol"></i> ${course.lessons.length} Lessons</span>
    </div>
  `;

  // Build lessons list
  lessonList.innerHTML = '';
  course.lessons.forEach(function (lesson, index) {
    const item = document.createElement('div');
    item.className = 'crx-lesson-item';
    item.innerHTML = `
      <div class="crx-lesson-number">${index + 1}</div>
      <span class="crx-lesson-title">${escapeHtml(lesson)}</span>
      <i class="fas fa-play-circle crx-lesson-icon"></i>
    `;
    lessonList.appendChild(item);
  });

  // Show the lesson section and scroll to it
  lessonSection.classList.remove('crx-hidden');
  lessonSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideLessons() {
  const lessonSection = document.getElementById('lessonSection');
  lessonSection.classList.add('crx-hidden');
}




function populateCourseDropdown(courses) {
  const select = document.getElementById('courseSelect');
  console.log('populateCourseDropdown called with', courses.length, 'courses. Select element:', !!select);
  if (!select) return;

  // Clear existing options except the placeholder
  while (select.options.length > 1) {
    select.remove(1);
  }

  courses.forEach(function (course) {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.title + ' (' + course.level + ')';
    select.appendChild(option);
  });

  console.log('Populated dropdown. Total options now:', select.options.length);
}





function initFormValidation() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    // Prevent default HTML form submission
    e.preventDefault();

    // Run all validation checks
    const isValid = validateRegistrationForm();

    if (isValid) {
      // Hide form, show success message
      form.style.display = 'none';
      const successMsg = document.getElementById('formSuccess');
      successMsg.classList.remove('crx-hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Also validate-on-blur for a better UX feel
  ['fullName', 'email', 'password', 'confirmPassword', 'courseSelect'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function () {
        validateField(id);
        updateRegistrationRulesUI();
      });
      // Clear error on input
      el.addEventListener('input', function () {
        clearFieldError(id);
        updateRegistrationRulesUI();
      });
    }
  });

  // Keep rules panel in sync with radios/checkboxes.
  document.querySelectorAll('input[name="learningLevel"]').forEach(function (radio) {
    radio.addEventListener('change', updateRegistrationRulesUI);
  });
  const terms = document.getElementById('termsCheck');
  if (terms) terms.addEventListener('change', updateRegistrationRulesUI);

  updateRegistrationRulesUI();
}

/** Run all validation checks. Returns true if all pass. */
function validateRegistrationForm() {
  let valid = true;

  // 1. Full Name â€” required, letters and spaces only, min 2 chars
  if (!validateField('fullName'))       valid = false;
  // 2. Email â€” required, valid format
  if (!validateField('email'))          valid = false;
  // 3. Password â€” required, min 8 chars
  if (!validateField('password'))       valid = false;
  // 4. Confirm Password â€” must match
  if (!validateField('confirmPassword')) valid = false;
  // 5. Course selection
  if (!validateField('courseSelect'))   valid = false;
  // 6. Learning Level (radio)
  if (!validateLearningLevel())        valid = false;
  // 7. Terms checkbox
  if (!validateTerms())                valid = false;

  return valid;
}

/** Validate a single field by its ID. Returns true if valid. */
function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;

  const value = el.value.trim();
  let error = '';

  switch (id) {
    case 'fullName':
      if (value === '') {
        error = 'Full name is required.';
      } else if (value.length < 2) {
        error = 'Name must be at least 2 characters.';
      } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
        error = 'Name can only contain letters, spaces, hyphens, or apostrophes.';
      }
      break;

    case 'email':
      if (value === '') {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        error = 'Please enter a valid email address.';
      }
      break;

    case 'password':
      if (value === '') {
        error = 'Password is required.';
      } else {
        const checks = getPasswordChecks(value);
        if (!checks.length) {
          error = 'Password must be at least 8 characters.';
        } else if (!checks.lower) {
          error = 'Password must contain at least one lowercase letter.';
        } else if (!checks.upper) {
          error = 'Password must contain at least one uppercase letter.';
        } else if (!checks.number) {
          error = 'Password must contain at least one number.';
        } else if (!checks.special) {
          error = 'Password must contain at least one special character.';
        }
      }
      break;

    case 'confirmPassword': {
      const pw = document.getElementById('password');
      const pwVal = pw ? pw.value : '';
      if (value === '') {
        error = 'Please confirm your password.';
      } else if (value !== pwVal) {
        error = 'Passwords do not match.';
      }
      break;
    }

    case 'courseSelect':
      if (value === '') {
        error = 'Please select a course.';
      }
      break;
  }

  showFieldError(id, error);
  updateRegistrationRulesUI();
  return error === '';
}

/** Validate radio button group for learning level */
function validateLearningLevel() {
  const radios = document.querySelectorAll('input[name="learningLevel"]');
  const selected = Array.from(radios).some(function (r) { return r.checked; });
  const errorEl = document.getElementById('levelError');

  if (!selected) {
    if (errorEl) errorEl.textContent = 'Please select a learning level.';
    updateRegistrationRulesUI();
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  updateRegistrationRulesUI();
  return true;
}

/** Validate the terms checkbox */
function validateTerms() {
  const terms   = document.getElementById('termsCheck');
  const errorEl = document.getElementById('termsError');

  if (!terms.checked) {
    if (errorEl) errorEl.textContent = 'You must agree to the Terms of Service.';
    updateRegistrationRulesUI();
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  updateRegistrationRulesUI();
  return true;
}

function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value)
  };
}

function updateRegistrationRulesUI() {
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const courseSelect = document.getElementById('courseSelect');
  const terms = document.getElementById('termsCheck');
  const levelSelected = Array.from(document.querySelectorAll('input[name="learningLevel"]')).some(function (r) { return r.checked; });

  if (!fullName || !email || !password || !confirmPassword || !courseSelect || !terms) return;

  const pwChecks = getPasswordChecks(password.value);
  const nameOk = /^[a-zA-Z\s\-']{2,}$/.test(fullName.value.trim());
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
  const matchOk = confirmPassword.value.length > 0 && confirmPassword.value === password.value;
  const courseOk = courseSelect.value !== '' && levelSelected;

  toggleRule('rule-name', nameOk);
  toggleRule('rule-email', emailOk);
  toggleRule('rule-password-length', pwChecks.length);
  toggleRule('rule-password-lower', pwChecks.lower);
  toggleRule('rule-password-upper', pwChecks.upper);
  toggleRule('rule-password-number', pwChecks.number);
  toggleRule('rule-password-special', pwChecks.special);
  toggleRule('rule-match', matchOk);
  toggleRule('rule-course', courseOk);
  toggleRule('rule-terms', terms.checked);

  updateRegisterSubmitState({
    nameOk: nameOk,
    emailOk: emailOk,
    passwordOk: pwChecks.length && pwChecks.lower && pwChecks.upper && pwChecks.number && pwChecks.special,
    matchOk: matchOk,
    courseOk: courseOk,
    termsOk: terms.checked
  });
}

function updateRegisterSubmitState(status) {
  const submitBtn = document.getElementById('registerSubmitBtn');
  if (!submitBtn || !status) return;

  const ready = status.nameOk && status.emailOk && status.passwordOk && status.matchOk && status.courseOk && status.termsOk;
  submitBtn.disabled = !ready;
}

function toggleRule(ruleId, pass) {
  const rule = document.getElementById(ruleId);
  if (!rule) return;
  if (pass) {
    rule.classList.add('crx-rule-ok');
  } else {
    rule.classList.remove('crx-rule-ok');
  }
}

/** Display an error message and mark the input as invalid */
function showFieldError(fieldId, message) {
  const el      = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + 'Error');

  if (el) {
    if (message) {
      el.classList.add('crx-error');
      el.classList.remove('crx-valid');
    } else {
      el.classList.remove('crx-error');
      if (el.value && el.value.trim() !== '') {
        el.classList.add('crx-valid');
      }
    }
  }

  if (errorEl) {
    errorEl.textContent = message;
  }
}

/** Remove error state from a field */
function clearFieldError(fieldId) {
  const el      = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + 'Error');
  if (el)      el.classList.remove('crx-error');
  if (errorEl) errorEl.textContent = '';
}




function initSignInValidation() {
  const form = document.getElementById('signInForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const email    = document.getElementById('siEmail');
    const password = document.getElementById('siPassword');
    const emailErr = document.getElementById('siEmailError');
    const pwErr    = document.getElementById('siPasswordError');

    // Email
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      emailErr.textContent = 'Please enter a valid email.';
      email.classList.add('crx-error');
      valid = false;
    } else {
      emailErr.textContent = '';
      email.classList.remove('crx-error');
    }

    // Password
    if (!password.value) {
      pwErr.textContent = 'Password is required.';
      password.classList.add('crx-error');
      valid = false;
    } else {
      pwErr.textContent = '';
      password.classList.remove('crx-error');
    }

    if (valid) {
      // Simulate a sign-in (no real backend)
      alert('Sign-in feature requires a backend server. This is a demo.');
    }
  });
}




