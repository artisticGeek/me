/* ════════════════════════════════════════════════════════════════════════════
   Personal site · vanilla JS · no dependencies
   ════════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // Mark body so CSS can scope reveal animations to JS-enabled state
  document.body.classList.add('js');

  // ────────────────────────────────────────────────────────────────────────
  // GA HELPER — safe wrapper so missing gtag never throws
  // ────────────────────────────────────────────────────────────────────────
  function gaEvent(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // ────────────────────────────────────────────────────────────────────────
  // 0. WELCOME MODAL
  // ────────────────────────────────────────────────────────────────────────
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const welcomeExplore = document.getElementById('welcomeExplore');
  const welcomeDownload = document.getElementById('welcomeDownload');
  const pdfFab = document.getElementById('pdfFab');

  function dismissWelcome() {
    if (!welcomeOverlay) return;
    welcomeOverlay.classList.add('is-condensing');
    document.body.style.overflow = '';
    setTimeout(() => {
      welcomeOverlay.style.display = 'none';
      if (pdfFab) pdfFab.classList.add('is-visible');
    }, 600);
  }

  if (welcomeOverlay) {
    document.body.style.overflow = 'hidden';
    if (welcomeExplore)  welcomeExplore.addEventListener('click', () => { gaEvent('welcome_explore'); dismissWelcome(); });
    if (welcomeDownload) welcomeDownload.addEventListener('click', () => { gaEvent('resume_download', { source: 'modal' }); setTimeout(dismissWelcome, 200); });
  }

  if (pdfFab) pdfFab.addEventListener('click', () => gaEvent('resume_download', { source: 'fab' }));


  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ────────────────────────────────────────────────────────────────────────
  // 1. COLLEGE REVEAL — collapse/expand the pre-2018 segment
  // ────────────────────────────────────────────────────────────────────────
  const collegeToggle = document.querySelector('.college-toggle');
  const collegeSegment = document.getElementById('college-segment');
  const collegeContent = document.getElementById('college-content');

  if (collegeToggle && collegeSegment && collegeContent) {
    collegeToggle.addEventListener('click', () => {
      const isOpen = collegeToggle.getAttribute('aria-expanded') === 'true';
      const next = !isOpen;
      gaEvent('college_expand', { action: next ? 'expand' : 'collapse' });
      collegeToggle.setAttribute('aria-expanded', String(next));
      if (next) {
        collegeSegment.hidden = false;
        collegeContent.hidden = false;
        collegeToggle.querySelector('.college-toggle-label').textContent = '2014 — 2018 · Hide';
      } else {
        collegeSegment.hidden = true;
        collegeContent.hidden = true;
        collegeToggle.querySelector('.college-toggle-label').textContent = '2014 — 2018 · Before the career';
      }
      // Sync mobile toggle state
      const mobileToggle = document.querySelector('.college-toggle-mobile');
      if (mobileToggle && mobileToggle !== collegeToggle) {
        mobileToggle.setAttribute('aria-expanded', String(next));
        mobileToggle.querySelector('.college-toggle-label').textContent =
          next ? '2014 — 2018 · Hide' : '2014 — 2018 · Before the career';
      }
    });
  }

  // Mobile college toggle (separate button in content column)
  const mobileCollegeToggle = document.querySelector('.college-toggle-mobile');
  if (mobileCollegeToggle && collegeContent) {
    mobileCollegeToggle.addEventListener('click', () => {
      const isOpen = mobileCollegeToggle.getAttribute('aria-expanded') === 'true';
      const next = !isOpen;
      mobileCollegeToggle.setAttribute('aria-expanded', String(next));
      collegeContent.hidden = !next;
      mobileCollegeToggle.querySelector('.college-toggle-label').textContent =
        next ? '2014 — 2018 · Hide' : '2014 — 2018 · Before the career';
      // Sync desktop toggle
      if (collegeToggle && collegeSegment) {
        collegeToggle.setAttribute('aria-expanded', String(next));
        collegeSegment.hidden = !next;
        collegeToggle.querySelector('.college-toggle-label').textContent =
          next ? '2014 — 2018 · Hide' : '2014 — 2018 · Before the career';
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 2. TIMELINE SYNC — highlight active station + scroll-driven scope line
  // ────────────────────────────────────────────────────────────────────────
  const roleCards = Array.from(document.querySelectorAll('[data-role]'));
  const stationByRole = {
    nagarro:   document.querySelector('[data-station="nagarro"]'),
    blackrock: document.querySelector('[data-station="blackrock"]'),
    telekom:   document.querySelector('[data-station="telekom"]'),
    dpworld:   document.querySelector('[data-station="dpworld"]'),
  };

  const scopeByRole = {
    nagarro:   'tickets · features',
    blackrock: 'performance wins',
    telekom:   'services · systems',
    dpworld:   'platforms · products',
  };

  const stageByRole = {
    nagarro:   'The Junior',
    blackrock: 'The Performance Engineer',
    telekom:   'The Service Owner',
    dpworld:   'The Tech Lead',
  };

  const scopeFill  = document.querySelector('.scope-line-fill');
  const scopeValue = document.querySelector('.scope-value');
  const watermark  = document.querySelector('.watermark');
  const watermarkStage = document.querySelector('[data-stage-target]');
  const progressFill = document.querySelector('.scroll-progress-fill');
  const masthead = document.querySelector('.masthead');

  let currentRole = null;
  let lastStageText = 'The Student';

  function setStage(text) {
    if (!watermarkStage || text === lastStageText) return;
    watermarkStage.classList.add('is-changing');
    setTimeout(() => {
      watermarkStage.textContent = text;
      watermarkStage.classList.remove('is-changing');
    }, 200);
    lastStageText = text;
  }

  const journey = document.querySelector('.journey');

  function computeScopeFillPercent() {
    if (!journey) return 0;
    const r = journey.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.5;
    const past = Math.max(0, Math.min(total, -r.top + window.innerHeight * 0.5));
    return Math.max(0, Math.min(100, (past / total) * 100));
  }

  function updateActiveRole() {
    const triggerY = window.innerHeight * 0.35;
    let activeRole = null;

    for (const card of roleCards) {
      const rect = card.getBoundingClientRect();
      if (rect.top <= triggerY) activeRole = card.dataset.role;
    }

    if (activeRole !== currentRole) {
      Object.values(stationByRole).forEach(s => s && s.classList.remove('is-active'));
      if (activeRole && stationByRole[activeRole]) {
        stationByRole[activeRole].classList.add('is-active');
      }
      if (activeRole && scopeValue) {
        scopeValue.textContent = scopeByRole[activeRole] || '';
      }
      if (activeRole) {
        setStage(stageByRole[activeRole] || 'The Student');
      } else {
        setStage('The Student');
      }

      // Animate station bridges — show bridges for all passed stations
      const bridges = document.querySelectorAll('.station-bridge');
      const roleOrder = ['nagarro', 'blackrock', 'telekom', 'dpworld'];
      const activeIdx = roleOrder.indexOf(activeRole);
      bridges.forEach((bridge, i) => {
        if (i <= activeIdx) bridge.classList.add('is-visible');
        else bridge.classList.remove('is-visible');
      });

      currentRole = activeRole;
    }

    if (scopeFill) {
      scopeFill.style.height = computeScopeFillPercent() + '%';
    }

    if (watermark && masthead) {
      const mastheadBottom = masthead.getBoundingClientRect().bottom;
      if (mastheadBottom < 20) watermark.classList.add('is-visible');
      else watermark.classList.remove('is-visible');
    }

    if (progressFill) {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      progressFill.style.width = pct + '%';
    }

    updateCompassMarker();
  }

  let scrollRaf = null;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateActiveRole();
      scrollRaf = null;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // ────────────────────────────────────────────────────────────────────────
  // 3. CAREER COMPASS — animated trajectory + scroll-linked marker
  // ────────────────────────────────────────────────────────────────────────
  const compass = document.querySelector('.compass');
  const compassMarker = document.querySelector('.compass-marker');
  const compassStops = Array.from(document.querySelectorAll('.compass-stop'));
  const trajectoryPath = document.getElementById('trajectory');

  const stopPositions = {
    student: { x: 60,  y: 178, frac: 0.02 },
    junior:  { x: 200, y: 158, frac: 0.18 },
    perf:    { x: 380, y: 120, frac: 0.38 },
    owner:   { x: 560, y: 85,  frac: 0.55 },
    senior:  { x: 740, y: 50,  frac: 0.78 },
    lead:    { x: 935, y: 20,  frac: 0.96 },
  };

  function updateCompassMarker() {
    if (!compassMarker || !trajectoryPath || !compass) return;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const scrollPct = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;

    if (scrollPct > 0.02) compass.classList.add('is-scrolling');
    else compass.classList.remove('is-scrolling');

    try {
      const pathLength = trajectoryPath.getTotalLength();
      const pt = trajectoryPath.getPointAtLength(pathLength * scrollPct);
      compassMarker.setAttribute('cx', pt.x);
      compassMarker.setAttribute('cy', pt.y);
    } catch (e) { /* skip on older browsers */ }

    compassStops.forEach(stop => {
      const stage = stop.dataset.stage;
      const pos = stopPositions[stage];
      if (!pos) return;
      if (scrollPct >= pos.frac - 0.02) {
        stop.classList.add('is-reached');
      } else {
        stop.classList.remove('is-reached');
      }
    });
  }

  if (compass) {
    const compassIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          compass.classList.add('is-drawn');
          compassIO.disconnect();
        }
      }
    }, { threshold: 0.4 });
    compassIO.observe(compass);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4. METRIC COUNTERS — animate sequentially when visible
  // ────────────────────────────────────────────────────────────────────────
  function animateCounter(el, delay) {
    delay = delay || 0;
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    if (Number.isNaN(target)) return;
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    setTimeout(() => {
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  function revealTextMetric(el, delay) {
    delay = delay || 0;
    setTimeout(() => {
      el.textContent = el.dataset.textTo || el.textContent;
      el.classList.add('is-revealed');
    }, delay);
  }

  function animateMetricsGrid(grid) {
    const metrics = grid.querySelectorAll('.metric-number');
    metrics.forEach((m, i) => {
      const delay = i * 220;
      if (m.dataset.countTo) animateCounter(m, delay);
      else if (m.dataset.textTo) revealTextMetric(m, delay);
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 5. LATENCY BAR
  // ────────────────────────────────────────────────────────────────────────
  function animateLatency(viz) {
    const before = viz.querySelector('.latency-bar-before');
    const after  = viz.querySelector('.latency-bar-after');
    if (!before || !after) return;
    before.style.setProperty('--target-w', '100%');
    after.style.setProperty('--target-w', '10%');
    setTimeout(() => before.classList.add('is-animated'), 80);
    setTimeout(() => after.classList.add('is-animated'),  520);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 6. ROLE-CARD REVEAL — trigger chapter intro + stagger bullets
  // ────────────────────────────────────────────────────────────────────────
  const cardIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        gaEvent('chapter_view', { chapter: e.target.dataset.role || 'unknown' });
        cardIO.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.role-card').forEach(c => cardIO.observe(c));

  // ────────────────────────────────────────────────────────────────────────
  // 7. PHASE REVEAL
  // ────────────────────────────────────────────────────────────────────────
  const phaseIO = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('is-in'), i * 80);
        phaseIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.phase').forEach(p => phaseIO.observe(p));

  // ────────────────────────────────────────────────────────────────────────
  // 8. METRICS GRID + LATENCY VIZ
  // ────────────────────────────────────────────────────────────────────────
  const vizIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      if (el.matches('[data-viz="blackrock-latency"]')) {
        animateLatency(el);
        vizIO.unobserve(el);
      } else if (el.matches('[data-viz="dpw-metrics"]')) {
        animateMetricsGrid(el);
        vizIO.unobserve(el);
      }
    }
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('[data-viz]').forEach(el => vizIO.observe(el));

  // ────────────────────────────────────────────────────────────────────────
  // 9. EASTER EGG
  // ────────────────────────────────────────────────────────────────────────
  let gStreak = 0;
  let gTimer = null;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'g' && e.key !== 'G') { gStreak = 0; return; }
    gStreak++;
    clearTimeout(gTimer);
    gTimer = setTimeout(() => gStreak = 0, 800);
    if (gStreak === 3) {
      console.log('%cBuilt by hand. No frameworks.', 'font-family: Georgia, serif; font-style: italic; font-size: 16px; color: #8A6A35;');
      console.log('%c— A.S.', 'font-family: Georgia, serif; font-size: 12px; color: #6C6254;');
      gStreak = 0;
    }
  });

  // ────────────────────────────────────────────────────────────────────────
  // 10. INITIAL PAINT
  // ────────────────────────────────────────────────────────────────────────
  console.log('%cagampreetsingh.me', 'font-family: Georgia, serif; font-size: 14px; color: #8A6A35; font-style: italic;');
  console.log('%cBuilt by hand. Zero dependencies.', 'font-family: monospace; font-size: 11px; color: #6C6254;');

  updateActiveRole();

  // ────────────────────────────────────────────────────────────────────────
  // 11. STACK EVOLUTION — animate bars when scrolled into view
  // ────────────────────────────────────────────────────────────────────────
  const evoIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.querySelectorAll('.evo-row').forEach((row, i) => {
        setTimeout(() => row.classList.add('is-in'), i * 180);
      });
      evoIO.unobserve(e.target);
    }
  }, { threshold: 0.3 });

  const stackEvo = document.querySelector('[data-viz="stack-evo"]');
  if (stackEvo) evoIO.observe(stackEvo);

  // ────────────────────────────────────────────────────────────────────────
  // 12. CAREER STATS — animate counters + staggered reveal
  // ────────────────────────────────────────────────────────────────────────
  const statsIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const stats = e.target.querySelectorAll('.career-stat');
      stats.forEach((s, i) => {
        setTimeout(() => {
          s.classList.add('is-in');
          const num = s.querySelector('[data-count-to]');
          if (num) animateCounter(num, 0);
        }, i * 130);
      });
      statsIO.unobserve(e.target);
    }
  }, { threshold: 0.3 });

  const careerStats = document.querySelector('[data-viz="career-stats"]');
  if (careerStats) statsIO.observe(careerStats);

  // ────────────────────────────────────────────────────────────────────────
  // 13. QUOTE CREATION LIVE DEMO — 15s vs 2s race
  // ────────────────────────────────────────────────────────────────────────
  const quoteDemo = document.querySelector('[data-viz="quote-demo"]');
  if (quoteDemo) {
    const btn = quoteDemo.querySelector('.quote-demo-btn');
    const slowProg = quoteDemo.querySelector('[data-track="slow"] .demo-track-progress');
    const fastProg = quoteDemo.querySelector('[data-track="fast"] .demo-track-progress');
    const slowTimer = quoteDemo.querySelector('[data-track="slow"] .demo-track-timer');
    const fastTimer = quoteDemo.querySelector('[data-track="fast"] .demo-track-timer');

    function resetDemo() {
      slowProg.style.transition = 'none';
      fastProg.style.transition = 'none';
      slowProg.style.width = '0%';
      fastProg.style.width = '0%';
      slowTimer.textContent = '0.0s';
      fastTimer.textContent = '0.0s';
      slowTimer.classList.remove('is-done');
      fastTimer.classList.remove('is-done');
    }

    function runDemo() {
      if (prefersReducedMotion) {
        slowTimer.textContent = '15.0s';
        fastTimer.textContent = '2.0s';
        slowProg.style.width = '100%';
        fastProg.style.width = '100%';
        slowTimer.classList.add('is-done');
        fastTimer.classList.add('is-done');
        return;
      }
      btn.disabled = true;
      resetDemo();

      const slowDur = 4500;
      const fastDur = 600;
      const slowTarget = 15.0;
      const fastTarget = 2.0;
      const start = performance.now();

      requestAnimationFrame(function() {
        void slowProg.offsetWidth;
        slowProg.style.transition = 'width ' + slowDur + 'ms linear';
        slowProg.style.width = '100%';
        fastProg.style.transition = 'width ' + fastDur + 'ms linear';
        fastProg.style.width = '100%';
      });

      let slowDone = false;
      let fastDone = false;
      function tick() {
        const elapsed = performance.now() - start;
        if (!slowDone) {
          const st = Math.min(1, elapsed / slowDur);
          slowTimer.textContent = (slowTarget * st).toFixed(1) + 's';
          if (st >= 1) { slowDone = true; slowTimer.classList.add('is-done'); }
        }
        if (!fastDone) {
          const ft = Math.min(1, elapsed / fastDur);
          fastTimer.textContent = (fastTarget * ft).toFixed(1) + 's';
          if (ft >= 1) { fastDone = true; fastTimer.classList.add('is-done'); }
        }
        if (!slowDone || !fastDone) requestAnimationFrame(tick);
        else {
          setTimeout(function() { btn.disabled = false; }, 600);
        }
      }
      requestAnimationFrame(tick);
    }

    btn.addEventListener('click', function() {
      gaEvent('quote_demo_play');
      resetDemo();
      requestAnimationFrame(function() { requestAnimationFrame(runDemo); });
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 14. COMPASS — click a stop to scroll to the role
  // ────────────────────────────────────────────────────────────────────────
  const stageToRole = {
    student: null,
    junior:  'nagarro',
    perf:    'blackrock',
    owner:   'telekom',
    senior:  'dpworld',
    lead:    'dpworld',
  };

  document.querySelectorAll('.compass-stop').forEach(function(stop) {
    stop.addEventListener('click', function() {
      const stage = stop.dataset.stage;
      const role = stageToRole[stage];
      gaEvent('compass_navigate', { destination: stage });
      if (role) {
        const target = document.querySelector('[data-role="' + role + '"]');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.compass-mobile-stop').forEach(function(stop) {
    stop.addEventListener('click', function() {
      const role = stop.dataset.target;
      if (role) {
        const target = document.querySelector('[data-role="' + role + '"]');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Update mobile compass reached state on scroll
  function updateMobileCompass() {
    var mobileStops = document.querySelectorAll('.compass-mobile-stop:not(.is-current)');
    mobileStops.forEach(function(stop) {
      var role = stop.dataset.target;
      var card = document.querySelector('[data-role="' + role + '"]');
      if (card) {
        var rect = card.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5) {
          stop.classList.add('is-reached');
        }
      }
    });
  }

  // Patch mobile compass update into scroll loop
  var _origUpdateActiveRole = updateActiveRole;
  updateActiveRole = function() {
    _origUpdateActiveRole();
    updateMobileCompass();
  };


  // ────────────────────────────────────────────────────────────────────────
  // MOBILE RAIL — horizontal strip that slides in after compass exits view
  // ────────────────────────────────────────────────────────────────────────
  const mobRail = document.querySelector('.mob-rail');
  const mobFill = document.querySelector('.mob-rail-fill');
  const mobStops = Array.from(document.querySelectorAll('.mob-stop'));

  const mobRoleOrder = ['nagarro', 'blackrock', 'telekom', 'dpworld'];

  // Click-to-jump
  mobStops.forEach(stop => {
    stop.addEventListener('click', () => {
      const role = stop.dataset.role;
      const target = document.querySelector('[data-role="' + role + '"]');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Patch updateActiveRole to also update mob-rail
  const _baseUpdateActiveRole = updateActiveRole;
  updateActiveRole = function() {
    _baseUpdateActiveRole();
    if (!mobRail) return;

    // Show/hide based on compass being off-screen
    const compassEl = document.querySelector('.compass');
    if (compassEl) {
      const cr = compassEl.getBoundingClientRect();
      if (cr.bottom < 10) mobRail.classList.add('is-visible');
      else mobRail.classList.remove('is-visible');
    }

    // Sync active/passed state
    const activeRoleNow = currentRole;
    const activeIdx = mobRoleOrder.indexOf(activeRoleNow);

    mobStops.forEach((stop, i) => {
      const role = stop.dataset.role;
      const idx = mobRoleOrder.indexOf(role);
      stop.classList.remove('is-active', 'is-passed', 'is-current');
      if (idx < activeIdx) stop.classList.add('is-passed');
      if (idx === activeIdx) stop.classList.add('is-active');
      if (role === 'dpworld' && activeRoleNow === 'dpworld') stop.classList.add('is-current');
    });

    // Fill bar
    if (mobFill && activeIdx >= 0) {
      const pct = activeIdx / (mobRoleOrder.length - 1) * 100;
      mobFill.style.width = pct + '%';
    }
  };


  // ────────────────────────────────────────────────────────────────────────
  // 15. SCROLL DEPTH — fire at 25 / 50 / 75 / 100 %
  // ────────────────────────────────────────────────────────────────────────
  const depthMilestones = [25, 50, 75, 100];
  const firedDepths = new Set();

  function checkScrollDepth() {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.round((window.scrollY / total) * 100);
    for (const milestone of depthMilestones) {
      if (pct >= milestone && !firedDepths.has(milestone)) {
        firedDepths.add(milestone);
        gaEvent('scroll_depth', { depth: milestone });
      }
    }
  }

  window.addEventListener('scroll', checkScrollDepth, { passive: true });

  // ────────────────────────────────────────────────────────────────────────
  // 16. CONTACT LINK CLICKS — email, phone, LinkedIn, GitHub
  // ────────────────────────────────────────────────────────────────────────
  const contactTypeMap = [
    { selector: 'a[href^="mailto:"]',   type: 'email'    },
    { selector: 'a[href^="tel:"]',      type: 'phone'    },
    { selector: 'a[href*="linkedin"]',  type: 'linkedin' },
    { selector: 'a[href*="github"]',    type: 'github'   },
  ];

  contactTypeMap.forEach(({ selector, type }) => {
    document.querySelectorAll(selector).forEach(link => {
      link.addEventListener('click', () => gaEvent('contact_click', { type }));
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 17. PROJECT LINK CLICKS
  // ────────────────────────────────────────────────────────────────────────
  document.querySelectorAll('.proj-card a').forEach(link => {
    link.addEventListener('click', () => {
      gaEvent('project_click', { project: link.textContent.trim() });
    });
  });

})();