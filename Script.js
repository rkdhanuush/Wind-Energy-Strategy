'use strict';

/* ---------- data ---------- */
const STATES = [
  { n: 'Gujarat', mw: 16086, gen: 33706, p120: 142.56, p150: 180.79, lo: 6.5, hi: 8.0, zone: 'profit', areas: 'Kutch, Jamnagar, Rajkot, Surendranagar, Bhavnagar' },
  { n: 'Tamil Nadu', mw: 12273, gen: 24200, p120: 68.75, p150: 95.10, lo: 7.0, hi: 8.5, zone: 'profit', areas: 'Muppandal, Kanyakumari, Tirunelveli, Tuticorin, Palghat Gap' },
  { n: 'Karnataka', mw: 8896, gen: 18804, p120: 124.15, p150: 169.25, lo: 6.0, hi: 7.5, zone: 'profit', areas: 'Gadag, Chitradurga, Koppal, Davangere, Hassan ridges' },
  { n: 'Maharashtra', mw: 6318, gen: 8610, p120: 98.21, p150: 173.86, lo: 5.5, hi: 7.0, zone: 'medium', areas: 'Satara, Sangli, Dhule, Ahmednagar, Beed' },
  { n: 'Rajasthan', mw: 5516, gen: 7345, p120: 127.75, p150: 284.25, lo: 6.0, hi: 7.5, zone: 'profit', areas: 'Jaisalmer, Barmer, Jodhpur, Bikaner' },
  { n: 'Andhra Pradesh', mw: 4461, gen: null, p120: 74.90, p150: 123.33, lo: 6.0, hi: 7.0, zone: 'medium', areas: 'Anantapur, Kurnool, Kadapa' },
  { n: 'Madhya Pradesh', mw: 3686, gen: null, p120: 15.40, p150: 55.42, lo: 5.5, hi: 6.5, zone: 'medium', areas: 'Dewas, Mandsaur, Neemuch, Ratlam' },
  { n: 'Telangana', mw: 128, gen: null, p120: 24.83, p150: 54.71, lo: 5.5, hi: 6.5, zone: 'medium', areas: 'Western and southern districts' },
  { n: 'Kerala', mw: 71, gen: null, p120: null, p150: null, lo: 5.5, hi: 7.0, zone: 'medium', areas: 'Palakkad gap, Idukki ridges' }
];
const EXTRA_SPEEDS = [
  { n: 'Odisha', lo: 6.2, hi: 8.8, zone: 'medium', areas: 'Coastal and ridge sites (values at 150 m; about 12 GW potential)', label: '6.2 to 8.8*' },
  { n: 'Other states', lo: 3.5, hi: 5.5, zone: 'low', areas: 'UP, Bihar, Punjab, Haryana, North-east: only some potential at 150 to 200 m hubs', label: 'below 5.5' }
];
const LICENSING = [
  ['Company set-up', 'Registrar of Companies', 'Usually a project SPV under the Companies Act, 2013. FDI up to 100% is allowed under the automatic route.'],
  ['Project registration', 'State Nodal Agency (TEDA, GEDA, KREDL and others)', 'Needed for state policy benefits and grid access.'],
  ['Wind resource data', 'NIWE or an accredited agency', 'At least 12 months of measured data. NIWE supplies free data from its own masts.'],
  ['Turbine model approval', 'MNRE, ALMM (Wind) list', 'Only listed models and component makers may be used. Turbine data must stay in India. New models can install up to 800 MW in two years after listing.'],
  ['Land', 'State revenue department, or private sale or lease', 'Non-agricultural conversion where needed. Government land only through state policy.'],
  ['Forest or wildlife clearance', 'Ministry of Environment and state forest department', 'Only if land touches forest, sanctuary or eco-sensitive area.'],
  ['Defence clearance', 'Ministry of Defence', 'NOC is mandatory. A copy goes to the State Nodal Agency and State Transmission Utility. Layout, height and location must match the NOC. MNRE tightened compliance in October 2026.'],
  ['Aviation height clearance', 'Airports Authority of India', 'Needed near airports and flight paths. Check the current NOCAS rules.'],
  ['Pollution control consent', 'State Pollution Control Board', 'Requirement varies by state.'],
  ['Grid connectivity and access', 'CTU or State Transmission Utility (GNA rules)', 'Needed before power can be evacuated. Plan transmission early.'],
  ['Electrical safety approval', 'Chief Electrical Inspector (CEI or CEIG)', 'Covers turbines, transformers, lines and protection. Required before commissioning.'],
  ['Scheduling and metering', 'State or Regional Load Despatch Centre', 'Registration, forecasting and settlement.'],
  ['Commissioning and COD', 'Buyer (for example SECI NOC before COD) and State Nodal Agency', 'Commissioning certificate is issued after inspection.']
];
const DOCS = [
  ['Company', ['Incorporation certificate', 'Memorandum and articles', 'Board resolution and power of attorney', 'Net worth and audited accounts', 'Shareholding and control declaration']],
  ['Project', ['Land title or lease deeds', 'Wind mast data and energy estimate', 'State Nodal Agency registration', 'ALMM-listed turbine order', 'Defence and aviation NOCs', 'Grid connectivity or GNA grant']],
  ['Commercial', ['Bid and letter of award', 'Signed PPA', 'Performance guarantee', 'Financing sanction letters', 'EPC and O&M contracts']],
  ['Commissioning', ['CEI or CEIG report for all equipment', 'Buyer NOC', 'Affidavit that all approvals are in place', 'Meter test reports', 'Commissioning certificate']],
  ['Operations', ['Monthly joint meter reading', 'Invoice and payment security (letter of credit)', 'Forecasting and scheduling records', 'Compliance filings']]
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n, d = 0) => n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const safeStore = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
};

/* ---------- theme ---------- */
(function theme() {
  const saved = safeStore.get('wind-theme');
  const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    safeStore.set('wind-theme', next);
  });
})();

/* ---------- scroll progress, back-to-top ---------- */
(function scrollUi() {
  const bar = $('#progress');
  const top = $('#toTop');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 700);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---------- scroll spy ---------- */
(function spy() {
  const links = $$('#links a');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      const a = map.get(e.target.id);
      if (a) {
        a.classList.add('active');
        const box = $('#links');
        box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

/* ---------- reveal on scroll and counters ---------- */
function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || '0', 10);
  const prefix = el.dataset.prefix || '';
  const sep = el.dataset.sep === '1';
  const start = performance.now();
  const dur = 1600;
  const tick = now => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = target * eased;
    el.textContent = prefix + (sep ? fmt(v, dec) : v.toFixed(dec));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = Math.min((i % 4) * 70, 210) + 'ms';
    io.observe(el);
  });
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));
})();

/* ---------- state table ---------- */
(function stateTable() {
  const body = $('#stateTable tbody');
  const maxMw = Math.max(...STATES.map(s => s.mw));
  function render(key) {
    const rows = [...STATES].sort((a, b) => (b[key] ?? -1) - (a[key] ?? -1));
    body.innerHTML = rows.map(s => `
      <tr>
        <td><b>${s.n}</b></td>
        <td>${fmt(s.mw)}</td>
        <td>${s.gen ? fmt(s.gen) : '<span class="dash">not listed</span>'}</td>
        <td>${s.p120 ? fmt(s.p120, 2) : '<span class="dash">in others</span>'}</td>
        <td>${s.p150 ? fmt(s.p150, 2) : '<span class="dash">in others</span>'}</td>
        <td><div class="bar"><i data-w="${(s.mw / maxMw * 100).toFixed(1)}"></i></div></td>
      </tr>`).join('') + `
      <tr><td><b>India (total)</b></td><td><b>57,443</b></td><td><b>106,000</b></td><td><b>695.5</b></td><td><b>1,163.85</b></td><td></td></tr>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.bar i', body).forEach(i => { i.style.width = i.dataset.w + '%'; });
    }));
  }
  render('mw');
  $$('[data-sort]').forEach(b => b.addEventListener('click', () => {
    $$('[data-sort]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render(b.dataset.sort);
  }));
})();

/* ---------- map controls ---------- */
(function maps() {
  const img = $('#mapImg');
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  $$('[data-map]').forEach(b => b.addEventListener('click', () => {
    $$('[data-map]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    img.classList.add('fade');
    setTimeout(() => { img.src = b.dataset.map; img.classList.remove('fade'); }, 220);
  }));
  const open = () => { lbImg.src = img.src; lb.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  img.addEventListener('click', open);
  $('#zoomBtn').addEventListener('click', open);
  $('#lbClose').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
})();

/* ---------- calculators ---------- */
(function calculators() {
  const val = id => parseFloat($('#' + id).value);
  const set = (id, text) => { $('#' + id).textContent = text; };

  function calc1() {
    const v = val('v'), d = val('d'), r = val('r'), cp = val('cp'), cuf = val('cuf'), t = val('t');
    set('o-v', v.toFixed(1)); set('o-d', d); set('o-r', r.toFixed(1));
    set('o-cp', cp.toFixed(2)); set('o-cuf', cuf); set('o-t', t.toFixed(2));
    const area = Math.PI * Math.pow(d / 2, 2);
    const pw = 0.5 * 1.18 * area * Math.pow(v, 3) / 1e6;
    const pc = Math.min(r, pw * cp);
    const energy = r * 8760 * cuf / 100;
    const revenue = energy * 1000 * t / 1e7;
    set('res-a', fmt(area) + ' m²');
    set('res-w', pw.toFixed(2) + ' MW');
    set('res-c', pc.toFixed(2) + ' MW');
    set('res-e', fmt(energy) + ' MWh');
    set('res-rev', 'Rs ' + revenue.toFixed(2) + ' crore');
    const b = $('#cufBadge');
    if (cuf >= 35) { b.className = 'badge good'; b.textContent = 'Profit-zone level CUF (35% or more)'; }
    else if (cuf >= 28) { b.className = 'badge mid'; b.textContent = 'Medium-profit level CUF (28% to 35%)'; }
    else { b.className = 'badge bad'; b.textContent = 'At or below typical break-even (26% to 28%)'; }
  }
  function calc2() {
    const v1 = val('v1'), al = val('al'), h2 = val('h2');
    set('o-v1', v1.toFixed(1)); set('o-al', al.toFixed(2)); set('o-h2', h2);
    const v2 = v1 * Math.pow(h2 / 100, al);
    const gain = (Math.pow(v2 / v1, 3) - 1) * 100;
    set('res-v2', v2.toFixed(2) + ' m/s');
    set('res-gain', (gain >= 0 ? '+' : '') + gain.toFixed(0) + '%');
  }
  ['v', 'd', 'r', 'cp', 'cuf', 't'].forEach(id => $('#' + id).addEventListener('input', calc1));
  ['v1', 'al', 'h2'].forEach(id => $('#' + id).addEventListener('input', calc2));
  calc1(); calc2();
})();

/* ---------- speed list and zone filter ---------- */
(function speeds() {
  const list = $('#speedList');
  const MIN = 3, MAX = 9;
  const items = [
    ...STATES.map(s => ({ n: s.n, lo: s.lo, hi: s.hi, zone: s.zone, areas: s.areas, label: s.lo.toFixed(1) + ' to ' + s.hi.toFixed(1) })),
    ...EXTRA_SPEEDS
  ].sort((a, b) => b.hi - a.hi);
  list.innerHTML = items.map(s => `
    <div class="speed-row reveal" data-zone="${s.zone}">
      <div><b>${s.n}</b><small>${s.zone === 'profit' ? 'Profit zone' : s.zone === 'medium' ? 'Medium-profit zone' : 'No-profit zone'}</small></div>
      <div>
        <div class="range"><i class="${s.zone}" data-left="${((s.lo - MIN) / (MAX - MIN) * 100).toFixed(1)}" data-width="${((s.hi - s.lo) / (MAX - MIN) * 100).toFixed(1)}"></i></div>
        <small>${s.areas}</small>
      </div>
      <div class="speed-val">${s.label} m/s</div>
    </div>`).join('');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const i = $('.range i', e.target);
      i.style.left = i.dataset.left + '%';
      i.style.width = i.dataset.width + '%';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  $$('.speed-row', list).forEach(r => io.observe(r));

  $$('#zoneFilter .chip').forEach(b => b.addEventListener('click', () => {
    $$('#zoneFilter .chip').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const z = b.dataset.zone;
    $$('.zone-card').forEach(c => c.classList.toggle('dim', z !== 'all' && c.dataset.zone !== z));
    $$('.speed-row', list).forEach(r => r.classList.toggle('hide', z !== 'all' && z !== 'restricted' && r.dataset.zone !== z));
  }));
})();

/* ---------- licensing accordion ---------- */
(function licensing() {
  $('#licList').innerHTML = LICENSING.map(([t, who, note], i) => `
    <details${i === 0 ? ' open' : ''}>
      <summary><span>${t}<small>${who}</small></span></summary>
      <div class="acc-body">${note}</div>
    </details>`).join('');
  $$('#licList details').forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return;
    $$('#licList details').forEach(o => { if (o !== d) o.open = false; });
  }));
})();

/* ---------- documents checklist (saved in browser) ---------- */
(function checklist() {
  const box = $('#docList');
  let saved = {};
  try { saved = JSON.parse(safeStore.get('wind-docs') || '{}'); } catch (e) { saved = {}; }
  box.innerHTML = DOCS.map(([g, items], gi) => `
    <div class="check-group"><h4>${g}</h4>
      ${items.map((t, ii) => `<label><input type="checkbox" data-k="${gi}-${ii}"${saved[gi + '-' + ii] ? ' checked' : ''}><span>${t}</span></label>`).join('')}
    </div>`).join('');
  box.addEventListener('change', e => {
    if (e.target.matches('input[type=checkbox]')) {
      saved[e.target.dataset.k] = e.target.checked;
      safeStore.set('wind-docs', JSON.stringify(saved));
    }
  });
})();