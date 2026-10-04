
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
  console.log('--- 用时 ---');
  ok(G.moveTimeList.length === 2, '记录每手用时：人 1 手 + 电脑 1 手');
  ok(G.moveTimeList[0].color === 1 && G.moveTimeList[1].color === 2, '每手用时颜色正确');
  ok(/^\d{2}:\d{2}$/.test(ctx.byId['totalTime'].textContent), '总用时显示为时钟格式');
  ok(/^\d+(\.\d+)?s$|^\d{2}:\d{2}$/.test(ctx.byId['lastMoveTime'].textContent), '上一步用时已显示');
  ok(ctx.byId['railMoveTimes'].innerHTML.indexOf('rail-move-row') >= 0, '棋盘边计时条显示每手用时');
  ok(ctx.byId['railMoveTimes'].innerHTML.indexOf('mt-dot') >= 0, '左侧每手时间前有黑白棋子标记');
  ok(ctx.byId['moveTimes'].innerHTML.indexOf('mt-dot') >= 0, '右侧每手时间前有黑白棋子标记');
  ok(/^\d{2}:\d{2}$/.test(ctx.byId['railTotalTime'].textContent), '棋盘边计时条显示总用时');
  ok(ctx.byId['stopwatchSide'].textContent === '黑棋', '秒表跟随当前手方');
  ok(/^\d{2}:\d{2}$/.test(ctx.byId['stopwatchTime'].textContent), '秒表显示累计用时（精确到秒）');
  ok(ctx.byId['timeRail'].classList.contains('collapsed'), '左侧用时默认收起');
  ctx.byId['railToggle']._ls.click[0]();
  ok(ctx.byId['timeRail'].classList.contains('collapsed') === false, '点击展开左侧用时明细');
  ctx.byId['railToggle']._ls.click[0]();
  ok(ctx.byId['timeRail'].classList.contains('collapsed'), '再次点击收起');

  console.log('');
  console.log('--- 思考期间快速连点 10 次 ---');
  var m2 = G.game.moveCount;
  click(ctx, 2, 2);                       /* 触发电脑思考 */
  await new Promise(function (r) { setTimeout(r, 300); });
  ok(G.aiThinking === true, '电脑已进入思考状态');
  ok(ctx.byId['stopwatchSide'].textContent === '白棋', '换手后秒表切换到另一方');
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
  console.log('--- 点目 ---');
  var gCount = new G.Game(9);
  for (var cy = 0; cy < 9; cy++) for (var cx = 0; cx < 9; cx++) gCount.board[cy][cx] = 2;
  gCount.board[0][0] = 0;   /* 左上角空点 */
  gCount.board[1][0] = 1;   /* 黑棋围住左上角 */
  gCount.board[0][1] = 1;
  var scCount = G.scorePosition(gCount.board, 9);
  ok(scCount.blackTerr === 1 && scCount.owner[0] === 1, '点目：左上角被黑棋围住，标为黑地');
  ok(scCount.white >= 6.5, '点目：白棋含贴目 6.5');
  var countBtn = ctx.byId['btnCount'];
  countBtn._ls.click[0]();
  ok(G.countVisible === true && ctx.byId['countCard'].style.display === '', '点击「点目」显示结果卡片');
  countBtn._ls.click[0]();
  ok(G.countVisible === false && ctx.byId['countCard'].style.display === 'none', '再次点击关闭点目');

  console.log('');
  console.log('--- 电脑自动认输 ---');
  G.mode = 'ai';
  var gWin = new G.Game(9);
  gWin.moveCount = 40;
  for (var yy = 0; yy < 9; yy++) for (var xx = 0; xx < 9; xx++) gWin.board[yy][xx] = 1;
  gWin.board[4][4] = 2; gWin.board[4][5] = 2; gWin.board[5][4] = 2;
  gWin.board[5][5] = 2; gWin.board[0][0] = 2;
  gWin.turn = 2;
  var oldGame = G.game;
  G.game = gWin;
  ok(G.shouldAIResign() === true, '电脑明显落后且棋盘定型时会认输');
  G.scheduleAi();
  ok(gWin.over === true, '电脑认输后对局结束');
  ok(ctx.byId['modalTitle'].textContent === '电脑认输了', '弹出电脑认输提示');
  G.game = oldGame;

  var gEarly = new G.Game(9);
  gEarly.turn = 2;
  G.game = gEarly;
  ok(G.shouldAIResign() === false, '开局不会误认输');
  G.game = oldGame;

  console.log('');
  console.log('--- 人机执白 ---');
  G.humanColor = 2;
  G.startGame();
  await new Promise(function (r) { setTimeout(r, 1600); });
  ok(G.game.moveCount === 1 && G.game.turn === 2, '玩家执白时电脑执黑先下');
  click(ctx, 2, 2);
  await new Promise(function (r) { setTimeout(r, 1600); });
  ok(G.game.moveCount === 3 && G.game.turn === 2, '玩家执白可以落子，电脑继续执黑回应');
  G.humanColor = 1;

  console.log('');
  console.log(fails === 0 ? '★ 全部通过' : '★ ' + fails + ' 项失败');
  process.exit(fails === 0 ? 0 : 1);
})();
