/**
 * script.js — CyraX Online Learning Platform
 * -----------------------------------------------
 * Handles:
 *  1. Loading course data from courses.xml (XMLHttpRequest)
 *  2. Dynamically rendering course cards
 *  3. Filtering courses by level
 *  4. Displaying lessons when a course is selected
 *  5. Populating the registration form's course dropdown
 *  6. JavaScript form validation (no HTML5 built-in validation)
 *  7. UI interactions (navbar scroll, hamburger, modal, password toggle)
 */

/* ============================================================
   GLOBAL STATE
   ============================================================ */
let allCourses = []; // Stores all parsed course objects from XML
let activeFilter = 'All'; // Currently selected filter level

/* ============================================================
   1. XML LOADING
   ============================================================
   Uses XMLHttpRequest (XHR) to fetch courses.xml.
   The XML is parsed using the browser's DOMParser.
   Each <course> element is mapped to a plain JavaScript object.
   ============================================================ */
function loadCourses() {
  const xhr = new XMLHttpRequest();

  // Open a GET request for the local XML file
  xhr.open('GET', 'courses.xml', true);
  xhr.overrideMimeType('text/xml');

  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      // Parse the XML response
      const xmlDoc = xhr.responseXML;

      if (!xmlDoc) {
        console.error('Failed to parse XML document.');
        hideSpinner();
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

      hideSpinner();
      renderCourses(allCourses);          // Display all courses
      populateCourseDropdown(allCourses); // Fill the register form's <select>
    } else {
      console.error('XHR error: ' + xhr.status);
      hideSpinner();
    }
  };

  xhr.onerror = function () {
    console.error('Network error while loading courses.xml');
    hideSpinner();
  };

  xhr.send();
}

/** Helper: safely get text content of first matching child element */
function getNodeText(parentNode, tagName) {
  const el = parentNode.querySelector(tagName);
  return el ? el.textContent.trim() : '';
}

function hideSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}

/* ============================================================
   2. RENDERING COURSES
   ============================================================
   Builds course card HTML dynamically and injects it into
   the #coursesGrid div. No templating library is used.
   ============================================================ */
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  const noResults = document.getElementById('noResults');
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

/* ============================================================
   3. COURSE FILTERING
   ============================================================
   Listens for clicks on the filter buttons. Filters the
   allCourses array and re-renders only matching courses.
   ============================================================ */
function initFilters() {
  const filterBar = document.getElementById('filterBar');

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

/* ============================================================
   4. LESSON VIEWER
   ============================================================
   When a "View Lessons" button is clicked, the lesson section
   scrolls into view and shows the lesson list for that course.
   ============================================================ */
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

/* ============================================================
   5. POPULATE COURSE DROPDOWN IN REGISTRATION FORM
   ============================================================
   Adds an <option> for each course into the select element.
   ============================================================ */
function populateCourseDropdown(courses) {
  const select = document.getElementById('courseSelect');
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
}

/* ============================================================
   6. FORM VALIDATION
   ============================================================
   Validates: Full Name, Email, Password, Confirm Password,
   Course Selection, Learning Level, and Terms checkbox.
   Uses pure JavaScript — NO HTML5 built-in validation.
   Displays inline error messages on failure.
   Shows a success message on pass.
   ============================================================ */
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
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'crx-center' });
    }
  });

  // Also validate-on-blur for a better UX feel
  ['fullName', 'email', 'password', 'confirmPassword', 'courseSelect'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function () {
        validateField(id);
      });
      // Clear error on input
      el.addEventListener('input', function () {
        clearFieldError(id);
      });
    }
  });
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
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters.';
      } else if (!/[A-Z]/.test(value)) {
        error = 'Password must contain at least one uppercase letter.';
      } else if (!/[0-9]/.test(value)) {
        error = 'Password must contain at least one number.';
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
  return error === '';
}

/** Validate radio button group for learning level */
function validateLearningLevel() {
  const radios = document.querySelectorAll('input[name="learningLevel"]');
  const selected = Array.from(radios).some(function (r) { return r.checked; });
  const errorEl = document.getElementById('levelError');

  if (!selected) {
    if (errorEl) errorEl.textContent = 'Please select a learning level.';
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  return true;
}

/** Validate the terms checkbox */
function validateTerms() {
  const terms   = document.getElementById('termsCheck');
  const errorEl = document.getElementById('termsError');

  if (!terms.checked) {
    if (errorEl) errorEl.textContent = 'You must agree to the Terms of Service.';
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  return true;
}

/** Display an error message and mark the input as invalid */
function showFieldError(fieldId, message) {
  const el      = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + 'Error');

  if (el) {
    if (message) {
      el.classList.add('crx-error');
    } else {
      el.classList.remove('crx-error');
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

/* ============================================================
   Sign-In Modal form mini-validation
   ============================================================ */
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

/* ============================================================
   7. UI INTERACTIONS
   ============================================================ */

/** Navbar: add shadow on scroll & highlight active link */
function initNavbar() {
  const navbar = document.getElementById('crx-navbar');
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

/** Highlight the nav link matching the visible section.
 *  Only runs on the single-page version; on multi-page the
 *  active class is already set in the HTML and only updated
 *  when a section is actually found in the viewport. */
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
  const btn   = document.getElementById('crx-hamburger');
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

  // Go to register section — link now points directly to register.html, no JS needed

  // Sign Up is now an <a href="register.html"> link — no JS handler needed
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
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'crx-center' });
      }
    }
  });
}

/* ============================================================
   INITIALISATION
   All setup runs after the DOM is fully loaded.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  // UI interactions
  initNavbar();
  initHamburger();
  initModals();
  initPasswordToggles();
  initBackButton();
  initFilters();

  // Form validation
  initFormValidation();
  initSignInValidation();
  initContactForm();

  // Load and display XML course data
  // loadCourses() triggers: renderCourses() and populateCourseDropdown()
  loadCourses();
});
