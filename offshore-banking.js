// offshore-banking.js — Offshore Accounts, IRS Audits, Shell Layering
// ============================================================
// Four offshore jurisdictions to park money beyond the reach of
// U.S. asset forfeiture. Court convictions seize state.cash and
// state.bank (game-engine.js initCourtCase / resolveVerdict) — money
// in state.offshore.accounts is deliberately never touched by those
// systems, which is the whole point of this feature.
//
// Integration (already wired elsewhere, behind typeof guards):
//   - game-engine.js daily loop calls processOffshoreDaily(state)
//   - game-ui.js routes currentScreen 'offshore' -> renderOffshore()
//   - game-ui.js sidebar shows the 🏝️ Offshore button
//
// Plain global script (no modules), matching the rest of the codebase.
// Only edits gameState.offshore, gameState.bank/cash/dirtyMoney and
// pushes to messageLog / news feed.
// ============================================================

// ============================================================
// DATA
// ============================================================

const OFFSHORE_JURISDICTIONS = [
  {
    id: 'panama', name: 'Panama', flag: '🇵🇦', setupCost: 25000, minDay: 300, feePct: 0.08,
    event: 'leak', withdrawDelay: 0, color: '#ffcc66',
    desc: 'Cheap shell companies via a friendly law firm on Avenida Balboa. High fees, low bar.',
    risk: 'Risk: leaky. If the firm\'s files ever hit the press, everyone named gets scrutiny.',
  },
  {
    id: 'cayman', name: 'Cayman Islands', flag: '🇰🇾', setupCost: 100000, minDay: 900, feePct: 0.05,
    event: 'freeze', withdrawDelay: 0, color: '#66ddff',
    desc: 'Georgetown private banking. Respectable paper, better rates, real bankers.',
    risk: 'Risk: cooperative regulators. U.S. Treasury pressure can freeze the account for a month.',
  },
  {
    id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', setupCost: 500000, minDay: 1800, feePct: 0.03,
    event: null, withdrawDelay: 7, color: '#ff8888',
    desc: 'Numbered account in Zurich. Nobody asks, nobody tells, nobody ever leaks.',
    risk: 'Quirk: discretion is slow. Withdrawals clear in 7 days — no exceptions, not even for you.',
  },
  {
    id: 'vanuatu', name: 'Vanuatu', flag: '🇻🇺', setupCost: 1000000, minDay: 2800, feePct: 0.02,
    event: 'coup', withdrawDelay: 0, color: '#88ff99',
    desc: 'A Pacific tax haven with no treaties, no records and the lowest fees on Earth.',
    risk: 'Risk: political instability. A coup in Port Vila can lock the vaults for weeks.',
  },
];

const OFFSHORE_CONFIG = {
  layerCostPct: 0.25,        // dirty money layered offshore loses 25%
  layerDays: 5,              // layering transfer time
  layerFrontPer: 200000,     // need 1 front business per $200K layered per run
  layerScrutiny: 8,          // scrutiny per layering run
  weeklyThreshold: 100000,   // moving more than this in a rolling week draws extra scrutiny
  weeklyExtraScrutiny: 3,    // extra scrutiny per move while over the weekly threshold
  scrutinyAuditFloor: 60,    // above this, audits can trigger
  auditChancePerDay: 0.03,   // 3%/day above the floor
  auditDays: 7,              // days to respond before the auto-ignore roll
  lawyerCost: 50000,
  eventBaseChance: 0.005,    // 0.5%/day per opened jurisdiction, day-scaled
};

// ============================================================
// STATE / HELPERS
// ============================================================

function ensureOffshoreState(state) {
  if (!state) return null;
  if (!state.offshore || typeof state.offshore !== 'object') {
    state.offshore = { accounts: {}, transfers: [], scrutiny: 0, weekMoved: 0, auditsPassed: 0 };
  }
  const os = state.offshore;
  if (!os.accounts || typeof os.accounts !== 'object') os.accounts = {};
  if (!Array.isArray(os.transfers)) os.transfers = [];
  if (typeof os.scrutiny !== 'number' || isNaN(os.scrutiny)) os.scrutiny = 0;
  if (typeof os.weekMoved !== 'number' || isNaN(os.weekMoved)) os.weekMoved = 0;
  if (typeof os.auditsPassed !== 'number') os.auditsPassed = 0;
  if (!Array.isArray(os.moveLog)) os.moveLog = [];          // {day, amount} for the rolling week
  if (!Array.isArray(os.pendingEvents)) os.pendingEvents = []; // {type, jurisdiction, fireDay}
  if (os.pendingAudit !== null && typeof os.pendingAudit !== 'object') os.pendingAudit = null;
  if (os.pendingAudit === undefined) os.pendingAudit = null;
  // Heal account entries from old saves
  Object.keys(os.accounts).forEach(j => {
    const a = os.accounts[j];
    if (!a || typeof a !== 'object') { delete os.accounts[j]; return; }
    if (typeof a.balance !== 'number' || isNaN(a.balance)) a.balance = 0;
    if (typeof a.openedDay !== 'number') a.openedDay = state.day || 1;
    if (typeof a.lockedUntil !== 'number') a.lockedUntil = 0;
  });
  return os;
}

function offshoreGetState() {
  if (typeof gameState === 'undefined' || !gameState) return null;
  return ensureOffshoreState(gameState);
}

function offshoreJur(j) {
  return OFFSHORE_JURISDICTIONS.find(x => x.id === j) || null;
}

function offshoreMoney(n) {
  return '$' + Math.round(n || 0).toLocaleString();
}

function offshoreLog(msg) {
  if (typeof gameState !== 'undefined' && gameState && Array.isArray(gameState.messageLog)) {
    gameState.messageLog.push(msg);
  }
}

/** Spend cash respecting the dirty/clean split (dirty first), like the rest of the codebase. */
function offshoreSpendCash(amount) {
  gameState.cash = Math.max(0, (gameState.cash || 0) - amount);
  if (typeof gameState.dirtyMoney === 'number' && gameState.dirtyMoney > 0) {
    const fromDirty = Math.min(gameState.dirtyMoney, amount);
    gameState.dirtyMoney -= fromDirty;
    amount -= fromDirty;
  }
  if (typeof gameState.cleanMoney === 'number' && amount > 0) {
    gameState.cleanMoney = Math.max(0, gameState.cleanMoney - amount);
  }
}

/** Sum of all offshore balances (does NOT include in-flight transfers). */
function offshoreTotal(os) {
  return Object.keys(os.accounts).reduce((sum, j) => sum + (os.accounts[j].balance || 0), 0);
}

/** Rolling 7-day moved total, recomputed from the move log. */
function offshoreRecalcWeek(os, day) {
  os.moveLog = os.moveLog.filter(m => m && (day - m.day) < 7);
  os.weekMoved = os.moveLog.reduce((s, m) => s + (m.amount || 0), 0);
  return os.weekMoved;
}

/** Record a money movement (deposit/withdraw/layer) for the rolling-week scrutiny rule. */
function offshoreRecordMove(os, day, amount) {
  offshoreRecalcWeek(os, day);
  os.moveLog.push({ day: day, amount: amount });
  os.weekMoved += amount;
  if (os.weekMoved > OFFSHORE_CONFIG.weeklyThreshold) {
    os.scrutiny += OFFSHORE_CONFIG.weeklyExtraScrutiny; // big weekly volume = extra eyes
    return true;
  }
  return false;
}

function offshoreAccountLocked(acct, day) {
  return acct && acct.lockedUntil && acct.lockedUntil > day;
}

function offshoreReadInput(id) {
  if (typeof document === 'undefined') return 0;
  const el = document.getElementById(id);
  if (!el) return 0;
  const v = parseInt(String(el.value).replace(/[^0-9]/g, ''), 10);
  return isNaN(v) || v < 0 ? 0 : v;
}

function offshoreFail(msg) {
  showNotification(msg, 'error');
  playSound('error');
}

function offshoreNews(item) {
  if (typeof pushNews === 'function' && typeof gameState !== 'undefined' && gameState) {
    pushNews(gameState, item);
  }
}

// ============================================================
// HANDLERS — ACCOUNTS & FLOWS
// ============================================================

function doOpenJurisdiction(j) {
  const os = offshoreGetState();
  if (!os) return;
  const jur = offshoreJur(j);
  if (!jur) return;
  const day = gameState.day || 1;
  if (os.accounts[j]) { offshoreFail(`You already have a ${jur.name} account.`); return; }
  if (day < jur.minDay) { offshoreFail(`${jur.name} contacts aren't available until day ${jur.minDay}.`); return; }
  if ((gameState.cash || 0) < jur.setupCost) { offshoreFail(`Setting up in ${jur.name} costs ${offshoreMoney(jur.setupCost)} cash.`); return; }

  offshoreSpendCash(jur.setupCost);
  os.accounts[j] = { balance: 0, openedDay: day, lockedUntil: 0 };
  os.scrutiny += 2; // opening an offshore vehicle leaves a small paper trail
  const msg = `${jur.flag} Opened a numbered account in ${jur.name} (${offshoreMoney(jur.setupCost)} setup, ${Math.round(jur.feePct * 100)}% deposit fee).`;
  offshoreLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doOffshoreDeposit(j) {
  const os = offshoreGetState();
  if (!os) return;
  const jur = offshoreJur(j);
  const acct = os.accounts[j];
  if (!jur || !acct) return;
  const day = gameState.day || 1;
  if (offshoreAccountLocked(acct, day)) { offshoreFail(`Your ${jur.name} account is locked for ${acct.lockedUntil - day} more day(s).`); return; }
  const amount = offshoreReadInput('offshore-dep-' + j);
  if (amount <= 0) { offshoreFail('Enter an amount to wire.'); return; }
  if (amount > (gameState.bank || 0)) { offshoreFail(`Only ${offshoreMoney(gameState.bank || 0)} in your bank. Offshore wires come from the bank, not street cash.`); return; }

  const fee = Math.round(amount * jur.feePct);
  gameState.bank -= amount;
  acct.balance += amount - fee;
  os.scrutiny += 1 + Math.min(9, Math.floor(amount / 50000)); // bigger wires draw more eyes
  const overWeek = offshoreRecordMove(os, day, amount);
  const msg = `${jur.flag} Wired ${offshoreMoney(amount)} to ${jur.name} (${offshoreMoney(fee)} fee). Balance: ${offshoreMoney(acct.balance)}.${overWeek ? ' ⚠️ Heavy weekly volume — extra scrutiny.' : ''}`;
  offshoreLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doOffshoreWithdraw(j) {
  const os = offshoreGetState();
  if (!os) return;
  const jur = offshoreJur(j);
  const acct = os.accounts[j];
  if (!jur || !acct) return;
  const day = gameState.day || 1;
  if (offshoreAccountLocked(acct, day)) { offshoreFail(`Your ${jur.name} account is locked for ${acct.lockedUntil - day} more day(s).`); return; }
  const amount = offshoreReadInput('offshore-wd-' + j);
  if (amount <= 0) { offshoreFail('Enter an amount to withdraw.'); return; }
  if (amount > acct.balance) { offshoreFail(`Only ${offshoreMoney(acct.balance)} in ${jur.name}.`); return; }

  acct.balance -= amount;
  os.scrutiny += 1 + Math.min(5, Math.floor(amount / 100000));
  const overWeek = offshoreRecordMove(os, day, amount);
  let msg;
  if (jur.withdrawDelay > 0) {
    os.transfers.push({ id: 'tr' + Date.now() + '_' + Math.floor(Math.random() * 1000), type: 'withdraw', jurisdiction: j, amount: amount, arriveDay: day + jur.withdrawDelay });
    msg = `${jur.flag} ${jur.name} withdrawal of ${offshoreMoney(amount)} initiated — clears to your bank in ${jur.withdrawDelay} days.`;
  } else {
    gameState.bank = (gameState.bank || 0) + amount;
    msg = `${jur.flag} Withdrew ${offshoreMoney(amount)} from ${jur.name} to your bank.`;
  }
  if (overWeek) msg += ' ⚠️ Heavy weekly volume — extra scrutiny.';
  offshoreLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doLayerCash() {
  const os = offshoreGetState();
  if (!os) return;
  const day = gameState.day || 1;
  const dest = (typeof document !== 'undefined' && document.getElementById('offshore-layer-dest'))
    ? document.getElementById('offshore-layer-dest').value : null;
  const jur = offshoreJur(dest);
  const acct = jur ? os.accounts[dest] : null;
  if (!jur || !acct) { offshoreFail('Pick an open offshore account to layer into.'); return; }
  if (offshoreAccountLocked(acct, day)) { offshoreFail(`${jur.name} is locked — pick another destination.`); return; }
  const amount = offshoreReadInput('offshore-layer-amt');
  if (amount <= 0) { offshoreFail('Enter an amount of dirty cash to layer.'); return; }
  if (amount > (gameState.dirtyMoney || 0)) { offshoreFail(`You only have ${offshoreMoney(gameState.dirtyMoney || 0)} in dirty cash.`); return; }
  if (amount > (gameState.cash || 0)) { offshoreFail('Not enough cash on hand.'); return; }
  const frontCount = (gameState.frontBusinesses || []).length;
  const frontsNeeded = Math.max(1, Math.ceil(amount / OFFSHORE_CONFIG.layerFrontPer));
  if (frontCount < frontsNeeded) {
    offshoreFail(`Layering ${offshoreMoney(amount)} needs ${frontsNeeded} front business(es) to shuffle invoices through — you own ${frontCount}.`);
    return;
  }

  gameState.cash -= amount;
  gameState.dirtyMoney = Math.max(0, (gameState.dirtyMoney || 0) - amount);
  const arriving = Math.round(amount * (1 - OFFSHORE_CONFIG.layerCostPct));
  os.transfers.push({ id: 'tr' + Date.now() + '_' + Math.floor(Math.random() * 1000), type: 'layer', jurisdiction: dest, amount: arriving, arriveDay: day + OFFSHORE_CONFIG.layerDays });
  os.scrutiny += OFFSHORE_CONFIG.layerScrutiny;
  offshoreRecordMove(os, day, amount);
  if (gameState.stats) gameState.stats.totalLaunderedMoney = (gameState.stats.totalLaunderedMoney || 0) + arriving;
  const msg = `🌀 Layering ${offshoreMoney(amount)} of dirty cash through ${frontsNeeded} front(s) → ${jur.flag} ${jur.name}. ${offshoreMoney(arriving)} arrives clean in ${OFFSHORE_CONFIG.layerDays} days (25% shredded in the wash).`;
  offshoreLog(msg);
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

// ============================================================
// HANDLERS — AUDIT RESOLUTIONS
// ============================================================

/** Shared "ignore" roll: 50% it blows over, 50% fine + investigation. mult halves consequences for the lawyer. */
function offshoreResolveIgnoreRoll(state, os, mult) {
  mult = mult || 1;
  const msgs = [];
  if (Math.random() < 0.5) {
    // Busted paperwork
    const fine = Math.round((state.bank || 0) * 0.20 * mult);
    state.bank = Math.max(0, (state.bank || 0) - fine);
    if (typeof updateInvestigation === 'function') {
      const invMsgs = updateInvestigation(state, 'offshore_audit', Math.round(12 * mult));
      if (invMsgs && invMsgs.length) msgs.push(...invMsgs);
    }
    msgs.push(`⚖️ IRS audit went badly: ${offshoreMoney(fine)} fine levied on your bank accounts. The file stays open.`);
    offshoreNews({
      headline: 'IRS SLAPS SIX-FIGURE PENALTY ON UNNAMED MIAMI INVESTOR',
      body: 'Criminal referral not ruled out, sources at the service say. Offshore structures were involved.',
      source: 'Miami Herald', category: 'police',
    });
    os.scrutiny = Math.max(30, os.scrutiny - 15);
  } else {
    os.auditsPassed += 1;
    msgs.push('📁 The IRS audit stalled out — an overworked examiner closed the file. It blows over.');
    os.scrutiny = Math.max(0, os.scrutiny - 25);
  }
  os.pendingAudit = null;
  return msgs;
}

function doAuditLawyer() {
  const os = offshoreGetState();
  if (!os || !os.pendingAudit) return;
  if ((gameState.cash || 0) < OFFSHORE_CONFIG.lawyerCost) {
    offshoreFail(`The tax attorney wants ${offshoreMoney(OFFSHORE_CONFIG.lawyerCost)} cash up front.`);
    return;
  }
  offshoreSpendCash(OFFSHORE_CONFIG.lawyerCost);
  offshoreLog(`💼 Retained a white-shoe tax attorney for ${offshoreMoney(OFFSHORE_CONFIG.lawyerCost)} to handle the IRS audit.`);
  const msgs = offshoreResolveIgnoreRoll(gameState, os, 0.5); // halved consequences
  os.scrutiny = Math.min(os.scrutiny, 25);
  msgs.forEach(offshoreLog);
  const last = msgs[msgs.length - 1] || 'Audit handled.';
  showNotification(last, last.indexOf('fine') >= 0 ? 'error' : 'success');
  playSound(last.indexOf('fine') >= 0 ? 'error' : 'cash');
  render();
}

function doAuditShuffle() {
  const os = offshoreGetState();
  if (!os || !os.pendingAudit) return;
  const frontCount = (gameState.frontBusinesses || []).length;
  if (frontCount < 2) { offshoreFail('Shell shuffling needs at least 2 front businesses to route the paper through.'); return; }
  const total = offshoreTotal(os);
  if (total <= 0) { offshoreFail('Nothing offshore to shuffle — retain the lawyer or ride it out.'); return; }
  const cost = Math.round(total * 0.10);
  // Pay proportionally out of every account
  Object.keys(os.accounts).forEach(j => {
    const a = os.accounts[j];
    if (a.balance > 0) a.balance = Math.max(0, a.balance - Math.round(a.balance / total * cost));
  });
  os.scrutiny = 15;
  os.auditsPassed += 1;
  os.pendingAudit = null;
  const msg = `🐚 Shell shuffle: dissolved and re-papered every entity through your fronts for ${offshoreMoney(cost)} (10% of offshore holdings). The IRS trail goes cold. Scrutiny reset.`;
  offshoreLog(msg);
  offshoreNews({
    headline: 'PAPER TRAIL EVAPORATES IN CARIBBEAN CORPORATE RESHUFFLE',
    body: 'Investigators following a Miami money trail hit a wall of freshly dissolved holding companies.',
    source: 'Sun Sentinel', category: 'street',
  });
  showNotification(msg, 'success');
  playSound('cash');
  render();
}

function doAuditIgnore() {
  const os = offshoreGetState();
  if (!os || !os.pendingAudit) return;
  offshoreLog('🗑️ You tossed the IRS audit notice in the trash.');
  const msgs = offshoreResolveIgnoreRoll(gameState, os, 1);
  msgs.forEach(offshoreLog);
  const last = msgs[msgs.length - 1] || 'Audit resolved.';
  showNotification(last, last.indexOf('blows over') >= 0 || last.indexOf('stalled') >= 0 ? 'success' : 'error');
  playSound(last.indexOf('stalled') >= 0 ? 'click' : 'error');
  render();
}

// ============================================================
// DAILY PROCESSING (called by game-engine.js behind a typeof guard)
// ============================================================

function processOffshoreDaily(state) {
  if (!state) return [];
  const os = ensureOffshoreState(state);
  const day = state.day || 1;
  const msgs = [];

  // ---- Rolling week + scrutiny decay ----
  offshoreRecalcWeek(os, day);
  if (os.scrutiny > 0) {
    if (os.scrutiny < 40) {
      os.scrutiny = Math.max(0, os.scrutiny - 1); // routine cooldown
    } else if (os.weekMoved === 0) {
      os.scrutiny -= 1; // above 40 only cools off if you stop moving money entirely
    }
  }

  // ---- Deliver transfers ----
  const remaining = [];
  os.transfers.forEach(t => {
    if (!t || typeof t.arriveDay !== 'number') return;
    if (t.arriveDay > day) { remaining.push(t); return; }
    const jur = offshoreJur(t.jurisdiction);
    const flag = jur ? jur.flag : '🏝️';
    if (t.type === 'withdraw') {
      state.bank = (state.bank || 0) + t.amount;
      msgs.push(`${flag} ${jur ? jur.name : 'Offshore'} withdrawal cleared: ${offshoreMoney(t.amount)} arrived in your bank.`);
    } else if (t.type === 'layer') {
      const acct = os.accounts[t.jurisdiction];
      if (acct) {
        acct.balance += t.amount;
        msgs.push(`🌀 Layered funds landed: ${offshoreMoney(t.amount)} now clean in ${flag} ${jur ? jur.name : 'offshore'}.`);
      } else {
        // Account somehow gone (old save weirdness) — recover to bank rather than vanish
        state.bank = (state.bank || 0) + t.amount;
        msgs.push(`🌀 Layered funds rerouted to your bank: ${offshoreMoney(t.amount)}.`);
      }
    }
  });
  os.transfers = remaining;

  // ---- Account unlocks ----
  Object.keys(os.accounts).forEach(j => {
    const a = os.accounts[j];
    if (a.lockedUntil && a.lockedUntil <= day) {
      a.lockedUntil = 0;
      const jur = offshoreJur(j);
      msgs.push(`${jur ? jur.flag : '🏝️'} Your ${jur ? jur.name : j} account is accessible again.`);
    }
  });

  // ---- Fire scheduled jurisdiction events (warned 3+ days ago) ----
  const stillPending = [];
  os.pendingEvents.forEach(ev => {
    if (!ev || typeof ev.fireDay !== 'number') return;
    if (ev.fireDay > day) { stillPending.push(ev); return; }
    if (ev.type === 'leak') {
      os.scrutiny += 30;
      msgs.push('📰 PANAMA LEAK! Your law firm\'s client files hit the international press. Scrutiny +30.');
      offshoreNews({
        headline: 'MASSIVE LEAK EXPOSES PANAMANIAN SHELL COMPANY CLIENTS',
        body: 'Thousands of confidential incorporation records published. U.S. authorities promise to pursue every American name in the files.',
        source: 'Miami Herald', category: 'police',
      });
    } else if (ev.type === 'freeze') {
      const acct = os.accounts.cayman;
      if (acct && !offshoreAccountLocked(acct, day)) {
        acct.lockedUntil = day + 30;
        msgs.push('🧊 Cayman regulators froze your account for 30 days under U.S. Treasury pressure. The money is safe — just unreachable.');
        offshoreNews({
          headline: 'CAYMAN BANKS FREEZE ACCOUNTS IN U.S. COMPLIANCE SWEEP',
          body: 'Georgetown institutions suspend flagged foreign accounts pending review. Depositors told to expect a month of paperwork.',
          source: 'Channel 7 News', category: 'police',
        });
      }
    } else if (ev.type === 'coup') {
      const acct = os.accounts.vanuatu;
      if (acct && !offshoreAccountLocked(acct, day)) {
        const days = 20 + Math.floor(Math.random() * 41); // 20-60
        acct.lockedUntil = day + days;
        msgs.push(`🪖 COUP IN VANUATU! Soldiers hold the capital — banks shuttered. Your account is locked for ${days} days.`);
        offshoreNews({
          headline: 'MILITARY COUP ROCKS VANUATU, BANKING SYSTEM SUSPENDED',
          body: 'Port Vila under curfew as officers seize government buildings. Offshore depositors worldwide are locked out until order returns.',
          source: 'Miami Herald', category: 'world',
        });
      }
    }
  });
  os.pendingEvents = stillPending;

  // ---- Schedule new jurisdiction events (rare, day-scaled, warned 3-6 days ahead) ----
  const dayScale = 1 + Math.min(1, day / 5000); // up to 2x by endgame
  OFFSHORE_JURISDICTIONS.forEach(jur => {
    if (!jur.event) return;
    const acct = os.accounts[jur.id];
    if (!acct) return;
    if (os.pendingEvents.some(ev => ev.type === jur.event)) return;
    if ((jur.event === 'freeze' || jur.event === 'coup') && offshoreAccountLocked(acct, day)) return;
    if (Math.random() >= OFFSHORE_CONFIG.eventBaseChance * dayScale) return;
    const warnDays = 3 + Math.floor(Math.random() * 4); // fires in 3-6 days
    os.pendingEvents.push({ type: jur.event, jurisdiction: jur.id, fireDay: day + warnDays });
    // The warning headline — a sharp player reads the paper and moves money in time
    if (jur.event === 'leak') {
      offshoreNews({
        headline: 'INVESTIGATIVE JOURNALISTS CIRCLE PANAMANIAN LAW FIRM',
        body: 'An international reporting consortium is said to be sitting on a trove of leaked incorporation documents. Publication rumored within days.',
        source: 'Miami Herald', category: 'world',
      });
    } else if (jur.event === 'freeze') {
      offshoreNews({
        headline: 'U.S. TREASURY TURNS SCREWS ON CAYMAN BANKING SECTOR',
        body: 'Compliance officials in Georgetown brace for a sweep of foreign-held accounts. Freezes expected within the week.',
        source: 'Sun Sentinel', category: 'police',
      });
    } else if (jur.event === 'coup') {
      offshoreNews({
        headline: 'UNREST BREWING IN PORT VILA AS OFFICERS DEFY GOVERNMENT',
        body: 'Diplomats report troop movements near Vanuatu\'s capital. Analysts warn the banking sector could shut overnight if it boils over.',
        source: 'Channel 7 News', category: 'world',
      });
    }
  });

  // ---- Audits ----
  if (os.pendingAudit) {
    os.pendingAudit.daysLeft = (os.pendingAudit.daysLeft || 0) - 1;
    if (os.pendingAudit.daysLeft <= 0) {
      msgs.push('📋 The IRS audit response deadline passed. Your silence speaks for itself...');
      const auditMsgs = offshoreResolveIgnoreRoll(state, os, 1);
      msgs.push(...auditMsgs);
    } else if (os.pendingAudit.daysLeft <= 3) {
      msgs.push(`📋 IRS audit deadline: ${os.pendingAudit.daysLeft} day(s) left to respond (Offshore screen).`);
    }
  } else if (os.scrutiny > OFFSHORE_CONFIG.scrutinyAuditFloor
      && Object.keys(os.accounts).length > 0
      && Math.random() < OFFSHORE_CONFIG.auditChancePerDay) {
    os.pendingAudit = { startedDay: day, daysLeft: OFFSHORE_CONFIG.auditDays };
    msgs.push('📋 IRS AUDIT NOTICE! The Service wants an explanation for your international wire activity. You have 7 days to respond — see the Offshore screen.');
    offshoreNews({
      headline: 'IRS CRIMINAL DIVISION OPENS OFFSHORE COMPLIANCE PROBE',
      body: 'Examiners in the Miami field office are matching wire transfer records against declared income. Letters are going out this week.',
      source: 'Miami Herald', category: 'police',
    });
  }

  return msgs;
}

// ============================================================
// UI
// ============================================================

function offshoreScrutinyLine(s) {
  if (s <= 15) return { color: 'var(--neon-green)', text: 'Nobody is looking. Your paper is boring and that\'s beautiful.' };
  if (s < 40) return { color: 'var(--neon-green)', text: 'Routine monitoring only. Keep transfers modest and this fades on its own.' };
  if (s <= 60) return { color: 'var(--neon-yellow)', text: 'FinCEN analysts have flagged your wires. It only cools off if you stop moving money for a week.' };
  return { color: 'var(--neon-red)', text: 'AUDIT RISK: 3% per day. Stop all transfers, or be ready for the IRS letter.' };
}

function renderOffshore() {
  if (typeof gameState === 'undefined' || !gameState) { currentScreen = 'title'; return renderTitle(); }
  const os = ensureOffshoreState(gameState);
  const day = gameState.day || 1;
  offshoreRecalcWeek(os, day);
  const total = offshoreTotal(os);
  const inFlight = os.transfers.reduce((s, t) => s + (t.amount || 0), 0);
  const scrutiny = Math.round(os.scrutiny);
  const sLine = offshoreScrutinyLine(scrutiny);
  const frontCount = (gameState.frontBusinesses || []).length;
  const openJurs = OFFSHORE_JURISDICTIONS.filter(j => os.accounts[j.id]);
  const unopenedJurs = OFFSHORE_JURISDICTIONS.filter(j => !os.accounts[j.id]);

  // ---------- Header / totals ----------
  const header = `
    <div class="stats-grid" style="margin-bottom:1rem">
      <div class="stat-card"><div class="stat-value neon-green">${offshoreMoney(total)}</div><div class="stat-label">Offshore Total</div></div>
      <div class="stat-card"><div class="stat-value neon-cyan">${offshoreMoney(inFlight)}</div><div class="stat-label">In Transit</div></div>
      <div class="stat-card"><div class="stat-value neon-yellow">${offshoreMoney(gameState.bank || 0)}</div><div class="stat-label">Domestic Bank</div></div>
      <div class="stat-card"><div class="stat-value" style="color:${sLine.color}">${scrutiny}/100</div><div class="stat-label">Scrutiny</div></div>
    </div>
    <div class="card" style="border-color:var(--neon-green);margin-bottom:0.8rem">
      <p style="font-size:0.8rem;margin:0">🛡️ <strong>Beyond their reach:</strong> if you're ever convicted, the courts seize your cash and domestic bank —
      <span class="neon-green">offshore balances survive conviction</span>. This is your insurance policy.</p>
    </div>`;

  // ---------- Scrutiny meter ----------
  const scrutinyHtml = `
    <div class="card" style="border-color:${sLine.color};margin-bottom:0.8rem">
      <div class="card-header"><span>🔍 FEDERAL SCRUTINY</span><span style="color:${sLine.color}">${scrutiny}/100</span></div>
      <div class="stat-bar" style="height:10px"><div class="stat-fill" style="width:${Math.min(100, scrutiny)}%;background:${sLine.color}"></div></div>
      <p style="font-size:0.78rem;color:${sLine.color};margin:0.3rem 0 0">${sLine.text}</p>
      <p class="text-dim" style="font-size:0.72rem;margin:0.2rem 0 0">
        Moved this week: <span class="${os.weekMoved > OFFSHORE_CONFIG.weeklyThreshold ? 'neon-red' : 'neon-green'}">${offshoreMoney(os.weekMoved)}</span>
        / ${offshoreMoney(OFFSHORE_CONFIG.weeklyThreshold)} before every transfer draws extra scrutiny.
        Audits survived: ${os.auditsPassed}.
      </p>
    </div>`;

  // ---------- Pending audit ----------
  let auditHtml = '';
  if (os.pendingAudit) {
    const canLawyer = (gameState.cash || 0) >= OFFSHORE_CONFIG.lawyerCost;
    const canShuffle = frontCount >= 2 && total > 0;
    const shuffleCost = Math.round(total * 0.10);
    auditHtml = `
      <div class="card" style="border-color:var(--neon-red);margin-bottom:0.8rem;background:rgba(255,60,60,0.06)">
        <div class="card-header"><span class="neon-red">📋 IRS AUDIT — RESPOND NOW</span><span class="neon-red">${os.pendingAudit.daysLeft} day(s) left</span></div>
        <p style="font-size:0.8rem">The Criminal Investigation Division wants an explanation for your international wires. Ignore it past the deadline and they decide for you.</p>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.4rem">
          ${canLawyer
            ? `<button class="btn btn-sm btn-buy" onclick="doAuditLawyer()">💼 Tax Attorney (${offshoreMoney(OFFSHORE_CONFIG.lawyerCost)} — halves any damage)</button>`
            : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">💼 Tax Attorney — need ${offshoreMoney(OFFSHORE_CONFIG.lawyerCost)} cash</button>`}
          ${canShuffle
            ? `<button class="btn btn-sm btn-buy" onclick="doAuditShuffle()">🐚 Shell Shuffle (${offshoreMoney(shuffleCost)} — 10% of offshore, scrutiny resets to 15)</button>`
            : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5">🐚 Shell Shuffle — needs 2+ front businesses${total <= 0 ? ' and offshore funds' : ''}</button>`}
          <button class="btn btn-sm btn-sell" onclick="doAuditIgnore()">🗑️ Ignore It (50/50: blows over, or 20% bank fine + heat from the feds)</button>
        </div>
      </div>`;
  }

  // ---------- Transfer queue ----------
  let transfersHtml = '';
  if (os.transfers.length > 0) {
    const rows = os.transfers.map(t => {
      const jur = offshoreJur(t.jurisdiction);
      const eta = Math.max(0, t.arriveDay - day);
      const label = t.type === 'withdraw'
        ? `${jur ? jur.flag : ''} ${offshoreMoney(t.amount)} → your bank`
        : `🌀 ${offshoreMoney(t.amount)} (layered, clean) → ${jur ? jur.flag + ' ' + jur.name : 'offshore'}`;
      return `<div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:0.2rem 0;border-bottom:1px dashed rgba(255,255,255,0.08)">
        <span>${label}</span><span class="neon-cyan">${eta <= 0 ? 'arrives tomorrow' : 'ETA ' + eta + ' day(s)'}</span></div>`;
    }).join('');
    transfersHtml = `
      <div class="card" style="border-color:var(--neon-cyan);margin-bottom:0.8rem">
        <div class="card-header"><span>✈️ TRANSFERS IN FLIGHT</span><span class="neon-cyan">${os.transfers.length}</span></div>
        ${rows}
      </div>`;
  }

  // ---------- Open account cards ----------
  const accountCards = openJurs.map(jur => {
    const acct = os.accounts[jur.id];
    const locked = offshoreAccountLocked(acct, day);
    const lockDays = locked ? acct.lockedUntil - day : 0;
    let formHtml;
    if (locked) {
      formHtml = `<p class="neon-red" style="font-size:0.8rem;margin:0.3rem 0 0">🔒 LOCKED — ${lockDays} day(s) until access returns. The balance is safe.</p>`;
    } else {
      formHtml = `
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;margin-top:0.4rem">
          <input id="offshore-dep-${jur.id}" type="number" min="0" placeholder="from bank" style="width:110px" class="qty-input">
          <button class="btn btn-sm btn-buy" onclick="doOffshoreDeposit('${jur.id}')">↘ Deposit (${Math.round(jur.feePct * 100)}% fee)</button>
          <input id="offshore-wd-${jur.id}" type="number" min="0" placeholder="to bank" style="width:110px" class="qty-input">
          <button class="btn btn-sm btn-sell" onclick="doOffshoreWithdraw('${jur.id}')">↖ Withdraw${jur.withdrawDelay > 0 ? ' (' + jur.withdrawDelay + 'd)' : ''}</button>
        </div>`;
    }
    return `
      <div class="prop-card" style="border-color:${locked ? 'var(--neon-red)' : jur.color};margin-bottom:0.5rem;padding:0.6rem">
        <div class="card-header" style="margin-bottom:0.2rem">
          <span style="font-weight:bold">${jur.flag} ${jur.name}</span>
          <span class="neon-green">${offshoreMoney(acct.balance)}</span>
        </div>
        <p class="text-dim" style="font-size:0.75rem;margin:0.1rem 0">${jur.risk}</p>
        <p class="text-dim" style="font-size:0.72rem;margin:0.1rem 0">Deposit fee ${Math.round(jur.feePct * 100)}%${jur.withdrawDelay > 0 ? ' · withdrawals take ' + jur.withdrawDelay + ' days' : ' · instant withdrawals'} · opened day ${acct.openedDay}</p>
        ${formHtml}
      </div>`;
  }).join('');

  const accountsHtml = openJurs.length > 0 ? `
    <h3 class="section-title" style="font-size:0.95rem">🏦 YOUR ACCOUNTS</h3>
    <p class="text-dim" style="font-size:0.72rem;margin:0 0 0.4rem">Deposits wire out of your domestic bank (clean money). Dirty cash must be layered — see below.</p>
    ${accountCards}` : '';

  // ---------- Layering form ----------
  let layerHtml = '';
  const usableDests = openJurs.filter(j => !offshoreAccountLocked(os.accounts[j.id], day));
  if (openJurs.length > 0) {
    const dirty = gameState.dirtyMoney || 0;
    const maxByFronts = frontCount * OFFSHORE_CONFIG.layerFrontPer;
    const destOptions = usableDests.map(j => `<option value="${j.id}">${j.flag} ${j.name}</option>`).join('');
    layerHtml = `
      <div class="card" style="border-color:#bf5fff;margin-bottom:0.8rem">
        <div class="card-header"><span style="color:#bf5fff">🌀 SHELL LAYERING — DIRTY CASH DIRECT TO OFFSHORE</span><span class="text-dim" style="font-size:0.75rem">Dirty: ${offshoreMoney(dirty)}</span></div>
        <p class="text-dim" style="font-size:0.75rem;margin:0.2rem 0">Route street cash through your fronts and out through layered shells: costs <span class="neon-red">25%</span>,
          takes <span class="neon-cyan">${OFFSHORE_CONFIG.layerDays} days</span>, needs <span class="neon-yellow">1 front business per ${offshoreMoney(OFFSHORE_CONFIG.layerFrontPer)}</span> per run,
          and adds <span class="neon-red">+${OFFSHORE_CONFIG.layerScrutiny} scrutiny</span>. Arrives clean.</p>
        <p class="text-dim" style="font-size:0.72rem;margin:0.2rem 0">You own ${frontCount} front(s) → up to <span class="${maxByFronts > 0 ? 'neon-green' : 'neon-red'}">${offshoreMoney(maxByFronts)}</span> per run.</p>
        ${usableDests.length > 0 && maxByFronts > 0 ? `
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;margin-top:0.3rem">
          <input id="offshore-layer-amt" type="number" min="0" placeholder="dirty cash $" style="width:130px" class="qty-input">
          <select id="offshore-layer-dest" class="qty-input" style="width:auto">${destOptions}</select>
          <button class="btn btn-sm btn-buy" style="border-color:#bf5fff;color:#bf5fff" onclick="doLayerCash()">🌀 Layer It</button>
        </div>` : `<p class="neon-red" style="font-size:0.75rem;margin:0.2rem 0 0">${maxByFronts <= 0 ? 'You need at least one front business (Fronts screen) to layer cash.' : 'All destination accounts are locked right now.'}</p>`}
      </div>`;
  }

  // ---------- Open-new cards ----------
  const openNewCards = unopenedJurs.map(jur => {
    const gated = day < jur.minDay;
    const affordable = (gameState.cash || 0) >= jur.setupCost;
    return `
      <div class="prop-card" style="border-color:${jur.color};margin-bottom:0.5rem;padding:0.6rem;${gated ? 'opacity:0.5' : ''}">
        <div class="card-header" style="margin-bottom:0.2rem">
          <span style="font-weight:bold">${jur.flag} ${jur.name}</span>
          <span class="neon-yellow">${offshoreMoney(jur.setupCost)} setup</span>
        </div>
        <p class="text-dim" style="font-size:0.75rem;margin:0.1rem 0">${jur.desc}</p>
        <p class="text-dim" style="font-size:0.72rem;margin:0.1rem 0">${jur.risk}</p>
        <p style="font-size:0.72rem;margin:0.1rem 0">Deposit fee: <span class="neon-cyan">${Math.round(jur.feePct * 100)}%</span>${jur.withdrawDelay > 0 ? ' · withdrawals take ' + jur.withdrawDelay + ' days' : ''}</p>
        ${gated
          ? `<p class="neon-red" style="font-size:0.75rem;margin:0.2rem 0 0">🔒 Your contacts can't reach ${jur.name} yet — available day ${jur.minDay} (now day ${day}).</p>`
          : affordable
            ? `<button class="btn btn-sm btn-buy" style="margin-top:0.3rem" onclick="doOpenJurisdiction('${jur.id}')">🏦 Open Account (${offshoreMoney(jur.setupCost)})</button>`
            : `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5;margin-top:0.3rem">🏦 Need ${offshoreMoney(jur.setupCost)} cash</button>`}
      </div>`;
  }).join('');

  const openNewHtml = unopenedJurs.length > 0 ? `
    <h3 class="section-title" style="font-size:0.95rem">🌍 OPEN NEW JURISDICTIONS</h3>
    ${openNewCards}` : '';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🏝️ OFFSHORE BANKING</h2>
      <p class="text-dim" style="text-align:center;font-size:0.8rem;margin-bottom:0.8rem">
        Panama. Georgetown. Zurich. Port Vila. Where money goes to be forgotten.
      </p>
      ${header}
      ${auditHtml}
      ${scrutinyHtml}
      ${transfersHtml}
      ${accountsHtml}
      ${layerHtml}
      ${openNewHtml}
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}
