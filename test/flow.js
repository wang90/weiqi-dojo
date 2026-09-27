
/* 页面级测试：人落子 → 电脑回应；思考中连点 → 不应连环触发 */
var fs = require('fs');
var vm = require('vm');
var ROOT = require('path').join(__dirname, '..');

var fails = 0;
function ok(c, m) { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; }

function El(tag) {
  this.tagName = (tag || 'div').toUpperCase();
  this.style = {}; this.dataset = {}; this.childNodes = []; this.children = this.childNodes;
  this.textContent = ''; this._html = ''; this.className = ''; this.value = '';
  this._ls = {}; this._set = {};
  var set = this._set, self = this;
  this.classList = {
    add: function (c) { set[c] = 1; }, remove: function (c) { delete set[c]; },
    toggle: function (c, v) { if (v === undefined) v = !set[c]; if (v) set[c] = 1; else delete set[c]; },
    contains: function (c) { return !!set[c]; }
  };
  Object.defineProperty(this, 'innerHTML', {
    get: function () { return self._html; },
    set: function (v) { self._html = v; self.textContent = String(v).replace(/<[^>]*>/g, ''); self.childNodes = []; }
  });
  this.nodeType = 1;
}
El.prototype.addEventListener = function (t, f) { (this._ls[t] = this._ls[t] || []).push(f); };
El.prototype.appendChild = function (c) { this.childNodes.push(c); return c; };
El.prototype.querySelectorAll = function () { return []; };
El.prototype.querySelector = function () { return null; };
El.prototype.closest = function () { return null; };
El.prototype.getContext = function () { return ctxStub; };
El.prototype.getBoundingClientRect = function () { return { width: 900, height: 700, left: 0, top: 0 }; };
El.prototype.getAttribute = function (k) { return this._attrs ? this._attrs[k] : null; };
El.prototype.setAttribute = function (k, v) { (this._attrs = this._attrs || {})[k] = v; };
El.prototype.scrollIntoView = function () {};
El.prototype.click = function () {};
var ctxStub = new Proxy({}, { get: function () { return function () { return ctxStub; }; }, set: function () { return true; } });

function boot() {
  var byId = {};
  var board = new El('canvas');
  board.getBoundingClientRect = function () { return { width: 900, height: 700, left: 0, top: 0 }; };
  var body = new El('body');
  var modeInput = new El('input'); modeInput.value = 'ai';
  var sizeBtns = [9, 13, 19].map(function (n) { var b = new El('button'); b.dataset.size = String(n); return b; });

  var doc = {
    readyState: 'loading', body: body, head: new El('head'),
    documentElement: new El('html'), title: '围棋练习盘',
    _ls: {}, addEventListener: function (t, f) { (this._ls[t] = this._ls[t] || []).push(f); },
    getElementById: function (id) { if (id === 'board') return board; if (!byId[id]) byId[id] = new El('div'); return byId[id]; },
    querySelector: function () { return body; },
    querySelectorAll: function (s) {
      if (s.indexOf('mode') >= 0) return [modeInput];
      if (s.indexOf('sizes') >= 0) return sizeBtns;
      return [];
    },
    createElement: function (t) { return new El(t); }
  };
  var store = { 'weiqi.lang': 'zh' };
  var sb = {
    console: console, document: doc, navigator: { language: 'zh' },
    localStorage: { getItem: function (k) { return store[k] === undefined ? null : store[k]; }, setItem: function (k, v) { store[k] = v; } },
    performance: { now: function () { return Date.now(); } },
    setTimeout: setTimeout, clearTimeout: clearTimeout,
    setInterval: setInterval, clearInterval: clearInterval,
    requestAnimationFrame: function (f) { return setTimeout(f, 0); },
    alert: function () {}, confirm: function () { return true; },
    FileReader: function () {}, MutationObserver: function () { this.observe = function () {}; },
    location: { reload: function () {} },
    addEventListener: function () {}, removeEventListener: function () {},
    devicePixelRatio: 2, ResizeObserver: null
  };
  sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb);

  vm.runInContext(fs.readFileSync(ROOT + '/i18n.js', 'utf8'), sb, { filename: 'i18n.js' });
  var html = fs.readFileSync(ROOT + '/index.html', 'utf8');
  var pageJs = html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/^<script>|<\/script>$/g, '');
  vm.runInContext(pageJs, sb, { filename: 'index.html' });

  return { sb: sb, board: board, byId: byId };
}

function click(ctx, x, y) {
  var h = ctx.board._ls.pointerdown[0];
  var S = parseFloat(ctx.board.style.width) || 696;
  var cell = S / 10;
  h({ preventDefault: function () {}, clientX: cell * (x + 1), clientY: cell * (y + 1) });
}

(async function () {
  var ctx = boot();
  await new Promise(function (r) { setTimeout(r, 120); });

  var G = ctx.sb;
  console.log('--- 正常一手 ---');
  var before = G.game.moveCount;
  click(ctx, 4, 4);
  ok(G.game.moveCount === before + 1, '人落子成功（手数 ' + before + ' → ' + G.game.moveCount + '）');
  ok(G.game.turn === 2, '轮到白棋');

  /* 点评应该出结果（而不是被 try/catch 静默吞掉） */
  var gradeEl = ctx.byId['coachGrade'];
  var bodyEl = ctx.byId['coachBody'];
  var grades = ['好棋', '不错', '一般', '有点亏', '失误'];
  ok(grades.indexOf(gradeEl.textContent) >= 0,
     '点评评级 = "' + gradeEl.textContent + '"');
  ok(bodyEl.innerHTML.length > 0, '点评内容非空');
  console.log('        点评正文: ' + String(bodyEl.innerHTML).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60));

  await new Promise(function (r) { setTimeout(r, 1600); });
  ok(G.game.moveCount === before + 2, '电脑已回应（手数 ' + G.game.moveCount + '）');
  ok(G.game.turn === 1, '轮回黑棋');
  ok(G.aiThinking === false, '思考状态已复位');

  console.log('');
  console.log('--- 思考期间快速连点 10 次 ---');
  var m2 = G.game.moveCount;
  click(ctx, 2, 2);                       /* 触发电脑思考 */
  await new Promise(function (r) { setTimeout(r, 300); });
  ok(G.aiThinking === true, '电脑已进入思考状态');
  for (var i = 0; i < 10; i++) click(ctx, 6, 6);   /* 狂点 */
  await new Promise(function (r) { setTimeout(r, 1600); });
  var added = G.game.moveCount - m2;
  ok(added === 2, '连点 10 次只产生「人 1 手 + 电脑 1 手」= ' + added + ' 手（没有连环触发）');
  ok(G.game.turn === 1, '轮回黑棋');
  ok(G.aiThinking === false, '思考状态复位');

  console.log('');
  console.log('--- 连点后立刻再落子，仍应正常 ---');
  var m3 = G.game.moveCount;
  click(ctx, 0, 0);
  await new Promise(function (r) { setTimeout(r, 1600); });
  ok(G.game.moveCount === m3 + 2, '还能正常再下一手（' + m3 + ' → ' + G.game.moveCount + '）');

  console.log('');
  console.log('--- 思考中重新开始，旧结果不应落子 ---');
  var m4 = G.game.moveCount;
  click(ctx, 8, 8);
  await new Promise(function (r) { setTimeout(r, 300); });
  ok(G.aiThinking === true, '正在思考');
  G.startGame();                          /* 重开 */
  var afterReset = G.game.moveCount;
  await new Promise(function (r) { setTimeout(r, 1800); });
  ok(G.game.moveCount === afterReset, '重开后旧计算没有落子（手数保持 ' + G.game.moveCount + '）');

  console.log('');
  console.log(fails === 0 ? '★ 全部通过' : '★ ' + fails + ' 项失败');
  process.exit(fails === 0 ? 0 : 1);
})();
