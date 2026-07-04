// Runs the full anti-exploit + fairness certification suite.
//   node tests/run-all.cjs
const { spawnSync } = require('child_process');
const path = require('path');

const SUITES = ['exploit-invariants.cjs', 'fairness.cjs', 'integrity.cjs'];
let failed = 0;

for (const suite of SUITES) {
  console.log(`\n=== ${suite} ===`);
  const r = spawnSync('node', [path.join(__dirname, suite)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log(failed === 0
  ? '\nALL SUITES GREEN — no known exploits, all characters certified fair.'
  : `\n${failed}/${SUITES.length} suites have failures — see above.`);
process.exit(failed === 0 ? 0 : 1);
