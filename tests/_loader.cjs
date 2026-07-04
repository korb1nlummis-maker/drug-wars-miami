// Loads the whole game into a Node vm sandbox (no DOM, no network).
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');

function makeSandbox() {
  const noopEl = () => ({ innerHTML: '', textContent: '', style: {}, classList: { add(){}, remove(){}, contains(){ return false; } }, appendChild(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, addEventListener(){}, scrollTop: 0, scrollHeight: 0, value: '' });
  const sandbox = {
    console: { log(){}, warn(){}, error(){} },
    Math, JSON, Date, parseInt, parseFloat, isNaN, Array, Object, String, Number, Boolean, RegExp, Error, Promise, Set, Map,
    setTimeout: () => 0, setInterval: () => 0, clearInterval(){}, clearTimeout(){}, requestAnimationFrame: () => 0,
    performance: { now: () => Date.now() },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: noopEl, body: noopEl(), head: noopEl(), addEventListener(){}, hidden: true },
    localStorage: { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; } },
    navigator: { userAgent: 'node' }, alert(){}, confirm(){ return true; }, prompt(){ return ''; },
    Audio: function(){ return { play(){ return { catch(){} }; }, pause(){}, addEventListener(){}, load(){} }; },
    fetch: () => Promise.reject(new Error('no net')),
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

function loadGame(sandbox) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  const errors = [];
  for (const f of scripts) {
    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }); }
    catch (e) { errors.push(f + ': ' + e.message); }
  }
  return errors;
}

function freshState(sandbox, charId) {
  return vm.runInContext(`(() => {
    const s = createGameState();
    applyCharacterToState(s, ${JSON.stringify(charId || 'hustler')});
    generatePrices(s);
    return s;
  })()`, sandbox);
}

module.exports = { makeSandbox, loadGame, freshState, vm, ROOT };
