// ============================================================
// DRUG WARS: MIAMI VICE EDITION - UI Layer
// ============================================================

let gameState = null;
let currentScreen = 'title'; // title, game, travel, combat, event, gameover, court, crew, charselect, properties
let selectedDrug = null;
let tradeMode = null; // 'buy' or 'sell'
let pendingEvents = [];
let currentEventIndex = 0;
let combatEvent = null;
let showChart = false;
let chartDrugId = null;
let mainTab = 'portfolio'; // 'portfolio', 'buysell', 'prices'

// ============================================================
// SOUND - delegates to MusicEngine
// ============================================================
function playSound(type) {
  MusicEngine.playSfx(type);
}


// ============================================================
// BACK BUTTON HELPER
// ============================================================
let openSidebarGroups = { money: false, crime: false, people: false, infra: false };
function toggleSidebarGroup(group) { openSidebarGroups[group] = !openSidebarGroups[group]; render(); }
let alertDismissedDay = -1;

function backButton(label) {
  label = label || '\u2190 Back';
  return '<button class="btn btn-secondary back-btn-top" onclick="currentScreen=\'game\'; render();">' + label + '</button>';
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showNotification(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'notification-toast notification-' + type;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// Progressive unlock toast notification
let _unlockToastQueue = [];
let _unlockToastShowing = false;

function showUnlockToast(info) {
  _unlockToastQueue.push(info);
  if (!_unlockToastShowing) _processUnlockToastQueue();
}

function _processUnlockToastQueue() {
  if (_unlockToastQueue.length === 0) { _unlockToastShowing = false; return; }
  _unlockToastShowing = true;
  const info = _unlockToastQueue.shift();
  const existing = document.getElementById('unlock-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'unlock-toast';
  toast.className = 'unlock-toast';
  toast.innerHTML = `
    <div class="unlock-title">NEW SYSTEM UNLOCKED</div>
    <div class="unlock-name">${info.emoji} ${info.name}</div>
    <div class="unlock-desc">${info.desc}</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
      _processUnlockToastQueue();
    }, 500);
  }, 3000);
}

// Check for new unlocks and show notifications + message log entries
function checkAndAnnounceUnlocks() {
  if (!gameState || typeof checkNewUnlocks !== 'function') return;
  const newUnlocks = checkNewUnlocks(gameState);
  for (const info of newUnlocks) {
    gameState.messageLog.push(`🔓 NEW SYSTEM UNLOCKED: ${info.emoji} ${info.name}! ${info.desc}`);
    showUnlockToast(info);
  }
}

// Helper: render a locked sidebar button
function renderLockedSidebarBtn(emoji, label, featureKey) {
  const tooltip = typeof getUnlockRequirement === 'function' ? getUnlockRequirement(featureKey) : 'Locked';
  return `<button class="btn btn-sidebar btn-secondary btn-locked-interactive" data-lock-tooltip="${tooltip}" onclick="showNotification('${tooltip}', 'info'); return false;">🔒 ${label}</button>`;
}

function updateMusic() {
  if (MusicEngine.isMuted()) return;
  MusicEngine.playTrack('background');
}

// ============================================================
// SAVE / LOAD / HOME
// ============================================================
const SAVE_KEY = 'drugwars_save_';

function getSaveSlots() {
  const slots = [];
  for (let i = 1; i <= 5; i++) {
    const data = localStorage.getItem(SAVE_KEY + i);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        slots.push({ slot: i, data: parsed, summary: `Day ${parsed.day} | $${parsed.cash.toLocaleString()} | ${LOCATIONS.find(l => l.id === parsed.currentLocation)?.name || '???'}` });
      } catch (e) {
        slots.push({ slot: i, data: null, summary: 'Corrupted save' });
      }
    } else {
      slots.push({ slot: i, data: null, summary: null });
    }
  }
  return slots;
}

function saveGame(slot) {
  if (!gameState) return;
  const saveData = JSON.stringify(gameState);
  localStorage.setItem(SAVE_KEY + slot, saveData);
  playSound('save');
  gameState.messageLog.push(`Game saved to Slot ${slot}.`);
  document.getElementById('modal-container').innerHTML = '';
  render();
}

function loadGame(slot) {
  const data = localStorage.getItem(SAVE_KEY + slot);
  if (!data) return;
  try {
    gameState = JSON.parse(data);
    migrateGameState(gameState);
    GAME_CONFIG.endlessMode = !!gameState.endlessMode;
    currentScreen = 'game';
    pendingEvents = [];
    combatEvent = null;
    playSound('load');
    gameState.messageLog.push(`Game loaded from Slot ${slot}.`);
    // Initialize progressive unlock tracking for loaded saves
    if (!gameState.announcedUnlocks) {
      gameState.announcedUnlocks = {};
      // Silently mark all currently-unlocked features as announced (no spam on load)
      if (typeof getUnlockedFeatures === 'function') {
        const uf = getUnlockedFeatures(gameState);
        for (const key in uf) { if (uf[key]) gameState.announcedUnlocks[key] = true; }
      }
    }
    MusicEngine.init();
    render();
  } catch (e) {
    alert('Failed to load save.');
  }
}

function deleteSave(slot) {
  localStorage.removeItem(SAVE_KEY + slot);
  openSaveLoadModal();
}

function goHome() {
  MusicEngine.stop();
  gameState = null;
  currentScreen = 'title';
  pendingEvents = [];
  combatEvent = null;
  render();
}

function openSaveLoadModal() {
  playSound('click');
  const slots = getSaveSlots();
  const inGame = gameState && !gameState.gameOver;

  const html = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal modal-wide" onclick="event.stopPropagation()">
        <h3 class="neon-cyan">💾 SAVE / LOAD GAME</h3>
        <div class="save-slots">
          ${slots.map(s => `
            <div class="save-slot">
              <div class="save-slot-header">
                <span class="save-slot-name neon-pink">SLOT ${s.slot}</span>
                <span class="save-slot-summary">${s.summary || '<span class="text-dim">— Empty —</span>'}</span>
              </div>
              <div class="save-slot-actions">
                ${inGame ? `<button class="btn btn-sm btn-buy" onclick="saveGame(${s.slot})">💾 SAVE</button>` : ''}
                ${s.data ? `<button class="btn btn-sm btn-secondary" onclick="loadGame(${s.slot})">📂 LOAD</button>` : ''}
                ${s.data ? `<button class="btn btn-sm btn-danger" onclick="if(confirm('Delete this save?')) deleteSave(${s.slot})">🗑️ DELETE</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML='';">CLOSE</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = html;
}

// ============================================================
// PRICE HISTORY / STOCK CHARTS
// ============================================================
// recordPriceHistory and seedPriceHistory are now in game-engine.js

function renderStockChart(drugId) {
  const drug = DRUGS.find(d => d.id === drugId);
  if (!drug || !gameState.priceHistory || !gameState.priceHistory[drugId]) return '';

  const history = gameState.priceHistory[drugId];
  if (history.length < 2) return '<p class="text-dim">Not enough data yet. Travel more to see trends.</p>';

  const prices = history.map(h => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;
  const chartW = 600;
  const chartH = 150;
  const stepX = chartW / (history.length - 1);

  // Build SVG path
  let pathD = '';
  let areaD = '';
  let dots = '';
  let eventMarkers = '';
  const points = [];

  for (let i = 0; i < history.length; i++) {
    const p = history[i].price;
    const x = i * stepX;
    const y = chartH - ((p - minPrice) / range) * (chartH - 20) - 10;
    points.push({ x, y, price: p, day: history[i].day, loc: history[i].location });

    if (i === 0) {
      pathD = `M${x},${y}`;
      areaD = `M${x},${chartH}L${x},${y}`;
    } else {
      pathD += `L${x},${y}`;
      areaD += `L${x},${y}`;
    }

    const isInterp = history[i].interpolated;
    dots += `<circle cx="${x}" cy="${y}" r="3" fill="var(--neon-pink)" opacity="${isInterp ? '0.3' : '0.8'}"/>`;

    // Event markers
    if (history[i].event) {
      const isSpike = history[i].event.effect === 'spike';
      const markerColor = isSpike ? 'var(--neon-green)' : 'var(--neon-red)';
      const markerY = isSpike ? y - 12 : y + 12;
      const triangle = isSpike
        ? `M${x-5},${markerY+8}L${x},${markerY}L${x+5},${markerY+8}Z`
        : `M${x-5},${markerY-8}L${x},${markerY}L${x+5},${markerY-8}Z`;
      eventMarkers += `<path d="${triangle}" fill="${markerColor}" class="chart-event-marker"><title>${history[i].event.msg}</title></path>`;
    }
  }
  if (points.length > 0) {
    areaD += `L${points[points.length - 1].x},${chartH}Z`;
  }

  // Trend indicator
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const trend = lastPrice > firstPrice ? 'up' : lastPrice < firstPrice ? 'down' : 'flat';
  const trendPct = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1) : '0';
  const trendColor = trend === 'up' ? 'var(--neon-green)' : trend === 'down' ? 'var(--neon-red)' : 'var(--neon-yellow)';
  const trendArrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬';

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = chartH - pct * (chartH - 20) - 10;
    const val = Math.round(minPrice + pct * range);
    return `<line x1="0" y1="${y}" x2="${chartW}" y2="${y}" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="4,4"/>
            <text x="${chartW + 5}" y="${y + 4}" fill="var(--text-dim)" font-size="9" font-family="var(--font-display)">$${val.toLocaleString()}</text>`;
  }).join('');

  const avgPrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);

  return `
    <div class="chart-container">
      <div class="chart-header">
        <span class="chart-drug-name">${drug.emoji} ${drug.name}</span>
        <span class="chart-trend" style="color:${trendColor}">${trendArrow} ${trendPct}%</span>
        <span class="chart-stats">
          High: <span class="neon-green">$${maxPrice.toLocaleString()}</span> |
          Low: <span class="neon-red">$${minPrice.toLocaleString()}</span> |
          Avg: <span class="neon-yellow">$${avgPrice.toLocaleString()}</span>
        </span>
      </div>
      <svg viewBox="-5 0 ${chartW + 60} ${chartH + 5}" class="chart-svg">
        ${gridLines}
        <path d="${areaD}" fill="url(#chartGrad)" opacity="0.3"/>
        <path d="${pathD}" fill="none" stroke="var(--neon-pink)" stroke-width="2"/>
        ${dots}
        ${eventMarkers}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--neon-pink)" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="var(--neon-pink)" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="chart-footer">
        ${history.slice(-5).map(h => `<span class="chart-tick">D${h.day}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderAllCharts() {
  if (!gameState || !gameState.priceHistory) return '';

  // Only show drugs that have been seen
  const drugsWithData = DRUGS.filter(d =>
    gameState.priceHistory[d.id] && gameState.priceHistory[d.id].length >= 2
  );

  if (drugsWithData.length === 0) return '<p class="text-dim">Visit more cities to see market trends.</p>';

  // Drug selector tabs
  const activeDrug = chartDrugId || (drugsWithData[0] && drugsWithData[0].id);

  const tabs = drugsWithData.map(d => `
    <button class="chart-tab ${d.id === activeDrug ? 'active' : ''}" onclick="chartDrugId='${d.id}'; render();">${d.emoji} ${d.name}</button>
  `).join('');

  return `
    <div class="charts-section">
      <h3 class="section-title">📈 MARKET TRENDS</h3>
      <div class="chart-tabs">${tabs}</div>
      ${activeDrug ? renderStockChart(activeDrug) : ''}
    </div>
  `;
}

// ============================================================
// INITIALIZATION
// ============================================================
function startNewGame(endless = false) {
  MusicEngine.init();
  playSound('click');
  GAME_CONFIG.endlessMode = endless;
  // Route to character select instead of directly starting
  pendingEndless = endless;
  currentScreen = 'charselect';
  render();
}

let pendingEndless = false;
let pendingNewGamePlus = false;

function isNewGamePlusUnlocked() {
  try {
    const achieved = JSON.parse(localStorage.getItem('drugwars_achievements') || '[]');
    return achieved.includes('game_beaten');
  } catch (e) { return false; }
}

function startNewGamePlus() {
  if (!isNewGamePlusUnlocked()) return;
  MusicEngine.init();
  playSound('click');
  pendingEndless = false;
  pendingNewGamePlus = true;
  GAME_CONFIG.endlessMode = false;
  currentScreen = 'charselect';
  render();
}

function applyNewGamePlusModifiers(state) {
  // NG+ bonuses: carry over meta-progression
  state.newGamePlus = true;
  state.ngPlusLevel = (state.ngPlusLevel || 0) + 1;

  // Bonus starting cash
  state.cash += 5000;

  // All drugs unlocked from start (higher tier availability)
  state.citiesVisited = ['miami'];

  // Harder difficulty: enemies tougher, prices more volatile, heat decays slower
  state.ngPlusModifiers = {
    enemyDamageMultiplier: 1.5,
    enemyHealthMultiplier: 1.5,
    priceVolatility: 1.3,
    heatDecayRate: 0.7,
    loanSharkInterest: 1.5,
    investigationRate: 1.3,
    xpMultiplier: 1.5,
    cashBonusMultiplier: 1.25
  };

  // Start with some skills already unlocked (bonus skill points)
  state.skillPoints = (state.skillPoints || 0) + 5;

  // Higher starting rep
  if (state.rep) {
    state.rep.streetCred = Math.max(state.rep.streetCred || 0, 20);
  }

  // Campaign starts at Act 1 but milestones are harder
  if (state.campaign) {
    state.campaign.ngPlus = true;
  }
}

function confirmCharacterSelection(characterId) {
  playSound('travel');
  gameState = createGameState();
  gameState.endlessMode = pendingEndless;
  GAME_CONFIG.endlessMode = pendingEndless;
  // Apply character bonuses
  if (typeof applyCharacterToState === 'function') {
    applyCharacterToState(gameState, characterId);
  }
  // Apply New Game+ modifiers if applicable
  if (pendingNewGamePlus) {
    applyNewGamePlusModifiers(gameState);
    pendingNewGamePlus = false;
  }
  generatePrices(gameState);
  seedPriceHistory(gameState);
  recordPriceHistory(gameState);
  snapshotNetWorth(gameState);
  pendingEvents = [];
  combatEvent = null;
  chartDrugId = null;
  showChart = false;

  // Initialize progressive unlock tracking
  gameState.announcedUnlocks = {};
  if (typeof checkNewUnlocks === 'function') checkNewUnlocks(gameState);

  // Check for character intro cutscene
  if (typeof CHARACTER_INTROS !== 'undefined' && CHARACTER_INTROS[characterId]) {
    introPages = CHARACTER_INTROS[characterId];
    introPageIndex = 0;
    introCharacterId = characterId;
    currentScreen = 'intro';
  } else {
    currentScreen = 'game';
  }
  render();
}

// ============================================================
// CHARACTER SELECT SCREEN
// ============================================================
let selectedCharacterId = null;

function renderCharacterSelect() {
  // Use expanded Miami characters if available, fallback to old system
  const characters = typeof MIAMI_CHARACTERS !== 'undefined' ? MIAMI_CHARACTERS :
    (typeof CHARACTER_ARCHETYPES !== 'undefined' ? CHARACTER_ARCHETYPES : []);

  const selectedChar = selectedCharacterId ? characters.find(c => c.id === selectedCharacterId) : null;

  const diffColorMap = { 'Very Hard': 'neon-red', 'Hard': 'neon-red', 'Medium': 'neon-yellow', 'Easy': 'neon-green', 'Extreme': 'neon-red', 'Variable': 'neon-cyan' };

  const cards = characters.filter(c => !c.ngPlusOnly).map(c => {
    const isSelected = selectedCharacterId === c.id;
    const diffColor = diffColorMap[c.difficulty] || 'neon-yellow';
    return `
      <div class="char-card ${isSelected ? 'selected' : ''}" onclick="selectedCharacterId='${c.id}'; render();">
        <div class="char-card-emoji">${c.emoji}</div>
        <div class="char-card-name">${c.name}</div>
        <div class="char-card-tagline">${c.subtitle || c.tagline || ''}</div>
        <div class="char-card-difficulty">
          <span class="${diffColor}">${c.difficulty || ''}</span>
        </div>
      </div>
    `;
  }).join('');

  let detailPanel = '';
  if (selectedChar) {
    const c = selectedChar;
    const startLoc = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(l => l.id === (c.startingDistrict || c.startingLocation)) : null;

    // Build skills display
    const skillsHtml = c.baseSkills ? Object.entries(c.baseSkills)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => `<span class="char-skill-badge">${k}: ${v}</span>`)
      .join(' ') : '';

    // Build faction display
    let factionHtml = '';
    if (c.friendlyFactions && c.friendlyFactions.length > 0) {
      const friendNames = c.friendlyFactions.map(fid => {
        const f = typeof MIAMI_FACTIONS !== 'undefined' ? MIAMI_FACTIONS.find(x => x.id === fid) : null;
        return f ? `<span class="neon-green">${f.emoji} ${f.name}</span>` : fid;
      }).join(', ');
      factionHtml += `<div class="char-stat-row"><span class="char-stat-label">🤝 Friendly</span><span>${friendNames}</span></div>`;
    }
    if (c.hostileFactions && c.hostileFactions.length > 0) {
      const hostileNames = c.hostileFactions.map(fid => {
        const f = typeof MIAMI_FACTIONS !== 'undefined' ? MIAMI_FACTIONS.find(x => x.id === fid) : null;
        return f ? `<span class="neon-red">${f.emoji} ${f.name}</span>` : fid;
      }).join(', ');
      factionHtml += `<div class="char-stat-row"><span class="char-stat-label">⚔️ Hostile</span><span>${hostileNames}</span></div>`;
    }

    detailPanel = `
      <div class="char-detail-panel">
        <div class="char-detail-header">
          <span style="font-size:2.5rem">${c.emoji}</span>
          <div>
            <h3 class="neon-pink" style="margin:0">${c.name}</h3>
            <p style="margin:0;font-size:0.95rem;color:var(--text-main)">${c.subtitle || c.tagline || ''}</p>
          </div>
        </div>
        <p class="char-detail-desc">${c.backstory || c.desc || ''}</p>
        ${c.playstyle ? `<p style="font-style:italic;color:var(--neon-cyan);font-size:0.85rem">${c.playstyle}</p>` : ''}
        <div class="char-stats">
          <div class="char-stat-row"><span class="char-stat-label">💰 Cash</span><span class="neon-green">$${(c.startingCash || 0).toLocaleString()}</span></div>
          <div class="char-stat-row"><span class="char-stat-label">💀 Debt</span><span class="neon-red">$${(c.startingDebt || 0).toLocaleString()}</span></div>
          <div class="char-stat-row"><span class="char-stat-label">🌡️ Heat</span><span>${c.startingHeat || 0}</span></div>
          <div class="char-stat-row"><span class="char-stat-label">📍 Start</span><span>${startLoc ? startLoc.name : (c.startingDistrict || c.startingLocation || 'Miami')}</span></div>
          <div class="char-stat-row"><span class="char-stat-label">⭐ Bonus Pts</span><span class="neon-yellow">${c.bonusSkillPoints || 0}</span></div>
          ${c.startingCrew && c.startingCrew.length > 0 ? `<div class="char-stat-row"><span class="char-stat-label">👥 Crew</span><span>${c.startingCrew.length} member${c.startingCrew.length > 1 ? 's' : ''}</span></div>` : ''}
          ${skillsHtml ? `<div class="char-stat-row"><span class="char-stat-label">🎯 Skills</span><span>${skillsHtml}</span></div>` : ''}
          ${factionHtml}
        </div>
        ${c.specialAbility ? `<div class="char-passive">
          <span class="char-passive-label">${c.specialAbility.name}:</span> ${c.specialAbility.desc}
        </div>` : ''}
        ${c.specialCondition ? `<div class="char-passive" style="border-color:var(--neon-red)">
          <span class="char-passive-label" style="color:var(--neon-red)">⚠️ ${c.specialCondition.name}:</span> ${c.specialCondition.desc}
        </div>` : ''}
        <button class="btn btn-primary btn-glow" onclick="confirmCharacterSelection('${c.id}')" style="width:100%;margin-top:1rem">
          ▶ PLAY AS ${c.name.toUpperCase()}
        </button>
      </div>
    `;
  }

  return `
    <div class="screen-container" style="max-width:1000px;margin:0 auto">
      <h2 class="section-title neon-pink" style="text-align:center;margin:1rem 0">🎭 CHOOSE YOUR CHARACTER</h2>
      <p class="text-dim" style="text-align:center;margin-bottom:1rem">8 unique starting characters. Each has different cash, crew, skills, faction relations, and challenges.</p>
      <div class="charselect-layout">
        <div class="charselect-grid">${cards}</div>
        ${detailPanel || '<div class="char-detail-placeholder"><p class="text-dim">← Select a character to see details</p></div>'}
      </div>
      <button class="btn btn-secondary" onclick="currentScreen='title'; selectedCharacterId=null; render();" style="margin-top:1rem">← Back to Menu</button>
    </div>
  `;
}

// ============================================================
// MAIN RENDER
// ============================================================
function render() {
  const app = document.getElementById('app');
  switch (currentScreen) {
    case 'title': app.innerHTML = renderTitle(); break;
    case 'charselect': app.innerHTML = renderCharacterSelect(); break;
    case 'game': app.innerHTML = renderGame(); break;
    case 'travel': app.innerHTML = renderTravel(); break;
    case 'combat': app.innerHTML = renderCombat(); break;
    case 'event': app.innerHTML = renderEventScreen(); break;
    case 'gameover': app.innerHTML = renderGameOver(); break;
    case 'highscores': app.innerHTML = renderHighScores(); break;
    case 'stash': app.innerHTML = renderStash(); break;
    case 'hospital': visitHospitalScreen(); break;
    case 'blackmarket': app.innerHTML = renderBlackMarket(); break;
    case 'court': app.innerHTML = renderCourt(); break;
    case 'crew': app.innerHTML = renderCrewPanel(); break;
    case 'achievements': app.innerHTML = renderAchievements(); break;
    case 'fronts': app.innerHTML = renderFronts(); break;
    case 'properties': app.innerHTML = renderProperties(); break;
    case 'stats': app.innerHTML = renderStats(); break;
    case 'distribution': app.innerHTML = renderDistribution(); break;
    case 'skilltree': app.innerHTML = renderSkillTree(); break;
    case 'dialogue': app.innerHTML = renderDialogue(); break;
    case 'processing': app.innerHTML = renderProcessing(); break;
    case 'imports': app.innerHTML = renderImportExport(); break;
    case 'factions': app.innerHTML = renderFactions(); break;
    case 'security': app.innerHTML = renderSecurity(); break;
    case 'lifestyle': app.innerHTML = renderLifestyle(); break;
    case 'politics': app.innerHTML = renderPolitics(); break;
    case 'missions': app.innerHTML = renderMissions(); break;
    case 'missiondialogue': app.innerHTML = renderMissionDialogue(); break;
    case 'futures': app.innerHTML = renderFutures(); break;
    case 'intro': app.innerHTML = renderIntro(); break;
    case 'howtoplay': app.innerHTML = renderHowToPlay(); break;
    case 'safehouse': app.innerHTML = renderSafehouse(); break;
    case 'bodies': app.innerHTML = renderBodyDisposal(); break;
    // === EXPANSION SCREENS ===
    case 'campaign': app.innerHTML = renderCampaignScreen(); break;
    case 'shipping': app.innerHTML = renderShippingScreen(); break;
    case 'rivals': app.innerHTML = renderRivalsScreen(); break;
    case 'operations': app.innerHTML = renderOperations(); break;
    case 'vehicles': app.innerHTML = renderVehicles(); break;
    case 'prison': app.innerHTML = renderPrison(); break;
    case 'heist': app.innerHTML = renderHeist(); break;
    case 'nightlife': app.innerHTML = renderNightlife(); break;
    case 'romance': app.innerHTML = renderRomance(); break;
    case 'defense': app.innerHTML = renderDefense(); break;
    // === V6 EXPANSION SCREENS ===
    case 'businesses_v2': app.innerHTML = renderBusinessesV2(); break;
    case 'phone': app.innerHTML = renderPhone(); break;
    case 'npcstory': app.innerHTML = renderNPCStory(); break;
  }
  updateMusic();
}

// ============================================================
// PERSISTENT TOOLBAR (shown in-game)
// ============================================================
var _helpVisible = false;

var SCREEN_HELP = {
  game: '🏪 <b>The Market</b> — Buy drugs cheap, travel to another district, sell high. Watch the price trends. Build your empire one deal at a time.',
  crew: '👥 <b>Your Crew</b> — Hire people at the Black Market. Assign jobs: guards, runners, lookouts, body disposal. Promote loyal members. Fire traitors.',
  fronts: '🏢 <b>Front Businesses</b> — Legitimate businesses that earn clean income AND launder dirty drug money. Upgrade for more capacity. Staff with crew for +10% income.',
  heist: '🎯 <b>Heists</b> — Plan a heist → Buy equipment → Assign crew → Execute. Each heist has rounds of combat. Better equipment = better odds. Bring the right crew.',
  factions: '⚔️ <b>Factions</b> — Gangs control districts. Your standing affects prices (+/-25%). Bribe them, trade on their turf, or go to war. Allies give discounts, enemies ambush you.',
  processing: '⚗️ <b>Drug Lab</b> — Buy chemicals, cook drugs into higher-value products. Chemistry skill improves quality. Higher quality = higher sell price. The Dropout gets +15% yield.',
  vehicles: '🚗 <b>Garage</b> — Buy vehicles for speed, cargo space, and armor. Faster cars = better escape chance. Trucks carry more product. Exotic cars boost reputation.',
  properties: '🏠 <b>Properties</b> — Buy safe houses, warehouses, labs. Properties add crew slots, stash space, and lab capacity. Protect your assets.',
  distribution: '📦 <b>Distribution</b> — Set up dealer networks in districts. Hire street dealers who sell for you automatically. Passive income but generates heat.',
  romance: '💕 <b>Romance</b> — Meet people in specific districts. Date them (costs money). Relationships can lead to marriage, kids, and... divorce. Child support is $500/day per kid.',
  factions: '⚔️ <b>Factions</b> — 8 Miami gangs + 26 world factions. Standing affects prices, territory access, and ambush risk. Bribe, ally, or war.',
  skills: '🎓 <b>Skills</b> — 8 skill trees with 100 skills. Earn skill points by leveling up. Skills affect trading, combat, stealth, crew management, and more.',
  politics: '🏛️ <b>Politics</b> — Corrupt officials, recruit contacts, gather intel. Political influence reduces investigation and improves court outcomes.',
  bodies: '☠️ <b>Body Disposal</b> — Undisposed bodies attract police. Assign crew to auto-dispose, or choose a method manually. Each method has different cost/risk.',
  operations: '🏢 <b>Mafia Operations</b> — Protection rackets, gambling, arms trafficking. Big money but big heat. Requires territory and crew.',
  nightlife: '🌙 <b>Nightlife</b> — Attend events to network, reduce stress, and meet contacts. VIP status at venues gives ongoing bonuses.',
  lifestyle: '🏠 <b>Lifestyle</b> — Your daily living costs. Higher lifestyle = less stress but more attention. Kingpin lifestyle costs $10K/day and adds +5 heat.',
  court: '⚖️ <b>Court</b> — When arrested: charges based on what you were carrying. Pay contacts, intimidate witnesses, or take a plea deal. Evidence strength matters.',
  imports: '📦 <b>Import/Export</b> — Connect with international suppliers for bulk drugs at wholesale prices. Build relationships over time. Risky but profitable.',
  shipping: '🚢 <b>Shipping</b> — Unlock transport tiers from mules to narco subs. Higher tiers move more product but cost more. Interception risk scales with heat.',
  futures: '📈 <b>Futures Trading</b> — Bet on drug price movements. Buy futures contracts and settle when the price moves in your favor. Early exit = penalty.',
  campaign: '📜 <b>Campaign</b> — 5-act story with branching paths. Each mission has 2-4 approaches with different consequences. Your choices shape the story.',
  missions: '📋 <b>Missions</b> — Procedural missions generate daily. Side mission chains have multiple chapters. Every choice earns traits that affect future options.',
  phone: '📱 <b>Phone</b> — Messages from suppliers, buyers, crew, and threats. Respond to earn money, missions, and intel. Watch for wiretaps at high heat.',
  defense: '🏰 <b>Territory Defense</b> — Build fortifications, watchtowers, weapon caches. Defend against raids. Assign crew as territory guards for +5 defense each.',
  stats: '📊 <b>Empire Stats</b> — Net worth, drug P&L, dirty/clean money ratio, scars, children, traits, and abilities. Track your empire\'s growth.',
};

function renderToolbar() {
  const muteIcon = MusicEngine.isMuted() ? '🔇' : '🔊';
  const sfxIcon = MusicEngine.isSfxMuted() ? '🔕' : '🔔';
  var helpText = SCREEN_HELP[currentScreen] || '';
  return `
    <div class="toolbar">
      <button class="toolbar-btn" onclick="goHome()" title="Main Menu">🏠</button>
      <button class="toolbar-btn" onclick="openSaveLoadModal()" title="Save/Load">💾</button>
      <button class="toolbar-btn" onclick="_helpVisible=!_helpVisible; render();" title="Help" style="${_helpVisible ? 'background:rgba(0,255,255,0.2);' : ''}">❓</button>
      ${typeof restartTutorial === 'function' ? '<button class="toolbar-btn" onclick="restartTutorial(); render();" title="Restart Tutorial">📖</button>' : ''}
      <button class="toolbar-btn" onclick="MusicEngine.toggleMute(); render();" title="Toggle Music">${muteIcon}</button>
      <button class="toolbar-btn" onclick="MusicEngine.toggleSfxMute(); render();" title="Toggle Sound Effects">${sfxIcon}</button>
      <div class="toolbar-vol">
        <input type="range" min="0" max="100" value="${Math.round(MusicEngine.getVolume() * 100)}" class="vol-slider" oninput="MusicEngine.setVolume(this.value/100)" title="Volume">
      </div>
    </div>
    ${_helpVisible && helpText ? '<div style="background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.2);border-radius:6px;padding:0.5rem 0.7rem;margin:0.3rem 0;font-size:0.8rem;color:var(--text-main);line-height:1.4;">' + helpText + '</div>' : ''}
  `;
}

// ============================================================
// TITLE SCREEN
// ============================================================
function renderTitle() {
  const slots = getSaveSlots();
  const hasSaves = slots.some(s => s.data);

  return `
    <div class="title-screen">
      <div class="title-neon-border">
        <div class="title-palm">🌴</div>
        <h1 class="title-main">DRUG WARS</h1>
        <h2 class="title-sub">M I A M I &nbsp; V I C E &nbsp; E D I T I O N</h2>
        <div class="title-divider"></div>
        <p class="title-tagline">The Miami underground drug trade awaits.<br>14 districts. Infinite ambition. One shot at the top.</p>
        <div class="title-year">&copy; 2026 — Based on the 1984 classic by John E. Dell</div>
        <button class="btn btn-primary btn-glow" onclick="startNewGame(false)">
          ▶ START NEW GAME
        </button>
        <button class="btn btn-secondary" style="border-color:#ff9500;color:#ff9500" onclick="startNewGame(true)">
          ♾️ ENDLESS MODE
        </button>
        ${(() => {
          const ngUnlocked = isNewGamePlusUnlocked();
          return ngUnlocked
            ? `<button class="btn btn-secondary" style="border-color:#ff2d95;color:#ff2d95" onclick="startNewGamePlus()">🔁 NEW GAME+</button>`
            : `<button class="btn btn-secondary btn-locked" style="border-color:#333;color:#555;cursor:not-allowed" disabled title="Beat the campaign to unlock">🔒 NEW GAME+ <span style="font-size:0.6rem;opacity:0.6">(LOCKED)</span></button>`;
        })()}
        ${hasSaves ? `<button class="btn btn-secondary" onclick="openSaveLoadModal()">📂 LOAD GAME</button>` : ''}
        <button class="btn btn-secondary" onclick="currentScreen='highscores'; render();">
          🏆 HIGH SCORES
        </button>
        <div id="modal-container"></div>
        <button class="btn btn-secondary" style="border-color:#00f0ff;color:#00f0ff" onclick="currentScreen='howtoplay'; render();">
          📖 HOW TO PLAY
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// HIGH SCORES
// ============================================================
function renderHighScores() {
  const scores = JSON.parse(localStorage.getItem('drugwars_highscores') || '[]');
  let rows = scores.map((s, i) => `
    <tr><td class="neon-pink">#${i + 1}</td><td>$${s.score.toLocaleString()}</td><td>${s.rank}</td><td>${s.cities} cities</td><td>${s.date}</td></tr>
  `).join('');
  if (!rows) rows = '<tr><td colspan="5" style="text-align:center;opacity:0.5;">No scores yet. Start playing!</td></tr>';

  return `
    <div class="screen-container">
      <h2 class="section-title neon-pink">🏆 HIGH SCORES</h2>
      <table class="data-table"><thead><tr><th>Rank</th><th>Score</th><th>Title</th><th>Cities</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>
      <button class="btn btn-secondary" onclick="currentScreen='title'; render();">← Back</button>
    </div>
  `;
}

// ============================================================
// HOW TO PLAY
// ============================================================
function renderHowToPlay() {
  return `
    <div class="screen-container" style="max-width:700px;margin:0 auto;">
      <h2 class="section-title neon-cyan" style="text-align:center;">📖 HOW TO PLAY</h2>
      <div style="color:var(--text-main);line-height:1.7;font-size:0.85rem;">

        <div class="htp-section">
          <h3 class="htp-heading">🎯 OBJECTIVE</h3>
          <p>You are a small-time dealer starting in Miami. Buy drugs cheap, sell them at a profit in other cities, and build a global empire. Pay off your loan shark debt and amass as much wealth as possible before your days run out — or go Endless and play forever.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">⚡ ACTIONS</h3>
          <p><b style="color:var(--neon-cyan)">Travel</b> — Move between 21 cities worldwide. Each trip takes 1-3 days depending on distance. Random events can occur during travel (ambushes, deals, police encounters).</p>
          <p><b style="color:var(--neon-cyan)">Wait</b> — Pass one day. Prices fluctuate, events trigger, and your operations continue. Sometimes waiting is the smartest move.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🏪 SERVICES</h3>
          <p><b style="color:var(--neon-cyan)">Bank</b> — Deposit cash to keep it safe from muggings. Earns small daily interest.</p>
          <p><b style="color:var(--neon-cyan)">Loan Shark</b> — Borrow money or repay your debt. Interest compounds daily — pay early!</p>
          <p><b style="color:var(--neon-cyan)">Hospital</b> — Heal injuries from combat. Costs money but keeps you alive.</p>
          <p><b style="color:var(--neon-cyan)">Black Market</b> — Buy weapons for combat and items for special uses (body armor, fake IDs, burner phones, etc.).</p>
          <p><b style="color:var(--neon-cyan)">Stash</b> — Store drugs at properties. Stash capacity depends on your properties and safe house.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🎯 MISSIONS</h3>
          <p><b style="color:var(--neon-pink)">Main Missions</b> — Story campaign missions tied to your rise through the underworld. One active at a time. Complete milestones to advance through 5 Acts.</p>
          <p><b style="color:var(--neon-pink)">Side Missions</b> — Random jobs for extra cash, reputation, and items. Up to 3 active at once. Includes deliveries, negotiations, investigations, and moral dilemmas.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">👑 EMPIRE</h3>
          <p><b style="color:var(--neon-purple)">Properties</b> — Buy apartments, warehouses, and labs across cities. Provide stash space, security, and income.</p>
          <p><b style="color:var(--neon-purple)">Crew</b> — Hire henchmen (enforcers, smugglers, chemists, accountants). They boost combat, carry capacity, production, and laundering.</p>
          <p><b style="color:var(--neon-purple)">Fronts</b> — Legitimate businesses that launder dirty money into clean cash.</p>
          <p><b style="color:var(--neon-purple)">Distribution</b> — Set up automatic drug sales networks in territories you control.</p>
          <p><b style="color:var(--neon-purple)">Lab</b> — Process raw drugs into higher-purity products worth more money.</p>
          <p><b style="color:var(--neon-purple)">Import/Export</b> — Set up international supply routes for bulk drug shipments.</p>
          <p><b style="color:var(--neon-purple)">Factions</b> — Manage relationships with cartels, mafias, triads, and more. Alliances bring trade bonuses; wars mean combat.</p>
          <p><b style="color:var(--neon-purple)">Security</b> — Monitor your heat level and manage law enforcement threats.</p>
          <p><b style="color:var(--neon-purple)">Lifestyle</b> — Your living standard affects stress, reputation, and daily costs.</p>
          <p><b style="color:var(--neon-purple)">Politics</b> — Bribe officials, gain political connections, reduce legal pressure.</p>
          <p><b style="color:var(--neon-purple)">Futures</b> — Trade drug futures contracts. Bet on price movements for big profits (or losses).</p>
          <p><b style="color:var(--neon-purple)">Safe House</b> — Your personal hideout. Upgrade it for heat reduction, stash space, and security. Watch your money stacks fill the room!</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🧬 CHARACTER</h3>
          <p><b style="color:var(--neon-green)">Skills</b> — Spend XP to unlock abilities across 8 categories: Combat, Driving, Persuasion, Chemistry, Business, Stealth, Leadership, and Streetwise. Each has 10 levels (6-10 unlock in NG+).</p>
          <p><b style="color:var(--neon-green)">Stats</b> — View your progress: days played, money earned, cities visited, enemies defeated.</p>
          <p><b style="color:var(--neon-green)">Achievements</b> — Track milestones and earn bragging rights.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">⚔️ COMBAT</h3>
          <p>Your <b>weapon damage + crew combat power</b> determines your strength. Accuracy affects hit chance. You can fight, flee, or sometimes bribe your way out. Better weapons and more crew = better odds.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🔥 HEAT & LAW</h3>
          <p>Every crime raises your <b>heat</b>. High heat means police raids, arrests, and court appearances. Reduce heat by: waiting, using safe houses, bribing officials, or laying low. If caught, you may lose cash, drugs, or do jail time.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">📱 PHONE SYSTEM</h3>
          <p>Your <b style="color:var(--neon-cyan)">burner phone</b> receives 2-5 messages daily: supplier alerts, crew check-ins, buyer requests, NPC story updates, news, threats, and spam. Each burner lasts 30 days — when you switch phones, unread messages are lost and contacts must re-share info. Check the 📱 icon in the sidebar for unread messages.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🏢 BUSINESSES V2</h3>
          <p>Beyond fronts, you can now own <b style="color:var(--neon-green)">15 new business types</b>: Music Labels, Food Truck Fleets, Marinas, Crypto Mining Farms, Private Security firms, Towing Companies, Bail Bonds offices, Pawn Shops, Gas Stations, Pharmacies, Strip Clubs, Storage Units, Car Dealerships, Construction Companies, and Laundromat Chains. Each generates daily income, provides laundering capacity, and has unique criminal synergies (e.g., pharmacy supplies drugs, construction builds hideouts, bail bonds provides intel).</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🎲 RANDOM ENCOUNTERS</h3>
          <p>Every day there's a chance of encountering <b style="color:var(--neon-yellow)">150+ unique random events</b> across 6 categories: Street, Business, Crew, Law Enforcement, Faction, and Wild Card. Each presents 2-4 choices with different outcomes — help a mugging victim, take a bribe from a corrupt cop, discover buried treasure, or deal with an escaped zoo animal. Your choices affect cash, heat, reputation, stress, and more. Some encounters can even grant you a pet companion or lookout!</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">👤 NAMED NPCs</h3>
          <p>Meet <b style="color:var(--neon-purple)">30 named characters</b> with multi-chapter story arcs: Dr. Rosa Mendez (underground doctor), Father Ignacio (conflicted priest), Diamond Destiny Harris (nightclub queen), Officer Tommy Chen (ambitious cop), and many more. Build relationships through dialogue choices to unlock powerful benefits — discounted healing, case dismissals, weapons deals, and even romance options.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">📋 MISSION CHAINS</h3>
          <p><b style="color:var(--neon-pink)">40 multi-chapter side mission chains</b> unlock as you progress: become a crime photographer, run a cooking school front, plan a marina heist, promote underground fights, enter a poker tournament, orchestrate a Super Bowl operation, and more. Each chain has 3-5 chapters with branching outcomes. Up to 3 chains available at once — offers expire in 14 days!</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🔄 PROCEDURAL MISSIONS</h3>
          <p>The game generates <b style="color:var(--neon-cyan)">1-3 unique procedural missions daily</b> from 12 templates (delivery, collection, elimination, defense, sabotage, espionage, recruitment, escort, supply run, cleanup, negotiation, rescue) combined with 20 possible complications (police checkpoints, rival ambushes, vehicle breakdowns, etc.). Rewards scale with your level and the current act.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">💡 TIPS FOR BEGINNERS</h3>
          <p>• Start small in Miami — learn the local prices before traveling far.</p>
          <p>• Pay off your loan shark ASAP — the interest compounds daily.</p>
          <p>• Watch the news ticker — price events create huge profit opportunities.</p>
          <p>• Invest in properties early — stash space and labs multiply your income.</p>
          <p>• Keep heat below 50 — above that, raids become frequent and deadly.</p>
          <p>• Diversify your drugs — don't put all your money in one product.</p>
          <p>• Check your phone daily — messages contain deals, threats, and story triggers.</p>
          <p>• Build relationships with NPCs — their benefits stack and compound over time.</p>
          <p>• Buy businesses early in each act — passive income funds everything else.</p>
          <p>• Save often — this is a dangerous business.</p>
        </div>

        <div class="htp-section">
          <h3 class="htp-heading">🎮 CAMPAIGN STRUCTURE</h3>
          <p><b>Act 1</b> — Small-time hustler in Miami. Learn the ropes, build your crew.</p>
          <p><b>Act 2</b> — Expand across cities, establish supply routes, clash with rivals.</p>
          <p><b>Act 3</b> — Go international, take on cartels, build your empire.</p>
          <p><b>Act 4</b> — Defend your territory, face the law, deal with betrayal.</p>
          <p><b>Act 5</b> — The final showdown. Multiple endings based on your choices.</p>
          <p><b>New Game+</b> — Beat the campaign to unlock NG+ with new content, harder challenges, and exclusive items.</p>
        </div>

      </div>
      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary btn-glow" onclick="currentScreen='title'; render();">← BACK TO MENU</button>
      </div>
    </div>
  `;
}

// ============================================================
// BODY DISPOSAL
// ============================================================
function renderBodyDisposal() {
  if (typeof DISPOSAL_METHODS === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title neon-red">☠️ BODY DISPOSAL</h2><p>System not available.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }
  if (!gameState.bodies_state) gameState.bodies_state = typeof initBodyState === 'function' ? initBodyState() : { bodies: 0, totalKills: 0, disposedBodies: 0, discoveredBodies: 0, pendingDisposal: [], bodyLocations: [] };
  const bs = gameState.bodies_state;
  const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(gameState.xp || 0).level : 1;

  // Summary cards
  const summaryCards = `
    <div class="stats-overview" style="margin-bottom:0.8rem;">
      <div class="stat-card"><div class="stat-card-label">Undisposed</div><div class="stat-card-value ${bs.bodies > 0 ? 'neon-red' : 'neon-green'}">${bs.bodies}</div></div>
      <div class="stat-card"><div class="stat-card-label">Pending</div><div class="stat-card-value neon-yellow">${bs.pendingDisposal.reduce((s, p) => s + p.count, 0)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Total Kills</div><div class="stat-card-value neon-cyan">${bs.totalKills}</div></div>
      <div class="stat-card"><div class="stat-card-label">Disposed</div><div class="stat-card-value neon-green">${bs.disposedBodies}</div></div>
      <div class="stat-card"><div class="stat-card-label">Discovered</div><div class="stat-card-value neon-red">${bs.discoveredBodies}</div></div>
    </div>
  `;

  // Warning if bodies piling up
  let warningHtml = '';
  if (bs.bodies > 0) {
    warningHtml = '<div class="event-alert" style="border-color:var(--neon-red);margin-bottom:0.8rem;">⚠️ You have <strong>' + bs.bodies + '</strong> undisposed bod' + (bs.bodies > 1 ? 'ies' : 'y') + '! Each has a 3% daily chance of being discovered. Dispose of them before the heat piles up!</div>';
  }

  // Pending disposals
  let pendingHtml = '';
  if (bs.pendingDisposal.length > 0) {
    pendingHtml = '<div style="margin-bottom:0.8rem;"><h3 style="color:var(--neon-yellow);font-size:0.85rem;margin-bottom:0.3rem;">⏳ In Progress</h3>';
    pendingHtml += bs.pendingDisposal.map(pd => {
      const method = DISPOSAL_METHODS.find(m => m.id === pd.method);
      const daysLeft = pd.completionDay - gameState.day;
      return '<div class="mission-card" style="padding:0.4rem 0.6rem;margin-bottom:0.3rem;"><span>' + (method ? method.emoji + ' ' + method.name : '???') + '</span> — <span class="neon-cyan">' + pd.count + ' bod' + (pd.count > 1 ? 'ies' : 'y') + '</span> — <span class="neon-yellow">' + (daysLeft > 0 ? daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + ' left' : 'Completing...') + '</span></div>';
    }).join('');
    pendingHtml += '</div>';
  }

  // Disposal methods
  const methodCards = DISPOSAL_METHODS.map(method => {
    const locked = method.minLevel && playerLevel < method.minLevel;
    const canAfford = gameState.cash >= method.cost;
    const hasBodies = bs.bodies > 0;
    const maxBodies = Math.min(bs.bodies, Math.floor(gameState.cash / method.cost));

    return `
      <div class="mission-card" style="padding:0.6rem;margin-bottom:0.5rem;${locked ? 'opacity:0.4;' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
          <span style="font-size:1rem;font-weight:bold;color:var(--neon-cyan);">${method.emoji} ${method.name}</span>
          <span class="neon-green" style="font-size:0.85rem;">$${method.cost.toLocaleString()}/body</span>
        </div>
        <p style="color:var(--text-dim);font-size:0.75rem;margin-bottom:0.3rem;">${method.desc}</p>
        <div style="display:flex;gap:1rem;font-size:0.7rem;margin-bottom:0.4rem;">
          <span>Discovery: <span class="${method.discoveryChance <= 0.03 ? 'neon-green' : method.discoveryChance <= 0.1 ? 'neon-yellow' : 'neon-red'}">${(method.discoveryChance * 100).toFixed(1)}%</span></span>
          <span>Heat Reduction: <span class="neon-cyan">-${method.heatReduction}</span></span>
          <span>Time: <span class="neon-yellow">${method.timeRequired === 0 ? 'Instant' : method.timeRequired + ' day' + (method.timeRequired > 1 ? 's' : '')}</span></span>
        </div>
        ${locked ? '<span style="color:#666;font-size:0.75rem;">🔒 Requires Kingpin Level ' + method.minLevel + '</span>' :
          !hasBodies ? '<span style="color:var(--text-dim);font-size:0.75rem;">No bodies to dispose of</span>' :
          !canAfford ? '<span style="color:var(--neon-red);font-size:0.75rem;">Can\'t afford ($' + method.cost.toLocaleString() + ' needed)</span>' :
          '<div style="display:flex;gap:0.4rem;align-items:center;">' +
            '<button class="btn btn-sm btn-sell" onclick="doDisposeBodies(\'' + method.id + '\', 1)">Dispose 1</button>' +
            (maxBodies >= 5 ? '<button class="btn btn-sm btn-sell" onclick="doDisposeBodies(\'' + method.id + '\', 5)">Dispose 5</button>' : '') +
            (maxBodies >= 10 ? '<button class="btn btn-sm btn-sell" onclick="doDisposeBodies(\'' + method.id + '\', 10)">Dispose 10</button>' : '') +
            (maxBodies > 1 ? '<button class="btn btn-sm btn-buy" onclick="doDisposeBodies(\'' + method.id + '\', ' + maxBodies + ')">All (' + maxBodies + ')</button>' : '') +
          '</div>'
        }
      </div>
    `;
  }).join('');

  return '<div class="screen-container">' + renderToolbar() + backButton() +
    '<h2 class="section-title neon-red">☠️ BODY DISPOSAL</h2>' +
    summaryCards + warningHtml + pendingHtml +
    '<h3 style="color:var(--text-main);font-size:0.9rem;margin-bottom:0.5rem;">Disposal Methods</h3>' +
    methodCards +
    '<button class="btn btn-secondary" style="margin-top:0.8rem;" onclick="currentScreen=\'game\'; render();">← Back</button>' +
  '</div>';
}

function doDisposeBodies(methodId, count) {
  if (typeof disposeBodies !== 'function') return;
  const result = disposeBodies(gameState, methodId, count);
  if (result.success) {
    showNotification(result.msg, 'success');
    playSound('click');
  } else {
    showNotification(result.msg, 'error');
    playSound('error');
  }
  render();
}

// ============================================================
// CAMPAIGN SCREEN
// ============================================================
function renderCampaignScreen() {
  const campaign = gameState.campaign || {};
  const currentAct = typeof getCurrentAct === 'function' ? getCurrentAct(gameState) : null;
  const progress = typeof getCampaignProgress === 'function' ? getCampaignProgress(gameState) : 0;
  const availableMissions = typeof getAvailableMainMissions === 'function' ? getAvailableMainMissions(gameState) : [];
  const nextMission = availableMissions.length > 0 ? availableMissions[0] : null;

  // Character info
  const charData = gameState.characterData || {};

  // Act cards
  const actCards = typeof CAMPAIGN_ACTS !== 'undefined' ? CAMPAIGN_ACTS.map(act => {
    const isCurrent = campaign.currentAct === act.id;
    const isComplete = act.mainMissions && act.mainMissions.every(m => (campaign.completedMissions || []).includes(m.id));
    const isLocked = !isCurrent && !isComplete && CAMPAIGN_ACTS.indexOf(act) > CAMPAIGN_ACTS.findIndex(a => a.id === campaign.currentAct);
    const completedInAct = act.mainMissions ? act.mainMissions.filter(m => (campaign.completedMissions || []).includes(m.id)).length : 0;
    const totalInAct = act.mainMissions ? act.mainMissions.length : 0;

    return `
      <div class="card ${isCurrent ? 'card-highlight' : ''}" style="opacity:${isLocked ? '0.5' : '1'}">
        <div class="card-header">
          <span>${act.emoji} ${act.name}</span>
          <span class="${isComplete ? 'neon-green' : isCurrent ? 'neon-cyan' : 'text-dim'}">${isComplete ? '✓ COMPLETE' : isCurrent ? 'CURRENT' : isLocked ? '🔒 LOCKED' : ''}</span>
        </div>
        <p class="text-dim" style="font-size:0.85rem">${act.desc}</p>
        <div class="stat-bar"><div class="stat-fill" style="width:${totalInAct > 0 ? (completedInAct/totalInAct*100) : 0}%;background:var(--neon-cyan)"></div></div>
        <span class="text-dim" style="font-size:0.8rem">${completedInAct}/${totalInAct} missions</span>
      </div>
    `;
  }).join('') : '<p class="text-dim">Campaign data loading...</p>';

  // Available missions list
  let missionsHtml = '';
  if (availableMissions.length > 0) {
    missionsHtml = availableMissions.map(m => {
      const variant = m.characterVariants && m.characterVariants[gameState.character] ? m.characterVariants[gameState.character] : (m.characterVariants && m.characterVariants.default ? m.characterVariants.default : m.desc);
      const isActive = campaign.activeMission === m.id;
      const allDone = m.objectives ? m.objectives.every(obj => typeof checkMissionObjective === 'function' ? checkMissionObjective(gameState, obj) : false) : false;
      const completedCount = m.objectives ? m.objectives.filter(obj => typeof checkMissionObjective === 'function' ? checkMissionObjective(gameState, obj) : false).length : 0;
      const totalCount = m.objectives ? m.objectives.length : 0;

      const objectivesHtml = m.objectives ? m.objectives.map(obj => {
        const complete = typeof checkMissionObjective === 'function' ? checkMissionObjective(gameState, obj) : false;
        const prog = typeof getObjectiveProgress === 'function' ? getObjectiveProgress(gameState, obj) : { current: complete ? 1 : 0, target: 1, done: complete };
        const howTo = typeof getObjectiveHowTo === 'function' ? getObjectiveHowTo(obj) : '';
        const pctRaw = prog.inverted
          ? (prog.current < prog.target ? 100 : Math.max(0, 100 - ((prog.current - prog.target) / prog.target * 100)))
          : (prog.target > 0 ? Math.min(100, (prog.current / prog.target) * 100) : 0);
        const pct = Math.round(pctRaw);
        const progressLabel = prog.inverted
          ? (complete ? 'Done' : `Current: ${typeof prog.current === 'number' && prog.current > 999 ? prog.current.toLocaleString() : prog.current} (need below ${typeof prog.target === 'number' && prog.target > 999 ? prog.target.toLocaleString() : prog.target})`)
          : `${typeof prog.current === 'number' && prog.current > 999 ? prog.current.toLocaleString() : prog.current} / ${typeof prog.target === 'number' && prog.target > 999 ? prog.target.toLocaleString() : prog.target}`;
        return `<div style="padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex;align-items:center;gap:0.4rem;${complete ? 'opacity:0.6' : ''}">
            <span style="font-size:1.1rem;line-height:1">${complete ? '<span style="color:#00ff88">&#10003;</span>' : '<span style="color:#666">&#9675;</span>'}</span>
            <div style="flex:1">
              <div style="font-weight:bold;${complete ? 'text-decoration:line-through;color:#888' : 'color:var(--neon-yellow)'}">${obj.desc}</div>
              <div style="display:flex;align-items:center;gap:0.5rem;margin-top:2px">
                <div style="flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden">
                  <div style="width:${pct}%;height:100%;background:${complete ? '#00ff88' : pct > 50 ? '#ffcc00' : '#ff6644'};border-radius:2px;transition:width 0.3s"></div>
                </div>
                <span style="font-size:0.75rem;color:${complete ? '#00ff88' : '#aaa'};white-space:nowrap">${progressLabel}</span>
              </div>
              ${!complete && howTo ? `<div style="font-size:0.75rem;color:#88aaff;margin-top:2px;font-style:italic">HOW TO: ${howTo}</div>` : ''}
            </div>
          </div>
        </div>`;
      }).join('') : '';

      return `
        <div class="card" style="border-color:${allDone ? 'var(--neon-green)' : isActive ? 'var(--neon-cyan)' : 'var(--neon-yellow)'};${allDone ? 'box-shadow:0 0 10px rgba(0,255,136,0.15)' : ''}">
          <div class="card-header">
            <span>${m.emoji || '📋'} ${m.name}</span>
            <span>${allDone ? '<span style="color:#00ff88;font-weight:bold">READY TO COMPLETE</span>' : isActive ? '<span class="neon-cyan">TRACKING</span>' : `<span class="text-dim">${completedCount}/${totalCount} done</span>`}</span>
          </div>
          <p class="text-dim" style="font-size:0.85rem;margin-bottom:0.3rem">${variant}</p>
          ${m.isActClimax ? '<div style="font-size:0.75rem;color:#ff8844;margin-bottom:0.3rem;font-weight:bold">ACT CLIMAX - Major story mission</div>' : ''}
          ${m.choiceConsequences ? '<div style="font-size:0.75rem;color:#cc88ff;margin-bottom:0.3rem">Your choices in this mission will affect the story</div>' : ''}
          ${m.approaches ? `<div style="font-size:0.75rem;color:#88ccff;margin-bottom:0.3rem">Approaches: ${m.approaches.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</div>` : ''}
          ${objectivesHtml ? `<div style="margin-top:0.5rem;font-size:0.85rem;background:rgba(0,0,0,0.2);border-radius:6px;padding:0.4rem 0.6rem">
            <div style="font-size:0.7rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.3rem">Objectives (${completedCount}/${totalCount})</div>
            ${objectivesHtml}
          </div>` : ''}
          <div style="margin-top:0.5rem;font-size:0.8rem;color:var(--neon-green);background:rgba(0,255,136,0.05);padding:0.3rem 0.5rem;border-radius:4px">
            Reward: ${m.reward ? `$${(m.reward.cash||0).toLocaleString()} | +${m.reward.rep||0} Rep | +${m.reward.xp||0} XP` : 'See description'}
          </div>
          ${m.unlocks && m.unlocks.length > 0 ? `<div style="font-size:0.7rem;color:#888;margin-top:0.3rem">Unlocks: ${m.unlocks.filter(u => !u.startsWith('act')).join(', ') || 'Next act'}</div>` : ''}
          ${!isActive ? `<button class="btn btn-sm btn-primary" style="margin-top:0.5rem" onclick="gameState.campaign.activeMission='${m.id}'; render();">Track Mission</button>` : ''}
        </div>
      `;
    }).join('');
  }

  // Side missions from current act
  let sideMissionsHtml = '';
  if (currentAct && currentAct.sideMissions && currentAct.sideMissions.length > 0) {
    sideMissionsHtml = currentAct.sideMissions.slice(0, 5).map(sm => {
      const smUnlocks = sm.unlocks && sm.unlocks.length > 0 ? sm.unlocks.join(', ') : '';
      return `
      <div class="card" style="border-color:var(--text-dim);opacity:0.9">
        <div class="card-header"><span>${sm.name}</span></div>
        <p class="text-dim" style="font-size:0.8rem">${sm.desc}</p>
        <div style="font-size:0.75rem;color:var(--neon-green)">Reward: $${(sm.reward.cash||0).toLocaleString()} | +${sm.reward.rep||0} Rep${sm.reward.xp ? ' | +' + sm.reward.xp + ' XP' : ''}</div>
        ${smUnlocks ? `<div style="font-size:0.7rem;color:#888;margin-top:0.2rem">Unlocks: ${smUnlocks}</div>` : ''}
      </div>
    `;
    }).join('');
  }

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🎯 CAMPAIGN</h2>
      <div style="text-align:center;margin-bottom:1rem">
        <span class="neon-cyan" style="font-size:1.2rem">${charData.emoji || ''} ${charData.name || gameState.character || 'Unknown'}</span>
        <span class="text-dim"> — ${charData.subtitle || ''}</span>
      </div>
      <div style="margin-bottom:1rem">
        <div class="stat-bar" style="height:8px"><div class="stat-fill" style="width:${progress}%;background:linear-gradient(90deg,var(--neon-cyan),var(--neon-green))"></div></div>
        <p class="text-dim" style="text-align:center;font-size:0.85rem">Campaign Progress: ${progress}% | Missions: ${(campaign.completedMissions||[]).length}/${typeof CAMPAIGN_ACTS !== 'undefined' ? CAMPAIGN_ACTS.reduce((s,a) => s + (a.mainMissions?a.mainMissions.length:0), 0) : '?'}</p>
      </div>
      <h3 class="neon-yellow" style="margin:1rem 0 0.5rem">📖 Story Acts</h3>
      <div class="card-grid">${actCards}</div>
      ${missionsHtml ? `<h3 class="neon-green" style="margin:1rem 0 0.5rem">📋 Available Main Missions</h3>${missionsHtml}` : '<p class="text-dim">No main missions available right now. Progress your empire!</p>'}
      ${sideMissionsHtml ? `<h3 class="text-dim" style="margin:1rem 0 0.5rem">📎 Side Missions</h3>${sideMissionsHtml}` : ''}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}

// ============================================================
// SHIPPING SCREEN
// ============================================================
function renderShippingScreen() {
  const shipping = gameState.shipping || { currentTier: 0, ownedTiers: [0], activeShipments: [] };
  const tiers = typeof SHIPPING_TIERS !== 'undefined' ? SHIPPING_TIERS : [];

  const tierCards = tiers.map(t => {
    const owned = shipping.ownedTiers.includes(t.tier);
    const canUnlock = !owned && typeof canUnlockShippingTier === 'function' && canUnlockShippingTier(gameState, t.id);
    const isCurrent = shipping.currentTier === t.tier;
    const isNgLocked = t.ngPlusOnly && !(gameState.newGamePlus && gameState.newGamePlus.active);

    return `
      <div class="card ${isCurrent ? 'card-highlight' : ''}" style="${isNgLocked ? 'opacity:0.4' : owned ? '' : 'opacity:0.7'}">
        <div class="card-header">
          <span>${t.emoji} ${t.name}</span>
          <span class="${owned ? 'neon-green' : 'text-dim'}">${owned ? (isCurrent ? '✓ ACTIVE' : '✓ OWNED') : isNgLocked ? '🔒 NG+' : '🔒'}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;font-size:0.85rem;margin:0.5rem 0">
          <span>Capacity: <span class="neon-cyan">${t.capacity.toLocaleString()}</span></span>
          <span>Speed: <span class="neon-cyan">${t.speed < 0.5 ? 'Very Fast' : t.speed < 0.7 ? 'Fast' : t.speed < 0.9 ? 'Moderate' : 'Slow'}</span></span>
          <span>Risk: <span class="${t.risk === 'extreme' ? 'neon-red' : t.risk === 'very_high' ? 'neon-red' : t.risk === 'high' ? 'neon-yellow' : 'neon-green'}">${t.risk}</span></span>
          <span>Daily: <span class="neon-red">${t.dailyCost > 0 ? '-$'+t.dailyCost.toLocaleString() : 'Free'}</span></span>
        </div>
        <p class="text-dim" style="font-size:0.8rem">${t.desc}</p>
        ${t.international ? `<p style="font-size:0.8rem;color:var(--neon-green)">🌍 International routes: ${(t.routes||[]).join(', ')}</p>` : ''}
        ${!owned && !isNgLocked ? `<button class="btn btn-sm ${canUnlock ? 'btn-primary' : 'btn-secondary'}" ${!canUnlock ? 'disabled' : ''} onclick="doUnlockShipping('${t.id}')" style="margin-top:0.5rem">${canUnlock ? `Unlock ($${t.cost.toLocaleString()})` : `Requires: ${t.unlockCondition}`}</button>` : ''}
      </div>
    `;
  }).join('');

  // Active shipments
  const shipmentsHtml = (shipping.activeShipments || []).map(s => `
    <div class="card" style="border-color:var(--neon-cyan)">
      <span>${s.route} — ${s.cargo.amount || 0} units</span>
      <span class="text-dim"> (ETA: Day ${s.arriveDay})</span>
    </div>
  `).join('') || '<p class="text-dim">No active shipments.</p>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🚛 SHIPPING & TRANSPORT</h2>
      <div class="stats-grid" style="margin-bottom:1rem">
        <div class="stat-card"><div class="stat-value">${shipping.completedShipments || 0}</div><div class="stat-label">Completed</div></div>
        <div class="stat-card"><div class="stat-value">${shipping.interceptedShipments || 0}</div><div class="stat-label">Intercepted</div></div>
        <div class="stat-card"><div class="stat-value">${(shipping.totalCargoMoved || 0).toLocaleString()}</div><div class="stat-label">Total Cargo</div></div>
      </div>
      <h3 class="neon-yellow" style="margin:1rem 0 0.5rem">Transport Tiers</h3>
      <div class="card-grid">${tierCards}</div>
      <h3 class="neon-cyan" style="margin:1rem 0 0.5rem">Active Shipments</h3>
      ${shipmentsHtml}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}

function doUnlockShipping(tierId) {
  if (typeof unlockShippingTier !== 'function') return;
  const result = unlockShippingTier(gameState, tierId);
  showNotification(result.msg, result.success ? 'success' : 'error');
  render();
}

// ============================================================
// RIVALS SCREEN
// ============================================================
function renderRivalsScreen() {
  const rivalInfo = typeof getRivalInfo === 'function' ? getRivalInfo(gameState) : { rivals: [], defeated: 0, totalWars: 0 };

  const rivalCards = rivalInfo.rivals.map(r => {
    const factionData = r.faction && typeof getFactionById === 'function' ? getFactionById(r.faction) : null;
    return `
      <div class="card" style="border-color:${r.atWar ? 'var(--neon-red)' : 'var(--border-color)'}">
        <div class="card-header">
          <span>${r.emoji} ${r.name}</span>
          <span class="${r.atWar ? 'neon-red' : 'text-dim'}">${r.atWar ? '⚔️ AT WAR' : `Power: ${r.power}`}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;font-size:0.85rem;margin:0.5rem 0">
          <span>Territories: <span class="neon-cyan">${r.territories}</span></span>
          <span>Specialty: <span class="neon-yellow">${r.specialty}</span></span>
          <span>Tier: <span class="text-dim">${r.tier}/5</span></span>
          ${factionData ? `<span>Allied: <span>${factionData.emoji} ${factionData.name}</span></span>` : ''}
        </div>
      </div>
    `;
  }).join('') || '<p class="text-dim">No known rival operations in Miami.</p>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center">🏴 RIVAL DEALERS</h2>
      <div class="stats-grid" style="margin-bottom:1rem">
        <div class="stat-card"><div class="stat-value">${rivalInfo.rivals.length}</div><div class="stat-label">Active Rivals</div></div>
        <div class="stat-card"><div class="stat-value">${rivalInfo.defeated}</div><div class="stat-label">Defeated</div></div>
        <div class="stat-card"><div class="stat-value">${rivalInfo.totalWars}</div><div class="stat-label">Wars Fought</div></div>
      </div>
      <h3 class="neon-red" style="margin:1rem 0 0.5rem">Known Operations</h3>
      ${rivalCards}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← Back</button>
    </div>
  `;
}

// ============================================================
// SAFE HOUSE
// ============================================================
function renderSafehouse() {
  if (typeof SAFEHOUSE_TIERS === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2>Safe House system loading...</h2><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  const sh = gameState.safehouse || { current: null, tier: -1, upgrades: [] };
  const hasSafehouse = sh.current !== null;

  if (!hasSafehouse) {
    // Purchase screen
    const tierCards = SAFEHOUSE_TIERS.map((tier, i) => {
      const canAfford = gameState.cash >= tier.cost;
      return '<div class="property-card" style="border-color:' + (canAfford ? 'var(--neon-cyan)' : 'var(--border-color)') + '">' +
        '<div class="prop-header"><span style="font-size:1.3rem;">' + tier.emoji + '</span><span class="prop-tag">' + tier.tag + '</span></div>' +
        '<h3 style="color:var(--text-main);margin:0.3rem 0;">' + tier.name + '</h3>' +
        '<p style="color:var(--text-dim);font-size:0.75rem;margin-bottom:0.5rem;">' + tier.desc + '</p>' +
        '<div style="font-size:0.7rem;color:var(--text-mid);margin-bottom:0.5rem;">' +
          '🛡️ Heat Reduction: -' + tier.heatReduction + '/day<br>' +
          '📦 Stash: +' + tier.stash + ' capacity<br>' +
          '🔒 Security: ' + tier.security + '<br>' +
          '💰 Maintenance: $' + tier.maintenance.toLocaleString() + '/day' +
        '</div>' +
        '<div style="font-size:0.85rem;font-weight:bold;color:' + (canAfford ? 'var(--neon-green)' : 'var(--neon-red)') + ';margin-bottom:0.5rem;">$' + tier.cost.toLocaleString() + '</div>' +
        (canAfford ? '<button class="btn btn-primary" onclick="doBuySafehouse(' + i + ')">Purchase</button>' : '<button class="btn btn-secondary" disabled style="opacity:0.4">Can\'t Afford</button>') +
      '</div>';
    }).join('');

    return '<div class="screen-container">' + renderToolbar() + backButton() +
      '<h2 class="section-title neon-cyan">🏠 SAFE HOUSE</h2>' +
      '<p style="color:var(--text-dim);margin-bottom:1rem;">Every empire needs a hideout. Purchase a safe house to reduce heat, store drugs, and stash your cash.</p>' +
      '<div class="properties-grid">' + tierCards + '</div>' +
      '<button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button>' +
    '</div>';
  }

  // Owned safe house view
  const tier = SAFEHOUSE_TIERS[sh.tier] || SAFEHOUSE_TIERS[0];
  const cash = gameState.cash || 0;

  // Money stacks visualization
  const stackCount = cash <= 0 ? 0 : Math.min(300, Math.floor(Math.log10(Math.max(1, cash)) * 30));
  let moneyStacksHtml = '';
  const roomW = 100; // percentage width
  const roomH = 100;
  for (let s = 0; s < stackCount; s++) {
    // Grid position with slight randomness
    const col = s % 20;
    const row = Math.floor(s / 20);
    const x = 5 + (col * 4.5) + (Math.sin(s * 7.3) * 1.2);
    const y = 55 + (row * 5) - (Math.cos(s * 3.1) * 1.5); // bottom half of room = floor
    const h = 4 + (cash > 1000000 ? 2 : 0) + (cash > 100000000 ? 2 : 0);
    const shade = cash > 100000000 ? '#00ff88' : cash > 1000000 ? '#22cc66' : cash > 1000 ? '#44aa44' : '#888866';
    const zIdx = row;
    if (y < 95 && y > 45) {
      moneyStacksHtml += '<div class="money-stack" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:3.5%;height:' + h + '%;background:' + shade + ';z-index:' + zIdx + ';"></div>';
    }
  }

  // Cash display
  const cashDisplay = cash >= 1e9 ? '$' + (cash / 1e9).toFixed(2) + 'B' :
    cash >= 1e6 ? '$' + (cash / 1e6).toFixed(2) + 'M' :
    cash >= 1e3 ? '$' + (cash / 1e3).toFixed(1) + 'K' :
    '$' + cash.toLocaleString();

  // Upgrade buttons
  const availableUpgrades = (typeof SAFEHOUSE_UPGRADES !== 'undefined' ? SAFEHOUSE_UPGRADES : []).filter(u => !(sh.upgrades || []).includes(u.id));
  const installedUpgrades = (typeof SAFEHOUSE_UPGRADES !== 'undefined' ? SAFEHOUSE_UPGRADES : []).filter(u => (sh.upgrades || []).includes(u.id));

  const upgradeCards = availableUpgrades.map(u => {
    const canAfford = gameState.cash >= u.cost;
    return '<div style="display:inline-block;background:var(--bg-card);border:1px solid ' + (canAfford ? 'var(--neon-cyan)' : 'var(--border-color)') + ';border-radius:6px;padding:0.5rem;margin:0.3rem;min-width:140px;">' +
      '<div style="font-size:0.8rem;color:var(--text-main);">' + u.emoji + ' ' + u.name + '</div>' +
      '<div style="font-size:0.65rem;color:var(--text-dim);">' + u.desc + '</div>' +
      '<div style="font-size:0.75rem;color:' + (canAfford ? 'var(--neon-green)' : 'var(--neon-red)') + ';margin:0.3rem 0;">$' + u.cost.toLocaleString() + '</div>' +
      (canAfford ? '<button class="btn btn-primary" style="font-size:0.65rem;padding:0.2rem 0.5rem;" onclick="doBuySafehouseUpgrade(\'' + u.id + '\')">Install</button>' : '') +
    '</div>';
  }).join('');

  // Tier upgrade button
  const nextTier = sh.tier < SAFEHOUSE_TIERS.length - 1 ? SAFEHOUSE_TIERS[sh.tier + 1] : null;
  const tierUpgradeHtml = nextTier ? (
    '<div style="margin:0.8rem 0;padding:0.6rem;background:var(--bg-card);border:1px solid var(--neon-purple);border-radius:8px;">' +
      '<span style="color:var(--neon-purple);font-weight:bold;">⬆️ Upgrade to ' + nextTier.name + '</span>' +
      '<span style="color:var(--text-dim);font-size:0.75rem;"> — Better security, more stash, lower heat</span><br>' +
      '<span style="color:' + (gameState.cash >= nextTier.cost ? 'var(--neon-green)' : 'var(--neon-red)') + ';font-weight:bold;">$' + nextTier.cost.toLocaleString() + '</span> ' +
      (gameState.cash >= nextTier.cost ? '<button class="btn btn-primary" style="font-size:0.7rem;padding:0.2rem 0.6rem;margin-left:0.5rem;" onclick="doBuySafehouse(' + (sh.tier + 1) + ')">Upgrade</button>' : '') +
    '</div>'
  ) : '';

  // Visual upgrade indicators in room
  // Upgrade visual indicators
  let upgradeVisuals = '';
  if ((sh.upgrades || []).includes('security_cameras')) upgradeVisuals += '<div style="position:absolute;top:6%;right:6%;font-size:0.9rem;filter:drop-shadow(0 0 4px rgba(255,0,0,0.6));">📷</div><div style="position:absolute;top:6%;right:12%;width:4px;height:4px;border-radius:50%;background:#f00;animation:cameraBlink 2s infinite;"></div>';
  if ((sh.upgrades || []).includes('weapons_cache')) upgradeVisuals += '<div style="position:absolute;top:32%;left:4%;font-size:0.9rem;">🔫</div>';
  if ((sh.upgrades || []).includes('escape_tunnel')) upgradeVisuals += '<div style="position:absolute;bottom:3%;right:3%;font-size:0.8rem;opacity:0.4;">🕳️</div>';
  if ((sh.upgrades || []).includes('panic_room')) upgradeVisuals += '<div style="position:absolute;top:20%;left:3%;font-size:0.8rem;">🚪</div>';
  if ((sh.upgrades || []).includes('reinforced_door')) upgradeVisuals += '<div style="position:absolute;bottom:25%;left:1%;width:6%;height:20%;background:linear-gradient(90deg,#555,#777,#555);border-radius:2px;border:1px solid #888;"></div>';
  if ((sh.upgrades || []).includes('generator')) upgradeVisuals += '<div style="position:absolute;bottom:8%;left:4%;font-size:0.7rem;">⚡🔋</div>';

  // Tier-specific interior decorations
  let interiorHtml = '';
  if (sh.tier === 0) {
    // Dingy Motel: stained mattress, bare bulb, cracked mirror, water stain
    interiorHtml =
      '<div style="position:absolute;top:8%;left:45%;font-size:0.6rem;color:#ffdd44;filter:drop-shadow(0 0 8px rgba(255,220,0,0.6));">💡</div>' +
      '<div style="position:absolute;bottom:30%;left:8%;width:22%;height:12%;background:linear-gradient(135deg,#4a3828,#3a2818);border:1px solid #5a4030;border-radius:2px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);"></div>' +
      '<div style="position:absolute;bottom:30%;left:9%;width:20%;height:3%;background:linear-gradient(90deg,#888,#666);border-radius:1px;opacity:0.6;"></div>' +
      '<div style="position:absolute;top:18%;right:10%;width:8%;height:14%;background:linear-gradient(180deg,#334,#223);border:1px solid #556;border-radius:1px;opacity:0.5;"></div>' +
      '<div style="position:absolute;top:25%;left:30%;width:12%;height:3%;background:rgba(80,60,40,0.3);border-radius:50%;"></div>';
  } else if (sh.tier === 1) {
    // Studio Apartment: couch, TV, small table, lamp, bookshelf
    interiorHtml =
      '<div style="position:absolute;bottom:28%;left:6%;width:20%;height:10%;background:linear-gradient(135deg,#3a4a5a,#2a3a4a);border:1px solid #5a6a7a;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>' +
      '<div style="position:absolute;bottom:30%;left:8%;width:16%;height:3%;background:#4a5a6a;border-radius:2px;"></div>' +
      '<div style="position:absolute;top:15%;right:12%;width:12%;height:10%;background:#111;border:2px solid #333;border-radius:2px;box-shadow:0 0 8px rgba(100,150,255,0.2);"></div>' +
      '<div style="position:absolute;top:17%;right:14%;width:8%;height:6%;background:linear-gradient(180deg,#112,#223);"></div>' +
      '<div style="position:absolute;bottom:28%;right:8%;width:10%;height:8%;background:linear-gradient(180deg,#3a2a1a,#2a1a0a);border:1px solid #4a3a2a;border-radius:2px;"></div>' +
      '<div style="position:absolute;top:10%;right:8%;font-size:0.5rem;color:#ffcc44;filter:drop-shadow(0 0 5px rgba(255,200,0,0.4));">💡</div>' +
      '<div style="position:absolute;top:12%;left:8%;width:5%;height:22%;background:linear-gradient(90deg,#2a2015,#3a3025,#2a2015);border:1px solid #4a3a2a;border-radius:1px;"></div>';
  } else if (sh.tier === 2) {
    // Luxury Condo: modern sofa, glass table, art on walls, balcony, safe
    interiorHtml =
      '<div style="position:absolute;bottom:26%;left:5%;width:24%;height:10%;background:linear-gradient(135deg,#2a2a3a,#3a3a5a);border:1px solid #5a5a8a;border-radius:4px;box-shadow:0 2px 8px rgba(100,100,200,0.2);"></div>' +
      '<div style="position:absolute;bottom:30%;left:10%;width:14%;height:2%;background:rgba(200,200,255,0.2);border-radius:2px;"></div>' +
      '<div style="position:absolute;bottom:26%;left:32%;width:12%;height:6%;background:rgba(200,200,255,0.08);border:1px solid rgba(200,200,255,0.15);border-radius:2px;"></div>' +
      '<div style="position:absolute;top:12%;left:15%;width:14%;height:10%;border:2px solid #6a5a8a;border-radius:1px;background:linear-gradient(135deg,#1a1a2a,#2a1a3a);box-shadow:0 0 6px rgba(150,100,200,0.2);"></div>' +
      '<div style="position:absolute;top:12%;right:22%;width:10%;height:8%;border:2px solid #5a6a8a;border-radius:1px;background:linear-gradient(45deg,#1a2a3a,#2a3a4a);"></div>' +
      '<div style="position:absolute;top:15%;right:8%;width:12%;height:10%;background:#111;border:2px solid #444;border-radius:3px;box-shadow:0 0 12px rgba(100,180,255,0.15);"></div>' +
      '<div style="position:absolute;bottom:28%;right:6%;width:8%;height:12%;background:linear-gradient(180deg,#333,#444,#333);border:2px solid #555;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>';
  } else if (sh.tier === 3) {
    // Fortified Penthouse: vault door, monitors wall, bar, piano, skyline view
    interiorHtml =
      '<div style="position:absolute;top:8%;left:8%;width:20%;height:15%;display:grid;grid-template-columns:1fr 1fr;gap:2px;">' +
        '<div style="background:#111;border:1px solid #333;border-radius:1px;box-shadow:0 0 4px rgba(0,255,100,0.15);"></div>' +
        '<div style="background:#111;border:1px solid #333;border-radius:1px;box-shadow:0 0 4px rgba(0,255,100,0.15);"></div>' +
        '<div style="background:#111;border:1px solid #333;border-radius:1px;box-shadow:0 0 4px rgba(255,100,0,0.15);"></div>' +
        '<div style="background:#111;border:1px solid #333;border-radius:1px;box-shadow:0 0 4px rgba(0,100,255,0.15);"></div>' +
      '</div>' +
      '<div style="position:absolute;bottom:26%;left:4%;width:22%;height:8%;background:linear-gradient(90deg,#1a1a2a,#2a2a4a);border:1px solid #4a4a6a;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>' +
      '<div style="position:absolute;bottom:26%;right:4%;width:16%;height:12%;background:linear-gradient(180deg,#111,#1a1a1a);border:2px solid #666;border-radius:3px;box-shadow:0 0 10px rgba(255,200,0,0.1);"></div>' +
      '<div style="position:absolute;top:10%;right:8%;width:18%;height:18%;background:linear-gradient(180deg,#0a1525,#152035);border:2px solid rgba(100,180,255,0.3);border-radius:2px;box-shadow:0 0 15px rgba(100,180,255,0.1);overflow:hidden;"><div style="position:absolute;bottom:0;width:100%;height:40%;background:linear-gradient(180deg,transparent,rgba(255,150,0,0.05));"></div></div>' +
      '<div style="position:absolute;bottom:30%;left:35%;width:12%;height:4%;background:linear-gradient(90deg,#2a1a0a,#3a2a1a);border-top:2px solid #5a4a3a;border-radius:1px;"></div>';
  } else if (sh.tier === 4) {
    // Underground Bunker: blast door, server racks, armory wall, war room table, maps
    interiorHtml =
      '<div style="position:absolute;bottom:22%;left:1%;width:8%;height:22%;background:linear-gradient(90deg,#444,#666,#444);border:2px solid #888;border-radius:4px;box-shadow:0 0 8px rgba(255,200,0,0.1);"></div>' +
      '<div style="position:absolute;bottom:24%;left:2.5%;width:5%;height:5%;background:#333;border:2px solid #aa0;border-radius:50%;"></div>' +
      '<div style="position:absolute;top:8%;right:5%;width:14%;height:30%;display:flex;flex-direction:column;gap:2px;">' +
        '<div style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:1px;box-shadow:inset 0 0 4px rgba(0,255,0,0.1);"></div>' +
        '<div style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:1px;box-shadow:inset 0 0 4px rgba(0,100,255,0.1);"></div>' +
        '<div style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:1px;box-shadow:inset 0 0 4px rgba(255,0,0,0.1);"></div>' +
      '</div>' +
      '<div style="position:absolute;top:12%;left:12%;width:22%;height:16%;border:1px solid rgba(0,255,200,0.2);border-radius:2px;background:rgba(0,30,20,0.4);box-shadow:0 0 10px rgba(0,255,200,0.05);overflow:hidden;"><div style="width:100%;height:100%;background:url(\'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"0\" y1=\"50%\" x2=\"100%\" y2=\"50%\" stroke=\"rgba(0,255,200,0.1)\" /><line x1=\"50%\" y1=\"0\" x2=\"50%\" y2=\"100%\" stroke=\"rgba(0,255,200,0.1)\" /></svg>\');"></div></div>' +
      '<div style="position:absolute;bottom:25%;left:15%;width:30%;height:8%;background:linear-gradient(180deg,#1a1a20,#252530);border:1px solid #3a3a4a;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>' +
      '<div style="position:absolute;top:5%;left:40%;width:16%;height:3%;background:rgba(255,0,0,0.15);border:1px solid rgba(255,0,0,0.3);border-radius:2px;text-align:center;font-size:0.4rem;color:rgba(255,0,0,0.6);line-height:1.8;">⚠ RESTRICTED</div>';
  }

  return '<div class="screen-container">' + renderToolbar() + backButton() +
    '<h2 class="section-title neon-cyan">🏠 ' + tier.name.toUpperCase() + '</h2>' +

    // Visual room
    '<div class="safehouse-room safehouse-tier-' + sh.tier + '">' +
      '<div class="safehouse-back-wall">' +
        '<div class="safehouse-window" style="' + (sh.tier >= 2 ? 'opacity:1' : sh.tier === 1 ? 'opacity:0.5' : 'opacity:0.2') + '"></div>' +
        interiorHtml +
        upgradeVisuals +
      '</div>' +
      '<div class="safehouse-floor">' + moneyStacksHtml + '</div>' +
      '<div class="safehouse-cash-display">' + cashDisplay + '</div>' +
    '</div>' +

    // Stats
    '<div class="stats-overview" style="margin-top:0.8rem;">' +
      '<div class="stat-card"><div class="stat-card-label">Heat Reduction</div><div class="stat-card-value neon-cyan">-' + tier.heatReduction + '/day</div></div>' +
      '<div class="stat-card"><div class="stat-card-label">Stash Capacity</div><div class="stat-card-value neon-green">+' + tier.stash + '</div></div>' +
      '<div class="stat-card"><div class="stat-card-label">Security Level</div><div class="stat-card-value neon-purple">' + tier.security + '</div></div>' +
      '<div class="stat-card"><div class="stat-card-label">Daily Cost</div><div class="stat-card-value neon-orange">$' + tier.maintenance.toLocaleString() + '</div></div>' +
    '</div>' +

    // Installed upgrades
    (installedUpgrades.length > 0 ? '<div style="margin:0.5rem 0;"><span style="color:var(--text-dim);font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;">Installed:</span> ' + installedUpgrades.map(u => '<span style="color:var(--neon-green);font-size:0.75rem;margin-right:0.5rem;">' + u.emoji + ' ' + u.name + '</span>').join('') + '</div>' : '') +

    tierUpgradeHtml +

    // Available upgrades
    (availableUpgrades.length > 0 ? '<h3 style="color:var(--text-main);font-size:0.85rem;margin:0.8rem 0 0.4rem;">Available Upgrades</h3><div style="display:flex;flex-wrap:wrap;">' + upgradeCards + '</div>' : '') +

    '<button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button>' +
  '</div>';
}

function doBuySafehouse(tierIndex) {
  if (typeof SAFEHOUSE_TIERS === 'undefined') return;
  const tier = SAFEHOUSE_TIERS[tierIndex];
  if (!tier || gameState.cash < tier.cost) { playSound('error'); return; }

  if (!gameState.safehouse) gameState.safehouse = { current: null, tier: -1, upgrades: [] };

  gameState.cash -= tier.cost;
  gameState.safehouse.current = tier.id;
  gameState.safehouse.tier = tierIndex;
  gameState.messageLog.push('🏠 ' + (gameState.safehouse.tier >= 0 ? 'Upgraded to' : 'Purchased') + ' ' + tier.name + '!');
  playSound('click');
  render();
}

function doBuySafehouseUpgrade(upgradeId) {
  if (typeof SAFEHOUSE_UPGRADES === 'undefined') return;
  const upgrade = SAFEHOUSE_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade || gameState.cash < upgrade.cost) { playSound('error'); return; }
  if (!gameState.safehouse) return;
  if (!gameState.safehouse.upgrades) gameState.safehouse.upgrades = [];
  if (gameState.safehouse.upgrades.includes(upgradeId)) return;

  gameState.cash -= upgrade.cost;
  gameState.safehouse.upgrades.push(upgradeId);
  gameState.messageLog.push('🔧 Installed ' + upgrade.name + ' in safe house!');
  playSound('click');
  render();
}

// ============================================================
// MAIN GAME SCREEN
// ============================================================
function renderGame() {
  // Prison intercept - redirect to prison screen if incarcerated
  if (gameState.prison && gameState.prison.inPrison) {
    currentScreen = 'prison';
    return renderPrison();
  }

  const loc = LOCATIONS.find(l => l.id === gameState.currentLocation);
  const daysLeft = GAME_CONFIG.totalDays - gameState.day + 1;

  // Status bar
  const statusBar = `
    <div class="status-bar">
      <div class="status-row">
        <span class="stat"><span class="stat-label">DAY</span> <span class="stat-value">${GAME_CONFIG.endlessMode ? gameState.day : gameState.day + '/' + GAME_CONFIG.totalDays}</span>${typeof getTimePeriod === 'function' ? ` <span style="font-size:0.7rem">${getTimePeriod(gameState).emoji}</span>` : ''}</span>
        <span class="stat" title="Total cash. Dirty money needs laundering through front businesses."><span class="stat-label">CASH</span> <span class="stat-value neon-green">$${gameState.cash.toLocaleString()}</span>${(gameState.dirtyMoney || 0) > 1000 ? `<span style="font-size:0.55rem;color:var(--neon-red);margin-left:2px" title="Dirty money draws investigation. Launder through fronts!">💰${Math.round((gameState.dirtyMoney || 0) / Math.max(1, gameState.cash) * 100)}%🔴</span>` : ''}</span>
        <span class="stat"><span class="stat-label">BANK</span> <span class="stat-value neon-cyan">$${gameState.bank.toLocaleString()}</span></span>
        <span class="stat"><span class="stat-label">DEBT</span> <span class="stat-value ${gameState.debt > 0 ? 'neon-red' : 'neon-green'}">$${gameState.debt.toLocaleString()}</span></span>
      </div>
      <div class="status-row">
        <span class="stat"><span class="stat-label">HP</span> <span class="stat-value ${gameState.health < 30 ? 'neon-red' : 'neon-green'}">${gameState.health}/${gameState.maxHealth}</span></span>
        <span class="stat"><span class="stat-label">STRESS</span> <span class="stat-value ${(gameState.lifestyle?.stress || 0) > 70 ? 'neon-red' : (gameState.lifestyle?.stress || 0) > 40 ? 'neon-yellow' : 'neon-green'}">${gameState.lifestyle?.stress || 0}%</span></span>
        <span class="stat rep-stat-hover"><span class="stat-label">HEAT</span> <span class="heat-bar heat-bar-enhanced"><span class="heat-fill ${gameState.heat > 80 ? 'heat-critical' : gameState.heat > 60 ? 'heat-high' : gameState.heat > 30 ? 'heat-medium' : 'heat-low'}" style="width:${gameState.heat}%"></span><span class="heat-pct">${gameState.heat}%</span></span>${typeof renderHeatTooltipHTML === 'function' ? renderHeatTooltipHTML(gameState) : ''}</span>
        <span class="stat"><span class="stat-label">SPACE</span> <span class="stat-value">${getInventoryCount(gameState)}/${getMaxInventory(gameState)}</span></span>
        <span class="stat rep-stat-hover"><span class="stat-label">REP</span> <span class="stat-value">${gameState.reputation}</span>${typeof renderRepTooltipHTML === 'function' ? renderRepTooltipHTML(gameState) : ''}</span>
        ${typeof getCurrentAct === 'function' && gameState.campaign ? `<span class="stat"><span class="stat-label">ACT</span> <span class="act-indicator act-${gameState.campaign.currentAct || 1}">${getCurrentAct(gameState).name}</span></span>` : ''}
        ${gameState.newGamePlus ? `<span class="ng-plus-badge">NG+</span>` : ''}
        ${typeof getWeatherDisplay === 'function' && gameState.weather ? `<span class="stat"><span class="stat-label">WEATHER</span> <span class="stat-value">${getWeatherDisplay(gameState).emoji} ${getWeatherDisplay(gameState).name}</span></span>` : ''}
      </div>
      ${gameState.investigation ? `<div class="status-row">
        <span class="stat"><span class="stat-label">INVESTIGATION</span>
          <span class="investigation-bar"><span class="investigation-fill" style="width:${gameState.investigation.points}%"></span></span>
          <span class="stat-value investigation-level-${gameState.investigation.level}">${INVESTIGATION_LEVELS[gameState.investigation.level].emoji} ${INVESTIGATION_LEVELS[gameState.investigation.level].name}</span>
        </span>
        ${gameState.investigation.timesArrested > 0 ? `<span class="stat"><span class="stat-label">ARRESTS</span> <span class="stat-value neon-red">${gameState.investigation.timesArrested}</span></span>` : ''}
        ${getControlledTerritories(gameState).length > 0 ? `<span class="stat"><span class="stat-label">TERRITORY</span> <span class="stat-value neon-purple">🏴 ${getControlledTerritories(gameState).length}</span></span>` : ''}
        ${getTotalDistributionRevenue(gameState) > 0 ? `<span class="stat"><span class="stat-label">DIST</span> <span class="stat-value" style="color:#ff9500">📡 $${getTotalDistributionRevenue(gameState).toLocaleString()}/day</span></span>` : ''}
        <span class="stat" onclick="currentScreen='achievements'; render();" style="cursor:pointer">
          <span class="stat-label">RANK</span>
          <span class="stat-value neon-pink">${getKingpinLevel(gameState.xp || 0).emoji} ${getKingpinLevel(gameState.xp || 0).title}</span>
        </span>
      </div>` : ''}
    </div>
  `;

  // Location info
  const locationInfo = `
    <div class="location-header">
      <h2 class="location-name neon-pink">${loc.name}</h2>
      <span class="location-region">${loc.region}</span>
      <p class="location-desc">${loc.desc}</p>
      <p class="location-flavor"><em>${loc.flavor}</em></p>
      <div class="location-badges">
        ${loc.hasBank ? '<span class="badge badge-green">Bank</span>' : ''}
        ${loc.hasLoanShark ? '<span class="badge badge-red">Loan Shark</span>' : ''}
        ${loc.hasHospital ? '<span class="badge badge-cyan">Hospital</span>' : ''}
        ${loc.hasBlackMarket ? '<span class="badge badge-yellow">Black Market</span>' : ''}
        <span class="badge badge-danger">Danger: ${'★'.repeat(Math.min(loc.dangerLevel, 10))}${'☆'.repeat(Math.max(0, 10 - loc.dangerLevel))}</span>
        ${isTerritory(gameState, loc.id) ? '<span class="badge" style="background:var(--neon-purple);color:#fff">🏴 YOUR TERRITORY</span>' :
          getTerritoryGang(loc.id) ? `<span class="badge" style="background:rgba(180,50,255,0.2);color:var(--neon-purple);border:1px solid var(--neon-purple)">🏴 ${getTerritoryGang(loc.id).name}</span>` : ''}
        ${(() => {
          if (typeof getFactionAtLocation !== 'function' || typeof getFactionStanding !== 'function') return '';
          const locFactions = getFactionAtLocation(gameState, loc.id);
          if (locFactions.length === 0) return '<span class="badge" style="background:rgba(136,136,136,0.2);color:#888;border:1px solid #555">Neutral Zone</span>';
          const lf = locFactions[0];
          const ls = getFactionStanding(gameState, lf.faction.id);
          const lsVal = gameState.factions ? (gameState.factions.standings[lf.faction.id] || 0) : 0;
          let tradeTip = '';
          if (gameState.factions && gameState.factions.wars && gameState.factions.wars[lf.faction.id]) tradeTip = 'DANGER: +25% prices, ambush risk';
          else if (lsVal >= 50) tradeTip = '-10% buy prices';
          else if (lsVal <= -50) tradeTip = '+15% buy, ambush risk';
          else if (lsVal <= -15) tradeTip = '+8% buy, 5% ambush';
          return tradeTip ? `<span class="badge" style="background:rgba(255,136,0,0.15);color:${ls.color};border:1px solid ${ls.color};font-size:0.6rem">${ls.emoji} ${ls.label}: ${tradeTip}</span>` : '';
        })()}
      </div>
      ${(() => {
        // Show player assets at this location
        var assets = [];
        var locId = loc.id;
        // Businesses here
        if (gameState.frontBusinesses) {
          var bizHere = gameState.frontBusinesses.filter(function(b) { return b.location === locId; });
          if (bizHere.length > 0) assets.push('🏢 ' + bizHere.length + ' business' + (bizHere.length > 1 ? 'es' : ''));
        }
        // Crew assigned here
        if (gameState.henchmen) {
          var crewHere = gameState.henchmen.filter(function(h) { return h.assignedTo === 'territory_guard' && !h.injured; }).length;
          if (crewHere > 0 && isTerritory(gameState, locId)) assets.push('👥 ' + crewHere + ' guard' + (crewHere > 1 ? 's' : ''));
        }
        // Stash here
        if (gameState.stashes && gameState.stashes[locId]) {
          var stashCount = 0;
          for (var sid in gameState.stashes[locId]) stashCount += gameState.stashes[locId][sid] || 0;
          if (stashCount > 0) assets.push('📦 ' + stashCount + ' units stashed');
        }
        // Properties here
        if (gameState.properties) {
          var propsHere = Object.values(gameState.properties).filter(function(p) { return p.locationId === locId; }).length;
          if (propsHere > 0) assets.push('🏠 ' + propsHere + ' propert' + (propsHere > 1 ? 'ies' : 'y'));
        }
        // Distribution network
        if (gameState.distribution && gameState.distribution[locId] && gameState.distribution[locId].active) {
          var dealers = gameState.distribution[locId].dealers ? gameState.distribution[locId].dealers.length : 0;
          assets.push('💊 ' + dealers + ' dealer' + (dealers > 1 ? 's' : '') + ' active');
        }
        // Known prices freshness
        if (gameState.knownPrices && gameState.knownPrices[locId]) {
          var pAge = (gameState.day || 1) - (gameState.knownPrices[locId]._day || 0);
          if (pAge === 0) assets.push('📊 Prices: current');
          else if (pAge <= 3) assets.push('📊 Prices: ' + pAge + 'd old');
        }
        // Market reputation
        var trades = gameState.locationTrades ? (gameState.locationTrades[locId] || 0) : 0;
        if (trades >= 20) assets.push('⭐ Regular (8% discount)');
        else if (trades >= 5) assets.push('⭐ Known (3% discount)');
        if (assets.length === 0) return '';
        return '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem;font-size:0.7rem;">' +
          assets.map(function(a) { return '<span style="background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);padding:1px 6px;border-radius:3px;color:var(--neon-green)">' + a + '</span>'; }).join('') +
        '</div>';
      })()}
    </div>
  `;

  // Price events — clickable to read news story
  let eventsHtml = '';
  if (gameState.priceEvents.length > 0) {
    eventsHtml = '<div class="price-events">' + gameState.priceEvents.map((e, idx) =>
      `<div class="event-alert${e.newsStory ? ' event-clickable' : ''}" ${e.newsStory ? `onclick="showNewsStory(${idx})" title="Click to read full story"` : ''}>${e.msg}${e.newsStory ? ' <span style="font-size:0.7rem;opacity:0.6">📰 TAP TO READ</span>' : ''}</div>`
    ).join('') + '</div>';
  }

  // Message log
  let msgHtml = '';
  if (gameState.messageLog.length > 0) {
    msgHtml = '<div class="message-log">' + gameState.messageLog.map(m => `<div class="log-msg">${m}</div>`).join('') + '</div>';
    gameState.messageLog = [];
  }

  // Build drug data used by multiple tabs
  const playerLevel = typeof getKingpinLevel === 'function' ? getKingpinLevel(gameState.xp || 0).level : 1;
  const isOwnTerritory = isTerritory(gameState, gameState.currentLocation);

  function buildDrugRow(drug, showActions) {
    const price = gameState.prices[drug.id] != null ? gameState.prices[drug.id] : null;
    const owned = gameState.inventory[drug.id] || 0;
    const drugLocked = drug.minLevel && playerLevel < drug.minLevel;
    const supplyIndicator = (typeof getMarketCondition === 'function' && price !== null) ?
      (() => { const cond = getMarketCondition(gameState, drug.id, gameState.currentLocation);
        return cond.label !== 'STABLE' ? `<span style="font-size:0.55rem;margin-left:0.3rem;color:${cond.color}">${cond.label}</span>` : '';
      })() : '';
    const priceDisplay = price === null ? '<span class="unavailable">—</span>' :
      `$${price.toLocaleString()}${isOwnTerritory ? ' <span class="neon-purple" style="font-size:0.7rem">🏴</span>' : ''}${supplyIndicator}`;
    const hasEvent = gameState.priceEvents.find(e => e.drugId === drug.id);
    const rowClass = hasEvent ? (hasEvent.effect === 'spike' ? 'row-spike' : 'row-crash') : '';
    let spark = '';
    if (gameState.priceHistory && gameState.priceHistory[drug.id]) {
      const hist = gameState.priceHistory[drug.id].slice(-8);
      if (hist.length >= 2) {
        const prices = hist.map(h => h.price);
        const min = Math.min(...prices); const max = Math.max(...prices);
        const r = max - min || 1; const w = 50, h = 16;
        const step = w / (prices.length - 1);
        let d = prices.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * step},${h - ((p - min) / r) * (h - 2) - 1}`).join('');
        const color = prices[prices.length - 1] >= prices[prices.length - 2] ? 'var(--neon-green)' : 'var(--neon-red)';
        spark = `<svg viewBox="0 0 ${w} ${h}" class="sparkline"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"/></svg>`;
      }
    }
    const actionCell = showActions ?
      (drugLocked ? `<span style="color:#666;font-size:0.7rem">🔒 Lvl ${drug.minLevel}</span>` :
        (price !== null ? `<button class="btn btn-sm btn-buy" onclick="openTrade('${drug.id}', 'buy')">BUY</button>` : '') +
        (owned > 0 ? ` <button class="btn btn-sm btn-sell" onclick="openTrade('${drug.id}', 'sell')">SELL</button>` : '') +
        (price === null && owned <= 0 ? `<span style="color:#555;font-size:0.65rem">No supply</span>` : '')) +
      (drugLocked && owned > 0 ? `<button class="btn btn-sm btn-sell" onclick="openTrade('${drug.id}', 'sell')">SELL</button>` : '') : '';
    // Up/down arrow from previous price and P&L indicator
    let trendArrow = '';
    if (gameState.priceHistory && gameState.priceHistory[drug.id] && price !== null) {
      const hist = gameState.priceHistory[drug.id];
      if (hist.length >= 2) {
        const prevPrice = hist[hist.length - 2].price;
        const diff = price - prevPrice;
        const pctChange = prevPrice > 0 ? ((diff / prevPrice) * 100).toFixed(1) : '0.0';
        if (diff > 0) trendArrow = `<span style="color:var(--neon-green);font-size:0.7rem;font-weight:bold">▲ +${pctChange}%</span>`;
        else if (diff < 0) trendArrow = `<span style="color:var(--neon-red);font-size:0.7rem;font-weight:bold">▼ ${pctChange}%</span>`;
        else trendArrow = `<span style="color:var(--text-dim);font-size:0.7rem">● 0%</span>`;
      }
    }
    // Show P&L for owned drugs
    let pnlCell = '';
    if (owned > 0 && price !== null) {
      const ledger = gameState.stats && gameState.stats.drugLedger && gameState.stats.drugLedger[drug.id];
      const avgCost = ledger ? (ledger.avgCost || 0) : 0;
      if (avgCost > 0) {
        const pnl = (price - avgCost) * owned;
        const pnlPct = ((price - avgCost) / avgCost * 100).toFixed(1);
        pnlCell = pnl >= 0
          ? `<span style="color:var(--neon-green);font-size:0.7rem">▲ +$${Math.round(pnl).toLocaleString()} (${pnlPct}%)</span>`
          : `<span style="color:var(--neon-red);font-size:0.7rem">▼ -$${Math.abs(Math.round(pnl)).toLocaleString()} (${pnlPct}%)</span>`;
      }
    }
    return `<tr class="${rowClass}"><td>${drug.emoji} ${drug.name}</td><td class="price-cell">${priceDisplay} ${trendArrow}</td><td class="spark-cell">${spark}</td><td class="owned-cell">${owned > 0 ? owned : '-'}${pnlCell ? '<br>' + pnlCell : ''}</td>${showActions ? `<td class="action-cell">${actionCell}</td>` : ''}</tr>`;
  }

  // Tab bar for main content
  // Progressive unlock gates for main tab bar
  const _tabUf = typeof getUnlockedFeatures === 'function' ? getUnlockedFeatures(gameState) : {};
  const _tabLocked = (emoji, label, featureKey) => {
    const tip = typeof getUnlockRequirement === 'function' ? getUnlockRequirement(featureKey) : 'Locked';
    return `<button class="main-tab-btn tab-locked" data-lock-tooltip="${tip}" onclick="showNotification('${tip}', 'info'); return false;">🔒 ${label}</button>`;
  };

  const mainTabBar = `
    <div class="main-tab-bar" style="display:flex;gap:0;margin-bottom:0.5rem;border-bottom:2px solid var(--border-color);flex-wrap:wrap;">
      <button class="main-tab-btn${mainTab === 'portfolio' ? ' active' : ''}" onclick="mainTab='portfolio'; render();">💼 Portfolio</button>
      <button class="main-tab-btn${mainTab === 'buysell' ? ' active' : ''}" onclick="mainTab='buysell'; render();">💰 Buy / Sell</button>
      <button class="main-tab-btn${mainTab === 'prices' ? ' active' : ''}" onclick="mainTab='prices'; render();">💊 Street Prices</button>
      <button class="main-tab-btn${mainTab === 'intel' ? ' active' : ''}" onclick="mainTab='intel'; render();">🗺️ Price Intel</button>
      <button class="main-tab-btn${mainTab === 'empire' ? ' active' : ''}" onclick="mainTab='empire'; render();">👑 Empire</button>
      ${_tabUf.futures ? `<button class="main-tab-btn${mainTab === 'futures_tab' ? ' active' : ''}" onclick="currentScreen='futures'; render();">📊 Futures</button>` : _tabLocked('📊', 'Futures', 'futures')}
      ${_tabUf.imports ? `<button class="main-tab-btn${mainTab === 'imports_tab' ? ' active' : ''}" onclick="currentScreen='imports'; render();">🌍 Import</button>` : _tabLocked('🌍', 'Import', 'imports')}
      ${_tabUf.shipping ? `<button class="main-tab-btn${mainTab === 'shipping_tab' ? ' active' : ''}" onclick="currentScreen='shipping'; render();">🚛 Ship</button>` : _tabLocked('🚛', 'Ship', 'shipping')}
    </div>
  `;

  // Trade modal (shown inline on buy/sell tab)
  let tradeModal = '';
  if (selectedDrug && tradeMode && mainTab === 'buysell') {
    tradeModal = renderTradeModal();
  }

  // === PORTFOLIO TAB ===
  let mainContent = '';
  if (mainTab === 'portfolio') {
    // Net worth calculation
    const invItems = Object.entries(gameState.inventory).filter(([, v]) => v > 0);
    const inventoryValue = invItems.reduce((sum, [id, amt]) => sum + (gameState.prices[id] || 0) * amt, 0);
    const propertyCount = typeof getTotalPropertyCount === 'function' ? getTotalPropertyCount(gameState) : 0;
    const territories = getControlledTerritories(gameState).length;
    const fronts = (gameState.frontBusinesses || []).length;
    const crewCount = gameState.henchmen.length;
    const weaponList = gameState.weapons.map(wId => WEAPONS.find(w => w.id === wId)).filter(Boolean);
    const weaponValue = weaponList.reduce((sum, w) => sum + w.price, 0);
    const netWorth = gameState.cash + gameState.bank + inventoryValue + weaponValue - gameState.debt;
    const dailyIncome = (typeof processTerritoryIncome === 'function' ? (() => { const t = Object.keys(gameState.territory || {}).length; return t * 200; })() : 0)
      + (typeof processFrontBusinessIncome === 'function' ? (gameState.frontBusinesses || []).reduce((s, f) => s + (f.dailyRevenue || 0), 0) : 0);

    // Holdings table
    const holdingsRows = invItems.map(([id, amt]) => {
      const drug = DRUGS.find(d => d.id === id);
      const price = gameState.prices[id] || 0;
      const value = price * amt;
      const avgCost = gameState.stats && gameState.stats.drugLedger && gameState.stats.drugLedger[id] ? gameState.stats.drugLedger[id].avgCost || 0 : 0;
      const pnl = avgCost > 0 ? (price - avgCost) * amt : 0;
      const pnlPct = avgCost > 0 ? ((price - avgCost) / avgCost * 100).toFixed(1) : '—';
      return `<tr>
        <td>${drug.emoji} ${drug.name}</td>
        <td class="owned-cell">${amt.toLocaleString()}</td>
        <td class="price-cell">$${price.toLocaleString()}</td>
        <td class="price-cell neon-green">$${value.toLocaleString()}</td>
        <td class="price-cell ${pnl >= 0 ? 'neon-green' : 'neon-red'}">${pnl !== 0 ? (pnl > 0 ? '+' : '') + '$' + Math.round(pnl).toLocaleString() + ' (' + pnlPct + '%)' : '—'}</td>
      </tr>`;
    }).join('');

    mainContent = `
      <div class="stats-overview" style="margin-bottom:0.8rem;">
        <div class="stat-card"><div class="stat-card-label">Net Worth</div><div class="stat-card-value ${netWorth >= 0 ? 'neon-green' : 'neon-red'}">$${netWorth.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-card-label">Cash</div><div class="stat-card-value neon-green">$${gameState.cash.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-card-label">Bank</div><div class="stat-card-value neon-cyan">$${gameState.bank.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-card-label">Inventory Value</div><div class="stat-card-value neon-yellow">$${inventoryValue.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-card-label">Debt</div><div class="stat-card-value ${gameState.debt > 0 ? 'neon-red' : 'neon-green'}">$${gameState.debt.toLocaleString()}</div></div>
      </div>

      ${invItems.length > 0 ? `
        <div class="market-section">
          <h3 class="section-title">📦 HOLDINGS</h3>
          <table class="data-table drug-table">
            <thead><tr><th>Drug</th><th>Qty</th><th>Price</th><th>Value</th><th>P&L</th></tr></thead>
            <tbody>${holdingsRows}</tbody>
          </table>
        </div>
      ` : '<div style="color:var(--text-dim);text-align:center;padding:1rem;border:1px dashed var(--border-color);border-radius:8px;margin-bottom:0.8rem;">No drug holdings. Go to Buy/Sell to start dealing.</div>'}

      <div class="stats-overview" style="margin-bottom:0.5rem;">
        <div class="stat-card"><div class="stat-card-label">🏴 Territories</div><div class="stat-card-value neon-purple">${territories}</div></div>
        <div class="stat-card"><div class="stat-card-label">🏢 Fronts</div><div class="stat-card-value">${fronts}</div></div>
        <div class="stat-card"><div class="stat-card-label">🏠 Properties</div><div class="stat-card-value">${propertyCount}</div></div>
        <div class="stat-card"><div class="stat-card-label">👥 Crew</div><div class="stat-card-value">${crewCount}</div></div>
        <div class="stat-card"><div class="stat-card-label">🔫 Weapons</div><div class="stat-card-value">${weaponList.length}</div></div>
      </div>
      <div class="inv-sub" style="margin-top:0.3rem;">
        <strong>Armed:</strong> ${weaponList.length > 0 ? weaponList.map(w => w.name).join(', ') : 'Bare Fists'}
        ${crewCount > 0 ? `<br><strong>Crew:</strong> ${gameState.henchmen.map(h => { const type = HENCHMEN_TYPES.find(t => t.id === h.type); return h.name + ' (' + type.name + ')'; }).join(', ')}` : ''}
        ${gameState.items && gameState.items.length > 0 ? `<br><strong>Items:</strong> ${[...new Set(gameState.items)].map(id => { const count = gameState.items.filter(i => i === id).length; return id.replace(/_/g, ' ') + (count > 1 ? ' x' + count : ''); }).join(', ')}` : ''}
      </div>
      ${territories > 0 && gameState.turfWars ? `
        <div style="margin-top:0.6rem;padding:0.5rem;background:rgba(150,50,255,0.06);border:1px solid rgba(150,50,255,0.2);border-radius:6px;">
          <h4 style="color:var(--neon-purple);font-size:0.8rem;margin-bottom:0.3rem;">⚔️ TURF WARS</h4>
          <div style="display:flex;gap:1rem;font-size:0.75rem;margin-bottom:0.3rem;">
            <span>Defended: <span class="neon-green">${gameState.turfWars.totalDefended || 0}</span></span>
            <span>Lost: <span class="neon-red">${gameState.turfWars.totalLost || 0}</span></span>
          </div>
          ${(gameState.turfWars.warHistory || []).length > 0 ? '<div style="font-size:0.7rem;color:var(--text-dim);">' +
            (gameState.turfWars.warHistory || []).slice(-5).reverse().map(w => {
              const loc = LOCATIONS.find(l => l.id === w.territory);
              const wt = TURF_WAR_CONFIG.warTypes.find(t => t.id === w.warType);
              return '<div style="margin-bottom:0.15rem;">' + (wt ? wt.emoji : '⚔️') + ' Day ' + w.day + ': ' + (loc ? loc.name : w.territory) + ' — ' + (w.result === 'defended' ? '<span class="neon-green">Defended</span>' : '<span class="neon-red">Lost</span>') + '</div>';
            }).join('') + '</div>' : '<div style="font-size:0.7rem;color:var(--text-dim);">No wars yet. Rival gangs may attack your territories.</div>'}
        </div>
      ` : ''}
    `;
  }

  // === BUY / SELL TAB ===
  if (mainTab === 'buysell') {
    const buySellRows = DRUGS.map(drug => buildDrugRow(drug, true)).join('');
    const chartsHtml = showChart ? renderAllCharts() : '';
    mainContent = `
      ${tradeModal}
      <div class="market-section">
        <h3 class="section-title">💰 BUY / SELL <button class="btn btn-sm ${showChart ? 'btn-sell' : 'btn-secondary'}" onclick="showChart=!showChart; render();" style="margin-left:1rem;">📈 ${showChart ? 'HIDE' : 'SHOW'} CHARTS</button></h3>
        <table class="data-table drug-table">
          <thead><tr><th>Drug</th><th>Price</th><th>Trend</th><th>Owned</th><th>Action</th></tr></thead>
          <tbody>${buySellRows}</tbody>
        </table>
      </div>
      ${chartsHtml}
      <div class="inventory-section" style="margin-top:0.5rem;">
        <div style="font-size:0.75rem;color:var(--text-dim);">Space: ${getInventoryCount(gameState)}/${getMaxInventory(gameState)} | Cash: $${gameState.cash.toLocaleString()}</div>
      </div>
    `;
  }

  // === STREET PRICES TAB ===
  if (mainTab === 'prices') {
    const priceRows = DRUGS.map(drug => buildDrugRow(drug, false)).join('');
    const chartsHtml = showChart ? renderAllCharts() : '';
    mainContent = `
      <div class="market-section">
        <h3 class="section-title">💊 STREET PRICES <button class="btn btn-sm ${showChart ? 'btn-sell' : 'btn-secondary'}" onclick="showChart=!showChart; render();" style="margin-left:1rem;">📈 ${showChart ? 'HIDE' : 'SHOW'} CHARTS</button></h3>
        <table class="data-table drug-table">
          <thead><tr><th>Drug</th><th>Price</th><th>Trend</th><th>Owned</th></tr></thead>
          <tbody>${priceRows}</tbody>
        </table>
      </div>
      ${chartsHtml}
    `;
  }

  // === PRICE INTEL TAB ===
  if (mainTab === 'intel') {
    const knownPrices = gameState.knownPrices || {};
    const locationIds = Object.keys(knownPrices).filter(id => id !== gameState.currentLocation);
    const locTrades = gameState.locationTrades || {};

    // Market reputation summary for current location
    const curLocTrades = locTrades[gameState.currentLocation] || 0;
    let repTier = 'Stranger';
    let repColor = '#888';
    let repBonus = '0%';
    if (curLocTrades >= 20) { repTier = 'Trusted Regular'; repColor = 'var(--neon-green)'; repBonus = '8%'; }
    else if (curLocTrades >= 5) { repTier = 'Known Dealer'; repColor = 'var(--neon-yellow)'; repBonus = '3%'; }
    const curLoc = LOCATIONS.find(l => l.id === gameState.currentLocation);

    let intelRows = '';
    if (locationIds.length === 0) {
      intelRows = '<tr><td colspan="4" style="color:#888;text-align:center;padding:1.5rem;">No price intel yet. Travel to other locations to learn their prices.</td></tr>';
    } else {
      // Sort by most recently visited
      locationIds.sort((a, b) => (knownPrices[b]._day || 0) - (knownPrices[a]._day || 0));
      for (const locId of locationIds) {
        const loc = LOCATIONS.find(l => l.id === locId);
        if (!loc) continue;
        const data = knownPrices[locId];
        const dayAge = gameState.day - (data._day || 0);
        const freshness = dayAge === 0 ? '<span style="color:var(--neon-green)">Today</span>' :
          dayAge <= 3 ? '<span style="color:var(--neon-yellow)">' + dayAge + 'd ago</span>' :
          dayAge <= 7 ? '<span style="color:var(--neon-orange,#ff8844)">' + dayAge + 'd ago</span>' :
          '<span style="color:var(--neon-red)">' + dayAge + 'd ago (stale)</span>';
        // Market rep for that location
        const lt = locTrades[locId] || 0;
        const locRep = lt >= 20 ? '⭐⭐ Trusted' : lt >= 5 ? '⭐ Known' : 'New';
        // Find best buy/sell opportunities by comparing with current prices
        let opportunities = [];
        for (const drugId in data) {
          if (drugId === '_day') continue;
          const theirPrice = data[drugId];
          const ourPrice = gameState.prices[drugId];
          if (theirPrice && ourPrice) {
            const diff = ourPrice - theirPrice;
            const pctDiff = ((diff / theirPrice) * 100).toFixed(0);
            if (diff > 0) {
              // Their price was cheaper - buy there sell here
              opportunities.push({ type: 'buy', drugId, diff, pctDiff: Math.abs(pctDiff), theirPrice, ourPrice });
            } else if (diff < 0) {
              // Our price is cheaper - buy here sell there
              opportunities.push({ type: 'sell', drugId, diff: Math.abs(diff), pctDiff: Math.abs(pctDiff), theirPrice, ourPrice });
            }
          }
        }
        opportunities.sort((a, b) => b.pctDiff - a.pctDiff);
        const topOps = opportunities.slice(0, 3).map(op => {
          const drug = DRUGS.find(d => d.id === op.drugId);
          const name = drug ? drug.emoji + ' ' + drug.name : op.drugId;
          if (op.type === 'buy') {
            return '<span style="color:var(--neon-green);font-size:0.7rem">' + name + ' cheaper there ($' + op.theirPrice.toLocaleString() + ' vs $' + op.ourPrice.toLocaleString() + ', +' + op.pctDiff + '% margin)</span>';
          } else {
            return '<span style="color:var(--neon-cyan);font-size:0.7rem">' + name + ' cheaper here ($' + op.ourPrice.toLocaleString() + ' vs $' + op.theirPrice.toLocaleString() + ', +' + op.pctDiff + '% margin)</span>';
          }
        }).join('<br>');
        intelRows += '<tr><td style="font-weight:bold;">' + (loc.emoji || '') + ' ' + loc.name + '</td><td>' + freshness + '</td><td>' + locRep + '</td><td>' + (topOps || '<span style="color:#666;font-size:0.7rem">No opportunities</span>') + '</td></tr>';
      }
    }

    mainContent = `
      <div class="market-section" style="margin-bottom:0.8rem;">
        <h3 class="section-title">🏪 MARKET REPUTATION — ${curLoc ? curLoc.name : 'Here'}</h3>
        <div style="display:flex;gap:1rem;align-items:center;padding:0.5rem;background:rgba(0,255,255,0.03);border:1px solid var(--border-color);border-radius:6px;">
          <div><span style="color:${repColor};font-weight:bold;font-size:1rem;">${repTier}</span></div>
          <div style="font-size:0.75rem;color:var(--text-dim);">Trades here: <strong>${curLocTrades}</strong></div>
          <div style="font-size:0.75rem;color:var(--text-dim);">Price bonus: <strong style="color:var(--neon-green);">${repBonus}</strong></div>
          <div style="font-size:0.7rem;color:var(--text-dim);">
            ${curLocTrades < 5 ? 'Need ' + (5 - curLocTrades) + ' more trades for 3% bonus' :
              curLocTrades < 20 ? 'Need ' + (20 - curLocTrades) + ' more trades for 8% bonus' : 'Max reputation reached!'}
          </div>
        </div>
        <div style="font-size:0.7rem;color:var(--text-dim);margin-top:0.3rem;padding:0.3rem;">
          Bulk trades (10+ units) get an extra 5% discount/premium on top of reputation bonuses.
        </div>
      </div>
      <div class="market-section">
        <h3 class="section-title">🗺️ PRICE INTEL — REMEMBERED PRICES</h3>
        <p style="font-size:0.7rem;color:var(--text-dim);margin-bottom:0.5rem;">Prices from locations you've visited. Older data may be inaccurate. Trade routes with the best margins are highlighted.</p>
        <table class="data-table drug-table">
          <thead><tr><th>Location</th><th>Last Visit</th><th>Rep</th><th>Best Opportunities</th></tr></thead>
          <tbody>${intelRows}</tbody>
        </table>
      </div>
    `;
  }

  // === EMPIRE OVERVIEW TAB ===
  if (mainTab === 'empire') {
    var territories = typeof getControlledTerritories === 'function' ? getControlledTerritories(gameState) : [];
    var crewCount = gameState.henchmen ? gameState.henchmen.length : 0;
    var maxCrew = typeof getMaxCrewSize === 'function' ? getMaxCrewSize(gameState) : 4;
    var bizCount = gameState.frontBusinesses ? gameState.frontBusinesses.length : 0;
    var vehicleCount = gameState.vehicleState && gameState.vehicleState.garage ? gameState.vehicleState.garage.length : 0;
    var nw = typeof calculateNetWorth === 'function' ? calculateNetWorth(gameState) : (gameState.cash + gameState.bank - gameState.debt);
    var kingpin = typeof getKingpinLevel === 'function' ? getKingpinLevel(gameState.xp || 0) : { level: 1, title: 'Nobody', emoji: '🔰' };
    var childCount = gameState.relationships && gameState.relationships.children ? gameState.relationships.children.length : 0;
    var scarCount = gameState.scars ? gameState.scars.length : 0;
    var traitCount = gameState.playerTraits ? Object.keys(gameState.playerTraits).length : 0;
    var abilityCount = gameState.playerAbilities ? Object.keys(gameState.playerAbilities).length : 0;
    var totalKills = gameState.peopleKilled || 0;
    var daysPlayed = gameState.day || 1;
    var dirtyPct = gameState.cash > 0 ? Math.round((gameState.dirtyMoney || 0) / gameState.cash * 100) : 0;

    // Crew by job
    var jobCounts = {};
    if (gameState.henchmen) {
      gameState.henchmen.forEach(function(h) {
        var job = h.assignedTo || 'idle';
        jobCounts[job] = (jobCounts[job] || 0) + 1;
      });
    }

    // Territory names
    var terrNames = territories.map(function(t) {
      var l = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(function(loc) { return loc.id === t; }) : null;
      return l ? l.name : t.replace(/_/g, ' ');
    });

    // Active operations
    var opsCount = gameState.mafiaOps && gameState.mafiaOps.activeOperations ? (Array.isArray(gameState.mafiaOps.activeOperations) ? gameState.mafiaOps.activeOperations.length : Object.keys(gameState.mafiaOps.activeOperations).length) : 0;

    mainContent = `
      <div style="text-align:center;margin-bottom:1rem;">
        <div style="font-size:2rem;">${kingpin.emoji}</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;color:var(--neon-cyan);font-weight:bold">${kingpin.title}</div>
        <div style="color:var(--text-dim);font-size:0.8rem">Level ${kingpin.level} · Day ${daysPlayed} · Net Worth: <span class="${nw >= 0 ? 'neon-green' : 'neon-red'}">$${nw.toLocaleString()}</span></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.5rem;margin-bottom:1rem;">
        <div style="text-align:center;padding:0.5rem;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.15);border-radius:6px">
          <div style="font-size:1.5rem">💰</div>
          <div style="font-size:0.7rem;color:#888">CASH</div>
          <div class="neon-green" style="font-weight:bold">$${gameState.cash.toLocaleString()}</div>
          ${dirtyPct > 10 ? '<div style="font-size:0.6rem;color:var(--neon-red)">' + dirtyPct + '% dirty</div>' : ''}
        </div>
        <div style="text-align:center;padding:0.5rem;background:rgba(0,200,255,0.05);border:1px solid rgba(0,200,255,0.15);border-radius:6px">
          <div style="font-size:1.5rem">🏦</div>
          <div style="font-size:0.7rem;color:#888">BANK</div>
          <div class="neon-cyan" style="font-weight:bold">$${gameState.bank.toLocaleString()}</div>
        </div>
        <div style="text-align:center;padding:0.5rem;background:rgba(255,0,100,0.05);border:1px solid rgba(255,0,100,0.15);border-radius:6px">
          <div style="font-size:1.5rem">🏴</div>
          <div style="font-size:0.7rem;color:#888">TERRITORY</div>
          <div class="neon-purple" style="font-weight:bold">${territories.length} district${territories.length !== 1 ? 's' : ''}</div>
        </div>
        <div style="text-align:center;padding:0.5rem;background:rgba(255,170,0,0.05);border:1px solid rgba(255,170,0,0.15);border-radius:6px">
          <div style="font-size:1.5rem">👥</div>
          <div style="font-size:0.7rem;color:#888">CREW</div>
          <div class="neon-yellow" style="font-weight:bold">${crewCount}/${maxCrew}</div>
        </div>
        <div style="text-align:center;padding:0.5rem;background:rgba(0,255,200,0.05);border:1px solid rgba(0,255,200,0.15);border-radius:6px">
          <div style="font-size:1.5rem">🏢</div>
          <div style="font-size:0.7rem;color:#888">BUSINESSES</div>
          <div style="font-weight:bold;color:#00ffcc">${bizCount}</div>
        </div>
        <div style="text-align:center;padding:0.5rem;background:rgba(255,100,0,0.05);border:1px solid rgba(255,100,0,0.15);border-radius:6px">
          <div style="font-size:1.5rem">🚗</div>
          <div style="font-size:0.7rem;color:#888">VEHICLES</div>
          <div style="font-weight:bold;color:#ff8844">${vehicleCount}</div>
        </div>
      </div>

      ${territories.length > 0 ? '<div style="margin-bottom:0.8rem;padding:0.4rem;background:rgba(180,0,255,0.05);border:1px solid rgba(180,0,255,0.15);border-radius:6px"><span style="color:var(--neon-purple);font-weight:bold;font-size:0.8rem">🏴 Your Territory:</span> <span style="font-size:0.75rem;color:var(--text-dim)">' + terrNames.join(', ') + '</span></div>' : ''}

      ${crewCount > 0 ? '<div style="margin-bottom:0.8rem;padding:0.4rem;background:rgba(255,170,0,0.05);border:1px solid rgba(255,170,0,0.15);border-radius:6px"><span style="color:var(--neon-yellow);font-weight:bold;font-size:0.8rem">👥 Crew Operations:</span> <span style="font-size:0.7rem;color:var(--text-dim)">' + Object.entries(jobCounts).map(function(e) { return e[0].replace(/_/g,' ') + ': ' + e[1]; }).join(' · ') + '</span></div>' : ''}

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:0.4rem;font-size:0.75rem;">
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">☠️ Kills: <b>${totalKills}</b></div>
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">🩹 Scars: <b>${scarCount}</b></div>
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">👶 Children: <b>${childCount}</b></div>
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">🧬 Traits: <b>${traitCount}</b></div>
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">⚡ Abilities: <b>${abilityCount}</b></div>
        <div style="padding:0.3rem;background:rgba(255,255,255,0.02);border-radius:4px">🏢 Operations: <b>${opsCount}</b></div>
      </div>

      <div style="text-align:center;margin-top:1rem;">
        <button class="btn btn-secondary" onclick="currentScreen='stats'; render();">📊 Detailed Stats</button>
      </div>
    `;
  }

  // Sidebar action buttons
  const mainMissionCount = gameState.missions && gameState.missions.activeMainMission ? 1 : 0;
  const sideMissionCount = gameState.missions ? (gameState.missions.activeMissions || []).length : 0;
  const missionAlert = (gameState.missions && gameState.missions.pendingDilemma) ? ' ⚖️' : '';
  const totalMissions = mainMissionCount + sideMissionCount;

  // Progressive unlock gating
  const _uf = typeof getUnlockedFeatures === 'function' ? getUnlockedFeatures(gameState) : {};
  const _isUnlocked = (key) => _uf[key] !== false && _uf[key] !== undefined ? _uf[key] : true;
  const _lockedBtn = (emoji, label, featureKey) => renderLockedSidebarBtn(emoji, label, featureKey);

  const sidebar = `
    <div class="game-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">⚡ ACTIONS</div>
        <button class="btn btn-sidebar btn-primary btn-glow" onclick="currentScreen='travel'; render();">✈️ Travel</button>
        <button class="btn btn-sidebar btn-secondary" onclick="doWait()">⏳ Wait</button>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">🏪 SERVICES</div>
        ${loc.hasBank ? `<button class="btn btn-sidebar btn-secondary" onclick="openBank()">🏦 Bank</button>` : ''}
        ${loc.hasLoanShark ? `<button class="btn btn-sidebar btn-secondary" onclick="openLoanShark()">🦈 Loan Shark</button>` : ''}
        ${loc.hasHospital && gameState.health < gameState.maxHealth ? `<button class="btn btn-sidebar btn-secondary" onclick="doHospital()">🏥 Hospital</button>` : ''}
        ${loc.hasBlackMarket ? `<button class="btn btn-sidebar btn-secondary" onclick="currentScreen='blackmarket'; render();">🏴 Black Market</button>` : ''}
        ${_isUnlocked('stash') ? ((typeof getStashCapacity === 'function' && getStashCapacity(gameState, gameState.currentLocation) > 0) ? `<button class="btn btn-sidebar btn-secondary" onclick="currentScreen='stash'; render();">📦 Stash</button>` : (gameState.currentLocation === 'miami' ? `<button class="btn btn-sidebar btn-secondary" onclick="currentScreen='stash'; render();">📦 Stash</button>` : '')) : _lockedBtn('📦', 'Stash', 'stash')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">🎯 MISSIONS</div>
        <button class="btn btn-sidebar ${totalMissions > 0 ? 'btn-primary' : 'btn-secondary'}" style="border-color:#ff8844;color:#ff8844${totalMissions > 0 ? ';text-shadow:0 0 6px rgba(255,136,68,0.4)' : ''}" onclick="currentScreen='missions'; render();">📋 Missions${totalMissions > 0 ? ` (${totalMissions})` : ''}${missionAlert}</button>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">👑 EMPIRE</div>

        <div class="sidebar-group">
          <div class="sidebar-group-header" onclick="toggleSidebarGroup('money')">
            <span>${openSidebarGroups.money ? '▾' : '▸'} 💰 Money & Trade</span>
            ${(() => { let b = []; if (gameState.futures && (gameState.futures.contracts||[]).length > 0) b.push('📊'); if (gameState.importExport && gameState.importExport.activeShipments.length > 0) b.push('🌍'); return b.length ? '<span class="group-badge">' + b.join('') + '</span>' : ''; })()}
          </div>
          <div class="sidebar-group-content ${openSidebarGroups.money ? 'open' : ''}">
            ${_isUnlocked('fronts') ? (loc.hasBank ? `<button class="btn btn-sidebar btn-secondary" onclick="currentScreen='fronts'; render();">🏢 Fronts</button>` : '') : _lockedBtn('🏢', 'Fronts', 'fronts')}
            ${_isUnlocked('properties') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#bf5fff;color:#bf5fff" onclick="currentScreen='properties'; render();">🏠 Properties${typeof getTotalPropertyCount === 'function' && getTotalPropertyCount(gameState) > 0 ? ` (${getTotalPropertyCount(gameState)})` : ''}</button>` : _lockedBtn('🏠', 'Properties', 'properties')}
            ${_isUnlocked('businesses') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff9900;color:#ff9900" onclick="currentScreen='businesses_v2'; render();">🏢 Businesses${gameState.businesses && gameState.businesses.owned ? ' (' + gameState.businesses.owned.length + ')' : ''}</button>` : _lockedBtn('🏢', 'Businesses', 'businesses')}
            ${_isUnlocked('futures') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#00cc88;color:#00cc88" onclick="currentScreen='futures'; render();">📊 Futures${gameState.futures && (gameState.futures.contracts || []).length > 0 ? ` (${gameState.futures.contracts.length})` : ''}</button>` : _lockedBtn('📊', 'Futures', 'futures')}
            ${_isUnlocked('imports') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#4488ff;color:#4488ff" onclick="currentScreen='imports'; render();">🌍 Import/Export${gameState.importExport && gameState.importExport.activeShipments.length > 0 ? ` (${gameState.importExport.activeShipments.length})` : ''}</button>` : _lockedBtn('🌍', 'Import/Export', 'imports')}
          </div>
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-header" onclick="toggleSidebarGroup('crime')">
            <span>${openSidebarGroups.crime ? '▾' : '▸'} 🔫 Crime & Territory</span>
            ${(() => { let b = []; if (gameState.factions && Object.keys(gameState.factions.wars||{}).length > 0) b.push('⚔️'); if (gameState.bodies_state && gameState.bodies_state.bodies > 0) b.push('☠️'); if (gameState.heists && gameState.heists.activeHeist) b.push('🔥'); if (gameState.territoryDefense && gameState.territoryDefense.activeSieges && gameState.territoryDefense.activeSieges.length > 0) b.push('🏰'); return b.length ? '<span class="group-badge">' + b.join('') + '</span>' : ''; })()}
          </div>
          <div class="sidebar-group-content ${openSidebarGroups.crime ? 'open' : ''}">
            ${_isUnlocked('factions') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff4488;color:#ff4488" onclick="currentScreen='factions'; render();">⚔️ Factions${gameState.factions && Object.keys(gameState.factions.wars || {}).length > 0 ? ' ⚔️' : ''}</button>` : _lockedBtn('⚔️', 'Factions', 'factions')}
            ${_isUnlocked('rivals') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff4444;color:#ff4444" onclick="currentScreen='rivals'; render();">🏴 Rivals${gameState.rivalState && gameState.rivalState.rivals.filter(r => r.alive).length > 0 ? ` (${gameState.rivalState.rivals.filter(r => r.alive).length})` : ''}</button>` : _lockedBtn('🏴', 'Rivals', 'rivals')}
            ${_isUnlocked('defense') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#88ff44;color:#88ff44" onclick="currentScreen='defense'; render();">🏰 Defense${gameState.territoryDefense && gameState.territoryDefense.activeSieges && gameState.territoryDefense.activeSieges.length > 0 ? ' ⚔️' : ''}</button>` : _lockedBtn('🏰', 'Defense', 'defense')}
            ${_isUnlocked('bodies') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#cc3333;color:#cc3333" onclick="currentScreen='bodies'; render();">☠️ Bodies${gameState.bodies_state && gameState.bodies_state.bodies > 0 ? ' <span style="color:#ff0;font-weight:bold">(' + gameState.bodies_state.bodies + ')</span>' : ''}</button>` : _lockedBtn('☠️', 'Bodies', 'bodies')}
            ${_isUnlocked('mafiaOps') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff6600;color:#ff6600" onclick="currentScreen='operations'; render();">🏢 Operations${gameState.mafiaOps && gameState.mafiaOps.activeOperations ? ` (${typeof gameState.mafiaOps.activeOperations === 'object' && !Array.isArray(gameState.mafiaOps.activeOperations) ? Object.keys(gameState.mafiaOps.activeOperations).length : (Array.isArray(gameState.mafiaOps.activeOperations) ? gameState.mafiaOps.activeOperations.length : 0)})` : ''}</button>` : _lockedBtn('🏢', 'Operations', 'mafiaOps')}
            ${_isUnlocked('heists') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="currentScreen='heist'; render();">🎯 Heists${gameState.heists && gameState.heists.activeHeist ? ' 🔥' : ''}</button>` : _lockedBtn('🎯', 'Heists', 'heists')}
            ${_isUnlocked('territory') ? (!isTerritory(gameState, gameState.currentLocation) && getTerritoryGang(gameState.currentLocation) ? `<button class="btn btn-sidebar btn-secondary" style="border-color:var(--neon-purple)" onclick="doChallenge()">🏴 Take Over</button>` : '') : ''}
          </div>
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-header" onclick="toggleSidebarGroup('people')">
            <span>${openSidebarGroups.people ? '▾' : '▸'} 👥 People & Social</span>
            ${(() => { let b = []; if (gameState.phone && gameState.phone.unreadCount > 0) b.push('📱'); if ((gameState.lifestyle?.stress || 0) > 60) b.push('⚠️'); return b.length ? '<span class="group-badge">' + b.join('') + '</span>' : ''; })()}
          </div>
          <div class="sidebar-group-content ${openSidebarGroups.people ? 'open' : ''}">
            ${_isUnlocked('crew') ? (gameState.henchmen.length > 0 ? `<button class="btn btn-sidebar btn-secondary" onclick="currentScreen='crew'; render();">👥 Crew (${gameState.henchmen.length}/${typeof getMaxCrewSize === 'function' ? getMaxCrewSize(gameState) : 4})</button>` : '') : _lockedBtn('👥', 'Crew', 'crew')}
            ${_isUnlocked('romance') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff6699;color:#ff6699" onclick="currentScreen='romance'; render();">💕 Romance</button>` : _lockedBtn('💕', 'Romance', 'romance')}
            ${_isUnlocked('nightlife') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff44ff;color:#ff44ff" onclick="currentScreen='nightlife'; render();">🌙 Nightlife</button>` : _lockedBtn('🌙', 'Nightlife', 'nightlife')}
            <button class="btn btn-sidebar btn-secondary" style="border-color:#00aaff;color:#00aaff" onclick="currentScreen='phone'; render();">📱 Phone${gameState.phone && gameState.phone.unreadCount > 0 ? ' <span class="badge">' + gameState.phone.unreadCount + '</span>' : ''}</button>
            ${_isUnlocked('lifestyle') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="currentScreen='lifestyle'; render();">🏠 Lifestyle${(gameState.lifestyle?.stress || 0) > 60 ? ' ⚠️' : ''}</button>` : _lockedBtn('🏠', 'Lifestyle', 'lifestyle')}
          </div>
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-header" onclick="toggleSidebarGroup('infra')">
            <span>${openSidebarGroups.infra ? '▾' : '▸'} 🏗️ Infrastructure</span>
            ${(() => { let b = []; if (gameState.pendingRaid) b.push('🚨'); if (gameState.shipping && gameState.shipping.activeShipments.length > 0) b.push('🚛'); return b.length ? '<span class="group-badge">' + b.join('') + '</span>' : ''; })()}
          </div>
          <div class="sidebar-group-content ${openSidebarGroups.infra ? 'open' : ''}">
            ${_isUnlocked('safehouse') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#00aaff;color:#00aaff" onclick="currentScreen='safehouse'; render();">🏠 Safe House${gameState.safehouse && gameState.safehouse.current ? ' ✓' : ''}</button>` : _lockedBtn('🏠', 'Safe House', 'safehouse')}
            ${_isUnlocked('vehicles') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#00ccff;color:#00ccff" onclick="currentScreen='vehicles'; render();">🚗 Vehicles${gameState.vehicles && gameState.vehicles.garage ? ` (${gameState.vehicles.garage.length})` : ''}</button>` : _lockedBtn('🚗', 'Vehicles', 'vehicles')}
            ${_isUnlocked('shipping') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff8800;color:#ff8800" onclick="currentScreen='shipping'; render();">🚛 Shipping${gameState.shipping && gameState.shipping.activeShipments.length > 0 ? ` (${gameState.shipping.activeShipments.length})` : ''}</button>` : _lockedBtn('🚛', 'Shipping', 'shipping')}
            ${_isUnlocked('security') ? `<button class="btn btn-sidebar ${gameState.pendingRaid ? 'btn-primary' : 'btn-secondary'}" style="border-color:#ff6666;color:#ff6666${gameState.pendingRaid ? ';text-shadow:0 0 8px #ff0000;animation:pulse 1s infinite' : ''}" onclick="currentScreen='security'; render();">🛡️ Security${gameState.pendingRaid ? ' 🚨' : ''}</button>` : _lockedBtn('🛡️', 'Security', 'security')}
            ${_isUnlocked('politics') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#cc88ff;color:#cc88ff" onclick="currentScreen='politics'; render();">🏛️ Politics${gameState.politics && Object.keys(gameState.politics.corruptOfficials || {}).length > 0 ? ` (${Object.keys(gameState.politics.corruptOfficials).length})` : ''}</button>` : _lockedBtn('🏛️', 'Politics', 'politics')}
            ${_isUnlocked('distribution') ? (getControlledTerritories(gameState).length > 0 ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#ff9500;color:#ff9500" onclick="currentScreen='distribution'; render();">📡 Distribution</button>` : '') : _lockedBtn('📡', 'Distribution', 'distribution')}
            ${_isUnlocked('processing') ? (typeof getLabTier === 'function' && getLabTier(gameState, gameState.currentLocation) > 0 ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#00ffcc;color:#00ffcc" onclick="currentScreen='processing'; render();">⚗️ Lab${gameState.processing && gameState.processing.activeJobs.length > 0 ? ` (${gameState.processing.activeJobs.length})` : ''}</button>` : '') : _lockedBtn('⚗️', 'Lab', 'processing')}
          </div>
        </div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">📋 CAMPAIGN</div>
        <button class="btn btn-sidebar btn-secondary" style="border-color:#ffaa00;color:#ffaa00" onclick="currentScreen='campaign'; render();">🎯 Campaign${gameState.campaign ? ` (Act ${typeof gameState.campaign.currentAct === 'number' ? gameState.campaign.currentAct : String(gameState.campaign.currentAct).replace('act','')})` : ''}</button>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">🧬 CHARACTER</div>
        ${_isUnlocked('skills') ? `<button class="btn btn-sidebar btn-secondary" style="border-color:#00ff88;color:#00ff88" onclick="currentScreen='skilltree'; render();">🌳 Skills${(gameState.skillPoints || 0) > 0 ? ` <span style="color:#ff0;font-weight:bold">(${gameState.skillPoints})</span>` : ''}</button>` : _lockedBtn('🌳', 'Skills', 'skills')}
        <button class="btn btn-sidebar btn-secondary" onclick="currentScreen='stats'; render();">📊 Stats</button>
        <button class="btn btn-sidebar btn-secondary" onclick="currentScreen='achievements'; render();">🏆 Achievements</button>
      </div>
      <div class="sidebar-section sidebar-bottom">
        <button class="btn btn-sidebar btn-danger" onclick="if(confirm('End game early?')) { endGame(gameState); currentScreen='gameover'; render(); }">🏳️ Retire</button>
      </div>
    </div>
  `;

  // V6 encounter modal overlay
  var encounterModal = '';
  if (gameState.encounters && gameState.encounters.activeEncounter) {
    encounterModal = renderEncounterModal();
  }

  // Security alert popup
  var securityAlert = '';
  const heatCritical = gameState.heat > 80;
  const raidPending = !!gameState.pendingRaid;
  const investigationDanger = gameState.investigation && gameState.investigation.level >= 3;
  if ((raidPending || heatCritical || investigationDanger) && alertDismissedDay !== gameState.day) {
    const alerts = [];
    if (raidPending) alerts.push('<div class="security-alert-item"><span class="security-alert-icon">🚨</span><span class="security-alert-text">RAID INCOMING — Law enforcement is preparing to raid your operation!</span></div>');
    if (heatCritical) alerts.push('<div class="security-alert-item"><span class="security-alert-icon">🔥</span><span class="security-alert-text">HEAT CRITICAL (${gameState.heat}%) — You are drawing extreme attention!</span></div>');
    if (investigationDanger) alerts.push('<div class="security-alert-item"><span class="security-alert-icon">🔍</span><span class="security-alert-text">INVESTIGATION LEVEL HIGH — Federal agents are closing in!</span></div>');
    securityAlert = `
      <div class="security-alert-overlay">
        <div class="security-alert-card">
          <div class="security-alert-header">🚨 SECURITY WARNING 🚨</div>
          ${alerts.join('')}
          <div class="security-alert-actions">
            <button class="btn btn-primary" style="background:#ff4444;border-color:#ff0000;font-weight:bold;" onclick="currentScreen='security'; render();">🛡️ Go to Security</button>
            <button class="btn btn-secondary" onclick="alertDismissedDay=${gameState.day}; render();">Dismiss</button>
          </div>
        </div>
      </div>`;
  }

  // Notification ticker — shows all pending alerts at a glance
  const alerts = [];
  if (gameState.phone && gameState.phone.unreadCount > 0) alerts.push(`<span class="alert-ticker-item" onclick="currentScreen='phone'; render();" style="cursor:pointer">📱 ${gameState.phone.unreadCount} unread message${gameState.phone.unreadCount > 1 ? 's' : ''}</span>`);
  if (gameState.pendingRaid) alerts.push(`<span class="alert-ticker-item alert-urgent" onclick="currentScreen='security'; render();" style="cursor:pointer">🚨 RAID PENDING</span>`);
  if (gameState.heat > 70) alerts.push(`<span class="alert-ticker-item alert-urgent">🔥 Heat: ${gameState.heat}%</span>`);
  if (gameState.bodies_state && gameState.bodies_state.bodies > 0) alerts.push(`<span class="alert-ticker-item" onclick="currentScreen='bodies'; render();" style="cursor:pointer">☠️ ${gameState.bodies_state.bodies} undisposed bodies</span>`);
  if (gameState.heists && gameState.heists.activeHeist) alerts.push(`<span class="alert-ticker-item" onclick="currentScreen='heist'; render();" style="cursor:pointer">🎯 Heist in progress</span>`);
  if (gameState.territoryDefense && gameState.territoryDefense.activeSieges && gameState.territoryDefense.activeSieges.length > 0) alerts.push(`<span class="alert-ticker-item alert-urgent" onclick="currentScreen='defense'; render();" style="cursor:pointer">🏰 Territory under siege!</span>`);
  if ((gameState.skillPoints || 0) > 0) alerts.push(`<span class="alert-ticker-item" onclick="currentScreen='skilltree'; render();" style="cursor:pointer">🌳 ${gameState.skillPoints} skill point${gameState.skillPoints > 1 ? 's' : ''} available</span>`);
  if (gameState.factions && Object.keys(gameState.factions.wars || {}).length > 0) alerts.push(`<span class="alert-ticker-item alert-urgent" onclick="currentScreen='factions'; render();" style="cursor:pointer">⚔️ Active faction wars</span>`);
  const notificationTicker = alerts.length > 0 ? `<div class="notification-ticker">${alerts.join('')}</div>` : '';

  const tutorialOverlay = (typeof renderTutorialOverlay === 'function') ? renderTutorialOverlay() : '';

  return `
    <div class="game-screen">
      ${renderToolbar()}
      ${statusBar}
      ${notificationTicker}
      ${securityAlert}
      ${encounterModal}
      ${tutorialOverlay}
      <div class="game-layout">
        ${sidebar}
        <div class="game-main">
          ${locationInfo}
          ${eventsHtml}
          ${msgHtml}
          ${mainTabBar}
          ${mainContent}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// TRADE MODAL
// ============================================================
function renderTradeModal() {
  const drug = DRUGS.find(d => d.id === selectedDrug);
  const price = gameState.prices[selectedDrug] || 0;
  const owned = gameState.inventory[selectedDrug] || 0;

  if (!drug || (price <= 0 && tradeMode === 'buy')) {
    closeTrade();
    return '';
  }

  let maxAmount;
  if (tradeMode === 'buy') {
    const maxAfford = price > 0 ? Math.floor(gameState.cash / price) : 0;
    const maxSpace = getFreeSpace(gameState);
    maxAmount = Math.min(maxAfford, maxSpace);
  } else {
    maxAmount = owned;
  }

  // Calculate bonus info for display
  const _ltCount = (gameState.locationTrades || {})[gameState.currentLocation] || 0;
  const _repBonus = _ltCount >= 20 ? (tradeMode === 'buy' ? '-8%' : '+8%') : _ltCount >= 5 ? (tradeMode === 'buy' ? '-3%' : '+3%') : null;
  const _repLabel = _ltCount >= 20 ? 'Trusted Regular' : _ltCount >= 5 ? 'Known Dealer' : null;
  const _bulkNote = tradeMode === 'buy' ? 'Buy 10+ for 5% discount' : 'Sell 10+ for 5% premium';

  return `
    <div class="trade-modal">
      <div class="trade-content">
        <h3>${tradeMode === 'buy' ? '💰 BUY' : '💵 SELL'} ${drug.emoji} ${drug.name}</h3>
        <p>Price: <span class="neon-green">$${price.toLocaleString()}</span> per unit</p>
        <p>You have: ${owned} units | Cash: $${gameState.cash.toLocaleString()} | Space: ${getFreeSpace(gameState)}</p>
        ${tradeMode === 'sell' ? `<p style="font-size:0.75rem;color:var(--neon-red);">⚠️ Drug sales produce <b>dirty money</b>. Launder through front businesses to avoid investigation.</p>` : ''}
        ${(() => {
          // Show price comparison from known locations
          if (!gameState.knownPrices || !selectedDrug) return '';
          var comparisons = [];
          for (var locId in gameState.knownPrices) {
            if (locId === gameState.currentLocation) continue;
            var kp = gameState.knownPrices[locId];
            if (kp[selectedDrug] && kp[selectedDrug] > 0) {
              var age = (gameState.day || 1) - (kp._day || 0);
              var locName = typeof LOCATIONS !== 'undefined' ? (LOCATIONS.find(function(l) { return l.id === locId; }) || {}).name || locId : locId;
              var diff = kp[selectedDrug] - price;
              var pctDiff = price > 0 ? Math.round(diff / price * 100) : 0;
              if (age <= 5) {
                comparisons.push({ name: locName, price: kp[selectedDrug], diff: diff, pct: pctDiff, age: age });
              }
            }
          }
          if (comparisons.length === 0) return '';
          comparisons.sort(function(a, b) { return tradeMode === 'buy' ? a.price - b.price : b.price - a.price; });
          var top3 = comparisons.slice(0, 3);
          return '<div style="font-size:0.65rem;color:var(--text-dim);margin:0.2rem 0;padding:0.25rem 0.4rem;background:rgba(100,100,255,0.05);border-radius:3px;border:1px solid rgba(100,100,255,0.1)">' +
            '<span style="color:var(--neon-cyan)">📊 Price Intel:</span> ' +
            top3.map(function(c) {
              var color = (tradeMode === 'buy' && c.diff < 0) || (tradeMode === 'sell' && c.diff > 0) ? '#39ff14' : '#ff4444';
              return c.name + ': $' + c.price.toLocaleString() + ' <span style="color:' + color + '">(' + (c.diff > 0 ? '+' : '') + c.pct + '%)</span>';
            }).join(' · ') +
          '</div>';
        })()}
        <div style="font-size:0.7rem;color:var(--text-dim);margin:0.3rem 0;padding:0.3rem 0.5rem;background:rgba(0,255,255,0.03);border-radius:4px;border:1px solid var(--border-color);">
          <span style="margin-right:0.8rem;">📦 ${_bulkNote}</span>
          ${_repLabel ? '<span style="color:var(--neon-yellow);">⭐ ' + _repLabel + ' (' + _repBonus + ')</span>' : '<span>🏪 Trade here more for rep discounts (' + Math.max(0, 5 - _ltCount) + ' more trades)</span>'}
        </div>
        <div class="trade-controls">
          <button class="btn btn-sm" onclick="adjustTradeAmount(-10)">-10</button>
          <button class="btn btn-sm" onclick="adjustTradeAmount(-1)">-1</button>
          <input type="number" id="tradeAmount" value="${Math.min(1, maxAmount)}" min="0" max="${maxAmount}" class="trade-input" onchange="updateTradeTotal()">
          <button class="btn btn-sm" onclick="adjustTradeAmount(1)">+1</button>
          <button class="btn btn-sm" onclick="adjustTradeAmount(10)">+10</button>
          <button class="btn btn-sm btn-max" onclick="setTradeMax(${maxAmount})">MAX</button>
        </div>
        <p class="trade-total">Total: <span id="tradeTotal" class="neon-yellow">$${(price * Math.min(1, maxAmount)).toLocaleString()}</span></p>
        <div class="trade-actions">
          <button class="btn ${tradeMode === 'buy' ? 'btn-buy' : 'btn-sell'}" onclick="executeTrade()">${tradeMode === 'buy' ? '💰 BUY' : '💵 SELL'}</button>
          <button class="btn btn-secondary" onclick="closeTrade()">CANCEL</button>
        </div>
      </div>
    </div>
  `;
}

function openTrade(drugId, mode) {
  playSound('click');
  selectedDrug = drugId;
  tradeMode = mode;
  render();
}

function closeTrade() {
  selectedDrug = null;
  tradeMode = null;
  render();
}

function adjustTradeAmount(delta) {
  const input = document.getElementById('tradeAmount');
  const max = parseInt(input.max);
  input.value = Math.max(0, Math.min(max, parseInt(input.value || 0) + delta));
  updateTradeTotal();
}

function setTradeMax(max) {
  document.getElementById('tradeAmount').value = max;
  updateTradeTotal();
}

function updateTradeTotal() {
  const amount = parseInt(document.getElementById('tradeAmount').value || 0);
  const price = gameState.prices[selectedDrug] || 0;
  const totalEl = document.getElementById('tradeTotal');
  if (totalEl) totalEl.textContent = '$' + (price * amount).toLocaleString();
}

function executeTrade() {
  const amount = parseInt(document.getElementById('tradeAmount').value || 0);
  if (amount <= 0) return;

  let result;
  if (tradeMode === 'buy') {
    result = buyDrug(gameState, selectedDrug, amount);
    if (result.success) playSound('buy');
  } else {
    result = sellDrug(gameState, selectedDrug, amount);
    if (result.success) playSound('sell');
  }

  if (result.success) {
    const price = gameState.prices[selectedDrug];
    if (tradeMode === 'buy') {
      updateAchievementStats(gameState, 'buy', {
        drugId: selectedDrug, amount, cost: price * amount, unitPrice: price,
        duringCrash: gameState.priceEvents.some(e => e.drugId === selectedDrug && e.effect === 'crash'),
      });
      awardXP(gameState, 'buy_drug');
    } else {
      updateAchievementStats(gameState, 'sell', {
        drugId: selectedDrug, amount,
        duringSpike: gameState.priceEvents.some(e => e.drugId === selectedDrug && e.effect === 'spike'),
      });
      awardXP(gameState, 'sell_drug');
      if (price * amount >= 1000) awardXP(gameState, 'sell_profit_1k');
      if (price * amount >= 10000) awardXP(gameState, 'sell_profit_10k');
      if (price * amount >= 100000) awardXP(gameState, 'sell_profit_100k');
      if (price * amount >= 1000000) awardXP(gameState, 'sell_profit_1m');
    }
    processNewAchievements();
    gameState.messageLog.push(result.msg);
    // Show faction-related messages from the deal (ambushes, standing changes)
    if (result.factionMsgs && result.factionMsgs.length > 0) {
      for (const fMsg of result.factionMsgs) {
        gameState.messageLog.push(fMsg);
        showNotification(fMsg, fMsg.includes('ambush') || fMsg.includes('😡') ? 'error' : 'info');
      }
    }
    closeTrade();
  } else {
    alert(result.msg);
  }
}

// ============================================================
// BANK MODAL
// ============================================================
function openBank() {
  playSound('click');
  const html = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <h3 class="neon-cyan">🏦 FIRST NATIONAL BANK</h3>
        <p>Balance: <span class="neon-cyan">$${gameState.bank.toLocaleString()}</span></p>
        <p>Cash: <span class="neon-green">$${gameState.cash.toLocaleString()}</span></p>
        <p class="small">Interest: ${(GAME_CONFIG.bankInterestRate * 100).toFixed(0)}% per day</p>
        <div class="modal-row">
          <input type="number" id="bankAmount" class="trade-input" placeholder="Amount" min="0">
          <button class="btn btn-sm btn-max" onclick="document.getElementById('bankAmount').value=${gameState.cash}">MAX DEPOSIT</button>
          <button class="btn btn-sm btn-max" onclick="document.getElementById('bankAmount').value=${gameState.bank}">MAX WITHDRAW</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-buy" onclick="doBankAction('deposit')">DEPOSIT</button>
          <button class="btn btn-sell" onclick="doBankAction('withdraw')">WITHDRAW</button>
          <button class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML='';">CLOSE</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = html;
}

function doBankAction(action) {
  const amount = parseInt(document.getElementById('bankAmount').value || 0);
  if (amount <= 0) return;
  const result = action === 'deposit' ? deposit(gameState, amount) : withdraw(gameState, amount);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    document.getElementById('modal-container').innerHTML = '';
    render();
  } else {
    alert(result.msg);
  }
}

// ============================================================
// LOAN SHARK MODAL
// ============================================================
function openLoanShark() {
  playSound('click');
  const html = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <h3 class="neon-red">🦈 VINNIE "THE SHARK" MORETTI</h3>
        <p>"You owe me <span class="neon-red">$${gameState.debt.toLocaleString()}</span>, capisce?"</p>
        <p>Cash: <span class="neon-green">$${gameState.cash.toLocaleString()}</span></p>
        <p class="small">Interest: ${(GAME_CONFIG.debtInterestRate * 100).toFixed(0)}% per day (compounding!)</p>
        <div class="modal-row">
          <input type="number" id="sharkAmount" class="trade-input" placeholder="Amount" min="0">
          <button class="btn btn-sm btn-max" onclick="document.getElementById('sharkAmount').value=${Math.min(gameState.cash, gameState.debt)}">PAY MAX</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-buy" onclick="doSharkAction('pay')">PAY DEBT</button>
          <button class="btn btn-sell" onclick="doSharkAction('borrow')">BORROW</button>
          <button class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML='';">CLOSE</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-container').innerHTML = html;
}

function doSharkAction(action) {
  const amount = parseInt(document.getElementById('sharkAmount').value || 0);
  if (amount <= 0) return;
  const result = action === 'pay' ? payDebt(gameState, amount) : borrowMoney(gameState, amount);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    document.getElementById('modal-container').innerHTML = '';
    render();
  } else {
    alert(result.msg);
  }
}

function closeModal(event) {
  if (event.target.classList.contains('modal-overlay')) {
    document.getElementById('modal-container').innerHTML = '';
  }
}

// ============================================================
// HOSPITAL
// ============================================================
function doHospital() {
  const result = visitHospital(gameState);
  if (result.success) playSound('cash');
  gameState.messageLog.push(result.msg);
  render();
}

// ============================================================
// TERRITORY CHALLENGE
// ============================================================
// News story popup for price events
let activeNewsStory = null;

function showNewsStory(eventIndex) {
  if (!gameState.priceEvents || !gameState.priceEvents[eventIndex]) return;
  const event = gameState.priceEvents[eventIndex];
  if (!event.newsStory) return;
  activeNewsStory = event.newsStory;
  playSound('click');
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'news-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:introFadeIn 0.3s ease';
  overlay.onclick = () => overlay.remove();
  const effectColor = event.effect === 'spike' ? '#ff4444' : '#00ff88';
  const effectIcon = event.effect === 'spike' ? '📈' : '📉';
  overlay.innerHTML = `
    <div style="background:var(--bg-card,#1a1a2e);border:2px solid ${effectColor};border-radius:12px;max-width:550px;width:90%;padding:2rem;cursor:default;box-shadow:0 0 30px rgba(0,0,0,0.5)" onclick="event.stopPropagation()">
      <div style="text-align:center;margin-bottom:0.3rem">
        <span style="font-size:0.7rem;letter-spacing:0.15em;color:${effectColor};text-transform:uppercase;font-family:var(--font-display,'monospace')">⚡ BREAKING NEWS ⚡</span>
      </div>
      <h2 style="color:var(--text-main,#eee);margin:0.3rem 0;font-size:1.3rem;text-align:center;font-family:var(--font-display,'monospace');text-transform:uppercase;letter-spacing:0.05em">${event.newsStory.headline}</h2>
      <div style="width:60%;height:2px;background:${effectColor};margin:0.8rem auto;opacity:0.5"></div>
      <p style="color:var(--text-main,#ccc);line-height:1.8;font-size:0.95rem;margin:1rem 0">${event.newsStory.body}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:0.8rem;border-top:1px solid rgba(255,255,255,0.1)">
        <span style="font-size:0.75rem;color:var(--text-dim,#666)">— ${event.newsStory.source}</span>
        <span style="font-size:0.8rem;color:${effectColor}">${effectIcon} Market Impact: ${event.effect === 'spike' ? 'Prices UP' : 'Prices DOWN'}</span>
      </div>
      <button class="btn btn-secondary" style="margin-top:1rem;width:100%;opacity:0.7" onclick="this.closest('#news-overlay').remove()">Close</button>
    </div>`;
  document.body.appendChild(overlay);
}

function doWait() {
  const oldXp = gameState.xp || 0;
  const result = waitDay(gameState);
  if (!result.success) return;

  // Show messages
  for (const m of result.msgs) gameState.messageLog.push(m);

  // Handle dialogue encounters from wait events
  if (result.streetEvent && result.streetEvent.type === 'dialogue' && result.streetEvent.encounter) {
    pendingDialogue = result.streetEvent.encounter;
    // Show any buff expiration messages
    if (result.streetEvent.buffMsgs) {
      result.streetEvent.buffMsgs.forEach(m => gameState.messageLog.push(m));
    }
    currentScreen = 'dialogue';
    MusicEngine.playSfx('click');
    render();
    return;
  }

  if (result.streetEvent && result.streetEvent.msg) gameState.messageLog.push(result.streetEvent.msg);

  // Track stats & achievements
  if (typeof updateAchievementStats === 'function') {
    updateAchievementStats(gameState, 'wait', {});
  }
  if (typeof awardXP === 'function') {
    awardXP(gameState, 'travel', 2);
    // Check for skill point from level up
    if (typeof checkSkillPointAward === 'function') checkSkillPointAward(gameState, oldXp, gameState.xp);
  }
  processNewAchievements();

  // Check game over
  if (gameState.gameOver) {
    currentScreen = 'gameover';
  }

  // V6: Auto-navigate to NPC story if an event triggered
  if (gameState.namedNPCs && gameState.namedNPCs.activeNPCEvent && !gameState.gameOver) {
    currentScreen = 'npcstory';
  }

  MusicEngine.playSfx('click');
  render();
}

function doChallenge() {
  const result = challengeTerritory(gameState);
  if (!result.success) {
    gameState.messageLog.push(result.msg);
    render();
    return;
  }
  // Start territory combat
  combatEvent = result.event;
  pendingEvents = [result.event];
  currentEventIndex = 0;
  currentScreen = 'combat';
  playSound('fight');
  render();
}

// ============================================================
// STASH SCREEN
// ============================================================
function renderStash() {
  const locId = gameState.currentLocation;
  const loc = LOCATIONS.find(l => l.id === locId);
  const locName = loc ? loc.name : locId;
  const invItems = Object.entries(gameState.inventory).filter(([, v]) => v > 0);

  // Per-location stash support
  const usePropertyStash = typeof getStashCapacity === 'function' && typeof stashDrugsAtLocation === 'function';
  const stashCapacity = usePropertyStash ? getStashCapacity(gameState, locId) : 999;
  const stashCount = usePropertyStash ? (typeof getStashCount === 'function' ? getStashCount(gameState, locId) : 0) : 0;

  let stashData;
  if (usePropertyStash && gameState.stashes) {
    stashData = gameState.stashes[locId] || {};
  } else {
    stashData = gameState.stash || {};
  }
  const stashItems = Object.entries(stashData).filter(([, v]) => v > 0);

  const invRows = invItems.map(([id, amt]) => {
    const drug = DRUGS.find(d => d.id === id);
    return `<tr><td>${drug.emoji} ${drug.name}</td><td>${amt}</td><td><button class="btn btn-sm btn-sell" onclick="doStash('store','${id}',${amt})">STORE ALL</button></td></tr>`;
  }).join('') || '<tr><td colspan="3">Empty inventory</td></tr>';

  const stashRows = stashItems.map(([id, amt]) => {
    const drug = DRUGS.find(d => d.id === id);
    return `<tr><td>${drug.emoji} ${drug.name}</td><td>${amt}</td><td><button class="btn btn-sm btn-buy" onclick="doStash('retrieve','${id}',${amt})">TAKE ALL</button></td></tr>`;
  }).join('') || '<tr><td colspan="3">Empty stash</td></tr>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title neon-cyan">📦 STASH — ${locName}</h2>
      <p>Free inventory space: ${getFreeSpace(gameState)} slots${usePropertyStash ? ` | Stash capacity: ${stashCount}/${stashCapacity}` : ''}</p>
      <div class="stash-grid">
        <div>
          <h3>🎒 Inventory</h3>
          <table class="data-table"><thead><tr><th>Drug</th><th>Qty</th><th></th></tr></thead><tbody>${invRows}</tbody></table>
        </div>
        <div>
          <h3>📦 Stash</h3>
          <table class="data-table"><thead><tr><th>Drug</th><th>Qty</th><th></th></tr></thead><tbody>${stashRows}</tbody></table>
        </div>
      </div>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back to Market</button>
    </div>
  `;
}

function doStash(action, drugId, amount) {
  const usePropertyStash = typeof stashDrugsAtLocation === 'function';
  let result;
  if (usePropertyStash) {
    result = action === 'store'
      ? stashDrugsAtLocation(gameState, drugId, amount)
      : retrieveDrugsFromLocation(gameState, drugId, amount);
  } else {
    result = action === 'store' ? stashDrugs(gameState, drugId, amount) : retrieveDrugs(gameState, drugId, amount);
  }
  if (result.success) {
    playSound('click');
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
  }
  render();
}

// ============================================================
// BLACK MARKET
// ============================================================
var bmTierFilter = 'all';

function setBMTierFilter(tier) {
  bmTierFilter = tier;
  render();
}

function renderBlackMarket() {
  // Weapon tier filter tabs
  const allTiers = ['all'];
  const tierSet = {};
  WEAPONS.filter(w => w.price > 0).forEach(w => {
    const t = w.tier || 'standard';
    if (!tierSet[t]) { tierSet[t] = true; allTiers.push(t); }
  });
  const tierTabs = allTiers.map(t =>
    `<button class="btn btn-sm ${bmTierFilter === t ? 'btn-primary' : 'btn-secondary'}" style="margin:0 3px 5px 0;font-size:0.7rem;" onclick="setBMTierFilter('${t}')">${t === 'all' ? 'ALL' : t.toUpperCase()}</button>`
  ).join('');

  const weaponRows = WEAPONS.filter(w => w.price > 0).filter(w => bmTierFilter === 'all' || (w.tier || 'standard') === bmTierFilter).map(w => {
    const owned = gameState.weapons.includes(w.id);
    const equipped = gameState.equippedWeapon === w.id;
    return `
      <tr class="${owned ? 'row-owned' : ''}">
        <td>${w.name}</td>
        <td>DMG: ${w.damage}</td>
        <td>ACC: ${Math.round(w.accuracy * 100)}%</td>
        <td>$${w.price.toLocaleString()}</td>
        <td>${w.space} slots</td>
        <td>
          ${owned ? (equipped ? '<span class="neon-green">EQUIPPED</span>' : `<button class="btn btn-sm btn-buy" onclick="equipWeapon('${w.id}')">EQUIP</button>`) : `<button class="btn btn-sm btn-buy" onclick="doBuyWeapon('${w.id}')">BUY</button>`}
        </td>
      </tr>
    `;
  }).join('');

  const crewRows = HENCHMEN_TYPES.map(h => `
    <tr>
      <td>${h.name}${h.special ? `<div style="font-size:0.65rem;color:var(--neon-yellow)">${h.special}</div>` : ''}</td>
      <td>+${h.combat}</td>
      <td>+${h.carry}</td>
      <td>$${h.cost.toLocaleString()}</td>
      <td>$${h.dailyPay}/day</td>
      <td><button class="btn btn-sm btn-buy" onclick="doHire('${h.id}')">HIRE</button></td>
    </tr>
  `).join('');

  const currentCrew = gameState.henchmen.map((h, i) => {
    const type = HENCHMEN_TYPES.find(t => t.id === h.type);
    return `<tr><td>${h.name}</td><td>${type.name}</td><td>$${type.dailyPay}/day</td><td><button class="btn btn-sm btn-danger" onclick="doFire(${i})">FIRE</button></td></tr>`;
  }).join('') || '<tr><td colspan="4">No crew hired</td></tr>';

  // Items section
  const itemRows = (typeof ITEMS !== 'undefined' ? ITEMS : []).map(item => {
    const owned = getItemCount(gameState, item.id);
    const atMax = owned >= item.maxStack;
    const canUse = item.effect.heal || item.effect.heatReduction || item.effect.intelDays;
    return `
      <tr>
        <td>${item.emoji} ${item.name}</td>
        <td style="font-size:0.7rem;color:var(--text-dim);max-width:180px;">${item.desc}</td>
        <td>$${item.price.toLocaleString()}</td>
        <td>${owned > 0 ? '<span class="neon-green">' + owned + '/' + item.maxStack + '</span>' : '<span style="color:var(--text-dim)">0/' + item.maxStack + '</span>'}</td>
        <td>
          ${atMax ? '<span style="color:var(--text-dim);font-size:0.7rem;">MAX</span>' : '<button class="btn btn-sm btn-buy" onclick="doBuyItem(\'' + item.id + '\')">BUY</button>'}
          ${owned > 0 && canUse ? ' <button class="btn btn-sm btn-secondary" style="border-color:var(--neon-green);color:var(--neon-green)" onclick="doUseItem(\'' + item.id + '\')">USE</button>' : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title neon-yellow">🏴 BLACK MARKET</h2>
      <h3>🔫 Weapons</h3>
      <div style="margin-bottom:8px;">${tierTabs}</div>
      <table class="data-table"><thead><tr><th>Name</th><th>Damage</th><th>Accuracy</th><th>Price</th><th>Space</th><th></th></tr></thead><tbody>${weaponRows}</tbody></table>
      <h3>🎒 Items & Equipment</h3>
      <table class="data-table"><thead><tr><th>Item</th><th>Effect</th><th>Price</th><th>Owned</th><th></th></tr></thead><tbody>${itemRows}</tbody></table>
      <h3>👥 Hire Crew (Max ${typeof getMaxCrewSize === 'function' ? getMaxCrewSize(gameState) : 4})</h3>
      <table class="data-table"><thead><tr><th>Type</th><th>Combat</th><th>Carry</th><th>Cost</th><th>Daily</th><th></th></tr></thead><tbody>${crewRows}</tbody></table>
      <h3>Your Crew (${gameState.henchmen.length}/${typeof getMaxCrewSize === 'function' ? getMaxCrewSize(gameState) : 4})</h3>
      <table class="data-table"><thead><tr><th>Name</th><th>Role</th><th>Pay</th><th></th></tr></thead><tbody>${currentCrew}</tbody></table>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back to Market</button>
    </div>
  `;
}

function doBuyWeapon(id) {
  const result = buyWeapon(gameState, id);
  if (result.success) {
    playSound('buy');
    gameState.equippedWeapon = id;
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
  }
  render();
}

function equipWeapon(id) {
  gameState.equippedWeapon = id;
  playSound('click');
  render();
}

function doBuyItem(itemId) {
  if (typeof buyItem !== 'function') return;
  const result = buyItem(gameState, itemId);
  if (result.success) {
    playSound('buy');
    gameState.messageLog.push(result.msg);
  } else {
    playSound('error');
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doUseItem(itemId) {
  if (typeof useItem !== 'function') return;
  const result = useItem(gameState, itemId);
  if (result.success) {
    playSound('click');
    gameState.messageLog.push(result.msg);
  } else {
    playSound('error');
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doHire(typeId) {
  const result = hireHenchman(gameState, typeId);
  if (result.success) {
    playSound('buy');
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
  }
  render();
}

function doFire(index) {
  const result = fireHenchman(gameState, index);
  if (result.success) {
    playSound('click');
    gameState.messageLog.push(result.msg);
  }
  render();
}

// ============================================================
// TRAVEL SCREEN
// ============================================================
let travelViewMode = 'map'; // 'map' or 'list'

function renderWorldMap() {
  // Delegate to multi-level world map if system is loaded and player has unlocked regions beyond Miami
  if (typeof renderWorldMapMultiLevel === 'function') {
    const unlockedRegions = gameState.worldState && gameState.worldState.unlockedRegions
      ? gameState.worldState.unlockedRegions : ['miami'];
    // Show world map if player has unlocked any region beyond Miami, OR if zoomed to world view
    if (unlockedRegions.length > 1 || (typeof mapZoomLevel !== 'undefined' && mapZoomLevel === 'world')) {
      return renderWorldMapMultiLevel();
    }
  }

  // Default: Miami-only District Map - positioned roughly geographically
  const districtPositions = {
    miami_gardens: { x: 30, y: 5 },
    opa_locka: { x: 55, y: 10 },
    hialeah: { x: 35, y: 22 },
    liberty_city: { x: 55, y: 25 },
    little_haiti: { x: 68, y: 18 },
    overtown: { x: 45, y: 40 },
    wynwood: { x: 62, y: 35 },
    little_havana: { x: 35, y: 52 },
    downtown: { x: 55, y: 50 },
    south_beach: { x: 80, y: 42 },
    coral_gables: { x: 30, y: 68 },
    the_port: { x: 68, y: 60 },
    kendall: { x: 20, y: 82 },
    the_keys: { x: 45, y: 92 },
  };

  // Miami outline SVG
  const mapSvg = `<svg class="world-map-svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g fill="none" stroke="rgba(0,240,255,0.12)" stroke-width="1.5" filter="url(#glow)">
      <!-- Miami-Dade County outline -->
      <path d="M150,20 L850,20 L850,60 L870,60 L890,80 L900,120 L910,180 L920,250 L910,320 L880,380 L850,410 L800,430 L700,450 L600,460 L500,465 L400,460 L300,450 L200,420 L150,380 L130,300 L120,220 L130,140 L140,80 Z"/>
      <!-- Biscayne Bay -->
      <path d="M750,150 L780,160 L800,190 L810,230 L800,270 L790,310 L770,340 L750,350 L740,320 L735,280 L738,240 L745,200 L750,160 Z" fill="rgba(0,100,200,0.05)"/>
      <!-- Atlantic coast -->
      <path d="M820,100 L840,130 L860,170 L870,220 L875,270 L870,320 L860,360 L840,400" stroke="rgba(0,160,255,0.15)"/>
    </g>
    <!-- Road grid -->
    <g stroke="rgba(136,136,170,0.04)" stroke-width="0.5">
      <line x1="100" y1="250" x2="900" y2="250"/>
      <line x1="500" y1="10" x2="500" y2="490"/>
      <line x1="250" y1="10" x2="250" y2="490"/>
      <line x1="750" y1="10" x2="750" y2="490"/>
    </g>
    <text x="500" y="495" fill="rgba(136,136,170,0.15)" font-size="14" text-anchor="middle" font-family="Orbitron">M I A M I - D A D E &nbsp; C O U N T Y</text>
  </svg>`;

  // District nodes
  let nodesHtml = '';
  for (const loc of LOCATIONS) {
    const pos = districtPositions[loc.id];
    if (!pos) continue;
    const isCurrent = loc.id === gameState.currentLocation;
    const isVisited = gameState.citiesVisited.includes(loc.id);
    const isTerr = typeof isTerritory === 'function' && isTerritory(gameState, loc.id);
    const locHeat = gameState.heatSystem ? (gameState.heatSystem.cityHeat || {})[loc.id] || 0 : 0;

    let cls = 'map-city-node';
    if (isCurrent) cls += ' current';
    else if (isTerr) cls += ' territory';
    else if (isVisited) cls += ' visited';
    else cls += ' unvisited';
    if (locHeat > 50) cls += ' heat-high';

    nodesHtml += `
      <div class="${cls}" style="left:${pos.x}%;top:${pos.y}%" onclick="${isCurrent ? '' : `selectDestination('${loc.id}')`}" title="${loc.name}${isTerr ? ' (Your Territory)' : ''}"></div>
      <div class="map-city-label" style="left:${pos.x}%;top:${pos.y + 4}%">${loc.emoji || ''} ${loc.name}</div>`;
  }

  // Connection lines between adjacent districts
  const adjacencyMap = typeof areDistrictsAdjacent === 'function' ? {
    liberty_city: ['little_haiti', 'overtown', 'miami_gardens'],
    overtown: ['wynwood', 'downtown', 'little_havana'],
    little_havana: ['downtown', 'coral_gables', 'hialeah'],
    wynwood: ['downtown', 'south_beach', 'little_haiti'],
    downtown: ['south_beach', 'coral_gables', 'the_port'],
    hialeah: ['little_haiti', 'opa_locka', 'miami_gardens'],
    opa_locka: ['miami_gardens'],
    coral_gables: ['kendall'],
    kendall: ['the_keys'],
  } : {};

  let connectionsHtml = '';
  for (const [from, tos] of Object.entries(adjacencyMap)) {
    const fromPos = districtPositions[from];
    if (!fromPos) continue;
    for (const to of tos) {
      const toPos = districtPositions[to];
      if (!toPos) continue;
      connectionsHtml += `<line x1="${fromPos.x}%" y1="${fromPos.y}%" x2="${toPos.x}%" y2="${toPos.y}%" stroke="rgba(0,240,255,0.06)" stroke-width="1"/>`;
    }
  }

  return `<div class="world-map-container">
    ${mapSvg}
    <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none">${connectionsHtml}</svg>
    ${nodesHtml}
  </div>
  <div style="text-align:center;margin:0.3rem 0">
    <span style="font-size:0.65rem;color:var(--text-dim)">
      <span style="color:var(--neon-pink)">●</span> Current &nbsp;
      <span style="color:var(--neon-purple)">●</span> Territory &nbsp;
      <span style="color:var(--neon-cyan)">●</span> Visited &nbsp;
      <span style="color:#666">●</span> Undiscovered &nbsp;
      <span style="color:var(--neon-orange)">◉</span> High Heat
    </span>
  </div>`;
}

let travelRegionFilter = 'all'; // 'all', 'current', or specific region id

function renderTravel() {
  const currentLoc = LOCATIONS.find(l => l.id === gameState.currentLocation);
  const daysLeft = GAME_CONFIG.totalDays - gameState.day + 1;

  // Build region groups
  const regions = {};
  for (const loc of LOCATIONS) {
    if (loc.id === gameState.currentLocation) continue;
    const r = loc.region || 'miami';
    if (!regions[r]) regions[r] = [];
    regions[r].push(loc);
  }

  // Region tab bar (only show if multiple regions unlocked)
  const regionKeys = Object.keys(regions);
  const hasMultipleRegions = regionKeys.length > 1;
  let regionTabsHtml = '';
  if (hasMultipleRegions) {
    const regionNames = { miami: '🌴 Miami', caribbean: '🏝️ Caribbean', south_america: '🌿 S. America',
      central_america: '🌋 C. America', mexico: '🇲🇽 Mexico', us_cities: '🏙️ US Cities',
      western_europe: '🏰 W. Europe', eastern_europe: '🏭 E. Europe', west_africa: '🌍 W. Africa',
      southeast_asia: '🐉 SE Asia' };
    regionTabsHtml = `<div class="region-tabs" style="display:flex;flex-wrap:wrap;gap:0.3rem;margin:0.5rem 0;">
      <button class="btn ${travelRegionFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="travelRegionFilter='all';render()">All</button>
      <button class="btn ${travelRegionFilter === 'current' ? 'btn-primary' : 'btn-secondary'}" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="travelRegionFilter='current';render()">Same Region</button>
      ${regionKeys.map(r => `<button class="btn ${travelRegionFilter === r ? 'btn-primary' : 'btn-secondary'}" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="travelRegionFilter='${r}';render()">${regionNames[r] || r}</button>`).join('')}
    </div>`;
  }

  // Filter regions based on tab
  let filteredRegions = regions;
  if (travelRegionFilter === 'current') {
    const curReg = currentLoc.region || 'miami';
    filteredRegions = {};
    if (regions[curReg]) filteredRegions[curReg] = regions[curReg];
  } else if (travelRegionFilter !== 'all' && regions[travelRegionFilter]) {
    filteredRegions = {};
    filteredRegions[travelRegionFilter] = regions[travelRegionFilter];
  }

  let locHtml = '';
  const regionDisplayNames = { miami: '🌴 Miami', caribbean: '🏝️ The Caribbean', south_america: '🌿 South America',
    central_america: '🌋 Central America', mexico: '🇲🇽 Mexico', us_cities: '🏙️ US Cities',
    western_europe: '🏰 Western Europe', eastern_europe: '🏭 Eastern Europe', west_africa: '🌍 West Africa',
    southeast_asia: '🐉 Southeast Asia' };

  for (const [region, locs] of Object.entries(filteredRegions)) {
    const sameRegion = region === (currentLoc.region || 'miami');
    const crossRegion = !sameRegion;
    locHtml += `<h3 class="region-header ${sameRegion ? 'neon-green' : 'neon-cyan'}">${regionDisplayNames[region] || region} ${sameRegion ? '(Same Region)' : '✈️ Cross-Region'}</h3>`;
    locHtml += '<div class="travel-grid">';
    for (const loc of locs) {
      const visited = gameState.citiesVisited.includes(loc.id);
      locHtml += `
        <div class="travel-card ${visited ? 'visited' : ''}" onclick="selectDestination('${loc.id}')">
          <div class="travel-card-name">${loc.emoji || ''} ${loc.name}</div>
          <div class="travel-card-desc">${loc.desc}</div>
          <div class="travel-card-danger">Danger: ${'★'.repeat(Math.min(loc.dangerLevel, 10))}${'☆'.repeat(Math.max(0, 10 - loc.dangerLevel))}</div>
          ${loc.drugSpecialty ? `<div class="travel-card-specialty">Known for: ${DRUGS.find(d => d.id === loc.drugSpecialty)?.name || loc.drugSpecialty}</div>` : ''}
          ${visited ? '<span class="visited-badge">✓ Visited</span>' : ''}
          ${typeof isTerritory === 'function' && isTerritory(gameState, loc.id) ? '<span style="color:var(--neon-purple);font-size:0.7rem;font-weight:700">🏴 YOUR TURF</span>' : ''}
        </div>
      `;
    }
    locHtml += '</div>';
  }

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title neon-pink">✈️ TRAVEL — Choose Destination</h2>
      <p>Current: <strong class="neon-cyan">${currentLoc.name}</strong> | Days left: <strong class="${daysLeft < 10 ? 'neon-red' : 'neon-yellow'}">${daysLeft}</strong> | Carrying: ${getInventoryCount(gameState)} units</p>
      <div class="map-view-toggle">
        <button class="btn ${travelViewMode === 'map' ? 'btn-primary' : 'btn-secondary'}" onclick="travelViewMode='map';render()">🗺️ Map</button>
        <button class="btn ${travelViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}" onclick="travelViewMode='list';render()">📋 List</button>
      </div>
      <div id="transport-panel"></div>
      ${travelViewMode === 'map' ? renderWorldMap() : ''}
      ${travelViewMode === 'list' ? (regionTabsHtml + locHtml) : ''}
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Cancel</button>
    </div>
  `;
}

function selectDestination(destId) {
  playSound('click');
  const dest = LOCATIONS.find(l => l.id === destId);
  if (!dest) return;
  const currentLoc = LOCATIONS.find(l => l.id === gameState.currentLocation);
  const currentRegion = currentLoc ? (currentLoc.region || 'miami') : 'miami';
  const destRegion = dest.region || 'miami';
  const isCrossRegion = currentRegion !== destRegion;
  const daysLeft = GAME_CONFIG.totalDays - gameState.day + 1;

  // Get local transport
  const transports = getAvailableTransport(gameState, destId);

  // Get world transport for cross-region travel
  let worldTransports = [];
  if (isCrossRegion && typeof getWorldTransport === 'function') {
    worldTransports = getWorldTransport(gameState, currentRegion, destRegion);
  }

  const allTransports = isCrossRegion ? worldTransports : transports;

  // Check if region contact fee is needed
  let contactHtml = '';
  if (isCrossRegion && typeof hasRegionContact === 'function' && !hasRegionContact(gameState, destRegion)) {
    const fee = (typeof REGION_CONTACT_FEES !== 'undefined' && REGION_CONTACT_FEES[destRegion]) || 25000;
    contactHtml = `<div style="background:rgba(255,0,80,0.15);border:1px solid var(--neon-red);border-radius:0.4rem;padding:0.5rem;margin:0.3rem 0;font-size:0.75rem">
      ⚠️ No contacts in ${destRegion.replace(/_/g, ' ')}. Pay <strong class="neon-yellow">$${fee.toLocaleString()}</strong> first.
      <button class="btn btn-primary" style="font-size:0.65rem;padding:0.15rem 0.4rem;margin-left:0.3rem" onclick="payContactFee('${destRegion}')">Establish Contacts</button>
    </div>`;
  }

  const html = `
    <div class="transport-panel">
      <h3>Travel to <span class="neon-pink">${dest.emoji || ''} ${dest.name}</span> ${isCrossRegion ? `<span class="neon-cyan" style="font-size:0.7rem">✈️ Cross-Region</span>` : ''}</h3>
      ${contactHtml}
      <div class="transport-grid">
        ${allTransports.map(t => `
          <div class="transport-card ${t.locked || !t.canAfford || !t.canCarry ? 'disabled' : ''}" onclick="${!t.locked && t.canAfford && t.canCarry ? `doTravel('${destId}', '${t.id}'${t.isWorldTransport ? ', true' : ''})` : ''}" style="${t.locked ? 'opacity:0.4' : ''}">
            <div class="transport-name">${t.emoji || ''} ${t.name}</div>
            <div class="transport-cost">$${t.cost.toLocaleString()}</div>
            <div class="transport-time">${t.timeDays} day${t.timeDays > 1 ? 's' : ''} ${t.timeDays > daysLeft ? '<span class="neon-red">(NOT ENOUGH TIME!)</span>' : ''}</div>
            <div class="transport-risk">Risk: ${t.riskMod < 0.5 ? '🟢 Low' : t.riskMod < 1 ? '🟡 Medium' : '🔴 High'}</div>
            <div class="transport-carry">Carry: ${t.inventoryLimit.toLocaleString()} units ${!t.canCarry && !t.locked ? '<span class="neon-red">(TOO MUCH CARGO!)</span>' : ''}</div>
            ${t.locked ? '<div class="neon-red">🔒 Requires Lvl ' + (t.minLevel || t.minRegionTier || '?') + '</div>' : !t.canAfford ? '<div class="neon-red">Can\'t afford</div>' : ''}
            ${t.desc ? `<div style="font-size:0.6rem;color:var(--text-dim);margin-top:0.2rem">${t.desc}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('transport-panel').innerHTML = html;
}

function payContactFee(regionId) {
  if (typeof payRegionContactFee !== 'function') return;
  const result = payRegionContactFee(gameState, regionId);
  gameState.messageLog.push(result.msg);
  render();
}

function doTravel(destId, transportId, isWorldTransport) {
  const daysLeft = GAME_CONFIG.totalDays - gameState.day + 1;

  // Find transport data from either local or world transport
  let t;
  if (isWorldTransport && typeof WORLD_TRANSPORT !== 'undefined') {
    t = WORLD_TRANSPORT.find(wt => wt.id === transportId);
  }
  if (!t) {
    t = TRANSPORT[transportId];
  }
  if (!t) {
    alert('Unknown transport mode!');
    return;
  }

  // For world transport, calculate actual time based on distance
  let travelTime = t.timeDays;
  if (isWorldTransport) {
    const currentLoc = LOCATIONS.find(l => l.id === gameState.currentLocation);
    const destLoc = LOCATIONS.find(l => l.id === destId);
    if (currentLoc && destLoc && typeof getRegionDistance === 'function') {
      const dist = getRegionDistance(currentLoc.region || 'miami', destLoc.region || 'miami');
      travelTime = Math.max(1, Math.round(t.timeDays * (dist / 2.5)));
    }
  }

  if (travelTime > daysLeft) {
    alert('Not enough days left for this transport!');
    return;
  }

  playSound('travel');
  processBuffs(gameState);

  // Process customs encounter for cross-region travel
  let customsResult = null;
  if (isWorldTransport && typeof processCustomsEncounter === 'function') {
    const currentLoc = LOCATIONS.find(l => l.id === gameState.currentLocation);
    const destLoc = LOCATIONS.find(l => l.id === destId);
    if (currentLoc && destLoc) {
      customsResult = processCustomsEncounter(gameState, currentLoc.region || 'miami', destLoc.region || 'miami');
    }
  }

  const result = travel(gameState, destId, transportId);

  if (!result.success) {
    alert(result.msg);
    return;
  }

  // Record price history after travel generates new prices
  recordPriceHistory(gameState);

  gameState.messageLog.push(result.msg);

  // Add customs encounter message if applicable
  if (customsResult) {
    gameState.messageLog.push(customsResult.msg);
  }

  // Track travel stats for achievements
  const dest = LOCATIONS.find(l => l.id === destId);
  updateAchievementStats(gameState, 'travel', {
    transport: transportId,
    region: dest ? dest.region : null,
    noEncounter: (result.travelEvents || []).length === 0,
  });
  awardXP(gameState, 'travel');
  if (!gameState.citiesVisited.includes(destId)) {
    awardXP(gameState, 'visit_new_city');
  }
  processNewAchievements();

  if (gameState.gameOver) {
    currentScreen = 'gameover';
    render();
    return;
  }

  pendingEvents = result.travelEvents || [];
  currentEventIndex = 0;

  if (pendingEvents.length > 0) {
    processNextEvent();
  } else {
    currentScreen = 'game';
    render();
  }
}

// ============================================================
// EVENT PROCESSING
// ============================================================
function processNextEvent() {
  if (currentEventIndex >= pendingEvents.length) {
    currentScreen = 'game';
    render();
    return;
  }

  const event = pendingEvents[currentEventIndex];
  if (event.resolved) {
    gameState.messageLog.push(event.msg);
    currentEventIndex++;
    processNextEvent();
    return;
  }

  if (event.combatType) {
    combatEvent = event;
    currentScreen = 'combat';
  } else {
    currentScreen = 'event';
  }
  render();
}

// ============================================================
// EVENT SCREEN (offers, etc.)
// ============================================================
function renderEventScreen() {
  const event = pendingEvents[currentEventIndex];
  if (!event) { currentScreen = 'game'; render(); return ''; }

  let buttons = '';
  if (event.offerType) {
    buttons = `
      <button class="btn btn-buy" onclick="doAcceptOffer()">✅ ACCEPT ($${event.price.toLocaleString()})</button>
      <button class="btn btn-secondary" onclick="doDeclineOffer()">❌ DECLINE</button>
    `;
  }

  return `
    <div class="screen-container event-screen">
      <div class="event-box">
        <div class="event-icon">⚠️</div>
        <p class="event-msg">${event.msg}</p>
        <div class="event-actions">${buttons}</div>
      </div>
    </div>
  `;
}

function doAcceptOffer() {
  const event = pendingEvents[currentEventIndex];
  const result = acceptOffer(gameState, event);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
    return;
  }
  currentEventIndex++;
  processNextEvent();
}

function doDeclineOffer() {
  playSound('click');
  gameState.messageLog.push('You declined the offer.');
  currentEventIndex++;
  processNextEvent();
}

// ============================================================
// COMBAT SCREEN
// ============================================================
function renderCombat() {
  if (!combatEvent) { currentScreen = 'game'; render(); return ''; }

  const weapon = WEAPONS.find(w => w.id === gameState.equippedWeapon) || WEAPONS[0];
  const isPolice = combatEvent.combatType === 'police';
  const isDEA = combatEvent.combatType === 'dea_raid';
  const isTerritory = combatEvent.combatType === 'territory';
  const isLaw = isPolice || isDEA;

  const enemyLabel = isDEA ? 'DEA AGENTS' : isPolice ? 'POLICE' : isTerritory ? (combatEvent.enemyName || 'CARTEL') : 'GANG';
  const borderColor = isDEA ? 'neon-orange' : isTerritory ? 'neon-purple' : 'neon-red';
  const headerHp = isDEA ? combatEvent.enemyCount * 50 + 100 : combatEvent.enemyCount * (isPolice ? 30 : 25) + (isPolice ? 20 : 0);

  return `
    <div class="screen-container combat-screen">
      <div class="combat-box" ${isDEA ? 'style="border-color:var(--neon-orange);box-shadow:0 0 40px rgba(255,107,53,0.4)"' : isTerritory ? 'style="border-color:var(--neon-purple);box-shadow:0 0 40px rgba(180,50,255,0.4)"' : ''}>
        <h2 class="${borderColor}">⚔️ ${isDEA ? '🚁 DEA RAID' : isPolice ? 'POLICE ENCOUNTER' : isTerritory ? '🏴 TERRITORY WAR' : 'GANG FIGHT'}</h2>
        <p class="event-msg">${combatEvent.msg}</p>
        <div class="combat-stats">
          <div class="combatant">
            <h3 class="neon-green">YOU</h3>
            <div class="health-bar"><div class="health-fill" style="width:${(gameState.health / gameState.maxHealth) * 100}%"></div></div>
            <p>HP: ${gameState.health}/${gameState.maxHealth}</p>
            <p>Weapon: ${weapon.name}</p>
            <p>Crew: ${gameState.henchmen.filter(h => !h.injured).length}/${gameState.henchmen.length}</p>
          </div>
          <div class="vs">VS</div>
          <div class="combatant">
            <h3 class="${borderColor}">${enemyLabel}</h3>
            <div class="health-bar enemy"><div class="health-fill enemy-fill" style="width:${Math.max(0, (combatEvent.enemyHealth / headerHp) * 100)}%"></div></div>
            <p>Enemies: ${combatEvent.enemyCount}</p>
            <p>HP: ${combatEvent.enemyHealth}</p>
          </div>
        </div>
        <div id="combat-log" class="combat-log"></div>
        <div class="combat-actions">
          <button class="btn btn-danger" onclick="doCombat('fight')">⚔️ FIGHT</button>
          <button class="btn btn-secondary" onclick="doCombat('run')">🏃 RUN</button>
          ${isLaw ? `<button class="btn btn-secondary" onclick="doCombat('surrender')">🏳️ SURRENDER</button>` : ''}
          ${!isLaw && combatEvent.demandAmount ? `<button class="btn btn-buy" onclick="doCombat('pay')">💰 PAY $${combatEvent.demandAmount.toLocaleString()}</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function doCombat(action) {
  playSound(action === 'fight' ? 'fight' : 'click');
  const result = resolveCombatRound(gameState, action, combatEvent);

  if (result.playerDamage > 0) playSound('hurt');

  const log = document.getElementById('combat-log');
  if (log) {
    log.innerHTML += `<div class="combat-msg">${result.msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }

  if (result.resolved) {
    // Track combat stats
    if (action === 'surrender') {
      updateAchievementStats(gameState, 'surrender', {});
    } else if (action === 'run' && !result.msg.includes('Couldn')) {
      updateAchievementStats(gameState, 'escape', {});
    } else if (action === 'pay') {
      updateAchievementStats(gameState, 'bribe', {});
    }
    if (combatEvent && combatEvent.enemyHealth <= 0) {
      updateAchievementStats(gameState, 'combat_win', {
        type: combatEvent.combatType,
        noDamage: result.playerDamage === 0,
      });
      awardXP(gameState, 'win_combat');
      if (combatEvent.combatType === 'territory') awardXP(gameState, 'win_territory');
      if (combatEvent.combatType === 'dea_raid') awardXP(gameState, 'survive_dea');
    }
    updateAchievementStats(gameState, 'health_change', {});
    processNewAchievements();

    if (result.goToCourt) {
      gameState.messageLog.push(result.msg);
      playSound('arrest');
      setTimeout(() => {
        combatEvent = null;
        currentScreen = 'court';
        render();
      }, 1500);
    } else if (gameState.gameOver) {
      playSound('gameover');
      setTimeout(() => { currentScreen = 'gameover'; render(); }, 1500);
    } else {
      gameState.messageLog.push(result.msg);
      setTimeout(() => {
        combatEvent = null;
        currentEventIndex++;
        processNextEvent();
      }, 1500);
    }
  } else {
    updateAchievementStats(gameState, 'health_change', {});
    render();
  }
}

// ============================================================
// GAME OVER SCREEN
// ============================================================
function renderGameOver() {
  if (!gameState.finalScore && gameState.finalScore !== 0) endGame(gameState);

  const won = gameState.gameWon;
  const score = gameState.finalScore;

  // Campaign ending
  let endingHtml = '';
  if (typeof determineEnding === 'function' && gameState.campaign) {
    const ending = determineEnding(gameState);
    if (ending) {
      const gradeColors = { S: '#ff2d95', A: '#ffe600', B: '#00f0ff', C: '#888888' };
      const gradeColor = gradeColors[ending.grade] || '#888';
      endingHtml = `
        <div class="ending-screen">
          <div class="ending-title neon-pink">${(ending.ending || ending).emoji} ${(ending.ending || ending).name}</div>
          <div class="ending-narrative">${(ending.ending || ending).narrative}</div>
          <div class="ending-grade" style="color:${gradeColor}">GRADE: ${ending.grade}</div>
        </div>
      `;
    }
  }

  return `
    <div class="title-screen gameover-screen">
      <div class="title-neon-border">
        <h1 class="${won ? 'neon-green' : 'neon-red'}">${won ? '🏆 GAME OVER' : '💀 GAME OVER'}</h1>
        <h2 class="title-sub">${gameState.health <= 0 ? 'YOU DIED' : (gameState.debt > 0 && !won ? 'THE LOAN SHARK SENDS HIS REGARDS...' : (won ? 'YOU MADE IT OUT ALIVE' : 'TIME\'S UP'))}</h2>
        <div class="title-divider"></div>
        ${endingHtml}
        <div class="score-breakdown">
          <p>Final Cash: <span class="neon-green">$${gameState.cash.toLocaleString()}</span></p>
          <p>Bank Balance: <span class="neon-cyan">$${gameState.bank.toLocaleString()}</span></p>
          <p>Remaining Debt: <span class="neon-red">$${gameState.debt.toLocaleString()}</span></p>
          <p>Days Survived: ${gameState.day - 1} / ${GAME_CONFIG.totalDays}</p>
          <p>Cities Visited: ${gameState.citiesVisited.length} / ${LOCATIONS.length}</p>
          <p>People Killed: ${gameState.peopleKilled}</p>
          ${gameState.campaign ? `<p>Campaign Act: ${gameState.campaign.currentAct || 1} / 5</p>` : ''}
          <div class="title-divider"></div>
          <p class="final-score">NET WORTH: <span class="${score >= 0 ? 'neon-green' : 'neon-red'}">$${score.toLocaleString()}</span></p>
          <p class="rank-title neon-yellow">${gameState.rank}</p>
        </div>
        <button class="btn btn-primary btn-glow" onclick="startNewGame()">▶ PLAY AGAIN</button>
        <button class="btn btn-secondary" onclick="currentScreen='highscores'; render();">🏆 HIGH SCORES</button>
        <button class="btn btn-secondary" onclick="currentScreen='title'; render();">🏠 MAIN MENU</button>
      </div>
    </div>
  `;
}

// ============================================================
// COURT SCREEN
// ============================================================
function renderCourt() {
  if (!gameState.courtCase) {
    currentScreen = 'game';
    render();
    return '';
  }

  const cc = gameState.courtCase;
  const contacts = getAvailableContacts(gameState);
  const chancePercent = Math.round(cc.totalSuccessChance * 100);

  // Charges list
  const chargesHtml = cc.charges.map(c => `<li>${c}</li>`).join('');

  // Contacts grid
  const contactCards = contacts.map(c => {
    let cls = 'court-contact-card';
    if (c.alreadyUsed) cls += ' used';
    else if (!c.available) cls += ' disabled';

    const chanceDisplay = c.alreadyUsed ? '✓ PAID' : `${Math.round(c.computedChance * 100)}%`;
    const costDisplay = c.computedCost === 0 ? 'FREE' : `$${c.computedCost.toLocaleString()}`;

    let reqNote = '';
    if (c.requires && !c.meetsRequirement) {
      const type = HENCHMEN_TYPES.find(t => t.id === c.requires);
      reqNote = `<div class="text-dim" style="font-size:0.7rem">Requires: ${type ? type.name : c.requires}</div>`;
    }

    const onclick = c.available && !c.alreadyUsed ? `onclick="doPayContact('${c.id}')"` : '';

    return `
      <div class="${cls}" ${onclick}>
        <div style="font-size:1.5rem">${c.emoji}</div>
        <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700">${c.name}</div>
        <div class="text-dim" style="font-size:0.7rem">${c.desc}</div>
        <div style="font-family:var(--font-display);margin:0.3rem 0">
          <span class="neon-green">${costDisplay}</span> · <span class="neon-cyan">${chanceDisplay}</span>
        </div>
        ${reqNote}
      </div>
    `;
  }).join('');

  // Verdict section if already resolved
  if (cc.resolved && cc.verdict) {
    const isGuilty = cc.verdict === 'guilty';
    const isFallGuy = cc.verdict === 'fall_guy';
    const isPleaDeal = cc.verdict === 'plea_deal';

    let verdictEmoji = isGuilty ? '🔨' : isFallGuy ? '🎭' : isPleaDeal ? '🤝' : '🎉';
    let verdictText = isGuilty ? 'GUILTY' : isFallGuy ? 'CASE CLOSED' : isPleaDeal ? 'PLEA DEAL ACCEPTED' : 'NOT GUILTY';
    let verdictClass = (isGuilty || isPleaDeal) ? 'verdict-guilty' : 'verdict-not-guilty';
    let detailHtml = '';

    if ((isGuilty || isPleaDeal) && cc.penalties && cc.penalties.length > 0) {
      detailHtml = `<ul style="text-align:left;margin:1rem auto;max-width:320px;font-size:0.85rem;list-style:none;padding:0">
        ${cc.penalties.map(p => `<li style="margin:0.3rem 0">⚡ ${p}</li>`).join('')}
      </ul>`;
    } else {
      detailHtml = `<p style="margin-top:1rem">${cc.sentence || 'You walk free... this time.'}</p>`;
    }

    return `
      <div class="court-screen">
        <div class="court-box">
          <h2 class="section-title neon-purple">⚖️ FEDERAL COURTHOUSE</h2>
          <div class="title-divider"></div>
          <div style="text-align:center;padding:2rem 0">
            <p style="font-family:var(--font-display);font-size:2rem" class="${verdictClass}">
              ${verdictEmoji} ${verdictText}
            </p>
            ${detailHtml}
          </div>
          <button class="btn btn-primary btn-glow" onclick="exitCourt()" style="width:100%">
            ${gameState.gameOver ? '💀 GAME OVER' : '🚶 CONTINUE'}
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="court-screen">
      <div class="court-box">
        ${renderToolbar()}
        ${backButton()}
        <h2 class="section-title neon-purple">⚖️ FEDERAL COURTHOUSE</h2>
        <p class="text-dim">You've been arrested. Time to face the music.</p>
        <div class="title-divider"></div>

        <h3 class="section-title neon-red" style="margin-top:1rem">📋 CHARGES</h3>
        <ul style="margin:0.5rem 0 1rem 1.5rem;font-size:0.9rem">${chargesHtml}</ul>

        <h3 class="section-title neon-cyan">🤝 CONTACTS — Pay to Improve Your Odds</h3>
        <p class="text-dim" style="font-size:0.8rem;margin-bottom:0.5rem">Each contact has an independent chance. Multiple contacts stack.</p>

        <div class="court-contacts-grid">${contactCards}</div>

        ${cc.evidenceStrength !== undefined ? `
          <div style="margin:1rem 0;padding:0.8rem;border:1px solid ${cc.evidenceStrength > 60 ? 'var(--neon-red)' : cc.evidenceStrength > 30 ? 'var(--neon-yellow)' : 'var(--neon-green)'};border-radius:8px;background:rgba(0,0,0,0.3)">
            <div style="font-family:var(--font-display);font-size:0.8rem;margin-bottom:0.3rem">
              📁 EVIDENCE STRENGTH: <span class="${cc.evidenceStrength > 60 ? 'neon-red' : cc.evidenceStrength > 30 ? 'neon-yellow' : 'neon-green'}" style="font-size:1.1rem">${cc.evidenceStrength}%</span>
              <span class="text-dim" style="font-size:0.7rem;margin-left:0.5rem">${cc.evidenceStrength > 70 ? 'Overwhelming' : cc.evidenceStrength > 50 ? 'Strong' : cc.evidenceStrength > 30 ? 'Moderate' : 'Weak'}</span>
            </div>
            <div class="court-chance-bar">
              <div class="court-chance-fill" style="width:${cc.evidenceStrength}%;background:${cc.evidenceStrength > 60 ? 'var(--neon-red)' : cc.evidenceStrength > 30 ? 'var(--neon-yellow)' : 'var(--neon-green)'}"></div>
            </div>
            <p class="text-dim" style="font-size:0.7rem;margin-top:0.3rem">Higher evidence = harder to beat at trial. Intimidate witnesses to weaken the case.</p>
          </div>
        ` : ''}

        ${cc.witnesses && cc.witnesses.length > 0 ? `
          <h3 class="section-title neon-red" style="margin-top:1rem">👁️ WITNESSES — Intimidate to Weaken Evidence</h3>
          <p class="text-dim" style="font-size:0.8rem;margin-bottom:0.5rem">Requires an enforcer or assassin crew member. Success weakens the prosecution's case.</p>
          <div class="court-contacts-grid">
            ${cc.witnesses.map((w, i) => {
              const intimidated = cc.witnessesIntimidated && cc.witnessesIntimidated.includes(i);
              const hasEnforcer = gameState.henchmen && gameState.henchmen.some(h => (h.type === 'enforcer' || h.type === 'assassin') && !h.injured);
              const canIntimidate = !intimidated && hasEnforcer;
              return `
                <div class="court-contact-card ${intimidated ? 'used' : (!canIntimidate ? 'disabled' : '')}" ${canIntimidate ? `onclick="doIntimidateWitness(${i})"` : ''}>
                  <div style="font-size:1.5rem">${w.type === 'forensic' ? '🔬' : w.type === 'insider' ? '🐀' : w.type === 'undercover' ? '🕵️' : '👤'}</div>
                  <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700">${w.name}</div>
                  <div class="text-dim" style="font-size:0.7rem">Type: ${w.type} · Strength: ${w.strength}</div>
                  <div style="font-family:var(--font-display);margin:0.3rem 0">
                    ${intimidated ? '<span class="neon-green">✓ DEALT WITH</span>' : !hasEnforcer ? '<span class="neon-red" style="font-size:0.7rem">Need enforcer/assassin</span>' : '<span class="neon-yellow">INTIMIDATE</span>'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <div style="margin:1rem 0">
          <div style="font-family:var(--font-display);font-size:0.8rem;margin-bottom:0.3rem">
            CHANCE OF ACQUITTAL: <span class="${chancePercent >= 50 ? 'neon-green' : chancePercent >= 25 ? 'neon-yellow' : 'neon-red'}" style="font-size:1.2rem">${chancePercent}%</span>
            ${cc.evidenceStrength !== undefined ? `<span class="text-dim" style="font-size:0.7rem;margin-left:0.5rem">(Evidence penalty: -${Math.round((cc.evidenceStrength || 0) / 2)}%)</span>` : ''}
          </div>
          <div class="court-chance-bar">
            <div class="court-chance-fill" style="width:${chancePercent}%"></div>
          </div>
        </div>

        ${cc.pleaDealOffered && !cc.pleaDealAccepted ? `
          <div style="margin:0.5rem 0;padding:0.8rem;border:2px solid var(--neon-yellow);border-radius:8px;background:rgba(255,204,0,0.05)">
            <h4 style="color:var(--neon-yellow);margin:0 0 0.3rem 0">🤝 PLEA DEAL OFFERED</h4>
            <p class="text-dim" style="font-size:0.8rem;margin-bottom:0.5rem">
              The DA is willing to negotiate. Accept a reduced sentence (${Math.round((cc.pleaDealReduction || 0.5) * 100)}% reduction) in exchange for cooperation.
              <br><span style="color:var(--neon-red);font-size:0.75rem">Warning: You'll be marked as a snitch. The streets remember.</span>
            </p>
            <button class="btn btn-secondary" onclick="doAcceptPleaDeal()" style="width:100%;border-color:var(--neon-yellow);color:var(--neon-yellow)">
              🤝 ACCEPT PLEA DEAL — Reduced sentence, but lose street cred
            </button>
          </div>
        ` : ''}

        ${cc.hasFallGuy && !cc.fallGuyUsed ? `
          <button class="btn btn-secondary" onclick="doUseFallGuy()" style="width:100%;margin-top:0.5rem;border-color:var(--neon-orange)">
            🎭 USE FALL GUY — He takes the rap, you walk free
          </button>
        ` : ''}
        <button class="btn btn-primary btn-glow" onclick="doGoToTrial()" style="width:100%;margin-top:0.5rem">⚖️ GO TO TRIAL</button>
        <p class="text-dim" style="font-size:0.7rem;margin-top:0.5rem;text-align:center">
          Offense #${(gameState.investigation.timesArrested || 0) + 1} · ${(gameState.investigation.timesArrested || 0) >= 2 ? '⚠️ THIRD STRIKE = GAME OVER' : 'Guilty = prison time + asset forfeiture'}
        </p>
      </div>
    </div>
  `;
}

function doPayContact(contactId) {
  const result = payCourtContact(gameState, contactId);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    updateAchievementStats(gameState, 'court_contact', { contactId });
  }
  render();
}

function doUseFallGuy() {
  playSound('cash');
  const result = useFallGuy(gameState);
  if (result.success) {
    gameState.messageLog.push(`🎭 ${result.msg}`);
    updateAchievementStats(gameState, 'fall_guy', {});
    processNewAchievements();
    render();
  }
}

function doGoToTrial() {
  playSound('click');
  const result = resolveCourtCase(gameState);

  gameState.courtCase.resolved = true;
  if (result.verdict === 'guilty') {
    gameState.courtCase.sentence = result.msg;
    if (result.penalties) gameState.courtCase.penalties = result.penalties;
    if (result.gameOver) {
      gameState.gameOver = true;
    }
    updateAchievementStats(gameState, 'verdict', { verdict: 'guilty', prisonDays: result.prisonDays || 0 });
  } else {
    gameState.courtCase.sentence = null;
    updateAchievementStats(gameState, 'verdict', { verdict: 'not_guilty' });
    awardXP(gameState, 'not_guilty');
  }
  processNewAchievements();

  render();
}

function exitCourt() {
  if (gameState.gameOver) {
    playSound('gameover');
    currentScreen = 'gameover';
  } else {
    gameState.courtCase = null;
    currentScreen = 'game';
    // Generate new prices at current location after jail
    generatePrices(gameState);
    recordPriceHistory(gameState);
  }
  render();
}

function doAcceptPleaDeal() {
  if (typeof acceptPleaDeal !== 'function') return;
  if (!confirm('Accept plea deal? You will serve reduced time but be marked as a snitch.')) return;
  playSound('click');
  const result = acceptPleaDeal(gameState);
  if (result.success) {
    gameState.messageLog.push(result.msg);
    if (typeof updateAchievementStats === 'function') updateAchievementStats(gameState, 'plea_deal', {});
    processNewAchievements();
  } else {
    showNotification(result.msg, 'error');
  }
  render();
}

function doIntimidateWitness(witnessIndex) {
  if (typeof intimidateWitness !== 'function') return;
  playSound('click');
  const result = intimidateWitness(gameState, witnessIndex);
  if (result.success) {
    showNotification(result.msg, 'success');
    gameState.messageLog.push(result.msg);
  } else {
    showNotification(result.msg, 'error');
    gameState.messageLog.push(result.msg);
  }
  render();
}

// ============================================================
// CREW PANEL
// ============================================================
function renderCrewPanel() {
  const loc = LOCATIONS.find(l => l.id === gameState.currentLocation);
  const hasHospital = loc && loc.hasHospital;

  const crewCards = gameState.henchmen.map((h, i) => {
    const type = HENCHMEN_TYPES.find(t => t.id === h.type);
    if (!type) return '';

    // Ensure new fields exist
    if (h.loyalty === undefined || h.loyalty === null || isNaN(h.loyalty)) { h.loyalty = 100; h.health = 100; h.maxHealth = 100; h.injured = false; h.daysSincePaid = 0; }
    if (h.daysSincePaid === undefined || h.daysSincePaid === null || isNaN(h.daysSincePaid)) { h.daysSincePaid = 0; }

    const loyaltyColor = h.loyalty > 60 ? 'var(--neon-green)' : h.loyalty > 30 ? 'var(--neon-yellow)' : 'var(--neon-red)';
    const healthColor = h.health > 60 ? 'var(--neon-green)' : h.health > 30 ? 'var(--neon-yellow)' : 'var(--neon-red)';

    // Crew expansion rank info
    const rank = h.rank || 0;
    const rankData = typeof CREW_RANKS !== 'undefined' ? CREW_RANKS[rank] : null;
    const rankName = rankData ? rankData.name : 'Crew';
    const canPromote = typeof canPromoteCrew === 'function' ? canPromoteCrew(gameState, i) : null;
    const daysServed = h.daysServed || 0;
    const traits = h.traits || [];
    const betrayalRisk = h.betrayalRisk || 0;
    const warningSign = betrayalRisk > 50;

    return `
      <div class="crew-card ${h.injured ? 'injured' : ''} ${warningSign ? 'crew-warning' : ''}">
        <div style="flex:1">
          <div style="font-family:var(--font-display);font-size:0.9rem;font-weight:700;color:var(--neon-cyan);display:flex;align-items:center;gap:0.4rem">
            ${h.name} ${h.injured ? '🤕' : ''}
            <span class="crew-rank-badge crew-rank-${rank}">${rankName}</span>
          </div>
          <div class="text-dim" style="font-size:0.75rem">${type.name} · $${typeof getCrewDailyPay === 'function' ? getCrewDailyPay(h) : type.dailyPay}/day · ${daysServed}d served</div>
          ${type.special ? `<div style="font-size:0.7rem;color:var(--neon-yellow);margin-top:0.2rem">${type.special}</div>` : ''}
          ${traits.length > 0 ? `<div style="margin-top:0.2rem">${traits.map(t => {
            const traitData = typeof CREW_TRAITS !== 'undefined' ? CREW_TRAITS.find(tr => tr.id === t) : null;
            return `<span class="crew-trait" title="${traitData ? traitData.id : t}">${traitData ? traitData.emoji + ' ' + traitData.name : t}</span>`;
          }).join('')}</div>` : ''}
          <div style="display:flex;gap:1rem;margin-top:0.3rem;align-items:center">
            <span style="font-size:0.65rem;font-family:var(--font-display)">
              ❤️ <span class="loyalty-bar"><span class="loyalty-fill" style="width:${h.health}%;background:${healthColor}"></span></span> ${h.health}
            </span>
            <span style="font-size:0.65rem;font-family:var(--font-display)">
              ⭐ <span class="loyalty-bar"><span class="loyalty-fill" style="width:${h.loyalty}%;background:${loyaltyColor}"></span></span> ${h.loyalty}
            </span>
          </div>
          <div class="text-dim" style="font-size:0.7rem;margin-top:0.2rem">
            Combat: +${type.combat} · Carry: +${type.carry}
          </div>
          ${warningSign ? `<div style="font-size:0.7rem;color:var(--neon-red);margin-top:0.2rem">⚠️ Acting suspicious...</div>` : ''}
          <div style="margin-top:0.3rem;font-size:0.7rem">
            <span style="color:var(--neon-purple)">📋 Assignment:</span>
            <select onchange="doAssignCrewJob(${i}, this.value)" style="background:var(--bg-dark);color:var(--text-main);border:1px solid var(--neon-purple);border-radius:4px;padding:2px 4px;font-size:0.7rem;margin-left:0.3rem">
              <option value="idle" ${(!h.assignedTo || h.assignedTo === 'idle') ? 'selected' : ''}>Idle (with you)</option>
              <option value="bodyguard" ${h.assignedTo === 'bodyguard' ? 'selected' : ''}>🛡️ Personal Guard</option>
              <option value="territory_guard" ${h.assignedTo === 'territory_guard' ? 'selected' : ''}>🏴 Territory Guard</option>
              <option value="front_cover" ${h.assignedTo === 'front_cover' ? 'selected' : ''}>🏢 Run Front Business</option>
              <option value="drug_runner" ${h.assignedTo === 'drug_runner' ? 'selected' : ''}>💊 Drug Runner</option>
              <option value="body_disposal" ${h.assignedTo === 'body_disposal' ? 'selected' : ''}>💀 Body Disposal</option>
              <option value="lookout_duty" ${h.assignedTo === 'lookout_duty' ? 'selected' : ''}>👁️ Lookout/Intel</option>
              <option value="lab_worker" ${h.assignedTo === 'lab_worker' ? 'selected' : ''}>⚗️ Lab Worker</option>
              <option value="enforcer_duty" ${h.assignedTo === 'enforcer_duty' ? 'selected' : ''}>💪 Enforcer/Collections</option>
              <option value="driver" ${h.assignedTo === 'driver' ? 'selected' : ''}>🚗 Getaway Driver</option>
              <option value="recruiter" ${h.assignedTo === 'recruiter' ? 'selected' : ''}>📢 Recruit New Crew</option>
            </select>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.3rem">
          ${canPromote && canPromote.can ? `<button class="btn btn-sm crew-promote-btn" onclick="doPromoteCrew(${i})">⬆️ PROMOTE</button>` : ''}
          ${warningSign ? `<button class="btn btn-sm btn-secondary" onclick="doConfrontCrew(${i})">🔍 CONFRONT</button>` : ''}
          ${h.injured && hasHospital ? `<button class="btn btn-sm btn-buy" onclick="doHealCrew(${i})">🏥 HEAL</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="doFireCrew(${i})">🔥 FIRE</button>
        </div>
      </div>
    `;
  }).join('');

  const totalPay = gameState.henchmen.reduce((sum, h) => {
    const type = HENCHMEN_TYPES.find(t => t.id === h.type);
    return sum + (type ? type.dailyPay : 0);
  }, 0);

  // Build hire section directly in crew panel
  const canHireHere = loc && loc.hasBlackMarket;
  const maxCrew = typeof getMaxCrewSize === 'function' ? getMaxCrewSize(gameState) : 4;
  const crewFull = gameState.henchmen.length >= maxCrew;

  const hireRows = HENCHMEN_TYPES.filter(h => !h.ngPlus || (gameState.newGamePlus && gameState.newGamePlus.active)).map(h => {
    const canAfford = gameState.cash >= h.cost;
    const disabled = !canHireHere || crewFull || !canAfford;
    const reasonText = !canHireHere ? 'No black market here' : crewFull ? 'Crew full' : !canAfford ? 'Not enough cash' : '';
    return `
      <tr>
        <td style="font-weight:700">${h.name}</td>
        <td style="font-size:0.75rem;color:var(--neon-yellow);max-width:200px">${h.special || 'General purpose'}</td>
        <td>+${h.combat}</td>
        <td>+${h.carry}</td>
        <td>$${h.cost.toLocaleString()}</td>
        <td>$${h.dailyPay}/day</td>
        <td>
          ${disabled
            ? `<button class="btn btn-sm btn-secondary" disabled title="${reasonText}" style="opacity:0.4">HIRE</button>`
            : `<button class="btn btn-sm btn-buy" onclick="doHireFromCrewPanel('${h.id}')">HIRE</button>`}
        </td>
      </tr>
    `;
  }).join('');

  // Assignment summary
  // Count job assignments
  const jobCounts = {};
  const JOB_INFO = {
    idle: { emoji: '🧍', name: 'With You', desc: 'Available for combat & travel' },
    bodyguard: { emoji: '🛡️', name: 'Personal Guard', desc: '+Combat in fights' },
    territory_guard: { emoji: '🏴', name: 'Territory Guard', desc: '+5 defense each' },
    front_cover: { emoji: '🏢', name: 'Front Worker', desc: '+10% business income each (max 50%)' },
    drug_runner: { emoji: '💊', name: 'Drug Runner', desc: '$200-500/day passive income' },
    body_disposal: { emoji: '💀', name: 'Body Disposal', desc: 'Auto-dispose 1 body/day each' },
    lookout_duty: { emoji: '👁️', name: 'Lookout', desc: '-10% encounter chance each (max 40%)' },
    lab_worker: { emoji: '⚗️', name: 'Lab Worker', desc: 'Speed up processing by 1 day each' },
    enforcer_duty: { emoji: '💪', name: 'Enforcer', desc: 'Protection racket income' },
    driver: { emoji: '🚗', name: 'Driver', desc: '-15% travel time each (max 50%)' },
    recruiter: { emoji: '📢', name: 'Recruiter', desc: '5% daily chance to find new crew each' },
  };
  gameState.henchmen.forEach(h => {
    const job = h.assignedTo || 'idle';
    jobCounts[job] = (jobCounts[job] || 0) + 1;
  });
  const jobSummaryHtml = Object.entries(jobCounts).map(([job, count]) => {
    const info = JOB_INFO[job] || { emoji: '❓', name: job, desc: '' };
    return `<span title="${info.desc}">${info.emoji} ${info.name}: <b>${count}</b></span>`;
  }).join(' · ');

  const assignmentSummary = gameState.henchmen.length > 0 ? `
    <div style="margin-top:1rem;padding:0.5rem;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:4px">
      <h4 style="color:var(--neon-green);margin:0 0 0.3rem 0;font-size:0.85rem">CREW OPERATIONS</h4>
      <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:0.5rem">${jobSummaryHtml}</div>
      <div style="font-size:0.75rem;color:var(--text-dim);display:flex;flex-wrap:wrap;gap:0.5rem">
        ${gameState.henchmen.some(h => h.type === 'lawyer' && !h.injured) ? '<span>⚖️ Lawyer: -40% investigation</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'lookout' && !h.injured) ? '<span>👁️ Lookout: -15% encounter chance</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'chemist' && !h.injured) ? '<span>🧪 Chemist: Can cut drugs +20%</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'fall_guy' && !h.injured) ? '<span>🎯 Fall Guy: Arrest protection (1x)</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'accountant' && !h.injured) ? '<span>📊 Accountant: +30% laundering</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'diplomat_crew' && !h.injured) ? '<span>🕊️ Diplomat: +15% diplomacy</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'pilot' && !h.injured) ? '<span>✈️ Pilot: Air transport ready</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'boat_captain' && !h.injured) ? '<span>🚤 Captain: Sea transport ready</span>' : ''}
        ${gameState.henchmen.some(h => h.type === 'hacker' && !h.injured) ? '<span>💻 Hacker: Digital ops ready</span>' : ''}
        <span>⚔️ Total Combat: +${gameState.henchmen.reduce((s, h) => s + (h.injured ? 0 : (HENCHMEN_TYPES.find(t => t.id === h.type)?.combat || 0)), 0)}</span>
        <span>📦 Total Carry: +${gameState.henchmen.reduce((s, h) => s + (h.injured ? 0 : (HENCHMEN_TYPES.find(t => t.id === h.type)?.carry || 0)), 0)}</span>
      </div>
    </div>
  ` : '';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <div class="crew-panel">
        <h2 class="section-title neon-cyan">👥 YOUR CREW (${gameState.henchmen.length}/${maxCrew})</h2>
        <p class="text-dim" style="margin-bottom:0.8rem">Daily payroll: <span class="neon-yellow">$${totalPay.toLocaleString()}/day</span> | Cash: <span class="neon-green">$${gameState.cash.toLocaleString()}</span></p>
        ${crewCards || '<p class="text-dim">No crew members yet. Hire from below!</p>'}
        ${assignmentSummary}
      </div>

      <div style="margin-top:1.5rem">
        <h3 class="section-title neon-yellow">🤝 AVAILABLE FOR HIRE ${!canHireHere ? '<span style="color:var(--neon-red);font-size:0.7rem">(Need Black Market)</span>' : ''}</h3>
        <div style="overflow-x:auto">
          <table class="data-table"><thead><tr><th>Type</th><th>Abilities</th><th>Combat</th><th>Carry</th><th>Cost</th><th>Daily Pay</th><th></th></tr></thead>
          <tbody>${hireRows}</tbody></table>
        </div>
      </div>

      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem">← BACK</button>
    </div>
  `;
}

function doAssignCrewJob(index, job) {
  var h = gameState.henchmen[index];
  if (!h) return;
  var oldJob = h.assignedTo || 'idle';
  h.assignedTo = job === 'idle' ? null : job;
  var JOB_NAMES = {
    idle: 'Idle (with you)', bodyguard: 'Personal Guard', territory_guard: 'Territory Guard',
    front_cover: 'Run Front Business', drug_runner: 'Drug Runner', body_disposal: 'Body Disposal',
    lookout_duty: 'Lookout/Intel', lab_worker: 'Lab Worker', enforcer_duty: 'Enforcer/Collections',
    driver: 'Getaway Driver', recruiter: 'Recruit New Crew'
  };
  showNotification(h.name + ' assigned to: ' + (JOB_NAMES[job] || job), 'success');
  playSound('click');
  render();
}

function doFireCrew(index) {
  const result = fireHenchman(gameState, index);
  if (result.success) {
    playSound('click');
    gameState.messageLog.push(result.msg);
    updateAchievementStats(gameState, 'crew_fired', {});
  }
  render();
}

function doHealCrew(index) {
  const result = healCrewMember(gameState, index);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    updateAchievementStats(gameState, 'crew_healed', {});
  }
  render();
}

function doPromoteCrew(index) {
  if (typeof promoteCrew !== 'function') return;
  const result = promoteCrew(gameState, index);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    if (typeof updateAchievementStats === 'function') updateAchievementStats(gameState, 'crew_promoted', { rank: result.newRank });
    processNewAchievements();
  } else {
    alert(result.msg);
  }
  render();
}

function doConfrontCrew(index) {
  if (typeof confrontCrew !== 'function') return;
  const result = confrontCrew(gameState, index);
  if (result.success) {
    playSound('click');
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
  }
  render();
}

function doHireFromCrewPanel(typeId) {
  const result = hireHenchman(gameState, typeId);
  if (result.success) {
    playSound('buy');
    gameState.messageLog.push(result.msg);
    showNotification(result.msg, 'success');
  } else {
    playSound('error');
    showNotification(result.msg, 'error');
  }
  render();
}

// ============================================================
// FRONT BUSINESSES / MONEY LAUNDERING
// ============================================================
function renderFronts() {
  const owned = gameState.frontBusinesses || [];
  const totalDailyIncome = owned.reduce((sum, o) => {
    const b = FRONT_BUSINESSES.find(x => x.id === o.id);
    return sum + (b ? b.dailyIncome : 0);
  }, 0);
  const totalLaunderCap = owned.reduce((sum, o) => {
    const b = FRONT_BUSINESSES.find(x => x.id === o.id);
    return sum + (b ? b.launderMax : 0);
  }, 0);

  const ownedIds = owned.map(o => o.id);

  const shopCards = FRONT_BUSINESSES.map(biz => {
    const isOwned = ownedIds.includes(biz.id);
    const canAfford = gameState.cash >= biz.cost;
    return `
      <div class="front-card ${isOwned ? 'owned' : (!canAfford ? 'disabled' : '')}">
        <div style="font-size:1.5rem">${biz.emoji}</div>
        <div class="front-name">${biz.name}</div>
        <div class="text-dim" style="font-size:0.65rem">${biz.desc}</div>
        <div style="font-size:0.75rem;margin:0.3rem 0">
          <span class="neon-green">$${biz.dailyIncome.toLocaleString()}/day</span> ·
          <span class="neon-cyan">Launder $${biz.launderMax.toLocaleString()}/day</span>
        </div>
        ${biz.heatReduction > 0 ? `<div style="font-size:0.65rem">🌡️ -${biz.heatReduction} heat/day</div>` : ''}
        ${isOwned ?
          '<div class="neon-green" style="font-size:0.8rem;font-weight:700">✓ OWNED</div>' :
          `<button class="btn btn-sm ${canAfford ? 'btn-buy' : 'btn-secondary'}" ${canAfford ? `onclick="doBuyBusiness('${biz.id}')"` : 'disabled'}>
            $${biz.cost.toLocaleString()}
          </button>`
        }
      </div>
    `;
  }).join('');

  // Launder section
  let launderHtml = '';
  if (owned.length > 0) {
    launderHtml = `
      <div style="margin:1rem 0;padding:1rem;border:1px solid var(--neon-cyan);border-radius:8px;background:rgba(0,255,255,0.03)">
        <h3 class="section-title neon-cyan">💰 LAUNDER MONEY</h3>
        <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:0.5rem;padding:0.5rem;background:rgba(0,255,255,0.05);border-radius:6px">
          <b style="color:var(--neon-cyan)">How laundering works:</b><br>
          Drug money is "dirty" — spending large amounts draws police attention and investigation.<br>
          <b>Laundering</b> moves cash through your legitimate businesses, making it "clean."<br>
          ✅ Clean money doesn't increase heat when spent<br>
          ✅ Reduces your investigation level by 1-3 points per wash<br>
          ✅ Each business has a daily laundering capacity<br>
          ✅ Better businesses = more capacity (upgrade to launder more)<br>
          💡 <b>Tip:</b> Hire an <b>accountant</b> crew member to boost laundering by 25%
        </div>
        <div style="margin:0.5rem 0;font-size:0.8rem">
          Daily capacity: <span class="neon-green">$${totalLaunderCap.toLocaleString()}</span> ·
          Cash available: <span class="neon-green">$${gameState.cash.toLocaleString()}</span>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem">
          <input id="launderAmount" type="number" class="input-field" style="flex:1" value="${Math.min(gameState.cash, totalLaunderCap)}" max="${Math.min(gameState.cash, totalLaunderCap)}" min="0" />
          <button class="btn btn-buy" onclick="doLaunder()">💰 LAUNDER</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="screen-container">
      <div class="panel">
        ${renderToolbar()}
        ${backButton()}
        <h2 class="section-title neon-cyan">🏢 FRONT BUSINESSES</h2>
        <p class="text-dim" style="font-size:0.8rem">Buy legitimate businesses to launder money and earn passive income.</p>
        <div class="title-divider"></div>

        ${owned.length > 0 ? `
          <div style="text-align:center;margin:0.5rem 0;font-size:0.85rem">
            📊 <span class="neon-green">$${totalDailyIncome.toLocaleString()}/day</span> income ·
            🏢 <span class="neon-cyan">${owned.length}</span> businesses ·
            💰 Launder up to <span class="neon-green">$${totalLaunderCap.toLocaleString()}/day</span>
          </div>
        ` : ''}

        ${launderHtml}

        <div class="fronts-grid">${shopCards}</div>

        <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="width:100%;margin-top:1rem">← BACK</button>
      </div>
    </div>
  `;
}

function doBuyBusiness(bizId) {
  const result = buyFrontBusiness(gameState, bizId);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    awardXP(gameState, 'buy_drug', 15); // reuse XP action
    processNewAchievements();
  } else {
    alert(result.msg);
  }
  render();
}

// ============================================================
// PROPERTIES SCREEN
// ============================================================
function renderProperties() {
  if (typeof PROPERTY_TYPES === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title neon-purple">🏠 PROPERTIES</h2><p>Property system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const locId = gameState.currentLocation;
  const loc = LOCATIONS.find(l => l.id === locId);
  const ownedHere = [];
  const ownedElsewhere = [];

  // Collect all owned properties
  for (const [propLocId, props] of Object.entries(gameState.properties || {})) {
    for (const prop of (Array.isArray(props) ? props : [])) {
      if (propLocId === locId) ownedHere.push(prop);
      else ownedElsewhere.push({ ...prop, locationId: propLocId });
    }
  }

  const totalValue = typeof getTotalPropertyValue === 'function' ? getTotalPropertyValue(gameState) : 0;
  const totalCount = typeof getTotalPropertyCount === 'function' ? getTotalPropertyCount(gameState) : 0;

  // Buy panel - what's available to buy here
  const buyCards = PROPERTY_TYPES.map((propType) => {
    const typeId = propType.id;
    const alreadyOwned = ownedHere.find(p => p.typeId === typeId || p.type === typeId);
    const currentTier = alreadyOwned ? alreadyOwned.tier : -1;

    return propType.tiers.map((tier, tierIdx) => {
      const tierNum = tierIdx + 1;
      const owned = currentTier >= tierIdx;
      const isUpgrade = currentTier === tierIdx - 1;
      const canAfford = gameState.cash >= tier.cost;
      const locked = !isUpgrade && !owned;

      return `
        <div class="property-card ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}">
          <div class="prop-header">
            <span style="font-size:1.3rem">${propType.emoji}</span>
            <div>
              <div class="prop-name">${tier.name}</div>
              <div class="prop-type text-dim">${propType.name}</div>
            </div>
            <span class="prop-tier">T${tierNum}</span>
          </div>
          <div class="prop-details">
            ${tier.stashCapacity ? `<span class="prop-tag">📦 ${tier.stashCapacity} stash</span>` : ''}
            ${tier.crewBonus ? `<span class="prop-tag">👥 +${tier.crewBonus} crew</span>` : ''}
            ${tier.frontSlots ? `<span class="prop-tag">🏢 ${tier.frontSlots} front slots</span>` : ''}
            ${tier.labCapacity ? `<span class="prop-tag">⚗️ Lab capacity ${tier.labCapacity}</span>` : ''}
            <span class="prop-tag">🔧 $${tier.maintenance}/day</span>
          </div>
          ${owned ? '<div class="neon-green" style="font-size:0.8rem;font-weight:700;text-align:center;margin-top:0.3rem">✓ OWNED</div>' :
            isUpgrade ? `<button class="btn btn-sm ${canAfford ? 'btn-buy' : 'btn-secondary'}" ${canAfford ? `onclick="doBuyProperty('${typeId}', ${tierNum})"` : 'disabled'} style="width:100%;margin-top:0.3rem">
              ${currentTier > 0 ? '⬆️ UPGRADE' : '🛒 BUY'} $${tier.cost.toLocaleString()}
            </button>` : `<div class="text-dim" style="font-size:0.7rem;text-align:center;margin-top:0.3rem">${currentTier > 0 ? 'Upgrade from T' + currentTier + ' first' : 'Buy T1 first'}</div>`
          }
        </div>
      `;
    }).join('');
  }).join('');

  // Owned properties summary
  const ownedCards = ownedHere.map(p => {
    const propType = PROPERTY_TYPES.find(pt => pt.id === p.typeId || pt.id === p.type) || PROPERTY_TYPES[p.typeId];
    const tierData = propType ? propType.tiers[p.tier] : null;
    return `<div class="property-card owned">
      <div class="prop-header">
        <span style="font-size:1.3rem">${propType ? propType.emoji : '🏠'}</span>
        <div><div class="prop-name">${tierData ? tierData.name : (propType ? propType.name : (p.type || p.typeId))}</div></div>
        <span class="prop-tier">T${p.tier + 1}</span>
      </div>
    </div>`;
  }).join('');

  const elsewhereCards = ownedElsewhere.map(p => {
    const propType = PROPERTY_TYPES.find(pt => pt.id === p.typeId || pt.id === p.type) || PROPERTY_TYPES[p.typeId];
    const tierData = propType ? propType.tiers[p.tier] : null;
    const propLoc = LOCATIONS.find(l => l.id === p.locationId);
    return `<div class="property-card owned" style="opacity:0.7">
      <div class="prop-header">
        <span style="font-size:1rem">${propType ? propType.emoji : '🏠'}</span>
        <div>
          <div class="prop-name" style="font-size:0.75rem">${tierData ? tierData.name : (propType ? propType.name : (p.type || p.typeId))}</div>
          <div class="text-dim" style="font-size:0.65rem">📍 ${propLoc ? propLoc.name : p.locationId}</div>
        </div>
        <span class="prop-tier" style="font-size:0.65rem">T${p.tier + 1}</span>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title neon-purple">🏠 PROPERTIES — ${loc ? loc.name : locId}</h2>

      <div class="stats-overview" style="margin-bottom:1rem">
        <div class="stat-card" style="border-color:var(--neon-purple)">
          <div class="stat-card-label">TOTAL PROPERTIES</div>
          <div class="stat-card-value neon-purple">${totalCount}</div>
        </div>
        <div class="stat-card" style="border-color:var(--neon-purple)">
          <div class="stat-card-label">TOTAL VALUE</div>
          <div class="stat-card-value neon-green">$${totalValue.toLocaleString()}</div>
        </div>
        <div class="stat-card" style="border-color:var(--neon-purple)">
          <div class="stat-card-label">LOCAL STASH</div>
          <div class="stat-card-value neon-cyan">${typeof getStashCapacity === 'function' ? getStashCapacity(gameState, locId) : 0}</div>
        </div>
      </div>

      ${ownedHere.length > 0 ? `
        <h3 class="section-title" style="color:var(--neon-purple)">📍 YOUR PROPERTIES HERE</h3>
        <div class="properties-grid">${ownedCards}</div>
      ` : ''}

      <h3 class="section-title" style="color:var(--neon-purple)">🛒 AVAILABLE IN ${loc ? loc.name.toUpperCase() : ''}</h3>
      <div class="prop-buy-grid">${buyCards}</div>

      ${ownedElsewhere.length > 0 ? `
        <h3 class="section-title" style="color:var(--neon-purple);margin-top:1.5rem">🌍 PROPERTIES ELSEWHERE</h3>
        <div class="properties-grid">${elsewhereCards}</div>
      ` : ''}

      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="width:100%;margin-top:1rem">← BACK</button>
    </div>
  `;
}

function doBuyProperty(typeId, tier) {
  if (typeof buyProperty !== 'function') return;
  const result = buyProperty(gameState, typeId, tier - 1);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
    if (typeof updateAchievementStats === 'function') updateAchievementStats(gameState, 'property_buy', { typeId, tier });
    processNewAchievements();
  } else {
    alert(result.msg);
  }
  render();
}

function doLaunder() {
  const input = document.getElementById('launderAmount');
  const amount = parseInt(input?.value || 0);
  if (amount <= 0) return;

  const result = launderMoney(gameState, amount);
  if (result.success) {
    playSound('cash');
    gameState.messageLog.push(result.msg);
  } else {
    alert(result.msg);
  }
  render();
}

// ============================================================
// ACHIEVEMENT NOTIFICATIONS & SCREEN
// ============================================================
let achievementQueue = [];

function processNewAchievements() {
  const earned = checkAchievements(gameState);
  for (const ach of earned) {
    achievementQueue.push(ach);
    const xpResult = awardXP(gameState, 'complete_achievement', 0); // XP already awarded in checkAchievements
    gameState.messageLog.push(`🏆 Achievement Unlocked: ${ach.emoji} ${ach.name} — ${ach.desc}`);
  }
  // Check for level ups
  const lvl = getKingpinLevel(gameState.xp || 0);
  if (lvl.level > (gameState._lastLevel || 1)) {
    gameState._lastLevel = lvl.level;
    gameState.messageLog.push(`⬆️ LEVEL UP! You are now a ${lvl.emoji} ${lvl.title} (Level ${lvl.level})`);
    updateAchievementStats(gameState, 'level_up', {});
    playSound('levelup');
  }
  // Show toast notification for last achievement
  if (earned.length > 0) {
    playSound('achievement');
    showAchievementToast(earned[earned.length - 1]);
  }

  // Check for newly unlocked features (progressive unlock system)
  checkAndAnnounceUnlocks();
}

function showAchievementToast(ach) {
  const existing = document.getElementById('achievement-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'achievement-toast';
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-toast-content">
      <span class="achievement-toast-emoji">${ach.emoji}</span>
      <div>
        <div class="achievement-toast-title">🏆 ${ach.name}</div>
        <div class="achievement-toast-desc">${ach.desc}</div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ============================================================
// DISTRIBUTION / EXPORT SCREEN
// ============================================================
let distManageLocation = null;
let distHireLocation = null;
let distExportLocation = null;

function renderDistribution() {
  const territories = getControlledTerritories(gameState);
  const totalRevenue = getTotalDistributionRevenue(gameState);
  let totalDealers = 0;
  let totalStockValue = 0;
  for (const dist of Object.values(gameState.distribution || {})) {
    totalDealers += dist.dealers.length;
    for (const drugId in dist.stock) {
      const drug = DRUGS.find(d => d.id === drugId);
      if (drug) totalStockValue += Math.round(((drug.minPrice + drug.maxPrice) / 2) * dist.stock[drugId]);
    }
  }

  const locationCards = territories.map(locId => {
    const loc = LOCATIONS.find(l => l.id === locId);
    const dist = gameState.distribution[locId];
    if (!dist) {
      return `<div class="dist-card">
        <div class="dist-header">
          <span class="neon-pink">${loc ? loc.name : locId}</span>
          <span class="dist-tier" style="opacity:0.5">No Operation</span>
        </div>
        <button class="btn btn-sm btn-buy" onclick="doSetupDistribution('${locId}')">🚬 SET UP DISTRIBUTION</button>
      </div>`;
    }
    const tierData = DISTRIBUTION_TIERS[dist.tier - 1];
    const isManaging = distManageLocation === locId;

    // Dealer chips
    const dealerChips = dist.dealers.map((d, i) => {
      const role = DISTRIBUTION_ROLES.find(r => r.id === d.roleId);
      const loyaltyColor = d.loyalty > 60 ? 'var(--neon-green)' : d.loyalty > 30 ? 'yellow' : 'var(--neon-red)';
      return `<span class="dist-dealer-chip" title="Loyalty: ${d.loyalty}%">
        ${role ? role.emoji : '?'} ${d.name}
        <span style="color:${loyaltyColor};font-size:0.55rem">●</span>
        ${isManaging ? `<button class="btn-inline-x" onclick="doFireDistributor('${locId}',${i})">✕</button>` : ''}
      </span>`;
    }).join('');

    // Stock bars
    const stockItems = Object.entries(dist.stock || {}).map(([drugId, amount]) => {
      const drug = DRUGS.find(d => d.id === drugId);
      const pct = (amount / tierData.maxStockPerDrug) * 100;
      return `<div class="dist-stock-row">
        <span style="font-size:0.7rem;width:80px">${drug ? drug.emoji + ' ' + drug.name : drugId}</span>
        <div class="dist-stock-bar"><div class="dist-stock-fill" style="width:${pct}%"></div></div>
        <span style="font-size:0.65rem">${amount}/${tierData.maxStockPerDrug}</span>
      </div>`;
    }).join('') || '<span class="text-dim" style="font-size:0.7rem">No stock</span>';

    // Manage panel (hire, export, upgrade)
    let managePanel = '';
    if (isManaging) {
      // Hire section
      const canHireMore = dist.dealers.length < tierData.maxDealers;
      const hireCards = canHireMore ? DISTRIBUTION_ROLES.map(role => {
        const canAfford = gameState.cash >= role.cost;
        return `<div class="dist-role-card ${canAfford ? '' : 'disabled'}" onclick="${canAfford ? `doHireDistributor('${locId}','${role.id}')` : ''}">
          <div style="font-size:1.2rem">${role.emoji}</div>
          <div style="font-size:0.7rem;font-weight:700">${role.name}</div>
          <div style="font-size:0.6rem;color:var(--text-dim)">${role.desc}</div>
          <div style="font-size:0.65rem;margin-top:0.3rem">
            <span class="neon-green">$${role.cost.toLocaleString()}</span> | $${role.dailyPay}/day
          </div>
          <div style="font-size:0.55rem;color:var(--text-dim)">Sells ${role.sellRate}/day | Heat ${role.heatGen > 0 ? '+' : ''}${role.heatGen}</div>
        </div>`;
      }).join('') : '<span class="text-dim" style="font-size:0.7rem">Max dealers for this tier.</span>';

      // Export section
      const invItems = Object.entries(gameState.inventory).map(([drugId, qty]) => {
        const drug = DRUGS.find(d => d.id === drugId);
        const currentStock = dist.stock[drugId] || 0;
        const maxMore = tierData.maxStockPerDrug - currentStock;
        if (maxMore <= 0) return '';
        return `<div style="display:flex;align-items:center;gap:0.4rem;margin:0.2rem 0">
          <span style="font-size:0.7rem;width:90px">${drug ? drug.emoji + ' ' + drug.name : drugId} (${qty})</span>
          <input type="number" min="1" max="${Math.min(qty, maxMore)}" value="${Math.min(qty, maxMore)}" id="export-${locId}-${drugId}" class="input-field" style="width:60px;padding:0.2rem">
          <button class="btn btn-sm btn-buy" onclick="doExportDrugs('${locId}','${drugId}',document.getElementById('export-${locId}-${drugId}').value)">SEND</button>
        </div>`;
      }).join('') || '<span class="text-dim" style="font-size:0.7rem">No drugs in inventory to export.</span>';

      managePanel = `
        <div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid rgba(255,165,0,0.2)">
          <h4 style="font-size:0.75rem;color:#ff9500;margin-bottom:0.3rem">HIRE DEALERS (${dist.dealers.length}/${tierData.maxDealers})</h4>
          <div class="dist-role-grid">${hireCards}</div>
          <h4 style="font-size:0.75rem;color:#ff9500;margin:0.5rem 0 0.3rem">EXPORT DRUGS</h4>
          ${invItems}
          ${dist.tier < 3 ? `<button class="btn btn-sm btn-secondary" style="margin-top:0.5rem;border-color:#ff9500;color:#ff9500" onclick="doUpgradeDistribution('${locId}')">⬆️ UPGRADE to ${DISTRIBUTION_TIERS[dist.tier].name} ($${DISTRIBUTION_TIERS[dist.tier].upgradeCost.toLocaleString()})</button>` : ''}
        </div>`;
    }

    return `<div class="dist-card ${dist.active ? 'active' : 'paused'}">
      <div class="dist-header">
        <span class="neon-pink">${loc ? loc.name : locId}</span>
        <span class="dist-tier">${tierData.emoji} ${tierData.name}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:0.3rem 0">
        <span class="dist-revenue neon-green">$${dist.revenue.today.toLocaleString()}/day</span>
        <span style="font-size:0.65rem;color:var(--text-dim)">Total: $${dist.revenue.total.toLocaleString()}</span>
      </div>
      <div style="font-size:0.7rem;margin:0.2rem 0">Dealers: ${dealerChips || '<span class="text-dim">None</span>'}</div>
      <div style="margin:0.3rem 0">${stockItems}</div>
      <div class="dist-actions">
        <button class="btn btn-sm ${isManaging ? 'btn-primary' : 'btn-secondary'}" onclick="distManageLocation=${isManaging ? 'null' : `'${locId}'`}; render();">${isManaging ? '✕ CLOSE' : '⚙️ MANAGE'}</button>
        <button class="btn btn-sm btn-secondary" onclick="doToggleDistribution('${locId}')">${dist.active ? '⏸️ PAUSE' : '▶️ RESUME'}</button>
      </div>
      ${managePanel}
    </div>`;
  }).join('');

  return `
    <div class="game-screen">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center;margin:1rem 0;color:#ff9500">📡 DISTRIBUTION NETWORK</h2>
      <button class="btn btn-secondary" onclick="distManageLocation=null;currentScreen='game'; render();" style="margin-bottom:1rem;">← BACK</button>

      <div class="stats-overview">
        <div class="stat-card" style="border-color:#ff9500">
          <div class="stat-card-label">DAILY REVENUE</div>
          <div class="stat-card-value neon-green">$${totalRevenue.toLocaleString()}</div>
        </div>
        <div class="stat-card" style="border-color:#ff9500">
          <div class="stat-card-label">ACTIVE LOCATIONS</div>
          <div class="stat-card-value" style="color:#ff9500">${getActiveDistributionCount(gameState)}</div>
        </div>
        <div class="stat-card" style="border-color:#ff9500">
          <div class="stat-card-label">TOTAL DEALERS</div>
          <div class="stat-card-value" style="color:#ff9500">${totalDealers}</div>
        </div>
        <div class="stat-card" style="border-color:#ff9500">
          <div class="stat-card-label">STOCK VALUE</div>
          <div class="stat-card-value neon-cyan">$${totalStockValue.toLocaleString()}</div>
        </div>
      </div>

      <div class="dist-grid">${locationCards}</div>

      <button class="btn btn-secondary" onclick="distManageLocation=null;currentScreen='game'; render();" style="margin-top:1rem;">← BACK</button>
    </div>
  `;
}

// Distribution UI handlers
function doSetupDistribution(locId) {
  const result = setupDistribution(gameState, locId);
  if (result.success) {
    MusicEngine.playSfx('territory');
    gameState.messageLog.push(result.msg);
    if (typeof updateAchievementStats === 'function') updateAchievementStats(gameState, 'distribution_setup', { locationId: locId });
    processNewAchievements();
  } else {
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doUpgradeDistribution(locId) {
  const result = upgradeDistribution(gameState, locId);
  if (result.success) {
    MusicEngine.playSfx('cash');
    gameState.messageLog.push(result.msg);
    processNewAchievements();
  } else {
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doHireDistributor(locId, roleId) {
  const result = hireDistributor(gameState, locId, roleId);
  if (result.success) {
    MusicEngine.playSfx('cash');
    gameState.messageLog.push(result.msg);
  } else {
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doFireDistributor(locId, idx) {
  const result = fireDistributor(gameState, locId, idx);
  if (result.success) {
    MusicEngine.playSfx('click');
    gameState.messageLog.push(result.msg);
  } else {
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doExportDrugs(locId, drugId, amount) {
  amount = parseInt(amount);
  if (isNaN(amount) || amount <= 0) return;
  const result = exportDrugs(gameState, locId, drugId, amount);
  if (result.success) {
    MusicEngine.playSfx('cash');
    gameState.messageLog.push(result.msg);
    if (typeof awardXP === 'function') awardXP(gameState, 'export', 5);
  } else {
    gameState.messageLog.push(result.msg);
  }
  render();
}

function doToggleDistribution(locId) {
  const result = shutdownDistribution(gameState, locId);
  if (result.success) {
    MusicEngine.playSfx('click');
    gameState.messageLog.push(result.msg);
  }
  render();
}

// ============================================================
// PROCESSING / LAB SCREEN
// ============================================================
function renderProcessing() {
  if (typeof PROCESSING_RECIPES === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#00ffcc">⚗️ PROCESSING LAB</h2><p>Processing system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const labTier = typeof getLabTier === 'function' ? getLabTier(gameState, gameState.currentLocation) : 0;
  const chemLevel = typeof getChemistryLevel === 'function' ? getChemistryLevel(gameState) : 0;
  const proc = gameState.processing || {};
  const supplies = proc.supplies || {};
  const activeJobs = proc.activeJobs || [];
  const completedBatches = proc.completedBatches || [];

  // Supply store
  const supplyCards = Object.entries(PROCESSING_SUPPLIES).map(([id, sup]) => {
    return `<div class="prop-card" style="border-color:#00ffcc">
      <div class="prop-header">${sup.emoji} ${sup.name}</div>
      <div class="prop-details">${sup.desc}<br>Owned: <span class="neon-cyan">${supplies[id] || 0}</span></div>
      <button class="btn btn-sm btn-buy" onclick="doBuySupply('${id}', 1)">Buy 1 ($${sup.basePrice.toLocaleString()})</button>
      <button class="btn btn-sm btn-buy" style="margin-left:0.3rem" onclick="doBuySupply('${id}', 5)">Buy 5 ($${(sup.basePrice * 5).toLocaleString()})</button>
    </div>`;
  }).join('');

  // Recipe cards
  const recipeCards = PROCESSING_RECIPES.filter(r => r.labTier <= labTier).map(r => {
    const check = typeof canProcess === 'function' ? canProcess(gameState, r.id) : { ok: false, reason: 'System unavailable' };
    const inputStr = Object.entries(r.input).map(([d, a]) => `${a}× ${d}`).join(' + ');
    const outputStr = Object.entries(r.output).map(([d, a]) => `${a}× ${d}`).join(' + ');
    return `<div class="prop-card ${check.ok ? '' : 'locked'}" style="border-color:#00ffcc">
      <div class="prop-header">${r.emoji} ${r.name}</div>
      <div class="prop-details">
        ${r.desc}<br>
        <span class="text-dim">Input:</span> ${inputStr}<br>
        <span class="text-dim">Output:</span> ${outputStr} (${r.qualityBoost}× value)<br>
        <span class="text-dim">Skill:</span> Chem ${r.skillReq} | <span class="text-dim">Lab Tier:</span> ${r.labTier} | <span class="text-dim">Time:</span> ${r.timeHours}h | <span class="text-dim">Heat:</span> +${r.heatGen}<br>
        ${Object.entries(r.supplies || {}).map(([s, a]) => `${a}× ${PROCESSING_SUPPLIES[s]?.name || s}`).join(', ')}
      </div>
      ${check.ok ? `<button class="btn btn-sm btn-buy" onclick="doStartProcessing('${r.id}')">⚗️ Start</button>` : `<div class="text-dim" style="font-size:0.7rem">${check.reason}</div>`}
    </div>`;
  }).join('');

  // Active jobs
  const jobCards = activeJobs.map((j, i) => {
    const daysLeft = j.completionDay - gameState.day;
    return `<div class="prop-card" style="border-color:#ff9500">
      <div class="prop-header">🔥 ${j.recipeName}</div>
      <div class="prop-details">Quality: ${j.quality} | Ready in: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (Day ${j.completionDay})</div>
    </div>`;
  }).join('') || '<div class="text-dim">No active jobs.</div>';

  // Completed batches
  const batchCards = completedBatches.map((b, i) => {
    return `<div class="prop-card" style="border-color:#00ff88">
      <div class="prop-header">✅ ${b.recipeName}</div>
      <div class="prop-details">Quality: ${b.quality}</div>
      <button class="btn btn-sm btn-buy" onclick="doCollectBatch(${i})">📦 Collect</button>
    </div>`;
  }).join('') || '';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#00ffcc">⚗️ PROCESSING LAB</h2>
      <div class="status-row" style="justify-content:center;gap:2rem;margin-bottom:1rem">
        <span class="stat"><span class="stat-label">Lab Tier</span> <span class="stat-value neon-cyan">${labTier}</span></span>
        <span class="stat"><span class="stat-label">Chemistry</span> <span class="stat-value neon-green">${chemLevel}/10</span></span>
        <span class="stat"><span class="stat-label">Chemicals</span> <span class="stat-value">${supplies.chemicals || 0}</span></span>
        <span class="stat"><span class="stat-label">Equipment</span> <span class="stat-value">${supplies.equipment || 0}</span></span>
      </div>
      <h3 style="color:#00ffcc;margin:0.5rem 0">🧫 SUPPLIES</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${supplyCards}</div>
      ${completedBatches.length > 0 ? `<h3 style="color:#00ff88;margin:0.5rem 0">✅ READY TO COLLECT</h3><div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${batchCards}</div>` : ''}
      <h3 style="color:#ff9500;margin:0.5rem 0">🔥 ACTIVE JOBS (${activeJobs.length}/2)</h3>
      ${jobCards}
      <h3 style="color:#00ffcc;margin:0.5rem 0">📖 RECIPES</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${recipeCards}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doBuySupply(supplyId, amount) {
  const result = buySupply(gameState, supplyId, amount);
  if (result.success) playSound('click');
  gameState.messageLog.push(result.msg);
  render();
}

function doStartProcessing(recipeId) {
  const result = startProcessing(gameState, recipeId);
  if (result.success) playSound('click');
  gameState.messageLog.push(result.msg);
  render();
}

function doCollectBatch(idx) {
  const result = collectBatch(gameState, idx);
  if (result.success) playSound('click');
  gameState.messageLog.push(result.msg);
  render();
}

// ============================================================
// IMPORT / EXPORT SCREEN
// ============================================================
function renderImportExport() {
  if (typeof INTERNATIONAL_SOURCES === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#4488ff">🌍 IMPORT / EXPORT</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const ie = gameState.importExport || {};
  const sources = typeof getAvailableSources === 'function' ? getAvailableSources(gameState) : [];

  // Active shipments
  const activeShipments = (ie.activeShipments || []).map(s => {
    const daysLeft = s.arrivalDay - gameState.day;
    const method = SHIPPING_METHODS.find(m => m.id === s.methodId);
    return `<div class="prop-card" style="border-color:#ff9500">
      <div class="prop-header">${method ? method.emoji : '📦'} ${s.amount}× ${s.drugId}</div>
      <div class="prop-details">From: ${s.sourceId} | Via: ${s.methodName}<br>Arrives in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (Day ${s.arrivalDay})</div>
    </div>`;
  }).join('') || '<div class="text-dim">No active shipments.</div>';

  // Completed shipments
  const completedShipments = (ie.completedShipments || []).map(s => {
    return `<div class="prop-card" style="border-color:#00ff88">
      <div class="prop-header">📬 ${s.finalAmount || s.amount}× ${s.drugId}</div>
      <div class="prop-details">From: ${s.sourceId}</div>
      <button class="btn btn-sm btn-buy" onclick="doCollectShipment('${s.id}')">📦 Collect</button>
    </div>`;
  }).join('');

  // Source cards
  const sourceCards = sources.map(src => {
    const statusLabel = src.isUnlocked ? '✅ Connected' : (src.repMet ? `📞 ${src.contactProgress}% connected` : `🔒 Need ${src.minRep} rep`);
    const statusColor = src.isUnlocked ? '#00ff88' : (src.repMet ? '#ff9500' : '#666');
    const drugsStr = src.drugs.join(', ');
    const blocked = src.isBlocked ? ' <span class="neon-red">[ROUTE BLOCKED]</span>' : '';
    const bribed = ie.bribedOfficials && ie.bribedOfficials[src.id] ? ' 🤝' : '';

    let actions = '';
    if (!src.isUnlocked && src.repMet) {
      actions = `<button class="btn btn-sm btn-secondary" style="border-color:#4488ff;color:#4488ff" onclick="doProgressConnection('${src.id}')">📞 Make Contact</button>`;
    } else if (src.isUnlocked && !src.isBlocked) {
      actions = `<button class="btn btn-sm btn-buy" onclick="showImportModal('${src.id}')">📥 Import</button>`;
      if (!ie.bribedOfficials || !ie.bribedOfficials[src.id]) {
        actions += ` <button class="btn btn-sm btn-secondary" style="border-color:#ff9500;color:#ff9500" onclick="doBribeOfficial('${src.id}')">🤝 Bribe</button>`;
      }
    }

    return `<div class="prop-card" style="border-color:${statusColor}">
      <div class="prop-header">${src.emoji} ${src.name}${bribed}${blocked}</div>
      <div class="prop-details">
        ${src.desc}<br>
        <span class="text-dim">Drugs:</span> ${drugsStr} | <span class="text-dim">Price:</span> ${Math.round(src.priceMultiplier * 100)}% | <span class="text-dim">Reliability:</span> ${Math.round(src.reliability * 100)}%<br>
        <span style="color:${statusColor}">${statusLabel}</span>
      </div>
      ${actions}
    </div>`;
  }).join('');

  // Shipping methods reference
  const methodCards = SHIPPING_METHODS.map(m => {
    return `<span class="text-dim" style="font-size:0.7rem">${m.emoji} ${m.name}: ${m.capacity} units, ${m.speed}d, $${m.cost.toLocaleString()}, ${Math.round(m.riskBase * 100)}% risk</span>`;
  }).join(' | ');

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#4488ff">🌍 IMPORT / EXPORT</h2>
      <div class="status-row" style="justify-content:center;gap:2rem;margin-bottom:1rem">
        <span class="stat"><span class="stat-label">Connected</span> <span class="stat-value neon-cyan">${(ie.unlockedSources || []).length}</span></span>
        <span class="stat"><span class="stat-label">Total Imports</span> <span class="stat-value neon-green">${ie.totalImports || 0}</span></span>
        <span class="stat"><span class="stat-label">Seized</span> <span class="stat-value neon-red">${ie.totalSeized || 0}</span></span>
      </div>
      ${(ie.completedShipments || []).length > 0 ? `<h3 style="color:#00ff88;margin:0.5rem 0">📬 ARRIVED</h3><div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${completedShipments}</div>` : ''}
      <h3 style="color:#ff9500;margin:0.5rem 0">🚢 IN TRANSIT</h3>
      ${activeShipments}
      <h3 style="color:#4488ff;margin:0.5rem 0">🌐 INTERNATIONAL SOURCES</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${sourceCards}</div>
      <div style="margin-top:0.5rem;padding:0.5rem;background:rgba(0,0,0,0.3);border-radius:4px">${methodCards}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

let importModalSource = null;

function showImportModal(sourceId) {
  importModalSource = sourceId;
  const source = INTERNATIONAL_SOURCES.find(s => s.id === sourceId);
  if (!source) return;

  const drugOptions = source.drugs.map(d => `<option value="${d}">${d}</option>`).join('');
  const methodOptions = SHIPPING_METHODS.map(m => `<option value="${m.id}">${m.emoji} ${m.name} (${m.capacity} max, ${m.speed}d, $${m.cost.toLocaleString()})</option>`).join('');

  const modal = document.getElementById('modal-container') || document.createElement('div');
  modal.id = 'import-modal';
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center">
      <div style="background:var(--bg-dark);border:1px solid #4488ff;border-radius:8px;padding:1.5rem;max-width:400px;width:90%">
        <h3 style="color:#4488ff;margin:0 0 1rem">📥 Import from ${source.name}</h3>
        <div style="margin-bottom:0.5rem"><label class="text-dim">Drug:</label><br><select id="import-drug" class="game-input" style="width:100%">${drugOptions}</select></div>
        <div style="margin-bottom:0.5rem"><label class="text-dim">Amount:</label><br><input id="import-amount" type="number" class="game-input" style="width:100%" min="1" max="200" value="10"></div>
        <div style="margin-bottom:1rem"><label class="text-dim">Method:</label><br><select id="import-method" class="game-input" style="width:100%">${methodOptions}</select></div>
        <button class="btn btn-primary" onclick="doOrderShipment()">📦 Order Shipment</button>
        <button class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.remove();
  importModalSource = null;
}

function doOrderShipment() {
  if (!importModalSource) return;
  const drugId = document.getElementById('import-drug').value;
  const amount = parseInt(document.getElementById('import-amount').value) || 10;
  const methodId = document.getElementById('import-method').value;

  const result = orderShipment(gameState, importModalSource, drugId, amount, methodId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  closeImportModal();
  render();
}

function doProgressConnection(sourceId) {
  const result = progressSourceConnection(gameState, sourceId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doCollectShipment(shipmentId) {
  const result = collectShipment(gameState, shipmentId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doBribeOfficial(sourceId) {
  const result = bribeCustomsOfficial(gameState, sourceId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

// ============================================================
// FACTIONS SCREEN
// ============================================================
function renderFactions() {
  if (typeof FACTIONS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#ff4488">⚔️ FACTIONS</h2><p>Faction system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  ensureFactionState(gameState);
  const f = gameState.factions;

  const factionCards = FACTIONS.map(faction => {
    if (f.absorptions.includes(faction.id)) {
      return `<div class="prop-card" style="border-color:#333;opacity:0.5">
        <div class="prop-header">${faction.emoji} ${faction.name}</div>
        <div class="prop-details neon-green">👑 ABSORBED</div>
      </div>`;
    }

    const standing = getFactionStanding(gameState, faction.id);
    const standingVal = f.standings[faction.id] || 0;
    const power = f.factionPower[faction.id] || faction.strength;
    const alliance = f.alliances[faction.id];
    const war = f.wars[faction.id];
    const territories = (f.factionTerritory[faction.id] || faction.territory).join(', ');

    let statusBadge = `<span style="color:${standing.color}">${standing.emoji} ${standing.label} (${standingVal})</span>`;
    if (war) statusBadge += ` <span class="neon-red">⚔️ AT WAR (${war.playerWins}-${war.factionWins})</span>`;
    if (alliance) {
      const aType = ALLIANCE_TYPES.find(a => a.id === alliance);
      statusBadge += ` <span class="neon-green">${aType ? aType.emoji : '🤝'} ${aType ? aType.name : alliance}</span>`;
    }

    // Standing bar visual
    const standingPct = Math.abs(standingVal);
    const standingBarColor = standingVal > 0 ? '#00ff88' : standingVal < 0 ? '#ff4444' : '#888';
    const standingBar = `<div style="display:inline-flex;align-items:center;gap:4px;margin-top:3px">
      <span style="font-size:0.65rem;width:30px;text-align:right;color:${standingBarColor}">${standingVal}</span>
      <div style="width:120px;height:6px;background:#222;border-radius:3px;overflow:hidden;position:relative">
        <div style="position:absolute;left:50%;width:1px;height:100%;background:#555"></div>
        ${standingVal > 0
          ? `<div style="position:absolute;left:50%;width:${standingPct * 0.5}%;height:100%;background:${standingBarColor};border-radius:0 3px 3px 0"></div>`
          : standingVal < 0
            ? `<div style="position:absolute;right:50%;width:${standingPct * 0.5}%;height:100%;background:${standingBarColor};border-radius:3px 0 0 3px"></div>`
            : ''}
      </div>
    </div>`;

    // Trade effects summary
    let tradeEffects = '';
    if (war) {
      tradeEffects = '<div style="font-size:0.65rem;color:#ff4444;margin-top:3px">TRADE: +25% buy prices, -25% sell prices, 12% ambush risk, +15 heat/deal</div>';
    } else if (standingVal >= 50) {
      tradeEffects = '<div style="font-size:0.65rem;color:#00ff88;margin-top:3px">TRADE: -10% buy prices, +5% sell, no ambush, -3 heat/deal</div>';
    } else if (standingVal <= -50) {
      tradeEffects = '<div style="font-size:0.65rem;color:#ff8800;margin-top:3px">TRADE: +15% buy prices, -15% sell, 8% ambush risk, +10 heat/deal</div>';
    } else if (standingVal <= -15) {
      tradeEffects = '<div style="font-size:0.65rem;color:#ffaa00;margin-top:3px">TRADE: +8% buy prices, 5% ambush risk, +5 heat/deal</div>';
    } else if (alliance === 'trade') {
      tradeEffects = '<div style="font-size:0.65rem;color:#00ff88;margin-top:3px">TRADE: -20% buy prices, +10% sell. Safe territory.</div>';
    } else if (alliance === 'joint_venture') {
      tradeEffects = '<div style="font-size:0.65rem;color:#00ff88;margin-top:3px">TRADE: -25% buy prices, +15% sell. Full partnership benefits.</div>';
    }

    // Actions with consequence hints
    let actions = '';
    if (war) {
      actions = `<button class="btn btn-sm btn-secondary" style="border-color:#ff9500;color:#ff9500" onclick="doNegotiatePeace('${faction.id}')">☮️ Peace</button>
        <button class="btn btn-sm btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="doFactionBribe('${faction.id}')">💰 Bribe</button>
        <div style="font-size:0.65rem;color:#ff9500;margin-top:2px">Peace: Ends conflict. Bribe: Slow path to peace.</div>`;
    } else if (!alliance) {
      // Bribe always available when not absorbed
      actions = `<button class="btn btn-sm btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="doFactionBribe('${faction.id}')">💰 Bribe</button> `;

      actions += ALLIANCE_TYPES.map(at => {
        const check = canFormAlliance(gameState, faction.id, at.id);
        return check.ok
          ? `<button class="btn btn-sm btn-secondary" style="border-color:${standing.color};color:${standing.color};font-size:0.65rem" onclick="doFormAlliance('${faction.id}', '${at.id}')" title="Form ${at.name} alliance - builds cooperation">${at.emoji} ${at.name} ($${at.cost.toLocaleString()})</button>`
          : '';
      }).join(' ');
      if (standingVal <= -15 && !war) {
        actions += ` <button class="btn btn-sm btn-secondary" style="border-color:#ff0000;color:#ff0000" onclick="doDeclareWar('${faction.id}')" title="Start a war - high risk, can weaken or destroy them">⚔️ War</button>`;
      }
      if (actions.trim()) {
        const hintParts = [];
        hintParts.push('<span style="color:#ffcc00">Bribe: Pay cash for +4-7 standing</span>');
        if (actions.includes('War')) hintParts.push('<span style="color:#ff4444">War: High risk, may gain territory if you win</span>');
        if (actions.includes('Alliance') || actions.includes('Pact') || actions.includes('Trade')) hintParts.push('<span style="color:#44ff88">Alliances: Build cooperation, share benefits</span>');
        if (hintParts.length > 0) actions += `<div style="font-size:0.6rem;margin-top:3px">${hintParts.join(' | ')}</div>`;
      }
    } else {
      actions = `<button class="btn btn-sm btn-secondary" style="border-color:#ff4444;color:#ff4444" onclick="doBreakAlliance('${faction.id}')">💔 Break</button>
        <button class="btn btn-sm btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="doFactionBribe('${faction.id}')">💰 Bribe</button>
        <div style="font-size:0.65rem;color:#ff4444;margin-top:2px">Breaking alliance damages trust and standing</div>`;
    }

    // Absorb if weak enough after war
    if (power <= 20 && !war && !f.absorptions.includes(faction.id)) {
      actions += ` <button class="btn btn-sm btn-buy" onclick="doAbsorbFaction('${faction.id}')" title="Take over this faction permanently">👑 Absorb</button>
        <div style="font-size:0.65rem;color:#00ff88;margin-top:2px">Absorb: Gain their territory and resources permanently</div>`;
    }

    // How standing changes hint
    const standingHint = `<div style="font-size:0.6rem;color:var(--text-dim);margin-top:4px;border-top:1px solid #222;padding-top:3px">
      Standing changes: <span style="color:#00ff88">Sell on their turf (allied: +1)</span> |
      <span style="color:#ff4444">Sell uninvited: -2</span> |
      <span style="color:#ff4444">Fight them: -10</span> |
      <span style="color:#00ff88">Bribe: +5</span> |
      <span style="color:#00ff88">Missions: +5</span>
    </div>`;

    return `<div class="prop-card" style="border-color:${faction.color}">
      <div class="prop-header">${faction.emoji} ${faction.name} <span style="font-size:0.7rem;color:${faction.color}">[${faction.leader.name}]</span></div>
      <div class="prop-details">
        ${faction.desc}<br>
        <span class="text-dim">Specialty:</span> ${faction.specialty} | <span class="text-dim">Power:</span> ${power}/100 | <span class="text-dim">Style:</span> ${faction.leader.personality}<br>
        <span class="text-dim">Territory:</span> ${territories}<br>
        ${statusBadge} ${standingBar}
        ${tradeEffects}
      </div>
      <div style="margin-top:0.3rem">${actions}</div>
      ${standingHint}
    </div>`;
  }).join('');

  const absorbedCount = f.absorptions.length;
  const warCount = Object.keys(f.wars).length;
  const allianceCount = Object.keys(f.alliances).length;

  // Current location gang info
  const curLoc = gameState.currentLocation;
  const curGang = typeof TERRITORY_GANGS !== 'undefined' ? TERRITORY_GANGS[curLoc] : null;
  let curGangInfo = '';
  if (curGang) {
    const curFaction = FACTIONS.find(fc => fc.id === curGang.factionId);
    const curStanding = curFaction ? getFactionStanding(gameState, curFaction.id) : null;
    const curStandingVal = curFaction ? (f.standings[curFaction.id] || 0) : 0;
    curGangInfo = `<div style="background:rgba(255,68,136,0.08);border:1px solid rgba(255,68,136,0.3);border-radius:4px;padding:0.5rem;margin-bottom:1rem">
      <span style="font-size:0.85rem;font-weight:700;color:#ff4488">📍 Current District Gang: ${curGang.name}</span>
      ${curStanding ? `<span style="color:${curStanding.color};margin-left:0.5rem">${curStanding.emoji} ${curStanding.label} (${curStandingVal})</span>` : ''}
      ${curStandingVal <= -15 ? '<span style="color:#ff4444;margin-left:0.5rem">Dealing here is risky!</span>' : ''}
      ${curStandingVal >= 50 ? '<span style="color:#00ff88;margin-left:0.5rem">Friendly turf - good prices</span>' : ''}
    </div>`;
  }

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#ff4488">⚔️ FACTIONS & ALLIANCES</h2>
      ${curGangInfo}
      <div class="status-row" style="justify-content:center;gap:2rem;margin-bottom:1rem">
        <span class="stat"><span class="stat-label">Alliances</span> <span class="stat-value neon-green">${allianceCount}</span></span>
        <span class="stat"><span class="stat-label">Wars</span> <span class="stat-value neon-red">${warCount}</span></span>
        <span class="stat"><span class="stat-label">Absorbed</span> <span class="stat-value neon-cyan">${absorbedCount}</span></span>
      </div>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${factionCards}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doFormAlliance(factionId, allianceType) {
  const result = formAlliance(gameState, factionId, allianceType);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doBreakAlliance(factionId) {
  if (!confirm('Break alliance? This will damage your standing.')) return;
  const result = breakAlliance(gameState, factionId);
  gameState.messageLog.push(result.msg);
  render();
}

function doFactionBribe(factionId) {
  if (typeof bribeFaction !== 'function') {
    alert('Bribe system not available.');
    return;
  }
  const result = bribeFaction(gameState, factionId);
  gameState.messageLog.push(result.msg);
  if (result.success) {
    playSound('cash');
    showNotification(result.msg, 'success');
  } else {
    showNotification(result.msg, 'error');
  }
  render();
}

function doDeclareWar(factionId) {
  if (!confirm('Declare war? This will have serious consequences.')) return;
  const result = declareWar(gameState, factionId, true);
  gameState.messageLog.push(result.msg);
  render();
}

function doNegotiatePeace(factionId) {
  const result = negotiatePeace(gameState, factionId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doAbsorbFaction(factionId) {
  if (!confirm('Absorb this faction? Other factions will take notice.')) return;
  const result = absorbFaction(gameState, factionId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

// ============================================================
// LIFESTYLE / STRESS / NEWS SCREEN
// ============================================================
function renderLifestyle() {
  if (typeof LIFESTYLE_TIERS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#ffcc00">🏠 LIFESTYLE</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const ls = gameState.lifestyle || {};
  const stress = ls.stress || 0;
  const currentTier = LIFESTYLE_TIERS.find(t => t.id === (ls.lifestyleTier || 'modest')) || LIFESTYLE_TIERS[1];
  const timePeriod = typeof getTimePeriod === 'function' ? getTimePeriod(gameState) : TIME_PERIODS[0];

  // Lifestyle tier cards
  const tierCards = LIFESTYLE_TIERS.map(tier => {
    const isCurrent = tier.id === currentTier.id;
    return `<div class="prop-card ${isCurrent ? '' : ''}" style="border-color:${isCurrent ? '#ffcc00' : '#444'}">
      <div class="prop-header">${tier.emoji} ${tier.name} ${isCurrent ? '✅' : ''}</div>
      <div class="prop-details">${tier.desc}<br>
        <span class="text-dim">Daily:</span> $${tier.dailyCost.toLocaleString()} | <span class="text-dim">Stress:</span> ${tier.stressRate > 0 ? '+' : ''}${tier.stressRate}/day
        ${tier.heatGain ? ` | <span class="neon-red">Heat: +${tier.heatGain}</span>` : ''}
      </div>
      ${!isCurrent ? `<button class="btn btn-sm btn-secondary" style="border-color:#ffcc00;color:#ffcc00" onclick="doSetLifestyle('${tier.id}')">Set</button>` : ''}
    </div>`;
  }).join('');

  // Stress relief activities
  const activityCards = (typeof STRESS_RELIEF !== 'undefined' ? STRESS_RELIEF : []).map(act => {
    return `<div class="prop-card" style="border-color:#00ffcc">
      <div class="prop-header">${act.emoji} ${act.name}</div>
      <div class="prop-details">${act.desc}<br>
        <span class="text-dim">Cost:</span> $${act.cost.toLocaleString()} | <span class="text-dim">Relief:</span> -${act.stressRelief} stress
        ${act.healthBonus ? ` | <span class="neon-green">+${act.healthBonus} HP</span>` : ''}
        ${act.timeCost ? ` | <span class="neon-yellow">${act.timeCost} days</span>` : ''}
      </div>
      <button class="btn btn-sm btn-buy" onclick="doStressReliefUI('${act.id}')">Do It</button>
    </div>`;
  }).join('');

  // News feed
  const newsFeed = (ls.newsFeed || []).slice(0, 10).map(n => {
    return `<div style="padding:0.3rem 0;border-bottom:1px solid #222;font-size:0.8rem">
      <span class="text-dim">Day ${n.day}</span> ${n.msg}
    </div>`;
  }).join('') || '<div class="text-dim">No recent news.</div>';

  // Stress bar
  const stressColor = stress > 70 ? '#ff0000' : stress > 40 ? '#ff9500' : '#00ff88';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#ffcc00">🏠 LIFESTYLE & WELLNESS</h2>
      <div style="text-align:center;margin-bottom:1rem">
        <span style="font-size:1.1rem">${timePeriod.emoji} ${timePeriod.name} (${timePeriod.hours})</span>
      </div>
      <div style="text-align:center;margin-bottom:1rem">
        <span class="stat-label">STRESS</span>
        <span class="heat-bar" style="display:inline-block;width:300px;margin:0 0.5rem"><span class="heat-fill" style="width:${stress}%;background:${stressColor}"></span></span>
        <span style="color:${stressColor}">${stress}%</span>
      </div>
      <h3 style="color:#ffcc00;margin:0.5rem 0">🏠 LIFESTYLE TIER (Current: ${currentTier.emoji} ${currentTier.name})</h3>
      <div class="char-grid" style="grid-template-columns:repeat(3,1fr)">${tierCards}</div>
      <h3 style="color:#00ffcc;margin:0.5rem 0">🧘 STRESS RELIEF</h3>
      <div class="char-grid" style="grid-template-columns:repeat(3,1fr)">${activityCards}</div>
      <h3 style="color:#4488ff;margin:0.5rem 0">📰 NEWS FEED</h3>
      <div style="background:rgba(0,0,0,0.3);border-radius:4px;padding:0.5rem;max-height:200px;overflow-y:auto">${newsFeed}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doSetLifestyle(tierId) {
  const result = setLifestyleTier(gameState, tierId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doStressReliefUI(activityId) {
  const result = doStressRelief(gameState, activityId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

// ============================================================
// INTRO CUTSCENE
// ============================================================
let introPages = [];
let introPageIndex = 0;
let introCharacterId = null;

function renderIntro() {
  if (!introPages || introPages.length === 0) {
    startGameAfterIntro();
    return '';
  }
  const page = introPages[introPageIndex];
  const char = typeof getCharacterById === 'function' ? getCharacterById(introCharacterId) : null;
  const isLast = introPageIndex >= introPages.length - 1;
  const dots = introPages.map((_, i) => {
    const cls = i === introPageIndex ? 'active' : i < introPageIndex ? 'past' : '';
    return `<div class="intro-dot ${cls}"></div>`;
  }).join('');

  return `
    <div class="intro-screen intro-mood-${page.mood || 'dark'}" key="intro-${introPageIndex}">
      ${char ? `<div class="intro-char-name">${char.emoji} ${char.name}</div>
      <div class="intro-char-tagline">${char.tagline || char.subtitle || ''}</div>` : ''}
      <div class="intro-text">${page.text}</div>
      <div class="intro-page-dots">${dots}</div>
      <div style="display:flex;gap:1rem;margin-top:1rem">
        ${introPageIndex > 0 ? `<button class="btn btn-secondary" onclick="introPageIndex--;render()">◀ Back</button>` : ''}
        ${isLast
          ? `<button class="btn btn-primary btn-glow" onclick="startGameAfterIntro()">▶ BEGIN YOUR STORY</button>`
          : `<button class="btn btn-primary" onclick="advanceIntro()">Continue ▶</button>`
        }
      </div>
      <button class="btn btn-secondary" style="margin-top:1rem;opacity:0.5;font-size:0.8rem" onclick="startGameAfterIntro()">Skip Intro</button>
    </div>`;
}

function advanceIntro() {
  playSound('click');
  if (introPageIndex < introPages.length - 1) {
    introPageIndex++;
    render();
  } else {
    startGameAfterIntro();
  }
}

function startGameAfterIntro() {
  playSound('travel');
  introPages = [];
  introPageIndex = 0;
  currentScreen = 'game';
  // Start tutorial on first game
  if (typeof startTutorial === 'function' && gameState.day <= 1) {
    startTutorial();
  }
  render();
}

// ============================================================
// POLITICS / CORRUPTION SCREEN
// ============================================================
let selectedCorruptionMethod = 'bribe';

function renderPolitics() {
  if (typeof OFFICIAL_TYPES === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#cc88ff">🏛️ POLITICS</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const pol = gameState.politics || {};
  const influence = pol.politicalInfluence || 0;
  const scandals = pol.scandals || 0;
  const corruptCount = Object.keys(pol.corruptOfficials || {}).length;
  const contactCount = Object.keys(pol.contacts || {}).length;

  // Corruption method selector
  const methodBtns = CORRUPTION_METHODS.map(m => {
    const isActive = m.id === selectedCorruptionMethod;
    const meetsRep = (gameState.reputation || 0) >= m.repReq;
    return `<button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}"
      style="${isActive ? 'border-color:#cc88ff;background:rgba(204,136,255,0.2)' : ''};${!meetsRep ? 'opacity:0.4' : ''}"
      onclick="selectedCorruptionMethod='${m.id}'; render();" ${!meetsRep ? 'disabled' : ''}>
      ${m.emoji} ${m.name}${m.costMultiplier < 1 ? ' (Cheap)' : m.costMultiplier > 1 ? ' ($$)' : ''}
    </button>`;
  }).join('');

  // Officials grid
  const officialCards = OFFICIAL_TYPES.filter(o => !o.ngPlusOnly || gameState.newGamePlus).map(official => {
    const isCorrupt = pol.corruptOfficials && pol.corruptOfficials[official.id];
    const method = CORRUPTION_METHODS.find(m => m.id === selectedCorruptionMethod) || CORRUPTION_METHODS[0];
    const cost = Math.round(official.baseCost * method.costMultiplier);
    const canAfford = gameState.cash >= cost;

    if (isCorrupt) {
      const data = pol.corruptOfficials[official.id];
      return `<div class="prop-card" style="border-color:#00ff88">
        <div class="prop-header">${official.emoji} ${official.name} <span style="color:#00ff88">✅ OWNED</span></div>
        <div class="prop-details">
          <span class="text-dim">Loyalty:</span> ${data.loyalty}% | <span class="text-dim">Risk:</span> <span style="color:${data.exposureRisk > 50 ? '#ff0000' : '#ffcc00'}">${data.exposureRisk}%</span><br>
          <span class="text-dim">Paid:</span> $${data.bribesPaid.toLocaleString()} | <span class="text-dim">Since:</span> Day ${data.dayCorrupted}
        </div>
        <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.3rem">
          <button class="btn btn-sm btn-buy" onclick="doUseOfficial('${official.id}','reduce_heat')">🔥 Reduce Heat ($${Math.round(official.baseCost * 0.5).toLocaleString()})</button>
          <button class="btn btn-sm btn-buy" onclick="doUseOfficial('${official.id}','slow_investigation')">🔍 Slow Case ($${Math.round(official.baseCost * 0.5).toLocaleString()})</button>
          ${official.id === 'judge' || official.id === 'prosecutor' ? `<button class="btn btn-sm btn-buy" onclick="doUseOfficial('${official.id}','dismiss_charges')">⚖️ Dismiss ($${Math.round(official.baseCost * 0.5).toLocaleString()})</button>` : ''}
          ${official.tier >= 4 ? `<button class="btn btn-sm btn-buy" onclick="doUseOfficial('${official.id}','policy_change')">📋 Policy ($${Math.round(official.baseCost * 0.5).toLocaleString()})</button>` : ''}
        </div>
      </div>`;
    }

    return `<div class="prop-card" style="border-color:${canAfford ? '#cc88ff' : '#444'}">
      <div class="prop-header">${official.emoji} ${official.name} <span class="text-dim">Tier ${official.tier}</span></div>
      <div class="prop-details">${official.desc}<br>
        <span class="text-dim">Benefits:</span> ${official.benefits.join(', ')}<br>
        <span class="text-dim">Cost:</span> <span style="color:${canAfford ? '#00ff88' : '#ff4444'}">$${cost.toLocaleString()}</span> via ${method.name}
      </div>
      <button class="btn btn-sm ${canAfford ? 'btn-buy' : 'btn-secondary'}" ${!canAfford ? 'disabled' : ''}
        onclick="doCorruptOfficial('${official.id}')">💰 Corrupt</button>
    </div>`;
  }).join('');

  // Contacts grid
  const contactCards = CONTACT_TYPES.map(contact => {
    const isRecruited = pol.contacts && pol.contacts[contact.id];
    const recruitCost = contact.maintCost * 5;
    const canAfford = gameState.cash >= recruitCost;

    if (isRecruited) {
      const data = pol.contacts[contact.id];
      return `<div class="prop-card" style="border-color:#00ff88">
        <div class="prop-header">${contact.emoji} ${contact.name} <span style="color:#00ff88">✅</span></div>
        <div class="prop-details">
          <span class="text-dim">Trust:</span> ${data.trust} | <span class="text-dim">Intel:</span> +${contact.intel}/gather<br>
          <span class="text-dim">Maint:</span> $${contact.maintCost.toLocaleString()}/day | <span class="text-dim">Since:</span> Day ${data.dayRecruited}
        </div>
      </div>`;
    }

    return `<div class="prop-card" style="border-color:${canAfford ? '#4488ff' : '#444'}">
      <div class="prop-header">${contact.emoji} ${contact.name} <span class="text-dim">Tier ${contact.tier}</span></div>
      <div class="prop-details">${contact.desc}<br>
        <span class="text-dim">Recruit:</span> <span style="color:${canAfford ? '#00ff88' : '#ff4444'}">$${recruitCost.toLocaleString()}</span> | <span class="text-dim">Maint:</span> $${contact.maintCost.toLocaleString()}/day
      </div>
      <button class="btn btn-sm ${canAfford ? 'btn-buy' : 'btn-secondary'}" ${!canAfford ? 'disabled' : ''}
        onclick="doRecruitContact('${contact.id}')">🤝 Recruit</button>
    </div>`;
  }).join('');

  // Intel log
  const intelLog = (pol.intelGathered || []).slice(-8).reverse().map(i => {
    return `<div style="padding:0.3rem 0;border-bottom:1px solid #222;font-size:0.8rem">
      <span class="text-dim">Day ${i.day}</span> 🔍 ${i.info} <span style="color:#cc88ff">(Q:${i.quality})</span>
    </div>`;
  }).join('') || '<div class="text-dim">No intelligence gathered yet.</div>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#cc88ff">🏛️ POLITICAL CORRUPTION & CONTACTS</h2>
      <div style="display:flex;gap:2rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
        <div><span class="stat-label">INFLUENCE</span> <span style="color:#cc88ff;font-weight:bold">${influence}</span></div>
        <div><span class="stat-label">CORRUPT</span> <span style="color:#00ff88;font-weight:bold">${corruptCount}</span></div>
        <div><span class="stat-label">CONTACTS</span> <span style="color:#4488ff;font-weight:bold">${contactCount}</span></div>
        <div><span class="stat-label">SCANDALS</span> <span style="color:#ff4444;font-weight:bold">${scandals}</span></div>
        <div><span class="stat-label">BRIBES PAID</span> <span style="color:#ffcc00;font-weight:bold">$${(pol.totalBribesPaid || 0).toLocaleString()}</span></div>
      </div>

      <h3 style="color:#cc88ff;margin:0.5rem 0">💰 CORRUPTION METHOD</h3>
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.5rem">${methodBtns}</div>
      <div style="font-size:0.8rem;color:#888;margin-bottom:0.5rem">${(() => {
        const m = CORRUPTION_METHODS.find(mm => mm.id === selectedCorruptionMethod);
        return m ? `${m.desc} | Cost: ${m.costMultiplier}x | Risk: ${m.riskMultiplier}x${m.requiresIntel ? ' | Requires Intel' : ''}${m.requiresFear ? ' | Requires Fear 50+' : ''}` : '';
      })()}</div>

      <h3 style="color:#cc88ff;margin:0.5rem 0">🏛️ OFFICIALS (${corruptCount} corrupted)</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${officialCards}</div>

      <h3 style="color:#4488ff;margin:0.5rem 0">🤝 CONTACTS (${contactCount} recruited)</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${contactCards}</div>

      <h3 style="color:#cc88ff;margin:0.5rem 0">🔍 INTELLIGENCE ${contactCount > 0 ? `<button class="btn btn-sm btn-buy" style="margin-left:0.5rem" onclick="doGatherIntel()">Gather Intel</button>` : ''}</h3>
      <div style="background:rgba(0,0,0,0.3);border-radius:4px;padding:0.5rem;max-height:200px;overflow-y:auto">${intelLog}</div>

      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doCorruptOfficial(officialId) {
  const result = corruptOfficial(gameState, officialId, selectedCorruptionMethod);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doUseOfficial(officialId, action) {
  const result = useCorruptOfficial(gameState, officialId, action);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doRecruitContact(contactId) {
  const result = recruitContact(gameState, contactId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doGatherIntel() {
  const result = gatherIntel(gameState);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

// ============================================================
// MISSIONS & MORAL DILEMMAS SCREEN
// ============================================================
function renderMissions() {
  if (typeof SIDE_MISSIONS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#ff8844">📋 MISSIONS</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const ms = gameState.missions || {};
  const active = ms.activeMissions || [];
  const available = ms.missionsAvailable || [];
  const dilemma = ms.pendingDilemma;

  // Pending moral dilemma
  let dilemmaHtml = '';
  if (dilemma) {
    const d = MORAL_DILEMMAS.find(dd => dd.id === dilemma.id);
    if (d) {
      const choicesHtml = d.choices.map(c => {
        // Generate consequence hint from the choice effects function if it exists
        const hintParts = [];
        // Parse the effect function source or desc to generate hints
        const descLower = (c.desc || '').toLowerCase();
        const labelLower = (c.label || '').toLowerCase();
        if (descLower.includes('kill') || descLower.includes('eliminat') || labelLower.includes('kill') || labelLower.includes('eliminat') || labelLower.includes('no mercy')) {
          hintParts.push('<span style="color:#ff4444">Aggressive</span>');
          hintParts.push('<span style="color:#cc44ff">+Fear</span>');
        }
        if (descLower.includes('forgiv') || descLower.includes('mercy') || descLower.includes('spare') || descLower.includes('let them') || descLower.includes('second chance')) {
          hintParts.push('<span style="color:#44ff88">Peaceful</span>');
          hintParts.push('<span style="color:#44ff88">+Trust</span>');
        }
        if (descLower.includes('pay') || descLower.includes('money') || descLower.includes('brib') || descLower.includes('cash') || descLower.includes('school') || descLower.includes('relocat')) {
          hintParts.push('<span style="color:#ffcc00">Costs $$$</span>');
        }
        if (descLower.includes('misinform') || descLower.includes('clever') || descLower.includes('false') || descLower.includes('use them') || descLower.includes('exploit')) {
          hintParts.push('<span style="color:#88aaff">Cunning</span>');
          hintParts.push('<span style="color:#ffcc00">+Street Cred</span>');
        }
        if (descLower.includes('expos') || descLower.includes('press') || descLower.includes('report') || descLower.includes('tip off')) {
          hintParts.push('<span style="color:#88aaff">Public</span>');
          hintParts.push('<span style="color:#44aaff">-Heat</span>');
        }
        if (descLower.includes('cop') || descLower.includes('invaluable') || descLower.includes('look the other way')) {
          hintParts.push('<span style="color:#44aaff">-Heat</span>');
        }
        if (descLower.includes('risk') || descLower.includes('expos') || descLower.includes('attention')) {
          hintParts.push('<span style="color:#ff6644">Risky</span>');
        }
        if (descLower.includes('children') || descLower.includes('not a life for') || descLower.includes('safe')) {
          hintParts.push('<span style="color:#88aaff">+Public Image</span>');
        }
        if (descLower.includes('useful') || descLower.includes('less suspicious')) {
          hintParts.push('<span style="color:#ff8844">-Public Image</span>');
        }
        const hintStr = hintParts.length > 0 ? `<div style="font-size:0.65rem;margin-top:0.3rem;padding-top:0.3rem;border-top:1px solid rgba(255,255,255,0.1)">${hintParts.join(' | ')}</div>` : '';
        return `<button class="btn btn-sm btn-primary" style="border-color:#ff8844;margin:0.3rem;min-width:150px;text-align:center;padding:0.4rem 0.6rem" onclick="doResolveDilemma('${c.id}')">
          ${c.label}<br><span style="font-size:0.7rem;color:#ccc">${c.desc}</span>${hintStr}
        </button>`;
      }).join('');
      dilemmaHtml = `
        <div style="background:rgba(255,136,68,0.1);border:2px solid #ff8844;border-radius:8px;padding:1rem;margin-bottom:1rem">
          <h3 style="color:#ff8844;margin:0 0 0.3rem 0">⚖️ MORAL DILEMMA: ${d.emoji} ${d.name}</h3>
          <p style="margin:0.5rem 0">${d.desc}</p>
          <div style="font-size:0.75rem;color:#ff8844;margin-bottom:0.5rem;text-align:center;font-style:italic">Each choice has lasting consequences. Consider carefully.</div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center">${choicesHtml}</div>
        </div>`;
    }
  }

  // Active missions
  const activeHtml = active.length > 0 ? active.map((m, i) => {
    const template = SIDE_MISSIONS.find(t => t.id === m.missionId);
    if (!template) return '';
    const daysLeft = m.daysLimit - (gameState.day - m.dayAccepted);
    const canComplete = template.check(gameState, m.data);
    const urgency = daysLeft <= 1 ? '#ff0000' : daysLeft <= 3 ? '#ff6600' : '#ffcc00';
    // Generate guidance hint based on mission category
    const categoryHints = {
      delivery: 'Buy the required product from any market, then come back here to deliver.',
      combat: 'Make sure you have a weapon equipped and good health before attempting.',
      smuggling: 'Higher driving skill improves your success chance. Consider your heat level.',
      social: 'Speech skill and reputation affect your chances. Check your stats.',
      heist: 'You need enough crew members. Crew combat stats determine success.',
    };
    const hint = categoryHints[template.category] || 'Check the mission requirements and complete the objective.';
    return `<div class="prop-card" style="border-color:${canComplete ? '#00ff88' : daysLeft <= 1 ? '#ff0000' : '#ff8844'}">
      <div class="prop-header">${template.emoji} ${template.name} <span style="color:${urgency};font-weight:bold">${daysLeft <= 1 ? 'URGENT! ' : ''}${daysLeft}d left</span></div>
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0.2rem 0">OBJECTIVE</div>
      <div class="prop-details" style="font-weight:bold;color:${canComplete ? '#00ff88' : '#fff'}">${template.getText(m.data)}</div>
      <div style="font-size:0.75rem;color:#88aaff;margin:0.3rem 0;font-style:italic">HOW TO: ${hint}</div>
      <div style="margin:0.3rem 0;padding:0.3rem;background:rgba(0,0,0,0.2);border-radius:4px;font-size:0.8rem">
        <span style="color:${canComplete ? '#00ff88' : '#ff8844'};font-weight:bold">${canComplete ? 'READY - All requirements met!' : 'IN PROGRESS - Requirements not yet met'}</span>
      </div>
      <div style="display:flex;gap:0.3rem;margin-top:0.3rem">
        ${template.dialogue ? `<button class="btn btn-sm btn-buy" onclick="startMissionDialogue(${i})">🗣️ Begin</button>` :
          `<button class="btn btn-sm ${canComplete ? 'btn-buy' : 'btn-secondary'}" ${!canComplete ? 'disabled' : ''} onclick="doCompleteMission(${i})">${canComplete ? '✅ Complete & Claim Reward' : '⏳ Not Ready'}</button>`}
        <button class="btn btn-sm btn-danger" onclick="doAbandonMission(${i})">❌ Abandon</button>
      </div>
    </div>`;
  }).join('') : '<div class="text-dim" style="padding:0.5rem">No active missions. Accept available missions below to earn cash, reputation, and unlock new opportunities.</div>';

  // Available missions
  const availableHtml = available.length > 0 ? available.map((m, i) => {
    const template = SIDE_MISSIONS.find(t => t.id === m.missionId);
    if (!template) return '';
    const tierLabels = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Very Hard', 5: 'Extreme' };
    const tierColors = { 1: '#00ff88', 2: '#ffcc00', 3: '#ff8844', 4: '#ff4444', 5: '#cc00ff' };
    const tierLabel = tierLabels[m.tier] || ('Tier ' + m.tier);
    const tierColor = tierColors[m.tier] || '#aaa';
    // Provide direction on what the mission involves
    const categoryDescs = {
      delivery: 'Acquire and deliver product',
      combat: 'Combat encounter - bring weapons',
      smuggling: 'Risky transport mission',
      social: 'Social skill check - speech matters',
      heist: 'Crew operation - need backup',
    };
    const catDesc = categoryDescs[template.category] || '';
    return `<div class="prop-card" style="border-color:#4488ff">
      <div class="prop-header">${template.emoji} ${template.name} <span style="color:${tierColor};font-weight:bold;font-size:0.8rem">[${tierLabel}]</span></div>
      <div style="font-size:0.75rem;color:#aaa;margin:0.2rem 0">${catDesc ? catDesc + ' | ' : ''}${m.daysLimit || '?'}d time limit</div>
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0.2rem 0">OBJECTIVE</div>
      <div class="prop-details" style="font-weight:bold">${template.getText(m.data)}</div>
      <div class="prop-details" style="color:#aaa;font-size:0.8rem;margin-top:0.2rem">${template.desc}</div>
      <button class="btn btn-sm btn-buy" ${active.length >= 3 ? 'disabled title="Max 3 active missions"' : ''} onclick="doAcceptMission(${i})">${active.length >= 3 ? '🔒 Max Active (3/3)' : '📋 Accept Mission'}</button>
    </div>`;
  }).join('') : '<div class="text-dim" style="padding:0.5rem">No missions available. New missions appear as you progress. Check back after advancing a day.</div>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#ff8844">📋 MISSIONS</h2>
      <div style="display:flex;gap:2rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
        <div><span class="stat-label">COMPLETED</span> <span style="color:#00ff88;font-weight:bold">${ms.totalMissionsCompleted || 0}</span></div>
        <div><span class="stat-label">FAILED</span> <span style="color:#ff4444;font-weight:bold">${ms.totalMissionsFailed || 0}</span></div>
        <div><span class="stat-label">REWARDS</span> <span style="color:#ffcc00;font-weight:bold">$${(ms.totalMissionRewards || 0).toLocaleString()}</span></div>
        <div><span class="stat-label">DILEMMAS</span> <span style="color:#ff8844;font-weight:bold">${ms.totalDilemmas || 0}</span></div>
      </div>

      <h3 style="color:#ffcc00;margin:0.5rem 0;font-size:1.1rem">🌟 MAIN MISSION${ms.activeMainMission ? ' (1/1)' : ''}</h3>
      ${(function() {
        if (typeof getCurrentAct !== 'function' || typeof getActMilestoneProgress !== 'function') return '<div class="text-dim" style="padding:0.5rem">Campaign not loaded.</div>';
        var act = getCurrentAct(gameState);
        var progress = getActMilestoneProgress(gameState);
        var activeMain = ms.activeMainMission;

        // Helper: generate milestone guidance HTML
        function milestoneGuidance(milestone, isDone) {
          // Try to find matching campaign mission objectives for richer info
          var campaignMission = null;
          if (typeof CAMPAIGN_ACTS !== 'undefined') {
            for (var ai = 0; ai < CAMPAIGN_ACTS.length; ai++) {
              if (CAMPAIGN_ACTS[ai].mainMissions) {
                for (var mi = 0; mi < CAMPAIGN_ACTS[ai].mainMissions.length; mi++) {
                  var cm = CAMPAIGN_ACTS[ai].mainMissions[mi];
                  if (cm.objectives) {
                    for (var oi = 0; oi < cm.objectives.length; oi++) {
                      if (cm.objectives[oi].id === milestone.id) { campaignMission = cm; break; }
                    }
                  }
                  if (campaignMission) break;
                }
              }
              if (campaignMission) break;
            }
          }

          var guidanceHtml = '';
          // Add how-to hint based on milestone id
          var howTo = '';
          var milestoneId = milestone.id || '';
          if (milestoneId.includes('10k') || milestoneId.includes('cash') || milestoneId.includes('net_worth') || milestoneId.includes('100k') || milestoneId.includes('500k') || milestoneId.includes('million')) {
            howTo = 'Earn money through drug trades, missions, heists, and business income. Check Market and Missions tabs.';
          } else if (milestoneId.includes('territory') || milestoneId.includes('Territory')) {
            howTo = 'Go to the Territory tab to claim or take over locations from rivals.';
          } else if (milestoneId.includes('crew') || milestoneId.includes('Crew')) {
            howTo = 'Visit Crew Management to recruit new members from available prospects.';
          } else if (milestoneId.includes('visit') || milestoneId.includes('cities') || milestoneId.includes('Horizons')) {
            howTo = 'Travel to different cities using the Travel tab. Explore new markets and opportunities.';
          } else if (milestoneId.includes('front') || milestoneId.includes('clean') || milestoneId.includes('launder')) {
            howTo = 'Purchase a front business from the Businesses tab to start laundering cash.';
          } else if (milestoneId.includes('property') || milestoneId.includes('estate') || milestoneId.includes('Real')) {
            howTo = 'Buy properties from the Real Estate section. Look for investment opportunities.';
          } else if (milestoneId.includes('distribution') || milestoneId.includes('Distribution')) {
            howTo = 'Set up distribution networks by assigning dealers to your controlled territories.';
          } else if (milestoneId.includes('debt') || milestoneId.includes('Debt')) {
            howTo = 'Pay off your debt using the Banking tab. Prioritize repayment to reduce interest costs.';
          } else if (milestoneId.includes('investigation') || milestoneId.includes('survive')) {
            howTo = 'Manage heat, use lawyers, and destroy evidence to survive federal attention.';
          } else if (milestoneId.includes('lieutenant') || milestoneId.includes('promoted')) {
            howTo = 'Promote experienced crew members in Crew Management. They need sufficient loyalty.';
          } else if (milestoneId.includes('endgame')) {
            howTo = 'Your ending will be determined by the state of your empire. Build it wisely.';
          }

          guidanceHtml += howTo ? '<div style="font-size:0.75rem;color:#88aaff;margin:0.3rem 0;font-style:italic">HOW TO: ' + howTo + '</div>' : '';

          // Status indicator
          if (isDone) {
            guidanceHtml += '<div style="padding:0.3rem;background:rgba(0,255,136,0.1);border-radius:4px;margin-top:0.3rem"><span style="color:#00ff88;font-weight:bold">&#10003; OBJECTIVE COMPLETE - Ready to claim!</span></div>';
          } else {
            guidanceHtml += '<div style="padding:0.3rem;background:rgba(255,136,68,0.1);border-radius:4px;margin-top:0.3rem"><span style="color:#ff8844">&#9675; IN PROGRESS - Keep working toward the objective</span></div>';
          }

          return guidanceHtml;
        }

        if (activeMain) {
          var milestone = act.milestones.find(function(m) { return m.id === activeMain.milestoneId; });
          if (milestone) {
            var isDone = progress.milestones.find(function(m) { return m.id === milestone.id && m.isCompleted; });
            var guidance = milestoneGuidance(milestone, isDone);
            return '<div style="background:rgba(255,200,0,0.08);border:2px solid ' + (isDone ? '#00ff88' : '#ffcc00') + ';border-radius:8px;padding:1rem;margin-bottom:1rem">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">' +
              '<h3 style="color:#ffcc00;margin:0">🌟 ' + milestone.name + '</h3>' +
              '<span style="color:var(--text-dim);font-size:0.75rem">Act ' + act.act + ': ' + act.name + '</span></div>' +
              '<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0.3rem 0">OBJECTIVE</div>' +
              '<p style="margin:0.2rem 0;color:var(--text-main);font-weight:bold">' + milestone.desc + '</p>' +
              guidance +
              '<p style="margin:0.3rem 0;font-size:0.8rem;color:#00ff88;background:rgba(0,255,136,0.05);padding:0.2rem 0.5rem;border-radius:4px">Reward: ' + milestone.reward + '</p>' +
              (isDone ? '<button class="btn btn-sm btn-buy btn-glow" style="margin-top:0.5rem" onclick="doCompleteMainMission()">🏆 Claim Reward</button>' :
                '<div style="margin-top:0.3rem;font-size:0.8rem;color:#ff8844">⏳ Working toward objective...</div>') +
              '</div>';
          }
        }
        var incomplete = progress.milestones.filter(function(m) { return !m.isCompleted && (!activeMain || activeMain.milestoneId !== m.id); });
        if (!activeMain && incomplete.length > 0) {
          var next = incomplete[0];
          var nextGuidance = milestoneGuidance(next, false);
          return '<div style="background:rgba(255,200,0,0.05);border:1px solid rgba(255,200,0,0.3);border-radius:8px;padding:1rem;margin-bottom:1rem">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">' +
            '<h3 style="color:#ffcc00;margin:0">🌟 ' + next.name + '</h3>' +
            '<span style="color:var(--text-dim);font-size:0.75rem">Act ' + act.act + ': ' + act.name + '</span></div>' +
            '<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0.3rem 0">OBJECTIVE</div>' +
            '<p style="margin:0.2rem 0;color:var(--text-main);font-weight:bold">' + next.desc + '</p>' +
            nextGuidance +
            '<p style="margin:0.3rem 0;font-size:0.8rem;color:#00ff88;background:rgba(0,255,136,0.05);padding:0.2rem 0.5rem;border-radius:4px">Reward: ' + next.reward + '</p>' +
            '<button class="btn btn-sm btn-primary" style="margin-top:0.5rem;border-color:#ffcc00;color:#ffcc00" onclick="doAcceptMainMission(&quot;' + next.id + '&quot;)">🎯 Accept Main Mission</button></div>';
        }
        if (!activeMain) return '<div style="background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.3);border-radius:8px;padding:0.8rem;margin-bottom:1rem;text-align:center"><span style="color:#00ff88">✅ All milestones for Act ' + act.act + ' complete!</span> <span style="color:var(--text-dim);font-size:0.8rem">' + progress.completed + '/' + progress.total + '</span></div>';
        return '';
      })()}

      ${dilemmaHtml}

      <h3 style="color:#ff8844;margin:0.8rem 0 0.5rem">📋 ACTIVE SIDE MISSIONS (${active.length}/3)</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${activeHtml}</div>

      <h3 style="color:#4488ff;margin:0.8rem 0 0.5rem">📝 AVAILABLE SIDE MISSIONS</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${availableHtml}</div>

      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doAcceptMission(index) {
  const result = acceptMission(gameState, index);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doAcceptMainMission(milestoneId) {
  if (!gameState.missions) gameState.missions = typeof initMissionState === 'function' ? initMissionState() : {};
  if (gameState.missions.activeMainMission) {
    gameState.messageLog.push('Already have an active main mission.');
    playSound('error');
    render();
    return;
  }
  gameState.missions.activeMainMission = { milestoneId, dayAccepted: gameState.day };
  gameState.messageLog.push('🌟 Main mission accepted: ' + milestoneId);
  playSound('click');
  render();
}

function doCompleteMainMission() {
  if (!gameState.missions || !gameState.missions.activeMainMission) return;
  const milestoneId = gameState.missions.activeMainMission.milestoneId;
  gameState.missions.activeMainMission = null;
  gameState.missions.totalMissionsCompleted = (gameState.missions.totalMissionsCompleted || 0) + 1;
  // XP bonus for main mission
  gameState.xp = (gameState.xp || 0) + 500;
  gameState.messageLog.push('🏆 Main mission complete! +500 XP. Milestone: ' + milestoneId);
  playSound('click');
  render();
}

function doCompleteMission(index) {
  const result = completeMission(gameState, index);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doAbandonMission(index) {
  if (!confirm('Abandon this mission? Trust -3.')) return;
  const result = abandonMission(gameState, index);
  gameState.messageLog.push(result.msg);
  render();
}

function doResolveDilemma(choiceId) {
  const result = resolveDilemma(gameState, choiceId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

// Mission dialogue system
let missionDialogueActive = null; // { missionIndex, nodeId }

function startMissionDialogue(missionIndex) {
  const ms = gameState.missions;
  if (!ms) return;
  const mission = ms.activeMissions[missionIndex];
  if (!mission) return;
  const template = SIDE_MISSIONS.find(t => t.id === mission.missionId);
  if (!template || !template.dialogue) {
    // No dialogue — complete directly
    doCompleteMission(missionIndex);
    return;
  }
  missionDialogueActive = { missionIndex, nodeId: 'start' };
  currentScreen = 'missiondialogue';
  render();
}

function renderMissionDialogue() {
  if (!missionDialogueActive) { currentScreen = 'missions'; return renderMissions(); }
  const ms = gameState.missions;
  const mission = ms.activeMissions[missionDialogueActive.missionIndex];
  if (!mission) { missionDialogueActive = null; currentScreen = 'missions'; return renderMissions(); }
  const template = SIDE_MISSIONS.find(t => t.id === mission.missionId);
  if (!template || !template.dialogue) { missionDialogueActive = null; currentScreen = 'missions'; return renderMissions(); }

  const node = template.dialogue.find(n => n.id === missionDialogueActive.nodeId);
  if (!node) { missionDialogueActive = null; currentScreen = 'missions'; return renderMissions(); }

  // Build conversation history
  const history = missionDialogueActive.history || [];
  let historyHtml = '';
  if (history.length > 0) {
    historyHtml = history.map(h => {
      const sColor = h.speaker === 'narrator' ? 'var(--text-dim)' : h.speaker === 'You' ? 'var(--neon-cyan)' : 'var(--neon-pink)';
      const sName = h.speaker === 'narrator' ? '— Narrator —' : h.speaker;
      return `<div style="margin-bottom:0.8rem;opacity:0.6;border-left:2px solid ${sColor};padding-left:0.8rem">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:${sColor}">${sName}</div>
        <div style="font-size:0.85rem;line-height:1.5;color:var(--text-main)">${h.text}</div>
        ${h.chose ? `<div style="font-size:0.7rem;color:var(--neon-cyan);margin-top:0.2rem">► ${h.chose}</div>` : ''}
      </div>`;
    }).join('');
    historyHtml = `<div style="max-height:250px;overflow-y:auto;margin-bottom:1rem;padding:0.5rem;border-radius:6px;background:rgba(0,0,0,0.3)">${historyHtml}</div>`;
  }

  const speakerColor = node.speaker === 'narrator' ? 'var(--text-dim)' : node.speaker === 'You' ? 'var(--neon-cyan)' : 'var(--neon-pink)';
  const speakerName = node.speaker === 'narrator' ? '— Narrator —' : node.speaker;

  let choicesHtml = '';
  if (node.choices && node.choices.length > 0) {
    choicesHtml = node.choices.map((c, i) => {
      let locked = false;
      let lockReason = '';
      if (c.reqSpeech && (gameState.speechSkill || 0) < c.reqSpeech) { locked = true; lockReason = `Speech ${c.reqSpeech}+`; }
      if (c.reqFear && (gameState.rep ? (gameState.rep.fear || 0) : 0) < c.reqFear) { locked = true; lockReason = `Fear ${c.reqFear}+`; }
      if (c.reqRep && (gameState.rep ? (gameState.rep.streetCred || 0) : 0) < c.reqRep) { locked = true; lockReason = `Rep ${c.reqRep}+`; }

      // Generate dialogue choice hints based on label keywords
      const dHints = [];
      const cLabel = (c.label || '').toLowerCase();
      if (cLabel.includes('threaten') || cLabel.includes('intimidat') || cLabel.includes('force') || cLabel.includes('attack')) {
        dHints.push('<span style="color:#ff4444">Aggressive</span>');
      }
      if (cLabel.includes('negotiate') || cLabel.includes('talk') || cLabel.includes('reason') || cLabel.includes('persuad') || cLabel.includes('charm')) {
        dHints.push('<span style="color:#88aaff">Diplomatic</span>');
      }
      if (cLabel.includes('lie') || cLabel.includes('bluff') || cLabel.includes('trick') || cLabel.includes('deceiv')) {
        dHints.push('<span style="color:#ffcc00">Deceptive</span>');
      }
      if (cLabel.includes('pay') || cLabel.includes('brib') || cLabel.includes('offer money') || cLabel.includes('buy')) {
        dHints.push('<span style="color:#ffcc00">Costs money</span>');
      }
      if (cLabel.includes('walk away') || cLabel.includes('leave') || cLabel.includes('refuse') || cLabel.includes('back off')) {
        dHints.push('<span style="color:#888">Safe exit</span>');
      }
      if (cLabel.includes('agree') || cLabel.includes('accept') || cLabel.includes('help') || cLabel.includes('cooperat')) {
        dHints.push('<span style="color:#44ff88">Cooperative</span>');
      }
      if (c.reqSpeech) dHints.push('<span style="color:#88aaff">Needs Speech ' + c.reqSpeech + '</span>');
      if (c.reqFear) dHints.push('<span style="color:#cc44ff">Needs Fear ' + c.reqFear + '</span>');
      if (c.reqRep) dHints.push('<span style="color:#ffcc00">Needs Rep ' + c.reqRep + '</span>');
      const dHintLine = dHints.length > 0 ? `<div style="font-size:0.65rem;margin-top:2px;opacity:0.8">${dHints.join(' | ')}</div>` : '';

      return `<button class="btn ${locked ? 'btn-secondary' : 'btn-primary'}" style="margin:0.3rem;text-align:left;max-width:500px;width:100%;padding:0.5rem 0.8rem;${locked ? 'opacity:0.5' : ''}"
        ${locked ? 'disabled' : `onclick="advanceMissionDialogue('${c.next}', ${i})"`}>
        ${c.label}${locked ? ` <span style="font-size:0.7rem;color:#ff4444">[${lockReason}]</span>` : ''}${dHintLine}
      </button>`;
    }).join('');
  } else {
    // End node — complete mission
    choicesHtml = `<button class="btn btn-primary btn-glow" style="margin-top:1rem" onclick="endMissionDialogue()">✅ Complete Mission</button>`;
  }

  return `
    <div class="screen-container" style="max-width:650px;margin:0 auto">
      <h2 class="section-title" style="color:#ff8844">${template.emoji} ${template.name}</h2>
      ${historyHtml}
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:1.5rem;margin:1rem 0">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${speakerColor};margin-bottom:0.5rem">${speakerName}</div>
        <div style="font-size:1.05rem;line-height:1.8;color:var(--text-main)">${node.text}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center">${choicesHtml}</div>
      <button class="btn btn-secondary" style="margin-top:1rem;opacity:0.6" onclick="missionDialogueActive=null;currentScreen='missions';render()">← Leave Conversation</button>
    </div>`;
}

function advanceMissionDialogue(nextNodeId, choiceIndex) {
  playSound('click');
  if (!missionDialogueActive) return;

  // Get current node and apply choice effects
  const ms = gameState.missions;
  const mission = ms.activeMissions[missionDialogueActive.missionIndex];
  if (mission) {
    const template = SIDE_MISSIONS.find(t => t.id === mission.missionId);
    if (template && template.dialogue) {
      const currentNode = template.dialogue.find(n => n.id === missionDialogueActive.nodeId);
      if (currentNode && currentNode.choices && currentNode.choices[choiceIndex]) {
        const choice = currentNode.choices[choiceIndex];

        // Save what player said to dialogue history
        if (!missionDialogueActive.history) missionDialogueActive.history = [];
        missionDialogueActive.history.push({
          speaker: currentNode.speaker,
          text: currentNode.text,
          chose: choice.label
        });

        // Apply effects
        if (choice.effects) {
          if (choice.effects.cash === 'reward' && mission.data && mission.data.reward) {
            gameState.cash += mission.data.reward;
          } else if (typeof choice.effects.cash === 'number') {
            gameState.cash += choice.effects.cash;
          }
          if (choice.effects.trust && typeof adjustRep === 'function') {
            adjustRep(gameState, 'streetCred', choice.effects.trust);
          }
          if (choice.effects.fear && typeof adjustRep === 'function') {
            adjustRep(gameState, 'fear', choice.effects.fear);
          }
          if (choice.effects.heat) {
            gameState.heat = Math.min(100, (gameState.heat || 0) + choice.effects.heat);
          }
          if (choice.effects.rep && typeof adjustRep === 'function') {
            adjustRep(gameState, 'streetCred', choice.effects.rep);
          }
        }
      }
    }
  }

  missionDialogueActive.nodeId = nextNodeId;
  render();
}

function endMissionDialogue() {
  if (!missionDialogueActive) { currentScreen = 'missions'; render(); return; }
  const idx = missionDialogueActive.missionIndex;

  // Apply final node effects too (some end nodes have narrator text with implied completion)
  const ms = gameState.missions;
  const mission = ms.activeMissions[idx];
  if (mission) {
    const template = SIDE_MISSIONS.find(t => t.id === mission.missionId);
    if (template && template.dialogue) {
      const finalNode = template.dialogue.find(n => n.id === missionDialogueActive.nodeId);
      if (finalNode) {
        // Add final node to history
        if (!missionDialogueActive.history) missionDialogueActive.history = [];
        missionDialogueActive.history.push({ speaker: finalNode.speaker, text: finalNode.text, chose: null });
      }
    }
  }

  missionDialogueActive = null;
  doCompleteMission(idx);
  currentScreen = 'missions';
  render();
}

// ============================================================
// FUTURES TRADING SCREEN
// ============================================================
let futuresSelectedDrug = null;
let futuresSelectedType = 'long';
let futuresSelectedDuration = 'medium_term';
let futuresSelectedQty = 10;

function renderFutures() {
  if (typeof createFuturesContract === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#00cc88">📊 FUTURES TRADING</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  if (!gameState.futures) gameState.futures = initFuturesState();
  const ft = gameState.futures;
  const drugs = typeof DRUGS !== 'undefined' ? DRUGS : [];

  // Drug selector
  if (!futuresSelectedDrug && drugs.length > 0) futuresSelectedDrug = drugs[0].id;
  const drugButtons = drugs.map(d => {
    const price = (gameState.prices && gameState.prices[d.id]) || d.minPrice || d.basePrice || 100;
    const selected = futuresSelectedDrug === d.id;
    return `<button class="btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}" style="margin:0.2rem;${selected ? 'border-color:#00cc88' : ''}" onclick="futuresSelectedDrug='${d.id}';render()">${d.emoji || '💊'} ${d.name} <span style="color:#ffcc00">$${price}</span></button>`;
  }).join('');

  // Analysis for selected drug
  let analysisHtml = '';
  if (futuresSelectedDrug) {
    const analysis = getFuturesAnalysis(gameState, futuresSelectedDrug);
    if (analysis) {
      const trendColor = analysis.trend === 'bullish' ? '#00ff88' : analysis.trend === 'bearish' ? '#ff4444' : '#ffcc00';
      const volColor = analysis.volatility === 'high' ? '#ff4444' : analysis.volatility === 'low' ? '#00ff88' : '#ffcc00';
      analysisHtml = `
        <div style="background:var(--bg-card);border:1px solid #00cc88;border-radius:8px;padding:0.8rem;margin:0.5rem 0">
          <div style="font-weight:bold;color:#00cc88;margin-bottom:0.3rem">📊 ${analysis.drugName} Market Analysis</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;font-size:0.85rem">
            <div>Price: <span style="color:#ffcc00">$${analysis.currentPrice}</span></div>
            <div>Trend: <span style="color:${trendColor}">${analysis.trend.toUpperCase()}</span></div>
            <div>Volatility: <span style="color:${volColor}">${analysis.volatility.toUpperCase()}</span></div>
            <div>Range: $${analysis.minPrice} - $${analysis.maxPrice}</div>
            <div>Avg Change: <span style="color:${analysis.avgChange >= 0 ? '#00ff88' : '#ff4444'}">$${analysis.avgChange != null && !isNaN(analysis.avgChange) ? analysis.avgChange.toLocaleString() : '—'}</span></div>
            <div>Data Points: ${analysis.historyLength}</div>
          </div>
        </div>`;
    }
  }

  // Contract type and duration selector
  const typeButtons = FUTURES_CONTRACT_TYPES.map(t => {
    const sel = futuresSelectedType === t.id;
    return `<button class="btn btn-sm ${sel ? 'btn-primary' : 'btn-secondary'}" style="margin:0.2rem" onclick="futuresSelectedType='${t.id}';render()">${t.emoji} ${t.name}</button>`;
  }).join('');

  const durationButtons = FUTURES_DURATIONS.map(d => {
    const sel = futuresSelectedDuration === d.id;
    return `<button class="btn btn-sm ${sel ? 'btn-primary' : 'btn-secondary'}" style="margin:0.2rem" onclick="futuresSelectedDuration='${d.id}';render()">${d.name} (${Math.round(d.premiumMult * 100)}% premium)</button>`;
  }).join('');

  // Premium calculation
  let premiumHtml = '';
  if (futuresSelectedDrug) {
    const drug = drugs.find(d => d.id === futuresSelectedDrug);
    const rawPrice = gameState.prices ? gameState.prices[futuresSelectedDrug] : null;
    const price = rawPrice || (drug ? (drug.minPrice || drug.basePrice || 100) : 100);
    const dur = FUTURES_DURATIONS.find(d => d.id === futuresSelectedDuration) || FUTURES_DURATIONS[1];
    const premium = Math.round(price * futuresSelectedQty * dur.premiumMult);
    const canAfford = gameState.cash >= premium;
    const canOpen = ft.contracts.length < ft.maxConcurrentContracts;
    premiumHtml = `
      <div style="background:rgba(0,204,136,0.1);border:1px solid #00cc88;border-radius:8px;padding:0.8rem;margin:0.5rem 0">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <div>Quantity: <input type="number" min="1" max="999" value="${futuresSelectedQty}" onchange="futuresSelectedQty=Math.max(1,parseInt(this.value)||10);render()" style="width:60px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-main);padding:0.2rem;border-radius:4px"></div>
          <div>Premium: <span style="color:#ffcc00;font-weight:bold">$${premium.toLocaleString()}</span></div>
          <div>Max Payout: <span style="color:#00ff88">$${(price * futuresSelectedQty * 2).toLocaleString()}</span></div>
        </div>
        <button class="btn btn-primary" style="margin-top:0.5rem;border-color:#00cc88;color:#00cc88" ${!canAfford || !canOpen ? 'disabled' : ''} onclick="doOpenFutures()">
          📝 Open Contract ${!canAfford ? '(Can\'t Afford)' : !canOpen ? '(Max Contracts)' : ''}
        </button>
      </div>`;
  }

  // Active contracts
  const activeHtml = ft.contracts.length > 0 ? ft.contracts.map((c, i) => {
    const currentPrice = gameState.prices ? (gameState.prices[c.drugId] || c.strikePrice) : c.strikePrice;
    const priceDiff = (currentPrice - c.strikePrice) * c.direction;
    const unrealizedPnl = Math.round(priceDiff * c.quantity);
    const daysLeft = c.expiresDay - gameState.day;
    const pnlColor = unrealizedPnl >= 0 ? '#00ff88' : '#ff4444';
    const typeEmoji = c.direction > 0 ? '📈' : '📉';
    return `<div class="prop-card" style="border-color:${unrealizedPnl >= 0 ? '#00cc88' : '#ff4444'}">
      <div class="prop-header">${typeEmoji} ${c.drugName} ${c.type.toUpperCase()} <span style="color:${daysLeft <= 2 ? '#ff0000' : '#ffcc00'}">(${daysLeft}d left)</span></div>
      <div style="font-size:0.8rem;display:grid;grid-template-columns:1fr 1fr;gap:0.2rem">
        <div>Strike: $${c.strikePrice}</div>
        <div>Current: $${currentPrice}</div>
        <div>Qty: ${c.quantity}</div>
        <div>Premium: $${c.premium.toLocaleString()}</div>
      </div>
      <div style="margin-top:0.3rem;font-weight:bold;color:${pnlColor}">Unrealized: ${unrealizedPnl >= 0 ? '+' : ''}$${unrealizedPnl.toLocaleString()}</div>
      <button class="btn btn-sm btn-secondary" style="margin-top:0.3rem" onclick="doSettleFutures(${i})">💰 Settle Early (-30%)</button>
    </div>`;
  }).join('') : '<div class="text-dim" style="padding:0.5rem">No active contracts.</div>';

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#00cc88">📊 FUTURES TRADING</h2>
      <p style="font-size:0.85rem;color:var(--text-dim)">Hedge against drug price volatility. Go long if you think prices rise, short if they fall.</p>
      <div style="display:flex;gap:2rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
        <div><span class="stat-label">CONTRACTS</span> <span style="color:#00cc88;font-weight:bold">${ft.contractsTraded}</span></div>
        <div><span class="stat-label">PROFITS</span> <span style="color:#00ff88;font-weight:bold">$${ft.totalProfits.toLocaleString()}</span></div>
        <div><span class="stat-label">LOSSES</span> <span style="color:#ff4444;font-weight:bold">$${ft.totalLosses.toLocaleString()}</span></div>
        <div><span class="stat-label">NET</span> <span style="color:${ft.totalProfits - ft.totalLosses >= 0 ? '#00ff88' : '#ff4444'};font-weight:bold">$${(ft.totalProfits - ft.totalLosses).toLocaleString()}</span></div>
      </div>

      <h3 style="color:#00cc88;margin:0.5rem 0">📝 NEW CONTRACT</h3>
      <div style="margin:0.3rem 0"><span class="stat-label">Drug:</span> <div style="display:flex;flex-wrap:wrap">${drugButtons}</div></div>
      ${analysisHtml}
      <div style="margin:0.3rem 0"><span class="stat-label">Position:</span> ${typeButtons}</div>
      <div style="margin:0.3rem 0"><span class="stat-label">Duration:</span> ${durationButtons}</div>
      ${premiumHtml}

      <h3 style="color:#00cc88;margin:0.5rem 0">📋 ACTIVE CONTRACTS (${ft.contracts.length}/${ft.maxConcurrentContracts})</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${activeHtml}</div>

      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>`;
}

function doOpenFutures() {
  const result = createFuturesContract(gameState, futuresSelectedDrug, futuresSelectedType, futuresSelectedDuration, futuresSelectedQty);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  else playSound('error');
  render();
}

function doSettleFutures(index) {
  if (!confirm('Settle early? You lose 30% of profits or pay 20% more on losses.')) return;
  const result = settleFuturesContract(gameState, index, true);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

// ============================================================
// SECURITY / HEAT MANAGEMENT SCREEN
// ============================================================
function renderSecurity() {
  if (typeof HEAT_TIERS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title" style="color:#ff6666">🛡️ SECURITY</h2><p>System not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  const hs = gameState.heatSystem || {};
  const tier = typeof getHeatTier === 'function' ? getHeatTier(gameState) : HEAT_TIERS[0];

  // Heat bars
  const heatBars = `
    <div style="margin-bottom:1rem">
      <div style="margin:0.3rem 0"><span class="text-dim">👮 Local:</span> <span class="heat-bar" style="display:inline-block;width:200px"><span class="heat-fill" style="width:${hs.local || 0}%;background:#ff9500"></span></span> <span>${Math.round(hs.local || 0)}/100</span></div>
      <div style="margin:0.3rem 0"><span class="text-dim">🕵️ City:</span> <span class="heat-bar" style="display:inline-block;width:200px"><span class="heat-fill" style="width:${hs.city || 0}%;background:#ff4444"></span></span> <span>${Math.round(hs.city || 0)}/100</span></div>
      <div style="margin:0.3rem 0"><span class="text-dim">🏛️ Federal:</span> <span class="heat-bar" style="display:inline-block;width:200px"><span class="heat-fill" style="width:${hs.federal || 0}%;background:#ff0000"></span></span> <span>${Math.round(hs.federal || 0)}/100</span></div>
    </div>
  `;

  // Counter-measures
  const cmCards = (typeof COUNTER_MEASURES !== 'undefined' ? COUNTER_MEASURES : []).map(cm => {
    const isActive = (hs.counterMeasures || []).some(active => active.id === cm.id && gameState.day < active.expiresDay);
    const activeCm = isActive ? (hs.counterMeasures || []).find(a => a.id === cm.id && gameState.day < a.expiresDay) : null;
    const daysLeft = activeCm ? activeCm.expiresDay - gameState.day : 0;

    return `<div class="prop-card" style="border-color:${isActive ? '#00ff88' : '#ff6666'}">
      <div class="prop-header">${cm.emoji} ${cm.name}</div>
      <div class="prop-details">${cm.desc}<br>
        <span class="text-dim">Cost:</span> $${cm.cost.toLocaleString()} | <span class="text-dim">Duration:</span> ${cm.duration > 0 ? cm.duration + ' days' : 'Instant'}
        ${isActive ? `<br><span class="neon-green">✅ Active (${daysLeft}d left)</span>` : ''}
      </div>
      ${!isActive ? `<button class="btn btn-sm btn-buy" onclick="doBuyCounterMeasure('${cm.id}')">🛡️ Buy ($${cm.cost.toLocaleString()})</button>` : ''}
    </div>`;
  }).join('');

  // Vehicles
  const vehicleCards = (typeof CHASE_VEHICLES !== 'undefined' ? CHASE_VEHICLES : []).filter(v => v.cost).map(v => {
    const owned = (hs.vehicles || []).includes(v.id);
    const isActive = (hs.activeVehicle || 'on_foot') === v.id;
    return `<div class="prop-card" style="border-color:${isActive ? '#00ff88' : owned ? '#4488ff' : '#555'}">
      <div class="prop-header">${v.emoji} ${v.name} ${isActive ? '✅' : ''}</div>
      <div class="prop-details">
        Speed: ${v.speed} | Handling: ${v.handling}${v.armor ? ` | Armor: ${v.armor}` : ''}${v.waterOnly ? ' | 🌊 Water only' : ''}<br>
        ${owned ? (isActive ? '<span class="neon-green">Active</span>' : `<button class="btn btn-sm btn-secondary" style="border-color:#4488ff;color:#4488ff" onclick="doSetVehicle('${v.id}')">Set Active</button>`) : `<button class="btn btn-sm btn-buy" onclick="doBuyVehicle('${v.id}')">Buy $${v.cost.toLocaleString()}</button>`}
      </div>
    </div>`;
  }).join('');

  // Wiretaps (if detected)
  const wiretapInfo = (hs.wiretaps || []).filter(w => w.detected).length > 0
    ? `<div class="prop-card" style="border-color:#ff0000"><div class="prop-header">📡 WIRETAP DETECTED!</div><div class="prop-details">Counter-intelligence has detected surveillance. Use Bug Sweep to remove.</div></div>`
    : '';

  // Chase stats
  const chaseStats = `Chases: ${hs.totalChases || 0} | Escaped: ${hs.chasesEscaped || 0} | Caught: ${hs.chasesFailed || 0}`;

  return `
    <div class="screen-container">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="color:#ff6666">🛡️ SECURITY & HEAT MANAGEMENT</h2>
      <div style="text-align:center;margin-bottom:0.5rem">
        <span style="font-size:1.2rem;color:${tier.color}">${tier.emoji} Current Threat: ${tier.name}</span>
      </div>
      ${heatBars}
      ${typeof getRaidAnalysis === 'function' ? (() => {
        const analysis = getRaidAnalysis(gameState);
        return `<div class="card" style="border-color:${analysis.riskColor};margin-bottom:1rem">
          <div class="card-header"><span>🚨 Raid Risk Assessment</span><span style="color:${analysis.riskColor};font-weight:700">${analysis.riskLevel} (${analysis.chance}%)</span></div>
          <div class="stat-bar"><div class="stat-fill" style="width:${analysis.chance}%;background:${analysis.riskColor}"></div></div>
          <div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.3rem">Most likely: ${analysis.nextLikelyRaid}</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem">${analysis.factors.map(f =>
            '<span style="background:rgba(255,255,255,0.05);padding:0.15rem 0.4rem;border-radius:3px;font-size:0.7rem">' + f.name + ': ' + f.effect + '</span>'
          ).join('')}</div>
        </div>`;
      })() : ''}
      ${gameState.pendingRaid ? (() => {
        const r = gameState.pendingRaid;
        return `<div class="card" style="border-color:#ff0000;background:rgba(255,0,0,0.1);margin-bottom:1rem;animation:pulse 1s infinite">
          <div class="card-header"><span style="color:#ff0000;font-size:1.1rem">${r.type.emoji} ACTIVE RAID: ${r.type.name}</span></div>
          <p style="color:var(--text-main);margin:0.3rem 0">${r.type.desc}</p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.3rem;margin:0.5rem 0;font-size:0.8rem">
            <div>💰 Bribe: ${r.bribeChance}% success ($${r.bribeCost.toLocaleString()})</div>
            <div>🏃 Flee: ${r.fleeChance}% success</div>
            <div>⚔️ Fight: ${r.fightChance}% success</div>
            <div>⚖️ Lawyer: -${r.lawyerReduction}% jail time</div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem">
            <button class="btn btn-sm btn-buy" onclick="doRaidResponse('bribe')">💰 Bribe ($${r.bribeCost.toLocaleString()})</button>
            <button class="btn btn-sm btn-secondary" style="border-color:#00aaff;color:#00aaff" onclick="doRaidResponse('flee')">🏃 Flee (${r.fleeChance}%)</button>
            <button class="btn btn-sm btn-secondary" style="border-color:#ff4444;color:#ff4444" onclick="doRaidResponse('fight')">⚔️ Fight (${r.fightChance}%)</button>
            <button class="btn btn-sm btn-secondary" style="border-color:#ffaa00;color:#ffaa00" onclick="doRaidResponse('lawyer')">⚖️ Lawyer</button>
            <button class="btn btn-sm btn-secondary" style="border-color:#888;color:#888" onclick="doRaidResponse('surrender')">🏳️ Surrender</button>
          </div>
        </div>`;
      })() : ''}
      ${typeof getSkillEffectsSummary === 'function' ? (() => {
        const efx = getSkillEffectsSummary(gameState);
        return efx.length > 0 ? `<div class="card" style="border-color:#00ff88;margin-bottom:1rem">
          <div class="card-header"><span>🧬 Active Skill Effects</span></div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${efx.map(e =>
            '<span class="perk-chip" style="font-size:0.7rem">' + e.emoji + ' ' + e.label + ': ' + e.value + '</span>'
          ).join('')}</div>
        </div>` : '';
      })() : ''}
      ${wiretapInfo}
      <h3 style="color:#ff6666;margin:0.5rem 0">🛡️ COUNTER-MEASURES</h3>
      <div class="char-grid" style="grid-template-columns:repeat(2,1fr)">${cmCards}</div>
      <h3 style="color:#4488ff;margin:0.5rem 0">🚗 VEHICLES (Chase Getaways)</h3>
      <div class="char-grid" style="grid-template-columns:repeat(3,1fr)">${vehicleCards}</div>
      <div class="text-dim" style="margin-top:0.5rem;text-align:center">${chaseStats}</div>
      <button class="btn btn-secondary" style="margin-top:1rem" onclick="currentScreen='game'; render();">← Back</button>
    </div>
  `;
}

function doRaidResponse(responseId) {
  if (!gameState.pendingRaid) return;
  if (typeof executeRaidResponse !== 'function') return;
  const result = executeRaidResponse(gameState, gameState.pendingRaid, responseId);
  gameState.pendingRaid = null;
  if (result.success) {
    showNotification(result.msg, 'success');
    playSound('click');
  } else {
    showNotification(result.msg, 'error');
    playSound('error');
  }
  gameState.messageLog.push(result.msg);
  render();
}

function doBuyCounterMeasure(measureId) {
  const result = buyCounterMeasure(gameState, measureId);
  gameState.messageLog.push(result.msg);
  if (result.success) playSound('click');
  render();
}

function doSetVehicle(vehicleId) {
  const result = setActiveVehicle(gameState, vehicleId);
  if (result.msg) gameState.messageLog.push(result.msg);
  if (result.message) gameState.messageLog.push(result.message);
  if (result.success) playSound('click');
  render();
}

// ============================================================
// STATS / PORTFOLIO SCREEN
// ============================================================
function renderStats() {
  const s = gameState.stats || {};
  const ledger = s.drugLedger || {};
  const nwHistory = s.netWorthHistory || [];

  // Calculate current net worth
  let inventoryValue = 0;
  const invItems = [];
  for (const drugId in gameState.inventory) {
    const qty = gameState.inventory[drugId];
    const price = gameState.prices[drugId];
    const val = (price !== null && price !== undefined) ? price * qty : 0;
    inventoryValue += val;
    const drug = DRUGS.find(d => d.id === drugId);
    invItems.push({ name: drug ? drug.name : drugId, emoji: drug ? drug.emoji : '', qty, price: price || 0, value: val });
  }
  const netWorth = gameState.cash + gameState.bank - gameState.debt + inventoryValue;
  const totalProfit = (s.totalEarnedFromDrugs || 0) - (s.totalSpentOnDrugs || 0);

  // Per-drug P&L
  const drugPnL = [];
  for (const drugId in ledger) {
    const d = ledger[drugId];
    const drug = DRUGS.find(dr => dr.id === drugId);
    const profit = d.earned - d.spent;
    drugPnL.push({ id: drugId, name: drug ? drug.name : drugId, emoji: drug ? drug.emoji : '', bought: d.bought, sold: d.sold, spent: d.spent, earned: d.earned, profit });
  }
  drugPnL.sort((a, b) => b.profit - a.profit);

  // Most profitable drug
  const bestDrug = drugPnL.length > 0 ? drugPnL[0] : null;
  const worstDrug = drugPnL.length > 0 ? drugPnL[drugPnL.length - 1] : null;

  // Net worth chart SVG
  const nwChart = nwHistory.length >= 2 ? buildLineChart(nwHistory.map(h => h.netWorth), 'var(--neon-cyan)', 300, 80) : '<span style="opacity:0.5">Need more data...</span>';
  const cashChart = nwHistory.length >= 2 ? buildLineChart(nwHistory.map(h => h.cash + h.bank), 'var(--neon-green)', 300, 80) : '';
  const debtChart = nwHistory.length >= 2 ? buildLineChart(nwHistory.map(h => h.debt), 'var(--neon-red)', 300, 80) : '';

  // Drug profit bar chart
  const drugBars = drugPnL.length > 0 ? buildBarChart(drugPnL.slice(0, 8)) : '<span style="opacity:0.5">No trades yet</span>';

  // Trade log (recent)
  const recentTrades = (s.tradeLog || []).slice(-10).reverse();

  return `
    <div class="game-screen">
      ${renderToolbar()}
      ${backButton()}
      <h2 class="section-title" style="text-align:center;margin:1rem 0;">📊 EMPIRE STATS</h2>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-bottom:1rem;">← BACK</button>

      <!-- Overview Cards -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-card-label">NET WORTH</div>
          <div class="stat-card-value ${netWorth >= 0 ? 'neon-green' : 'neon-red'}">$${netWorth.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">DRUG PROFIT</div>
          <div class="stat-card-value ${totalProfit >= 0 ? 'neon-green' : 'neon-red'}">$${totalProfit.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">CASH + BANK</div>
          <div class="stat-card-value neon-green">$${(gameState.cash + gameState.bank).toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">DEBT</div>
          <div class="stat-card-value neon-red">$${gameState.debt.toLocaleString()}</div>
        </div>
      </div>

      <!-- Life Status -->
      <div class="stats-section" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.8rem;margin:0.8rem 0;">
        <h3 class="section-title" style="color:var(--neon-purple);">🧬 LIFE STATUS</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.5rem;font-size:0.8rem;">
          <div><span style="color:#888">💰 Dirty Money:</span> <span class="${(gameState.dirtyMoney || 0) > 5000 ? 'neon-red' : 'neon-green'}">$${(gameState.dirtyMoney || 0).toLocaleString()}</span></div>
          <div><span style="color:#888">🏦 Clean Money:</span> <span class="neon-green">$${(gameState.cleanMoney || 0).toLocaleString()}</span></div>
          <div><span style="color:#888">👶 Children:</span> <span class="neon-cyan">${gameState.relationships && gameState.relationships.children ? gameState.relationships.children.length : 0}</span></div>
          <div><span style="color:#888">💔 Divorces:</span> <span class="neon-red">${gameState.relationships && gameState.relationships.divorces ? gameState.relationships.divorces : 0}</span></div>
          <div><span style="color:#888">🩹 Scars:</span> <span class="neon-yellow">${gameState.scars ? gameState.scars.length : 0}</span></div>
          <div><span style="color:#888">❤️ Max Health:</span> <span class="${(gameState.maxHealth || 100) < 80 ? 'neon-red' : 'neon-green'}">${gameState.maxHealth || 100}</span></div>
          <div><span style="color:#888">⚖️ Child Support:</span> <span class="neon-yellow">$${gameState.relationships && gameState.relationships.children && gameState.relationships.children.length > 0 ? (gameState.relationships.children.length * 500).toLocaleString() + '/day' : '0'}</span></div>
          <div><span style="color:#888">🏴 Territories:</span> <span class="neon-cyan">${gameState.territory ? Object.keys(gameState.territory).filter(k => gameState.territory[k].controlled).length : 0}</span></div>
        </div>
        ${gameState.scars && gameState.scars.length > 0 ? '<div style="margin-top:0.4rem;font-size:0.7rem;color:#888">Scars: ' + gameState.scars.map(function(s) { return '🩹 ' + s.type + ' (day ' + s.day + ')'; }).join(', ') + '</div>' : ''}
        ${gameState.playerTraits && Object.keys(gameState.playerTraits).length > 0 ? '<div style="margin-top:0.4rem;font-size:0.7rem;"><span style="color:var(--neon-purple);">Traits:</span> ' + Object.entries(gameState.playerTraits).map(function(e) { return '<span style="background:rgba(180,0,255,0.15);padding:1px 6px;border-radius:3px;margin:1px;">' + e[0].replace(/_/g,' ') + (e[1] > 1 ? ' x' + e[1] : '') + '</span>'; }).join(' ') + '</div>' : ''}
        ${gameState.playerAbilities && Object.keys(gameState.playerAbilities).length > 0 ? '<div style="margin-top:0.4rem;font-size:0.7rem;"><span style="color:var(--neon-green);">Abilities:</span> ' + Object.keys(gameState.playerAbilities).map(function(a) { return '<span style="background:rgba(0,255,100,0.1);padding:1px 6px;border-radius:3px;margin:1px;">' + a.replace(/_/g,' ') + '</span>'; }).join(' ') + '</div>' : ''}
        ${typeof getTraitBonuses === 'function' ? (() => {
          var tb = getTraitBonuses(gameState);
          var bonusList = [];
          if (tb.buyDiscount) bonusList.push('🛒 Buy -' + Math.round(tb.buyDiscount * 100) + '%');
          if (tb.sellBonus) bonusList.push('💰 Sell +' + Math.round(tb.sellBonus * 100) + '%');
          if (tb.combatDamage) bonusList.push('⚔️ Damage +' + Math.round(tb.combatDamage * 100) + '%');
          if (tb.combatAccuracy) bonusList.push('🎯 Accuracy +' + Math.round(tb.combatAccuracy * 100) + '%');
          if (tb.escapeChance) bonusList.push('💨 Escape +' + Math.round(tb.escapeChance * 100) + '%');
          if (tb.heatReduction) bonusList.push('❄️ Heat -' + Math.round(tb.heatReduction * 100) + '%/day');
          if (tb.crewSlots) bonusList.push('👥 +' + tb.crewSlots + ' crew slots');
          if (tb.crewMorale) bonusList.push('❤️ +' + tb.crewMorale + ' morale/day');
          if (tb.intimidation) bonusList.push('😤 +' + tb.intimidation + ' intimidation');
          if (tb.factionGain) bonusList.push('🤝 +' + Math.round(tb.factionGain * 100) + '% faction gains');
          if (tb.heistSuccess) bonusList.push('🎯 +' + Math.round(tb.heistSuccess * 100) + '% heist success');
          if (tb.communityProtection) bonusList.push('🛡️ Community protection');
          if (tb.ambushAvoidance) bonusList.push('👁️ -' + Math.round(tb.ambushAvoidance * 100) + '% ambush');
          if (tb.courtBonus) bonusList.push('⚖️ +' + Math.round(tb.courtBonus * 100) + '% court success');
          if (tb.bribeCostReduction) bonusList.push('💵 -' + Math.round(tb.bribeCostReduction * 100) + '% bribe cost');
          if (bonusList.length === 0) return '';
          return '<div style="margin-top:0.5rem;padding:0.4rem;background:rgba(255,200,0,0.05);border:1px solid rgba(255,200,0,0.15);border-radius:6px;"><div style="font-size:0.75rem;color:var(--neon-yellow);font-weight:bold;margin-bottom:0.3rem">⭐ ACTIVE TRAIT BONUSES</div><div style="display:flex;flex-wrap:wrap;gap:0.3rem;font-size:0.7rem">' + bonusList.map(function(b) { return '<span style="background:rgba(255,200,0,0.1);padding:2px 6px;border-radius:3px">' + b + '</span>'; }).join('') + '</div></div>';
        })() : ''}
      </div>

      <!-- Net Worth Chart -->
      <div class="stats-section">
        <h3 class="section-title">📈 NET WORTH OVER TIME</h3>
        <div class="stats-chart-container">${nwChart}</div>
      </div>

      <!-- Cash & Debt Charts side by side -->
      ${nwHistory.length >= 2 ? `
      <div class="stats-dual-charts">
        <div class="stats-section" style="flex:1">
          <h3 class="section-title" style="font-size:0.85rem">💰 CASH + BANK</h3>
          <div class="stats-chart-container">${cashChart}</div>
        </div>
        <div class="stats-section" style="flex:1">
          <h3 class="section-title" style="font-size:0.85rem">💀 DEBT</h3>
          <div class="stats-chart-container">${debtChart}</div>
        </div>
      </div>` : ''}

      <!-- Drug Profit Ranking -->
      <div class="stats-section">
        <h3 class="section-title">💊 DRUG PROFIT RANKING</h3>
        ${drugBars}
      </div>

      <!-- Current Holdings -->
      ${invItems.length > 0 ? `
      <div class="stats-section">
        <h3 class="section-title">🎒 CURRENT HOLDINGS</h3>
        <table class="data-table">
          <thead><tr><th>Drug</th><th>Qty</th><th>Market Price</th><th>Total Value</th></tr></thead>
          <tbody>
            ${invItems.map(i => `<tr>
              <td>${i.emoji} ${i.name}</td>
              <td>${i.qty}</td>
              <td>$${i.price.toLocaleString()}</td>
              <td class="neon-green">$${i.value.toLocaleString()}</td>
            </tr>`).join('')}
            <tr style="border-top:1px solid var(--neon-cyan);">
              <td colspan="3" style="text-align:right"><strong>Portfolio Value:</strong></td>
              <td class="neon-cyan"><strong>$${inventoryValue.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>` : ''}

      <!-- Per-Drug Breakdown -->
      ${drugPnL.length > 0 ? `
      <div class="stats-section">
        <h3 class="section-title">📋 DRUG-BY-DRUG P&L</h3>
        <table class="data-table">
          <thead><tr><th>Drug</th><th>Bought</th><th>Sold</th><th>Spent</th><th>Earned</th><th>Profit</th></tr></thead>
          <tbody>
            ${drugPnL.map(d => `<tr>
              <td>${d.emoji} ${d.name}</td>
              <td>${d.bought}</td>
              <td>${d.sold}</td>
              <td class="neon-red">$${d.spent.toLocaleString()}</td>
              <td class="neon-green">$${d.earned.toLocaleString()}</td>
              <td class="${d.profit >= 0 ? 'neon-green' : 'neon-red'}">$${d.profit.toLocaleString()}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

      <!-- Highlights -->
      <div class="stats-section">
        <h3 class="section-title">🏆 HIGHLIGHTS</h3>
        <div class="stats-highlights">
          ${bestDrug ? `<div class="highlight-item"><span class="highlight-label">Most Profitable Drug</span><span class="highlight-value neon-green">${bestDrug.emoji} ${bestDrug.name} (+$${bestDrug.profit.toLocaleString()})</span></div>` : ''}
          ${worstDrug && worstDrug.profit < 0 ? `<div class="highlight-item"><span class="highlight-label">Biggest Money Pit</span><span class="highlight-value neon-red">${worstDrug.emoji} ${worstDrug.name} ($${worstDrug.profit.toLocaleString()})</span></div>` : ''}
          <div class="highlight-item"><span class="highlight-label">Biggest Single Sale</span><span class="highlight-value neon-green">$${(s.biggestSingleSale || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Biggest Single Purchase</span><span class="highlight-value neon-cyan">$${(s.biggestSinglePurchase || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Total Spent on Drugs</span><span class="highlight-value">$${(s.totalSpentOnDrugs || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Total Earned from Drugs</span><span class="highlight-value">$${(s.totalEarnedFromDrugs || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Total Transport Costs</span><span class="highlight-value">$${(s.totalSpentOnTransport || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Total Laundered</span><span class="highlight-value">$${(s.totalLaunderedMoney || 0).toLocaleString()}</span></div>
          <div class="highlight-item"><span class="highlight-label">Cities Visited</span><span class="highlight-value">${gameState.citiesVisited.length} / ${LOCATIONS.length}</span></div>
          <div class="highlight-item"><span class="highlight-label">Territories Controlled</span><span class="highlight-value">${Object.keys(gameState.territory).length}</span></div>
          <div class="highlight-item"><span class="highlight-label">People Killed</span><span class="highlight-value">${gameState.peopleKilled}</span></div>
          <div class="highlight-item"><span class="highlight-label">Cops Killed</span><span class="highlight-value">${gameState.copsKilled}</span></div>
          <div class="highlight-item"><span class="highlight-label">Days in Prison</span><span class="highlight-value">${s.daysInPrison || 0}</span></div>
        </div>
      </div>

      <!-- Recent Trades -->
      ${recentTrades.length > 0 ? `
      <div class="stats-section">
        <h3 class="section-title">📝 RECENT TRADES</h3>
        <table class="data-table">
          <thead><tr><th>Day</th><th>Action</th><th>Drug</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            ${recentTrades.map(t => {
              const drug = DRUGS.find(d => d.id === t.drugId);
              const loc = LOCATIONS.find(l => l.id === t.location);
              return `<tr>
                <td>${t.day}</td>
                <td class="${t.type === 'buy' ? 'neon-red' : 'neon-green'}">${t.type === 'buy' ? '🔴 BUY' : '🟢 SELL'}</td>
                <td>${drug ? drug.emoji + ' ' + drug.name : t.drugId}</td>
                <td>${t.amount}</td>
                <td>$${t.price.toLocaleString()}</td>
                <td class="${t.type === 'buy' ? 'neon-red' : 'neon-green'}">$${t.total.toLocaleString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : ''}

      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem;">← BACK</button>
    </div>
  `;
}

// Build an SVG line chart from an array of values
function buildLineChart(values, color, width, height) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const fillPoints = `0,${height} ${points.join(' ')} ${width},${height}`;

  return `<svg viewBox="0 0 ${width} ${height}" class="stats-line-chart" preserveAspectRatio="none">
    <defs>
      <linearGradient id="grad-${color.replace(/[^a-z]/g, '')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <polygon points="${fillPoints}" fill="url(#grad-${color.replace(/[^a-z]/g, '')})" />
    <polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <text x="2" y="12" fill="${color}" font-size="10" opacity="0.7">$${max.toLocaleString()}</text>
    <text x="2" y="${height - 2}" fill="${color}" font-size="10" opacity="0.7">$${min.toLocaleString()}</text>
  </svg>`;
}

// Build a horizontal bar chart for drug profits
function buildBarChart(drugs) {
  if (drugs.length === 0) return '';
  const maxAbs = Math.max(...drugs.map(d => Math.abs(d.profit)), 1);

  return `<div class="stats-bar-chart">
    ${drugs.map(d => {
      const pct = Math.abs(d.profit) / maxAbs * 100;
      const color = d.profit >= 0 ? 'var(--neon-green)' : 'var(--neon-red)';
      return `<div class="bar-row">
        <span class="bar-label">${d.emoji} ${d.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.max(pct, 2)}%;background:${color};"></div>
        </div>
        <span class="bar-value" style="color:${color}">${d.profit >= 0 ? '+' : ''}$${d.profit.toLocaleString()}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function renderAchievements() {
  const progress = getAchievementProgress(gameState);
  const lvl = getKingpinLevel(gameState.xp || 0);
  const nextLvl = getNextLevel(gameState.xp || 0);
  const xpProgress = nextLvl ? ((gameState.xp - lvl.xpRequired) / (nextLvl.xpRequired - lvl.xpRequired)) * 100 : 100;

  const categories = ['money', 'trading', 'travel', 'combat', 'territory', 'crew', 'legal', 'reputation', 'level', 'skills', 'dialogue', 'weapons', 'business', 'buffs', 'secret', 'endgame'];
  const catNames = { money: '💰 Money', trading: '📊 Trading', travel: '✈️ Travel', combat: '⚔️ Combat', territory: '🏴 Territory', crew: '👥 Crew', legal: '⚖️ Legal', reputation: '⭐ Rep', level: '📶 Levels', skills: '🌳 Skills', dialogue: '🗣️ Dialogue', weapons: '🔫 Weapons', business: '🏢 Business', buffs: '⚗️ Buffs', secret: '🔮 Secret', endgame: '🏁 Endgame', mafia: '🏢 Mafia', heist: '🎯 Heist', prison: '🔒 Prison', vehicle: '🚗 Vehicle', boss: '👑 Boss', romance: '💕 Romance', weather: '🌦️ Weather' };

  let tabsHtml = categories.map(cat => {
    const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
    const earned = catAchs.filter(a => gameState.achievements.includes(a.id)).length;
    return `<button class="btn btn-sm ${achievementTab === cat ? 'btn-primary' : 'btn-secondary'}" onclick="achievementTab='${cat}'; render();" style="margin:2px;font-size:0.65rem">${catNames[cat]} ${earned}/${catAchs.length}</button>`;
  }).join('');

  const filteredAchs = ACHIEVEMENTS.filter(a => a.category === achievementTab);
  const achCards = filteredAchs.map(ach => {
    const earned = gameState.achievements.includes(ach.id);
    const isHidden = ach.hidden && !earned;
    return `
      <div class="achievement-card ${earned ? 'earned' : 'locked'}">
        <span class="achievement-emoji">${earned ? ach.emoji : (isHidden ? '❓' : '🔒')}</span>
        <div class="achievement-info">
          <div class="achievement-name">${earned ? ach.name : (isHidden ? '???' : ach.name)}</div>
          <div class="achievement-desc">${isHidden ? 'Hidden achievement — discover it yourself!' : ach.desc}</div>
        </div>
        ${earned ? '<span class="achievement-check">✓</span>' : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="screen-container">
      <div class="panel">
        ${renderToolbar()}
        ${backButton()}
        <h2 class="section-title neon-cyan">🏆 ACHIEVEMENTS</h2>
        <div class="title-divider"></div>

        <div style="text-align:center;margin:1rem 0">
          <div style="font-family:var(--font-display);font-size:1.5rem">
            ${lvl.emoji} <span class="neon-pink">${lvl.title}</span>
            <span class="text-dim" style="font-size:0.8rem">Level ${lvl.level}</span>
          </div>
          <div style="margin:0.5rem 0">
            <div class="xp-bar"><div class="xp-fill" style="width:${xpProgress}%"></div></div>
            <div style="font-size:0.7rem;color:var(--text-dim)">
              XP: ${gameState.xp || 0} ${nextLvl ? `/ ${nextLvl.xpRequired}` : '(MAX)'}
            </div>
          </div>
          <div style="font-size:0.85rem;margin-top:0.5rem">
            <span class="neon-green">${progress.earned}</span>/<span class="text-dim">${progress.total}</span> achievements (${progress.percent}%)
          </div>
        </div>

        <div style="margin:0.5rem 0;display:flex;flex-wrap:wrap;justify-content:center">${tabsHtml}</div>

        <div class="achievements-grid">${achCards}</div>

        <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="width:100%;margin-top:1rem">← BACK</button>
      </div>
    </div>
  `;
}

let achievementTab = 'money';

// ============================================================
// SAVE MIGRATION
// ============================================================
function migrateGameState(state) {
  // Add investigation if missing
  if (!state.investigation) {
    state.investigation = { points: 0, level: 0, daysSinceDealing: 0, activeEffects: [], timesArrested: 0, onBail: false };
  }
  // Migrate henchmen
  for (const h of state.henchmen) {
    if (h.loyalty === undefined || h.loyalty === null || isNaN(h.loyalty)) { h.loyalty = 100; h.health = 100; h.maxHealth = 100; h.injured = false; h.daysSincePaid = 0; }
    if (h.daysSincePaid === undefined || h.daysSincePaid === null || isNaN(h.daysSincePaid)) { h.daysSincePaid = 0; }
  }
  // Ensure priceHistory entries have new fields
  if (state.priceHistory) {
    for (const drugId in state.priceHistory) {
      for (const entry of state.priceHistory[drugId]) {
        if (entry.interpolated === undefined) entry.interpolated = false;
        if (entry.event === undefined) entry.event = null;
      }
    }
  }
  if (!state.courtCase) state.courtCase = null;
  if (state.copsKilled === undefined) state.copsKilled = 0;
  if (state.territory === undefined) state.territory = {};
  if (!state.frontBusinesses) state.frontBusinesses = [];
  if (state.xp === undefined) state.xp = 0;
  if (!state.achievements) state.achievements = [];
  if (!state.achievementStats) state.achievementStats = {};
  if (!state.distribution) state.distribution = {};
  if (!state.stats) {
    state.stats = {
      drugLedger: {}, netWorthHistory: [], cashHistory: [], tradeLog: [],
      totalSpentOnDrugs: 0, totalEarnedFromDrugs: 0, totalSpentOnCrew: 0,
      totalSpentOnWeapons: 0, totalSpentOnTransport: 0, totalSpentOnHospital: 0,
      totalLaunderedMoney: 0, totalBribesPaid: 0, totalAssetsForfeit: 0,
      biggestSingleSale: 0, biggestSinglePurchase: 0, daysInPrison: 0,
      totalDistributionRevenue: 0, totalDistributionLost: 0,
    };
  } else {
    if (state.stats.totalDistributionRevenue === undefined) state.stats.totalDistributionRevenue = 0;
    if (state.stats.totalDistributionLost === undefined) state.stats.totalDistributionLost = 0;
  }
  if (!state.skillPoints) state.skillPoints = 0;
  if (!state.skills) state.skills = {};
  if (!state.speechSkill) state.speechSkill = 0;
  if (!state.activeDialogue) state.activeDialogue = null;
  if (!state.activeBuffs) state.activeBuffs = [];
  if (!state.transportCostMultiplier) state.transportCostMultiplier = 1;
  if (state.endlessMode === undefined) state.endlessMode = false;

  // === V3 Migration: New systems ===
  // Character system
  if (!state.characterId) state.characterId = 'classic';
  if (!state.characterPassive) state.characterPassive = null;
  if (!state.characterFlags) state.characterFlags = [];

  // Multi-dimensional reputation
  if (!state.rep) {
    state.rep = typeof initReputation === 'function' ? initReputation() : { streetCred: 0, fear: 0, trust: 0, publicImage: 0, heatSignature: 0 };
    // Seed from existing reputation value
    if (state.reputation) {
      state.rep.streetCred = Math.max(-100, Math.min(100, state.reputation));
    }
    // Seed heat signature from existing heat
    if (state.heat) {
      state.rep.heatSignature = Math.max(0, Math.min(100, Math.round(state.heat * 0.5)));
    }
  }

  // Economy engine - market memory
  if (!state.marketMemory) {
    state.marketMemory = typeof initMarketMemory === 'function' ? initMarketMemory() : { supply: {}, demand: {}, playerSales: {}, playerPurchases: {}, priceHistory: {}, lastUpdate: 0 };
  }

  // Properties & per-location stashes
  if (!state.properties) state.properties = {};
  if (!state.stashes) {
    state.stashes = {};
    // Migrate old Miami stash to per-location
    if (state.stash && Object.keys(state.stash).some(k => state.stash[k] > 0)) {
      state.stashes['miami'] = { ...state.stash };
    }
  }

  // Campaign system
  if (!state.campaign) {
    state.campaign = typeof initCampaign === 'function' ? initCampaign() : {
      currentAct: 1, milestones: {}, actTransitions: [], flags: {}, endingId: null
    };
    // Estimate current act from day count
    if (state.day > 2500) state.campaign.currentAct = 5;
    else if (state.day > 1500) state.campaign.currentAct = 4;
    else if (state.day > 800) state.campaign.currentAct = 3;
    else if (state.day > 200) state.campaign.currentAct = 2;
  }

  // Crew expansion fields
  for (const h of state.henchmen) {
    if (h.rank === undefined) h.rank = 0;
    if (h.daysServed === undefined) h.daysServed = 0;
    if (h.hiddenLoyalty === undefined) h.hiddenLoyalty = h.loyalty || 80;
    if (h.betrayalRisk === undefined) h.betrayalRisk = 0;
    if (!h.traits) h.traits = [];
    if (!h.uniqueId) h.uniqueId = 'crew_' + Math.random().toString(36).substr(2, 6);
  }

  // Phase 4: Lifestyle
  if (!state.lifestyle) state.lifestyle = typeof initLifestyleState === 'function' ? initLifestyleState() : { timeOfDay: 0, stress: 0, lifestyleTier: 'modest', newsFeed: [], totalStressGained: 0, totalStressRelieved: 0, activitiesCompleted: 0, flashSpending: 0 };

  // Phase 3: Heat system
  if (!state.heatSystem) state.heatSystem = typeof initHeatState === 'function' ? initHeatState() : { local: 0, city: 0, federal: 0, wiretaps: [], counterMeasures: [], chaseHistory: [], totalChases: 0, chasesEscaped: 0, chasesFailed: 0, dealingPatterns: {}, vehicles: ['on_foot'], activeVehicle: 'on_foot' };

  // Phase 2: Processing, Import/Export, Factions
  if (!state.processing) state.processing = typeof initProcessingState === 'function' ? initProcessingState() : { supplies: {}, activeJobs: [], completedBatches: [], totalBatchesCooked: 0, chemistryXp: 0 };
  if (!state.processedDrugs) state.processedDrugs = {};
  if (!state.importExport) state.importExport = typeof initImportExportState === 'function' ? initImportExportState() : { unlockedSources: [], activeShipments: [], completedShipments: [], blockedRoutes: {}, totalImports: 0, totalExports: 0, totalSeized: 0, contactProgress: {}, bribedOfficials: {} };
  if (!state.factions) state.factions = typeof initFactionState === 'function' ? initFactionState() : { standings: {}, alliances: {}, wars: {}, factionPower: {}, factionTerritory: {}, absorptions: [], factionEvents: [], diplomacyCooldowns: {} };

  // Phase 5: Politics
  if (!state.missions) state.missions = typeof initMissionState === 'function' ? initMissionState() : { activeMissions: [], completedMissions: [], failedMissions: [], totalMissionsCompleted: 0, totalMissionsFailed: 0, totalMissionRewards: 0, pendingDilemma: null, dilemmasResolved: [], totalDilemmas: 0, missionsAvailable: [], lastMissionRefresh: 0 };
  if (state.missions && !state.missions.hasOwnProperty('activeMainMission')) state.missions.activeMainMission = null;

  if (!state.politics) state.politics = typeof initPoliticsState === 'function' ? initPoliticsState() : { corruptOfficials: {}, contacts: {}, intelGathered: [], totalBribesPaid: 0, totalContactsMade: 0, scandals: 0, politicalInfluence: 0, electionCycle: 0 };

  if (!state.futures) state.futures = typeof initFuturesState === 'function' ? initFuturesState() : { contracts: [], completedContracts: [], totalProfits: 0, totalLosses: 0, contractsTraded: 0, maxConcurrentContracts: 3 };

  // Safe house
  if (!state.safehouse) state.safehouse = typeof initSafehouseState === 'function' ? initSafehouseState() : { current: null, tier: -1, upgrades: [], discovered: false, daysPurchased: 0 };

  // Body disposal system
  if (!state.bodies_state) state.bodies_state = typeof initBodyState === 'function' ? initBodyState() : { bodies: 0, totalKills: 0, disposedBodies: 0, discoveredBodies: 0, pendingDisposal: [], bodyLocations: [] };

  // Turf wars
  if (!state.turfWars) state.turfWars = typeof initTurfWarState === 'function' ? initTurfWarState() : { wars: [], warHistory: [], totalDefended: 0, totalLost: 0, currentWar: null };

  // Items inventory
  if (!state.items) state.items = [];

  // New Game+ fields
  if (state.newGamePlus === undefined) state.newGamePlus = false;
  if (state.ngPlusLevel === undefined) state.ngPlusLevel = 0;
  if (state.ngPlusModifiers === undefined) state.ngPlusModifiers = null;

  // === MASSIVE EXPANSION MIGRATIONS ===

  // Character data (expanded character system)
  if (!state.characterData) {
    state.characterData = typeof getCharacterById === 'function' && state.character ?
      { id: state.character, name: state.character, bonusSkillPointsRemaining: 0 } :
      { id: 'corner_kid', name: 'The Corner Kid', bonusSkillPointsRemaining: 0 };
  }

  // Expanded faction system (replace old faction state with new structure)
  if (state.factions && !state.factions.los_cubanos) {
    // Old faction system detected — reinitialize with new factions
    state.factions = typeof initFactionState === 'function' ? initFactionState(state.character) :
      { los_cubanos: { relation: 0, discovered: true }, zoe_pound: { relation: 0, discovered: true },
        eastern_bloc: { relation: 0, discovered: true }, southern_boys: { relation: 0, discovered: true },
        colombian_connection: { relation: -100, discovered: false }, dixie_mafia: { relation: 0, discovered: true },
        cartel_remnants: { relation: 0, discovered: true }, port_authority: { relation: 0, discovered: true } };
  }

  // Expanded skills (8 categories)
  if (state.skills && !state.skills.hasOwnProperty('combat')) {
    // Old skill system — migrate
    const oldSkills = state.skills || {};
    state.skills = {
      combat: oldSkills.combat || 0,
      driving: oldSkills.driving || 0,
      persuasion: oldSkills.persuasion || oldSkills.speech || 0,
      chemistry: oldSkills.chemistry || 0,
      business: oldSkills.business || 0,
      stealth: oldSkills.stealth || 0,
      leadership: oldSkills.leadership || 0,
      streetwise: oldSkills.streetwise || 0,
    };
  }

  // Campaign state
  if (!state.campaign) {
    state.campaign = typeof initCampaignState === 'function' ? initCampaignState(state.character) :
      { currentAct: 'act1', actProgress: {}, completedMissions: [], activeMission: null,
        activeSideMissions: [], availableSideMissions: [], missionObjectives: {},
        endingPath: null, totalMissionsCompleted: 0, totalSideMissionsCompleted: 0,
        campaignStartDay: 0, campaignComplete: false, choiceHistory: [] };
    // Estimate act based on day count for existing saves
    if (state.day > 300) state.campaign.currentAct = 'act4';
    else if (state.day > 150) state.campaign.currentAct = 'act3';
    else if (state.day > 60) state.campaign.currentAct = 'act2';
  }

  // Weapon state (upgrades, armor, equipment)
  if (!state.weaponState) {
    state.weaponState = typeof initWeaponState === 'function' ? initWeaponState() :
      { equipped: state.equippedWeapon || null, owned: [], upgrades: {}, armor: null, equipment: [] };
  }

  // Shipping state
  if (!state.shipping) {
    state.shipping = typeof initShippingState === 'function' ? initShippingState() :
      { currentTier: 0, ownedTiers: [0], activeShipments: [], completedShipments: 0,
        interceptedShipments: 0, totalCargoMoved: 0, routes: {} };
  }

  // Expanded heat state
  if (!state.heatExpanded) {
    state.heatExpanded = typeof initHeatStateExpanded === 'function' ? initHeatStateExpanded() :
      { local: 0, city: 0, federal: 0, totalHeat: 0, evidence: 0,
        investigationLevel: 'clean', investigationDay: 0, activeWiretaps: [],
        wiretapDetected: false, knownInformants: [], suspectedInformants: [],
        heatHistory: [], encountersAvoided: 0, encountersFaced: 0,
        layingLow: false, politicalProtection: false, lawyerRetainer: false };
  }

  // Rival dealer state
  if (!state.rivalState) {
    state.rivalState = typeof initRivalState === 'function' ? initRivalState() :
      { rivals: [], defeatedRivals: [], totalRivalsDefeated: 0, rivalWars: 0 };
  }

  // Endings state
  if (!state.endings) {
    state.endings = typeof initEndingsState === 'function' ? initEndingsState() :
      { currentEnding: null, endingGrade: null, endingPath: null, completedEndings: [], endingChoices: [] };
  }

  // === V4 Migration: World expansion ===
  if (!state.worldState) {
    state.worldState = typeof initWorldState === 'function' ? initWorldState() :
      { unlockedRegions: ['miami'], regionContacts: {}, regionProgress: {} };
  }
  if (!state.worldState.unlockedRegions) state.worldState.unlockedRegions = ['miami'];
  if (!state.worldState.unlockedRegions.includes('miami')) state.worldState.unlockedRegions.unshift('miami');
  if (!state.worldState.regionContacts) state.worldState.regionContacts = {};
  if (!state.worldState.regionProgress) state.worldState.regionProgress = {};

  // Load world districts for all unlocked regions
  if (typeof loadWorldDistricts === 'function') {
    loadWorldDistricts(state);
  }

  // Location migration: if currentLocation is an old world city, reset to liberty_city
  // Check against ALL loaded locations (Miami + world districts)
  const allLoadedIds = LOCATIONS.map(l => l.id);
  if (allLoadedIds.length > 0 && !allLoadedIds.includes(state.currentLocation)) {
    // Unknown location — pick a Miami district based on character or default
    const charData = typeof getCharacterById === 'function' ? getCharacterById(state.character) : null;
    state.currentLocation = (charData && charData.startingDistrict) || 'liberty_city';
  }

  if (!state.version || state.version < 4) state.version = 4;

  // === V5 Migration: Massive content expansion ===
  if (!state.bosses) state.bosses = typeof initBossState === 'function' ? initBossState() : { defeated: {}, puppets: {}, bribed: {}, destabilized: {}, totalDefeated: 0 };
  if (!state.mafiaOps) state.mafiaOps = typeof initMafiaOpsState === 'function' ? initMafiaOpsState() : { activeOperations: {}, operationLevels: {}, totalIncome: 0, totalOperationsRun: 0 };
  if (!state.vehicles) state.vehicles = typeof initVehicleState === 'function' ? initVehicleState() : { owned: [], equipped: null, garage: [], mods: {}, hotCars: {}, totalVehiclesBought: 0 };
  if (!state.prison) state.prison = typeof initPrisonState === 'function' ? initPrisonState() : { inPrison: false, tier: null, daysRemaining: 0, daysServed: 0, gang: null, respect: 0, totalTimeServed: 0, escapeAttempts: 0 };
  if (!state.heists) state.heists = typeof initHeistState === 'function' ? initHeistState() : { currentHeist: null, completedHeists: [], totalLoot: 0, planningDays: 0 };
  if (!state.territoryDefense) state.territoryDefense = typeof initTerritoryDefenseState === 'function' ? initTerritoryDefenseState() : { fortifications: {}, structures: {}, siegeHistory: [], activeSiege: null };
  if (!state.intimidation) state.intimidation = typeof initIntimidationState === 'function' ? initIntimidationState() : { score: 0, clothing: [], equippedClothing: null };
  if (!state.weather) state.weather = typeof initWeatherState === 'function' ? initWeatherState() : { current: 'clear', duration: 1, lastChange: 0, hurricaneDays: 0 };
  if (!state.nightlife) state.nightlife = typeof initNightlifeState === 'function' ? initNightlifeState() : { vipStatus: {}, eventsAttended: 0, contacts: [] };
  if (!state.romance) state.romance = typeof initRomanceState === 'function' ? initRomanceState() : { relationships: {}, activeDate: null, totalDates: 0 };
  if (!state.repHits) state.repHits = typeof initRepHitsState === 'function' ? initRepHitsState() : { activeHits: [], completedHits: [], totalHitsLaunched: 0 };

  if (!state.version || state.version < 5) state.version = 5;

  // === V6 Migration: 2 Million Unique Experiences expansion ===
  if (!state.encounters) state.encounters = typeof initEncounterState === 'function' ? initEncounterState() : { seenEncounters: [], encounterCooldowns: {}, activeEncounter: null, encounterLog: [], companions: { pet: null, lookout: null }, stats: { totalEncounters: 0, streakDaysWithout: 0 } };
  if (!state.namedNPCs) state.namedNPCs = typeof initNPCState === 'function' ? initNPCState() : { metNPCs: {}, activeNPCEvent: null, npcBenefits: {}, npcLog: [], stats: { totalMet: 0, totalChaptersCompleted: 0 } };
  if (!state.businesses) state.businesses = typeof initBusinessState === 'function' ? initBusinessState() : { owned: [], incomeHistory: [], eventLog: [], totalIncome: 0, totalSpent: 0 };
  if (!state.sideMissionsV2) state.sideMissionsV2 = typeof initSideMissionsV2State === 'function' ? initSideMissionsV2State() : { activeChains: {}, completedChains: [], failedChains: [], availableChains: [], chainLog: [], stats: { totalStarted: 0, totalCompleted: 0, totalFailed: 0 } };
  if (!state.proceduralMissions) state.proceduralMissions = typeof initProceduralState === 'function' ? initProceduralState() : { availableMissions: [], activeMissions: [], completedCount: 0, failedCount: 0, missionLog: [], lastGenDay: 0, difficultyModifier: 0 };
  if (!state.phone) state.phone = typeof initPhoneState === 'function' ? initPhoneState() : { inbox: [], contacts: [], burnerAge: 0, burnerType: 'basic', wiretapped: false, unreadCount: 0 };

  if (!state.npcStory) state.npcStory = null; // UI bridge for NPC story screen
  if (!state.version || state.version < 6) state.version = 6;

  // Strategic trading mechanics migration
  if (!state.knownPrices) state.knownPrices = {};
  if (!state.locationTrades) state.locationTrades = {};

  // === V7 Migration: Life Simulation + Consequence Engine ===
  // Dirty/clean money
  if (state.dirtyMoney === undefined) state.dirtyMoney = 0;
  if (state.cleanMoney === undefined) state.cleanMoney = state.cash || 0;
  // Relationships / life
  if (!state.relationships) state.relationships = { partners: [], children: [], divorces: 0, totalChildSupport: 0 };
  if (!state.relationships.children) state.relationships.children = [];
  if (!state.scars) state.scars = [];
  if (state.maxHealth === undefined) state.maxHealth = 100;
  // Backstory triggers
  if (!state._backstoryTriggered) state._backstoryTriggered = {};
  // Consequence engine state
  if (typeof initConsequenceState === 'function' && !state.playerTraits) {
    initConsequenceState(state);
  }
  if (!state.playerTraits) state.playerTraits = {};
  if (!state.playerAbilities) state.playerAbilities = {};
  if (!state.pendingConsequences) state.pendingConsequences = [];
  if (!state.choiceHistory) state.choiceHistory = [];
  if (!state.unlockedContent) state.unlockedContent = [];
  if (!state.lockedContent) state.lockedContent = [];
  // Progressive unlock
  if (!state.announcedUnlocks) state.announcedUnlocks = {};
  // Bodies state
  if (!state.bodies_state) state.bodies_state = typeof initBodyState === 'function' ? initBodyState() : { bodies: 0, totalKills: 0, disposedBodies: 0, discoveredBodies: 0, pendingDisposal: [], bodyLocations: [] };
  // Loan shark tracking
  if (state.lastBorrowDay === undefined) state.lastBorrowDay = -1;
  if (state.debtDaysUnpaid === undefined) state.debtDaysUnpaid = 0;

  if (!state.version || state.version < 7) state.version = 7;

  return state;
}

// ============================================================
// SKILL TREE UI
// ============================================================
let activeSkillTab = 'travelling';

function renderSkillTree() {
  const s = gameState;
  const totalRanks = getTotalSkillRanks(s);
  const speech = getEffectiveSpeech(s);

  // Tab buttons
  const tabs = Object.entries(SKILL_TREES).map(([key, tree]) => {
    const isActive = key === activeSkillTab;
    return `<button class="skill-tab ${isActive ? 'active' : ''}" style="--tab-color:${tree.color}" onclick="activeSkillTab='${key}'; render();">${tree.emoji} ${tree.name}</button>`;
  }).join('');

  const tree = SKILL_TREES[activeSkillTab];

  // Active perks list
  const perks = getActivePerks(s);
  const perksHtml = perks.length > 0 ? perks.map(p =>
    `<span class="perk-chip">${p.emoji} ${p.desc}</span>`
  ).join('') : '<span style="color:#666">Level up to unlock perks</span>';

  // Active buffs
  const buffs = (s.activeBuffs || []).filter(b => s.day < b.expiresDay);
  const buffsHtml = buffs.length > 0 ? buffs.map(b =>
    `<span class="buff-chip">${b.emoji} ${b.name} <small>(${b.expiresDay - s.day}d)</small></span>`
  ).join('') : '<span style="color:#666">No active buffs</span>';

  // Skill nodes by tier
  const tiers = [1, 2, 3, 4, 5];
  const playerLevel = getKingpinLevel(s.xp || 0).level || 0;
  const treeRanks = getTreeRanks(s, activeSkillTab);
  const skillsHtml = tiers.map(tier => {
    const tierSkills = tree.skills.filter(sk => sk.tier === tier);
    const cost = getSkillCost(tier);
    const levelReq = TIER_LEVEL_REQ[tier] || 0;
    const rankReq = TIER_RANK_REQ[tier] || 0;
    const tierLocked = playerLevel < levelReq || treeRanks < rankReq;
    const tierReqs = [];
    if (levelReq > 0) tierReqs.push(`Lvl ${levelReq}${playerLevel >= levelReq ? ' ✓' : ''}`);
    if (rankReq > 0) tierReqs.push(`${rankReq} tree ranks${treeRanks >= rankReq ? ' ✓' : ''}`);
    return `
      <div class="skill-tier ${tierLocked ? 'tier-locked' : ''}">
        <div class="tier-label">Tier ${tier} <span style="color:#ff0;font-size:0.7rem">(${cost} pt${cost > 1 ? 's' : ''}/rank)</span>${tierReqs.length > 0 ? ` <span style="font-size:0.65rem;color:${tierLocked ? '#f44' : '#4f4'}">[${tierReqs.join(', ')}]</span>` : ''}</div>
        <div class="skill-nodes">
          ${tierSkills.map(sk => {
            const rank = (s.skills && s.skills[sk.id]) || 0;
            const maxed = rank >= sk.maxRank;
            const check = canUnlockSkill(s, sk.id);
            const canBuy = check.can;
            const locked = !canBuy && !maxed;
            const reqText = locked && !maxed ? check.reason : '';
            return `
              <div class="skill-node ${maxed ? 'maxed' : ''} ${canBuy ? 'available' : ''} ${locked ? 'locked' : ''}" onclick="${canBuy ? `doUnlockSkill('${sk.id}')` : ''}">
                <div class="skill-emoji">${sk.emoji}</div>
                <div class="skill-name">${sk.name}</div>
                <div class="skill-rank">${rank}/${sk.maxRank}</div>
                <div class="skill-desc">${sk.desc}</div>
                ${locked && !maxed ? `<div class="skill-req">${reqText}</div>` : ''}
                ${maxed ? '<div class="skill-maxed">MAXED</div>' : ''}
                ${canBuy ? `<div class="skill-buy">UNLOCK (${cost} pt${cost > 1 ? 's' : ''})</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="screen" style="max-width:900px;margin:0 auto;padding:1rem">
      ${backButton()}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h2 style="color:${tree.color};margin:0">🌳 SKILL TREE</h2>
        <div>
          <span class="stat" style="color:#ff0">⭐ ${s.skillPoints || 0} Points</span>
          <span class="stat">🗣️ Speech: ${speech}</span>
          <span class="stat">📊 ${totalRanks} ranks</span>
        </div>
      </div>
      <div class="skill-tabs">${tabs}</div>
      <p style="color:#aaa;margin:0.5rem 0;font-size:0.85rem">${tree.desc}</p>
      <div class="skill-tree-container">${skillsHtml}</div>
      <div style="margin-top:1rem;border-top:1px solid #333;padding-top:0.8rem">
        <h3 style="color:var(--neon-pink);margin:0 0 0.5rem">🎖️ Active Perks</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${perksHtml}</div>
      </div>
      <div style="margin-top:0.8rem;border-top:1px solid #333;padding-top:0.8rem">
        <h3 style="color:#00bfff;margin:0 0 0.5rem">⚗️ Active Buffs</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem">${buffsHtml}</div>
      </div>
      <button class="btn btn-secondary" onclick="currentScreen='game'; render();" style="margin-top:1rem;width:100%">← BACK</button>
    </div>
  `;
}

function doUnlockSkill(skillId) {
  const result = unlockSkill(gameState, skillId);
  if (result.success) {
    showNotification(result.msg, 'success');
    // Check for skill point award on level up
    const achEarned = checkAchievements(gameState);
    achEarned.forEach(a => showNotification(`🏆 Achievement: ${a.name}`, 'achievement'));
  } else {
    showNotification(result.msg, 'error');
  }
  render();
}

// ============================================================
// DIALOGUE UI
// ============================================================
let pendingDialogue = null;

function renderDialogue() {
  if (!pendingDialogue) { currentScreen = 'game'; render(); return ''; }
  const enc = pendingDialogue;
  const speech = getEffectiveSpeech(gameState);

  const choicesHtml = enc.choices.map((c, i) => {
    const locked = c.locked;
    const style = locked ? 'opacity:0.4;cursor:not-allowed' : '';
    const speechReq = c.speechCheck > 0 ? `<span style="color:${speech >= c.speechCheck ? '#0f0' : '#f00'}">[Speech ${c.speechCheck}]</span> ` : '';
    // Generate hint about dialogue choice direction
    const cText = (c.text || '').toLowerCase();
    const dHints = [];
    if (cText.includes('threaten') || cText.includes('intimidat') || cText.includes('force') || cText.includes('demand') || cText.includes('attack')) {
      dHints.push('<span style="color:#ff4444">Aggressive - may escalate</span>');
    }
    if (cText.includes('negotiate') || cText.includes('talk') || cText.includes('reason') || cText.includes('persuad') || cText.includes('deal') || cText.includes('charm') || cText.includes('flatter')) {
      dHints.push('<span style="color:#88aaff">Diplomatic - builds rapport</span>');
    }
    if (cText.includes('lie') || cText.includes('bluff') || cText.includes('trick') || cText.includes('deceiv') || cText.includes('hustle')) {
      dHints.push('<span style="color:#ffcc00">Deceptive - risky if caught</span>');
    }
    if (cText.includes('pay') || cText.includes('brib') || cText.includes('offer money') || cText.includes('buy') || cText.includes('$')) {
      dHints.push('<span style="color:#ffcc00">Costs money</span>');
    }
    if (cText.includes('walk away') || cText.includes('leave') || cText.includes('refuse') || cText.includes('back off') || cText.includes('no thanks') || cText.includes('nah')) {
      dHints.push('<span style="color:#888">Safe - no commitment</span>');
    }
    if (cText.includes('agree') || cText.includes('accept') || cText.includes('help') || cText.includes('sure') || cText.includes('cooperat')) {
      dHints.push('<span style="color:#44ff88">Cooperative - builds trust</span>');
    }
    if (c.speechCheck > 0) {
      dHints.push(speech >= c.speechCheck ? '<span style="color:#00ff88">Speech check: can pass</span>' : '<span style="color:#ff4444">Speech check: likely fail</span>');
    }
    const hintLine = dHints.length > 0 ? `<div style="font-size:0.65rem;margin-top:2px;opacity:0.7">${dHints.join(' | ')}</div>` : '';
    return `<button class="btn ${locked ? 'btn-secondary' : 'btn-primary'}" style="text-align:left;margin:0.3rem 0;width:100%;padding:0.5rem 0.8rem;${style}" ${locked ? 'disabled' : ''} onclick="doDialogueChoice(${i})">${speechReq}${c.text.replace(/\[Speech \d+\] ?/, '')}${hintLine}</button>`;
  }).join('');

  return `
    <div class="screen" style="max-width:700px;margin:0 auto;padding:1.5rem">
      <div class="dialogue-box">
        <div class="dialogue-npc">
          <span style="font-size:2.5rem">${enc.npcEmoji}</span>
          <span class="dialogue-name">${enc.npcName}</span>
        </div>
        <div class="dialogue-text">"${enc.intro}"</div>
        <div class="dialogue-speech">Your Speech Skill: <strong style="color:#ff0">${speech}</strong></div>
        <div class="dialogue-choices">${choicesHtml}</div>
      </div>
    </div>
  `;
}

function doDialogueChoice(choiceIndex) {
  if (!pendingDialogue) return;
  const result = resolveDialogueChoice(gameState, pendingDialogue.encounterId, choiceIndex);

  // Track for achievements
  const enc = DIALOGUE_ENCOUNTERS.find(e => e.id === pendingDialogue.encounterId);
  const choice = enc?.choices[choiceIndex];
  updateAchievementStats(gameState, 'dialogue', {
    npcId: enc?.npcId,
    speechCheckPassed: choice?.speechCheck > 0 && (gameState.speechSkill || 0) >= choice.speechCheck,
    speechCheckFailed: choice?.speechCheck > 0 && (gameState.speechSkill || 0) < choice.speechCheck,
  });

  // Show result
  let msg = `${pendingDialogue.npcEmoji} ${result.msg}`;
  if (result.effects.length > 0) msg += '\n' + result.effects.join(' | ');
  showNotification(msg, result.outcome === 'leave' ? 'info' : 'success');

  pendingDialogue = null;
  currentScreen = 'game';

  // Check achievements
  const achEarned = checkAchievements(gameState);
  achEarned.forEach(a => showNotification(`🏆 Achievement: ${a.name}`, 'achievement'));

  render();
}

// Update doWait to handle dialogue encounters
const originalDoWait = typeof doWait === 'function' ? doWait : null;

// ============================================================
// MAFIA OPERATIONS SCREEN
// ============================================================

function doSetupOperation(opId) {
  if (typeof setupOperation !== 'function') return;
  var districtId = gameState.currentLocation || null;
  var result = setupOperation(gameState, opId, districtId);
  if (result.success) {
    playSound('click');
    showNotification('Operation established: ' + (result.operation ? result.operation.operationId : opId), 'success');
  } else {
    showNotification(result.reason || 'Cannot setup operation.', 'error');
  }
  render();
}

function doUpgradeOperation(opIndex) {
  if (typeof upgradeOperation !== 'function') return;
  var result = upgradeOperation(gameState, opIndex);
  if (result.success) {
    playSound('click');
    showNotification('Upgraded to Level ' + result.newLevel + ': ' + result.levelName, 'success');
  } else {
    showNotification(result.reason || 'Cannot upgrade.', 'error');
  }
  render();
}

function doShutdownOperation(opIndex) {
  if (!confirm('Shut down this operation?')) return;
  if (typeof shutdownOperation !== 'function') return;
  var result = shutdownOperation(gameState, opIndex);
  if (result.success) {
    playSound('click');
    showNotification('Operation shut down.', 'info');
  } else {
    showNotification(result.reason || 'Cannot shutdown.', 'error');
  }
  render();
}

function renderOperations() {
  if (typeof MAFIA_OPERATIONS === 'undefined') {
    return `<div class="screen-container">${renderToolbar()}${backButton()}<h2 class="section-title neon-yellow">🏢 MAFIA OPERATIONS</h2><p class="neon-red">Operations system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen='game'; render();">← Back</button></div>`;
  }

  var mafiaState = gameState.mafiaOps || { activeOperations: [], totalOperationIncome: 0 };
  var activeOps = Array.isArray(mafiaState.activeOperations) ? mafiaState.activeOperations : [];

  var totalDailyIncome = 0;

  var activeRows = activeOps.map(function(op, idx) {
    var def = typeof getOperationDef === 'function' ? getOperationDef(op.operationId) : MAFIA_OPERATIONS.find(function(d) { return d.id === op.operationId; });
    if (!def) return '';
    var levelDef = def.upgradeLevels.find(function(u) { return u.level === op.level; });
    var canUpgrade = op.level < def.upgradeLevels.length;
    var nextUpgrade = canUpgrade ? def.upgradeLevels.find(function(u) { return u.level === op.level + 1; }) : null;
    totalDailyIncome += def.dailyIncomeMin;
    return '<tr>' +
      '<td>' + def.emoji + ' ' + def.name + '</td>' +
      '<td class="neon-green">Lv.' + op.level + ' - ' + (levelDef ? levelDef.name : '') + '</td>' +
      '<td>$' + def.dailyIncomeMin.toLocaleString() + '-$' + def.dailyIncomeMax.toLocaleString() + '</td>' +
      '<td><span class="' + (op.heat > 30 ? 'neon-red' : op.heat > 15 ? 'neon-yellow' : 'neon-green') + '">🌡️ ' + op.heat + '</span></td>' +
      '<td>' +
        (canUpgrade && nextUpgrade ? '<button class="btn btn-sm btn-buy" onclick="doUpgradeOperation(' + idx + ')">⬆ Upgrade ($' + nextUpgrade.cost.toLocaleString() + ')</button> ' : '<span class="neon-cyan">MAX</span> ') +
        '<button class="btn btn-sm btn-danger" onclick="doShutdownOperation(' + idx + ')">✖ Shutdown</button>' +
      '</td>' +
    '</tr>';
  }).join('');

  var availableRows = MAFIA_OPERATIONS.map(function(def) {
    var isActive = activeOps.some(function(op) { return op.operationId === def.id && op.status === 'active'; });
    if (isActive) return '';
    var crewStr = def.crewRequired.map(function(r) { return r.count + 'x ' + r.type; }).join(', ');
    var canSetup = typeof canSetupOperation === 'function' ? canSetupOperation(gameState, def.id, gameState.currentLocation || null) : { allowed: true, reason: null };
    return '<tr>' +
      '<td>' + def.emoji + ' ' + def.name + '</td>' +
      '<td style="font-size:0.7rem;color:var(--text-dim);max-width:200px;">' + def.desc + '</td>' +
      '<td>$' + def.setupCost.toLocaleString() + '</td>' +
      '<td>$' + def.dailyIncomeMin.toLocaleString() + '-$' + def.dailyIncomeMax.toLocaleString() + '</td>' +
      '<td style="font-size:0.7rem;">' + crewStr + '</td>' +
      '<td>🌡️ ' + def.heatPerDay + '/day</td>' +
      '<td>' +
        (canSetup.allowed ? '<button class="btn btn-sm btn-buy" onclick="doSetupOperation(\'' + def.id + '\')">SETUP</button>' : '<span style="font-size:0.65rem;color:var(--neon-red)">' + (canSetup.reason || 'Locked') + '</span>') +
      '</td>' +
    '</tr>';
  }).filter(function(r) { return r !== ''; }).join('');

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title neon-yellow">🏢 MAFIA OPERATIONS</h2>' +
    '<div style="margin-bottom:12px;padding:8px;border:1px solid var(--neon-green);border-radius:4px;">' +
      '<span class="neon-green">Active Operations: ' + activeOps.filter(function(o) { return o.status === 'active'; }).length + '</span> | ' +
      '<span class="neon-yellow">Total Income: $' + (mafiaState.totalOperationIncome || 0).toLocaleString() + '</span>' +
    '</div>' +
    (activeOps.length > 0 ? '<h3 class="neon-green">Active Operations</h3>' +
      '<table class="data-table"><thead><tr><th>Operation</th><th>Level</th><th>Income Range</th><th>Heat</th><th>Actions</th></tr></thead><tbody>' + activeRows + '</tbody></table>' : '') +
    '<h3 class="neon-cyan">Available Operations</h3>' +
    '<table class="data-table"><thead><tr><th>Operation</th><th>Description</th><th>Setup Cost</th><th>Income</th><th>Crew</th><th>Heat</th><th></th></tr></thead><tbody>' + availableRows + '</tbody></table>' +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// VEHICLES / GARAGE SCREEN
// ============================================================

function doBuyVehicle(vehicleId) {
  if (typeof buyVehicle !== 'function') return;
  var result = buyVehicle(gameState, vehicleId);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doSellVehicle(garageIndex) {
  if (!confirm('Sell this vehicle?')) return;
  if (typeof sellVehicle !== 'function') return;
  var result = sellVehicle(gameState, garageIndex);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doEquipVehicle(garageIndex) {
  if (typeof setActiveVehicle !== 'function') return;
  var result = setActiveVehicle(gameState, garageIndex);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doModifyVehicle(garageIndex, modId) {
  if (typeof installMod !== 'function') return;
  var result = installMod(gameState, garageIndex, modId);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function renderVehicles() {
  if (typeof VEHICLES === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title neon-cyan">🚗 GARAGE</h2><p class="neon-red">Vehicle system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var vehicleState = gameState.vehicles || { garage: [], activeVehicleIndex: null };
  var garage = vehicleState.garage || [];
  var capacity = typeof getGarageCapacity === 'function' ? getGarageCapacity(gameState) : 4;

  // Current vehicle display
  var currentVehicle = '';
  if (vehicleState.activeVehicleIndex !== null && vehicleState.activeVehicleIndex < garage.length) {
    var active = garage[vehicleState.activeVehicleIndex];
    var activeDef = typeof getVehicleDef === 'function' ? getVehicleDef(active.vehicleId) : VEHICLES.find(function(v) { return v.id === active.vehicleId; });
    if (activeDef) {
      currentVehicle = '<div style="padding:10px;border:2px solid var(--neon-green);border-radius:6px;margin-bottom:12px;">' +
        '<h3 class="neon-green">Current Vehicle: ' + activeDef.name + '</h3>' +
        '<div style="display:flex;gap:20px;flex-wrap:wrap;">' +
          '<span>🏎️ Speed: <span class="neon-cyan">' + activeDef.speed + '</span></span>' +
          '<span>🛡️ Armor: <span class="neon-yellow">' + activeDef.armor + '</span></span>' +
          '<span>📦 Cargo: <span class="neon-green">' + activeDef.cargo + '</span></span>' +
          '<span>Condition: <span class="' + (active.condition > 50 ? 'neon-green' : active.condition > 20 ? 'neon-yellow' : 'neon-red') + '">' + active.condition + '%</span></span>' +
          (active.hot ? '<span class="neon-red">🔥 HOT CAR</span>' : '') +
          '<span>Mods: ' + active.mods.length + '</span>' +
        '</div>' +
        '<div style="font-size:0.7rem;color:var(--text-dim);margin-top:4px;">' + activeDef.special + '</div>' +
      '</div>';
    }
  }

  // Garage contents
  var garageRows = garage.map(function(v, i) {
    var def = typeof getVehicleDef === 'function' ? getVehicleDef(v.vehicleId) : VEHICLES.find(function(vd) { return vd.id === v.vehicleId; });
    if (!def) return '';
    var isActive = i === vehicleState.activeVehicleIndex;
    var value = typeof getVehicleValue === 'function' ? getVehicleValue(v) : Math.floor(def.price * 0.7);
    return '<tr class="' + (isActive ? 'row-owned' : '') + '">' +
      '<td>' + def.name + (v.hot ? ' <span class="neon-red">🔥</span>' : '') + '</td>' +
      '<td>' + def.type + '</td>' +
      '<td>' + def.speed + '</td>' +
      '<td>' + def.armor + '</td>' +
      '<td>' + def.cargo + '</td>' +
      '<td><span class="' + (v.condition > 50 ? 'neon-green' : v.condition > 20 ? 'neon-yellow' : 'neon-red') + '">' + v.condition + '%</span></td>' +
      '<td>' +
        (isActive ? '<span class="neon-green">ACTIVE</span> ' : '<button class="btn btn-sm btn-buy" onclick="doEquipVehicle(' + i + ')">EQUIP</button> ') +
        '<button class="btn btn-sm btn-danger" onclick="doSellVehicle(' + i + ')">SELL ($' + value.toLocaleString() + ')</button>' +
      '</td>' +
    '</tr>';
  }).join('') || '<tr><td colspan="7" style="color:var(--text-dim)">Garage is empty</td></tr>';

  // Available vehicles to buy
  var availableVehicles = typeof getAvailableVehicles === 'function' ? getAvailableVehicles(gameState) : VEHICLES.filter(function(v) { return !v.ngPlus; });
  var shopRows = availableVehicles.map(function(v) {
    return '<tr>' +
      '<td>' + v.name + '</td>' +
      '<td>' + v.type + '</td>' +
      '<td>' + v.speed + '</td>' +
      '<td>' + v.armor + '</td>' +
      '<td>' + v.cargo + '</td>' +
      '<td>$' + v.price.toLocaleString() + '</td>' +
      '<td style="font-size:0.65rem;color:var(--text-dim);max-width:150px;">' + v.special + '</td>' +
      '<td><button class="btn btn-sm btn-buy" onclick="doBuyVehicle(\'' + v.id + '\')">BUY</button></td>' +
    '</tr>';
  }).join('');

  // Vehicle mods section
  var modsSection = '';
  if (typeof VEHICLE_MODS !== 'undefined' && vehicleState.activeVehicleIndex !== null && vehicleState.activeVehicleIndex < garage.length) {
    var activeIdx = vehicleState.activeVehicleIndex;
    var activeV = garage[activeIdx];
    var modRows = VEHICLE_MODS.map(function(m) {
      var installed = activeV.mods.indexOf(m.id) !== -1;
      return '<tr>' +
        '<td>' + m.name + '</td>' +
        '<td style="font-size:0.7rem;color:var(--text-dim)">' + m.description + '</td>' +
        '<td>$' + m.price.toLocaleString() + '</td>' +
        '<td>' +
          (installed ? '<span class="neon-green">INSTALLED</span>' :
            '<button class="btn btn-sm btn-buy" onclick="doModifyVehicle(' + activeIdx + ',\'' + m.id + '\')">INSTALL</button>') +
        '</td>' +
      '</tr>';
    }).join('');
    modsSection = '<h3 class="neon-yellow">🔧 Vehicle Mods (for current vehicle)</h3>' +
      '<table class="data-table"><thead><tr><th>Mod</th><th>Effect</th><th>Price</th><th></th></tr></thead><tbody>' + modRows + '</tbody></table>';
  }

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title neon-cyan">🚗 GARAGE</h2>' +
    '<div style="margin-bottom:8px;"><span class="neon-green">Slots: ' + garage.length + '/' + capacity + '</span></div>' +
    currentVehicle +
    '<h3 class="neon-green">Your Vehicles</h3>' +
    '<table class="data-table"><thead><tr><th>Vehicle</th><th>Type</th><th>Speed</th><th>Armor</th><th>Cargo</th><th>Condition</th><th>Actions</th></tr></thead><tbody>' + garageRows + '</tbody></table>' +
    modsSection +
    '<h3 class="neon-cyan">Dealership</h3>' +
    '<table class="data-table"><thead><tr><th>Vehicle</th><th>Type</th><th>Speed</th><th>Armor</th><th>Cargo</th><th>Price</th><th>Special</th><th></th></tr></thead><tbody>' + shopRows + '</tbody></table>' +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// PRISON SCREEN
// ============================================================

function doPrisonActivity(activityId) {
  if (typeof choosePrisonActivity !== 'function') return;
  var result = choosePrisonActivity(gameState, activityId);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doEscapeAttempt() {
  if (!confirm('Attempt escape? Failure adds 180 days + solitary!')) return;
  if (typeof attemptEscape !== 'function') return;
  var result = attemptEscape(gameState);
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
    if (!gameState.prison.inPrison) {
      currentScreen = 'game';
    }
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function renderPrison() {
  if (!gameState.prison || !gameState.prison.inPrison) {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title neon-red">🔒 PRISON</h2><p>You are not in prison.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var ps = gameState.prison;
  var tierData = ps.tierData || (typeof PRISON_TIERS !== 'undefined' ? PRISON_TIERS.find(function(t) { return t.id === ps.tier; }) : null) || { name: 'Unknown', emoji: '🔒' };

  // Escape info
  var escapeInfo = typeof getEscapeChance === 'function' ? getEscapeChance(gameState) : { chance: 0, canAttempt: false, message: '' };

  // Gang info
  var gangName = 'Unaffiliated';
  if (typeof PRISON_GANGS !== 'undefined' && ps.gang !== 'unaffiliated') {
    var gangData = PRISON_GANGS.find(function(g) { return g.id === ps.gang; });
    if (gangData) gangName = gangData.name;
  }

  // Activities
  var activityButtons = '';
  if (typeof PRISON_ACTIVITIES !== 'undefined') {
    activityButtons = PRISON_ACTIVITIES.map(function(a) {
      var isChosen = ps.todayActivity === a.id;
      return '<button class="btn ' + (isChosen ? 'btn-primary' : 'btn-secondary') + '" style="margin:3px;' + (isChosen ? '' : 'border-color:var(--neon-cyan);color:var(--neon-cyan)') + '" onclick="doPrisonActivity(\'' + a.id + '\')">' +
        a.emoji + ' ' + a.name +
        '<div style="font-size:0.6rem;color:var(--text-dim)">' + a.description + '</div>' +
      '</button>';
    }).join('');
  }

  // Empire autopilot
  var ap = ps.empireAutopilot || {};
  var autopilotSection = '<div style="padding:8px;border:1px solid var(--neon-yellow);border-radius:4px;margin-top:10px;">' +
    '<h4 class="neon-yellow">📡 Empire Autopilot</h4>' +
    '<div>Manager: <span class="neon-cyan">' + (ap.activeManager ? ap.activeManager.name : 'None') + '</span></div>' +
    '<div>Efficiency: <span class="' + (ap.efficiency >= 0.7 ? 'neon-green' : 'neon-red') + '">' + Math.floor((ap.efficiency || 0.5) * 100) + '%</span></div>' +
    '<div>Total Earned: <span class="neon-green">$' + (ap.totalEarned || 0).toLocaleString() + '</span> | Lost: <span class="neon-red">$' + (ap.totalLost || 0).toLocaleString() + '</span></div>' +
    '<div>Territories Lost: <span class="neon-red">' + (ap.territoriesLost || 0) + '</span> | Betrayals: <span class="neon-red">' + (ap.crewBetrayals || 0) + '</span></div>' +
  '</div>';

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title neon-red">' + tierData.emoji + ' PRISON - ' + tierData.name + '</h2>' +
    '<div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:12px;">' +
      '<div class="stat"><span class="stat-label">SENTENCE</span> <span class="stat-value neon-yellow">' + ps.daysRemaining + ' days left</span></div>' +
      '<div class="stat"><span class="stat-label">SERVED</span> <span class="stat-value">' + ps.daysServed + '/' + ps.sentenceDays + '</span></div>' +
      '<div class="stat"><span class="stat-label">HEALTH</span> <span class="stat-value ' + (ps.health > 50 ? 'neon-green' : 'neon-red') + '">' + ps.health + '%</span></div>' +
      '<div class="stat"><span class="stat-label">RESPECT</span> <span class="stat-value neon-cyan">' + ps.respect + '</span></div>' +
      '<div class="stat"><span class="stat-label">CONNECTIONS</span> <span class="stat-value">' + ps.connections + '</span></div>' +
      '<div class="stat"><span class="stat-label">GANG</span> <span class="stat-value neon-yellow">' + gangName + '</span></div>' +
      '<div class="stat"><span class="stat-label">CIGS</span> <span class="stat-value">' + (ps.cigarettes || 0) + '</span></div>' +
      '<div class="stat"><span class="stat-label">PRISON $</span> <span class="stat-value neon-green">$' + (ps.prisonCash || 0).toLocaleString() + '</span></div>' +
    '</div>' +
    (ps.solitaryDays > 0 ? '<div class="neon-red" style="padding:8px;border:1px solid var(--neon-red);border-radius:4px;margin-bottom:10px;">🔒 SOLITARY CONFINEMENT - ' + ps.solitaryDays + ' days remaining</div>' : '') +
    '<h3 class="neon-cyan">📋 Daily Activity</h3>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;">' + activityButtons + '</div>' +
    '<h3 class="neon-yellow">🚪 Escape</h3>' +
    '<div style="padding:8px;border:1px solid ' + (escapeInfo.canAttempt ? 'var(--neon-green)' : 'var(--neon-red)') + ';border-radius:4px;margin-bottom:10px;">' +
      '<div>Escape Chance: <span class="' + (escapeInfo.chance > 50 ? 'neon-green' : escapeInfo.chance > 25 ? 'neon-yellow' : 'neon-red') + '">' + escapeInfo.chance + '%</span></div>' +
      '<div style="font-size:0.7rem;color:var(--text-dim);">Intel: ' + (ps.escapeIntel || 0) + '/10 | Connections: ' + (ps.connections || 0) + '/5</div>' +
      (escapeInfo.canAttempt ? '<button class="btn btn-primary" style="margin-top:6px;border-color:var(--neon-red);background:rgba(255,0,0,0.2);" onclick="doEscapeAttempt()">🚪 ATTEMPT ESCAPE</button>' : '<div class="neon-red" style="font-size:0.75rem;margin-top:4px;">Requires 10 Intel + 5 Connections</div>') +
    '</div>' +
    autopilotSection +
    (ps.eventLog && ps.eventLog.length > 0 ? '<h3 style="margin-top:12px;">📜 Recent Events</h3><div style="max-height:150px;overflow-y:auto;font-size:0.75rem;color:var(--text-dim);">' + ps.eventLog.slice(-5).reverse().map(function(e) { return '<div style="margin-bottom:4px;">Day ' + e.day + ': ' + (e.message || e.type) + '</div>'; }).join('') + '</div>' : '') +
  '</div>';
}

// ============================================================
// HEIST PLANNING SCREEN
// ============================================================

function _bridgeHeistState() {
  // Heist functions expect flat state with activeHeist, availableHeists etc at top level
  // But game stores them under gameState.heists. Bridge them.
  if (!gameState.heists) gameState.heists = typeof initHeistState === 'function' ? initHeistState() : { activeHeist: null, availableHeists: [], heistCooldown: 0, completedHeists: [], failedHeists: [], totalHeistProfit: 0, heistHistory: [] };
  var hs = gameState.heists;
  gameState.activeHeist = hs.activeHeist;
  gameState.availableHeists = hs.availableHeists;
  gameState.heistCooldown = hs.heistCooldown;
  gameState.completedHeists = hs.completedHeists;
  gameState.failedHeists = hs.failedHeists;
  gameState.totalHeistProfit = hs.totalHeistProfit;
  gameState.heistHistory = hs.heistHistory;
}
function _syncHeistState() {
  // Sync changes back to gameState.heists
  if (!gameState.heists) return;
  gameState.heists.activeHeist = gameState.activeHeist;
  gameState.heists.availableHeists = gameState.availableHeists;
  gameState.heists.heistCooldown = gameState.heistCooldown;
  gameState.heists.completedHeists = gameState.completedHeists;
  gameState.heists.failedHeists = gameState.failedHeists;
  gameState.heists.totalHeistProfit = gameState.totalHeistProfit;
  gameState.heists.heistHistory = gameState.heistHistory;
}

function doStartHeist(heistId) {
  if (typeof startHeistPlanning !== 'function') return;
  _bridgeHeistState();
  var result = startHeistPlanning(gameState, heistId);
  _syncHeistState();
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doAssignHeistCrew(crewIndices) {
  if (typeof assignHeistCrew !== 'function') return;
  _bridgeHeistState();
  var result = assignHeistCrew(gameState, crewIndices);
  _syncHeistState();
  if (result.success) {
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doExecuteHeist() {
  if (!confirm('Execute the heist? No turning back!')) return;
  if (typeof executeHeist !== 'function') return;
  _bridgeHeistState();
  var result = executeHeist(gameState);
  _syncHeistState();
  if (result) {
    playSound('click');
    var msg = result.success ? 'Heist successful! Loot: $' + (result.loot || 0).toLocaleString() : 'Heist failed! Heat +' + (result.heatGained || 0);
    showNotification(msg, result.success ? 'success' : 'error');
  }
  render();
}

function renderHeist() {
  if (typeof HEIST_TYPES === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title neon-yellow">🎯 HEIST PLANNING</h2><p class="neon-red">Heist system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var heistState = gameState.heists || gameState;
  var activeHeist = heistState.activeHeist || null;
  var cooldown = heistState.heistCooldown || 0;

  // Active heist display
  var activeSection = '';
  if (activeHeist) {
    var heistType = HEIST_TYPES.find(function(h) { return h.id === activeHeist.heistId; });
    var successChance = typeof getHeistSuccessChance === 'function' ? Math.round(getHeistSuccessChance(heistState) * 100) : '??';
    var crewAssigned = activeHeist.assignedCrew ? activeHeist.assignedCrew.length : 0;
    var crewNeeded = heistType ? heistType.crewMin : 0;
    var equipCount = activeHeist.equipment ? activeHeist.equipment.length : 0;

    activeSection = '<div style="padding:12px;border:2px solid var(--neon-yellow);border-radius:6px;margin-bottom:12px;">' +
      '<h3 class="neon-yellow">' + (heistType ? heistType.emoji : '🎯') + ' Active: ' + activeHeist.heistName + '</h3>' +
      '<div style="display:flex;gap:15px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<span>Phase: <span class="neon-cyan">' + (activeHeist.phase || 'planning').toUpperCase() + '</span></span>' +
        (activeHeist.phase === 'planning' ? '<span>Scouting: <span class="neon-yellow">' + (activeHeist.planningDaysRemaining || 0) + ' days left</span></span>' : '') +
        '<span>Crew: <span class="' + (crewAssigned >= crewNeeded ? 'neon-green' : 'neon-red') + '">' + crewAssigned + '/' + crewNeeded + '</span></span>' +
        '<span>Equipment: <span class="neon-cyan">' + equipCount + '</span></span>' +
        '<span>Success: <span class="' + (successChance > 60 ? 'neon-green' : successChance > 40 ? 'neon-yellow' : 'neon-red') + '">' + successChance + '%</span></span>' +
        '<span>Reward: <span class="neon-green">~$' + (activeHeist.estimatedReward || 0).toLocaleString() + '</span></span>' +
      '</div>';

    // Crew assignment
    if (gameState.henchmen && gameState.henchmen.length > 0) {
      activeSection += '<div style="margin-bottom:8px;"><strong>Assign Crew:</strong> ';
      var indices = [];
      gameState.henchmen.forEach(function(c, ci) {
        if (!c.injured && !c.dead) indices.push(ci);
      });
      if (indices.length > 0) {
        activeSection += '<button class="btn btn-sm btn-secondary" style="border-color:var(--neon-cyan);color:var(--neon-cyan)" onclick="doAssignHeistCrew([' + indices.slice(0, heistType ? heistType.crewMax : 8).join(',') + '])">Assign Available (' + indices.length + ')</button>';
      }
      activeSection += '</div>';
    }

    // Equipment
    if (typeof HEIST_EQUIPMENT !== 'undefined' && (activeHeist.phase === 'planning' || activeHeist.phase === 'ready')) {
      var ownedEquip = (activeHeist.equipment || []).map(function(e) { return e.id; });
      var equipRows = HEIST_EQUIPMENT.map(function(eq) {
        var owned = ownedEquip.indexOf(eq.id) !== -1;
        return '<tr><td>' + eq.emoji + ' ' + eq.name + '</td><td style="font-size:0.7rem;color:var(--text-dim)">' + eq.desc + '</td><td>$' + eq.cost.toLocaleString() + '</td><td>' +
          (owned ? '<span class="neon-green">OWNED</span>' : '<button class="btn btn-sm btn-buy" onclick="if(typeof buyHeistEquipment===\'function\'){_bridgeHeistState();var r=buyHeistEquipment(gameState,\'' + eq.id + '\');_syncHeistState();showNotification(r.message,r.success?\'success\':\'error\');render();}">BUY $' + eq.cost.toLocaleString() + '</button>') +
        '</td></tr>';
      }).join('');
      activeSection += '<h4 class="neon-cyan">Equipment</h4><table class="data-table"><thead><tr><th>Item</th><th>Effect</th><th>Cost</th><th></th></tr></thead><tbody>' + equipRows + '</tbody></table>';
    }

    // Execute button
    if (activeHeist.phase === 'ready' && crewAssigned >= crewNeeded) {
      activeSection += '<button class="btn btn-primary" style="margin-top:8px;border-color:var(--neon-red);background:rgba(255,0,0,0.2);font-size:1.1rem;" onclick="doExecuteHeist()">⚡ EXECUTE HEIST</button>';
    }

    activeSection += '</div>';
  }

  // Available heists
  var availableHeists = heistState.availableHeists || [];
  var heistRows = '';
  if (!activeHeist && cooldown <= 0) {
    heistRows = HEIST_TYPES.filter(function(ht) {
      var currentAct = gameState.currentAct || (gameState.campaign ? gameState.campaign.currentAct : 1) || 1;
      if (ht.unlockAct > currentAct && ht.unlockAct !== 99) return false;
      if (ht.requiresNGPlus && !gameState.newGamePlus) return false;
      return true;
    }).map(function(ht) {
      var avail = availableHeists.find(function(a) { return a.heistTypeId === ht.id; });
      return '<tr>' +
        '<td>' + ht.emoji + ' ' + ht.name + '</td>' +
        '<td><span class="' + (ht.difficulty <= 2 ? 'neon-green' : ht.difficulty <= 4 ? 'neon-yellow' : 'neon-red') + '">★'.repeat(ht.difficulty) + '</span></td>' +
        '<td>$' + ht.rewardMin.toLocaleString() + '-$' + ht.rewardMax.toLocaleString() + '</td>' +
        '<td>' + ht.crewMin + '-' + ht.crewMax + '</td>' +
        '<td>🌡️' + ht.heatGenerated + '</td>' +
        '<td style="font-size:0.65rem;color:var(--text-dim);max-width:180px;">' + ht.desc + '</td>' +
        '<td>' +
          (avail ? '<button class="btn btn-sm btn-buy" onclick="doStartHeist(\'' + ht.id + '\')">PLAN</button>' : '<span style="font-size:0.65rem;color:var(--text-dim)">Unavailable</span>') +
        '</td>' +
      '</tr>';
    }).join('');
  }

  // History
  var historySection = '';
  var history = heistState.heistHistory || [];
  if (history.length > 0) {
    historySection = '<h3 style="margin-top:12px;">📜 Heist History</h3><div style="max-height:120px;overflow-y:auto;">' +
      history.slice(-5).reverse().map(function(h) {
        return '<div style="margin-bottom:4px;font-size:0.75rem;"><span class="' + (h.success ? 'neon-green' : 'neon-red') + '">' + (h.success ? '✓' : '✗') + '</span> ' + h.heistName + ' - Loot: $' + (h.loot || 0).toLocaleString() + ' | Heat: +' + (h.heatGained || 0) + ' | Casualties: ' + (h.casualtiesTotal || 0) + '</div>';
      }).join('') + '</div>';
  }

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title neon-yellow">🎯 HEIST PLANNING</h2>' +
    (cooldown > 0 ? '<div class="neon-yellow" style="margin-bottom:8px;">⏳ Cooldown: ' + cooldown + ' days</div>' : '') +
    activeSection +
    (!activeHeist && cooldown <= 0 ? '<h3 class="neon-cyan">Available Heists</h3>' +
      '<table class="data-table"><thead><tr><th>Heist</th><th>Difficulty</th><th>Reward</th><th>Crew</th><th>Heat</th><th>Description</th><th></th></tr></thead><tbody>' + heistRows + '</tbody></table>' : '') +
    historySection +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// NIGHTLIFE & SOCIAL SCREEN
// ============================================================

function doAttendEvent(eventId) {
  if (typeof attendEvent !== 'function') return;
  var nightlifeState = gameState.nightlife || (typeof initNightlifeState === 'function' ? initNightlifeState() : { eventCooldowns: {}, vipStatus: {}, connections: [], totalSpent: 0, eventsAttended: 0, venueSpending: {} });
  if (!gameState.nightlife) gameState.nightlife = nightlifeState;
  var playerLevel = gameState.level || gameState.reputation || 1;
  var currentDay = gameState.day || 0;
  var event = SOCIAL_EVENTS.find(function(e) { return e.id === eventId; });
  if (!event) return;
  if ((gameState.cash || 0) < event.cost) {
    showNotification('Not enough cash! Need $' + event.cost.toLocaleString(), 'error');
    return;
  }
  gameState.cash -= event.cost;
  var result = attendEvent(nightlifeState, eventId, playerLevel, currentDay);
  if (result.success) {
    playSound('click');
    var msg = event.emoji + ' ' + event.name + ': -$' + event.cost.toLocaleString() + ' | Stress -' + result.stressRelief;
    if (result.outcomes && result.outcomes.length > 0) {
      msg += ' | ' + result.outcomes.map(function(o) { return o.detail || o.type; }).join(', ');
    }
    if (result.vipUnlocked) msg += ' | 🌟 VIP STATUS UNLOCKED!';
    showNotification(msg, 'success');
    if (gameState.lifestyle && typeof gameState.lifestyle.stress === 'number') {
      gameState.lifestyle.stress = Math.max(0, gameState.lifestyle.stress - result.stressRelief);
    }
  } else {
    gameState.cash += event.cost;
    showNotification(result.message, 'error');
  }
  render();
}

function renderNightlife() {
  if (typeof SOCIAL_EVENTS === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title" style="color:#ff44ff">🌙 NIGHTLIFE & SOCIAL</h2><p class="neon-red">Nightlife system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var nightlifeState = gameState.nightlife || { eventCooldowns: {}, vipStatus: {}, connections: [], totalSpent: 0, eventsAttended: 0, venueSpending: {} };
  var playerLevel = gameState.level || gameState.reputation || 1;
  var currentDay = gameState.day || 0;

  var available = typeof getAvailableEvents === 'function' ? getAvailableEvents(nightlifeState, playerLevel, currentDay) : SOCIAL_EVENTS.filter(function(e) { return playerLevel >= e.unlockLevel; });

  var eventCards = available.map(function(ev) {
    var isVip = nightlifeState.vipStatus && nightlifeState.vipStatus[ev.id];
    var onCooldown = nightlifeState.eventCooldowns && nightlifeState.eventCooldowns[ev.id] > 0;
    var cooldownDays = onCooldown ? nightlifeState.eventCooldowns[ev.id] : 0;
    return '<div style="padding:10px;border:1px solid ' + (isVip ? 'var(--neon-yellow)' : 'var(--neon-cyan)') + ';border-radius:6px;margin-bottom:8px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div>' +
          '<strong>' + ev.emoji + ' ' + ev.name + '</strong>' +
          (isVip ? ' <span class="neon-yellow">🌟 VIP</span>' : '') +
          '<div style="font-size:0.7rem;color:var(--text-dim);max-width:400px;">' + ev.description + '</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div>Cost: <span class="neon-green">$' + ev.cost.toLocaleString() + '</span></div>' +
          '<div style="font-size:0.75rem;">Stress Relief: <span class="neon-cyan">' + ev.stressRelief + '</span> | Connect: <span class="neon-yellow">' + Math.round(ev.connectionChance * 100) + '%</span></div>' +
          (onCooldown ? '<div class="neon-red" style="font-size:0.7rem;">Cooldown: ' + cooldownDays + ' days</div>' : '<button class="btn btn-sm btn-buy" style="margin-top:4px;" onclick="doAttendEvent(\'' + ev.id + '\')">ATTEND</button>') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  if (available.length === 0) {
    eventCards = '<p style="color:var(--text-dim);">No events available right now. Level up or wait for cooldowns.</p>';
  }

  // Connections
  var connectionsSection = '';
  var connections = nightlifeState.connections || [];
  if (connections.length > 0) {
    connectionsSection = '<h3 class="neon-yellow">👥 Contacts (' + connections.length + ')</h3>' +
      '<div style="max-height:150px;overflow-y:auto;">' +
      connections.slice(-8).reverse().map(function(c) {
        return '<div style="font-size:0.75rem;margin-bottom:3px;">' +
          '<span class="' + (c.active ? 'neon-green' : 'neon-yellow') + '">' + (c.active ? '●' : '○') + '</span> ' +
          c.name + ' (' + c.type + ')' +
          (!c.active && c.followUpDay > 0 ? ' <span style="color:var(--text-dim)">- follows up in ' + c.followUpDay + 'd</span>' : '') +
        '</div>';
      }).join('') + '</div>';
  }

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#ff44ff">🌙 NIGHTLIFE & SOCIAL</h2>' +
    '<div style="margin-bottom:10px;"><span class="neon-cyan">Events Attended: ' + (nightlifeState.eventsAttended || 0) + '</span> | <span class="neon-yellow">Total Spent: $' + (nightlifeState.totalSpent || 0).toLocaleString() + '</span></div>' +
    '<h3 class="neon-cyan">Available Events</h3>' +
    eventCards +
    connectionsSection +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// ROMANCE / RELATIONSHIPS SCREEN
// ============================================================

function doAdvanceRelationship(npcId, action) {
  if (!action) action = 'date';
  var romState = gameState.romance;
  if (!romState) {
    if (typeof initRomanceState === 'function') {
      gameState.romance = initRomanceState();
      romState = gameState.romance;
    } else {
      return;
    }
  }

  if (action === 'meet') {
    if (typeof meetRomanceNPC === 'function') {
      var meetResult = meetRomanceNPC(romState, npcId);
      showNotification(meetResult.message, meetResult.success ? 'success' : 'error');
    }
  } else if (action === 'date') {
    if (typeof goOnDate === 'function') {
      var tier = 1;
      romState._currentDay = gameState.day || 0;
      var dateResult = goOnDate(romState, npcId, tier, gameState.cash || 0);
      if (dateResult.success) {
        gameState.cash = Math.max(0, (gameState.cash || 0) - dateResult.cost);
        playSound('click');
        showNotification(dateResult.message + (dateResult.stageUp ? ' 💕 Stage Up: ' + dateResult.newStage + '!' : ''), 'success');
        if (gameState.lifestyle && typeof gameState.lifestyle.stress === 'number') {
          gameState.lifestyle.stress = Math.max(0, gameState.lifestyle.stress - dateResult.stressRelief);
        }
      } else {
        showNotification(dateResult.message, 'error');
      }
    }
  } else if (action === 'gift') {
    if (typeof giveGift === 'function') {
      var giftValue = 2000;
      if ((gameState.cash || 0) < giftValue) {
        showNotification('Not enough cash for a gift!', 'error');
      } else {
        gameState.cash -= giftValue;
        var giftResult = giveGift(romState, npcId, giftValue);
        showNotification(giftResult.message + (giftResult.stageUp ? ' 💕 Stage Up: ' + giftResult.newStage + '!' : ''), giftResult.success ? 'success' : 'error');
      }
    }
  } else if (action === 'call') {
    if (typeof phoneCall === 'function') {
      var callResult = phoneCall(romState, npcId);
      showNotification(callResult.message, callResult.success ? 'success' : 'error');
    }
  } else if (action === 'advance') {
    if (typeof advanceRelationship === 'function') {
      var advResult = advanceRelationship(romState, npcId);
      showNotification(advResult.message, advResult.success ? 'success' : 'error');
    }
  }
  render();
}

function renderRomance() {
  if (typeof ROMANCE_NPCS === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title" style="color:#ff6699">💕 RELATIONSHIPS</h2><p class="neon-red">Romance system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var romState = gameState.romance || { relationships: {}, daysSinceContact: {}, gifts: {} };
  var stageOrder = typeof RELATIONSHIP_STAGES !== 'undefined' ? RELATIONSHIP_STAGES : ['stranger', 'acquaintance', 'dating', 'serious', 'partner'];
  var thresholds = typeof STAGE_THRESHOLDS !== 'undefined' ? STAGE_THRESHOLDS : { acquaintance: 10, dating: 30, serious: 60, partner: 100 };

  var npcCards = ROMANCE_NPCS.map(function(npc) {
    var rel = romState.relationships ? romState.relationships[npc.id] : null;
    var stage = rel ? rel.stage : 'stranger';
    var points = rel ? rel.points : 0;
    var stageIdx = stageOrder.indexOf(stage);
    var nextStage = stageIdx < stageOrder.length - 1 ? stageOrder[stageIdx + 1] : null;
    var nextThreshold = nextStage ? thresholds[nextStage] : points;
    var progressPct = nextThreshold > 0 ? Math.min(100, Math.round((points / nextThreshold) * 100)) : 100;

    // Stage color
    var stageColor = stage === 'partner' ? '#ff44ff' : stage === 'serious' ? '#ff6699' : stage === 'dating' ? '#ff9944' : stage === 'acquaintance' ? '#ffcc44' : '#666';

    // Benefits display
    var benefitsStr = '';
    if (rel && npc.benefits[stage]) {
      var b = npc.benefits[stage];
      var parts = [];
      if (b.stressReduction) parts.push('-' + Math.round(b.stressReduction * 100) + '% stress');
      if (b.freeHealing) parts.push('Free healing');
      if (b.repBonus) parts.push('+' + Math.round(b.repBonus * 100) + '% rep');
      if (b.legalDefense) parts.push('Legal defense');
      if (b.laundering) parts.push('Money laundering');
      if (b.intelChance) parts.push('+' + Math.round(b.intelChance * 100) + '% intel');
      if (b.safeHouse) parts.push('Safe house');
      if (parts.length > 0) benefitsStr = '<div style="font-size:0.65rem;color:var(--neon-green);margin-top:3px;">Benefits: ' + parts.join(' | ') + '</div>';
    }

    return '<div style="padding:10px;border:1px solid ' + stageColor + ';border-radius:6px;margin-bottom:8px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
        '<div>' +
          '<strong>' + npc.emoji + ' ' + npc.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">(' + npc.background + ')</span>' +
          '<div style="font-size:0.7rem;color:var(--text-dim);">' + npc.description + '</div>' +
          '<div style="font-size:0.7rem;">Personality: <span class="neon-cyan">' + npc.personality.primary + '</span> / <span class="neon-yellow">' + npc.personality.secondary + '</span></div>' +
          '<div style="font-size:0.7rem;">Meets at: <span style="color:' + stageColor + '">' + npc.meetLocation + '</span></div>' +
          benefitsStr +
        '</div>' +
        '<div style="text-align:right;min-width:140px;">' +
          '<div style="color:' + stageColor + ';font-weight:bold;text-transform:uppercase;">' + stage + '</div>' +
          '<div style="font-size:0.7rem;">' + points + (nextStage ? '/' + nextThreshold : '') + ' pts</div>' +
          '<div style="width:120px;height:6px;background:#333;border-radius:3px;margin:4px 0;">' +
            '<div style="width:' + progressPct + '%;height:100%;background:' + stageColor + ';border-radius:3px;"></div>' +
          '</div>' +
          (stage === 'stranger' ? '<button class="btn btn-sm btn-buy" style="margin-top:4px;" onclick="doAdvanceRelationship(\'' + npc.id + '\',\'meet\')">MEET</button>' :
            '<div style="margin-top:4px;">' +
              '<button class="btn btn-sm btn-secondary" style="border-color:' + stageColor + ';color:' + stageColor + ';margin:1px;" onclick="doAdvanceRelationship(\'' + npc.id + '\',\'date\')">Date</button>' +
              '<button class="btn btn-sm btn-secondary" style="border-color:var(--neon-yellow);color:var(--neon-yellow);margin:1px;" onclick="doAdvanceRelationship(\'' + npc.id + '\',\'gift\')">Gift</button>' +
              '<button class="btn btn-sm btn-secondary" style="border-color:var(--neon-cyan);color:var(--neon-cyan);margin:1px;" onclick="doAdvanceRelationship(\'' + npc.id + '\',\'call\')">Call</button>' +
            '</div>') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  // Active benefits summary
  var benefitsSummary = '';
  if (typeof getRomanceBenefits === 'function' && romState.relationships && Object.keys(romState.relationships).length > 0) {
    var ben = getRomanceBenefits(romState);
    var activeBenefits = [];
    if (ben.stressReduction > 0) activeBenefits.push('-' + Math.round(ben.stressReduction * 100) + '% stress');
    if (ben.freeHealing) activeBenefits.push('Free healing');
    if (ben.repBonus > 0) activeBenefits.push('+' + Math.round(ben.repBonus * 100) + '% rep');
    if (ben.legalDefense) activeBenefits.push('Legal defense');
    if (ben.sentenceReduction > 0) activeBenefits.push('-' + Math.round(ben.sentenceReduction * 100) + '% sentence');
    if (ben.laundering) activeBenefits.push('Money laundering');
    if (ben.safeHouses > 0) activeBenefits.push(ben.safeHouses + ' safe house(s)');
    if (activeBenefits.length > 0) {
      benefitsSummary = '<div style="padding:8px;border:1px solid var(--neon-green);border-radius:4px;margin-bottom:12px;">' +
        '<span class="neon-green">Active Benefits:</span> ' + activeBenefits.join(' | ') +
      '</div>';
    }
  }

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#ff6699">💕 RELATIONSHIPS</h2>' +
    benefitsSummary +
    npcCards +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// TERRITORY DEFENSE SCREEN
// ============================================================

function doBuildFortification(districtId, level) {
  if (typeof buildFortification !== 'function') return;
  var defState = gameState.territoryDefense;
  if (!defState) {
    if (typeof initTerritoryDefenseState === 'function') {
      gameState.territoryDefense = initTerritoryDefenseState();
      defState = gameState.territoryDefense;
    } else {
      return;
    }
  }
  defState.cash = gameState.cash;
  var result = buildFortification(defState, districtId, level);
  if (result.success) {
    gameState.cash = defState.cash;
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function doBuildStructure(districtId, structureId) {
  if (typeof buildStructure !== 'function') return;
  var defState = gameState.territoryDefense;
  if (!defState) {
    if (typeof initTerritoryDefenseState === 'function') {
      gameState.territoryDefense = initTerritoryDefenseState();
      defState = gameState.territoryDefense;
    } else {
      return;
    }
  }
  defState.cash = gameState.cash;
  var result = buildStructure(defState, districtId, structureId);
  if (result.success) {
    gameState.cash = defState.cash;
    playSound('click');
    showNotification(result.message, 'success');
  } else {
    showNotification(result.message, 'error');
  }
  render();
}

function renderDefense() {
  if (typeof FORTIFICATION_LEVELS === 'undefined' || typeof DEFENSE_STRUCTURES === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() + '<h2 class="section-title" style="color:#88ff44">🏰 TERRITORY DEFENSE</h2><p class="neon-red">Defense system not loaded.</p><button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button></div>';
  }

  var defState = gameState.territoryDefense || { fortifications: {}, structures: {}, activeSieges: [], defenseHistory: [], siegesRepelled: 0, territoriesLost: 0, structureDamage: {} };
  var territories = gameState.territories || [];
  var controlledTerritories = typeof getControlledTerritories === 'function' ? getControlledTerritories(gameState) : territories.filter(function(t) { return t.controlled; });

  // Territory defense cards
  var territoryCards = '';
  if (controlledTerritories.length > 0) {
    territoryCards = controlledTerritories.map(function(t) {
      var districtId = t.id || t.districtId || t.name;
      var fortLevel = (defState.fortifications || {})[districtId] || 0;
      var fortDef = FORTIFICATION_LEVELS[fortLevel];
      var structures = (defState.structures || {})[districtId] || [];
      var defenseStrength = typeof getDefenseStrength === 'function' ? getDefenseStrength(defState, districtId) : fortDef.defenseBonus;
      var underSiege = (defState.activeSieges || []).some(function(s) { return s.districtId === districtId; });

      // Structures list
      var structList = structures.map(function(sId) {
        var sd = DEFENSE_STRUCTURES.find(function(s) { return s.id === sId; });
        var damage = ((defState.structureDamage || {})[districtId] || {})[sId] || 0;
        return sd ? (sd.emoji + ' ' + sd.name + (damage > 0 ? ' <span class="neon-red">(' + damage + '% dmg)</span>' : '')) : sId;
      }).join(', ') || '<span style="color:var(--text-dim)">None</span>';

      // Upgrade button
      var upgradeButtons = '';
      if (fortLevel < FORTIFICATION_LEVELS.length - 1) {
        var nextFort = FORTIFICATION_LEVELS[fortLevel + 1];
        upgradeButtons = '<button class="btn btn-sm btn-buy" onclick="doBuildFortification(\'' + districtId + '\',' + (fortLevel + 1) + ')">⬆ ' + nextFort.name + ' ($' + nextFort.cost.toLocaleString() + ')</button>';
      }

      return '<div style="padding:10px;border:1px solid ' + (underSiege ? 'var(--neon-red)' : 'var(--neon-green)') + ';border-radius:6px;margin-bottom:8px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div>' +
            '<strong>' + (t.name || districtId) + '</strong>' +
            (underSiege ? ' <span class="neon-red">⚔️ UNDER SIEGE</span>' : '') +
            '<div style="font-size:0.75rem;">Fortification: <span class="neon-yellow">' + fortDef.name + ' (Lv.' + fortLevel + ')</span> | Defense: <span class="neon-cyan">' + defenseStrength + '</span></div>' +
            '<div style="font-size:0.7rem;">Structures: ' + structList + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            upgradeButtons +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    territoryCards = '<p style="color:var(--text-dim)">No controlled territories. Capture territory first.</p>';
  }

  // Available structures to build
  var structureRows = DEFENSE_STRUCTURES.map(function(s) {
    return '<tr>' +
      '<td>' + s.emoji + ' ' + s.name + '</td>' +
      '<td style="font-size:0.7rem;color:var(--text-dim)">' + s.desc + '</td>' +
      '<td>$' + s.cost.toLocaleString() + '</td>' +
      '<td>$' + s.maintenanceCost.toLocaleString() + '/day</td>' +
      '<td>' +
        (controlledTerritories.length > 0 ?
          controlledTerritories.map(function(t) {
            var distId = t.id || t.districtId || t.name;
            var existing = ((defState.structures || {})[distId] || []).indexOf(s.id) !== -1;
            return existing ? '<span class="neon-green" style="font-size:0.65rem;margin-right:4px;">' + (t.name || distId).substr(0, 8) + '✓</span>' :
              '<button class="btn btn-sm btn-secondary" style="font-size:0.6rem;margin:1px;border-color:var(--neon-cyan);color:var(--neon-cyan);" onclick="doBuildStructure(\'' + distId + '\',\'' + s.id + '\')">' + (t.name || distId).substr(0, 8) + '</button>';
          }).join('') : '<span style="color:var(--text-dim);font-size:0.65rem;">No territories</span>') +
      '</td>' +
    '</tr>';
  }).join('');

  // Siege history
  var siegeHistory = '';
  var history = defState.defenseHistory || [];
  if (history.length > 0) {
    siegeHistory = '<h3 style="margin-top:12px;">📜 Siege History</h3>' +
      '<div style="max-height:120px;overflow-y:auto;">' +
      history.slice(-5).reverse().map(function(h) {
        return '<div style="font-size:0.75rem;margin-bottom:3px;">' +
          '<span class="' + (h.result === 'defended' ? 'neon-green' : 'neon-red') + '">' + (h.result === 'defended' ? '✓ DEFENDED' : '✗ LOST') + '</span> ' +
          (h.districtId || '') + ' vs ' + (h.attacker || '') + ' | Def: ' + (h.defenseStrength || 0) + ' vs Atk: ' + (h.attackStrength || 0) +
        '</div>';
      }).join('') + '</div>';
  }

  // Active sieges
  var activeSiegeSection = '';
  var activeSieges = defState.activeSieges || [];
  if (activeSieges.length > 0) {
    activeSiegeSection = '<h3 class="neon-red">⚔️ Active Sieges</h3>' +
      activeSieges.map(function(s) {
        return '<div style="padding:8px;border:1px solid var(--neon-red);border-radius:4px;margin-bottom:6px;">' +
          '<strong>' + (s.districtId || '') + '</strong> under attack by <span class="neon-red">' + (s.attackerData ? s.attackerData.name : 'Unknown') + '</span>' +
          ' | Phase: <span class="neon-yellow">' + (s.phase || '') + '</span>' +
          (s.isSurprise ? ' | <span class="neon-red">SURPRISE ATTACK!</span>' : '') +
        '</div>';
      }).join('');
  }

  return '<div class="screen-container">' +
    renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#88ff44">🏰 TERRITORY DEFENSE</h2>' +
    '<div style="margin-bottom:10px;">' +
      '<span class="neon-green">Sieges Repelled: ' + (defState.siegesRepelled || 0) + '</span> | ' +
      '<span class="neon-red">Territories Lost: ' + (defState.territoriesLost || 0) + '</span>' +
    '</div>' +
    activeSiegeSection +
    '<h3 class="neon-green">Territories</h3>' +
    territoryCards +
    '<h3 class="neon-cyan">Defense Structures</h3>' +
    '<table class="data-table"><thead><tr><th>Structure</th><th>Effect</th><th>Cost</th><th>Maintenance</th><th>Build In</th></tr></thead><tbody>' + structureRows + '</tbody></table>' +
    siegeHistory +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// V6: ENCOUNTER MODAL OVERLAY
// ============================================================
function renderEncounterModal() {
  var enc = gameState.encounters && gameState.encounters.activeEncounter;
  if (!enc) return '';

  var choicesHtml = '';
  if (enc.resolved) {
    // Show result after choice was made
    choicesHtml =
      '<div style="padding:12px;border:1px solid var(--neon-green);border-radius:6px;margin:12px 0;background:rgba(0,255,100,0.05);">' +
        '<p style="color:var(--neon-green);font-weight:bold;">Outcome</p>' +
        '<p>' + (enc.resolvedText || enc.resultText || 'The encounter has been resolved.') + '</p>' +
        (enc.resolvedEffects ? '<div style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.3);border-radius:4px;font-size:0.8rem;">' + enc.resolvedEffects + '</div>' : '') +
      '</div>' +
      '<button class="btn btn-secondary" onclick="if(typeof dismissEncounter===\'function\') dismissEncounter(gameState); render();">Dismiss</button>';
  } else {
    // Show choices with consequence hints
    var outcomes = enc.outcomes || enc.choices || [];
    choicesHtml = outcomes.map(function(choice, idx) {
      // Generate consequence hints from effects
      var hints = [];
      var fx = choice.effects || {};
      // Categorize the choice
      if (fx.cash && fx.cash > 0) hints.push('<span style="color:#39ff14">+$$$</span>');
      if (fx.cash && fx.cash < 0) hints.push('<span style="color:#ff4444">Costs $</span>');
      if (fx.heat && fx.heat > 0) hints.push('<span style="color:#ff6644">+Heat</span>');
      if (fx.heat && fx.heat < 0) hints.push('<span style="color:#44aaff">-Heat</span>');
      if (fx.health && fx.health < 0) hints.push('<span style="color:#ff4444">Risk: Damage</span>');
      if (fx.health && fx.health > 0) hints.push('<span style="color:#39ff14">+Health</span>');
      if (fx.fear && fx.fear > 0) hints.push('<span style="color:#cc44ff">+Fear</span>');
      if (fx.fear && fx.fear < 0) hints.push('<span style="color:#cc44ff">-Fear</span>');
      if (fx.trust && fx.trust > 0) hints.push('<span style="color:#44ff88">+Trust</span>');
      if (fx.trust && fx.trust < 0) hints.push('<span style="color:#ff8844">-Trust</span>');
      if (fx.streetCred && fx.streetCred > 0) hints.push('<span style="color:#ffcc00">+Cred</span>');
      if (fx.publicImage && fx.publicImage > 0) hints.push('<span style="color:#88aaff">+Image</span>');
      if (fx.publicImage && fx.publicImage < 0) hints.push('<span style="color:#ff8844">-Image</span>');
      if (fx.stress && fx.stress > 0) hints.push('<span style="color:#ff8844">+Stress</span>');
      if (fx.stress && fx.stress < 0) hints.push('<span style="color:#44ccff">-Stress</span>');
      if (fx.communityRep && fx.communityRep > 0) hints.push('<span style="color:#ff88cc">+Community</span>');
      if (fx.communityRep && fx.communityRep < 0) hints.push('<span style="color:#ff8844">-Community</span>');
      if (fx.pet) hints.push('<span style="color:#ffaa00">Companion!</span>');
      if (fx.lookout) hints.push('<span style="color:#ffaa00">Lookout!</span>');
      if (fx.product) hints.push('<span style="color:#00ffcc">+Product</span>');
      // Determine overall tone
      var tone = '';
      var labelLower = (choice.label || '').toLowerCase();
      if (labelLower.includes('help') || labelLower.includes('save') || labelLower.includes('protect') || labelLower.includes('pay for') || labelLower.includes('spare')) {
        tone = '<span style="color:#44ff88;font-size:0.65rem">Compassionate</span>';
      } else if (labelLower.includes('attack') || labelLower.includes('rob') || labelLower.includes('kill') || labelLower.includes('fight') || labelLower.includes('join the')) {
        tone = '<span style="color:#ff4444;font-size:0.65rem">Aggressive</span>';
      } else if (labelLower.includes('ignore') || labelLower.includes('walk away') || labelLower.includes('nothing') || labelLower.includes('decline')) {
        tone = '<span style="color:#888;font-size:0.65rem">Passive</span>';
      } else if (labelLower.includes('scam') || labelLower.includes('sell') || labelLower.includes('follow') || labelLower.includes('bribe')) {
        tone = '<span style="color:#ffcc00;font-size:0.65rem">Opportunistic</span>';
      } else if (labelLower.includes('confront') || labelLower.includes('negotiate') || labelLower.includes('talk')) {
        tone = '<span style="color:#88aaff;font-size:0.65rem">Diplomatic</span>';
      }
      // Trait-based flavor: your reputation affects how choices feel
      var traitFlavor = '';
      if (gameState.playerTraits) {
        var traits = gameState.playerTraits;
        if (labelLower.includes('fight') || labelLower.includes('attack') || labelLower.includes('kill')) {
          if (traits.violent && traits.violent >= 3) traitFlavor = '<span style="color:#ff00aa;font-size:0.6rem">⚡ Your violent reputation makes this easier</span>';
          else if (traits.ruthless && traits.ruthless >= 2) traitFlavor = '<span style="color:#ff00aa;font-size:0.6rem">🗡️ They know what you\'re capable of</span>';
        } else if (labelLower.includes('help') || labelLower.includes('save') || labelLower.includes('donate')) {
          if (traits.charitable && traits.charitable >= 2) traitFlavor = '<span style="color:#00ff88;font-size:0.6rem">💚 The community knows your generosity</span>';
          else if (traits.community_minded) traitFlavor = '<span style="color:#00ff88;font-size:0.6rem">🤝 People trust you in this neighborhood</span>';
        } else if (labelLower.includes('negotiate') || labelLower.includes('talk') || labelLower.includes('convince')) {
          if (traits.diplomatic && traits.diplomatic >= 2) traitFlavor = '<span style="color:#88aaff;font-size:0.6rem">🕊️ Your diplomatic reputation opens doors</span>';
          else if (traits.silver_tongue) traitFlavor = '<span style="color:#88aaff;font-size:0.6rem">🗣️ Your silver tongue gives you an edge</span>';
        } else if (labelLower.includes('bribe') || labelLower.includes('corrupt')) {
          if (traits.corruptor && traits.corruptor >= 2) traitFlavor = '<span style="color:#ffcc00;font-size:0.6rem">💰 They already know you pay well</span>';
        } else if (labelLower.includes('sneak') || labelLower.includes('escape') || labelLower.includes('run')) {
          if (traits.elusive) traitFlavor = '<span style="color:#44ccff;font-size:0.6rem">💨 You\'re known for slipping away</span>';
        }
      }
      var hintLine = (hints.length > 0 || tone || traitFlavor) ?
        '<div style="font-size:0.65rem;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.1);">' +
          (tone ? tone + (hints.length > 0 ? ' | ' : '') : '') +
          hints.join(' ') +
          (traitFlavor ? '<br>' + traitFlavor : '') +
        '</div>' : '';
      return '<button class="btn btn-buy" style="margin:4px;min-width:200px;text-align:center;padding:8px 12px;" ' +
        'onclick="if(typeof resolveEncounterOutcome===\'function\') resolveEncounterOutcome(gameState,' + idx + '); render();">' +
        '<div style="font-weight:bold;">' + (choice.label || choice.text || ('Choice ' + (idx + 1))) + '</div>' +
        hintLine +
      '</button>';
    }).join('');
    choicesHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;">' + choicesHtml + '</div>';
  }

  return '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
    '<div style="background:var(--card-bg,#1a1a2e);border:2px solid var(--neon-cyan,#0ff);border-radius:12px;padding:24px;max-width:550px;width:90%;text-align:center;box-shadow:0 0 30px rgba(0,255,255,0.2);">' +
      '<div style="font-size:3em;margin-bottom:8px;">' + (enc.emoji || '⚡') + '</div>' +
      '<h2 class="neon-cyan" style="margin:0 0 8px 0;">' + (enc.name || 'Encounter') + '</h2>' +
      '<p style="color:#ccc;margin-bottom:4px;">' + (enc.description || '') + '</p>' +
      '<div style="font-size:0.7rem;color:#888;margin-bottom:8px;font-style:italic;">Choose wisely. Each option has different consequences.</div>' +
      choicesHtml +
    '</div>' +
  '</div>';
}

// ============================================================
// V6: BUSINESSES V2 SCREEN
// ============================================================
function renderBusinessesV2() {
  if (typeof BUSINESS_TYPES === 'undefined') {
    return '<div class="screen-container">' + renderToolbar() + backButton() +
      '<h2 class="section-title neon-yellow">🏢 BUSINESSES</h2>' +
      '<p class="neon-red">Business system not loaded.</p>' +
      '<button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back</button>' +
    '</div>';
  }

  var bizState = gameState.businesses || { owned: [] };
  var owned = bizState.owned || [];

  // Tab state
  if (typeof window._bizTab === 'undefined') window._bizTab = 'owned';

  var tabBar =
    '<div style="display:flex;gap:4px;margin-bottom:16px;">' +
      '<button class="btn ' + (window._bizTab === 'owned' ? 'btn-primary' : 'btn-secondary') + '" onclick="window._bizTab=\'owned\'; render();">My Businesses (' + owned.length + ')</button>' +
      '<button class="btn ' + (window._bizTab === 'available' ? 'btn-primary' : 'btn-secondary') + '" onclick="window._bizTab=\'available\'; render();">Available</button>' +
    '</div>';

  var contentHtml = '';

  if (window._bizTab === 'owned') {
    if (owned.length === 0) {
      contentHtml = '<p style="color:#888;text-align:center;padding:30px;">No businesses owned yet. Check the Available tab to purchase one.</p>';
    } else {
      contentHtml = owned.map(function(biz, idx) {
        var def = BUSINESS_TYPES.find(function(b) { return b.id === (biz.id || biz.businessId); });
        if (!def) return '';
        var dailyIncome = biz.dailyIncome || def.dailyIncomeMin || def.baseIncome || 0;
        var level = biz.level || 1;
        var canUpgrade = typeof upgradeBusiness === 'function';
        var upgradeCost = (def.upgradeCosts && def.upgradeCosts[level]) ? def.upgradeCosts[level] : (def.upgradeCost ? (def.upgradeCost * level) : (dailyIncome * 10));
        var sellValue = Math.floor((def.setupCost || def.cost || 0) * 0.5 * level);

        return '<div style="border:1px solid var(--neon-orange,#f90);border-radius:8px;padding:14px;margin-bottom:10px;background:rgba(255,153,0,0.05);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div>' +
              '<span style="font-size:1.5em;margin-right:8px;">' + (def.emoji || '🏢') + '</span>' +
              '<strong class="neon-orange">' + (def.name || biz.id) + '</strong>' +
              ' <span style="color:#888;">Lv.' + level + '</span>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div class="neon-green">$' + dailyIncome.toLocaleString() + '/day</div>' +
            '</div>' +
          '</div>' +
          (def.specialAbility ? '<div style="color:#aaa;font-size:0.85em;margin-top:6px;">✨ ' + def.specialAbility + '</div>' : '') +
          '<div style="display:flex;gap:6px;margin-top:10px;justify-content:flex-end;">' +
            (canUpgrade ? '<button class="btn btn-buy" style="font-size:0.85em;" onclick="if(typeof upgradeBusiness===\'function\') upgradeBusiness(gameState,' + idx + '); render();">⬆️ Upgrade ($' + upgradeCost.toLocaleString() + ')</button>' : '') +
            '<button class="btn btn-sell" style="font-size:0.85em;" onclick="if(typeof sellBusiness===\'function\' && confirm(\'Sell this business for $' + sellValue.toLocaleString() + '?\')) { sellBusiness(gameState,' + idx + '); render(); }">Sell ($' + sellValue.toLocaleString() + ')</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  } else {
    // Available businesses
    contentHtml = BUSINESS_TYPES.map(function(def) {
      var alreadyOwned = owned.some(function(b) { return b.id === def.id; });
      var canAfford = gameState.cash >= (def.setupCost || def.cost || 0);
      var meetsReqs = true;
      var reqText = '';
      // Check unlock act requirement
      if (def.unlockAct && gameState.campaign) {
        var currentAct = typeof gameState.campaign.currentAct === 'number' ? gameState.campaign.currentAct : parseInt(String(gameState.campaign.currentAct).replace('act','')) || 1;
        if (currentAct < def.unlockAct) {
          meetsReqs = false;
          reqText += 'Act ' + def.unlockAct + '+ needed. ';
        }
      }
      if (def.ngPlus && !gameState.ngPlus) {
        meetsReqs = false;
        reqText += 'NG+ only. ';
      }
      if (def.crewRequired && Array.isArray(gameState.henchmen) && gameState.henchmen.length < def.crewRequired) {
        meetsReqs = false;
        reqText += def.crewRequired + ' crew needed. ';
      }
      if (def.unlockRequirements) {
        if (def.unlockRequirements.reputation && (gameState.reputation || 0) < def.unlockRequirements.reputation) {
          meetsReqs = false;
          reqText += 'Rep ' + def.unlockRequirements.reputation + ' needed. ';
        }
        if (def.unlockRequirements.day && gameState.day < def.unlockRequirements.day) {
          meetsReqs = false;
          reqText += 'Day ' + def.unlockRequirements.day + '+ needed. ';
        }
      }

      var btnHtml = '';
      if (alreadyOwned) {
        btnHtml = '<span class="neon-green">✓ Owned</span>';
      } else if (!meetsReqs) {
        btnHtml = '<span class="neon-red" style="font-size:0.85em;">🔒 ' + reqText + '</span>';
      } else if (!canAfford) {
        btnHtml = '<button class="btn btn-secondary" disabled style="opacity:0.5;">$' + (def.setupCost || def.cost || 0).toLocaleString() + ' (need more cash)</button>';
      } else {
        btnHtml = '<button class="btn btn-buy" onclick="if(typeof purchaseBusiness===\'function\') purchaseBusiness(gameState,\'' + def.id + '\'); render();">Buy $' + (def.setupCost || def.cost || 0).toLocaleString() + '</button>';
      }

      return '<div style="border:1px solid ' + (alreadyOwned ? 'var(--neon-green,#0f0)' : meetsReqs ? 'var(--neon-cyan,#0ff)' : '#555') + ';border-radius:8px;padding:14px;margin-bottom:10px;background:rgba(0,0,0,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<span style="font-size:1.5em;margin-right:8px;">' + (def.emoji || '🏢') + '</span>' +
            '<strong style="color:' + (alreadyOwned ? 'var(--neon-green)' : '#fff') + ';">' + (def.name || def.id) + '</strong>' +
          '</div>' +
          '<div style="text-align:right;">' + btnHtml + '</div>' +
        '</div>' +
        '<div style="color:#aaa;font-size:0.9em;margin-top:6px;">' +
          '💰 Income: $' + (def.dailyIncomeMin ? def.dailyIncomeMin.toLocaleString() + ' - $' + (def.dailyIncomeMax || def.dailyIncomeMin).toLocaleString() : (def.incomeRange ? def.incomeRange[0].toLocaleString() + ' - $' + def.incomeRange[1].toLocaleString() : (def.baseIncome || 0).toLocaleString())) + '/day' +
          (def.setupCost ? ' | Setup: $' + def.setupCost.toLocaleString() : '') +
        '</div>' +
        (def.specialAbility ? '<div style="color:#88ccff;font-size:0.85em;margin-top:4px;">✨ ' + def.specialAbility + '</div>' : '') +
      '</div>';
    }).join('');
  }

  // Total daily income
  var totalIncome = owned.reduce(function(sum, b) { return sum + (b.dailyIncome || 0); }, 0);

  return '<div class="screen-container">' + renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#ff9900;">🏢 BUSINESSES</h2>' +
    (owned.length > 0 ? '<div style="margin-bottom:12px;"><span class="neon-green">Total Daily Income: $' + totalIncome.toLocaleString() + '</span> | <span class="neon-cyan">Businesses: ' + owned.length + '</span></div>' : '') +
    tabBar +
    contentHtml +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// V6: PHONE SCREEN
// ============================================================
function renderPhone() {
  var phoneState = gameState.phone || { inbox: [], unreadCount: 0, burnerAge: 0, maxBurnerAge: 30, phoneType: 'basic' };
  var messages = phoneState.inbox || phoneState.messages || [];
  var unreadCount = phoneState.unreadCount || 0;
  var burnerAge = phoneState.burnerAge || 0;
  var maxAge = phoneState.maxBurnerAge || 30;
  var phoneType = phoneState.phoneType || 'basic';

  // Sort messages newest first
  var sorted = messages.slice().sort(function(a, b) { return (b.day || 0) - (a.day || 0); });

  // Expanded message tracking
  if (typeof window._phoneExpanded === 'undefined') window._phoneExpanded = null;

  var phoneHeader =
    '<div style="border:1px solid var(--neon-cyan,#0ff);border-radius:8px;padding:12px;margin-bottom:16px;background:rgba(0,170,255,0.05);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div>' +
          '<span style="font-size:1.3em;">📱</span> <strong class="neon-cyan">' + (phoneType === 'encrypted' ? 'Encrypted Phone' : 'Burner Phone') + '</strong>' +
        '</div>' +
        '<div>' +
          '<span style="color:' + (burnerAge > maxAge * 0.8 ? 'var(--neon-red,#f44)' : 'var(--neon-green,#0f0)') + ';">Day ' + burnerAge + '/' + maxAge + '</span>' +
          (unreadCount > 0 ? ' <span class="badge">' + unreadCount + ' unread</span>' : '') +
        '</div>' +
      '</div>' +
      (burnerAge > maxAge * 0.7 ? '<div style="color:var(--neon-yellow,#ff0);font-size:0.85em;margin-top:6px;">⚠️ Phone getting old. Consider switching to avoid trace.</div>' : '') +
    '</div>';

  var switchButtons =
    '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
      '<button class="btn btn-secondary" style="font-size:0.85em;" onclick="if(typeof switchBurnerPhone===\'function\') switchBurnerPhone(gameState,\'basic\'); render();">🔄 New Burner ($200)</button>' +
      '<button class="btn btn-buy" style="font-size:0.85em;" onclick="if(typeof switchBurnerPhone===\'function\') switchBurnerPhone(gameState,\'encrypted\'); render();">🔐 Encrypted ($500)</button>' +
    '</div>';

  var inboxHtml = '';
  if (sorted.length === 0) {
    inboxHtml = '<p style="color:#888;text-align:center;padding:30px;">No messages yet. Contacts will reach out as your empire grows.</p>';
  } else {
    inboxHtml = sorted.map(function(msg, idx) {
      var isUnread = !msg.read;
      var isExpanded = window._phoneExpanded === idx;
      var border = isUnread ? 'var(--neon-yellow,#ff0)' : '#444';
      var bgAlpha = isUnread ? '0.08' : '0.02';

      var responseButtons = '';
      if (isExpanded && msg.responses && msg.responses.length > 0) {
        responseButtons = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">' +
          msg.responses.map(function(resp, rIdx) {
            return '<button class="btn btn-buy" style="font-size:0.85em;" ' +
              'onclick="event.stopPropagation(); if(typeof respondToMessage===\'function\') respondToMessage(gameState,' + (messages.indexOf(msg)) + ',' + rIdx + '); render();">' +
              (resp.label || resp.text || 'Reply ' + (rIdx + 1)) +
            '</button>';
          }).join('') +
        '</div>';
      }
      // Show result after responding
      var resultDisplay = '';
      if (isExpanded && msg._resultMsg) {
        resultDisplay = '<div style="margin-top:10px;padding:10px;border:1px solid var(--neon-green,#0f0);border-radius:6px;background:rgba(0,255,100,0.08);">' +
          '<strong style="color:var(--neon-green);">Result:</strong> ' +
          '<span style="color:#ccc;">' + msg._resultMsg + '</span>' +
        '</div>';
      }

      return '<div style="border:1px solid ' + border + ';border-radius:6px;padding:10px;margin-bottom:6px;cursor:pointer;background:rgba(255,255,0,' + bgAlpha + ');" ' +
        'onclick="window._phoneExpanded=' + (isExpanded ? 'null' : idx) + '; if(typeof markMessageRead===\'function\') markMessageRead(gameState,' + messages.indexOf(msg) + '); render();">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div>' +
            '<span style="margin-right:6px;">' + (msg.emoji || '💬') + '</span>' +
            '<strong style="' + (isUnread ? 'color:var(--neon-yellow);' : 'color:#ccc;') + '">' + (msg.from || 'Unknown') + '</strong>' +
          '</div>' +
          '<span style="color:#888;font-size:0.8em;">Day ' + (msg.day || '?') + '</span>' +
        '</div>' +
        '<div style="color:#aaa;font-size:0.9em;margin-top:4px;' + (isUnread ? 'font-weight:bold;color:#ddd;' : '') + '">' +
          (isExpanded ? (msg.text || msg.preview || '') : (msg.preview || (msg.text || '').substring(0, 60) + ((msg.text || '').length > 60 ? '...' : ''))) +
        '</div>' +
        responseButtons +
        resultDisplay +
      '</div>';
    }).join('');
  }

  return '<div class="screen-container">' + renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#00aaff;">📱 PHONE</h2>' +
    phoneHeader +
    switchButtons +
    '<h3 class="neon-cyan">Inbox</h3>' +
    inboxHtml +
    '<button class="btn btn-secondary" style="margin-top:12px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}

// ============================================================
// V6: NPC STORY SCREEN
// ============================================================
function renderNPCStory() {
  var npcState = (typeof getActiveNPCStoryForUI === 'function') ? getActiveNPCStoryForUI(gameState) : (gameState.npcStory || null);

  if (!npcState) {
    return '<div class="screen-container">' + renderToolbar() + backButton() +
      '<h2 class="section-title neon-yellow">📖 NPC STORY</h2>' +
      '<p style="color:#888;text-align:center;padding:30px;">No active story event right now.</p>' +
      '<button class="btn btn-secondary" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
    '</div>';
  }

  var npc = npcState.npc || {};
  var chapter = npcState.chapter || {};
  var choices = npcState.choices || chapter.choices || [];

  // NPC portrait
  var portrait =
    '<div style="text-align:center;margin-bottom:16px;">' +
      '<div style="font-size:4em;margin-bottom:4px;">' + (npc.emoji || '🧑') + '</div>' +
      '<div class="neon-cyan" style="font-size:1.2em;font-weight:bold;">' + (npc.name || 'Unknown') + '</div>' +
      (npc.role ? '<div style="color:#888;font-size:0.9em;">' + npc.role + '</div>' : '') +
    '</div>';

  // Chapter content
  var chapterTitle = chapter.title ? '<h3 class="neon-yellow" style="text-align:center;">' + chapter.title + '</h3>' : '';
  var description =
    '<div style="border:1px solid #444;border-radius:8px;padding:16px;margin:12px 0;background:rgba(255,255,255,0.02);line-height:1.6;">' +
      (chapter.description || npcState.dialogue || npcState.description || 'The NPC regards you silently...') +
    '</div>';

  // Choices or result
  var actionHtml = '';
  if (npcState.resolved || npcState.outcomeShown) {
    actionHtml =
      '<div style="border:1px solid var(--neon-green,#0f0);border-radius:6px;padding:12px;margin:12px 0;background:rgba(0,255,100,0.05);">' +
        '<p style="color:var(--neon-green);font-weight:bold;">Result</p>' +
        '<p>' + (npcState.resultText || npcState.outcome || 'The story continues...') + '</p>' +
      '</div>' +
      '<button class="btn btn-primary" onclick="if(typeof dismissNPCStory===\'function\') dismissNPCStory(gameState); currentScreen=\'game\'; render();">Continue</button>';
  } else {
    actionHtml = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">' +
      choices.map(function(c, idx) {
        return '<button class="btn btn-buy" style="text-align:left;padding:10px 16px;" ' +
          'onclick="if(typeof resolveNPCStoryChoice===\'function\') resolveNPCStoryChoice(gameState,' + idx + '); render();">' +
          (c.emoji ? c.emoji + ' ' : '') + (c.label || c.text || 'Choice ' + (idx + 1)) +
          (c.hint ? ' <span style="color:#888;font-size:0.85em;">(' + c.hint + ')</span>' : '') +
        '</button>';
      }).join('') +
    '</div>';
  }

  return '<div class="screen-container">' + renderToolbar() + backButton() +
    '<h2 class="section-title" style="color:#ffaa00;">📖 NPC STORY</h2>' +
    portrait +
    chapterTitle +
    description +
    actionHtml +
    '<button class="btn btn-secondary" style="margin-top:16px;" onclick="currentScreen=\'game\'; render();">← Back to Streets</button>' +
  '</div>';
}
