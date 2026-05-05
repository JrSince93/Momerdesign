/* ===========================================================
   Akila Fintech — Animated Charts
   Powered by Chart.js. Charts render only when scrolled into view.
   =========================================================== */
(function () {
  'use strict';

  // Wait for Chart.js to load. If it never loads, the static fallback content
  // inside .ak-chart__canvas-wrap stays visible — no empty box.
  function ready(fn) {
    if (window.Chart) return fn();
    var attempts = 0;
    var poll = setInterval(function () {
      if (window.Chart) { clearInterval(poll); fn(); }
      else if (++attempts > 50) clearInterval(poll); // give up after 5s, fallback shows
    }, 100);
  }

  // Mark the wrap once a chart attaches so CSS can hide the fallback
  function markRendered(canvas) {
    var wrap = canvas.closest('.ak-chart__canvas-wrap');
    if (wrap) wrap.classList.add('has-chart');
  }

  // Brand palette
  var COL = {
    pink: '#ff5e69',
    orange: '#ff8a56',
    yellow: '#ffa84b',
    purple: '#b16cea',
    mint: '#00d4a8',
    ink: '#0a0a0a',
    line: 'rgba(0,0,0,0.08)',
    text: '#5c5c5c'
  };

  // Shared base options
  function baseOpts(extra) {
    var o = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1400, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'Plusjakartatext, system-ui', size: 12, weight: '600' },
            color: COL.text,
            padding: 18,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: COL.ink,
          titleFont: { family: 'Thicccboi, system-ui', size: 13, weight: '600' },
          bodyFont: { family: 'Plusjakartatext, system-ui', size: 13 },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 4
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plusjakartatext, system-ui', size: 12 },
            color: COL.text
          }
        },
        y: {
          grid: { color: COL.line, drawBorder: false },
          ticks: {
            font: { family: 'Plusjakartatext, system-ui', size: 12 },
            color: COL.text
          },
          beginAtZero: true
        }
      }
    };
    return Object.assign(o, extra || {});
  }

  // ---------- Chart 1: Digital banks vs Big 5 customer base ----------
  function chartCustomerBase(canvas) {
    try {
      new window.Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Revolut', 'TD Bank', 'RBC', 'Monzo', 'BMO', 'Scotiabank', 'N26', 'Starling'],
          datasets: [{
            label: 'Customers (millions)',
            data: [70, 27.9, 17, 15, 13, 11, 7, 4.2],
            backgroundColor: function (ctx) {
              // Digital banks get gradient, Big 5 get ink
              var label = ctx.chart.data.labels[ctx.dataIndex];
              var digital = ['Revolut', 'Monzo', 'N26', 'Starling'];
              return digital.indexOf(label) > -1 ? COL.pink : COL.ink;
            },
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 56
          }]
        },
        options: baseOpts({
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: COL.ink,
              titleFont: { family: 'Thicccboi, system-ui', size: 13, weight: '600' },
              bodyFont: { family: 'Plusjakartatext, system-ui', size: 13 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) { return ctx.parsed.y + 'M customers'; }
              }
            }
          }
        })
      });
      markRendered(canvas);
    } catch (e) { /* fallback content stays visible */ }
  }

  // ---------- Chart 2: Revolut growth 2017 → 2026 ----------
  function chartRevolutGrowth(canvas) {
    try {
      var grad = canvas.getContext('2d').createLinearGradient(0, 0, 0, 360);
      grad.addColorStop(0, 'rgba(255, 94, 105, 0.35)');
      grad.addColorStop(1, 'rgba(255, 94, 105, 0)');

      new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
          datasets: [{
            label: 'Revolut customers (millions)',
            data: [1, 1.5, 6, 12, 17, 26, 38, 52.5, 60, 70],
            borderColor: COL.pink,
            backgroundColor: grad,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: COL.pink,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        },
        options: baseOpts({
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: COL.ink,
              titleFont: { family: 'Thicccboi, system-ui', size: 13, weight: '600' },
              bodyFont: { family: 'Plusjakartatext, system-ui', size: 13 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) { return ctx.parsed.y + 'M customers'; }
              }
            }
          }
        })
      });
      markRendered(canvas);
    } catch (e) { /* fallback content stays visible */ }
  }

  // ---------- Chart 3: Canadian satisfaction Big 5 vs Midsize ----------
  function chartSatisfaction(canvas) {
    try {
      new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: ['2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Big 5 banks',
              data: [613, 625, 635, 611, 604],
              borderColor: COL.ink,
              backgroundColor: 'rgba(10, 10, 10, 0.04)',
              borderWidth: 3,
              tension: 0.3,
              fill: false,
              pointBackgroundColor: COL.ink,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 9
            },
            {
              label: 'Midsize banks',
              data: [620, 630, 640, 644, 649],
              borderColor: COL.mint,
              borderWidth: 3,
              tension: 0.3,
              fill: false,
              pointBackgroundColor: COL.mint,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 9
            }
          ]
        },
        options: baseOpts({
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Plusjakartatext, system-ui', size: 12 }, color: COL.text } },
            y: {
              grid: { color: COL.line, drawBorder: false },
              ticks: { font: { family: 'Plusjakartatext, system-ui', size: 12 }, color: COL.text },
              beginAtZero: false,
              min: 580, max: 670,
              title: {
                display: true,
                text: 'Satisfaction score (out of 1,000)',
                font: { family: 'Plusjakartatext, system-ui', size: 11, weight: '600' },
                color: '#8a95ad'
              }
            }
          }
        })
      });
      markRendered(canvas);
    } catch (e) { /* fallback content stays visible */ }
  }

  // ---------- Trigger charts when they scroll into view ----------
  function init() {
    var charts = [
      { id: 'ak-chart-customer-base', fn: chartCustomerBase },
      { id: 'ak-chart-revolut-growth', fn: chartRevolutGrowth },
      { id: 'ak-chart-satisfaction', fn: chartSatisfaction }
    ];

    if (!('IntersectionObserver' in window)) {
      // Render immediately as fallback
      charts.forEach(function (c) {
        var el = document.getElementById(c.id);
        if (el) c.fn(el);
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var match = charts.find(function (c) { return c.id === entry.target.id; });
          if (match) {
            match.fn(entry.target);
            obs.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.25 });

    charts.forEach(function (c) {
      var el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
  }

  ready(init);
})();
