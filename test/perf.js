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





/* 验证：AI 分片后是否仍然可用、主线程最长阻塞多久 */

var fails = 0;
function ok(c, m) { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; }

/* 用 1ms 心跳采样主线程被阻塞的时间 */
function makeProbe() {
  var last = Date.now(), maxBlock = 0, ticks = 0;
  var h = setInterval(function () {
    var now = Date.now();
    var gap = now - last;
    if (gap > maxBlock) maxBlock = gap;
    last = now;
    ticks++;
  }, 1);
  return {
    stop: function () { clearInterval(h); return maxBlock; },
    getMax: function () { return maxBlock; }
  };
}

function testLevel(size, lv, setup) {
  var g = new Game(size);
  setup(g);
  var probe = makeProbe();
  var t0 = Date.now();
  return new Promise(function (resolve) {
    aiChooseMove(g, lv, function (mv) {
      var elapsed = Date.now() - t0;
      var maxBlock = probe.stop();
      resolve({ mv: mv, elapsed: elapsed, maxBlock: maxBlock, g: g });
    });
  });
}

(async function () {
  console.log('--- 9 路 · 高级（原本阻塞 ~900ms）---');
  var r1 = await testLevel(9, 'hard', function (g) { g.board[4][4] = 1; g.board[2][2] = 2; g.turn = 1; });
  ok(!!r1.mv, '给出着法 (' + r1.mv.x + ',' + r1.mv.y + ')');
  ok(r1.g.board[r1.mv.y][r1.mv.x] === 0, '着法落在空点上');
  console.log('      总耗时 ' + r1.elapsed + 'ms，主线程最长连续阻塞 ' + r1.maxBlock + 'ms');
  ok(r1.maxBlock <= 80, '最长阻塞 ≤ 80ms（原来会是 ' + r1.elapsed + 'ms 一口气卡住）');

  console.log('--- 13 路 · 高级 ---');
  var r2 = await testLevel(13, 'hard', function (g) { g.board[6][6] = 1; g.board[3][3] = 2; g.turn = 1; });
  ok(!!r2.mv, '给出着法 (' + r2.mv.x + ',' + r2.mv.y + ')');
  console.log('      总耗时 ' + r2.elapsed + 'ms，主线程最长连续阻塞 ' + r2.maxBlock + 'ms');
  ok(r2.maxBlock <= 80, '最长阻塞 ≤ 80ms');

  console.log('--- 19 路 · 高级（原本阻塞 ~1s）---');
  var r3 = await testLevel(19, 'hard', function (g) {
    for (var i = 0; i < 40; i++) {
      g.board[(i * 7) % 19][(i * 11) % 19] = (i % 2) ? 1 : 2;
    }
    g.turn = 1;
  });
  ok(!!r3.mv, '给出着法 (' + r3.mv.x + ',' + r3.mv.y + ')');
  console.log('      总耗时 ' + r3.elapsed + 'ms，主线程最长连续阻塞 ' + r3.maxBlock + 'ms');
  ok(r3.maxBlock <= 120, '最长阻塞 ≤ 120ms');

  console.log('--- 入门档（时间很短，也要能出招）---');
  var r4 = await testLevel(9, 'easy', function (g) { g.board[4][4] = 1; g.turn = 2; });
  ok(!!r4.mv, '入门档给出着法 (' + r4.mv.x + ',' + r4.mv.y + ')');

  console.log('--- 让子局 / 空盘边界 ---');
  var g5 = new Game(9); g5.setupHandicap(4);
  var r5 = await new Promise(function (res) { aiChooseMove(g5, 'normal', res); });
  ok(!!r5 && g5.board[r5.y][r5.x] === 0, '让子局正常出招');

  console.log('');
  console.log(fails === 0 ? '★ 全部通过' : '★ ' + fails + ' 项失败');
  process.exit(fails === 0 ? 0 : 1);
})();
