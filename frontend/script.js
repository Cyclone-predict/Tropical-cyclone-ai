/**
 * CycloneAI Labs — Main Application Entry Point
 * Initializes all modules and binds global UI events.
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Initialize UI (Theme & Date)
  if (typeof CycloneUI !== 'undefined') {
    CycloneUI.initTheme();
    CycloneUI.updateOverviewDateTime();
    
    // Update time every minute
    setInterval(CycloneUI.updateOverviewDateTime, 60000);
  }

  // 2. Initialize Navigation
  if (typeof CycloneNavigation !== 'undefined') {
    CycloneNavigation.init();
  }

  // 3. Initialize Analysis Module
  if (typeof CycloneAnalysis !== 'undefined') {
    CycloneAnalysis.init();
    CycloneAnalysis.initXAIControls();
  }

  // 4. Bind Theme Toggle Button
  var themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      if (typeof CycloneUI !== 'undefined') {
        CycloneUI.toggleTheme();
      }
    });
  }

  // 5. Bind Mobile Sidebar Menu
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      if (typeof CycloneUI !== 'undefined') {
        CycloneUI.toggleSidebar();
      }
    });
  }

  // 6. Bind Mobile Overlay Click
  var sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
      if (typeof CycloneUI !== 'undefined') {
        CycloneUI.closeSidebar();
      }
    });
  }
});
