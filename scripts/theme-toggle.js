// === Theme & Settings Toggle ==================================================
// All state stored in localStorage, applied via data-* attributes on <html>.
// CSS custom properties do all visual work — JS never touches individual elements.
// MDN CSS Custom Properties: "Switch themes by toggling a data-theme attribute
// on <html> — because all components reference the same var names, every colour
// updates automatically with a single attribute change."
// =============================================================================

// -- 1. THEME -----------------------------------------------------------------
function getCurrentTheme() {
  var saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// -- 2. TRANSPARENT MODE ------------------------------------------------------
// Same pattern as applyTheme: one data-attribute on <html>, CSS handles the rest.
function getTransparentMode() {
  return localStorage.getItem('transparent') === 'true';
}
function applyTransparent(enabled) {
  document.documentElement.setAttribute('data-transparent', enabled ? 'true' : 'false');
  localStorage.setItem('transparent', enabled);
}

// -- 3. SYNC SWITCHES ---------------------------------------------------------
function syncSwitches() {
  var ts = document.getElementById('switch-theme');
  var ps = document.getElementById('switch-transparent');
  if (ts) ts.checked = getCurrentTheme() === 'dark';
  if (ps) ps.checked = getTransparentMode();
}

// -- 4. DROPDOWN --------------------------------------------------------------
function openDropdown(el) {
  el.setAttribute('data-open', 'true');
  var t = el.querySelector('.settings-trigger');
  if (t) t.setAttribute('aria-expanded', 'true');
}
function closeDropdown(el) {
  el.removeAttribute('data-open');
  var t = el.querySelector('.settings-trigger');
  if (t) t.setAttribute('aria-expanded', 'false');
}
function toggleDropdown(el) {
  el.hasAttribute('data-open') ? closeDropdown(el) : openDropdown(el);
}

// -- 5. INIT ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  applyTheme(getCurrentTheme());
  applyTransparent(getTransparentMode());

  var dropdown          = document.querySelector('.settings-menu');
  var triggerBtn        = document.getElementById('settings-trigger');
  var themeSwitch       = document.getElementById('switch-theme');
  var transparentSwitch = document.getElementById('switch-transparent');

  if (!dropdown) return;
  syncSwitches();

  if (triggerBtn) {
    triggerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown(dropdown);
    });
  }
  if (themeSwitch) {
    themeSwitch.addEventListener('change', function() {
      applyTheme(themeSwitch.checked ? 'dark' : 'light');
    });
  }
  if (transparentSwitch) {
    transparentSwitch.addEventListener('change', function() {
      applyTransparent(transparentSwitch.checked);
    });
  }

  // pointerdown fires before click — prevents the outside click that closes
  // the panel from immediately re-opening it via the trigger button.
  document.addEventListener('pointerdown', function(e) {
    if (dropdown.hasAttribute('data-open') && !dropdown.contains(e.target)) {
      closeDropdown(dropdown);
    }
  });

  // WCAG 2.1 §3.2.2 — Escape closes the panel, focus returns to trigger
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && dropdown.hasAttribute('data-open')) {
      closeDropdown(dropdown);
      if (triggerBtn) triggerBtn.focus();
    }
  });
});

// -- 6. SYSTEM THEME LISTENER -------------------------------------------------
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
      syncSwitches();
    }
  });
}
