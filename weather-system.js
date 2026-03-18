// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Weather System
// Dynamic weather affecting gameplay, prices, travel, and events
// ============================================================

const WEATHER_TYPES = [
  { id: 'clear', name: 'Clear Skies', emoji: '☀️',
    effects: { travelSpeed: 1.0, priceVolatility: 1.0, patrolChance: 1.0, stealthBonus: 0, demandMod: 1.0 },
    desc: 'Beautiful day in Miami. Business as usual.' },
  { id: 'rain', name: 'Rain', emoji: '🌧️',
    effects: { travelSpeed: 0.9, priceVolatility: 1.05, patrolChance: 0.8, stealthBonus: 0.10, demandMod: 1.0 },
    desc: 'Rain keeps cops off the streets. Good cover for deals.' },
  { id: 'storm', name: 'Tropical Storm', emoji: '⛈️',
    effects: { travelSpeed: 0.7, priceVolatility: 1.2, patrolChance: 0.5, stealthBonus: 0.20, demandMod: 0.8, waterRoutesBlocked: true },
    desc: 'Storm warnings. Water routes blocked. Outdoor deals cancelled.' },
  { id: 'hurricane', name: 'Hurricane', emoji: '🌀',
    effects: { travelSpeed: 0, priceVolatility: 2.0, patrolChance: 0.2, stealthBonus: 0.30, demandMod: 0.5, allTravelBlocked: true, propertyDamageRisk: 0.15 },
    desc: 'Category hurricane! All travel blocked. Hunker down. Prices will spike after.' },
  { id: 'heatwave', name: 'Heatwave', emoji: '🔥',
    effects: { travelSpeed: 0.95, priceVolatility: 1.1, patrolChance: 0.9, stealthBonus: 0, demandMod: 1.15, violenceMod: 1.10, crewFatigue: true },
    desc: 'Scorching heat. Drug demand up 15%. Tempers flare. Crew gets tired.' },
  { id: 'fog', name: 'Dense Fog', emoji: '🌫️',
    effects: { travelSpeed: 0.85, priceVolatility: 1.0, patrolChance: 0.6, stealthBonus: 0.25, demandMod: 1.0 },
    desc: 'Thick fog rolls in. Perfect cover for smuggling operations.' },
];

// Seasonal weather probability tables (month 0-11)
// Hurricane season: June (5) - November (10)
// Tourist season: December (11) - April (3)
const SEASONAL_PATTERNS = {
  0: { clear: 0.50, rain: 0.20, storm: 0.05, hurricane: 0.00, heatwave: 0.10, fog: 0.15 }, // Jan
  1: { clear: 0.55, rain: 0.15, storm: 0.03, hurricane: 0.00, heatwave: 0.12, fog: 0.15 }, // Feb
  2: { clear: 0.50, rain: 0.20, storm: 0.05, hurricane: 0.00, heatwave: 0.15, fog: 0.10 }, // Mar
  3: { clear: 0.45, rain: 0.25, storm: 0.08, hurricane: 0.00, heatwave: 0.15, fog: 0.07 }, // Apr
  4: { clear: 0.35, rain: 0.30, storm: 0.12, hurricane: 0.02, heatwave: 0.15, fog: 0.06 }, // May
  5: { clear: 0.25, rain: 0.30, storm: 0.18, hurricane: 0.08, heatwave: 0.15, fog: 0.04 }, // Jun
  6: { clear: 0.20, rain: 0.30, storm: 0.20, hurricane: 0.12, heatwave: 0.14, fog: 0.04 }, // Jul
  7: { clear: 0.20, rain: 0.28, storm: 0.22, hurricane: 0.15, heatwave: 0.12, fog: 0.03 }, // Aug
  8: { clear: 0.18, rain: 0.28, storm: 0.24, hurricane: 0.18, heatwave: 0.10, fog: 0.02 }, // Sep (peak hurricane)
  9: { clear: 0.25, rain: 0.28, storm: 0.20, hurricane: 0.12, heatwave: 0.10, fog: 0.05 }, // Oct
  10: { clear: 0.35, rain: 0.25, storm: 0.15, hurricane: 0.05, heatwave: 0.08, fog: 0.12 }, // Nov
  11: { clear: 0.50, rain: 0.18, storm: 0.05, hurricane: 0.00, heatwave: 0.07, fog: 0.20 }, // Dec
};

// Map game day to a seasonal month (game starts ~ January, 30 days per "month")
function getGameMonth(day) {
  return Math.floor(((day - 1) % 360) / 30);
}

function initWeatherState() {
  return {
    current: 'clear',
    previousWeather: 'clear',
    daysSinceChange: 0,
    hurricaneWarning: false,
    hurricaneDaysRemaining: 0,
    stormDaysRemaining: 0,
    postHurricaneSpike: false,
    postHurricaneDays: 0,
    totalHurricanes: 0,
    totalStorms: 0,
  };
}

function processWeatherDaily(state) {
  if (!state.weather) state.weather = initWeatherState();
  const w = state.weather;
  const msgs = [];
  const month = getGameMonth(state.day);

  w.daysSinceChange++;

  // Handle ongoing hurricane
  if (w.current === 'hurricane' && w.hurricaneDaysRemaining > 0) {
    w.hurricaneDaysRemaining--;
    if (w.hurricaneDaysRemaining <= 0) {
      w.current = 'storm';
      w.stormDaysRemaining = 2;
      w.postHurricaneSpike = true;
      w.postHurricaneDays = 7;
      msgs.push('🌀 The hurricane has passed! Damage assessment underway. Expect supply disruptions and price spikes.');
    } else {
      msgs.push('🌀 Hurricane continues. Day ' + (4 - w.hurricaneDaysRemaining) + ' — all operations suspended.');
      // Property damage check
      if (Math.random() < 0.15) {
        msgs.push('💥 Property damage reported from hurricane winds!');
      }
    }
    return msgs;
  }

  // Handle ongoing storm
  if (w.current === 'storm' && w.stormDaysRemaining > 0) {
    w.stormDaysRemaining--;
    if (w.stormDaysRemaining <= 0) {
      w.current = 'rain';
      w.daysSinceChange = 0;
      msgs.push('⛈️ Storm has subsided. Light rain continues.');
    }
    return msgs;
  }

  // Post-hurricane price spike decay
  if (w.postHurricaneSpike) {
    w.postHurricaneDays--;
    if (w.postHurricaneDays <= 0) w.postHurricaneSpike = false;
  }

  // Roll for weather change (more likely the longer current weather has lasted)
  const changeChance = Math.min(0.5, 0.1 + w.daysSinceChange * 0.05);
  if (Math.random() < changeChance || w.daysSinceChange > 5) {
    const patterns = SEASONAL_PATTERNS[month] || SEASONAL_PATTERNS[0];
    const roll = Math.random();
    let cumulative = 0;
    let newWeather = 'clear';
    for (const [weatherId, prob] of Object.entries(patterns)) {
      cumulative += prob;
      if (roll <= cumulative) { newWeather = weatherId; break; }
    }

    if (newWeather !== w.current) {
      w.previousWeather = w.current;
      w.current = newWeather;
      w.daysSinceChange = 0;

      const wType = WEATHER_TYPES.find(t => t.id === newWeather);
      if (wType) {
        msgs.push(wType.emoji + ' Weather change: ' + wType.name + ' — ' + wType.desc);
      }

      // Hurricane setup
      if (newWeather === 'hurricane') {
        w.hurricaneDaysRemaining = 1 + Math.floor(Math.random() * 3); // 1-3 days
        w.hurricaneWarning = false;
        w.totalHurricanes++;
        msgs.push('🚨 HURRICANE ALERT! All travel blocked for ' + w.hurricaneDaysRemaining + ' days!');
      }

      // Storm setup
      if (newWeather === 'storm') {
        w.stormDaysRemaining = 1 + Math.floor(Math.random() * 2);
        w.totalStorms++;
      }

      // Hurricane warning (storm often precedes hurricane in season)
      if (newWeather === 'storm' && month >= 5 && month <= 10) {
        w.hurricaneWarning = Math.random() < 0.3;
        if (w.hurricaneWarning) {
          msgs.push('⚠️ Hurricane warning issued! A hurricane may follow this storm.');
        }
      }
    }
  }

  return msgs;
}

function getWeatherEffects(state) {
  if (!state.weather) return { travelSpeed: 1.0, priceVolatility: 1.0, patrolChance: 1.0, stealthBonus: 0, demandMod: 1.0 };
  const wType = WEATHER_TYPES.find(t => t.id === state.weather.current);
  if (!wType) return { travelSpeed: 1.0, priceVolatility: 1.0, patrolChance: 1.0, stealthBonus: 0, demandMod: 1.0 };

  const effects = { ...wType.effects };

  // Post-hurricane price spike
  if (state.weather.postHurricaneSpike) {
    effects.priceVolatility = (effects.priceVolatility || 1.0) * 1.5;
    effects.demandMod = (effects.demandMod || 1.0) * 1.3;
  }

  return effects;
}

function getWeatherDisplay(state) {
  if (!state.weather) return { emoji: '☀️', name: 'Clear', color: '#ffdd00' };
  const wType = WEATHER_TYPES.find(t => t.id === state.weather.current);
  if (!wType) return { emoji: '☀️', name: 'Clear', color: '#ffdd00' };
  const colors = { clear: '#ffdd00', rain: '#4488cc', storm: '#6644aa', hurricane: '#ff2200', heatwave: '#ff6600', fog: '#aabbcc' };
  return { emoji: wType.emoji, name: wType.name, color: colors[wType.id] || '#ffffff' };
}

function getSeasonName(day) {
  const month = getGameMonth(day);
  if (month >= 5 && month <= 10) return '🌊 Hurricane Season';
  if (month >= 11 || month <= 3) return '🏖️ Tourist Season';
  return '☀️ Dry Season';
}
