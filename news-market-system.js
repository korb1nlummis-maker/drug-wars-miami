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
  // Dedupe: an identical headline within the last dozen items / 5 days is noise
  const _day = state.day || 1;
  if (state.newsFeed.slice(0, 12).some(n => n.headline === item.headline && _day - n.day <= 5)) return;
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
  // (locId === null → global story, hits the local market too)
  if ((locId === null || state.currentLocation === locId) && state.prices) {
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
    // locId === null → global impact (hits that drug in EVERY district)
    if (imp.locId !== null && imp.locId !== locId) continue;
    if (imp.drugId && imp.drugId !== drugId) continue;
    mult *= imp.mult;
  }
  // Never compound into absurdity
  return Math.max(0.4, Math.min(2.5, mult));
}

// ------------------------------------------------------------
// Player-driven news
// ------------------------------------------------------------
// One headline per (event type, district, drug) per cooldown window — the
// market impact still lands every time, but the paper doesn't reprint itself.
function newsCooldownOk(state, key, days) {
  if (!state.newsCooldowns) state.newsCooldowns = {};
  const day = state.day || 1;
  if (state.newsCooldowns[key] !== undefined && day - state.newsCooldowns[key] < days) return false;
  state.newsCooldowns[key] = day;
  return true;
}

function reportPlayerEvent(state, type, data) {
  if (!state) return;
  ensureNewsState(state);
  data = data || {};
  const loc = newsLocName(data.locId);
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Cooldown windows per event type (days without a repeat headline)
  const cdDays = { shootout_won: 3, shootout_lost: 3, territory_taken: 5, police_raid: 4, busted: 4, big_sale: 3, big_buy: 3, boss_hit: 7 }[type] || 3;
  const canPrint = newsCooldownOk(state, type + ':' + (data.locId || '') + ':' + (data.drugId || ''), cdDays);

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
      if (canPrint) pushNews(state, {
        headline: newsPick([
          `GUNFIRE ERUPTS IN ${loc.toUpperCase()}`,
          `DAYLIGHT SHOOTOUT SHAKES ${loc.toUpperCase()}`,
          `WITNESSES REPORT ARMED CLASH IN ${loc.toUpperCase()}`,
          `SHELL CASINGS LITTER ${loc.toUpperCase()} INTERSECTION`,
          `${loc.toUpperCase()} RESIDENTS DUCK FOR COVER AS SHOTS RING OUT`,
          `TURF DISPUTE TURNS VIOLENT IN ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Residents describe masked gunmen exchanging fire before fleeing the scene. Police have flooded the area with patrols. Street sources say product is suddenly scarce and corner prices are climbing.`,
          `No arrests have been made after a violent confrontation between unidentified crews. With officers on every corner, dealers have gone to ground and prices are surging.`,
          `A witness who asked not to be named said the shooters "knew exactly who they came for." Corner traffic has evaporated and what little product moves is moving at a premium.`,
          `Detectives canvassed the block for hours and left with nothing. The silence is its own answer, one officer admitted. Until the patrols thin out, buyers are paying scared-money prices.`,
        ]),
        source: newsPick(['Miami Herald', 'Channel 7 News', 'Street Wire', 'Local 10 News']),
        category: 'street', locId: data.locId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
    case 'territory_taken': {
      const mult = 1 - rnd(0.10, 0.18);
      addMarketImpact(state, data.locId, null, mult, 4 + Math.floor(Math.random() * 3), 'takeover');
      if (canPrint) pushNews(state, {
        headline: newsPick([
          `POWER SHIFT IN ${loc.toUpperCase()}: ${String(data.gang || 'OLD CREW').toUpperCase()} PUSHED OUT`,
          `NEW MANAGEMENT ON THE CORNERS OF ${loc.toUpperCase()}`,
          `${loc.toUpperCase()} CHANGES HANDS OVERNIGHT`,
          `OLD GUARD GONE: NEW CREW RUNS ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Long-time operators have vanished from their usual spots overnight. Whoever moved in is undercutting the old rates to win the block's loyalty. Buyers are calling it a fire sale.`,
          `Community leaders report a sudden change in who runs the corners. The new outfit is flooding the block with cheap product to announce itself.`,
          `The barbershop knows, the bodega knows, everyone knows — but nobody's saying a name. Introductory prices on every corner while the new operation settles in.`,
        ]),
        source: newsPick(['Street Wire', 'Local 10 News', 'Miami New Times']),
        category: 'you', locId: data.locId,
        impact: { dir: 'down', pct: Math.round((1 - mult) * 100) },
      });
      break;
    }
    case 'police_raid':
    case 'busted': {
      const mult = 1 + rnd(0.12, 0.20);
      addMarketImpact(state, data.locId, null, mult, 4 + Math.floor(Math.random() * 4), 'raid');
      if (canPrint) pushNews(state, {
        headline: newsPick([
          `DEA RAID SHUTS DOWN ${loc.toUpperCase()} CORNERS`,
          `NARCOTICS SWEEP HITS ${loc.toUpperCase()}`,
          `FEDERAL AGENTS DESCEND ON ${loc.toUpperCase()}`,
          `PRE-DAWN OPERATION NETS ARRESTS IN ${loc.toUpperCase()}`,
          `TASK FORCE KICKS DOORS ACROSS ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `Agents in tactical gear made multiple arrests in a pre-dawn operation. Supply lines through the district are severed and street prices have spiked overnight.`,
          `A months-long investigation culminated in coordinated raids. Dealers who escaped the net are charging desperation prices.`,
          `Evidence vans sat outside three addresses until noon. What's left of the local supply is trading hand-to-hand at double the usual number.`,
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
      if (canPrint) pushNews(state, {
        headline: newsPick([
          `STREET FLOODED WITH ${newsDrugName(data.drugId).toUpperCase()} IN ${loc.toUpperCase()}`,
          `${newsDrugName(data.drugId).toUpperCase()} GLUT HITS ${loc.toUpperCase()} CORNERS`,
          `BOTTOM FALLS OUT OF ${newsDrugName(data.drugId).toUpperCase()} PRICES IN ${loc.toUpperCase()}`,
        ]),
        body: newsPick([
          `A massive quantity moved through the district in a single day. With every corner holding weight, prices are collapsing while the surplus lasts.`,
          `Veteran dealers say they've never seen this much product hit the block at once. Everyone's undercutting everyone until the surplus burns off.`,
        ]),
        source: 'Street Wire', category: 'market', locId: data.locId, drugId: data.drugId,
        impact: { dir: 'down', pct: Math.round((1 - mult) * 100) },
      });
      break;
    }
    case 'big_buy': {
      if (!data.drugId) break;
      const mult = 1 + rnd(0.08, 0.15);
      addMarketImpact(state, data.locId, data.drugId, mult, 2 + Math.floor(Math.random() * 3), 'shortage');
      if (canPrint) pushNews(state, {
        headline: newsPick([
          `${newsDrugName(data.drugId).toUpperCase()} DRIES UP IN ${loc.toUpperCase()}`,
          `BUYER CLEANS OUT ${loc.toUpperCase()}'S ${newsDrugName(data.drugId).toUpperCase()} SUPPLY`,
          `${loc.toUpperCase()} CORNERS EMPTY-HANDED ON ${newsDrugName(data.drugId).toUpperCase()}`,
        ]),
        body: newsPick([
          `An unknown buyer cleared out local stock in one move. Dealers who still hold product are naming their own price.`,
          `Somebody bought weight today and the whole district felt it. Regulars are being told to come back tomorrow — or pay tourist prices now.`,
        ]),
        source: 'Street Wire', category: 'market', locId: data.locId, drugId: data.drugId,
        impact: { dir: 'up', pct: Math.round((mult - 1) * 100) },
      });
      break;
    }
    case 'boss_hit': {
      const mult = 1 + rnd(0.08, 0.12);
      addMarketImpact(state, data.locId, null, mult, 5, 'power vacuum');
      if (canPrint) pushNews(state, {
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
  { headline: 'CALLE OCHO FESTIVAL DRAWS HALF A MILLION', body: 'The salsa never stopped for eight blocks. Pickpocket reports tripled; nobody filed charges.', source: 'Miami Herald', category: 'world' },
  { headline: 'CIGARETTE BOAT RACES RETURN TO THE BAY', body: 'Thirty hulls, two thousand horsepower each. Customs agents watched from the marina with binoculars and long faces.', source: 'Waterfront Report', category: 'world' },
  { headline: 'FLAMINGO FLOCK RELOCATES TO HIALEAH RACETRACK', body: 'Groundskeepers say the birds "just showed up." Bettors consider them good luck. The birds decline comment.', source: 'Local 10 News', category: 'world' },
  { headline: 'BANK TELLER CHARGED IN STRUCTURING SCHEME', body: 'Prosecutors say deposits were sliced to duck the $10,000 reporting line. Her lawyer calls it "aggressive arithmetic."', source: 'Business Journal', category: 'police' },
  { headline: 'MEDICAL EXAMINER REQUESTS SECOND COOLER TRUCK', body: 'The county morgue is over capacity for the third month running. Officials blame "the general climate."', source: 'Sun Sentinel', category: 'police' },
  { headline: 'PASTEL SUITS SELL OUT ACROSS THE COUNTY', body: 'Menswear shops can\'t keep white linen in stock. "Everyone wants to look like they own a boat," one tailor shrugged.', source: 'Miami New Times', category: 'world' },
  { headline: 'ORANGE JUICE FUTURES SWING ON FROST SCARE', body: 'Commodity desks in New York spent the morning yelling about Florida weather. Growers spent it laughing.', source: 'Business Journal', category: 'world' },
  { headline: 'UNCLAIMED SPEEDBOAT AUCTIONED BY SHERIFF', body: 'The 38-footer, seized with a false hull, sold for a tenth of its value — to a bidder who paid cash.', source: 'Local 10 News', category: 'police' },
  { headline: 'NIGHTCLUB LINE STRETCHES FOUR BLOCKS ON OPENING NIGHT', body: 'The Mutiny\'s newest rival spared no expense. Where the money came from is the only question nobody asks out loud.', source: 'Miami New Times', category: 'world' },
  { headline: 'CORAL REEF SURVEY FINDS SUNKEN CESSNA', body: 'Divers mapping the reef found a light aircraft, doors open, cargo hold empty. The FAA has no matching flight plan.', source: 'Channel 7 News', category: 'world' },
  { headline: 'LITTLE HAITI MURAL PROJECT WINS ARTS GRANT', body: 'Three blocks of fresh color by summer. Organizers say the neighborhood "paints its own story now."', source: 'Miami Herald', category: 'world' },
  { headline: 'AIRPORT CUSTOMS ADDS THIRD K-9 SHIFT', body: 'MIA now runs dogs around the clock. Freight handlers were reportedly the last to be told.', source: 'Associated Press', category: 'police' },
  { headline: 'RETIRED SMUGGLER PUBLISHES COOKBOOK', body: '"Everything I know about timing I learned from stone crabs," writes the author, whose federal plea deal forbids specifics.', source: 'Miami New Times', category: 'world' },
  { headline: 'CONDO BOARD BANS CASH PURCHASES OVER $50,000', body: 'The vote followed the third all-cash penthouse sale this quarter. Realtors call the rule "quaint."', source: 'Business Journal', category: 'world' },
  { headline: 'THUNDERSTORM KNOCKS OUT POWER TO SOUTH GRID', body: 'Four hours dark from the river to the bay. Police report looting was "minimal and professional."', source: 'Channel 7 Weather', category: 'world' },
  { headline: 'HIGH SCHOOL BASEBALL PHENOM SIGNS PRO DEAL', body: 'The whole neighborhood turned out. His mother cried. Three men in linen suits paid for the party and left early.', source: 'Miami Sports Desk', category: 'world' },
  { headline: 'COUNTY COMMISSIONER\'S YACHT RAISES EYEBROWS', body: 'Financial disclosures list a salary of $41,000. The yacht lists for considerably more. An inquiry is "being considered."', source: 'Sun Sentinel', category: 'world' },
  { headline: 'PAWN SHOPS REPORT RUN ON GOLD CHAINS', body: 'Buyers pay cash and don\'t haggle. "Business is beautiful," said one owner, closing early for the third day straight.', source: 'Street Wire', category: 'world' },
  { headline: 'EVERGLADES AIRSTRIP MYSTERY DEEPENS', body: 'The packed-dirt runway appeared sometime last month. No permits, no owner, fresh tire tracks every Sunday.', source: 'Associated Press', category: 'police' },
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
  // Procedural news economy: the day's market-moving stories
  try { processProceduralNews(state); } catch (e) { /* news must never break the day */ }
  // Atmospheric filler
  if (Math.random() < 0.25) pushNews(state, newsPick(NEWS_ATMOSPHERE));
  return [];
}


// ============================================================
// PROCEDURAL NEWS ECONOMY
// Money moves because SOMETHING HAPPENED. Every day the city
// generates stories from a combinatorial grammar — agencies ×
// gangs × districts × drugs × infrastructure × magnitudes —
// and every story carries a real market impact. Template pool
// × 12 drugs × 14+ districts × 40+ actors × magnitude/duration
// rolls ≈ hundreds of thousands of distinct market events.
// ============================================================

const PROC_AGENCIES = ['DEA', 'Coast Guard', 'U.S. Customs', 'Metro-Dade Narcotics', 'FBI Miami Field Office', 'ATF', 'Florida Marine Patrol', 'Border Patrol', 'IRS Criminal Division', 'Interpol'];
const PROC_OFFICIALS = ['the Mayor', 'the Police Chief', 'a County Commissioner', 'the State Attorney', 'a Federal Judge', 'the Governor', 'a City Councilman', 'the Port Director', 'a Grand Jury', 'the Sheriff'];
const PROC_INFRA = ['the Port of Miami', 'Miami International Airport', 'the MacArthur Causeway', 'the river docks', 'the rail yard', 'Dinner Key Marina', 'the Opa-Locka airfield', 'the Krome corridor', 'the Government Cut channel', 'the cargo terminal'];
const PROC_ROUTES = ['the Colombian pipeline', 'the Bahamas run', 'the Gulf route', 'the Caribbean corridor', 'the Yucatán channel', 'the Keys smuggling lanes', 'the Haitian connection', 'the Panama route'];
const PROC_SOURCES = ['Miami Herald', 'Channel 7 News', 'Street Wire', 'Sun Sentinel', 'Local 10 News', 'Associated Press', 'Miami New Times', 'DEA Intelligence Brief', 'Business Journal', 'Radio Ritmo'];

function procGangName(state) {
  if (typeof MIAMI_FACTIONS !== 'undefined' && MIAMI_FACTIONS.length) {
    return newsPick(MIAMI_FACTIONS).name;
  }
  return newsPick(['the Marielito crews', 'the River Gang', 'the Little Haiti Kings', 'the Cartel Remnants']);
}

function procEligibleDrug(state) {
  const pool = (typeof DRUGS !== 'undefined' ? DRUGS : []).filter(d => !d.minDay || (state.day || 1) >= d.minDay);
  return pool.length ? newsPick(pool) : null;
}

function procDistrict(state) {
  const pool = LOCATIONS.filter(l => (l.region || 'miami') === 'miami');
  return pool.length ? newsPick(pool) : LOCATIONS[0];
}

// Each template: scope ('drug_global' | 'district' | 'pair'), dir (+1 up / -1 down),
// mag [min,max] price move, dur [min,max] days, weight, and text builders.
// {drug} {loc} {agency} {official} {infra} {route} {gang} {pct} fill from ctx.
const PROC_NEWS_TEMPLATES = [
  // ---- SUPPLY SHOCKS: drug up everywhere ----
  { id: 'mother_ship_seized', scope: 'drug_global', dir: 1, mag: [0.10, 0.30], dur: [3, 7], weight: 6,
    h: c => `${c.agency.toUpperCase()} SEIZES ${c.drug.name.toUpperCase()} MOTHER SHIP OFF THE COAST`,
    b: c => `${c.agency} intercepted a vessel on ${c.route} carrying multi-ton weight. Wholesalers city-wide are rationing what they have — street prices are jumping everywhere.` },
  { id: 'route_collapse', scope: 'drug_global', dir: 1, mag: [0.08, 0.22], dur: [4, 9], weight: 5,
    h: c => `${c.route.toUpperCase()} GOES DARK — ${c.drug.name.toUpperCase()} PIPELINE SEVERED`,
    b: c => `Suppliers on ${c.route} stopped answering their phones after a wave of arrests upstream. Until a new route opens, every corner in the city pays more for ${c.drug.name}.` },
  { id: 'precursor_shortage', scope: 'drug_global', dir: 1, mag: [0.08, 0.20], dur: [5, 10], weight: 4,
    h: c => `CHEMICAL CRACKDOWN CHOKES ${c.drug.name.toUpperCase()} PRODUCTION`,
    b: c => `New federal controls on precursor chemicals have labs from the Everglades to the islands cutting output. Analysts expect ${c.drug.name} to stay expensive for a week or more.` },
  { id: 'cartel_embargo', scope: 'drug_global', dir: 1, mag: [0.10, 0.25], dur: [3, 6], weight: 4,
    h: c => `SUPPLIERS HALT ${c.drug.name.toUpperCase()} SHIPMENTS IN PRICE DISPUTE`,
    b: c => `The organizations that control ${c.route} are holding back product to force wholesale prices up. It is working.` },
  { id: 'purity_scare_supply', scope: 'drug_global', dir: 1, mag: [0.06, 0.16], dur: [3, 6], weight: 3,
    h: c => `BAD BATCH SCARE — CLEAN ${c.drug.name.toUpperCase()} COMMANDS A PREMIUM`,
    b: c => `After a contaminated shipment hit the streets, buyers pay extra for product from trusted hands. Verified-clean ${c.drug.name} is suddenly worth more.` },

  // ---- SUPPLY GLUTS: drug down everywhere ----
  { id: 'record_harvest', scope: 'drug_global', dir: -1, mag: [0.08, 0.22], dur: [4, 8], weight: 5,
    h: c => `BUMPER SEASON FLOODS MARKET WITH CHEAP ${c.drug.name.toUpperCase()}`,
    b: c => `A record production season abroad has ${c.route} running at full capacity. Wholesale prices are collapsing and the street is following.` },
  { id: 'new_route_opens', scope: 'drug_global', dir: -1, mag: [0.06, 0.18], dur: [4, 9], weight: 4,
    h: c => `NEW SMUGGLING CORRIDOR UNDERCUTS ${c.drug.name.toUpperCase()} PRICES`,
    b: c => `A fresh pipeline through ${c.route} is moving weight past ${c.infra} untouched. Competition among suppliers is a buyer's dream.` },
  { id: 'rival_dump', scope: 'drug_global', dir: -1, mag: [0.08, 0.20], dur: [2, 5], weight: 4,
    h: c => `${procTitleCase(c.gang)} DUMPS STOCKPILED ${c.drug.name.toUpperCase()} ON THE MARKET`,
    b: c => `Street sources say ${c.gang} is liquidating inventory fast — maybe cash trouble, maybe something coming. Either way, ${c.drug.name} is cheap while it lasts.` },
  { id: 'lab_boom', scope: 'drug_global', dir: -1, mag: [0.06, 0.15], dur: [4, 8], weight: 3,
    h: c => `HOME LABS PROLIFERATE — ${c.drug.name.toUpperCase()} SUPPLY SURGES`,
    b: c => `Cheap local production is eating into import prices. Quality varies wildly, but quantity is not a problem anymore.` },

  // ---- DISTRICT SHOCKS: all drugs in one district ----
  { id: 'district_sweep', scope: 'district', dir: 1, mag: [0.10, 0.25], dur: [3, 6], weight: 6,
    h: c => `${c.agency.toUpperCase()} FLOODS ${c.loc.name.toUpperCase()} WITH AGENTS`,
    b: c => `A saturation operation has ${c.loc.name} crawling with law enforcement. Dealers who have not gone to ground are charging danger-pay prices.` },
  { id: 'district_festival', scope: 'district', dir: 1, mag: [0.08, 0.20], dur: [2, 4], weight: 5,
    h: c => `HUGE CROWDS DESCEND ON ${c.loc.name.toUpperCase()} — DEMAND SPIKES`,
    b: c => `A festival weekend has ${c.loc.name} packed to the seawalls. Out-of-towners pay whatever the corner asks.` },
  { id: 'district_blackout', scope: 'district', dir: 1, mag: [0.06, 0.15], dur: [1, 3], weight: 3,
    h: c => `POWER OUTAGE PLUNGES ${c.loc.name.toUpperCase()} INTO CHAOS`,
    b: c => `With the grid down and police stretched thin, ${c.loc.name} is a seller's market for anyone brave enough to work it.` },
  { id: 'district_checkpoints', scope: 'district', dir: 1, mag: [0.08, 0.18], dur: [2, 5], weight: 4,
    h: c => `ROADBLOCKS RING ${c.loc.name.toUpperCase()} AFTER ${c.official.toUpperCase()} ORDERS CRACKDOWN`,
    b: c => `Checkpoints on every artery into ${c.loc.name} are strangling resupply. Local stock is running out and prices show it.` },
  { id: 'district_gang_flood', scope: 'district', dir: -1, mag: [0.08, 0.20], dur: [2, 5], weight: 5,
    h: c => `${procTitleCase(c.gang)} MOVES WEIGHT INTO ${c.loc.name.toUpperCase()}`,
    b: c => `A convoy of product hit ${c.loc.name} overnight as ${c.gang} pushes for market share. Corners are undercutting each other block by block.` },
  { id: 'district_cop_scandal', scope: 'district', dir: -1, mag: [0.06, 0.16], dur: [3, 7], weight: 4,
    h: c => `CORRUPTION SCANDAL GUTS ${c.loc.name.toUpperCase()} NARCOTICS UNIT`,
    b: c => `Half the district's plainclothes squad is suspended pending an internal affairs probe. With nobody watching, supply is flowing freely and prices are sliding.` },
  { id: 'district_buyers_flee', scope: 'district', dir: -1, mag: [0.06, 0.15], dur: [2, 5], weight: 3,
    h: c => `VIOLENCE SCARES THE MONEY OUT OF ${c.loc.name.toUpperCase()}`,
    b: c => `After a bloody week, the buying crowd has moved on to safer blocks. Dealers left holding product in ${c.loc.name} are discounting to move it.` },

  // ---- PAIR SHOCKS: one drug, one district ----
  { id: 'pair_celebrity', scope: 'pair', dir: 1, mag: [0.10, 0.28], dur: [2, 4], weight: 5,
    h: c => `${c.loc.name.toUpperCase()} NIGHTLIFE CAN'T GET ENOUGH ${c.drug.name.toUpperCase()}`,
    b: c => `A touring act's entourage and the club crowd that follows them have cleaned out ${c.loc.name}. Anyone still holding ${c.drug.name} is naming their price.` },
  { id: 'pair_stash_seized', scope: 'pair', dir: 1, mag: [0.10, 0.24], dur: [2, 5], weight: 5,
    h: c => `${c.agency.toUpperCase()} HITS ${c.loc.name.toUpperCase()} STASH HOUSE — ${c.drug.name.toUpperCase()} SCARCE`,
    b: c => `The district's main ${c.drug.name} depot is now an evidence locker. Until resupply arrives, scarcity pricing rules.` },
  { id: 'pair_convention', scope: 'pair', dir: 1, mag: [0.06, 0.18], dur: [2, 3], weight: 3,
    h: c => `CONVENTION CROWD IN ${c.loc.name.toUpperCase()} DRIVES QUIET DEMAND FOR ${c.drug.name.toUpperCase()}`,
    b: c => `Twenty thousand visitors with expense accounts. The market adapts instantly.` },
  { id: 'pair_dump', scope: 'pair', dir: -1, mag: [0.10, 0.25], dur: [2, 4], weight: 5,
    h: c => `${c.drug.name.toUpperCase()} PRICES CRATER IN ${c.loc.name.toUpperCase()} AFTER MYSTERY SHIPMENT`,
    b: c => `Nobody knows whose container it was, but half of it is already on the corners of ${c.loc.name}. A flooded market has no dignity.` },
  { id: 'pair_od_scare', scope: 'pair', dir: -1, mag: [0.08, 0.20], dur: [3, 6], weight: 4,
    h: c => `OVERDOSE CLUSTER IN ${c.loc.name.toUpperCase()} SCARES ${c.drug.name.toUpperCase()} BUYERS`,
    b: c => `Hospitals in ${c.loc.name} logged a bad night. Regulars are staying away from ${c.drug.name} until word says it's clean again.` },
  { id: 'pair_rehab_drive', scope: 'pair', dir: -1, mag: [0.05, 0.14], dur: [3, 7], weight: 2,
    h: c => `${procTitleCase(c.official)} LAUNCHES TREATMENT PUSH IN ${c.loc.name.toUpperCase()}`,
    b: c => `Outreach vans and free clinics are pulling customers off the ${c.drug.name} market in ${c.loc.name}, at least for a while.` },

  // ---- MULTI-DAY CHAINS: a story that develops ----
  { id: 'port_strike', scope: 'drug_global', dir: 1, mag: [0.05, 0.10], dur: [2, 3], weight: 3, chain: {
      delay: 3, mag: [0.10, 0.20], dur: [3, 5],
      h: c => `PORT STRIKE DAY ${c.chainDay}: ${c.drug.name.toUpperCase()} RESERVES RUN DRY`,
      b: c => `With ${c.infra} still shut down, what came in before the walkout is gone. The shortage is no longer theoretical.` },
    h: c => `DOCKWORKERS WALK OUT AT ${c.infra.toUpperCase()}`,
    b: c => `A wildcat strike has frozen cargo movement. Smugglers who ride the legitimate freight lanes are cut off — ${c.drug.name} supply lines feel it first.` },
  { id: 'hurricane_watch', scope: 'district', dir: 1, mag: [0.04, 0.10], dur: [2, 3], weight: 2, chain: {
      delay: 2, mag: [0.12, 0.22], dur: [2, 4],
      h: c => `STORM MAKES LANDFALL — ${c.loc.name.toUpperCase()} CUT OFF`,
      b: c => `Flooded streets and downed bridges have isolated ${c.loc.name}. Anything worth selling there is worth double.` },
    h: c => `STORM WATCH ISSUED FOR ${c.loc.name.toUpperCase()}`,
    b: c => `Forecasters give it two days. Locals are stocking up on everything — legal and otherwise.` },
  { id: 'indictment_chain', scope: 'drug_global', dir: -1, mag: [0.04, 0.10], dur: [2, 3], weight: 2, chain: {
      delay: 3, mag: [0.08, 0.18], dur: [3, 6],
      h: c => `KINGPIN FLIPS — ORGANIZATION LIQUIDATES ${c.drug.name.toUpperCase()} STOCK`,
      b: c => `Facing federal time, the indicted boss is cooperating. His lieutenants are dumping inventory for getaway money and the market is drowning in it.` },
    h: c => `GRAND JURY INDICTS MAJOR ${c.drug.name.toUpperCase()} TRAFFICKER`,
    b: c => `${c.official} announced the indictment this morning. The organization's response will decide which way the market breaks.` },
];

function procTitleCase(s) { return String(s || '').replace(/\b[a-z]/g, ch => ch.toUpperCase()); }

function procBuildCtx(state) {
  return {
    drug: procEligibleDrug(state),
    loc: procDistrict(state),
    agency: newsPick(PROC_AGENCIES),
    official: newsPick(PROC_OFFICIALS),
    infra: newsPick(PROC_INFRA),
    route: newsPick(PROC_ROUTES),
    gang: procGangName(state),
  };
}

function procApplyImpact(state, tpl, ctx, magPair, durPair) {
  const mag = magPair[0] + Math.random() * (magPair[1] - magPair[0]);
  const mult = tpl.dir > 0 ? 1 + mag : 1 - mag;
  const days = durPair[0] + Math.floor(Math.random() * (durPair[1] - durPair[0] + 1));
  if (tpl.scope === 'drug_global') addMarketImpact(state, null, ctx.drug.id, mult, days, tpl.id);
  else if (tpl.scope === 'district') addMarketImpact(state, ctx.loc.id, null, mult, days, tpl.id);
  else addMarketImpact(state, ctx.loc.id, ctx.drug.id, mult, days, tpl.id);
  return { mag, days };
}

function processProceduralNews(state) {
  ensureNewsState(state);
  if (!state.newsChains) state.newsChains = [];
  const day = state.day || 1;

  // Fire due follow-ups from developing stories
  for (let i = state.newsChains.length - 1; i >= 0; i--) {
    const ch = state.newsChains[i];
    if (day < ch.fireDay) continue;
    state.newsChains.splice(i, 1);
    const tpl = PROC_NEWS_TEMPLATES.find(t => t.id === ch.templateId);
    if (!tpl || !tpl.chain) continue;
    const ctx = ch.ctx;
    ctx.chainDay = day - ch.startDay;
    const applied = procApplyImpact(state, tpl, ctx, tpl.chain.mag, tpl.chain.dur);
    pushNews(state, {
      headline: tpl.chain.h(ctx), body: tpl.chain.b(ctx),
      source: newsPick(PROC_SOURCES), category: 'market',
      locId: tpl.scope !== 'drug_global' ? ctx.loc.id : null,
      drugId: tpl.scope !== 'district' ? ctx.drug.id : null,
      impact: { dir: tpl.dir > 0 ? 'up' : 'down', pct: Math.round(applied.mag * 100) },
    });
  }

  // Generate 1-3 fresh procedural stories a day (weighted draw, no repeats via cooldowns)
  const count = 1 + (Math.random() < 0.6 ? 1 : 0) + (Math.random() < 0.25 ? 1 : 0);
  const totalWeight = PROC_NEWS_TEMPLATES.reduce((s, t) => s + t.weight, 0);
  for (let n = 0; n < count; n++) {
    let roll = Math.random() * totalWeight;
    let tpl = PROC_NEWS_TEMPLATES[0];
    for (const t of PROC_NEWS_TEMPLATES) { roll -= t.weight; if (roll <= 0) { tpl = t; break; } }
    const ctx = procBuildCtx(state);
    if (!ctx.drug) continue;
    // Cooldown: same template + same target can't reprint within 6 days
    const key = 'proc:' + tpl.id + ':' + (tpl.scope === 'district' ? ctx.loc.id : ctx.drug.id);
    if (!newsCooldownOk(state, key, 6)) continue;
    const applied = procApplyImpact(state, tpl, ctx, tpl.mag, tpl.dur);
    pushNews(state, {
      headline: tpl.h(ctx), body: tpl.b(ctx),
      source: newsPick(PROC_SOURCES), category: 'market',
      locId: tpl.scope !== 'drug_global' ? ctx.loc.id : null,
      drugId: tpl.scope !== 'district' ? ctx.drug.id : null,
      impact: { dir: tpl.dir > 0 ? 'up' : 'down', pct: Math.round(applied.mag * 100) },
    });
    // Kick off a developing story
    if (tpl.chain && Math.random() < 0.8) {
      state.newsChains.push({ templateId: tpl.id, ctx, startDay: day, fireDay: day + tpl.chain.delay });
    }
  }
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
    if (priceEl) {
      priceEl.textContent = '$' + next.toLocaleString();
      // Brief color pulse in the move's direction
      if (dir !== 0) {
        priceEl.classList.remove('tick-up', 'tick-down');
        priceEl.classList.add(dir > 0 ? 'tick-up' : 'tick-down');
        setTimeout(() => priceEl.classList.remove('tick-up', 'tick-down'), 700);
      }
    }
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
