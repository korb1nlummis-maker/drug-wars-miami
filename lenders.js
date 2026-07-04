// ============================================================
// LENDERS — three ways to borrow, three ways to regret it
// ============================================================
// Vinnie fronts anyone. Ruthie wants a reputation to hold hostage.
// Don Ozzie finances empires at bank rates and collects like a cartel.
// state.debt stays the single source of truth (everything else in the
// game reads it); state.loans tracks who you owe and at what rate.
// Legacy code that adds/subtracts state.debt directly is reconciled
// into Vinnie's book every day — he buys bad paper.

const LENDERS = [
  { id: 'vinnie', emoji: '🦈', name: 'Vinnie "The Shark" Moretti', rate: 0.008, limit: 50000, minLevel: 1,
    blurb: 'Fast money, no questions asked. Payments missed become questions asked with a bat.',
    quote: 'You know the vig. Don\'t make me come find you.' },
  { id: 'ruthie', emoji: '💎', name: 'Ruthie Goldstein — Flagler Pawn & Loan', rate: 0.005, limit: 150000, minLevel: 3,
    blurb: 'Better rates for people with a name to protect. She holds your reputation as collateral.',
    quote: 'Collateral is trust, honey. Don\'t make me sell yours.' },
  { id: 'ozzie', emoji: '🏦', name: "Don Ozzie's Import Finance", rate: 0.003, limit: 1000000, minLevel: 8,
    blurb: 'Cartel money at bank rates. The collections department has no necks.',
    quote: 'We finance empires. Are you an empire, or are you wasting my afternoon?' },
];

function ensureLoansState(state) {
  if (!state.loans) {
    state.loans = [];
    if ((state.debt || 0) > 0) {
      state.loans.push({ lenderId: 'vinnie', balance: state.debt, negotiatedRate: null });
    }
  }
  return state.loans;
}

function lenderById(id) { return LENDERS.find(l => l.id === id); }

function getLoanBalance(state, lenderId) {
  ensureLoansState(state);
  const loan = state.loans.find(l => l.lenderId === lenderId);
  return loan ? loan.balance : 0;
}

function lenderUnlocked(state, lender) {
  const lvl = typeof getKingpinLevel === 'function' ? getKingpinLevel(state.xp || 0).level : 1;
  return lvl >= lender.minLevel;
}

function getLenderRate(state, lenderId) {
  const lender = lenderById(lenderId);
  const loan = ensureLoansState(state).find(l => l.lenderId === lenderId);
  const base = loan && loan.negotiatedRate !== null ? loan.negotiatedRate : lender.rate;
  const ngMod = typeof getNgPlusMod === 'function' ? getNgPlusMod(state, 'loanSharkInterest', 1) : 1;
  return base * ngMod;
}

// Daily: compound each book, absorb legacy debt drift into Vinnie's ledger
function processLoansDaily(state) {
  ensureLoansState(state);
  // Reconcile: code that touched state.debt directly since yesterday
  const tracked = state.loans.reduce((s, l) => s + l.balance, 0);
  const drift = Math.round((state.debt || 0) - tracked);
  if (drift > 0) {
    let v = state.loans.find(l => l.lenderId === 'vinnie');
    if (!v) { v = { lenderId: 'vinnie', balance: 0, negotiatedRate: null }; state.loans.push(v); }
    v.balance += drift;
  } else if (drift < 0) {
    // Payments made through legacy payDebt: settle the worst paper first
    let toClear = -drift;
    const byRate = [...state.loans].sort((a, b) => getLenderRate(state, b.lenderId) - getLenderRate(state, a.lenderId));
    for (const loan of byRate) {
      const cut = Math.min(loan.balance, toClear);
      loan.balance -= cut;
      toClear -= cut;
      if (toClear <= 0) break;
    }
  }
  // Compound
  for (const loan of state.loans) {
    if (loan.balance <= 0) continue;
    loan.balance = Math.round(loan.balance * (1 + getLenderRate(state, loan.lenderId)));
  }
  state.loans = state.loans.filter(l => l.balance > 0);
  state.debt = state.loans.reduce((s, l) => s + l.balance, 0);
}

function borrowFromLender(state, lenderId, amount) {
  const lender = lenderById(lenderId);
  if (!lender) return { success: false, msg: 'Unknown lender.' };
  if (!lenderUnlocked(state, lender)) return { success: false, msg: `${lender.name} doesn't know you yet. (Level ${lender.minLevel}+)` };
  ensureLoansState(state);
  const bal = getLoanBalance(state, lenderId);
  if (bal + amount > lender.limit) return { success: false, msg: `${lender.emoji} "${amount > lender.limit ? 'Who do you think I am?' : 'You\'re at your limit with me.'}" (max $${lender.limit.toLocaleString()})` };
  if (state.lastBorrowDay === state.day) return { success: false, msg: 'One loan per day. Come back tomorrow.' };
  if (state.lastPayDay === state.day) return { success: false, msg: 'You just made a payment today. Paper needs a day to clear.' };
  let loan = state.loans.find(l => l.lenderId === lenderId);
  if (!loan) { loan = { lenderId, balance: 0, negotiatedRate: null }; state.loans.push(loan); }
  loan.balance += amount;
  state.debt = state.loans.reduce((s, l) => s + l.balance, 0);
  state.cash += amount;
  if (typeof normalizeMoneyLedger === 'function') normalizeMoneyLedger(state);
  state.lastBorrowDay = state.day;
  state.totalBorrowed = (state.totalBorrowed || 0) + amount;
  if (lenderId === 'vinnie' && loan.balance > 30000) state.heat = Math.min(100, (state.heat || 0) + 3);
  return { success: true, msg: `${lender.emoji} Borrowed $${amount.toLocaleString()} from ${lender.name}. Balance: $${loan.balance.toLocaleString()} at ${(getLenderRate(state, lenderId) * 100).toFixed(1)}%/day.` };
}

function payLender(state, lenderId, amount) {
  const lender = lenderById(lenderId);
  if (!lender) return { success: false, msg: 'Unknown lender.' };
  ensureLoansState(state);
  const loan = state.loans.find(l => l.lenderId === lenderId);
  if (!loan || loan.balance <= 0) return { success: false, msg: 'Nothing owed here.' };
  if (amount > state.cash) return { success: false, msg: 'Not enough cash.' };
  const payment = Math.min(amount, loan.balance);
  state.cash -= payment;
  if (typeof normalizeMoneyLedger === 'function') normalizeMoneyLedger(state);
  loan.balance -= payment;
  if (loan.balance <= 0) {
    loan.negotiatedRate = null;
    state.loans.splice(state.loans.indexOf(loan), 1);
  }
  state.debt = state.loans.reduce((s, l) => s + l.balance, 0);
  state.lastPayDay = state.day;
  return { success: true, msg: `${lender.emoji} Paid $${payment.toLocaleString()}. ${loan.balance > 0 ? 'Balance: $' + loan.balance.toLocaleString() : 'Paid in full — ' + lender.name + ' nods with respect.'}` };
}

// One shot per outstanding loan: talk the rate down 10-25%
function negotiateLender(state, lenderId) {
  const lender = lenderById(lenderId);
  ensureLoansState(state);
  const loan = state.loans.find(l => l.lenderId === lenderId);
  if (!loan || loan.balance <= 0) return { success: false, msg: 'Borrow first — then we talk terms.' };
  if (loan.negotiatedRate !== null) return { success: false, msg: 'Terms are already set on this loan.' };
  if ((state._lenderNegCooldown || {})[lenderId] > (state.day || 1)) return { success: false, msg: 'They\'re not taking your calls this week.' };
  const speech = (state.speechSkill || 0) + (typeof getSkillEffect === 'function' ? getSkillEffect(state, 'speechBonus') : 0);
  const bribeSkill = typeof getSkillEffect === 'function' ? getSkillEffect(state, 'bribeMod') : 0;
  const winChance = Math.min(0.85, 0.35 + speech / 140 + Math.abs(bribeSkill) * 0.3);
  if (Math.random() < winChance) {
    const cut = 0.10 + Math.random() * 0.15;
    loan.negotiatedRate = lender.rate * (1 - cut);
    return { success: true, msg: `${lender.emoji} "${lenderId === 'ruthie' ? 'For you? Fine. Don\'t tell anyone.' : 'You got stones, kid.'}" Rate cut ${Math.round(cut * 100)}% → ${(getLenderRate(state, lenderId) * 100).toFixed(2)}%/day on this loan.` };
  }
  if (!state._lenderNegCooldown) state._lenderNegCooldown = {};
  state._lenderNegCooldown[lenderId] = (state.day || 1) + 5;
  return { success: false, msg: `${lender.emoji} "${lenderId === 'ozzie' ? 'This meeting is over.' : 'The rate is the rate.'}" No renegotiating for 5 days.` };
}

// ------------------------------------------------------------
// UI — replaces the single loan shark modal
// ------------------------------------------------------------
function openLenders() {
  playSound('click');
  const state = gameState;
  ensureLoansState(state);
  const cards = LENDERS.map(l => {
    const unlocked = lenderUnlocked(state, l);
    const bal = getLoanBalance(state, l.id);
    const loan = state.loans.find(x => x.lenderId === l.id);
    const rate = (getLenderRate(state, l.id) * 100).toFixed(2);
    if (!unlocked) {
      return `<div style="border:1px dashed #444;border-radius:6px;padding:0.5rem;margin:0.4rem 0;opacity:0.55;font-size:0.75rem;">
        ${l.emoji} <b>${l.name}</b> — 🔒 Level ${l.minLevel}+<br><span style="color:var(--text-dim)">${l.blurb}</span></div>`;
    }
    return `
      <div style="border:1px solid ${bal > 0 ? 'var(--neon-red)' : 'var(--border-color)'};border-radius:6px;padding:0.5rem;margin:0.4rem 0;font-size:0.78rem;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.3rem;">
          <b>${l.emoji} ${l.name}</b>
          <span>${rate}%/day${loan && loan.negotiatedRate !== null ? ' <span style="color:var(--neon-green);font-size:0.65rem">(negotiated)</span>' : ''} · max $${l.limit.toLocaleString()}</span>
        </div>
        <div style="font-size:0.68rem;color:var(--text-dim);margin:0.2rem 0;">"${l.quote}"</div>
        ${bal > 0 ? `<div style="color:var(--neon-red);margin:0.2rem 0;">You owe: <b>$${bal.toLocaleString()}</b></div>` : ''}
        <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.25rem;">
          <input type="number" id="lender_amt_${l.id}" class="trade-input" placeholder="Amount" min="0" style="width:90px;">
          <button class="btn btn-sm btn-sell" onclick="doLenderAction('${l.id}','borrow')">BORROW</button>
          <button class="btn btn-sm btn-buy" ${bal > 0 ? '' : 'disabled style="opacity:0.4"'} onclick="doLenderAction('${l.id}','pay')">PAY</button>
          <button class="btn btn-sm btn-max" ${bal > 0 ? '' : 'disabled style="opacity:0.4"'} onclick="document.getElementById('lender_amt_${l.id}').value=${Math.min(state.cash, bal)}">MAX</button>
          <button class="btn btn-sm btn-secondary" ${bal > 0 && (!loan || loan.negotiatedRate === null) ? '' : 'disabled style="opacity:0.4"'} onclick="doLenderAction('${l.id}','negotiate')">🗣️ TALK TERMS</button>
        </div>
      </div>`;
  }).join('');
  const html = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()" style="max-height:80vh;overflow-y:auto;">
        <h3 class="neon-red">💰 THE MONEY MEN</h3>
        <p style="font-size:0.75rem;">Total debt: <span class="neon-red">$${state.debt.toLocaleString()}</span> · Cash: <span class="neon-green">$${state.cash.toLocaleString()}</span></p>
        <p style="font-size:0.65rem;color:var(--text-dim);">Interest compounds daily. Talk terms once per loan — speech skill decides. Pay the expensive paper first.</p>
        ${cards}
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML='';">CLOSE</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modal-container').innerHTML = html;
}

function doLenderAction(lenderId, action) {
  const input = document.getElementById('lender_amt_' + lenderId);
  const amount = parseInt((input && input.value) || 0);
  let result;
  if (action === 'negotiate') result = negotiateLender(gameState, lenderId);
  else if (action === 'pay') result = amount > 0 ? payLender(gameState, lenderId, amount) : { success: false, msg: 'Enter an amount.' };
  else result = amount > 0 ? borrowFromLender(gameState, lenderId, amount) : { success: false, msg: 'Enter an amount.' };
  if (result.success) playSound('cash'); else playSound('click');
  showNotification(result.msg, result.success ? 'success' : 'warning');
  gameState.messageLog.push(result.msg);
  openLenders(); // refresh modal in place
}
