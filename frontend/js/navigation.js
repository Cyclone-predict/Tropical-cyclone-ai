/**
 * CycloneAI Labs — Navigation Module
 * Handles sidebar navigation and page transitions.
 */

const CycloneNavigation = (function () {
  
  function init() {
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        var targetPage = item.getAttribute('data-page');
        navigateTo(targetPage);
        if (typeof CycloneUI !== 'undefined') {
          CycloneUI.closeSidebar(); // close mobile sidebar if open
        }
      });
    });

    // Overview buttons
    var analyzeBtn = document.getElementById('cta-analyze');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', function() {
        navigateTo('analysis');
      });
    }

    var exploreBtn = document.getElementById('cta-explore');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', function() {
        navigateTo('architecture');
      });
    }
    
    // Initial page based on hash or default to overview
    var hash = window.location.hash.substring(1);
    if (hash && document.getElementById('page-' + hash)) {
      navigateTo(hash);
    } else {
      navigateTo('overview');
    }
  }

  function navigateTo(pageId) {
    // Hide all pages
    var pages = document.querySelectorAll('.page-section');
    pages.forEach(function(page) {
      page.classList.remove('active');
    });

    // Show target page
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
    }

    // Update nav active state
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    if(history.pushState) {
      history.pushState(null, null, '#' + pageId);
    }
    else {
      window.location.hash = '#' + pageId;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  return {
    init: init,
    navigateTo: navigateTo
  };
})();
