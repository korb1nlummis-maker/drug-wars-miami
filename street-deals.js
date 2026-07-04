// ============================================================
// STREET DEALS — the corner comes to YOU
// ============================================================
// Named buyers and sellers approach the player with private offers:
//   • BUYERS pay over list price (a negotiated deal beats the corner spread)
//   • SELLERS move cheap lots that fell off a truck
//   • COUNTER-OFFER once per deal — speech skill decides who blinks
//   • Handle a buyer right and they may become a REGULAR: they come back
//     every few days, order sizes grow with trust, and they pay loyalty
//     premiums. Stand them up and they find another dealer.
//   • Deal while HOT and some "buyers" turn out to wear a wire.
// Depth from day 1: the first offers are sized to a rookie's pockets.

const STREET_BUYER_NAMES = [
  'Flaco', 'Miss Dee', 'Ramona', 'Chuckie T', 'The Professor', 'Yolanda',
  'Big Perm', 'Silent Ray', 'Nurse Betty', 'DJ Sabado', 'Tio Nelson',
  'Cassette Carl', 'Vicky Visa', 'Mono', 'Sunshine', 'The Realtor',
  'Pastor Mike', 'Lil Ghost', 'Turnpike Tina', 'Baker', 'Two-Phones',
  'Marisol', 'The Intern', 'Coach', 'Neon Nikki', 'Sleepy E',
];
const STREET_SELLER_LINES = [
  'A dock worker with a duffel bag: "Container got miscounted. My problem is your discount."',
  'A nervous flight attendant: "Last run. I just want it gone tonight."',
  'Two kids with a gym bag: "Found our uncle\'s stash. He\'s doing ten years. You want it or not?"',
  'An old head clearing out: "I\'m retiring to Naples. Everything must go."',
  'A rival\'s ex-runner: "He shorted me three weeks. This is my severance."',
];
const STREET_BUYER_LINES = [
  'wants product for a private party on Star Island',
  'buys for a crew of college kids who don\'t ask twice about price',
  'supplies half the kitchen staff on Ocean Drive',
  'needs weight before a cruise ship boards tomorrow',
  'got customers in the suburbs who won\'t drive downtown',
  'is stocking up before prices move — heard something on the wire',
];

function ensureStreetDealsState(state) {
  if (!state.streetDeals) {
    state.streetDeals = { offers: [], regulars: [], stats: { accepted: 0, countered: 0, declined: 0, ripoffs: 0, stings: 0, regularsMade: 0 } };
  }
  if (!state.streetDeals.regulars) state.streetDeals.regulars = [];
  if (!state.streetDeals.stats) state.streetDeals.stats = { accepted: 0, countered: 0, declined: 0, ripoffs: 0, stings: 0, regularsMade: 0 };
  return state.streetDeals;
}

function sdRand(a, b) { return a + Math.random() * (b - a); }
function sdPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Drugs the player can plausibly trade right now (priced here, level-ok)
function sdEligibleDrugs(state) {
  const lvl = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  return DRUGS.filter(d => state.prices && state.prices[d.id] && (!d.minLevel || d.minLevel <= lvl));
}

function sdMakeBuyerOffer(state, regular) {
  const pool = sdEligibleDrugs(state);
  if (!pool.length) return null;
  // Regulars reorder their drug; new buyers pick one the player HOLDS if
  // possible (an offer you can actually fill teaches the system fastest)
  let drug = null;
  if (regular) drug = DRUGS.find(d => d.id === regular.drugId) || sdPick(pool);
  else {
    const held = pool.filter(d => (state.inventory || {})[d.id] > 0);
    drug = held.length && Math.random() < 0.7 ? sdPick(held) : sdPick(pool);
  }
  if (!drug || !state.prices[drug.id]) return null;
  const list = state.prices[drug.id];
  // Quantity scales with wallet/trust so day-1 offers are fillable
  const bankroll = Math.max(200, (state.cash || 0) + list * ((state.inventory || {})[drug.id] || 0));
  let qty = Math.max(2, Math.min(60, Math.floor(bankroll * 0.35 / list)));
  let premium = sdRand(1.08, 1.28);
  if (regular) {
    qty = Math.max(2, Math.round(qty * (1 + regular.trust * 0.15)));
    premium = Math.min(1.40, premium + regular.trust * 0.02);
  }
  return {
    id: 'sd_' + (state.day || 1) + '_' + Math.random().toString(36).slice(2, 7),
    type: 'buyer',
    name: regular ? regular.name : sdPick(STREET_BUYER_NAMES),
    line: regular ? 'is back for the usual — and word is you treat people right' : sdPick(STREET_BUYER_LINES),
    drugId: drug.id, qty,
    price: Math.max(1, Math.min(Math.floor(list * 1.40), Math.round(list * premium))),
    listAt: list,
    regularId: regular ? regular.id : null,
    countered: false,
    expiresDay: (state.day || 1) + (regular ? 1 : 2),
    locId: state.currentLocation,
  };
}

function sdMakeSellerOffer(state) {
  const pool = sdEligibleDrugs(state);
  if (!pool.length) return null;
  const drug = sdPick(pool);
  const list = state.prices[drug.id];
  const bankroll = Math.max(200, state.cash || 0);
  const qty = Math.max(2, Math.min(80, Math.floor(bankroll * 0.5 / (list * 0.75))));
  return {
    id: 'sd_' + (state.day || 1) + '_' + Math.random().toString(36).slice(2, 7),
    type: 'seller',
    name: sdPick(STREET_BUYER_NAMES),
    line: sdPick(STREET_SELLER_LINES),
    drugId: drug.id, qty,
    price: Math.max(1, Math.round(list * sdRand(0.60, 0.82))),
    listAt: list,
    countered: false,
    expiresDay: (state.day || 1) + 1,
    locId: state.currentLocation,
  };
}

// ------------------------------------------------------------
// Daily processing
// ------------------------------------------------------------
function processStreetDealsDaily(state) {
  const msgs = [];
  const sd = ensureStreetDealsState(state);
  const day = state.day || 1;

  // Expire stale offers; standing up a regular costs trust
  for (let i = sd.offers.length - 1; i >= 0; i--) {
    const o = sd.offers[i];
    if (day <= o.expiresDay) continue;
    if (o.regularId) {
      const reg = sd.regulars.find(r => r.id === o.regularId);
      if (reg) {
        reg.trust -= 1;
        if (reg.trust <= 0) {
          msgs.push(`💔 ${reg.name} found another dealer. You kept them waiting once too often.`);
          sd.regulars.splice(sd.regulars.indexOf(reg), 1);
        } else {
          msgs.push(`😒 ${reg.name} waited all day for you. (Regular trust -1)`);
        }
      }
    }
    sd.offers.splice(i, 1);
  }

  // Regulars reorder every few days
  for (const reg of sd.regulars) {
    if (day - reg.lastDay >= reg.cadence && !sd.offers.some(o => o.regularId === reg.id)) {
      const offer = sdMakeBuyerOffer(state, reg);
      if (offer) {
        reg.lastDay = day;
        sd.offers.push(offer);
        msgs.push(`⭐ Your regular ${reg.name} wants ${offer.qty} ${DRUGS.find(d => d.id === offer.drugId).name} at $${offer.price.toLocaleString()}/unit. Don't keep them waiting.`);
      }
    }
  }

  // Fresh walk-up offers: guaranteed traffic the first week, then rep-driven
  const repPull = Math.min(0.45, 0.18 + ((state.rep && state.rep.streetCred) || 0) / 250);
  const chance = day <= 7 ? 0.9 : repPull + (sd.regulars.length ? 0.1 : 0);
  if (sd.offers.length < 3 && Math.random() < chance) {
    const offer = Math.random() < 0.7 ? sdMakeBuyerOffer(state, null) : sdMakeSellerOffer(state);
    if (offer) {
      sd.offers.push(offer);
      const drug = DRUGS.find(d => d.id === offer.drugId);
      msgs.push(offer.type === 'buyer'
        ? `🤝 ${offer.name} ${offer.line}: wants ${offer.qty} ${drug.name} at $${offer.price.toLocaleString()}/unit (list $${offer.listAt.toLocaleString()}). Check BUY/SELL.`
        : `📦 ${offer.name}: ${offer.qty} ${drug.name} at $${offer.price.toLocaleString()}/unit — way under market. Check BUY/SELL.`);
    }
  }

  return msgs;
}

// ------------------------------------------------------------
// Actions
// ------------------------------------------------------------
function doStreetDeal(offerId, action) {
  const state = gameState;
  const sd = ensureStreetDealsState(state);
  const idx = sd.offers.findIndex(o => o.id === offerId);
  if (idx < 0) return;
  const o = sd.offers[idx];
  const drug = DRUGS.find(d => d.id === o.drugId);
  if (!drug) { sd.offers.splice(idx, 1); render(); return; }

  if (action === 'decline') {
    sd.stats.declined++;
    if (o.regularId) {
      const reg = sd.regulars.find(r => r.id === o.regularId);
      if (reg) { reg.trust -= 1; if (reg.trust <= 0) { sd.regulars.splice(sd.regulars.indexOf(reg), 1); showNotification(`💔 ${o.name} won't be coming back.`, 'warning'); } }
    }
    sd.offers.splice(idx, 1);
    playSound('click');
    render();
    return;
  }

  if (action === 'counter') {
    if (o.countered) return;
    o.countered = true;
    sd.stats.countered++;
    // Speech skill + Silver Tongue decide who blinks
    const speech = (state.speechSkill || 0) + (typeof getSkillEffect === 'function' ? getSkillEffect(state, 'speechBonus') : 0);
    const charmPassive = typeof getCharacterPassiveValue === 'function' ? (getCharacterPassiveValue(state, 'buyDiscount') || 0) : 0;
    const winChance = Math.min(0.85, 0.40 + speech / 150 + charmPassive);
    if (Math.random() < winChance) {
      const bump = sdRand(0.08, 0.18);
      if (o.type === 'buyer') o.price = Math.round(o.price * (1 + bump));
      else o.price = Math.max(1, Math.round(o.price * (1 - bump)));
      playSound('buy');
      showNotification(`😎 They blinked. ${o.type === 'buyer' ? 'Price up' : 'Price down'} ${Math.round(bump * 100)}% → $${o.price.toLocaleString()}/unit.`, 'success');
    } else if (Math.random() < 0.5) {
      sd.offers.splice(idx, 1);
      playSound('hurt');
      showNotification(`🚶 "${o.name} doesn't haggle." They walked.`, 'error');
      render();
      return;
    } else {
      playSound('click');
      showNotification(`😐 "${'Price is the price.'}" The offer stands — take it or leave it.`, 'info');
    }
    render();
    return;
  }

  // ACCEPT
  if (o.type === 'buyer') {
    const have = (state.inventory || {})[o.drugId] || 0;
    if (have < o.qty) { showNotification(`Need ${o.qty} ${drug.name} — you have ${have}. Buy more or let it expire.`, 'warning'); return; }
    // Sting: dealing weight while hot gets you a wire in the room
    const heat = state.heat || 0;
    if (heat > 40 && Math.random() < Math.min(0.30, (heat - 40) / 200)) {
      sd.stats.stings++;
      sd.offers.splice(idx, 1);
      state.inventory[o.drugId] -= o.qty;
      if (state.inventory[o.drugId] <= 0) delete state.inventory[o.drugId];
      state.heat = Math.min(100, heat + 12);
      if (typeof updateInvestigation === 'function') updateInvestigation(state, 'sell_large', 12);
      playSound('arrest');
      showNotification(`🚨 "${o.name}" flashed a badge — UNDERCOVER! You dumped the ${drug.name} and ran. Product gone, heat +12.`, 'error');
      if (typeof pushNews === 'function') pushNews(state, { headline: `STING OPERATION NETS DEALER PRODUCT IN ${(newsLocName ? newsLocName(state.currentLocation) : 'MIAMI').toUpperCase()}`, body: 'An undercover buy went exactly how the department drew it up. The seller escaped; the evidence did not.', source: 'Metro-Dade PD Blotter', category: 'police', locId: state.currentLocation });
      render();
      return;
    }
    // Rip-off: some first-timers grab and run
    if (!o.regularId && Math.random() < 0.04) {
      sd.stats.ripoffs++;
      sd.offers.splice(idx, 1);
      const grabbed = Math.ceil(o.qty / 2);
      state.inventory[o.drugId] -= grabbed;
      if (state.inventory[o.drugId] <= 0) delete state.inventory[o.drugId];
      playSound('hurt');
      showNotification(`🏃 ${o.name} snatched ${grabbed} ${drug.name} and bolted! Should've brought muscle.`, 'error');
      render();
      return;
    }
    // Clean private sale — negotiated price, no corner spread, low heat
    const revenue = o.price * o.qty;
    state.inventory[o.drugId] -= o.qty;
    if (state.inventory[o.drugId] <= 0) delete state.inventory[o.drugId];
    state.cash += revenue;
    state.dirtyMoney = (state.dirtyMoney || 0) + revenue;
    if (typeof normalizeMoneyLedger === 'function') normalizeMoneyLedger(state);
    state.drugsSold = (state.drugsSold || 0) + o.qty;
    state.heat = Math.min(100, (state.heat || 0) + 1);
    sd.stats.accepted++;
    if (typeof awardXP === 'function') awardXP(state, 'sell_drug');
    if (typeof adjustRep === 'function') adjustRep(state, 'streetCred', 1);
    if (typeof updateAchievementStats === 'function') updateAchievementStats(state, 'sell', { drugId: o.drugId, amount: o.qty });
    // Loyalty: regulars deepen, strangers may convert
    if (o.regularId) {
      const reg = sd.regulars.find(r => r.id === o.regularId);
      if (reg) { reg.trust = Math.min(10, reg.trust + 1); reg.lastDay = state.day; reg.cadence = Math.max(3, reg.cadence - (reg.trust >= 5 ? 1 : 0)); }
    } else if (sd.regulars.length < 5 && Math.random() < 0.35) {
      sd.regulars.push({ id: 'reg_' + Math.random().toString(36).slice(2, 8), name: o.name, drugId: o.drugId, trust: 1, cadence: 4 + Math.floor(Math.random() * 3), lastDay: state.day });
      sd.stats.regularsMade++;
      showNotification(`⭐ ${o.name} likes how you do business — you've got a REGULAR now. They'll be back.`, 'success');
    }
    sd.offers.splice(idx, 1);
    playSound('sell');
    showNotification(`💵 Sold ${o.qty} ${drug.name} to ${o.name} for $${revenue.toLocaleString()} ($${o.price.toLocaleString()}/unit vs $${o.listAt.toLocaleString()} list).`, 'success');
    if (typeof _flashTradeRow === 'function') _flashTradeRow(o.drugId, 'sell');
    render();
    return;
  }

  // seller offer: buy the cheap lot
  const cost = o.price * o.qty;
  if (state.cash < cost) { showNotification(`Need $${cost.toLocaleString()} cash for the whole lot.`, 'warning'); return; }
  const free = typeof getFreeSpace === 'function' ? getFreeSpace(state) : 9999;
  if (free < o.qty) { showNotification(`Need ${o.qty} free inventory space (you have ${free}).`, 'warning'); return; }
  state.cash -= cost;
  state.dirtyMoney = Math.max(0, (state.dirtyMoney || 0) - cost);
  if (typeof normalizeMoneyLedger === 'function') normalizeMoneyLedger(state);
  state.inventory[o.drugId] = (state.inventory[o.drugId] || 0) + o.qty;
  state.drugsBought = (state.drugsBought || 0) + o.qty;
  sd.stats.accepted++;
  sd.offers.splice(idx, 1);
  playSound('buy');
  showNotification(`📦 Bought ${o.qty} ${drug.name} off ${o.name} for $${cost.toLocaleString()} ($${o.price.toLocaleString()}/unit vs $${o.listAt.toLocaleString()} list).`, 'success');
  if (typeof _flashTradeRow === 'function') _flashTradeRow(o.drugId, 'buy');
  render();
}

// ------------------------------------------------------------
// UI panel — rendered at the top of the Buy/Sell tab
// ------------------------------------------------------------
function renderStreetDealsPanel() {
  if (typeof gameState === 'undefined' || !gameState) return '';
  const sd = ensureStreetDealsState(gameState);
  const local = sd.offers.filter(o => o.locId === gameState.currentLocation);
  const regularsBadge = sd.regulars.length
    ? `<span style="font-size:0.62rem;color:var(--neon-yellow);" title="${sd.regulars.map(r => r.name + ' (trust ' + r.trust + ')').join(', ')}">⭐ ${sd.regulars.length} regular${sd.regulars.length > 1 ? 's' : ''}</span>`
    : '';
  if (!local.length) {
    return sd.regulars.length ? `<div style="font-size:0.68rem;color:var(--text-dim);margin:0.25rem 0;">🤝 Street: no offers here today. ${regularsBadge}</div>` : '';
  }
  const cards = local.map(o => {
    const drug = DRUGS.find(d => d.id === o.drugId) || {};
    const total = (o.price * o.qty).toLocaleString();
    const vsList = Math.round((o.price / o.listAt - 1) * 100);
    const isBuyer = o.type === 'buyer';
    const have = (gameState.inventory || {})[o.drugId] || 0;
    const canDo = isBuyer ? have >= o.qty : gameState.cash >= o.price * o.qty;
    const hot = (gameState.heat || 0) > 40 && isBuyer;
    return `
      <div style="border:1px solid ${isBuyer ? 'rgba(57,255,20,0.35)' : 'rgba(0,240,255,0.35)'};border-radius:6px;padding:0.45rem 0.55rem;margin:0.3rem 0;background:rgba(0,20,10,0.25);">
        <div style="display:flex;justify-content:space-between;gap:0.4rem;flex-wrap:wrap;font-size:0.78rem;">
          <span><b style="color:${isBuyer ? 'var(--neon-green)' : 'var(--neon-cyan)'}">${o.regularId ? '⭐ ' : ''}${o.name}</b> ${isBuyer ? 'BUYS' : 'SELLS'} ${o.qty} ${drug.emoji || ''} ${drug.name}</span>
          <span>$${o.price.toLocaleString()}/u <span style="color:${(isBuyer ? vsList >= 0 : vsList <= 0) ? 'var(--neon-green)' : 'var(--neon-red)'};font-size:0.68rem">(${vsList >= 0 ? '+' : ''}${vsList}% vs list)</span> = <b class="neon-yellow">$${total}</b></span>
        </div>
        <div style="font-size:0.65rem;color:var(--text-dim);margin:0.15rem 0;">${o.regularId ? 'Regular customer — trust builds bigger orders.' : o.line}${hot ? ' <span style="color:var(--neon-red)">⚠️ You are hot — private buys can be stings.</span>' : ''}</div>
        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
          <button class="btn btn-sm ${isBuyer ? 'btn-sell' : 'btn-buy'}" ${canDo ? '' : 'disabled style="opacity:0.45"'} onclick="doStreetDeal('${o.id}','accept')">${isBuyer ? '💵 SELL ' + o.qty : '📦 BUY LOT'}</button>
          <button class="btn btn-sm btn-secondary" ${o.countered ? 'disabled style="opacity:0.45"' : ''} onclick="doStreetDeal('${o.id}','counter')">🗣️ ${o.countered ? 'COUNTERED' : 'COUNTER'}</button>
          <button class="btn btn-sm btn-secondary" onclick="doStreetDeal('${o.id}','decline')">✋ PASS</button>
          ${!canDo ? `<span style="font-size:0.62rem;color:var(--neon-red);align-self:center;">${isBuyer ? 'need ' + o.qty + ' (have ' + have + ')' : 'need $' + (o.price * o.qty).toLocaleString()}</span>` : ''}
        </div>
      </div>`;
  }).join('');
  return `
    <div style="margin:0.3rem 0 0.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.72rem;color:var(--neon-pink);font-weight:bold;letter-spacing:0.05em;">🤝 STREET OFFERS <span style="color:var(--text-dim);font-weight:normal">(private deals — no dealer cut)</span></span>
        ${regularsBadge}
      </div>
      ${cards}
    </div>`;
}
