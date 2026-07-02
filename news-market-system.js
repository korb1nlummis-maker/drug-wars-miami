// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Living News & Market System
// Player actions make headlines; headlines move prices;
// prices tick in real time on the market screen.
// ============================================================

// ------------------------------------------------------------
// State
// ------------------------------------------------------------
function ensureNewsState(state) {
  if (!state.newsFeed) {
    state.newsFeed = [];
    pushNews(state, {
      headline: 'HEAT WAVE BREAKS OVER BISCAYNE BAY',
      body: 'Tourists flood South Beach as temperatures ease. Club owners expect a record weekend on the strip.',
      source: 'Miami Herald', category: 'world',
    });
    pushNews(state, {
      headline: 'CITY COMMISSION DEBATES WATERFRONT REDEVELOPMENT',
      body: 'Millions in county money earmarked for the port district. Critics ask where the contracts are really going.',
      source: 'Sun Sentinel', category: 'world',
    });
    pushNews(state, {
      headline: 'POLICE UNION DEMANDS OVERTIME PAY',
      body: 'Metro-Dade officers say narcotics enforcement is stretching the department thin. The mayor promises a task force.',
      source: 'Channel 7 News', category: 'police',
    });
  }
  if (!state.marketImpacts) state.marketImpacts = [];
  if (state.newsReadDay === undefined) state.newsReadDay = 0;
}

let _newsIdCounter = 1;
function pushNews(state, item) {
  ensureNewsState(state);
  const hour = 6 + Math.floor(Math.random() * 17);
  const minute = Math.floor(Math.random() * 60);
  state.newsFeed.unshift({
    id: 'n' + (_newsIdCounter++) + '_' + (state.day || 1),
    day: state.day || 1,
    time: `${hour}:${minute < 10 ? '0' : ''}${minute}`,
    headline: item.headline,
    body: item.body || '',
    source: item.source || 'Street Wire',
    category: item.category || 'street',
    locId: item.locId || null,
    drugId: item.drugId || null,
    impact: item.impact || null,
  });
  if (state.newsFeed.length > 150) state.newsFeed.length = 150;
}

function newsLocName(locId) {
  if (typeof LOCATIONS !== 'undefined') {
    const l = LOCATIONS.find(x => x.id === locId);
    if (l) return l.name;
  }
  return String(locId || 'the district').replace(/_/g, ' ');
}

function newsDrugName(drugId) {
  if (typeof DRUGS !== 'undefined') {
    const d = DRUGS.find(x => x.id === drugId);
    if (d) return d.name;
  }
  return String(drugId || 'product');
}

function newsPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ------------------------------------------------------------
// Market impacts: [{locId, drugId|null, mult, expiresDay, reason}]
// ------------------------------------------------------------
function addMarketImpact(state, locId, drugId, mult, days, reason) {
  ensureNewsState(state);
  state.marketImpacts.push({ locId, drugId: drugId || null, mult, expiresDay: (state.day || 1) + days, reason: reason || '' });
  // Apply immediately to live prices if the player is standing there
  if (state.currentLocation === locId && state.prices) {
    for (const id in state.prices) {
      if (state.prices[id] === null || state.prices[id] === undefined) continue;
      if (drugId && id !== drugId) continue;
      state.prices[id] = Math.max(1, Math.round(state.prices[id] * mult));
    }
    // Re-base the live ticker so it drifts around the new level
    if (state._tickBase) state._tickBase = null;
  }
}

function getMarketImpactMult(state, locId, drugId) {
  if (!state || !state.marketImpacts || !state.marketImpacts.length) return 1;
  let mult = 1;
  const day = state.day || 1;
  for (const imp of state.marketImpacts) {
    if (imp.expiresDay < day) continue;
    if (imp.locId !== locId) continue;
    if (imp.drugId && imp.drugId !== drugId) continue;
    mult *= imp.mult;
  }
  // Never compound into absurdity
  return Math.max(0.4, Math.min(2.5, mult));
}

// ------------------------------------------------------------
// Player-driven news
// ------------------------------------------------------------
function reportPlayerEvent(state, type, data) {
  if (!state) return;
  ensureNewsState(state);
  data = data || {};
  const loc = newsLocName(data.locId);
  const rnd = (a, b) => a + Math.random() * (b - a);

  // Neighborhood ecology reacts to the same events the news reports
  if (typeof notifyDistrictEvent === 'function' && data.locId) {
    const districtEventMap = {
      shootout_won: 'shootout', shootout_lost: 'shootout',
      police_raid: 'raid', busted: 'raid',
      territory_taken: 'takeover', big_sale: 'big_sale',
    };
    if (districtEventMap[type]) notifyDistrictEvent(state, districtEventMap[type], data.locId);
  }

  switch (type) {
    case 'shootout_won':
    case 'shootout_lost': {
      const mult = 1 + rnd(0.08, 0.15);
      addMarketImpact(state, data.locId, null, mult, 3 + Math.floor(Math.random() * 3), 'shootout');
      pushNews(state, {
        headline: newsPick([
          `GUNFIRE ERUPTS IN ${loc.toUpperCase()}`,
          `DAYLIGHT SHOOTOUT SHAKES ${loc.toUpperCase()}`,
          `WITNESSES REPORT ARMED CLASH IN ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Residents describe masked gunmen exchanging fire before fleeing the scene. Police have flooded the area with patrols. Street sources say product is suddenly scarce and corner prices are climbing.`,
          `No arrests have been made after a violent confrontation between unidentified crews. With officers on every corner, dealers have gone to ground and prices are surging.`,
        ]),
        source: newsPick(['Miami Herald', 'Channel 7 News', 'Street Wire']),
        category: 'street', locId: data.locId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
    case 'territory_taken': {
      const mult = 1 - rnd(0.10, 0.18);
      addMarketImpact(state, data.locId, null, mult, 4 + Math.floor(Math.random() * 3), 'takeover');
      pushNews(state, {
        headline: newsPick([
          `POWER SHIFT IN ${loc.toUpperCase()}: ${String(data.gang || 'OLD CREW').toUpperCase()} PUSHED OUT`,
          `NEW MANAGEMENT ON THE CORNERS OF ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Long-time operators have vanished from their usual spots overnight. Whoever moved in is undercutting the old rates to win the block's loyalty. Buyers are calling it a fire sale.`,
          `Community leaders report a sudden change in who runs the corners. The new outfit is flooding the block with cheap product to announce itself.`,
        ]),
        source: newsPick(['Street Wire', 'Local 10 News']),
        category: 'you', locId: data.locId,
        impact: { dir: 'down', pct: Math.round((1 - mult) * 100) },
      });
      break;
    }
    case 'police_raid':
    case 'busted': {
      const mult = 1 + rnd(0.12, 0.20);
      addMarketImpact(state, data.locId, null, mult, 4 + Math.floor(Math.random() * 4), 'raid');
      pushNews(state, {
        headline: newsPick([
          `DEA RAID SHUTS DOWN ${loc.toUpperCase()} CORNERS`,
          `NARCOTICS SWEEP HITS ${loc.toUpperCase()}`,
          `FEDERAL AGENTS DESCEND ON ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Agents in tactical gear made multiple arrests in a pre-dawn operation. Supply lines through the district are severed and street prices have spiked overnight.`,
          `A months-long investigation culminated in coordinated raids. Dealers who escaped the net are charging desperation prices.`,
        ]),
        source: newsPick(['Miami Herald', 'Channel 7 News', 'Associated Press']),
        category: 'police', locId: data.locId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
    case 'big_sale': {
      if (!data.drugId) break;
      const mult = 1 - rnd(0.10, 0.20);
      addMarketImpact(state, data.locId, data.drugId, mult, 2 + Math.floor(Math.random() * 3), 'flood');
      pushNews(state, {
        headline: `STREET FLOODED WITH ${newsDrugName(data.drugId).toUpperCase()} IN ${loc.toUpperCase()}`,
        body: `A massive quantity moved through the district in a single day. With every corner holding weight, prices are collapsing while the surplus lasts.`,
        source: 'Street Wire', category: 'market', locId: data.locId, drugId: data.drugId,
        impact: { dir: 'down', pct: Math.round((1 - mult) * 100) },
      });
      break;
    }
    case 'big_buy': {
      if (!data.drugId) break;
      const mult = 1 + rnd(0.08, 0.15);
      addMarketImpact(state, data.locId, data.drugId, mult, 2 + Math.floor(Math.random() * 3), 'shortage');
      pushNews(state, {
        headline: `${newsDrugName(data.drugId).toUpperCase()} DRIES UP IN ${loc.toUpperCase()}`,
        body: `An unknown buyer cleared out local stock in one move. Dealers who still hold product are naming their own price.`,
        source: 'Street Wire', category: 'market', locId: data.locId, drugId: data.drugId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
    case 'boss_hit': {
      const mult = 1 + rnd(0.08, 0.12);
      addMarketImpact(state, data.locId, null, mult, 5, 'power vacuum');
      pushNews(state, {
        headline: `UNDERWORLD FIGURE ${String(data.bossName || 'KINGPIN').toUpperCase()} REPORTED DEAD`,
        body: `The sudden power vacuum has supply chains in chaos. Lieutenants are fighting over routes while shipments sit frozen. Premium product is spiking across the region.`,
        source: newsPick(['DEA Intelligence Brief', 'Miami Herald']),
        category: 'cartel', locId: data.locId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
  }
}

// ------------------------------------------------------------
// Daily processing
// ------------------------------------------------------------
const NEWS_ATMOSPHERE = [
  { headline: 'DOLPHINS FALL SHORT IN OVERTIME HEARTBREAKER', body: 'The Orange Bowl emptied in silence after a missed field goal sealed another one-score loss.', source: 'Miami Sports Desk', category: 'world' },
  { headline: 'ART DECO DISTRICT NAMED TO NATIONAL REGISTER', body: 'Preservationists celebrate as Ocean Drive\'s pastel hotels win federal protection.', source: 'Miami Herald', category: 'world' },
  { headline: 'MAYOR CUTS RIBBON ON NEW METRORAIL SEGMENT', body: 'Officials promise the elevated line will "transform how Miami moves." Ridership projections draw skepticism.', source: 'Sun Sentinel', category: 'world' },
  { headline: 'HURRICANE SEASON OUTLOOK: ABOVE AVERAGE', body: 'Forecasters warn of a busy season. Marinas report a run on plywood and rope.', source: 'Channel 7 Weather', category: 'world' },
  { headline: 'COCKFIGHTING RING BROKEN UP IN HIALEAH', body: 'Deputies seized 40 birds and a betting book with some surprising names in it.', source: 'Local 10 News', category: 'police' },
  { headline: 'JAI-ALAI ATTENDANCE HITS DECADE HIGH', body: 'The fronton is packed nightly. Bookmakers, both licensed and otherwise, report brisk business.', source: 'Miami New Times', category: 'world' },
  { headline: 'BEACHFRONT CONDO TOWER BREAKS GROUND', body: 'Nobody can quite say where the financing came from, and nobody at the ceremony asked.', source: 'Business Journal', category: 'world' },
  { headline: 'CUBAN COFFEE PRICES UP AT LOCAL VENTANITAS', body: 'A bad harvest abroad means your cafecito costs a dime more. Regulars pay it without complaint.', source: 'Miami Herald', category: 'world' },
  { headline: 'POLICE ACADEMY GRADUATES LARGEST CLASS EVER', body: 'Ninety new officers hit the streets Monday. The chief says narcotics is the priority assignment.', source: 'Channel 7 News', category: 'police' },
  { headline: 'GATOR FOUND IN CORAL GABLES SWIMMING POOL', body: 'Trappers removed the eight-footer before breakfast. The homeowner is billing the county.', source: 'Local 10 News', category: 'world' },
  { headline: 'VICE SQUAD SWEEPS THE STRIP CLUBS', body: 'Six licenses suspended. Management companies shuffle paperwork and reopen by the weekend.', source: 'Sun Sentinel', category: 'police' },
  { headline: 'RECORD SEASON FOR MARLIN FISHING CHARTERS', body: 'Captains report full bookings. Some boats seem to fish at odd hours with no rods aboard.', source: 'Waterfront Report', category: 'world' },
];

function processNewsDaily(state) {
  ensureNewsState(state);
  const day = state.day || 1;
  // Expire impacts
  state.marketImpacts = state.marketImpacts.filter(imp => imp.expiresDay >= day);
  // Fold today's price events into the feed
  if (state.priceEvents && state.priceEvents.length) {
    for (const ev of state.priceEvents) {
      const story = ev.newsStory;
      pushNews(state, {
        headline: story && story.headline ? story.headline : ev.msg.replace(/[{}]/g, ''),
        body: story && story.body ? story.body : '',
        source: story && story.source ? story.source : 'Market Watch',
        category: 'market', drugId: ev.drugId,
        impact: { dir: ev.effect === 'spike' ? 'up' : 'down', pct: 0 },
      });
    }
  }
  // Atmospheric filler
  if (Math.random() < 0.25) pushNews(state, newsPick(NEWS_ATMOSPHERE));
  return [];
}

// ------------------------------------------------------------
// Live market ticker — prices move every 1.5 seconds
// ------------------------------------------------------------
let _tickerStarted = false;
function startMarketTicker() {
  if (_tickerStarted) return;
  _tickerStarted = true;
  setInterval(function () {
    try { marketTick(); } catch (e) { /* never break the game loop */ }
  }, 1500);
}

function marketTick() {
  if (typeof gameState === 'undefined' || !gameState || !gameState.prices) return;
  if (typeof currentScreen === 'undefined' || currentScreen !== 'game') return;
  if (typeof document === 'undefined' || document.hidden) return;
  // Trade modal open? Hold quotes steady.
  if (typeof selectedDrug !== 'undefined' && selectedDrug) return;

  // Re-base once per game day so drift stays within a band of the day's prices
  if (!gameState._tickBase || gameState._tickBase._day !== gameState.day) {
    gameState._tickBase = { _day: gameState.day };
    for (const id in gameState.prices) gameState._tickBase[id] = gameState.prices[id];
  }

  for (const id in gameState.prices) {
    const p = gameState.prices[id];
    const base = gameState._tickBase[id];
    if (p === null || p === undefined || !base) continue;
    // Random walk: ±0.2-0.6%, occasional 1.5% jolt
    let movePct = (Math.random() - 0.5) * 0.008 + (Math.random() < 0.05 ? (Math.random() - 0.5) * 0.03 : 0);
    let next = Math.round(p * (1 + movePct));
    // Clamp to ±7% of the day's base
    next = Math.max(Math.round(base * 0.93), Math.min(Math.round(base * 1.07), next));
    next = Math.max(1, next);
    const dir = next > p ? 1 : next < p ? -1 : 0;
    gameState.prices[id] = next;
    // In-place DOM update — no full render (would reset scroll/focus)
    const priceEl = document.querySelector('[data-tick-price="' + id + '"]');
    if (priceEl) priceEl.textContent = '$' + next.toLocaleString();
    const trendEl = document.querySelector('[data-tick-trend="' + id + '"]');
    if (trendEl && dir !== 0) {
      trendEl.textContent = dir > 0 ? '▲' : '▼';
      trendEl.style.color = dir > 0 ? 'var(--neon-green)' : 'var(--neon-red)';
    }
  }

  // Rotate the news ticker strip
  const strip = document.querySelector('[data-news-ticker]');
  if (strip && gameState.newsFeed && gameState.newsFeed.length) {
    if (marketTick._newsIdx === undefined) marketTick._newsIdx = 0;
    if (marketTick._newsTicks === undefined) marketTick._newsTicks = 0;
    marketTick._newsTicks++;
    if (marketTick._newsTicks % 3 === 0) { // every ~4.5s
      marketTick._newsIdx = (marketTick._newsIdx + 1) % Math.min(5, gameState.newsFeed.length);
      const item = gameState.newsFeed[marketTick._newsIdx];
      if (item) strip.textContent = '📰 ' + item.headline;
    }
  }
}
if (typeof window !== 'undefined') startMarketTicker();

// ------------------------------------------------------------
// News feed screen
// ------------------------------------------------------------
let newsFilter = 'all';
const NEWS_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'market', label: '📰 Market' },
  { id: 'police', label: '🚔 Police' },
  { id: 'street', label: '🔫 Street' },
  { id: 'cartel', label: '🐊 Cartel' },
  { id: 'world', label: '🌍 World' },
  { id: 'you', label: '👤 Your Doing' },
];

function getUnreadNewsCount(state) {
  if (!state || !state.newsFeed) return 0;
  return state.newsFeed.filter(n => n.day > (state.newsReadDay || 0)).length;
}

function setNewsFilter(cat) {
  newsFilter = cat;
  render();
}

function renderNewsFeed() {
  if (!gameState) { currentScreen = 'title'; return renderTitle(); }
  ensureNewsState(gameState);
  gameState.newsReadDay = gameState.day;

  const chips = NEWS_CATEGORIES.map(c =>
    `<button class="btn btn-sm ${newsFilter === c.id ? 'btn-primary' : 'btn-secondary'}" style="margin:0 0.2rem 0.3rem 0" onclick="setNewsFilter('${c.id}')">${c.label}</button>`
  ).join('');

  const items = gameState.newsFeed.filter(n => newsFilter === 'all' || n.category === newsFilter);
  const cards = items.length ? items.map(n => `
    <div class="card" style="border-color:${n.category === 'you' ? 'var(--neon-pink)' : n.category === 'police' ? '#4488ff' : n.category === 'market' ? 'var(--neon-green)' : 'var(--border-color)'}">
      <div class="card-header">
        <span>${n.headline}</span>
        <span class="text-dim" style="font-size:0.7rem;white-space:nowrap">Day ${n.day} · ${n.time}</span>
      </div>
      ${n.body ? `<p class="text-dim" style="font-size:0.85rem">${n.body}</p>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-top:0.3rem">
        <span class="text-dim">— ${n.source}</span>
        ${n.impact && n.impact.pct ? `<span style="color:${n.impact.dir === 'up' ? 'var(--neon-red)' : 'var(--neon-green)'}">💹 ${n.drugId ? newsDrugName(n.drugId) : 'Prices'} ${n.impact.dir === 'up' ? '+' : '-'}${n.impact.pct}%${n.locId ? ' · ' + newsLocName(n.locId) : ''}</span>` : ''}
      </div>
    </div>
  `).join('') : '<p class="text-dim">Nothing in this section yet. Make some noise.</p>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">📺 MIAMI NEWS WIRE</h2>
      <p class="text-dim" style="text-align:center;font-size:0.85rem;margin-bottom:0.8rem">What happens on the street ends up in the paper — and moves the market.</p>
      <div style="text-align:center;margin-bottom:0.8rem">${chips}</div>
      ${cards}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}
