// ============================================================
//   DRUG WARS: MIAMI VICE EDITION - Futures Trading System
//   Hedge against drug price volatility with futures contracts
// ============================================================

// ============================================================
// CONTRACT TYPES
// ============================================================
const FUTURES_CONTRACT_TYPES = [
  { id: 'long', name: 'Long (Buy)', emoji: '📈', desc: 'Bet prices go UP. Profit if price rises above strike.', direction: 1 },
  { id: 'short', name: 'Short (Sell)', emoji: '📉', desc: 'Bet prices go DOWN. Profit if price falls below strike.', direction: -1 },
];

const FUTURES_DURATIONS = [
  { id: 'short_term', name: '7-Day', days: 7, premiumMult: 0.08, desc: 'Quick turnaround' },
  { id: 'medium_term', name: '14-Day', days: 14, premiumMult: 0.12, desc: 'Standard contract' },
  { id: 'long_term', name: '30-Day', days: 30, premiumMult: 0.18, desc: 'Long play' },
];

// ============================================================
// FUTURES STATE
// ============================================================
function initFuturesState() {
  return {
    contracts: [], // active contracts
    completedContracts: [],
    totalProfits: 0,
    totalLosses: 0,
    contractsTraded: 0,
    maxConcurrentContracts: 3, // increases with skill
  };
}

// ============================================================
// CREATE A FUTURES CONTRACT
// ============================================================
function createFuturesContract(state, drugId, contractType, durationId, quantity) {
  if (!state.futures) state.futures = initFuturesState();
  const ft = state.futures;

  if (ft.contracts.length >= ft.maxConcurrentContracts) {
    return { success: false, msg: `Max ${ft.maxConcurrentContracts} active contracts. Wait for one to expire.` };
  }

  const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
  const drug = drugs.find(d => d.id === drugId);
  if (!drug) return { success: false, msg: 'Unknown drug.' };

  const type = FUTURES_CONTRACT_TYPES.find(t => t.id === contractType);
  if (!type) return { success: false, msg: 'Unknown contract type.' };

  const duration = FUTURES_DURATIONS.find(d => d.id === durationId);
  if (!duration) return { success: false, msg: 'Unknown duration.' };

  // Strike price = current market price
  const currentPrice = (state.prices && state.prices[drugId]) || drug.minPrice || drug.basePrice || 100;

  // Premium cost (cost to enter the contract)
  const premium = Math.round(currentPrice * quantity * duration.premiumMult);
  if (state.cash < premium) return { success: false, msg: `Need $${premium.toLocaleString()} premium to enter contract.` };

  // Max contract value (risk limit)
  const maxPayout = Math.round(currentPrice * quantity * 2);

  state.cash -= premium;

  const contract = {
    id: `FUT-${state.day}-${Math.floor(Math.random() * 9999)}`,
    drugId,
    drugName: drug.name,
    type: contractType,
    direction: type.direction,
    strikePrice: currentPrice,
    quantity,
    premium,
    maxPayout,
    durationDays: duration.days,
    dayOpened: state.day,
    expiresDay: state.day + duration.days,
    durationId,
    settled: false,
  };

  ft.contracts.push(contract);
  ft.contractsTraded++;

  return {
    success: true,
    msg: `${type.emoji} Opened ${type.name} on ${drug.name}: ${quantity} units @ $${currentPrice}/unit. Premium: $${premium.toLocaleString()}. Expires day ${contract.expiresDay}.`
  };
}

// ============================================================
// SETTLE A CONTRACT (at expiry or early exit)
// ============================================================
function settleFuturesContract(state, contractIndex, early = false) {
  if (!state.futures) return { success: false, msg: 'No futures.' };
  const ft = state.futures;

  if (contractIndex < 0 || contractIndex >= ft.contracts.length) return { success: false, msg: 'Invalid contract.' };

  const contract = ft.contracts[contractIndex];
  if (contract.settled) return { success: false, msg: 'Already settled.' };

  const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
  const drug = drugs.find(d => d.id === contract.drugId);
  const currentPrice = state.prices ? (state.prices[contract.drugId] || contract.strikePrice) : contract.strikePrice;

  // Calculate P&L
  const priceDiff = (currentPrice - contract.strikePrice) * contract.direction;
  let pnl = Math.round(priceDiff * contract.quantity);

  // Early exit penalty: standardized 15% on both profit and loss
  if (early) {
    if (pnl > 0) pnl = Math.round(pnl * 0.85);
    else pnl = Math.round(pnl * 1.15);
  }

  // Cap at max payout
  pnl = Math.max(-contract.maxPayout, Math.min(contract.maxPayout, pnl));

  state.cash += pnl + contract.premium; // Return premium + P&L (can be negative net)
  state.cash = Math.max(0, state.cash);

  if (pnl > 0) ft.totalProfits += pnl;
  else ft.totalLosses += Math.abs(pnl);

  contract.settled = true;
  contract.settlementPrice = currentPrice;
  contract.pnl = pnl;

  ft.completedContracts.push({ ...contract });
  ft.contracts.splice(contractIndex, 1);

  const typeEmoji = contract.direction > 0 ? '📈' : '📉';
  const pnlStr = pnl >= 0 ? `+$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`;
  const pnlColor = pnl >= 0 ? 'profit' : 'loss';

  return {
    success: true,
    pnl,
    msg: `${typeEmoji} Contract settled${early ? ' (early)' : ''}! ${contract.drugName}: Strike $${contract.strikePrice} → Market $${currentPrice}. P&L: ${pnlStr}.`
  };
}

// ============================================================
// DAILY PROCESSING
// ============================================================
function processFuturesDaily(state) {
  if (!state.futures) return [];
  const ft = state.futures;
  const msgs = [];

  // Auto-settle expired contracts
  for (let i = ft.contracts.length - 1; i >= 0; i--) {
    const contract = ft.contracts[i];
    if (state.day >= contract.expiresDay) {
      const result = settleFuturesContract(state, i, false);
      if (result.success) {
        msgs.push(result.msg);
      }
    }
  }

  // Increase max contracts with wealth/reputation
  const netWorth = (state.cash || 0) + (state.bankBalance || 0);
  if (netWorth > 500000) ft.maxConcurrentContracts = 5;
  else if (netWorth > 100000) ft.maxConcurrentContracts = 4;
  else ft.maxConcurrentContracts = 3;

  return msgs;
}

// ============================================================
// GET MARKET ANALYSIS (helps player decide)
// ============================================================
function getFuturesAnalysis(state, drugId) {
  const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];
  const drug = drugs.find(d => d.id === drugId);
  if (!drug) return null;

  const currentPrice = (state.prices && state.prices[drugId]) || drug.minPrice || drug.basePrice || 100;
  const history = state.priceHistory ? (state.priceHistory[drugId] || []) : [];

  // Simple trend analysis
  let trend = 'stable';
  let avgChange = 0;
  if (history.length >= 3) {
    const recent = history.slice(-5);
    const changes = [];
    for (let i = 1; i < recent.length; i++) {
      const p1 = typeof recent[i] === 'object' ? recent[i].price : recent[i];
      const p0 = typeof recent[i - 1] === 'object' ? recent[i - 1].price : recent[i - 1];
      changes.push(p1 - p0);
    }
    avgChange = changes.reduce((s, c) => s + c, 0) / changes.length;
    if (avgChange > currentPrice * 0.05) trend = 'bullish';
    else if (avgChange < -currentPrice * 0.05) trend = 'bearish';
  }

  // Volatility
  let volatility = 'medium';
  if (history.length >= 5) {
    const recent = history.slice(-10).map(h => typeof h === 'object' ? h.price : h);
    const mean = recent.reduce((s, p) => s + p, 0) / recent.length;
    const variance = recent.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    if (cv > 0.3) volatility = 'high';
    else if (cv < 0.1) volatility = 'low';
  }

  return {
    drugName: drug.name,
    currentPrice,
    trend,
    avgChange: Math.round(avgChange),
    volatility,
    historyLength: history.length,
    minPrice: drug.minPrice,
    maxPrice: drug.maxPrice,
  };
}
