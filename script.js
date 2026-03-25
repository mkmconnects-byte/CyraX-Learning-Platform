
let allCourses = []; 
let activeFilter = 'All'; 

function getFallbackCourses() {
  return [
    { id: 'c1', level: 'Foundation', title: 'Introduction to Programming', duration: '6 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c2', level: 'Foundation', title: 'Web Development Fundamentals', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c3', level: 'Undergraduate', title: 'JavaScript Essentials', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c4', level: 'Undergraduate', title: 'Advanced Java Programming', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c5', level: 'Undergraduate', title: 'Data Structures and Algorithms', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c6', level: 'Undergraduate', title: 'Database Systems', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c7', level: 'Undergraduate', title: 'Software Engineering', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c8', level: 'Foundation', title: 'UI/UX Design Principles', duration: '6 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c9', level: 'Postgraduate', title: 'Cybersecurity Basics', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c10', level: 'Postgraduate', title: 'Artificial Intelligence Fundamentals', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c11', level: 'Foundation', title: 'Digital Marketing Fundamentals', duration: '7 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c12', level: 'Postgraduate', title: 'Cloud Computing and DevOps', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c13', level: 'Foundation', title: 'Introduction to HTML & CSS', duration: '4 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c14', level: 'Foundation', title: 'Basic Mathematics for IT', duration: '5 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c15', level: 'Foundation', title: 'IT System Fundamentals', duration: '6 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c16', level: 'Foundation', title: 'Introduction to Data Analysis', duration: '4 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c17', level: 'Foundation', title: 'Digital Logic Design', duration: '5 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c18', level: 'Foundation', title: 'Computer Networking 101', duration: '6 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c19', level: 'Undergraduate', title: 'Object-Oriented Programming', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c20', level: 'Undergraduate', title: 'Operating Systems Concepts', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c21', level: 'Undergraduate', title: 'Human-Computer Interaction', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c22', level: 'Undergraduate', title: 'Mobile App Development', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c23', level: 'Undergraduate', title: 'Network Routing and Switching', duration: '8 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c24', level: 'Undergraduate', title: 'Introduction to Machine Learning', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c25', level: 'Postgraduate', title: 'Advanced Artificial Intelligence', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c26', level: 'Postgraduate', title: 'Big Data Analytics', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c27', level: 'Postgraduate', title: 'Advanced Cryptography', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c28', level: 'Postgraduate', title: 'Quantum Computing Fundamentals', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c29', level: 'Postgraduate', title: 'Blockchain', duration: '10 Weeks', instructor: '', description: '', image: '', lessons: [] },
    { id: 'c30', level: 'Postgraduate', title: 'Advanced Software Architecture', duration: '12 Weeks', instructor: '', description: '', image: '', lessons: [] }
  ];
}

function useFallbackCourses(reason) {
  console.warn('Using fallback course data: ' + reason);
  allCourses = getFallbackCourses();
  hideSpinner();
  renderCourses(allCourses);
  populateCourseDropdown(allCourses);
}

function loadCourses() {
  const hasCourseDropdown = !!document.getElementById('courseSelect');
  console.log('[loadCourses] hasCourseDropdown:', hasCourseDropdown);

  // Ensure register page dropdown is usable immediately, even before network/XML completes.
  if (hasCourseDropdown) {
    const fallbackNow = getFallbackCourses();
    console.log('[loadCourses] Populating with', fallbackNow.length, 'fallback courses');
    populateCourseDropdown(fallbackNow);
  }

  const xhr = new XMLHttpRequest();

  try {
    xhr.open('GET', 'courses.xml', true);
    xhr.overrideMimeType('text/xml');
  } catch (err) {
    useFallbackCourses('XHR open failed');
    return;
  }

  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      // Parse the XML response
      let xmlDoc = xhr.responseXML;

      // Some servers/local environments do not populate responseXML reliably.
      // Fallback to parsing responseText manually so dropdown/course loading still works.
      if (!xmlDoc && xhr.responseText) {
        try {
          xmlDoc = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
          const parseError = xmlDoc.querySelector('parsererror');
          if (parseError) {
            xmlDoc = null;
          }
        } catch (err) {
          xmlDoc = null;
        }
      }

      if (!xmlDoc) {
        useFallbackCourses('XML parsing failed');
        return;
      }

      // Extract all <course> nodes
      const courseNodes = xmlDoc.querySelectorAll('course');

      // Map each XML node into a JavaScript object
      allCourses = Array.from(courseNodes).map(function (node) {
        const lessons = Array.from(node.querySelectorAll('lesson')).map(function (l) {
          return l.textContent.trim();
        });

        return {
          id:          node.getAttribute('id'),
          level:       node.getAttribute('level'),
          title:       getNodeText(node, 'title'),
          duration:    getNodeText(node, 'duration'),
          instructor:  getNodeText(node, 'instructor'),
          description: getNodeText(node, 'description'),
          image:       getNodeText(node, 'image'),
          lessons:     lessons
        };
      });

      if (allCourses.length === 0) {
        useFallbackCourses('No course nodes found in XML');
        return;
      }

      hideSpinner();
      renderCourses(allCourses);          
      populateCourseDropdown(allCourses);
    } else {
      useFallbackCourses('XHR status ' + xhr.status);
    }
  };

  xhr.onerror = function () {
    useFallbackCourses('Network error while loading courses.xml');
  };

  try {
    xhr.send();
  } catch (err) {
    useFallbackCourses('XHR send failed');
  }
}


function getNodeText(parentNode, tagName) {
  const el = parentNode.querySelector(tagName);
  return el ? el.textContent.trim() : '';
}

function hideSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}


function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  const noResults = document.getElementById('noResults');

  // Some pages (e.g., register page) do not have a courses grid.
  if (!grid) return;

  grid.innerHTML = '';

  if (courses.length === 0) {
    noResults.classList.remove('crx-hidden');
    return;
  }

  noResults.classList.add('crx-hidden');

  courses.forEach(function (course) {
    const card = document.createElement('div');
    card.className = 'crx-course-card';
    card.setAttribute('data-id', course.id);
    card.setAttribute('data-level', course.level);

    // Determine badge CSS class based on level
    const badgeClass = getBadgeClass(course.level);

    // Generate instructor initials for avatar
    const initials = getInitials(course.instructor);

    // Build the card's inner HTML
    card.innerHTML = `
      <div class="crx-course-card-image">
        <img src="${escapeHtml(course.image)}"
             alt="${escapeHtml(course.title)}"
             onerror="this.parentElement.innerHTML='<i class=\\"fas fa-book-open\\"></i>'" />
      </div>
      <div class="crx-course-card-body">
        <span class="crx-course-level-badge ${badgeClass}">${escapeHtml(course.level)}</span>
        <h3 class="crx-course-card-title">${escapeHtml(course.title)}</h3>
        <p class="crx-course-card-desc">${escapeHtml(course.description)}</p>
        <div class="crx-course-meta">
          <span><i class="fas fa-clock"></i> ${escapeHtml(course.duration)}</span>
          <span><i class="fas fa-list"></i> ${course.lessons.length} Lessons</span>
        </div>
      </div>
      <div class="crx-course-card-footer">
        <div class="crx-course-instructor">
          <div class="crx-instructor-avatar">${escapeHtml(initials)}</div>
          <span>${escapeHtml(course.instructor)}</span>
        </div>
        <button class="crx-btn crx-btn-outline crx-view-lessons-btn"
                data-id="${escapeHtml(course.id)}">
          View Lessons
        </button>
      </div>
    `;

    // Attach click listeners to card and button
    card.addEventListener('click', function () {
      showLessons(course.id);
    });

    grid.appendChild(card);
  });
}

/** Return the CSS class name for a level badge */
function getBadgeClass(level) {
  const map = {
    'Foundation':    'crx-badge-foundation',
    'Undergraduate': 'crx-badge-undergraduate',
    'Postgraduate':  'crx-badge-postgraduate'
  };
  return map[level] || 'crx-badge-foundation';
}

/** Generate up-to-2-letter initials from an instructor name */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.replace(/^(Dr\.|Prof\.|Ms\.|Mr\.)\s+/i, '').split(' ');
  return parts.slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
}

/** Basic HTML escaping to prevent XSS when injecting data from XML into innerHTML */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


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

  // 1. Full Name — required, letters and spaces only, min 2 chars
  if (!validateField('fullName'))       valid = false;
  // 2. Email — required, valid format
  if (!validateField('email'))          valid = false;
  // 3. Password — required, min 8 chars
  if (!validateField('password'))       valid = false;
  // 4. Confirm Password — must match
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




function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.crx-nav-link');

  // Scroll shadow
  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.classList.add('crx-scrolled');
    } else {
      navbar.classList.remove('crx-scrolled');
    }

    // Highlight the active section link
    updateActiveNavLink();
  });

  // Smooth scroll for anchor links and active class
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.remove('crx-active'); });
      link.classList.add('crx-active');
      // Close mobile menu if open
      document.getElementById('navLinks').classList.remove('crx-open');
    });
  });
}




function updateActiveNavLink() {
  const sections = ['home', 'courses', 'register', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.crx-nav-link');
  let current = '';

  sections.forEach(function (id) {
    const section = document.getElementById(id);
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom > 100) {
      current = id;
    }
  });

  // Only update active state when a section is found in the viewport
  if (current === '') return;

  navLinks.forEach(function (link) {
    link.classList.remove('crx-active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('crx-active');
    }
  });
}

/** Hamburger menu toggle (mobile) */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');

  btn.addEventListener('click', function () {
    links.classList.toggle('crx-open');
  });
}

/** Sign In / Sign Up modal */
function initModals() {
  const signInModal = document.getElementById('signInModal');
  const signInBtn   = document.getElementById('signInBtn');
  const closeSignIn = document.getElementById('closeSignIn');

  // Open sign-in modal
  if (signInBtn) {
    signInBtn.addEventListener('click', function () {
      signInModal.classList.remove('crx-hidden');
    });
  }

  // Close modal via X button
  if (closeSignIn) {
    closeSignIn.addEventListener('click', function () {
      signInModal.classList.add('crx-hidden');
    });
  }

  // Click overlay to close
  if (signInModal) {
    signInModal.addEventListener('click', function (e) {
      if (e.target === signInModal) {
        signInModal.classList.add('crx-hidden');
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      signInModal.classList.add('crx-hidden');
    }
  });

 


}

/** Password visibility toggle */
function initPasswordToggles() {
  document.querySelectorAll('.crx-toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.querySelector('i').className = 'fas fa-eye-slash';
      } else {
        input.type = 'password';
        btn.querySelector('i').className = 'fas fa-eye';
      }
    });
  });
}

/** Back button in lesson viewer */
function initBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      hideLessons();
      const coursesSection = document.getElementById('courses');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/** Contact form validation (contact.html) */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Name
    const name = document.getElementById('contactName');
    const nameErr = document.getElementById('contactNameError');
    if (!name.value.trim() || name.value.trim().length < 2) {
      nameErr.textContent = 'Please enter your name.';
      name.classList.add('crx-error');
      valid = false;
    } else {
      nameErr.textContent = '';
      name.classList.remove('crx-error');
    }

    // Email
    const email = document.getElementById('contactEmail');
    const emailErr = document.getElementById('contactEmailError');
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      emailErr.textContent = 'Please enter a valid email address.';
      email.classList.add('crx-error');
      valid = false;
    } else {
      emailErr.textContent = '';
      email.classList.remove('crx-error');
    }

    // Subject
    const subject = document.getElementById('contactSubject');
    const subjectErr = document.getElementById('contactSubjectError');
    if (!subject.value.trim()) {
      subjectErr.textContent = 'Please enter a subject.';
      subject.classList.add('crx-error');
      valid = false;
    } else {
      subjectErr.textContent = '';
      subject.classList.remove('crx-error');
    }

    // Message
    const message = document.getElementById('contactMessage');
    const messageErr = document.getElementById('contactMessageError');
    if (!message.value.trim() || message.value.trim().length < 10) {
      messageErr.textContent = 'Please enter a message (at least 10 characters).';
      message.classList.add('crx-error');
      valid = false;
    } else {
      messageErr.textContent = '';
      message.classList.remove('crx-error');
    }

    if (valid) {
      form.style.display = 'none';
      const successMsg = document.getElementById('contactSuccess');
      if (successMsg) {
        successMsg.classList.remove('crx-hidden');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

function initFeedbackCarousel() {
  const nextBtn = document.getElementById('feedbackNext');
  const scrollContainer = document.getElementById('feedbackScroll');
  if (!nextBtn || !scrollContainer) return;

  let currentIndex = 0;
  // Based on the CSS, cards are either 3 (desktop), 2 (tablet), or 1 (mobile) per view
  // To keep it simple, we'll advance by 1 card width + margin each click.
  
  nextBtn.addEventListener('click', () => {
    const cards = scrollContainer.querySelectorAll('.crx-feedback-card');
    if (cards.length === 0) return;
    
    // Total cards is 10. Show 3 at a time max.
    const maxIndex = cards.length - 1;
    currentIndex++;
    
    // If we reach the end, loop back around
    if (currentIndex > maxIndex - 2) { 
        // A smarter way is just reading the card width
        currentIndex = 0; 
    }

    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth;
    const style = window.getComputedStyle(firstCard);
    const marginRight = parseFloat(style.marginRight) || 0;
    
    const moveAmount = (cardWidth + marginRight) * currentIndex;
    scrollContainer.style.transform = `translateX(-${moveAmount}px)`;
  });
}


document.addEventListener('DOMContentLoaded', function () {
  // UI interactions
  initNavbar();
  initHamburger();
  initModals();
  initPasswordToggles();
  initFilters();
  initFeedbackCarousel();

  // Form validation
  initFormValidation();
  initSignInValidation();
  initContactForm();

  // Load and display XML course data
  // loadCourses() triggers: renderCourses() and populateCourseDropdown()
  loadCourses();
});
