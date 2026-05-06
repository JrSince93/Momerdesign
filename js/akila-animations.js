/* ===========================================================
   Akila Fintech — Scroll reveals + section-by-section tap navigation
   No dependencies. ~3KB.
   =========================================================== */
(function () {
  'use strict';

  // -------- Reveal observer --------
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.ak-reveal, .ak-section').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.ak-reveal, .ak-section').forEach(function (el) {
    revealObserver.observe(el);
  });

  // -------- Tap button: section-by-section navigation --------
  var tap = document.querySelector('.ak-tap');
  var hero = document.querySelector('.ak-hero');
  if (!tap) return;

  // Build the list of "navigable sections" — hero + every .ak-section,
  // in document order. The tap button advances through these.
  function getSections() {
    var sections = [];
    if (hero) sections.push(hero);
    Array.prototype.forEach.call(
      document.querySelectorAll('.ak-section'),
      function (s) { sections.push(s); }
    );
    return sections;
  }

  // Show the tap once the user has scrolled past the hero
  if (hero) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) tap.classList.add('is-active');
        else tap.classList.remove('is-active');
      });
    }, { threshold: 0 });
    heroObserver.observe(hero);
  } else {
    tap.classList.add('is-active');
  }

  // Find which section the user is currently looking at.
  // We use the section whose top edge is closest to (but not below)
  // a "viewing line" placed at 25% of viewport height.
  function currentSectionIndex(sections) {
    var lineY = window.innerHeight * 0.25;
    var idx = 0;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top - lineY <= 0) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }

  // Update button mode (final section vs. normal) based on scroll position.
  // We're "final" once the LAST section is the current section.
  function updateMode() {
    var sections = getSections();
    if (!sections.length) return;
    var idx = currentSectionIndex(sections);
    var isFinal = (idx >= sections.length - 1);
    tap.classList.toggle('is-final', isFinal);
    tap.setAttribute(
      'aria-label',
      isFinal ? 'Back to top' : 'Jump to next section'
    );
  }

  var modeTick = null;
  window.addEventListener('scroll', function () {
    if (modeTick) return;
    modeTick = window.requestAnimationFrame(function () {
      updateMode();
      modeTick = null;
    });
  }, { passive: true });
  window.addEventListener('resize', updateMode);
  updateMode();

  // -------- Shoot animation: 3 lines flying toward top-left on click --------
  function fireShot(originX, originY) {
    // Aim slightly past the top-left corner of the viewport
    var targetX = -50;
    var targetY = -50;
    var dx = targetX - originX;
    var dy = targetY - originY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

    // Spawn 3 staggered lines so they look like the contactless waves
    // peeling off the icon in sequence.
    for (var i = 0; i < 3; i++) {
      (function (delay, lateralOffset) {
        setTimeout(function () {
          var shot = document.createElement('span');
          shot.className = 'ak-tap-shot';
          // Perpendicular offset so the three lines stack, not overlap
          var perpRad = (angleDeg + 90) * Math.PI / 180;
          var ox = originX + Math.cos(perpRad) * lateralOffset;
          var oy = originY + Math.sin(perpRad) * lateralOffset;
          shot.style.left = ox + 'px';
          shot.style.top = oy + 'px';
          shot.style.setProperty('--ak-shot-angle', angleDeg + 'deg');
          shot.style.setProperty('--ak-shot-distance', (distance * 1.05) + 'px');
          document.body.appendChild(shot);
          requestAnimationFrame(function () {
            shot.classList.add('is-firing');
          });
          setTimeout(function () {
            if (shot.parentNode) shot.parentNode.removeChild(shot);
          }, 1100);
        }, delay);
      })(i * 80, (i - 1) * 6);
    }
  }

  // -------- Click handler: scroll + fire shot --------
  tap.addEventListener('click', function (e) {
    e.preventDefault();

    var sections = getSections();
    if (!sections.length) return;
    var idx = currentSectionIndex(sections);
    var isFinal = (idx >= sections.length - 1);

    var target;
    if (isFinal) {
      target = sections[0]; // back to top
    } else {
      target = sections[Math.min(idx + 1, sections.length - 1)];
    }

    // Fire the shot from the button's current position
    var rect = tap.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    // Brief tactile press feedback
    tap.classList.add('is-shooting');
    setTimeout(function () { tap.classList.remove('is-shooting'); }, 180);

    fireShot(cx, cy);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

/* ===========================================================
   CJM line interactivity (Section 06)
   Hover/tap a dot → that stage's column lights up + tooltip.
   =========================================================== */
(function () {
  'use strict';

  var cjm = document.querySelector('.ak-cjm');
  if (!cjm) return;

  var points = cjm.querySelectorAll('.ak-cjm__pt');
  if (!points.length) return;

  var tooltip = cjm.querySelector('.ak-cjm__tooltip');
  var chartWrap = cjm.querySelector('.ak-cjm__chart-wrap');

  // Confidence values + stage names — must match SVG y-coordinates
  // (lower y = higher confidence). The graph spans 0-180 viewBox vertically.
  var STAGES = [
    { name: 'Trigger',       score: 65 },
    { name: 'Research',      score: 72 },
    { name: 'Compare',       score: 84 },
    { name: 'Sign up',       score: 90 },
    { name: 'First deposit', score: 50 },
    { name: 'Fraud',         score: 12 },
    { name: 'Refer',         score: 80 }
  ];

  // Build NodeLists of column cells for each lane, in DOM order
  var pills = cjm.querySelectorAll('.ak-cjm__pill');
  var touches = cjm.querySelectorAll('.ak-cjm__touch');
  var thoughts = cjm.querySelectorAll('.ak-cjm__thought');
  var opps = cjm.querySelectorAll('.ak-cjm__opp');

  function clearActive() {
    cjm.classList.remove('is-stage-active');
    points.forEach(function (p) { p.classList.remove('is-active'); });
    pills.forEach(function (p) { p.classList.remove('is-active-stage'); });
    touches.forEach(function (t) { t.classList.remove('is-active-stage'); });
    thoughts.forEach(function (t) { t.classList.remove('is-active-stage'); });
    opps.forEach(function (o) { o.classList.remove('is-active-stage'); });
    if (tooltip) {
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }
  }

  function activateStage(idx, originPt) {
    clearActive();
    cjm.classList.add('is-stage-active');
    if (points[idx]) points[idx].classList.add('is-active');
    if (pills[idx]) pills[idx].classList.add('is-active-stage');
    if (touches[idx]) touches[idx].classList.add('is-active-stage');
    if (thoughts[idx]) thoughts[idx].classList.add('is-active-stage');
    if (opps[idx]) opps[idx].classList.add('is-active-stage');

    // Position tooltip above the dot. We use the dot's bounding box
    // relative to the chart-wrap.
    if (tooltip && chartWrap && originPt) {
      var hit = originPt.querySelector('.ak-cjm__pt-dot') ||
                originPt.querySelector('.ak-cjm__pt-hit');
      if (hit) {
        var dotRect = hit.getBoundingClientRect();
        var wrapRect = chartWrap.getBoundingClientRect();
        var x = dotRect.left + dotRect.width / 2 - wrapRect.left;
        var y = dotRect.top - wrapRect.top;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        var stage = STAGES[idx];
        if (stage) {
          tooltip.innerHTML =
            '<span class="ak-cjm__tooltip-label">' + stage.name + '</span>' +
            '<span class="ak-cjm__tooltip-score">' + stage.score + '/100</span>';
        }
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
      }
    }
  }

  points.forEach(function (pt) {
    var idx = parseInt(pt.getAttribute('data-stage'), 10);
    if (isNaN(idx)) return;

    pt.addEventListener('mouseenter', function () { activateStage(idx, pt); });
    pt.addEventListener('focus', function () { activateStage(idx, pt); });
    pt.addEventListener('click', function (e) {
      e.preventDefault();
      activateStage(idx, pt);
    });
    // Make focusable for keyboard navigation
    pt.setAttribute('tabindex', '0');
    pt.setAttribute('role', 'button');
    pt.setAttribute('aria-label', STAGES[idx] ? STAGES[idx].name + ': ' + STAGES[idx].score + ' of 100' : 'Stage ' + (idx + 1));
  });

  // Clear when leaving the chart wrap entirely
  if (chartWrap) {
    chartWrap.addEventListener('mouseleave', clearActive);
  }
  // Also clear on focusout from the SVG (only if the SVG exists)
  var svg = cjm.querySelector('.ak-cjm__chart-svg');
  if (svg) {
    svg.addEventListener('focusout', function (e) {
      // Only clear if focus is leaving the SVG entirely
      if (!svg.contains(e.relatedTarget)) {
        clearActive();
      }
    });
  }
})();
