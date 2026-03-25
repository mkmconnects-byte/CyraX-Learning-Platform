
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


