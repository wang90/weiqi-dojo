/* 自动从 go-board.html 抽出 AI 核心逻辑（跑在全局作用域），方便单独跑测试 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
(function () {
  var s = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  var blocks = s.match(/<script>([\s\S]*?)<\/script>/g);
  var js = blocks[blocks.length - 1].replace(/^<script>/, '').replace(/<\/script>$/, '');
  var core = js.split('   6. \u6e32\u67d3')[0];
  core = core.slice(0, core.lastIndexOf('/* ===='));
  vm.runInThisContext(core, { filename: 'board-core.js' });
})();





/* 完整回归：规则 / 让子 / AI 棋力（回调式）/ 分片不阻塞 */
var fails = 0;
function ok(c, m) { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; }
function mk(list, turn) {
  var g = new Game(9);
  list.forEach(function (it) { g.board[it[1]][it[0]] = it[2]; });
  g.turn = turn;
  return g;
}
function clone(g) {
  var n = new Game(g.size);
  n.board = g.board.map(function (r) { return r.slice(); });
  n.turn = g.turn;
  return n;
}
function pick(g, lv) {
  return new Promise(function (res) { aiChooseMove(g, lv, res); });
}
async function hits(g, lv, n, pred) {
  var h = 0;
  for (var i = 0; i < n; i++) {
    var m = await pick(clone(g), lv);
    if (m && pred(m)) h++;
  }
  return h;
}

(async function () {
  console.log('--- 规则 ---');
  ok(mk([[4,4,WHITE],[3,4,BLACK],[5,4,BLACK],[4,3,BLACK]], BLACK).play(4,5).ok, '提子');
  ok(mk([[3,4,WHITE],[5,4,WHITE],[4,3,WHITE],[4,5,WHITE]], BLACK).play(4,4).ok === false, '禁自杀');

  console.log('--- 让子 ---');
  var hz = 0;
  [9, 13, 19].forEach(function (sz) {
    [2,3,4,5,6,7,8,9].forEach(function (n) {
      var g = new Game(sz); g.setupHandicap(n);
      if (!HANDICAP_POINTS[sz][n] || HANDICAP_POINTS[sz][n].length !== n || g.turn !== WHITE) hz++;
    });
  });
  ok(hz === 0, '让子表 72 组正常');

  console.log('--- AI 棋力 ---');
  var h1 = await hits(mk([[4,4,BLACK],[3,4,WHITE],[5,4,WHITE],[4,3,WHITE]], WHITE), 'normal', 10,
                      function (m) { return m.x === 4 && m.y === 5; });
  ok(h1 >= 7, '会吃打吃的子 ' + h1 + '/10');

  var h2 = await hits(mk([[4,4,WHITE],[3,4,BLACK],[4,3,BLACK],[4,5,BLACK]], WHITE), 'normal', 10,
                      function (m) { return m.x === 5 && m.y === 4; });
  ok(h2 >= 7, '会逃打吃 ' + h2 + '/10');

  var h3 = await hits(mk([[4,3,BLACK],[4,5,BLACK],[3,4,BLACK],[5,4,BLACK],[3,3,BLACK],[5,3,BLACK],
                          [3,5,BLACK],[5,5,BLACK],[0,0,WHITE],[8,8,WHITE]], BLACK), 'normal', 8,
                      function (m) { return m.x === 4 && m.y === 4; });
  ok(h3 === 0, '不填自己的眼');

  console.log('--- 连走 30 手全部合法 ---');
  var g2 = new Game(9); g2.setupHandicap(4);
  var allOk = true, moves = 0;
  for (var i = 0; i < 30 && !g2.over; i++) {
    var mv = await pick(g2, 'hard');
    if (!mv) { g2.pass(); continue; }
    if (!g2.play(mv.x, mv.y).ok) { allOk = false; break; }
    moves++;
  }
  ok(allOk, '连走 ' + moves + ' 手全部合法');

  console.log('--- 分片：主线程不长时间阻塞 ---');
  var probeMax = 0, last = Date.now();
  var hb = setInterval(function () {
    var now = Date.now();
    if (now - last > probeMax) probeMax = now - last;
    last = now;
  }, 1);
  var g3 = new Game(9); g3.board[4][4] = 1; g3.turn = 2;
  var t0 = Date.now();
  await pick(g3, 'hard');
  clearInterval(hb);
  console.log('      9 路高级：总耗时 ' + (Date.now() - t0) + 'ms，最长阻塞 ' + probeMax + 'ms');
  ok(probeMax <= 80, '最长阻塞 ≤ 80ms（修复前是一整段）');

  console.log('--- 取消 ---');
  var cancelled = false, cbFired = false;
  var g4 = new Game(9); g4.board[4][4] = 1; g4.turn = 2;
  aiChooseMove(g4, 'expert', function () { cbFired = true; }, function () { return cancelled; });
  setTimeout(function () { cancelled = true; }, 200);
  await new Promise(function (r) { setTimeout(r, 900); });
  ok(!cbFired, '取消后不再回调（不会落子）');

  console.log('');
  console.log(fails === 0 ? '★ 全部通过' : '★ ' + fails + ' 项失败');
  process.exit(fails === 0 ? 0 : 1);
})();
