// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Tutorial System
// Guided onboarding + first-open screen hints
// ============================================================

(function() {

// ---- TUTORIAL DRUG PICKER ----
// Find the cheapest drug the player can afford (at least 1 unit)
function getTutorialDrug() {
  if (!gameState || !gameState.prices) return 'weed';
  var best = null;
  var bestPrice = Infinity;
  var cash = gameState.cash || 0;
  for (var id in gameState.prices) {
    var p = gameState.prices[id];
    if (p > 0 && p <= cash && p < bestPrice) {
      best = id;
      bestPrice = p;
    }
  }
  return best || 'weed';
}

function getTutorialDrugName() {
  var id = getTutorialDrug();
  if (typeof DRUGS !== 'undefined') {
    var d = DRUGS.find(function(x) { return x.id === id; });
    if (d) return d.name;
  }
  return id.charAt(0).toUpperCase() + id.slice(1);
}

// Track which drug the player actually bought during tutorial
var tutorialBoughtDrug = null;

// ---- GUIDED TUTORIAL STEPS ----
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'WELCOME TO MIAMI',
    getText: function() { return 'You just arrived in Miami with <b>$' + (gameState ? gameState.cash : '2,000') + '</b> and a dream. The key to success? <b>Buy drugs cheap, sell when prices rise.</b> Let me show you the basics.'; },
    action: 'next',
  },
  {
    id: 'go_buysell',
    title: 'OPEN THE MARKET',
    text: 'Click the <b>Buy / Sell</b> tab above to see what drugs are available at this location.',
    waitFor: function() { return typeof mainTab !== 'undefined' && mainTab === 'buysell'; },
  },
  {
    id: 'buy_drug',
    title: 'MAKE YOUR FIRST BUY',
    getText: function() { return 'Find a drug you can afford and click the <b>BUY</b> button next to it. <b>' + getTutorialDrugName() + '</b> at $' + (gameState.prices[getTutorialDrug()] || '?') + ' looks like a good deal!'; },
    waitFor: function() { return typeof selectedDrug !== 'undefined' && selectedDrug && tradeMode === 'buy'; },
  },
  {
    id: 'confirm_buy',
    title: 'PURCHASE THE GOODS',
    text: 'Set your amount (try spending about half your cash) and click the <b>BUY</b> button to confirm the purchase.',
    waitFor: function() {
      if (!gameState || !gameState.inventory) return false;
      for (var id in gameState.inventory) {
        if (gameState.inventory[id] > 0) {
          tutorialBoughtDrug = id;
          return true;
        }
      }
      return false;
    },
  },
  {
    id: 'wait_day',
    title: 'WAIT FOR PRICES TO CHANGE',
    getText: function() {
      var name = tutorialBoughtDrug ? (typeof DRUGS !== 'undefined' ? (DRUGS.find(function(x) { return x.id === tutorialBoughtDrug; }) || {}).name || tutorialBoughtDrug : tutorialBoughtDrug) : 'your drug';
      return 'Now click <b>Wait</b> in the sidebar to advance a day. Drug prices fluctuate daily \u2014 and today, <b>' + name + '</b> prices will rise!';
    },
    waitFor: function() { return gameState && gameState.day > 1; },
    beforeWait: true,
  },
  {
    id: 'see_profit',
    title: 'SELL FOR PROFIT',
    getText: function() {
      var name = tutorialBoughtDrug ? (typeof DRUGS !== 'undefined' ? (DRUGS.find(function(x) { return x.id === tutorialBoughtDrug; }) || {}).name || tutorialBoughtDrug : tutorialBoughtDrug) : 'your drug';
      return 'Prices went up! Now click the <b>SELL</b> button next to <b>' + name + '</b> to lock in your profit.';
    },
    waitFor: function() { return typeof selectedDrug !== 'undefined' && selectedDrug && tradeMode === 'sell'; },
  },
  {
    id: 'complete_sell',
    title: 'CLOSE THE DEAL',
    text: 'Set the amount to sell (try selling everything) and click <b>SELL</b> to complete the trade.',
    waitFor: function() {
      if (!gameState || !gameState.inventory) return false;
      // Check if the player has sold everything they bought
      if (tutorialBoughtDrug) return !gameState.inventory[tutorialBoughtDrug] || gameState.inventory[tutorialBoughtDrug] === 0;
      // Fallback: no inventory at all
      for (var id in gameState.inventory) {
        if (gameState.inventory[id] > 0) return false;
      }
      return true;
    },
  },
  {
    id: 'tutorial_done',
    title: 'YOU\'RE A DEALER NOW',
    text: 'Congratulations on your first deal! Now explore the <b>sidebar tabs</b> \u2014 build a crew, buy property, run operations, and rise to the top of Miami\'s underworld. Each tab has tips when you open it for the first time. Good luck!',
    action: 'finish',
  },
];

// ---- FIRST-OPEN SCREEN HINTS ----
const SCREEN_HINTS = {
  travel:      { title: 'Travel', text: 'Move between Miami locations to find better prices. Each area has different drugs available and different price ranges. Travel costs a day.' },
  crew:        { title: 'Crew', text: 'Hire crew members to fight alongside you, boost your income, and unlock special abilities. A strong crew is key to survival.' },
  fronts:      { title: 'Fronts', text: 'Laundering businesses that convert dirty money into clean cash. Essential for avoiding investigation and reducing heat.' },
  properties:  { title: 'Properties', text: 'Buy real estate across Miami for passive income and stash storage. Properties appreciate in value over time.' },
  businesses_v2: { title: 'Businesses', text: 'Legitimate and not-so-legitimate businesses that generate daily income. Upgrade them to earn more.' },
  futures:     { title: 'Futures Trading', text: 'Bet on future drug prices for big profits or devastating losses. High risk, high reward.' },
  imports:     { title: 'Import / Export', text: 'Ship drugs internationally for massive profit margins. Longer transit times but much higher returns.' },
  factions:    { title: 'Factions', text: 'Miami\'s criminal organizations. Build alliances for bonuses or go to war for territory. Your reputation with each faction matters.' },
  rivals:      { title: 'Rivals', text: 'Competing dealers who want your turf. Eliminate them or they\'ll undercut your business and attack your operations.' },
  defense:     { title: 'Territory Defense', text: 'Defend your turf from attacks. Build fortifications and station crew to protect your empire.' },
  bodies:      { title: 'Body Disposal', text: 'Bodies attract attention. Dispose of them quickly before the police investigate. Multiple disposal methods available.' },
  operations:  { title: 'Operations', text: 'Run organized crime operations like smuggling rings, protection rackets, and money laundering networks.' },
  heist:       { title: 'Heists', text: 'Plan and execute high-stakes heists for huge payouts. Requires careful preparation and a skilled crew.' },
  romance:     { title: 'Romance', text: 'Build relationships with NPCs for unique benefits, story arcs, and gameplay bonuses.' },
  nightlife:   { title: 'Nightlife', text: 'Hit the clubs to reduce stress, build connections, and discover new opportunities. Networking is everything in Miami.' },
  phone:       { title: 'Phone', text: 'Check messages from contacts, rivals, and story characters. Responding to messages has real consequences \u2014 deals, threats, and opportunities.' },
  lifestyle:   { title: 'Lifestyle', text: 'Manage your stress and spending habits. High stress reduces effectiveness. Live large or stay humble \u2014 your choice.' },
  safehouse:   { title: 'Safe House', text: 'Your home base. Upgrade your safe house for better security, more stash space, and crew quarters.' },
  vehicles:    { title: 'Vehicles', text: 'Buy vehicles for faster travel, more inventory space, and better escape chances during encounters.' },
  shipping:    { title: 'Shipping', text: 'Set up shipping routes to automatically move product between your territories for passive income.' },
  security:    { title: 'Security', text: 'Monitor your heat level, investigation progress, and upcoming raids. Invest in security to protect your empire.' },
  politics:    { title: 'Politics', text: 'Bribe politicians, fund campaigns, and influence local policy. Political connections can make you untouchable.' },
  distribution:{ title: 'Distribution', text: 'Set up dealer networks to automatically sell drugs in your territories. Passive income that scales with your empire.' },
  processing:  { title: 'Processing Lab', text: 'Process raw materials into higher-value drugs. Cooking increases profit margins significantly.' },
  stash:       { title: 'Stash', text: 'Store drugs at this location to free up inventory space. Stashed drugs are safer from police encounters during travel.' },
  blackmarket: { title: 'Black Market', text: 'Buy weapons, equipment, and special items. Better gear means better outcomes in combat and encounters.' },
  missions:    { title: 'Missions', text: 'Story missions and side jobs that earn cash, reputation, and unlock new features. Check back regularly for new opportunities.' },
  skilltree:   { title: 'Skill Tree', text: 'Spend skill points to unlock permanent upgrades. Specialize in combat, business, stealth, or social skills.' },
  stats:       { title: 'Statistics', text: 'Track your empire\'s progress \u2014 total earnings, drugs traded, people dealt with, and more.' },
  achievements:{ title: 'Achievements', text: 'Unlock achievements by hitting milestones. Achievements persist across playthroughs and grant bragging rights.' },
  campaign:    { title: 'Campaign', text: 'The main story campaign. Follow the narrative to unlock Miami\'s biggest opportunities and face its toughest challenges.' },
};

const TAB_HINTS = {
  portfolio: { title: 'Portfolio', text: 'Track your net worth, drug holdings, and financial assets all in one place. Watch your empire grow.' },
  buysell:   { title: 'Buy / Sell', text: 'The main trading floor. Buy drugs at low prices and sell high to make profit. Prices change daily based on supply and demand.' },
  prices:    { title: 'Street Prices', text: 'Compare current drug prices across all locations. Use this to find the best deals and plan your next move.' },
};

// ---- STATE HELPERS ----
function getTutorial() {
  if (!gameState || !gameState.tutorial) return null;
  return gameState.tutorial;
}

function isTutorialActive() {
  var t = getTutorial();
  return t && t.active && !t.completed;
}

// ---- RENDER TUTORIAL OVERLAY ----
window.renderTutorialOverlay = function() {
  var t = getTutorial();
  if (!t) return '';

  // First-open hint popup (smaller, dismissible)
  if (t.pendingHint && !t.active) {
    var hint = t.pendingHint;
    return '<div class="tutorial-hint-overlay" onclick="dismissTutorialHint()">' +
      '<div class="tutorial-hint-card" onclick="event.stopPropagation()">' +
        '<div class="tutorial-hint-title">' + hint.title + '</div>' +
        '<div class="tutorial-hint-text">' + hint.text + '</div>' +
        '<button class="btn btn-primary" onclick="dismissTutorialHint()" style="margin-top:0.8rem;width:100%">Got it!</button>' +
      '</div>' +
    '</div>';
  }

  // Guided steps
  if (!t.active) return '';
  var step = TUTORIAL_STEPS[t.step];
  if (!step) return '';

  var totalSteps = TUTORIAL_STEPS.length;
  var progress = '';
  for (var i = 0; i < totalSteps; i++) {
    progress += '<span class="tutorial-dot' + (i === t.step ? ' active' : (i < t.step ? ' done' : '')) + '"></span>';
  }

  var buttons = '';
  var isBlocking = step.action === 'next' || step.action === 'finish';
  if (step.action === 'next') {
    buttons = '<button class="btn btn-primary" onclick="advanceTutorialStep()" style="width:100%">Next \u2192</button>';
  } else if (step.action === 'finish') {
    buttons = '<button class="btn btn-primary" onclick="finishTutorial()" style="width:100%">Start Playing! \u{1f680}</button>';
  } else {
    buttons = '';
  }

  // For waitFor steps: floating banner at top (non-blocking, player can interact with game)
  // For next/finish steps: full-screen overlay (blocking)
  if (!isBlocking) {
    return '<div class="tutorial-banner">' +
      '<div class="tutorial-banner-content">' +
        '<div class="tutorial-banner-step">Step ' + (t.step + 1) + '/' + totalSteps + '</div>' +
        '<div class="tutorial-banner-title">' + step.title + '</div>' +
        '<div class="tutorial-banner-text">' + (step.getText ? step.getText() : step.text) + '</div>' +
        '<div class="tutorial-progress" style="margin:0.4rem 0 0">' + progress + '</div>' +
      '</div>' +
      '<button class="tutorial-skip" onclick="skipTutorial()" style="margin:0;color:#888;font-size:0.7rem">Skip</button>' +
    '</div>';
  }

  return '<div class="tutorial-overlay">' +
    '<div class="tutorial-card">' +
      '<div class="tutorial-step-label">TUTORIAL \u2014 Step ' + (t.step + 1) + ' of ' + totalSteps + '</div>' +
      '<div class="tutorial-title">' + step.title + '</div>' +
      '<div class="tutorial-text">' + (step.getText ? step.getText() : step.text) + '</div>' +
      '<div class="tutorial-progress">' + progress + '</div>' +
      buttons +
      '<button class="tutorial-skip" onclick="skipTutorial()">Skip Tutorial</button>' +
    '</div>' +
  '</div>';
};

// ---- STEP ADVANCEMENT ----
window.advanceTutorialStep = function() {
  var t = getTutorial();
  if (!t) return;
  t.step++;
  if (t.step >= TUTORIAL_STEPS.length) {
    finishTutorial();
    return;
  }
  render();
};

window.finishTutorial = function() {
  var t = getTutorial();
  if (!t) return;
  t.active = false;
  t.completed = false; // Not fully completed — still show first-open hints
  render();
};

window.skipTutorial = function() {
  var t = getTutorial();
  if (!t) return;
  t.active = false;
  t.completed = false; // Still show first-open hints
  render();
};

window.dismissTutorialHint = function() {
  var t = getTutorial();
  if (!t) return;
  t.pendingHint = null;
  var injected = document.getElementById('tutorial-hint-inject');
  if (injected) injected.remove();
  render();
};

// ---- CHECK PROGRESS (called after each render) ----
function checkTutorialProgress() {
  var t = getTutorial();
  if (!t || !t.active) return;
  var step = TUTORIAL_STEPS[t.step];
  if (!step || !step.waitFor) return;
  try {
    if (step.waitFor()) {
      t.step++;
      if (t.step >= TUTORIAL_STEPS.length) {
        finishTutorial();
        return;
      }
      // Re-render to show next step
      setTimeout(function() { render(); }, 50);
    }
  } catch (e) {
    // Ignore errors in waitFor checks
  }
}

// ---- FIRST-OPEN HINT DETECTION ----
function checkFirstOpenHints() {
  var t = getTutorial();
  if (!t || t.active || t.pendingHint) return; // Don't show hints during guided steps or if one is pending
  if (t.completed) return; // All done

  // Check if enough time has passed to stop hints (day > 30 and all guided steps done)
  if (gameState.day > 30) {
    t.completed = true;
    return;
  }

  // Check current screen
  if (typeof currentScreen !== 'undefined' && currentScreen !== 'game') {
    if (SCREEN_HINTS[currentScreen] && !t.screensSeen[currentScreen]) {
      t.screensSeen[currentScreen] = true;
      t.pendingHint = SCREEN_HINTS[currentScreen];
      return;
    }
  }

  // Check main tab (only on game screen)
  if (typeof currentScreen !== 'undefined' && currentScreen === 'game' && typeof mainTab !== 'undefined') {
    if (TAB_HINTS[mainTab] && !t.tabsSeen[mainTab]) {
      t.tabsSeen[mainTab] = true;
      t.pendingHint = TAB_HINTS[mainTab];
      return;
    }
  }
}

// ---- WRAP render() TO HOOK IN TUTORIAL CHECKS ----
var _origRender = window.render;
window.render = function() {
  // Check for first-open hints before rendering (so the hint gets rendered this pass)
  checkFirstOpenHints();
  // Call original render
  _origRender();
  // Check guided step progress after render
  checkTutorialProgress();
  // For sub-screens (not 'game'), inject hint overlay via DOM since renderGame() isn't called
  var t = getTutorial();
  if (t && t.pendingHint && !t.active && typeof currentScreen !== 'undefined' && currentScreen !== 'game') {
    var hint = t.pendingHint;
    var existing = document.getElementById('tutorial-hint-inject');
    if (!existing) {
      var div = document.createElement('div');
      div.id = 'tutorial-hint-inject';
      div.innerHTML = '<div class="tutorial-hint-overlay" onclick="dismissTutorialHint()">' +
        '<div class="tutorial-hint-card" onclick="event.stopPropagation()">' +
          '<div class="tutorial-hint-title">' + hint.title + '</div>' +
          '<div class="tutorial-hint-text">' + hint.text + '</div>' +
          '<button class="btn btn-primary" onclick="dismissTutorialHint()" style="margin-top:0.8rem;width:100%">Got it!</button>' +
        '</div></div>';
      document.body.appendChild(div);
    }
  }
};

// ---- WRAP doWait() TO FORCE BOUGHT DRUG PRICE RISE ----
var _origDoWait = window.doWait;
window.doWait = function() {
  var t = getTutorial();
  if (t && t.active) {
    var step = TUTORIAL_STEPS[t.step];
    if (step && step.beforeWait && tutorialBoughtDrug) {
      // Store current price of the drug they bought so we can force it up
      t._priceOverride = {
        drugId: tutorialBoughtDrug,
        oldPrice: gameState.prices ? gameState.prices[tutorialBoughtDrug] : null,
      };
    }
  }
  _origDoWait();
  // After wait, force drug price up if we're on the right step
  if (t && t._priceOverride && t._priceOverride.oldPrice) {
    var oldP = t._priceOverride.oldPrice;
    var newP = Math.round(oldP * (1.4 + Math.random() * 0.4));
    if (gameState.prices) {
      gameState.prices[t._priceOverride.drugId] = newP;
    }
    t._priceOverride = null;
  }
};

})();
