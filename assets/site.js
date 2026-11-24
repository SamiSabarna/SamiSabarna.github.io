(() => {
  'use strict';

  const root = document.documentElement;

  /* ---------- Language ---------- */

  const META = {
    en: {
      title: 'Sami Sabarna | Intelligent Automation Engineer',
      desc: 'Sami Sabarna is an Intelligent Automation Engineer in Amman, Jordan, working across RPA, BPM, low-code and AI agents: from a manual process to software that runs by itself.'
    },
    ar: {
      title: 'سامي صبارنة | مهندس أتمتة ذكية',
      desc: 'سامي صبارنة، مهندس أتمتة ذكية في عمّان، الأردن. RPA وBPM والمنصات منخفضة الكود ووكلاء الذكاء الاصطناعي: من إجراء يدوي إلى نظام يعمل وحده.'
    }
  };
  const metaDesc = document.querySelector('meta[name="description"]');

  function applyLang(lang, persist) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.setAttribute('data-lang', lang);
    document.title = META[lang].title;
    if (metaDesc) metaDesc.setAttribute('content', META[lang].desc);
    if (!persist) return;
    try { localStorage.setItem('lang', lang); } catch (e) { /* storage unavailable */ }
    try {
      const url = new URL(window.location.href);
      if (lang === 'ar') url.searchParams.set('lang', 'ar');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch (e) { /* ignore */ }
  }

  applyLang(root.getAttribute('data-lang') === 'ar' ? 'ar' : 'en', false);
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLang(root.getAttribute('data-lang') === 'ar' ? 'en' : 'ar', true);
    });
  });

  /* ---------- Email (assembled here to keep it away from simple scrapers) ---------- */

  const address = ['samisabarnh2001', 'outlook.com'].join('@');
  document.querySelectorAll('[data-mail]').forEach((link) => {
    link.setAttribute('href', 'mailto:' + address);
    const text = link.querySelector('[data-mail-text]');
    if (text) text.textContent = address;
  });

  /* ---------- Header and footer ---------- */

  const header = document.querySelector('.site-header');
  const onScroll = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Process canvas ---------- */

  const canvas = document.querySelector('[data-canvas]');
  if (!canvas) return;

  const svg = canvas.querySelector('.bpmn');
  const token = canvas.querySelector('[data-token]');
  const log = canvas.querySelector('[data-log]');
  const toggle = canvas.querySelector('[data-canvas-toggle]');

  const STEPS = {
    start: { node: 'start', key: 'trigger', en: 'Invoice email received', ar: 'وصل بريد يحمل فاتورة' },
    rpa:   { node: 'rpa',   key: 'rpa',     en: 'Invoice PDF saved', ar: 'تم حفظ ملف الفاتورة' },
    ai:    { node: 'ai',    key: 'ai',      en: 'Vendor, amount and due date read', ar: 'قُرئ اسم المورّد والمبلغ وتاريخ الاستحقاق' },
    gwYes: { node: 'gw',    key: 'gateway', en: 'All fields certain, no review needed', ar: 'كل البيانات مؤكدة، لا حاجة للمراجعة' },
    gwNo:  { node: 'gw',    key: 'gateway', en: 'Amount unclear, sent for review', ar: 'المبلغ غير واضح، أُرسلت للمراجعة' },
    team:  { node: 'team',  key: 'human',   en: 'Reviewer confirmed the amount', ar: 'أكّد الموظف المبلغ' },
    erp:   { node: 'erp',   key: 'api',     en: 'Invoice posted to the ERP', ar: 'رُحّلت الفاتورة إلى ERP' },
    end:   { node: 'end',   key: 'done',    en: 'Process complete', ar: 'اكتملت العملية' }
  };
  const KEY_COLOR = { start: '#22d3ee', rpa: '#22d3ee', ai: '#a78bfa', gw: '#a78bfa', team: '#e2e8f0', erp: '#818cf8', end: '#22d3ee' };

  // [sequence flow to travel, step reached]
  const PATH_STRAIGHT = [[null, 'start'], ['f1', 'rpa'], ['f2', 'ai'], ['f3', 'gwYes'], ['f4y', 'erp'], ['f6', 'end']];
  const PATH_REVIEW = [[null, 'start'], ['f1', 'rpa'], ['f2', 'ai'], ['f3', 'gwNo'], ['f4n', 'team'], ['f5n', 'erp'], ['f6', 'end']];

  let paused = false;
  let inView = true;
  let pageVisible = !document.hidden;
  const running = () => !paused && inView && pageVisible;

  const setState = (state) => { canvas.setAttribute('data-state', state); };
  const nodesOf = (id) => canvas.querySelectorAll('[data-node="' + id + '"]');
  const svgShown = () => !!svg && svg.getClientRects().length > 0;

  function addLog(step) {
    const li = document.createElement('li');
    li.style.setProperty('--c', KEY_COLOR[step.node]);
    const key = document.createElement('span');
    key.className = 'log-key';
    key.textContent = step.key;
    li.append(key);
    ['en', 'ar'].forEach((lang) => {
      const msg = document.createElement('span');
      msg.className = 'log-msg';
      msg.lang = lang;
      msg.textContent = step[lang];
      li.append(msg);
    });
    log.append(li);
    while (log.children.length > 5) log.firstElementChild.remove();
  }

  function settleActive() {
    canvas.querySelectorAll('[data-node].is-active').forEach((n) => {
      n.classList.remove('is-active');
      n.classList.add('is-done');
    });
  }

  function resetDiagram() {
    canvas.querySelectorAll('[data-node]').forEach((n) => n.classList.remove('is-active', 'is-done'));
    canvas.querySelectorAll('.flow').forEach((f) => f.classList.remove('is-done'));
    canvas.querySelectorAll('.flow-lit').forEach((f) => {
      f.classList.remove('is-on');
      f.style.strokeDasharray = '';
      f.style.strokeDashoffset = '';
    });
  }

  // A wait that stops counting while paused, off screen or in a background tab.
  function wait(ms) {
    return new Promise((resolve) => {
      let left = ms;
      let last = performance.now();
      const tick = () => {
        const now = performance.now();
        if (running()) left -= now - last;
        last = now;
        if (left <= 0) resolve();
        else setTimeout(tick, 50);
      };
      setTimeout(tick, 50);
    });
  }

  function travel(seg) {
    const base = svg ? svg.querySelector('[data-seg="' + seg + '"]') : null;
    const lit = svg ? svg.querySelector('[data-lit="' + seg + '"]') : null;
    const finish = () => {
      if (base) base.classList.add('is-done');
      if (lit) { lit.style.strokeDashoffset = '0'; lit.classList.add('is-on'); }
    };
    if (!base || !lit || !svgShown()) return wait(480).then(finish);

    return new Promise((resolve) => {
      let len = 0;
      try { len = base.getTotalLength(); } catch (e) { len = 0; }
      if (!len) { finish(); resolve(); return; }
      const duration = Math.max(380, len * 4.2);
      lit.style.strokeDasharray = len + ' ' + len;
      lit.style.strokeDashoffset = String(len);
      lit.classList.add('is-on');
      let elapsed = 0;
      let last = performance.now();
      const frame = (now) => {
        if (running()) elapsed += now - last;
        last = now;
        const p = Math.min(1, elapsed / duration);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        try {
          const pt = base.getPointAtLength(e * len);
          token.setAttribute('cx', pt.x.toFixed(1));
          token.setAttribute('cy', pt.y.toFixed(1));
        } catch (err) { /* diagram hidden mid-run */ }
        lit.style.strokeDashoffset = String(len * (1 - e));
        if (p < 1) requestAnimationFrame(frame);
        else { finish(); resolve(); }
      };
      requestAnimationFrame(frame);
    });
  }

  async function runOnce(path) {
    token.setAttribute('cx', '80');
    token.setAttribute('cy', '38');
    canvas.classList.add('has-token');
    for (const [seg, id] of path) {
      const step = STEPS[id];
      if (seg) await travel(seg);
      settleActive();
      nodesOf(step.node).forEach((n) => n.classList.add('is-active'));
      addLog(step);
      await wait(step.node === 'end' ? 700 : 560);
    }
    settleActive();
    await wait(2200);
    canvas.classList.remove('has-token');
    await wait(450);
    resetDiagram();
    await wait(650);
  }

  async function loop() {
    await wait(700);
    for (let i = 0; ; i += 1) {
      await runOnce(i % 2 === 0 ? PATH_STRAIGHT : PATH_REVIEW);
    }
  }

  function renderStatic() {
    setState('static');
    PATH_STRAIGHT.forEach(([seg, id]) => {
      if (seg && svg) {
        const base = svg.querySelector('[data-seg="' + seg + '"]');
        const lit = svg.querySelector('[data-lit="' + seg + '"]');
        if (base) base.classList.add('is-done');
        if (lit) lit.classList.add('is-on');
      }
      nodesOf(STEPS[id].node).forEach((n) => n.classList.add('is-done'));
      addLog(STEPS[id]);
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderStatic();
    return;
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      paused = !paused;
      setState(paused ? 'paused' : 'running');
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
    }, { threshold: 0.1 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

  setState('running');
  loop();
})();
