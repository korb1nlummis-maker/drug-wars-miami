// Cross-system data integrity: every drug id referenced by another system
// must exist in DRUGS, reward-granting paths must be one-shot, and content
// ids must be unique. Catches the "content exists but can never trigger"
// class of bug (broken recipes, dead import sources, unearnable rewards).
const { makeSandbox, loadGame, freshState, vm } = require('./_loader.cjs');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}${detail ? '  — ' + detail : ''}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}  — ${e.message}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const sandbox = makeSandbox();
const loadErrors = loadGame(sandbox);
assert(loadErrors.length === 0, 'game load errors: ' + loadErrors.join('; '));
const run = (code) => vm.runInContext(code, sandbox);

const drugIds = new Set(run('DRUGS.map(d => d.id)'));

// ---------- 1. Processing recipes reference real drugs ----------
check('every processing recipe input/output drug exists', () => {
  const bad = run(`PROCESSING_RECIPES.flatMap(r =>
    Object.keys(r.input || {}).concat(Object.keys(r.output || {}))
      .filter(id => !DRUGS.some(d => d.id === id))
      .map(id => r.id + ": '" + id + "'"))`);
  assert(bad.length === 0, 'dead recipe drug ids: ' + [...new Set(bad)].join(', '));
  return `${run('PROCESSING_RECIPES.length')} recipes`;
});

// ---------- 2. Import sources reference real drugs ----------
check('every international source drug exists', () => {
  const bad = run(`INTERNATIONAL_SOURCES.flatMap(s =>
    (s.drugs || []).filter(id => !DRUGS.some(d => d.id === id))
      .map(id => s.id + ": '" + id + "'"))`);
  assert(bad.length === 0, 'dead source drug ids: ' + [...new Set(bad)].join(', '));
  return `${run('INTERNATIONAL_SOURCES.length')} sources`;
});

// ---------- 3. Supplier catalogs reference real drugs ----------
check('every supplier catalog drug exists', () => {
  const bad = run(`SUPPLIERS.flatMap(s =>
    (s.catalog || []).filter(id => !DRUGS.some(d => d.id === id))
      .map(id => s.id + ": '" + id + "'"))`);
  assert(bad.length === 0, 'dead catalog drug ids: ' + [...new Set(bad)].join(', '));
  return `${run('SUPPLIERS.length')} suppliers`;
});

// ---------- 4. Achievement ids are unique (dupes = one is unearnable) ----------
check('achievement ids are unique', () => {
  const dupes = run(`(() => {
    const seen = new Set(), dupes = [];
    for (const a of ACHIEVEMENTS) { if (seen.has(a.id)) dupes.push(a.id); seen.add(a.id); }
    return dupes;
  })()`);
  assert(dupes.length === 0, 'duplicate achievement ids: ' + dupes.join(', '));
  return `${run('ACHIEVEMENTS.length')} achievements`;
});

// ---------- 5. Achievements pay XP exactly once ----------
check('re-running achievement checks never re-pays XP or duplicates', () => {
  sandbox.__s = freshState(sandbox, 'hustler');
  const r = run(`(() => {
    const s = __s;
    s.day = 30; s.cash = 100000; s.cleanMoney = 100000; s.dirtyMoney = 0;
    try { checkAchievements(s); } catch (e) {}
    const afterFirst = { count: (s.achievements || []).length, xp: s.xp || 0 };
    try { checkAchievements(s); checkAchievements(s); } catch (e) {}
    const hasDupes = new Set(s.achievements).size !== s.achievements.length;
    return { afterFirst, count: s.achievements.length, xp: s.xp || 0, hasDupes };
  })()`);
  assert(!r.hasDupes, 'duplicate entries in state.achievements after re-check');
  assert(r.count === r.afterFirst.count, `re-check added achievements: ${r.afterFirst.count} -> ${r.count}`);
  assert(r.xp === r.afterFirst.xp, `re-check re-paid XP: ${r.afterFirst.xp} -> ${r.xp}`);
  return `${r.count} unlocked once, XP stable at ${r.xp}`;
});

// ---------- 6. Tutorial rewards are guarded one-shot (static) ----------
check('tutorial reward granting has a one-shot guard', () => {
  const src = fs.readFileSync(path.join(ROOT, 'tutorial-system.js'), 'utf8');
  assert(/rewardsGiven\[stepIndex\]\)\s*return/.test(src), 'grantStepReward lost its rewardsGiven guard');
  return 'rewardsGiven guard present';
});

// ---------- 7b. Every campaign flag an ending reads must have a setter ----------
check('every campaign flag read by an ending check has a setter', () => {
  const allSrc = fs.readdirSync(ROOT).filter(f => f.endsWith('.js'))
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const reads = new Set();
  for (const m of allSrc.matchAll(/\.flags\s*&&\s*[\w.]+\.flags\.(\w+)/g)) reads.add(m[1]);
  for (const m of allSrc.matchAll(/hasCampaignFlag\([^,]+,\s*'(\w+)'/g)) reads.add(m[1]);
  const orphans = [...reads].filter(flag =>
    !new RegExp(`setCampaignFlag\\([^,]+,\\s*'${flag}'`).test(allSrc) &&
    !new RegExp(`flags\\.${flag}\\s*=`).test(allSrc));
  assert(orphans.length === 0, 'flags read but never set (endings unreachable): ' + orphans.join(', '));
  return `${reads.size} flags, all settable`;
});

// ---------- 7. Drug ids in DRUGS are themselves unique ----------
check('drug ids are unique', () => {
  const dupes = run(`(() => {
    const seen = new Set(), dupes = [];
    for (const d of DRUGS) { if (seen.has(d.id)) dupes.push(d.id); seen.add(d.id); }
    return dupes;
  })()`);
  assert(dupes.length === 0, 'duplicate drug ids: ' + dupes.join(', '));
  return `${drugIds.size} drugs`;
});

const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} integrity checks hold`);
process.exit(passed === results.length ? 0 : 1);
