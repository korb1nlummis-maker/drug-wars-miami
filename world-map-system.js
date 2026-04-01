// ============================================================
// DRUG WARS: MIAMI VICE EDITION - World Map System
// Multi-level interactive map (World → Region → District)
// High-quality SVG world map with continent outlines
// ============================================================

// Map zoom state (global)
let mapZoomLevel = 'world'; // 'world' or 'region'
let mapCurrentRegion = null;

// World map region positions — viewBox 0 0 1000 500 (2:1 aspect like a real world map)
const WORLD_MAP_COORDS = {
  miami:           { x: 245, y: 195, label: 'Miami' },
  caribbean:       { x: 275, y: 240, label: 'Caribbean' },
  central_america: { x: 210, y: 260, label: 'C. America' },
  south_america:   { x: 300, y: 360, label: 'S. America' },
  mexico:          { x: 170, y: 220, label: 'Mexico' },
  us_cities:       { x: 210, y: 145, label: 'US Cities' },
  western_europe:  { x: 490, y: 130, label: 'W. Europe' },
  eastern_europe:  { x: 570, y: 145, label: 'E. Europe' },
  west_africa:     { x: 460, y: 270, label: 'W. Africa' },
  southeast_asia:  { x: 770, y: 240, label: 'SE Asia' },
};

// Region adjacency for route lines
const WORLD_REGION_ADJACENCY = {
  miami:           ['caribbean', 'us_cities', 'mexico'],
  caribbean:       ['miami', 'central_america', 'south_america'],
  central_america: ['caribbean', 'south_america', 'mexico'],
  south_america:   ['caribbean', 'central_america', 'west_africa'],
  mexico:          ['miami', 'central_america', 'us_cities'],
  us_cities:       ['miami', 'mexico', 'western_europe'],
  western_europe:  ['us_cities', 'eastern_europe', 'west_africa'],
  eastern_europe:  ['western_europe', 'southeast_asia'],
  west_africa:     ['south_america', 'western_europe'],
  southeast_asia:  ['eastern_europe'],
};

// Per-region district positions (percentage x,y within region map — viewBox 0 0 1000 500)
const REGION_DISTRICT_COORDS = {
  miami: {
    miami_gardens: { x: 300, y: 25 }, opa_locka: { x: 550, y: 50 },
    hialeah: { x: 350, y: 110 }, liberty_city: { x: 550, y: 125 },
    little_haiti: { x: 680, y: 90 }, overtown: { x: 450, y: 200 },
    wynwood: { x: 620, y: 175 }, little_havana: { x: 350, y: 260 },
    downtown: { x: 550, y: 250 }, south_beach: { x: 800, y: 210 },
    coral_gables: { x: 300, y: 340 }, the_port: { x: 680, y: 300 },
    kendall: { x: 200, y: 410 }, the_keys: { x: 450, y: 460 },
  },
  caribbean: {
    havana: { x: 200, y: 100 }, nassau: { x: 500, y: 75 },
    san_juan: { x: 800, y: 125 }, kingston: { x: 350, y: 250 },
    port_au_prince: { x: 500, y: 200 }, santo_domingo: { x: 650, y: 190 },
  },
  south_america: {
    bogota: { x: 250, y: 75 }, medellin: { x: 200, y: 125 },
    cali: { x: 180, y: 175 }, lima: { x: 150, y: 275 },
    sao_paulo: { x: 650, y: 300 }, buenos_aires: { x: 550, y: 410 },
  },
  central_america: {
    guatemala_city: { x: 200, y: 150 }, san_salvador: { x: 400, y: 175 },
    tegucigalpa: { x: 500, y: 200 }, managua: { x: 550, y: 275 },
    panama_city: { x: 700, y: 375 },
  },
  mexico: {
    tijuana: { x: 100, y: 75 }, culiacan: { x: 200, y: 175 },
    guadalajara: { x: 350, y: 275 }, mexico_city: { x: 500, y: 325 },
    ciudad_juarez: { x: 300, y: 75 }, cancun: { x: 800, y: 300 },
  },
  us_cities: {
    los_angeles: { x: 100, y: 200 }, las_vegas: { x: 180, y: 175 },
    houston: { x: 400, y: 300 }, atlanta: { x: 580, y: 250 },
    chicago: { x: 520, y: 125 }, detroit: { x: 600, y: 100 },
    new_york: { x: 780, y: 125 },
  },
  western_europe: {
    london: { x: 400, y: 75 }, amsterdam: { x: 500, y: 90 },
    hamburg: { x: 550, y: 100 }, antwerp: { x: 470, y: 125 },
    barcelona: { x: 350, y: 300 }, marseille: { x: 450, y: 275 },
  },
  eastern_europe: {
    prague: { x: 300, y: 125 }, belgrade: { x: 400, y: 250 },
    istanbul: { x: 650, y: 325 }, kyiv: { x: 550, y: 100 },
    moscow: { x: 750, y: 50 },
  },
  west_africa: {
    dakar: { x: 150, y: 100 }, conakry: { x: 180, y: 200 },
    abidjan: { x: 350, y: 250 }, accra: { x: 500, y: 240 },
    lagos: { x: 700, y: 225 },
  },
  southeast_asia: {
    bangkok: { x: 300, y: 175 }, shan_state: { x: 200, y: 75 },
    ho_chi_minh: { x: 450, y: 275 }, phnom_penh: { x: 400, y: 225 },
    manila: { x: 750, y: 200 }, hong_kong: { x: 600, y: 100 },
  },
};

// Per-region district adjacency
const WORLD_DISTRICT_ADJACENCY = {
  caribbean: {
    havana: ['kingston', 'nassau'],
    nassau: ['havana', 'san_juan'],
    kingston: ['havana', 'port_au_prince'],
    port_au_prince: ['kingston', 'santo_domingo'],
    santo_domingo: ['port_au_prince', 'san_juan'],
    san_juan: ['nassau', 'santo_domingo'],
  },
  south_america: {
    bogota: ['medellin', 'cali'],
    medellin: ['bogota', 'cali'],
    cali: ['bogota', 'medellin', 'lima'],
    lima: ['cali', 'sao_paulo'],
    sao_paulo: ['lima', 'buenos_aires'],
    buenos_aires: ['sao_paulo'],
  },
  central_america: {
    guatemala_city: ['san_salvador'],
    san_salvador: ['guatemala_city', 'tegucigalpa'],
    tegucigalpa: ['san_salvador', 'managua'],
    managua: ['tegucigalpa', 'panama_city'],
    panama_city: ['managua'],
  },
  mexico: {
    tijuana: ['culiacan', 'ciudad_juarez'],
    ciudad_juarez: ['tijuana', 'culiacan'],
    culiacan: ['tijuana', 'ciudad_juarez', 'guadalajara'],
    guadalajara: ['culiacan', 'mexico_city'],
    mexico_city: ['guadalajara', 'cancun'],
    cancun: ['mexico_city'],
  },
  us_cities: {
    los_angeles: ['las_vegas', 'houston'],
    las_vegas: ['los_angeles'],
    houston: ['los_angeles', 'atlanta'],
    atlanta: ['houston', 'chicago', 'new_york'],
    chicago: ['atlanta', 'detroit'],
    detroit: ['chicago', 'new_york'],
    new_york: ['detroit', 'atlanta'],
  },
  western_europe: {
    london: ['amsterdam', 'antwerp'],
    amsterdam: ['london', 'hamburg', 'antwerp'],
    hamburg: ['amsterdam'],
    antwerp: ['london', 'amsterdam', 'marseille'],
    marseille: ['antwerp', 'barcelona'],
    barcelona: ['marseille'],
  },
  eastern_europe: {
    prague: ['belgrade', 'kyiv'],
    belgrade: ['prague', 'istanbul'],
    istanbul: ['belgrade', 'kyiv'],
    kyiv: ['prague', 'istanbul', 'moscow'],
    moscow: ['kyiv'],
  },
  west_africa: {
    dakar: ['conakry'],
    conakry: ['dakar', 'abidjan'],
    abidjan: ['conakry', 'accra'],
    accra: ['abidjan', 'lagos'],
    lagos: ['accra'],
  },
  southeast_asia: {
    shan_state: ['bangkok'],
    bangkok: ['shan_state', 'phnom_penh', 'ho_chi_minh'],
    phnom_penh: ['bangkok', 'ho_chi_minh'],
    ho_chi_minh: ['bangkok', 'phnom_penh', 'manila'],
    manila: ['ho_chi_minh', 'hong_kong'],
    hong_kong: ['manila'],
  },
};


// ============================================================
// SIMPLIFIED CONTINENT OUTLINES (SVG paths for world map)
// Approximated low-poly outlines for a 1000x500 viewBox
// ============================================================
const CONTINENT_PATHS = [
  // North America
  'M 80,60 L 120,45 160,50 200,40 250,55 280,70 300,90 290,110 280,130 260,145 250,160 240,165 230,180 220,190 200,200 185,210 170,220 150,235 140,240 135,235 130,230 120,225 110,210 95,190 80,175 65,155 55,130 50,110 55,90 65,75 Z',
  // Central America
  'M 165,230 L 180,235 190,245 200,255 210,270 215,275 205,280 195,275 185,265 175,250 168,240 Z',
  // South America
  'M 220,280 L 240,275 260,270 280,275 310,285 330,300 345,320 350,340 345,360 335,385 320,410 305,425 290,435 275,440 260,430 250,420 245,400 240,380 245,360 250,340 245,320 235,300 225,290 Z',
  // Europe
  'M 440,55 L 460,50 480,55 500,60 520,65 545,60 560,70 570,80 575,95 580,110 575,125 565,135 555,140 540,135 525,130 510,125 495,120 485,115 475,110 465,100 455,90 450,80 445,70 Z',
  // Africa
  'M 435,200 L 455,195 470,200 490,210 510,225 525,240 535,260 540,280 540,305 535,330 525,355 510,375 495,385 480,390 465,385 450,375 440,360 435,340 430,315 428,295 430,275 432,255 430,235 432,215 Z',
  // Middle East / Turkey
  'M 555,150 L 575,145 595,150 610,160 620,170 615,180 605,185 590,180 575,175 560,165 Z',
  // Russia / Central Asia (simplified)
  'M 565,50 L 600,40 650,35 700,30 750,35 800,40 840,50 860,60 870,75 865,90 850,100 830,105 800,100 770,95 740,90 710,85 680,80 650,75 620,70 595,65 575,60 Z',
  // India
  'M 660,180 L 675,175 690,185 700,200 705,220 700,240 690,260 680,270 670,265 660,250 655,230 652,210 655,195 Z',
  // Southeast Asia mainland
  'M 720,190 L 740,180 760,185 775,195 780,210 775,225 765,240 755,250 745,245 735,235 725,220 720,205 Z',
  // Australia
  'M 770,340 L 800,330 830,335 855,345 870,360 875,380 870,395 855,405 830,410 805,405 785,395 775,380 770,365 768,350 Z',
  // Indonesia / Philippines (dots)
  'M 760,265 L 770,260 785,262 800,265 810,270 820,275 830,278',
  // Japan / Korea
  'M 820,130 L 830,120 840,115 850,120 855,130 850,145 840,155 830,150 825,140 Z',
];

// ============================================================
// RENDERING FUNCTIONS
// ============================================================

function renderWorldMapMultiLevel() {
  if (mapZoomLevel === 'world') return renderWorldMapGlobal();
  if (mapZoomLevel === 'region' && mapCurrentRegion) return renderRegionMapView(mapCurrentRegion);
  return renderWorldMapGlobal();
}

function renderWorldMapGlobal() {
  const state = typeof gameState !== 'undefined' ? gameState : null;
  const unlocked = state && state.worldState ? state.worldState.unlockedRegions || ['miami'] : ['miami'];
  const currentLoc = state ? state.currentLocation : null;
  const currentRegion = currentLoc && typeof LOCATIONS !== 'undefined' ?
    (LOCATIONS.find(l => l.id === currentLoc) || {}).region || 'miami' : 'miami';

  // SVG content pieces
  let continentsSvg = '';
  let routesSvg = '';
  let nodesSvg = '';

  // Render continent outlines
  for (const path of CONTINENT_PATHS) {
    continentsSvg += `<path d="${path}" fill="rgba(20,40,60,0.6)" stroke="rgba(0,180,220,0.12)" stroke-width="1" stroke-linejoin="round"/>`;
  }

  // Latitude / longitude grid
  let gridSvg = '';
  for (let y = 0; y <= 500; y += 100) {
    gridSvg += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="rgba(0,180,220,0.04)" stroke-width="0.5"/>`;
  }
  for (let x = 0; x <= 1000; x += 100) {
    gridSvg += `<line x1="${x}" y1="0" x2="${x}" y2="500" stroke="rgba(0,180,220,0.04)" stroke-width="0.5"/>`;
  }

  // Route lines between adjacent regions
  for (const [regionId, neighbors] of Object.entries(WORLD_REGION_ADJACENCY)) {
    const pos = WORLD_MAP_COORDS[regionId];
    if (!pos) continue;
    for (const neighborId of neighbors) {
      if (regionId > neighborId) continue;
      const nPos = WORLD_MAP_COORDS[neighborId];
      if (!nPos) continue;
      const bothUnlocked = unlocked.includes(regionId) && unlocked.includes(neighborId);
      const color = bothUnlocked ? 'rgba(0,240,255,0.25)' : 'rgba(100,100,130,0.12)';
      const width = bothUnlocked ? 1.5 : 0.8;
      const dash = bothUnlocked ? '' : 'stroke-dasharray="8,6"';
      routesSvg += `<line x1="${pos.x}" y1="${pos.y}" x2="${nPos.x}" y2="${nPos.y}" stroke="${color}" stroke-width="${width}" ${dash}/>`;
    }
  }

  // Region nodes
  for (const [regionId, pos] of Object.entries(WORLD_MAP_COORDS)) {
    const isUnlocked = unlocked.includes(regionId);
    const isCurrent = currentRegion === regionId;
    const region = typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS.find(r => r.id === regionId) : null;
    const label = pos.label;
    const unlockCheck = !isUnlocked && typeof canUnlockRegion === 'function' && state ? canUnlockRegion(state, regionId) : null;
    const canUnlock = unlockCheck && unlockCheck.canUnlock;

    // Node styling
    let outerR = 14, innerR = 8;
    let fillColor, strokeColor, opacity, glowFilter = '';

    if (isCurrent) {
      fillColor = '#00f0ff'; strokeColor = '#00f0ff'; opacity = 1;
      glowFilter = 'filter="url(#nodeGlow)"';
    } else if (isUnlocked) {
      fillColor = '#00cc66'; strokeColor = '#00ff88'; opacity = 1;
    } else if (canUnlock) {
      fillColor = '#ff00aa'; strokeColor = '#ff44cc'; opacity = 0.9;
      glowFilter = 'filter="url(#availGlow)"';
    } else {
      fillColor = '#222233'; strokeColor = '#444466'; opacity = 0.4;
    }

    const onclick = isUnlocked ?
      `mapZoomLevel='region'; mapCurrentRegion='${regionId}'; render();` :
      (canUnlock ? `doUnlockRegion('${regionId}')` : '');

    const cursor = onclick ? 'cursor:pointer' : 'cursor:default';

    // Outer ring
    nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="${outerR}" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="${opacity}" ${glowFilter}/>`;
    // Inner filled circle
    nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="${innerR}" fill="${fillColor}" opacity="${opacity}" ${glowFilter} style="${cursor}" ${onclick ? `onclick="${onclick}"` : ''}/>`;

    // Pulsing ring for current
    if (isCurrent) {
      nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="${outerR}" fill="none" stroke="#00f0ff" stroke-width="2" opacity="0.6">
        <animate attributeName="r" values="${outerR};${outerR + 8};${outerR}" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>`;
    }

    // Pulsing for available unlock
    if (canUnlock) {
      nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="${outerR}" fill="none" stroke="#ff00aa" stroke-width="1.5" opacity="0.5">
        <animate attributeName="r" values="${outerR};${outerR + 6};${outerR}" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
      </circle>`;
    }

    // Label (small, clean)
    const labelColor = isCurrent ? '#00f0ff' : isUnlocked ? '#aaddcc' : canUnlock ? '#ff88cc' : '#556';
    const labelY = pos.y + outerR + 12;
    nodesSvg += `<text x="${pos.x}" y="${labelY}" text-anchor="middle" fill="${labelColor}" font-size="11" font-family="'Rajdhani','Orbitron',sans-serif" font-weight="${isCurrent || canUnlock ? '700' : '400'}" style="${cursor}" ${onclick ? `onclick="${onclick}"` : ''}>${label}</text>`;

    // Lock icon for locked regions
    if (!isUnlocked && !canUnlock) {
      nodesSvg += `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="#555" font-size="10">🔒</text>`;
    }

    // Cost tooltip for available regions
    if (canUnlock && region) {
      nodesSvg += `<text x="${pos.x}" y="${labelY + 13}" text-anchor="middle" fill="#ff88cc" font-size="9" font-family="Rajdhani,sans-serif">$${(region.unlockCost || 0).toLocaleString()}</text>`;
    }
  }

  return `
    <div class="world-map-container" style="position:relative;border:1px solid rgba(0,240,255,0.15);border-radius:0.5rem;overflow:hidden;background:#060610;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0.7rem;background:rgba(0,15,30,0.8);border-bottom:1px solid rgba(0,240,255,0.1);">
        <span style="color:#00f0ff;font-family:Orbitron,sans-serif;font-size:0.8rem;font-weight:700;">🌍 WORLD MAP</span>
        <span style="color:#667;font-size:0.65rem;">${unlocked.length}/10 regions unlocked</span>
      </div>
      <svg viewBox="0 0 1000 500" style="width:100%;display:block;background:#060610;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nodeGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="availGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="rgba(5,15,35,1)"/>
            <stop offset="100%" stop-color="rgba(2,5,15,1)"/>
          </radialGradient>
        </defs>
        <!-- Ocean background -->
        <rect width="1000" height="500" fill="url(#oceanGrad)"/>
        <!-- Grid -->
        ${gridSvg}
        <!-- Continents -->
        ${continentsSvg}
        <!-- Routes -->
        ${routesSvg}
        <!-- Nodes -->
        ${nodesSvg}
      </svg>
      <div style="display:flex;gap:0.8rem;padding:0.3rem 0.7rem;background:rgba(0,15,30,0.8);border-top:1px solid rgba(0,240,255,0.1);flex-wrap:wrap;">
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#00f0ff;box-shadow:0 0 6px #00f0ff;display:inline-block;"></span> Current</span>
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#00cc66;display:inline-block;"></span> Unlocked</span>
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#ff00aa;display:inline-block;"></span> Available</span>
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#333;display:inline-block;"></span> Locked</span>
        <span style="font-size:0.6rem;color:#556;margin-left:auto;">Click unlocked region to zoom in</span>
      </div>
    </div>
  `;
}

function renderRegionMapView(regionId) {
  const state = typeof gameState !== 'undefined' ? gameState : null;
  const coords = REGION_DISTRICT_COORDS[regionId];
  if (!coords) return renderWorldMapGlobal();

  const adjacency = regionId === 'miami' ?
    {
      liberty_city: ['little_haiti', 'overtown', 'miami_gardens'],
      overtown: ['liberty_city', 'wynwood', 'downtown', 'little_havana'],
      little_havana: ['overtown', 'downtown', 'coral_gables', 'hialeah'],
      wynwood: ['overtown', 'downtown', 'south_beach', 'little_haiti'],
      downtown: ['overtown', 'wynwood', 'south_beach', 'little_havana', 'coral_gables', 'the_port'],
      south_beach: ['wynwood', 'downtown'],
      little_haiti: ['liberty_city', 'wynwood', 'hialeah'],
      hialeah: ['little_haiti', 'little_havana', 'opa_locka', 'miami_gardens'],
      opa_locka: ['hialeah', 'miami_gardens'],
      coral_gables: ['little_havana', 'downtown', 'kendall'],
      kendall: ['coral_gables', 'the_keys'],
      the_port: ['downtown'],
      miami_gardens: ['liberty_city', 'hialeah', 'opa_locka'],
      the_keys: ['kendall'],
    }
    : (WORLD_DISTRICT_ADJACENCY[regionId] || {});

  const region = typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS.find(r => r.id === regionId) : null;
  const regionName = region ? region.name : regionId.replace(/_/g, ' ');
  const regionEmoji = region ? region.emoji : '🌍';

  const currentLoc = state ? state.currentLocation : null;
  const controlledTerritories = typeof getControlledTerritories === 'function' ? getControlledTerritories(state || {}) : [];
  const visited = state ? (state.citiesVisited || []) : [];

  let linesSvg = '';
  let nodesSvg = '';

  // Connection lines
  for (const [distId, neighbors] of Object.entries(adjacency)) {
    const pos = coords[distId];
    if (!pos) continue;
    for (const nId of neighbors) {
      if (distId > nId) continue;
      const nPos = coords[nId];
      if (!nPos) continue;
      linesSvg += `<line x1="${pos.x}" y1="${pos.y}" x2="${nPos.x}" y2="${nPos.y}" stroke="rgba(0,240,255,0.12)" stroke-width="1.5"/>`;
    }
  }

  // === GANG TERRITORY COLOR MAP ===
  const GANG_COLORS = {
    zoe_pound: 'rgba(0,200,0,0.12)', los_cubanos: 'rgba(255,165,0,0.12)',
    colombian_connection: 'rgba(255,255,0,0.10)', cartel_remnants: 'rgba(255,0,0,0.10)',
    eastern_bloc: 'rgba(100,100,255,0.12)', haitian_crew: 'rgba(128,0,128,0.10)',
    port_authority: 'rgba(100,200,200,0.10)', southern_boys: 'rgba(139,69,19,0.10)',
  };

  // Territory area circles (larger colored zones behind district dots)
  let areaSvg = '';
  for (const [distId, pos] of Object.entries(coords)) {
    const isControlled = controlledTerritories.includes(distId);
    // Find gang presence for this district
    var gangId = null;
    if (typeof MIAMI_DISTRICTS !== 'undefined') {
      var md = MIAMI_DISTRICTS.find(function(d) { return d.id === distId; });
      if (md && md.gangPresence && md.gangPresence.length > 0) gangId = md.gangPresence[0];
    }
    // Territory zone
    var zoneColor = isControlled ? 'rgba(255,0,170,0.15)' : (gangId && GANG_COLORS[gangId] ? GANG_COLORS[gangId] : 'rgba(30,30,50,0.3)');
    areaSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="45" fill="${zoneColor}" stroke="none"/>`;
  }

  // District nodes (enhanced)
  for (const [distId, pos] of Object.entries(coords)) {
    const loc = typeof LOCATIONS !== 'undefined' ? LOCATIONS.find(l => l.id === distId) : null;
    const isCurrent = currentLoc === distId;
    const isControlled = controlledTerritories.includes(distId);
    const isVisited = visited.includes(distId);
    const name = loc ? loc.name : distId.replace(/_/g, ' ');

    let fillColor = '#2a2a3a', strokeColor = '#444', glowFilter = '';
    if (isCurrent) { fillColor = '#00f0ff'; strokeColor = '#00f0ff'; glowFilter = 'filter="url(#nodeGlow)"'; }
    else if (isControlled) { fillColor = '#ff00aa'; strokeColor = '#ff44cc'; glowFilter = 'filter="url(#availGlow)"'; }
    else if (isVisited) { fillColor = '#00cc66'; strokeColor = '#00ff88'; }

    const locHeat = state && state.heatSystem ? (state.heatSystem.cityHeat || {})[distId] || 0 : 0;
    if (locHeat > 50) { strokeColor = '#ff4400'; }

    const onclick = isCurrent ? '' : `selectDestination('${distId}')`;
    const cursor = onclick ? 'cursor:pointer' : '';

    // Node circle (larger, more visible)
    nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="13" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" ${glowFilter} style="${cursor}" ${onclick ? `onclick="${onclick}"` : ''}/>`;

    // Pulsing for current location
    if (isCurrent) {
      nodesSvg += `<circle cx="${pos.x}" cy="${pos.y}" r="13" fill="none" stroke="#00f0ff" stroke-width="2.5" opacity="0.5">
        <animate attributeName="r" values="13;22;13" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>`;
      // "YOU ARE HERE" marker
      nodesSvg += `<text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="700" font-family="Orbitron,sans-serif">▼</text>`;
    }

    // Territory flag for controlled districts
    if (isControlled && !isCurrent) {
      nodesSvg += `<text x="${pos.x + 15}" y="${pos.y - 5}" fill="#ff00aa" font-size="12">🏴</text>`;
    }

    // Gang presence marker
    var gangId2 = null;
    if (typeof MIAMI_DISTRICTS !== 'undefined') {
      var md2 = MIAMI_DISTRICTS.find(function(d) { return d.id === distId; });
      if (md2 && md2.gangPresence && md2.gangPresence.length > 0) gangId2 = md2.gangPresence[0];
    }
    if (gangId2 && !isControlled) {
      nodesSvg += `<text x="${pos.x + 15}" y="${pos.y - 5}" fill="rgba(255,255,255,0.4)" font-size="8" font-family="Rajdhani,sans-serif">⚔</text>`;
    }

    // Player assets indicators
    var hasBusinessHere = state && state.frontBusinesses && state.frontBusinesses.some(function(b) { return b.location === distId; });
    var hasCrewHere = state && state.henchmen && state.henchmen.some(function(h) { return h.assignedTo === 'territory_guard'; }) && isControlled;
    if (hasBusinessHere) nodesSvg += `<text x="${pos.x - 16}" y="${pos.y - 5}" fill="#00ff88" font-size="10">🏢</text>`;
    if (hasCrewHere) nodesSvg += `<text x="${pos.x - 16}" y="${pos.y + 10}" fill="#ffaa00" font-size="9">👥</text>`;

    // Heat indicator for district
    if (locHeat > 30) {
      nodesSvg += `<text x="${pos.x + 15}" y="${pos.y + 10}" fill="#ff4400" font-size="8" font-family="Rajdhani">🔥${Math.round(locHeat)}</text>`;
    }

    // Label (name)
    const labelColor = isCurrent ? '#00f0ff' : isControlled ? '#ff88cc' : isVisited ? '#aaddcc' : '#778';
    nodesSvg += `<text x="${pos.x}" y="${pos.y - 20}" text-anchor="middle" fill="${labelColor}" font-size="11" font-family="'Rajdhani',sans-serif" font-weight="${isCurrent || isControlled ? '700' : '400'}" style="${cursor}" ${onclick ? `onclick="${onclick}"` : ''}>${name}</text>`;
  }

  // Active world event for this region
  const activeEvent = typeof getActiveWorldEvents === 'function' && state ? getActiveWorldEvents(state, regionId) : null;
  const eventHtml = activeEvent ? `<div style="background:rgba(255,0,80,0.1);border:1px solid rgba(255,0,80,0.3);border-radius:0.3rem;padding:0.3rem 0.5rem;margin:0;font-size:0.65rem;color:#ff88aa;">${activeEvent.emoji || '⚡'} ${activeEvent.name} (${activeEvent.expiresDay - state.day}d left)</div>` : '';

  return `
    <div class="world-map-container" style="position:relative;border:1px solid rgba(0,240,255,0.15);border-radius:0.5rem;overflow:hidden;background:#060610;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0.7rem;background:rgba(0,15,30,0.8);border-bottom:1px solid rgba(0,240,255,0.1);gap:0.5rem;flex-wrap:wrap;">
        <button onclick="mapZoomLevel='world'; mapCurrentRegion=null; render();" style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);color:#00f0ff;padding:0.2rem 0.5rem;border-radius:0.3rem;font-size:0.65rem;cursor:pointer;font-family:Rajdhani,sans-serif;">← World Map</button>
        <span style="color:#00f0ff;font-family:Orbitron,sans-serif;font-size:0.8rem;font-weight:700;">${regionEmoji} ${regionName.toUpperCase()}</span>
        ${eventHtml}
      </div>
      <svg viewBox="0 0 1000 500" style="width:100%;display:block;background:#060610;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nodeGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="availGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="1000" height="500" fill="#060610"/>
        ${areaSvg}
        ${linesSvg}
        ${nodesSvg}
      </svg>
      <div style="display:flex;gap:0.6rem;padding:0.3rem 0.7rem;background:rgba(0,15,30,0.8);border-top:1px solid rgba(0,240,255,0.1);flex-wrap:wrap;">
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#00f0ff;box-shadow:0 0 6px #00f0ff;display:inline-block;"></span> You</span>
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#ff00aa;display:inline-block;"></span> Your Territory</span>
        <span style="font-size:0.6rem;color:#888;display:flex;align-items:center;gap:3px;"><span style="width:8px;height:8px;border-radius:50%;background:#00cc66;display:inline-block;"></span> Visited</span>
        <span style="font-size:0.6rem;color:#888;">🏢 Business</span>
        <span style="font-size:0.6rem;color:#888;">👥 Crew</span>
        <span style="font-size:0.6rem;color:#888;">⚔ Gang</span>
        <span style="font-size:0.6rem;color:#888;">🔥 Heat</span>
        <span style="font-size:0.6rem;color:#556;margin-left:auto;">Tap district to travel</span>
      </div>
    </div>
  `;
}

// Handler for region unlock button
function doUnlockRegion(regionId) {
  if (typeof gameState === 'undefined') return;
  if (typeof unlockRegion !== 'function') return;
  const result = unlockRegion(gameState, regionId);
  if (result.success) {
    // Load districts for the newly unlocked region
    if (typeof loadWorldDistricts === 'function') loadWorldDistricts(gameState, regionId);
    if (typeof initWorldFactionState === 'function') initWorldFactionState(gameState);
  }
  if (gameState.messageLog) gameState.messageLog.push(result.msg);
  if (typeof render === 'function') render();
}
