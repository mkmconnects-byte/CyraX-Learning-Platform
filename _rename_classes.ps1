$root = "c:\Users\User\Documents\GitHub\course_work_web_2"

# All custom class names — longest first to prevent subset-match issues
$classes = @(
    'contact-section--light',
    'about-img-placeholder',
    'modal-footer-text',
    'course-level-badge',
    'page-hero-subtitle',
    'page-hero-title',
    'course-card-footer',
    'course-card-image',
    'course-card-title',
    'course-card-body',
    'course-card-desc',
    'hero-highlight',
    'course-instructor',
    'loading-spinner',
    'lesson-section',
    'lesson-header',
    'lesson-number',
    'lesson-panel',
    'lesson-title',
    'lesson-item',
    'lesson-icon',
    'lesson-list',
    'lesson-meta',
    'about-highlights',
    'about-section',
    'about-image',
    'about-grid',
    'about-text',
    'badge-foundation',
    'badge-postgraduate',
    'badge-undergraduate',
    'features-section',
    'features-grid',
    'feature-card',
    'feature-icon',
    'courses-section',
    'courses-grid',
    'course-card',
    'course-meta',
    'contact-section',
    'contact-card',
    'contact-grid',
    'contact-icon',
    'filter-btn',
    'filter-bar',
    'footer-bottom',
    'footer-brand',
    'footer-container',
    'footer-grid',
    'footer-col',
    'form-success',
    'form-wrapper',
    'form-group',
    'form-link',
    'form-row',
    'group-label',
    'hamburger',
    'hero-buttons',
    'hero-badge',
    'hero-card',
    'hero-content',
    'hero-stats',
    'hero-subtitle',
    'hero-title',
    'hero-visual',
    'highlight-item',
    'instructor-avatar',
    'logo-accent',
    'logo-icon',
    'logo-text',
    'modal-close',
    'modal-logo',
    'modal-overlay',
    'modal-subtitle',
    'nav-container',
    'nav-links',
    'nav-link',
    'nav-logo',
    'nav-auth',
    'no-results',
    'page-hero',
    'password-wrapper',
    'checkbox-custom',
    'checkbox-group',
    'checkbox-label',
    'radio-custom',
    'radio-group',
    'radio-label',
    'register-section',
    'section-badge',
    'section-header',
    'section-subtitle',
    'section-title',
    'social-links',
    'spinner',
    'stat-divider',
    'stat-item',
    'terms-label',
    'toggle-password',
    'view-lessons-btn',
    'btn-primary',
    'btn-outline',
    'btn-block',
    'btn-large',
    'btn-sm',
    'btn',
    'container',
    'floating',
    'delay-1',
    'delay-2',
    'footer',
    'hero',
    'modal',
    'navbar',
    'required',
    'error-msg',
    'full-width',
    'hidden',
    'active',
    'scrolled',
    'open',
    'error',
    'center'
)

# Build token lookup dictionary
$script:map = @{}
foreach ($cls in $classes) { $script:map[$cls] = "crx-$cls" }

$utf8 = New-Object System.Text.UTF8Encoding $false

# ==============================================================
# CSS — replace .classname selectors only (after the dot)
# ==============================================================
Write-Host "Processing style.css..."
$cssPath = "$root\style.css"
$css = [System.IO.File]::ReadAllText($cssPath)
foreach ($cls in $classes) {
    $esc = [regex]::Escape($cls)
    $css = [regex]::Replace($css, "(?<=\.)$esc(?![a-zA-Z0-9_-])", "crx-$cls")
}
[System.IO.File]::WriteAllText($cssPath, $css, $utf8)
Write-Host "  Done."

# ==============================================================
# HTML — replace tokens inside class="..." attributes only
# ==============================================================
$htmlAttrRx = [regex]'(?<=class=")([^"]*)'

$htmlFiles = @("index.html", "about.html", "contact.html", "courses.html", "register.html")
foreach ($fname in $htmlFiles) {
    Write-Host "Processing $fname..."
    $fpath = "$root\$fname"
    $content = [System.IO.File]::ReadAllText($fpath)

    $content = $htmlAttrRx.Replace($content, {
        param($m)
        $tokens = $m.Groups[1].Value -split ' '
        $renamed = $tokens | ForEach-Object {
            if ($script:map.ContainsKey($_)) { $script:map[$_] } else { $_ }
        }
        $renamed -join ' '
    })

    [System.IO.File]::WriteAllText($fpath, $content, $utf8)
    Write-Host "  Done."
}

# ==============================================================
# JavaScript
#   Pass 1 — class="..." inside template literals
#   Pass 2 — querySelector/closest patterns like '.classname'
#   Pass 3 — bare class name strings like 'classname'
# ==============================================================
Write-Host "Processing script.js..."
$jsPath = "$root\script.js"
$js = [System.IO.File]::ReadAllText($jsPath)

# Pass 1: class="..." in template literals
$js = $htmlAttrRx.Replace($js, {
    param($m)
    $tokens = $m.Groups[1].Value -split ' '
    $renamed = $tokens | ForEach-Object {
        if ($script:map.ContainsKey($_)) { $script:map[$_] } else { $_ }
    }
    $renamed -join ' '
})

# Pass 2: CSS selector strings — '.classname' and ".classname"
foreach ($cls in $classes) {
    $esc = [regex]::Escape($cls)
    $js = [regex]::Replace($js, "(?<='\.)$esc(?=')", "crx-$cls")
    $js = [regex]::Replace($js, '(?<="\.)' + $esc + '(?=")', "crx-$cls")
}

# Pass 3: bare quoted class name strings — 'classname'
foreach ($cls in $classes) {
    $esc = [regex]::Escape($cls)
    $js = [regex]::Replace($js, "(?<=')$esc(?=')", "crx-$cls")
}

[System.IO.File]::WriteAllText($jsPath, $js, $utf8)
Write-Host "  Done."

Write-Host ""
Write-Host "All files updated. Every custom class now has the 'crx-' prefix."
