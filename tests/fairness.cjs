// Fairness certification: every character must have the same opportunity to
// win and unlock everything. Each check runs the REAL unlock code path per
// character — if any character is locked out of a lender, supplier tier,
// region, ending, skill cap, or achievement, this suite fails.
const { makeSandbox, loadGame, freshState, vm } = require('./_loader.cjs');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
    console.log(`PASS  ${name}${detail ? '  — ' + detail : ''}`);
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    console.log(`FAIL  ${name}  — ${e.message}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const sandbox = makeSandbox();
const loadErrors = loadGame(sandbox);
assert(loadErrors.length === 0, 'game load errors: ' + loadErrors.join('; '));

const run = (code) => vm.runInContext(code, sandbox);
const CHARS = run(`MIAMI_CHARACTERS.map(c => c.id)`).concat(['classic']);
console.log(`Certifying ${CHARS.length} characters: ${CHARS.join(', ')}\n`);

// Build a late-game NG+ state for a character with every stat pushed high
// enough that no legitimate gate should remain closed.
function maxedState(charId) {
  const s = freshState(sandbox, charId);
  Object.assign(s, {
    day: 3000, level: 10, xp: 10000000, reputation: 1000, heat: 0,
    cash: 50000000, cleanMoney: 40000000, dirtyMoney: 10000000,
    bank: 20000000, debt: 0, loans: [],
    newGamePlus: { active: true, tier: 4, completedEndings: ['a','b','c','d','e','f','g','h','i','j','k','l'] },
  });
  s.stats = s.stats || {};
  s.stats.districtsVisited = run(`MIAMI_DISTRICTS.map(d => d.id)`);
  s.campaign = Object.assign(s.campaign || {}, { currentAct: 5 });
  s.factions = s.factions || {};
  s.factions.standings = Object.assign(s.factions.standings || {}, { zoe_pound: 100 });
  return s;
}

// ---------- 1. Every character starts clean (ledger + no crash) ----------
for (const c of CHARS) {
  check(`${c}: fresh start is clean (ledger holds, no crash)`, () => {
    const s = freshState(sandbox, c);
    assert(s && typeof s.cash === 'number', 'no state');
    const drift = Math.abs(s.cash - ((s.dirtyMoney || 0) + (s.cleanMoney || 0)));
    assert(drift < 1, `money ledger drift $${drift} at day 1`);
    return `cash $${s.cash}`;
  });
}

// ---------- 2. All lenders reachable ----------
check('all characters: every lender unlocks at max level', () => {
  for (const c of CHARS) {
    sandbox.__s = maxedState(c);
    const locked = run(`LENDERS.filter(l => !lenderUnlocked(__s, l)).map(l => l.id)`);
    assert(locked.length === 0, `${c} locked out of lenders: ${locked.join(', ')}`);
  }
  return `3 lenders x ${CHARS.length} characters`;
});

// ---------- 3. All supplier tiers reachable ----------
check('all characters: every supplier tier unlocks late-game', () => {
  for (const c of CHARS) {
    sandbox.__s = maxedState(c);
    const locked = run(`SUPPLIER_TIERS.filter(t => !supTierUnlocked(__s, t.id)).map(t => t.id)`);
    assert(locked.length === 0, `${c} locked out of supplier tiers: ${locked.join(', ')}`);
  }
  return `4 tiers x ${CHARS.length} characters`;
});

// ---------- 4. All world regions unlockable, in tier order ----------
check('all characters: every world region can be unlocked', () => {
  for (const c of CHARS) {
    sandbox.__s = maxedState(c);
    const blocked = run(`(() => {
      const s = __s;
      if (typeof ensureWorldState === 'function') ensureWorldState(s);
      if (!s.worldState) s.worldState = initWorldState();
      const byTier = [...WORLD_REGIONS].sort((a, b) => (a.unlockTier || 0) - (b.unlockTier || 0));
      const blocked = [];
      for (const r of byTier) {
        if (isRegionUnlocked(s, r.id)) continue;
        const v = canUnlockRegion(s, r.id);
        if (v.canUnlock) s.worldState.unlockedRegions.push(r.id);
        else blocked.push(r.id + ' (' + v.reasons.join(' ') + ')');
      }
      return blocked;
    })()`);
    assert(blocked.length === 0, `${c} cannot unlock: ${blocked.join('; ')}`);
  }
  return `${run('WORLD_REGIONS.length')} regions x ${CHARS.length} characters`;
});

// ---------- 5. Every skill reaches level 10 in NG+ ----------
check('all characters: every skill can reach level 10 (NG+)', () => {
  for (const c of CHARS) {
    sandbox.__s = maxedState(c);
    const stuck = run(`(() => {
      const s = __s; s.xp = 100000000; s.skills = {};
      const stuck = [];
      for (const cat of SKILL_CATEGORIES) {
        let guard = 0;
        while ((s.skills[cat.id] || 0) < 10 && guard++ < 20) {
          if (!upgradeSkill(s, cat.id)) break;
        }
        if ((s.skills[cat.id] || 0) < 10) stuck.push(cat.id + '@' + (s.skills[cat.id] || 0));
      }
      return stuck;
    })()`);
    assert(stuck.length === 0, `${c} skills capped early: ${stuck.join(', ')}`);
  }
  return `${run('SKILL_CATEGORIES.length')} skills x ${CHARS.length} characters`;
});

// ---------- 6. Endings: identical eligibility for every character ----------
// For each campaign ending, craft a state meeting its requirements, then
// assert (a) it IS reachable and (b) the verdict is IDENTICAL for all
// characters — an ending no one can get is a bug; one only SOME can get
// is a fairness violation.
check('all characters: every campaign ending equally reachable', () => {
  const endings = run(`ENDING_DEFS.map(e => ({ id: e.id, req: e.requirements || {} }))`);
  const problems = [];
  for (const e of endings) {
    const verdicts = {};
    for (const c of CHARS) {
      sandbox.__s = maxedState(c);
      sandbox.__req = e.req;
      verdicts[c] = run(`(() => {
        const s = __s, req = __req;
        // shape the state to the ending's requirements
        if (typeof req.netWorth === 'number') { s.cash = req.netWorth * 2; s.cleanMoney = s.cash; s.dirtyMoney = 0; s.bank = 0; }
        if (req.netWorth && req.netWorth.max) { s.cash = 0; s.cleanMoney = 0; s.dirtyMoney = 0; s.bank = 0; s.properties = []; s.inventory = {}; }
        if (typeof req.reputation === 'number') s.reputation = req.reputation + 100;
        if (req.reputation && req.reputation.max) s.reputation = req.reputation.max - 1; // may be negative (the_fall)
        if (req.heat && req.heat.min) s.heat = req.heat.min + 5;
        if (req.heat && req.heat.max) s.heat = Math.max(0, req.heat.max - 1);
        if (req.combat && req.combat.min) { s.skills = s.skills || {}; s.skills.combat = req.combat.min; }
        if (req.crewSize) s.henchmen = Array.from({length: req.crewSize + 2}, (_, i) => ({ id: 'h' + i, name: 'H' + i }));
        if (req.factionAlliances) { s.factions = {}; for (let i = 0; i < req.factionAlliances + 1; i++) s.factions['f' + i] = { relation: 90 }; }
        if (req.territoriesControlled) {
          // exercise the gate through the same count the game uses
          globalThis.getControlledTerritories = function(st) { return Array.from({length: (st.__terr || 0)}, (_, i) => 'T' + i); };
          s.__terr = req.territoriesControlled + 1;
        }
        return meetsEndingRequirements(s, { requirements: req });
      })()`);
    }
    const vals = Object.values(verdicts);
    if (!vals.every(v => v === true)) {
      const losers = Object.keys(verdicts).filter(k => !verdicts[k]);
      problems.push(`${e.id}: unreachable for ${losers.length === CHARS.length ? 'EVERYONE' : losers.join(', ')}`);
    }
  }
  assert(problems.length === 0, problems.join('; '));
  return `${endings.length} endings x ${CHARS.length} characters`;
});

// ---------- 7. NG+ endings reachable once NG+ is active (any character) ----------
check('all characters: NG+ endings appear at tier 4 with 12 endings done', () => {
  for (const c of CHARS) {
    sandbox.__s = maxedState(c);
    const missing = run(`(() => {
      const s = __s;
      const avail = getAvailableEndings(s).map(e => e.id);
      return NG_PLUS_ENDING_DEFS.map(e => e.id).filter(id => !avail.includes(id));
    })()`);
    assert(missing.length === 0, `${c} missing NG+ endings: ${missing.join(', ')}`);
  }
  return `${run('NG_PLUS_ENDING_DEFS.length')} NG+ endings x ${CHARS.length} characters`;
});

// ---------- 8. Character achievements: each character CAN earn its own ----------
check('every character achievement actually unlocks for its character', () => {
  const map = {
    dropout: 'char_dropout', corner_kid: 'char_corner_kid', ex_con: 'char_excon',
    hustler: 'char_hustler', connected_kid: 'char_connected', cleanskin: 'char_cleanskin',
    veteran: 'char_veteran', immigrant: 'char_immigrant',
  };
  const broken = [];
  for (const [charId, achId] of Object.entries(map)) {
    sandbox.__s = freshState(sandbox, charId);
    const got = run(`(() => { const s = __s; s.characterId = ${JSON.stringify(charId)}; try { checkAchievements(s); } catch (e) {} return (s.achievements || []).includes(${JSON.stringify(achId)}); })()`);
    if (!got) broken.push(`${achId} never unlocks for ${charId}`);
  }
  assert(broken.length === 0, broken.join('; '));
  return `${Object.keys(map).length} character achievements`;
});

// ---------- 9. Static scan: character-id literals must exist in the roster ----------
check('no dangling character-id comparisons anywhere in the code', () => {
  const roster = new Set(run(`MIAMI_CHARACTERS.map(c => c.id).concat(NG_PLUS_CHARACTERS.map(c => c.id)).concat(['classic'])`));
  const bad = [];
  for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/characterId\s*===\s*['"]([\w-]+)['"]/g)) {
      if (!roster.has(m[1])) bad.push(`${f}: '${m[1]}' is not a character id`);
    }
  }
  assert(bad.length === 0, bad.join('; '));
  return 'all characterId comparisons reference real characters';
});

const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} fairness certifications hold`);
process.exit(passed === results.length ? 0 : 1);
