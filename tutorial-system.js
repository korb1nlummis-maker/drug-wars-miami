// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Comprehensive Tutorial System
// 20+ guided steps, glowing highlights, rewards, and first-open hints
// ============================================================

(function() {

// ---- INJECT TUTORIAL CSS (highlight glow, animations) ----
var styleEl = document.createElement('style');
styleEl.id = 'tutorial-injected-css';
styleEl.textContent = [
  // Pulsing neon glow highlight applied to targeted UI elements
  '@keyframes tutorialPulse {',
  '  0% { box-shadow: 0 0 8px 2px rgba(0,240,255,0.5), 0 0 16px 4px rgba(0,240,255,0.25); transform: scale(1); }',
  '  50% { box-shadow: 0 0 16px 6px rgba(0,240,255,0.8), 0 0 32px 10px rgba(0,240,255,0.4); transform: scale(1.03); }',
  '  100% { box-shadow: 0 0 8px 2px rgba(0,240,255,0.5), 0 0 16px 4px rgba(0,240,255,0.25); transform: scale(1); }',
  '}',
  '@keyframes tutorialPulsePink {',
  '  0% { box-shadow: 0 0 8px 2px rgba(255,45,149,0.5), 0 0 16px 4px rgba(255,45,149,0.25); }',
  '  50% { box-shadow: 0 0 16px 6px rgba(255,45,149,0.8), 0 0 32px 10px rgba(255,45,149,0.4); }',
  '  100% { box-shadow: 0 0 8px 2px rgba(255,45,149,0.5), 0 0 16px 4px rgba(255,45,149,0.25); }',
  '}',
  '@keyframes tutorialArrowBob {',
  '  0%, 100% { transform: translateY(0); }',
  '  50% { transform: translateY(-8px); }',
  '}',
  '@keyframes tutorialRewardPop {',
  '  0% { transform: scale(0.5); opacity: 0; }',
  '  50% { transform: scale(1.15); opacity: 1; }',
  '  100% { transform: scale(1); opacity: 1; }',
  '}',
  '@keyframes tutorialProgressFill {',
  '  from { width: 0; }',
  '}',
  '.tutorial-highlight {',
  '  animation: tutorialPulse 1.5s ease-in-out infinite !important;',
  '  border-color: var(--neon-cyan, #00f0ff) !important;',
  '  position: relative;',
  '  z-index: 9998 !important;',
  '}',
  '.tutorial-highlight-pink {',
  '  animation: tutorialPulsePink 1.5s ease-in-out infinite !important;',
  '  border-color: var(--neon-pink, #ff2d95) !important;',
  '  position: relative;',
  '  z-index: 9998 !important;',
  '}',
  '.tutorial-reward-toast {',
  '  position: fixed; top: 18%; left: 50%; transform: translateX(-50%);',
  '  z-index: 10002; padding: 0.8rem 1.6rem; border-radius: 10px;',
  '  background: linear-gradient(135deg, #1a1a3e, #252560);',
  '  border: 2px solid var(--neon-green, #39ff14);',
  '  color: var(--neon-green, #39ff14); font-weight: bold;',
  '  font-size: 1.1rem; text-shadow: 0 0 12px rgba(57,255,20,0.5);',
  '  box-shadow: 0 0 30px rgba(57,255,20,0.3);',
  '  animation: tutorialRewardPop 0.5s ease; pointer-events: none;',
  '}',
  '.tutorial-progress-bar {',
  '  width: 100%; height: 6px; background: #222244; border-radius: 3px;',
  '  margin: 0.8rem 0 0.4rem; overflow: hidden;',
  '}',
  '.tutorial-progress-fill {',
  '  height: 100%; border-radius: 3px;',
  '  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-green));',
  '  transition: width 0.5s ease;',
  '}',
  '.tutorial-arrow-indicator {',
  '  font-size: 1.8rem; color: var(--neon-cyan, #00f0ff);',
  '  text-shadow: 0 0 10px rgba(0,240,255,0.6);',
  '  animation: tutorialArrowBob 1s ease-in-out infinite;',
  '  display: inline-block; margin-bottom: 0.3rem;',
  '}',
  '.tutorial-step-badge {',
  '  display: inline-block; background: var(--neon-cyan, #00f0ff); color: #000;',
  '  font-weight: 900; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px;',
  '  margin-right: 0.4rem; letter-spacing: 0.05em;',
  '}',
  '.tutorial-interactive-badge {',
  '  display: inline-block; background: var(--neon-pink, #ff2d95); color: #fff;',
  '  font-weight: 700; font-size: 0.65rem; padding: 2px 6px; border-radius: 8px;',
  '  margin-left: 0.4rem; letter-spacing: 0.05em;',
  '}',
].join('\n');
document.head.appendChild(styleEl);


// ---- TUTORIAL DRUG PICKER (buy the cheapest affordable drug) ----
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

var tutorialBoughtDrug = null;


// ---- STEP REWARD DEFINITIONS ----
var STEP_REWARDS = {
  0:  { cash: 500,  label: '+$500' },
  1:  { cash: 500,  label: '+$500' },
  2:  { cash: 500,  label: '+$500' },
  3:  { cash: 500,  label: '+$500' },
  4:  { cash: 500,  label: '+$500' },
  5:  { cash: 750,  label: '+$750' },
  6:  { cash: 750,  label: '+$750' },
  7:  { cash: 750,  label: '+$750' },
  8:  { cash: 750,  label: '+$750 + 👥 Rookie Lookout (crew member - watches for cops)', special: 'crew' },
  9:  { cash: 750,  label: '+$750' },
  10: { cash: 1000, label: '+$1,000' },
  11: { cash: 1000, label: '+$1,000' },
  12: { cash: 1000, label: '+$1,000 + 🔫 Starter Pistol (15 dmg, 70% accuracy)', special: 'weapon' },
  13: { cash: 1000, label: '+$1,000' },
  14: { cash: 1000, label: '+$1,000' },
  15: { cash: 1500, label: '+$1,500' },
  16: { cash: 1500, label: '+$1,500' },
  17: { cash: 1500, label: '+$1,500' },
  18: { cash: 1500, label: '+$1,500' },
  19: { cash: 1500, label: '+$1,500' },
};


// ---- 20 GUIDED TUTORIAL STEPS ----
var TUTORIAL_STEPS = [
  // === STEP 0: Welcome ===
  {
    id: 'welcome',
    title: 'WELCOME TO MIAMI',
    getText: function() {
      return 'You just arrived in Miami with <b>$' + (gameState ? gameState.cash.toLocaleString() : '1,500') + '</b> in cash and <b>$5,000</b> in debt to a loan shark. ' +
        'Your goal? Build a drug empire from nothing. The character you chose determines your starting bonuses and play style. ' +
        'Let me walk you through everything you need to survive.';
    },
    action: 'next',
    highlight: null,
    arrowText: null,
  },
  // === STEP 1: The Market ===
  {
    id: 'read_market',
    title: 'THE MARKET',
    getText: function() {
      return 'Click the <b>Buy / Sell</b> tab above the main area. This is where you see current drug prices at your location. ' +
        'Prices change every day and every location has different rates. Watch for <b>price events</b> -- busts crash prices, shortages spike them.';
    },
    action: 'wait',
    waitFor: function() { return typeof mainTab !== 'undefined' && mainTab === 'buysell'; },
    highlightSelector: '.main-tab-btn',
    highlightMatch: 'Buy / Sell',
    arrowText: 'Click this tab',
  },
  // === STEP 2: Buying Drugs ===
  {
    id: 'buy_drug',
    title: 'BUYING DRUGS',
    getText: function() {
      return 'See the drug list? Each row shows the drug name, current price, and your inventory. ' +
        'Find an affordable drug and click the <b>BUY</b> button next to it. <b>' + getTutorialDrugName() + '</b> is a good starter choice.';
    },
    action: 'wait',
    interactive: true,
    waitFor: function() { return typeof selectedDrug !== 'undefined' && selectedDrug && tradeMode === 'buy'; },
    highlightSelector: '.btn-buy',
    arrowText: 'Click BUY on any drug',
  },
  // === STEP 3: Confirm Purchase (interactive) ===
  {
    id: 'confirm_buy',
    title: 'COMPLETE YOUR PURCHASE',
    getText: function() {
      return 'Set the amount you want to buy (try spending about <b>half your cash</b> -- never go all-in). ' +
        'Then click the <b>BUY</b> button in the trade dialog to confirm. This is your first deal!';
    },
    action: 'wait',
    interactive: true,
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
    highlightSelector: '#tradeAmount',
    arrowText: 'Enter amount and confirm',
  },
  // === STEP 4: Selling Drugs (interactive) ===
  {
    id: 'sell_drug',
    title: 'SELLING FOR PROFIT',
    getText: function() {
      var name = tutorialBoughtDrug ? getDrugDisplayName(tutorialBoughtDrug) : 'your drug';
      return 'Now click the <b>SELL</b> button next to <b>' + name + '</b> in the drug list. ' +
        'Selling at a higher price than you bought is how you make money. Prices change every day, so timing matters!';
    },
    action: 'wait',
    interactive: true,
    waitFor: function() { return typeof selectedDrug !== 'undefined' && selectedDrug && tradeMode === 'sell'; },
    highlightSelector: '.btn-sell',
    arrowText: 'Click SELL',
  },
  // === STEP 5: Travel (interactive) ===
  {
    id: 'travel',
    title: 'TRAVEL TO A NEW DISTRICT',
    getText: function() {
      return 'Different locations have different prices. Click the <b>Travel</b> button in the sidebar to see available destinations. ' +
        'Moving to a new area costs one day but opens new opportunities. Buy low here, sell high there!';
    },
    action: 'wait',
    interactive: true,
    waitFor: function() { return typeof currentScreen !== 'undefined' && currentScreen === 'travel'; },
    highlightSelector: '.btn-sidebar.btn-primary.btn-glow',
    arrowText: 'Click Travel',
  },
  // === STEP 6: Buy Low Sell High ===
  {
    id: 'buy_low_sell_high',
    title: 'THE CORE LOOP: BUY LOW, SELL HIGH',
    getText: function() {
      return 'This is the heart of the game. Every location prices drugs differently, and prices fluctuate daily. ' +
        '<b>Buy drugs where they are cheap</b> (source cities like Bogota, Kabul) and <b>sell where demand is high</b> (rich cities like Tokyo, London). ' +
        'Watch for price events -- a <b>bust</b> crashes a drug\'s price (buy!), a <b>shortage</b> spikes it (sell!).';
    },
    action: 'next',
    highlight: null,
    arrowText: null,
  },
  // === STEP 7: Inventory and Stash ===
  {
    id: 'inventory_management',
    title: 'INVENTORY MANAGEMENT',
    getText: function() {
      var cap = gameState ? (gameState.maxInventory || 200) : 200;
      return 'You can carry <b>' + cap + ' units</b> of drugs at a time. Upgrade your carry capacity with better vehicles and safe houses. ' +
        'Use the <b>Stash</b> to store excess drugs at your current location -- stashed drugs are safer from police encounters during travel. ' +
        'Managing your inventory wisely is key to maximizing profits.';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Stash',
    arrowText: 'Your stash is in the sidebar',
  },
  // === STEP 8: Heat System ===
  {
    id: 'heat_system',
    title: 'THE HEAT SYSTEM',
    getText: function() {
      var heat = gameState ? gameState.heat : 0;
      return 'Your <b>Heat</b> level is currently <b>' + heat + '%</b>. Heat rises when you deal drugs, commit crimes, and attract attention. ' +
        'High heat means more police encounters, raids, and investigations. <b>Reduce heat</b> by: laying low (waiting), using front businesses to launder money, ' +
        'bribing officials, or leaving town. If heat hits 100%, expect a RAID.';
    },
    action: 'next',
    highlight: null,
    arrowText: null,
  },
  // === STEP 9: Crew ===
  {
    id: 'crew',
    title: 'HIRING YOUR CREW',
    getText: function() {
      return 'Every kingpin needs muscle. Open the <b>People & Social</b> group in the sidebar and look for <b>Crew</b>. ' +
        'Crew members fight alongside you in combat, boost your dealing efficiency, and unlock special abilities. ' +
        'Types include: <b>Enforcers</b> (combat), <b>Dealers</b> (income), <b>Lookouts</b> (heat reduction), and <b>Chemists</b> (processing). ' +
        'As a reward for this step, you get a <b>free crew member</b>!';
    },
    action: 'next',
    highlightSelector: '.sidebar-group-header',
    highlightMatch: 'People & Social',
    arrowText: 'Open this group',
  },
  // === STEP 10: Front Businesses ===
  {
    id: 'fronts',
    title: 'FRONT BUSINESSES',
    getText: function() {
      return 'Front businesses are your <b>money laundering</b> operations. Open the <b>Money & Trade</b> group and find <b>Fronts</b>. ' +
        'Fronts convert dirty drug money into clean, legitimate cash. They also generate <b>passive income</b> daily. ' +
        'Common fronts include car washes, nightclubs, and restaurants. Each front also reduces your heat over time.';
    },
    action: 'next',
    highlightSelector: '.sidebar-group-header',
    highlightMatch: 'Money & Trade',
    arrowText: 'Open this group',
  },
  // === STEP 11: Laundering Explained ===
  {
    id: 'laundering',
    title: 'WHY LAUNDERING MATTERS',
    getText: function() {
      return 'All drug money is <b>dirty cash</b>. If you try to spend too much dirty money at once, you attract federal investigation. ' +
        'Laundering turns dirty money into clean money through your front businesses. Clean money can be freely spent on properties, upgrades, ' +
        'and bribes without raising suspicion. The more fronts you own, the faster you can launder.';
    },
    action: 'next',
    highlight: null,
    arrowText: null,
  },
  // === STEP 12: Skills ===
  {
    id: 'skills',
    title: 'SKILL TREES',
    getText: function() {
      var pts = gameState ? (gameState.skillPoints || 0) : 0;
      return 'You earn <b>skill points</b> by leveling up (you have <b>' + pts + '</b> now). Open <b>Skills</b> in the CHARACTER section of the sidebar. ' +
        'Four skill branches: <b>Combat</b> (fighting power), <b>Business</b> (more profits), <b>Stealth</b> (less heat), and <b>Social</b> (better prices, crew bonuses). ' +
        'Each skill has multiple tiers. Choose wisely -- skills define your play style!';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Skills',
    arrowText: 'Find Skills here',
  },
  // === STEP 13: Territory ===
  {
    id: 'territory',
    title: 'CLAIMING TERRITORY',
    getText: function() {
      return 'As you grow more powerful, you can <b>take over territories</b>. Look for the <b>Take Over</b> button in locations controlled by rival gangs. ' +
        'Owning territory gives you: <b>passive income</b> from drug sales, <b>stash houses</b>, and <b>strategic control</b>. ' +
        'But beware -- other gangs will try to take your turf back! Use the <b>Defense</b> screen to fortify your territory. ' +
        'As a reward, you get a <b>free weapon</b>!';
    },
    action: 'next',
    highlightSelector: '.sidebar-group-header',
    highlightMatch: 'Crime & Territory',
    arrowText: 'Territory controls are here',
  },
  // === STEP 14: Factions ===
  {
    id: 'factions',
    title: 'FACTIONS & ALLIANCES',
    getText: function() {
      return 'Miami is controlled by <b>powerful factions</b> -- the Colombian Cartel, the Italian Mafia, local gangs, and more. ' +
        'Your <b>standing</b> with each faction ranges from hostile to allied. Increase standing by doing jobs for them, sharing territory, and trading. ' +
        'Allies give you <b>price discounts</b>, <b>crew bonuses</b>, and <b>protection</b>. Enemies will <b>attack you on sight</b>. ' +
        'Check the <b>Factions</b> screen in Crime & Territory to see your standings.';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Factions',
    arrowText: 'Factions are here',
  },
  // === STEP 15: Missions ===
  {
    id: 'missions',
    title: 'MISSIONS & SIDE JOBS',
    getText: function() {
      return 'The <b>Missions</b> button in the sidebar shows available jobs. There are two types: ' +
        '<b>Story missions</b> advance the campaign and unlock new features. <b>Side missions</b> earn cash, reputation, and items. ' +
        'Missions have requirements (level, standing, items) and time limits. Check back often -- new missions appear as you progress!';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Missions',
    arrowText: 'Check Missions regularly',
  },
  // === STEP 16: Phone ===
  {
    id: 'phone',
    title: 'YOUR BURNER PHONE',
    getText: function() {
      return 'Your <b>burner phone</b> is your lifeline. Open <b>Phone</b> in People & Social to check messages from contacts, suppliers, and story characters. ' +
        'You receive 2-5 messages daily: supplier alerts, crew check-ins, buyer requests, NPC story updates, and threats. ' +
        'Responding to messages has <b>real consequences</b> -- deals, betrayals, and opportunities. ' +
        'Your burner lasts 30 days. When you switch phones, unread messages are lost!';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Phone',
    arrowText: 'Your phone is here',
  },
  // === STEP 17: Heists ===
  {
    id: 'heists',
    title: 'PLANNING HEISTS',
    getText: function() {
      return '<b>Heists</b> are high-risk, high-reward operations. Open <b>Heists</b> in Crime & Territory to see available targets. ' +
        'Planning a heist requires: <b>intel</b> (gathered from contacts), a <b>crew</b> with the right skills, and <b>equipment</b> from the black market. ' +
        'Each heist has a success chance based on your preparation. Failed heists mean injuries, arrests, or death. ' +
        'Successful heists pay massive amounts -- enough to change the game.';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Heists',
    arrowText: 'Heists are in Crime & Territory',
  },
  // === STEP 18: Romance ===
  {
    id: 'romance',
    title: 'RELATIONSHIPS & ROMANCE',
    getText: function() {
      return 'Miami is full of interesting people. The <b>Romance</b> screen in People & Social lets you pursue relationships. ' +
        'Building relationships provides <b>unique bonuses</b> -- discounts, intel, crew recruitment, and story arcs. ' +
        'Visit <b>Nightlife</b> to meet new people, reduce stress, and build your social network. ' +
        'Be careful -- some relationships can be dangerous, and jealousy is a real problem.';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Romance',
    arrowText: 'Romance is in People & Social',
  },
  // === STEP 19: World Map ===
  {
    id: 'world_map',
    title: 'THE WORLD MAP',
    getText: function() {
      return 'Miami is just the beginning. As you level up, you unlock <b>international travel</b> to cities worldwide: ' +
        '<b>Bogota</b> (cheap cocaine), <b>Tokyo</b> (premium prices), <b>Amsterdam</b> (ecstasy hub), <b>Kabul</b> (opium fields), and more. ' +
        'World travel takes more days and costs more, but the profit margins are enormous. ' +
        'Each region has unique drugs, factions, and dangers. The <b>Travel</b> screen shows all destinations.';
    },
    action: 'next',
    highlightSelector: '.btn-sidebar.btn-primary.btn-glow',
    arrowText: 'Travel opens the world',
  },
  // === STEP 20: The Endgame ===
  {
    id: 'endgame',
    title: 'THE ENDGAME',
    getText: function() {
      return 'The <b>Campaign</b> has multiple acts, each with escalating challenges and story missions. ' +
        'Your choices throughout the game determine which <b>ending</b> you get -- there are multiple paths to victory (or ruin). ' +
        'Will you become a kingpin, go legitimate, get arrested, or burn it all down? ' +
        'Check the <b>Campaign</b> button in the sidebar to track your progress. Good luck -- Miami is watching.';
    },
    action: 'finish',
    highlightSelector: '.btn-sidebar',
    highlightMatch: 'Campaign',
    arrowText: 'Your story awaits',
  },
];


// ---- FIRST-OPEN SCREEN HINTS ----
var SCREEN_HINTS = {
  travel:        { title: 'Travel',             text: 'Move between locations to find better prices. Each area has different drugs and price ranges. Travel costs at least one day.' },
  crew:          { title: 'Crew',               text: 'Hire crew members to fight alongside you, boost income, and unlock special abilities. A strong crew is key to survival.' },
  fronts:        { title: 'Fronts',             text: 'Laundering businesses that convert dirty money to clean cash. Essential for avoiding investigation and reducing heat.' },
  properties:    { title: 'Properties',         text: 'Buy real estate across Miami for passive income and stash storage. Properties appreciate in value over time.' },
  businesses_v2: { title: 'Businesses',         text: 'Legitimate and not-so-legitimate businesses that generate daily income. Upgrade them to earn more.' },
  futures:       { title: 'Futures Trading',    text: 'Bet on future drug prices for big profits or devastating losses. High risk, high reward.' },
  imports:       { title: 'Import / Export',    text: 'Ship drugs internationally for massive profit margins. Longer transit times but much higher returns.' },
  factions:      { title: 'Factions',           text: 'Miami\'s criminal organizations. Build alliances for bonuses or go to war for territory.' },
  rivals:        { title: 'Rivals',             text: 'Competing dealers who want your turf. Eliminate them or they\'ll undercut your business.' },
  defense:       { title: 'Territory Defense',  text: 'Defend your turf from attacks. Build fortifications and station crew to protect your empire.' },
  bodies:        { title: 'Body Disposal',      text: 'Bodies attract attention. Dispose of them quickly before the police investigate.' },
  operations:    { title: 'Operations',         text: 'Run organized crime operations like smuggling rings, protection rackets, and money laundering.' },
  heist:         { title: 'Heists',             text: 'Plan and execute high-stakes heists for huge payouts. Requires careful preparation and a skilled crew.' },
  romance:       { title: 'Romance',            text: 'Build relationships with NPCs for unique benefits, story arcs, and gameplay bonuses.' },
  nightlife:     { title: 'Nightlife',          text: 'Hit the clubs to reduce stress, build connections, and discover new opportunities.' },
  phone:         { title: 'Phone',              text: 'Check messages from contacts, rivals, and story characters. Responding has real consequences.' },
  lifestyle:     { title: 'Lifestyle',          text: 'Manage your stress and spending habits. High stress reduces effectiveness.' },
  safehouse:     { title: 'Safe House',         text: 'Your home base. Upgrade for better security, more stash space, and crew quarters.' },
  vehicles:      { title: 'Vehicles',           text: 'Buy vehicles for faster travel, more inventory space, and better escape chances.' },
  shipping:      { title: 'Shipping',           text: 'Set up shipping routes to automatically move product between territories for passive income.' },
  security:      { title: 'Security',           text: 'Monitor heat level, investigation progress, and upcoming raids. Invest in security to protect your empire.' },
  politics:      { title: 'Politics',           text: 'Bribe politicians, fund campaigns, and influence local policy. Political connections can make you untouchable.' },
  distribution:  { title: 'Distribution',       text: 'Set up dealer networks to automatically sell drugs in your territories.' },
  processing:    { title: 'Processing Lab',     text: 'Process raw materials into higher-value drugs. Cooking increases profit margins significantly.' },
  stash:         { title: 'Stash',              text: 'Store drugs at this location to free up inventory space. Stashed drugs are safer during travel.' },
  blackmarket:   { title: 'Black Market',       text: 'Buy weapons, equipment, and special items. Better gear means better outcomes in combat.' },
  missions:      { title: 'Missions',           text: 'Story missions and side jobs that earn cash, reputation, and unlock new features.' },
  skilltree:     { title: 'Skill Tree',         text: 'Spend skill points to unlock permanent upgrades in combat, business, stealth, and social.' },
  stats:         { title: 'Statistics',         text: 'Track your empire\'s progress -- total earnings, drugs traded, and more.' },
  achievements:  { title: 'Achievements',       text: 'Unlock achievements by hitting milestones. Achievements persist across playthroughs.' },
  campaign:      { title: 'Campaign',           text: 'The main story campaign. Follow the narrative to unlock Miami\'s biggest opportunities.' },
};

var TAB_HINTS = {
  portfolio: { title: 'Portfolio',    text: 'Track your net worth, drug holdings, and financial assets all in one place.' },
  buysell:   { title: 'Buy / Sell',   text: 'The main trading floor. Buy drugs low and sell high. Prices change daily.' },
  prices:    { title: 'Street Prices', text: 'Compare current drug prices across all locations. Plan your next move.' },
};


// ---- HELPERS ----
function getDrugDisplayName(drugId) {
  if (typeof DRUGS !== 'undefined') {
    var d = DRUGS.find(function(x) { return x.id === drugId; });
    if (d) return d.name;
  }
  return drugId.charAt(0).toUpperCase() + drugId.slice(1);
}

function getTutorial() {
  if (!gameState || !gameState.tutorial) return null;
  return gameState.tutorial;
}

function isTutorialActive() {
  var t = getTutorial();
  return t && t.active && !t.completed;
}


// ---- REWARD GRANTING ----
function grantStepReward(stepIndex) {
  if (!gameState) return;
  var reward = STEP_REWARDS[stepIndex];
  if (!reward) return;

  // Track which rewards have been given
  if (!gameState.tutorial.rewardsGiven) gameState.tutorial.rewardsGiven = {};
  if (gameState.tutorial.rewardsGiven[stepIndex]) return; // Already given
  gameState.tutorial.rewardsGiven[stepIndex] = true;

  // Cash reward
  if (reward.cash) {
    gameState.cash += reward.cash;
  }

  // Special rewards
  if (reward.special === 'crew') {
    // Grant a free lookout crew member
    if (typeof gameState.henchmen !== 'undefined' && Array.isArray(gameState.henchmen)) {
      gameState.henchmen.push({
        id: 'tutorial_lookout_' + Date.now(),
        name: 'Rookie Lookout',
        type: 'lookout',
        level: 1,
        loyalty: 80,
        salary: 50,
        combat: 2,
        special: 'Tutorial reward -- keeps watch for cops.',
        hiredDay: gameState.day || 1,
        kills: 0,
      });
    }
  }

  if (reward.special === 'weapon') {
    // Grant a free pistol
    if (!gameState.weapons) gameState.weapons = [];
    gameState.weapons.push({
      id: 'tutorial_pistol_' + Date.now(),
      name: 'Starter Pistol',
      type: 'pistol',
      damage: 15,
      accuracy: 70,
      ammo: 12,
      maxAmmo: 12,
      value: 800,
    });
  }

  // Show reward toast
  showRewardToast(reward.label);
}

function showRewardToast(label) {
  var existing = document.getElementById('tutorial-reward-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'tutorial-reward-toast';
  toast.className = 'tutorial-reward-toast';
  toast.textContent = 'REWARD: ' + label;
  document.body.appendChild(toast);

  setTimeout(function() {
    if (toast.parentNode) toast.remove();
  }, 2500);
}


// ---- HIGHLIGHT SYSTEM ----
function applyHighlights(step) {
  clearHighlights();
  if (!step || !step.highlightSelector) return;

  setTimeout(function() {
    try {
      var els = document.querySelectorAll(step.highlightSelector);
      if (!els || els.length === 0) return;

      if (step.highlightMatch) {
        // Only highlight elements whose text content contains the match string
        for (var i = 0; i < els.length; i++) {
          var text = els[i].textContent || '';
          if (text.indexOf(step.highlightMatch) !== -1) {
            els[i].classList.add('tutorial-highlight');
          }
        }
      } else {
        // Highlight all matching elements
        for (var j = 0; j < els.length; j++) {
          els[j].classList.add('tutorial-highlight');
        }
      }
    } catch (e) {
      // Selector might not exist yet
    }
  }, 100);
}

function clearHighlights() {
  try {
    var highlighted = document.querySelectorAll('.tutorial-highlight, .tutorial-highlight-pink');
    for (var i = 0; i < highlighted.length; i++) {
      highlighted[i].classList.remove('tutorial-highlight');
      highlighted[i].classList.remove('tutorial-highlight-pink');
    }
  } catch (e) {}
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

  // Guided tutorial steps
  if (!t.active) return '';
  var step = TUTORIAL_STEPS[t.step];
  if (!step) return '';

  var totalSteps = TUTORIAL_STEPS.length;
  var progressPct = Math.round((t.step / totalSteps) * 100);

  // Dot progress indicator
  var dots = '';
  for (var i = 0; i < totalSteps; i++) {
    dots += '<span class="tutorial-dot' + (i === t.step ? ' active' : (i < t.step ? ' done' : '')) + '"></span>';
  }

  // Progress bar
  var progressBar = '<div class="tutorial-progress-bar"><div class="tutorial-progress-fill" style="width:' + progressPct + '%"></div></div>';

  // Step badge
  var stepBadge = '<span class="tutorial-step-badge">' + (t.step + 1) + ' / ' + totalSteps + '</span>';

  // Interactive badge
  var interactiveBadge = step.interactive ? '<span class="tutorial-interactive-badge">ACTION REQUIRED</span>' : '';

  // Arrow indicator
  var arrowIndicator = step.arrowText ?
    '<div style="margin-bottom:0.6rem;"><span class="tutorial-arrow-indicator">&#8595;</span> <span style="color:#aaa;font-size:0.85rem;">' + step.arrowText + '</span></div>' : '';

  // Reward preview
  var rewardInfo = '';
  var reward = STEP_REWARDS[t.step];
  if (reward) {
    rewardInfo = '<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--neon-green,#39ff14);text-shadow:0 0 6px rgba(57,255,20,0.3);">' +
      'Reward: ' + reward.label + '</div>';
  }

  // Buttons
  var buttons = '';
  var isBlocking = step.action === 'next' || step.action === 'finish';

  if (step.action === 'next') {
    buttons = '<button class="btn btn-primary" onclick="advanceTutorial()" style="width:100%;margin-top:0.5rem;">Got it! Next &#8594;</button>';
  } else if (step.action === 'finish') {
    buttons = '<button class="btn btn-primary" onclick="advanceTutorial()" style="width:100%;margin-top:0.5rem;background:linear-gradient(135deg,var(--neon-green),var(--neon-cyan));">Start Your Empire!</button>';
  }

  // For wait steps: non-blocking banner at top so player can interact with the game
  if (!isBlocking) {
    return '<div class="tutorial-banner">' +
      '<div class="tutorial-banner-content">' +
        '<div class="tutorial-banner-step">' + stepBadge + interactiveBadge + '</div>' +
        '<div class="tutorial-banner-title">' + step.title + '</div>' +
        '<div class="tutorial-banner-text">' + (step.getText ? step.getText() : step.text) + '</div>' +
        progressBar +
        '<div class="tutorial-progress" style="margin:0.3rem 0 0">' + dots + '</div>' +
      '</div>' +
      '<button class="tutorial-skip" onclick="skipTutorial()" style="margin:0;color:#888;font-size:0.7rem">Skip</button>' +
    '</div>';
  }

  // Blocking overlay for informational steps
  return '<div class="tutorial-overlay">' +
    '<div class="tutorial-card">' +
      '<div class="tutorial-step-label">TUTORIAL ' + stepBadge + '</div>' +
      arrowIndicator +
      '<div class="tutorial-title">' + step.title + interactiveBadge + '</div>' +
      '<div class="tutorial-text">' + (step.getText ? step.getText() : step.text) + '</div>' +
      rewardInfo +
      progressBar +
      '<div class="tutorial-progress">' + dots + '</div>' +
      buttons +
      '<button class="tutorial-skip" onclick="skipTutorial()">Skip Tutorial</button>' +
    '</div>' +
  '</div>';
};


// ---- ADVANCE TUTORIAL (called by "Got it!" buttons) ----
window.advanceTutorial = function() {
  var t = getTutorial();
  if (!t || !t.active) return;

  // Grant reward for completed step
  grantStepReward(t.step);

  // Clear highlights from current step
  clearHighlights();

  t.step++;
  if (t.step >= TUTORIAL_STEPS.length) {
    completeTutorial();
    return;
  }

  // Apply highlights for new step
  var newStep = TUTORIAL_STEPS[t.step];
  if (newStep) {
    applyHighlights(newStep);
  }

  render();
};

// Legacy alias
window.advanceTutorialStep = window.advanceTutorial;


// ---- START / SKIP / COMPLETE / RESTART ----
window.startTutorial = function() {
  if (!gameState) return;
  if (!gameState.tutorial) {
    gameState.tutorial = {
      active: true,
      step: 0,
      completed: false,
      rewardsGiven: {},
      tabsSeen: {},
      screensSeen: {},
      pendingHint: null,
      hintsCompleted: false,
    };
  } else {
    gameState.tutorial.active = true;
    gameState.tutorial.step = 0;
    gameState.tutorial.rewardsGiven = {};
  }
  tutorialBoughtDrug = null;
  render();
};

window.skipTutorial = function() {
  var t = getTutorial();
  if (!t) return;
  clearHighlights();
  t.active = false;
  t.completed = false; // Still show first-open hints
  render();
};

function completeTutorial() {
  var t = getTutorial();
  if (!t) return;
  clearHighlights();
  t.active = false;
  t.completed = false; // Not fully completed -- still show first-open hints

  // Show completion notification
  if (typeof showNotification === 'function') {
    showNotification('Tutorial complete! $18,750 earned. You are ready to conquer Miami!', 'success');
  }

  render();
}

window.finishTutorial = completeTutorial;

window.dismissTutorialHint = function() {
  var t = getTutorial();
  if (!t) return;
  t.pendingHint = null;
  var injected = document.getElementById('tutorial-hint-inject');
  if (injected) injected.remove();
  render();
};


// ---- GET / SET TUTORIAL STATE ----
window.getTutorialState = function() {
  var t = getTutorial();
  if (!t) return { active: false, step: 0, completed: false, totalSteps: TUTORIAL_STEPS.length };
  return {
    active: t.active,
    step: t.step,
    completed: t.completed,
    totalSteps: TUTORIAL_STEPS.length,
    rewardsGiven: t.rewardsGiven || {},
    currentStepId: TUTORIAL_STEPS[t.step] ? TUTORIAL_STEPS[t.step].id : null,
    currentStepTitle: TUTORIAL_STEPS[t.step] ? TUTORIAL_STEPS[t.step].title : null,
    progressPercent: Math.round((t.step / TUTORIAL_STEPS.length) * 100),
  };
};


// ---- CHECK TUTORIAL ACTION (called by external game systems) ----
// actionType: 'buy', 'sell', 'travel', 'open_buysell', 'open_crew', etc.
window.checkTutorialAction = function(actionType) {
  var t = getTutorial();
  if (!t || !t.active) return;
  var step = TUTORIAL_STEPS[t.step];
  if (!step || !step.waitFor) return;

  // The waitFor function handles detection, but this gives an explicit hook
  // for game systems to signal that a relevant action just happened.
  // We trigger a progress check immediately.
  try {
    if (step.waitFor()) {
      grantStepReward(t.step);
      clearHighlights();
      t.step++;
      if (t.step >= TUTORIAL_STEPS.length) {
        completeTutorial();
        return;
      }
      var newStep = TUTORIAL_STEPS[t.step];
      if (newStep) applyHighlights(newStep);
      setTimeout(function() { render(); }, 50);
    }
  } catch (e) {}
};


// ---- CHECK PROGRESS (called after each render cycle) ----
function checkTutorialProgress() {
  var t = getTutorial();
  if (!t || !t.active) return;
  var step = TUTORIAL_STEPS[t.step];
  if (!step || !step.waitFor) return;

  try {
    if (step.waitFor()) {
      grantStepReward(t.step);
      clearHighlights();
      t.step++;
      if (t.step >= TUTORIAL_STEPS.length) {
        completeTutorial();
        return;
      }
      var newStep = TUTORIAL_STEPS[t.step];
      if (newStep) applyHighlights(newStep);
      setTimeout(function() { render(); }, 50);
    }
  } catch (e) {}
}


// ---- FIRST-OPEN HINT DETECTION ----
function checkFirstOpenHints() {
  var t = getTutorial();
  if (!t || t.active || t.pendingHint) return;
  if (t.hintsCompleted) return;

  // Stop showing hints after day 30
  if (gameState && gameState.day > 30) {
    t.hintsCompleted = true;
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


// ---- APPLY HIGHLIGHTS AFTER RENDER ----
function applyStepHighlightsAfterRender() {
  var t = getTutorial();
  if (!t || !t.active) return;
  var step = TUTORIAL_STEPS[t.step];
  if (step) applyHighlights(step);
}


// ---- WRAP render() TO HOOK IN TUTORIAL CHECKS ----
var _origRender = window.render;
window.render = function() {
  // Check for first-open hints before rendering
  checkFirstOpenHints();

  // Call original render
  _origRender();

  // Check guided step progress after render
  checkTutorialProgress();

  // Apply highlights for current step
  applyStepHighlightsAfterRender();

  // For sub-screens: inject hint overlay via DOM since renderGame() is not called
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


// ---- WRAP doWait() TO FORCE TUTORIAL DRUG PRICE RISE ----
var _origDoWait = window.doWait;
window.doWait = function() {
  var t = getTutorial();
  var shouldOverridePrice = false;

  // If tutorial is active and player is on or near the sell step, rig prices upward
  if (t && t.active && tutorialBoughtDrug) {
    var step = TUTORIAL_STEPS[t.step];
    if (step && (step.id === 'sell_drug' || step.id === 'confirm_buy')) {
      shouldOverridePrice = true;
      t._priceOverride = {
        drugId: tutorialBoughtDrug,
        oldPrice: gameState.prices ? gameState.prices[tutorialBoughtDrug] : null,
      };
    }
  }

  _origDoWait();

  // After wait, force drug price up during tutorial
  if (shouldOverridePrice && t && t._priceOverride && t._priceOverride.oldPrice) {
    var oldP = t._priceOverride.oldPrice;
    var newP = Math.round(oldP * (1.4 + Math.random() * 0.4));
    if (gameState.prices) {
      gameState.prices[t._priceOverride.drugId] = newP;
    }
    t._priceOverride = null;
  }
};


// ---- WRAP executeTrade() TO DETECT TUTORIAL BUY/SELL ----
var _origExecuteTrade = window.executeTrade;
if (typeof _origExecuteTrade === 'function') {
  window.executeTrade = function() {
    var prevMode = typeof tradeMode !== 'undefined' ? tradeMode : null;
    _origExecuteTrade.apply(this, arguments);

    // After a successful trade, signal the tutorial
    var t = getTutorial();
    if (t && t.active) {
      if (prevMode === 'buy') {
        checkTutorialAction('buy');
      } else if (prevMode === 'sell') {
        checkTutorialAction('sell');
      }
    }
  };
}


// ---- WRAP doTravel() TO DETECT TUTORIAL TRAVEL ----
var _origDoTravel = window.doTravel;
if (typeof _origDoTravel === 'function') {
  window.doTravel = function() {
    _origDoTravel.apply(this, arguments);
    var t = getTutorial();
    if (t && t.active) {
      checkTutorialAction('travel');
    }
  };
}


// ---- RESTART TUTORIAL FROM SETTINGS ----
window.restartTutorial = function() {
  if (!gameState) return;
  gameState.tutorial = {
    active: true,
    step: 0,
    completed: false,
    rewardsGiven: {},
    tabsSeen: {},
    screensSeen: {},
    pendingHint: null,
    hintsCompleted: false,
  };
  tutorialBoughtDrug = null;
  currentScreen = 'game';
  mainTab = 'portfolio';
  render();
};


// ---- UTILITY: Get tutorial step info for external systems ----
window.getTutorialStepInfo = function(stepIndex) {
  if (stepIndex < 0 || stepIndex >= TUTORIAL_STEPS.length) return null;
  var step = TUTORIAL_STEPS[stepIndex];
  return {
    id: step.id,
    title: step.title,
    action: step.action,
    interactive: !!step.interactive,
    reward: STEP_REWARDS[stepIndex] || null,
  };
};

window.getTutorialStepCount = function() {
  return TUTORIAL_STEPS.length;
};

window.isTutorialRunning = function() {
  return isTutorialActive();
};


})();
