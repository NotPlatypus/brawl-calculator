'use strict';

const LEVEL_COSTS = [
  { coins: 0,    pp: 0    },
  { coins: 20,   pp: 20   },
  { coins: 35,   pp: 30   },
  { coins: 75,   pp: 50   },
  { coins: 140,  pp: 80   },
  { coins: 290,  pp: 130  },
  { coins: 480,  pp: 210  },
  { coins: 800,  pp: 340  },
  { coins: 1250, pp: 550  },
  { coins: 1875, pp: 890  },
  { coins: 2800, pp: 1440 },
];

const ITEMS = {
  gear:        { max: 6, coins: 1000, pp: 0,    label: 'Gear' },
  star_power:  { max: 2, coins: 2000, pp: 0,    label: 'Star Power' },
  gadget:      { max: 2, coins: 1000, pp: 0,    label: 'Gadget' },
  hypercharge: { max: 1, coins: 5000, pp: 0,    label: 'Hypercharge' },
  buffie:      { max: 3, coins: 1000, pp: 2000, label: 'Buffie' },
};

const state = {
  currentLevel: 1, desiredLevel: 1,
  gear: 0, star_power: 0, gadget: 0, hypercharge: 0, buffie: 0,
};

const $ = id => document.getElementById(id);
const curEl   = $('currentLevel');
const desEl   = $('desiredLevel');
const coinsEl = $('totalCoins');
const ppEl    = $('totalPP');
const warnEl  = $('warning');
const bdEl    = $('breakdown');

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt   = n => n.toLocaleString('en-US');

function animateBump(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function changeLevel(which, delta) {
  state[which] = clamp(state[which] + delta, 1, 11);
  curEl.textContent = state.currentLevel;
  desEl.textContent = state.desiredLevel;
  recalc();
}

function changeItem(key, delta) {
  const cfg = ITEMS[key];
  state[key] = clamp(state[key] + delta, 0, cfg.max);
  $(`val-${key}`).textContent        = state[key];
  $(`btn-minus-${key}`).disabled     = state[key] === 0;
  $(`btn-plus-${key}`).disabled      = state[key] === cfg.max;
  $(`item-card-${key}`).classList.toggle('active-item', state[key] > 0);
  recalc();
}

function recalc() {
  let totalCoins = 0, totalPP = 0;
  const rows = [];

  const from = state.currentLevel;
  const to   = state.desiredLevel;

  if (to > from) {
    let c = 0, p = 0;
    for (let i = from; i < to; i++) {
      c += LEVEL_COSTS[i].coins;
      p += LEVEL_COSTS[i].pp;
    }
    totalCoins += c; totalPP += p;
    rows.push({ label: `Level ${from} → ${to}`, coins: c, pp: p });
  }

  warnEl.classList.toggle('show', to < from);

  for (const [key, cfg] of Object.entries(ITEMS)) {
    const n = state[key];
    if (n > 0) {
      const c = cfg.coins * n, p = cfg.pp * n;
      totalCoins += c; totalPP += p;
      rows.push({ label: `${n}× ${cfg.label}`, coins: c, pp: p });
    }
  }

  const newCoins = fmt(totalCoins);
  const newPP    = fmt(totalPP);
  if (coinsEl.textContent !== newCoins) { animateBump(coinsEl); coinsEl.textContent = newCoins; }
  if (ppEl.textContent    !== newPP)    { animateBump(ppEl);    ppEl.textContent    = newPP; }

  if (rows.length === 0) {
    bdEl.innerHTML = '<div class="breakdown-empty">Adjust the settings above to calculate costs.</div>';
    return;
  }

  bdEl.innerHTML = rows.map(r => {
    const parts = [];
    if (r.coins) parts.push(`<img src="pictures/coins.webp" class="bd-icon"> ${fmt(r.coins)}`);
if (r.pp)    parts.push(`<img src="pictures/power points.webp" class="bd-icon"> ${fmt(r.pp)}`);
    return `<div class="breakdown-row">
      <span class="row-label">${r.label}</span>
      <span class="row-cost">${parts.join('&nbsp;&nbsp;')}</span>
    </div>`;
  }).join('');
}

function resetAll() {
  state.currentLevel = 1; state.desiredLevel = 1;
  curEl.textContent = 1; desEl.textContent = 1;
  for (const key of Object.keys(ITEMS)) {
    state[key] = 0;
    $(`val-${key}`).textContent    = '0';
    $(`btn-minus-${key}`).disabled = true;
    $(`btn-plus-${key}`).disabled  = false;
    $(`item-card-${key}`).classList.remove('active-item');
  }
  warnEl.classList.remove('show');
  recalc();
}

// Wire events
$('cur-dec').addEventListener('click', () => changeLevel('currentLevel', -1));
$('cur-inc').addEventListener('click', () => changeLevel('currentLevel',  1));
$('des-dec').addEventListener('click', () => changeLevel('desiredLevel', -1));
$('des-inc').addEventListener('click', () => changeLevel('desiredLevel',  1));

for (const key of Object.keys(ITEMS)) {
  $(`btn-minus-${key}`).addEventListener('click', () => changeItem(key, -1));
  $(`btn-plus-${key}`).addEventListener('click',  () => changeItem(key,  1));
}
$('btn-reset').addEventListener('click', resetAll);

// Init — disable all minus buttons
for (const key of Object.keys(ITEMS)) $(`btn-minus-${key}`).disabled = true;
recalc();
