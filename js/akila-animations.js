/* ===========================================================
   Akila Fintech — Scroll-driven reveals + tap-to-pay badge
   No dependencies. ~1.5KB.
   =========================================================== */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    document.querySelectorAll('.ak-reveal, .ak-section').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  // Reveal items as they scroll into view
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  document.querySelectorAll('.ak-reveal, .ak-section').forEach(function (el) {
    revealObserver.observe(el);
  });

  // Tap-to-pay badge: appears after the user has scrolled past the hero
  var tap = document.querySelector('.ak-tap');
  var hero = document.querySelector('.ak-hero');
  if (tap && hero) {
    var tapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // When the hero is OUT of view (not intersecting), show tap
        if (!entry.isIntersecting) {
          tap.classList.add('is-active');
        } else {
          tap.classList.remove('is-active');
        }
      });
    }, { threshold: 0 });
    tapObserver.observe(hero);

    // Tapping the badge scrolls to the contact section
    tap.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('ak-contact') ||
                   document.querySelector('.footer-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();
