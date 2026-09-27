/**
 * CycloneAI Labs — UI Utilities
 * Theme management, modal handling, and general UI helpers.
 */

const CycloneUI = (function () {
  // ===== Theme Management =====

  /**
   * Initialize theme from localStorage or default to light
   */
  function initTheme() {
    const saved = localStorage.getItem('cycloneai_theme');
    const theme = saved || 'light';
    applyTheme(theme);
  }

  /**
   * Apply a theme to the document
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cycloneai_theme', theme);
    updateThemeIcons(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
  }

  /**
   * Update the theme toggle button icons
   */
  function updateThemeIcons(theme) {
    var moonIcon = document.getElementById('icon-moon');
    var sunIcon = document.getElementById('icon-sun');
    if (moonIcon && sunIcon) {
      if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      }
    }
  }


  // ===== Sidebar (Mobile) =====

  function openSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var openIcon = document.getElementById('menu-icon-open');
    var closeIcon = document.getElementById('menu-icon-close');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    if (openIcon) openIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'block';
  }

  function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var openIcon = document.getElementById('menu-icon-open');
    var closeIcon = document.getElementById('menu-icon-close');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    if (openIcon) openIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
  }

  function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }


  // ===== Modal =====

  function showModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
  }

  function hideModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  }


  // ===== Date/Time =====

  /**
   * Format current date/time for display
   * @returns {string}
   */
  function formatCurrentDateTime() {
    var now = new Date();
    var date = now.toISOString().substring(0, 10);
    var time = now.toISOString().substring(11, 16);
    return date + ' ' + time + ' UTC';
  }

  /**
   * Update the overview datetime display
   */
  function updateOverviewDateTime() {
    var el = document.getElementById('overview-datetime');
    if (el) {
      el.textContent = formatCurrentDateTime();
    }
  }


  // ===== Formatting =====

  /**
   * Format a confidence value for display
   * @param {number} val
   * @returns {string}
   */
  function formatConfidence(val) {
    if (val === null || val === undefined) return 'Not available';
    var pct = val > 1 ? val : val * 100;
    return pct.toFixed(1) + '%';
  }

  /**
   * Safe value display — return "Not available" if missing
   * @param {*} val
   * @returns {string}
   */
  function safeValue(val) {
    if (val === null || val === undefined || val === '') return 'Not available';
    return String(val);
  }


  // Public API
  return {
    initTheme: initTheme,
    toggleTheme: toggleTheme,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    toggleSidebar: toggleSidebar,
    showModal: showModal,
    hideModal: hideModal,
    formatCurrentDateTime: formatCurrentDateTime,
    updateOverviewDateTime: updateOverviewDateTime,
    formatConfidence: formatConfidence,
    safeValue: safeValue
  };
})();
