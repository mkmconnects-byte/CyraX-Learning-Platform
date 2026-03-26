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


function initHeroCarousel() {
  const carousel = document.getElementById('heroCarousel');
  const maxSlides = 3;
  let currentIndex = 0;

  if (!carousel) return;

  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = maxSlides - 1;
    } else if (index >= maxSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); resetInterval(); });

  let intervalId;
  function startInterval() {
    intervalId = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  function resetInterval() {
    clearInterval(intervalId);
    startInterval();
  }

// start autoplay
  startInterval();
}

/** Trending Courses Carousel */
function initTrendingCarousel() {
  const carousel = document.getElementById('trendingCarousel');
  const prevBtn = document.getElementById('trendingPrev');
  const nextBtn = document.getElementById('trendingNext');

  if (!carousel || !prevBtn || !nextBtn) return;

  let scrollPosition = 0;
  const cardWidth = 280; // approximate width
  const gap = 24; // gap between cards
  const step = cardWidth + gap;

  function handleScroll(direction) {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    if (direction === 'next') {
      scrollPosition = Math.min(scrollPosition + step, maxScroll);
    } else {
      scrollPosition = Math.max(scrollPosition - step, 0);
    }

    carousel.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }

  prevBtn.addEventListener('click', () => handleScroll('prev'));
  nextBtn.addEventListener('click', () => handleScroll('next'));
}

/** Language Selector */
function initLanguageSelector() {
  const toggle = document.getElementById('languageToggle');
  const dropdown = document.getElementById('languageDropdown');
  const options = document.querySelectorAll('.crx-language-option');

  if (!toggle || !dropdown) return;

// Toggle dropdown visibility
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    dropdown.classList.toggle('crx-show');
    toggle.classList.toggle('crx-active');
  });

// Handle language selection
  options.forEach(function (option) {
    option.addEventListener('click', function (e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      
// Only allow English to be fully functional
      if (lang === 'en') {
// Update active state in dropdown
        options.forEach(function (opt) {
          opt.classList.remove('crx-language-active');
        });
        this.classList.add('crx-language-active');

// Update toggle button text
        const langText = toggle.querySelector('.crx-language-text');
        langText.textContent = 'English';

// Close dropdown
        dropdown.classList.remove('crx-show');
        toggle.classList.remove('crx-active');
      } else if (lang === 'si') {
// Show alert for Sinhala (viewing only)
        alert('Sinhala translation coming soon!');
        return;
      } else if (lang === 'ta') {
// Show alert for Tamil (viewing only)
        alert('Tamil translation coming soon!');
        return;
      }
    });
  });

// Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.crx-language-selector')) {
      dropdown.classList.remove('crx-show');
      toggle.classList.remove('crx-active');
    }
  });
}


document.addEventListener('DOMContentLoaded', function () {
// UI interactions
  initNavbar();
  initHamburger();
  initHeroCarousel();
  initModals();
  initPasswordToggles();
  initLanguageSelector();
  initFilters();
  initFeedbackCarousel();

// Form validation
  initFormValidation();
  initSignInValidation();
  initContactForm();

  // Initialize carousels
  initHeroCarousel();
  initFeedbackCarousel();

  loadCourses();
});
