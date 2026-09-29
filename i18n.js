/*!
 * 围棋练习盘 · Weiqi Dojo — 国际化 / i18n
 *
 * 做法：以「中文原文」作为 key，页面加载后自动遍历 DOM 替换文本节点与属性。
 * 动态拼接的文案在页面里通过 t('模板 {n}', {...}) 调用。
 *
 * 支持：中文（原文）· English · 日本語 · 한국어
 */
(function (global) {
  'use strict';

  var LANGS = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' }
  ];
  var STORE_KEY = 'weiqi.lang';
  var DICT = { en: {}, ja: {}, ko: {} };
  var LANG = 'zh';

  function add(lang, obj) {
    var d = DICT[lang];
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) d[k] = obj[k];
    }
  }

  /* ------------------------------------------------------------------
     翻译一段文字。vars 用于替换 {name} 占位符
     ------------------------------------------------------------------ */
  function t(s, vars) {
    if (s === undefined || s === null) return s;
    var d = DICT[LANG];
    var out = (d && d[s] !== undefined) ? d[s] : s;
    if (vars) {
      out = String(out).replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] !== undefined ? vars[k] : m;
      });
    }
    return out;
  }

  var CJK = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
  var INLINE_TAGS = { B: 1, I: 1, EM: 1, STRONG: 1, SPAN: 1, BR: 1, CODE: 1, A: 1, SMALL: 1, U: 1 };

  /* 元素里只有文本和行内标签（没有块级子元素） */
  function inlineOnly(el) {
    var kids = el.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.nodeType === 1 && !INLINE_TAGS[k.tagName]) return false;
    }
    return true;
  }

  function walk(node) {
    if (node.nodeType === 3) {                       /* 文本节点 */
      var raw = node.nodeValue;
      if (!raw) return;
      var key = raw.trim();
      if (!key || !CJK.test(key)) return;
      var d = DICT[LANG];
      if (d && d[key] !== undefined) {
        var lead = raw.match(/^\s*/)[0];
        var trail = raw.match(/\s*$/)[0];
        node.nodeValue = lead + d[key] + trail;
      }
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;

    /* 1) 整块替换：段落里夹着 <b> 等行内标签时，整段一起翻译才不会语序错乱 */
    if (inlineOnly(node)) {
      var html = node.innerHTML;
      if (html) {
        var hk = html.trim();
        var dh = DICT[LANG];
        if (hk && CJK.test(hk) && dh && dh[hk] !== undefined) {
          node.innerHTML = dh[hk];
          return;
        }
      }
    }

    /* 2) 属性 */
    var attrs = ['title', 'placeholder', 'aria-label'];
    for (var i = 0; i < attrs.length; i++) {
      var v = node.getAttribute(attrs[i]);
      if (!v) continue;
      var k = v.trim();
      if (CJK.test(k) && DICT[LANG][k] !== undefined) node.setAttribute(attrs[i], DICT[LANG][k]);
    }

    /* 3) 递归子节点 */
    var kids = node.childNodes;
    for (var j = 0; j < kids.length; j++) walk(kids[j]);
  }

  function translateDOM(root) {
    if (LANG === 'zh') return;
    try { walk(root || document.body || document.documentElement); } catch (e) {}
  }

  /* ------------------------------------------------------------------
     语言切换（存 localStorage 后整页刷新，最稳）
     ------------------------------------------------------------------ */
  function setLang(code) {
    if (code === LANG) return;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}
    if (global.location && global.location.reload) global.location.reload();
  }

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (saved === 'zh' || (saved && DICT[saved])) return saved;
    var nav = String((navigator.language || navigator.userLanguage || '')).toLowerCase();
    if (nav.indexOf('ja') === 0) return 'ja';
    if (nav.indexOf('ko') === 0) return 'ko';
    if (nav.indexOf('zh') === 0) return 'zh';
    return 'en';
  }

  /* ------------------------------------------------------------------
     右上角语言切换按钮
     ------------------------------------------------------------------ */
  function mountSwitcher() {
    if (!document.body || document.getElementById('i18n-switch')) return;
    var box = document.createElement('div');
    box.id = 'i18n-switch';
    box.style.cssText = 'display:inline-flex;gap:2px;background:rgba(255,255,255,.08);' +
      'border-radius:10px;padding:3px;vertical-align:middle;flex:0 0 auto';

    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = l.label;
      b.style.cssText = 'border:0;background:transparent;color:#9fb3c8;font-family:inherit;' +
        'font-size:12px;font-weight:700;padding:6px 9px;border-radius:7px;cursor:pointer;' +
        'white-space:nowrap;line-height:1.2';
      if (l.code === LANG) {
        b.style.background = '#f0c060';
        b.style.color = '#231a08';
      }
      b.onclick = function () { setLang(l.code); };
      box.appendChild(b);
    });

    var host = document.querySelector('.head-right') ||
               document.querySelector('header') ||
               document.querySelector('.topbar') ||
               document.body;
    host.appendChild(box);
  }

  /* ------------------------------------------------------------------
     动态插入的内容也自动翻译
     ------------------------------------------------------------------ */
  function watch() {
    if (LANG === 'zh' || !global.MutationObserver || !document.body) return;
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      (global.requestAnimationFrame || function (f) { setTimeout(f, 16); })(function () {
        pending = false;
        translateDOM(document.body);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function boot() {
    LANG = detect();
    document.documentElement.lang = LANG;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
      return;
    }
    if (document.title) document.title = t(document.title);
    mountSwitcher();
    translateDOM(document.body);
    watch();
  }

  global.I18N = {
    t: t,
    add: add,
    keys: function (lang) {
      var out = [];
      for (var k in DICT[lang || LANG]) {
        if (Object.prototype.hasOwnProperty.call(DICT[lang || LANG], k)) out.push(k);
      }
      return out;
    },
    translateDOM: translateDOM,
    setLang: setLang,
    lang: function () { return LANG; },
    LANGS: LANGS
  };
  global.t = t;                       /* 页面里直接写 t(...) */

  boot();
})(window);

/* ==========================================================================
   对弈页 / board page
   ========================================================================== */

/* ------------------------------- English ------------------------------- */
I18N.add('en', {
  '围棋练习盘': 'Weiqi Dojo',
  '死活题 · 打谱': 'Life & Death · Records',
  '围棋入门教程': 'Beginner Tutorial',

  '9 路': '9×9', '13 路': '13×13', '19 路': '19×19',

  '黑棋落子': 'Black to play',
  '白棋落子': 'White to play',
  '（电脑）': ' (Computer)',
  '电脑思考中': 'Computer is thinking',
  '思考中': 'Thinking',
  '对局结束': 'Game over',
  '对局已结束': 'Game over',
  '对局已经结束了': 'The game is already over',
  '让{n}子': 'handicap {n}',

  '黑方提子': 'Black captures',
  '白方提子': 'White captures',
  '总手数': 'Total moves',

  '悔棋': 'Undo',
  '虚手': 'Pass',
  '结束数子': 'End & count',
  '重新开始': 'Restart',
  '再来一局': 'Play again',
  '看看棋盘': 'View board',

  '对局模式': 'Game mode',
  '双人对弈': 'Two players',
  '与电脑对弈': 'vs Computer',
  '选择执子': 'Choose your color',
  '执黑': 'Play Black', '执白': 'Play White',
  '选择白棋时，电脑执黑先下。': 'If you choose White, the computer plays Black and moves first.',
  '让子棋中电脑执黑，摆好让子后你执白先走。':
    'With handicap, the computer plays Black; after handicap stones are placed, you play White first.',

  '让子（黑方先摆）': 'Handicap (Black places first)',
  '不让': 'None',
  '让子数越多，电脑越吃力。9 路建议让 3～5 子。':
    'More handicap stones make it easier for you. On 9×9, 3–5 stones is a good start.',
  '双人模式下，白棋先走（黑方已摆让子）。':
    'In two-player mode White moves first (handicap stones already placed).',

  '电脑棋力': 'Computer strength',
  '入门': 'Beginner', '初级': 'Easy', '中级': 'Intermediate', '高级': 'Advanced',
  '棋力越高，电脑思考越久、下得越好。':
    'Higher level means longer thinking and stronger play.',

  '落子点评': 'Move comments',
  '开启': 'On', '关闭': 'Off',
  '关闭点评': 'Close',
  '开启后，你每落一子都会告诉你这步棋的优点和缺点。':
    'When on, every move you play is reviewed — its pros and cons.',
  '落子后会告诉你这步棋的优缺点': 'Each move gets reviewed here',
  '点评已关闭': 'Comments are off',
  '点评失败': 'Review failed',
  '优点': 'Pros', '缺点': 'Cons',
  '这步棋没有明显问题，不过别处可能有更好的点。':
    'Nothing wrong with this move, though there may be a better point.',
  '这步棋很稳，没什么可挑的': 'Solid move — nothing to fault',

  '好棋': 'Great', '不错': 'Good', '一般': 'Fair', '有点亏': 'Slightly bad', '失误': 'Blunder',
  '几乎是最好的选择': 'Nearly the best move',
  '这步棋下得可以': 'A decent move',
  '还行，但还有更好的点': 'OK, but there is a better point',
  '这步棋有点可惜': 'This move is a bit of a shame',
  '这步棋亏得比较多': 'This move loses quite a bit',

  '提掉对方 {n} 子': 'Captured {n} stone(s)',
  '提完之后自己还很安全': 'Safe after the capture',
  '把自己被打吃的棋救出来了': 'Rescued your stone(s) from atari',
  '打吃对方，对方只剩 1 口气': 'Atari — the opponent has one liberty left',
  '和自己的棋连成一片': 'Connected with your own stones',
  '占到了星位，是开局的好点': 'Took a star point — a good opening move',
  '位置在三四线，进退都方便': 'On the 3rd/4th line — good balance',
  '紧贴对方，限制了对方的发展': 'Pressed the opponent, limiting their development',

  '自己只有 2 口气，有点危险': 'Only 2 liberties — a bit risky',
  '这手棋自己只剩 1 口气，对方下一步就能提掉':
    'This leaves your stone with 1 liberty — the opponent can capture next move',
  '下在一线（最边上），几乎围不到地': 'On the first line — barely encloses any territory',
  '下在二线，位置偏低，发展性差': 'On the second line — too low, little potential',
  '这是在填自己的空，等于白走一手': 'Filling your own territory — a wasted move',
  '小心！对方下一手能吃掉你 {n} 子':
    'Careful! Your opponent can capture {n} of your stones next move',
  '其实下在 {pos} 可以提掉对方 {n} 子':
    'Actually {pos} would capture {n} stone(s)',
  '换个地方下在 {pos} 会更好': '{pos} would be a better place to play',

  '这里不能落子': 'You cannot play here',
  '不能自杀：这手棋自己没气':
    'Illegal: that move would leave your own stone with no liberties',
  '打劫：不能马上提回来': 'Ko: you cannot recapture immediately',
  '还没有可悔的棋': 'No moves to undo',
  '对局结束了，点「重新开始」吧': 'The game is over — tap "Restart" to play again',
  '确定要重新开始吗？': 'Restart the game?',

  '恭喜！你赢了': 'Congratulations, you win!',
  '这局电脑赢了': 'The computer won this one',
  '{side}（你）赢了 {n} 目，太棒了！':
    '{side} (you) wins by {n} points. Well done.',
  '{side}（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    '{side} (computer) wins by {n} points. Do not be discouraged - try again.',
  '黑棋胜': 'Black wins', '白棋胜': 'White wins', '和棋': 'Draw',
  '黑棋（你）赢了 {n} 目，太棒了！':
    'Black (you) wins by {n} points. Well done!',
  '白棋（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    'White (computer) wins by {n} points. Do not be discouraged — try again!',
  '黑棋赢了 {n} 目。': 'Black wins by {n} points.',
  '白棋赢了 {n} 目。': 'White wins by {n} points.',
  '双方目数相同。': 'Both sides have the same score.',
  '双方连续虚手': 'Both players passed',
  '手动结束': 'Ended manually',
  '结束原因：{reason}': 'Reason: {reason}',
  '黑棋：{s} 子 + {t} 目 = <b>{total}</b>':
    'Black: {s} stones + {t} points = <b>{total}</b>',
  '白棋：{s} 子 + {t} 目 + 贴目 {komi} = <b>{total}</b>':
    'White: {s} stones + {t} points + komi {komi} = <b>{total}</b>',

  '点目': 'Score estimate',
  '当前点目': 'Current score estimate',
  '黑棋': 'Black', '白棋': 'White',
  '形势接近，胜负难分': 'Close game — too near to call',
  '黑棋领先 {n} 目': 'Black leads by {n} points',
  '白棋领先 {n} 目': 'White leads by {n} points',
  '按中国规则估算：棋子 + 围住的空点，白棋含贴目 6.5。中盘仅供参考，死子请自行提掉。':
    'Estimated by Chinese area scoring: stones + surrounded empty points; White includes 6.5 komi. Midgame estimates are approximate — capture dead stones first.',
  '电脑认输': 'Computer resigned',
  '电脑认输了': 'The computer resigned',
  '电脑判断形势已落后 {n} 目，主动认输。':
    'The computer judged itself behind by {n} points and resigned.',

  '用时': 'Time',
  '本手': 'Current move',
  '上一步': 'Last move',
  '总用时': 'Total time',
  '每步耗时': 'Move times',
  '黑': 'B', '白': 'W'
});

/* ------------------------------- 日本語 ------------------------------- */
I18N.add('ja', {
  '围棋练习盘': '囲碁練習盤',
  '死活题 · 打谱': '詰碁・棋譜並べ',
  '围棋入门教程': '囲碁入門ガイド',

  '9 路': '9路盤', '13 路': '13路盤', '19 路': '19路盤',

  '黑棋落子': '黒番です',
  '白棋落子': '白番です',
  '（电脑）': '（コンピュータ）',
  '电脑思考中': 'コンピュータが考えています',
  '思考中': '考え中',
  '对局结束': '対局終了',
  '对局已结束': '対局は終了しました',
  '对局已经结束了': '対局はすでに終わっています',
  '让{n}子': '置き石 {n} 子',

  '黑方提子': '黒のアゲハマ',
  '白方提子': '白のアゲハマ',
  '总手数': '総手数',

  '悔棋': '待った',
  '虚手': 'パス',
  '结束数子': '終局して計算',
  '重新开始': '最初から',
  '再来一局': 'もう一局',
  '看看棋盘': '盤面を見る',

  '对局模式': '対局モード',
  '双人对弈': '二人対局',
  '与电脑对弈': 'コンピュータ対局',
  '选择执子': '手番の色を選択',
  '执黑': '黒番', '执白': '白番',
  '选择白棋时，电脑执黑先下。': '白を選ぶと、コンピュータが黒番で先に打ちます。',
  '让子棋中电脑执黑，摆好让子后你执白先走。':
    '置き石ありではコンピュータが黒番。置き石の後、あなたは白番で先に打ちます。',

  '让子（黑方先摆）': '置き石（黒が先に置く）',
  '不让': 'なし',
  '让子数越多，电脑越吃力。9 路建议让 3～5 子。':
    '置き石が多いほどあなたが有利です。9路盤なら 3〜5 子がおすすめ。',
  '双人模式下，白棋先走（黑方已摆让子）。':
    '二人対局では白から打ちます（置き石は配置済み）。',

  '电脑棋力': 'コンピュータの強さ',
  '入门': '入門', '初级': '初級', '中级': '中級', '高级': '上級',
  '棋力越高，电脑思考越久、下得越好。':
    'レベルが高いほど、長く考えて強く打ちます。',

  '落子点评': '手の講評',
  '开启': 'オン', '关闭': 'オフ',
  '关闭点评': '閉じる',
  '开启后，你每落一子都会告诉你这步棋的优点和缺点。':
    'オンにすると、打つたびにその手の長所と短所を表示します。',
  '落子后会告诉你这步棋的优缺点': '打った手をここで講評します',
  '点评已关闭': '講評はオフです',
  '点评失败': '講評の取得に失敗',
  '优点': '長所', '缺点': '短所',
  '这步棋没有明显问题，不过别处可能有更好的点。':
    '悪い手ではありませんが、もっと良い点がありそうです。',
  '这步棋很稳，没什么可挑的': '堅実な手で、文句なしです',

  '好棋': '好手', '不错': '良い', '一般': 'ふつう', '有点亏': 'やや損', '失误': '失敗',
  '几乎是最好的选择': 'ほぼ最善手です',
  '这步棋下得可以': 'なかなか良い手です',
  '还行，但还有更好的点': '悪くはないですが、もっと良い点があります',
  '这步棋有点可惜': 'この手は少し惜しいです',
  '这步棋亏得比较多': 'この手はかなり損です',

  '提掉对方 {n} 子': '相手の石を {n} 子取りました',
  '提完之后自己还很安全': '取った後も自分の石は安全です',
  '把自己被打吃的棋救出来了': 'アタリだった自分の石を助けました',
  '打吃对方，对方只剩 1 口气': 'アタリ。相手は残り1呼吸点です',
  '和自己的棋连成一片': '自分の石とつながりました',
  '占到了星位，是开局的好点': '星を占めました。序盤の好点です',
  '位置在三四线，进退都方便': '三線・四線で、攻守のバランスが良い',
  '紧贴对方，限制了对方的发展': '相手に密着し、発展を制限しました',

  '自己只有 2 口气，有点危险': '呼吸点が2つしかなく、少し危険です',
  '这手棋自己只剩 1 口气，对方下一步就能提掉':
    'この手は自分の石の呼吸点が1つだけ。相手は次に取れます',
  '下在一线（最边上），几乎围不到地': '一線すぎて、地がほとんど囲えません',
  '下在二线，位置偏低，发展性差': '二線は低すぎて、発展性がありません',
  '这是在填自己的空，等于白走一手': '自分の地を埋めています。一手無駄です',
  '小心！对方下一手能吃掉你 {n} 子':
    '注意！相手は次の一手であなたの {n} 子を取れます',
  '其实下在 {pos} 可以提掉对方 {n} 子':
    '実は {pos} なら相手を {n} 子取れます',
  '换个地方下在 {pos} 会更好': '{pos} に打った方が良かったです',

  '这里不能落子': 'ここには打てません',
  '不能自杀：这手棋自己没气':
    '自殺手です：その手は自分の石に呼吸点がありません',
  '打劫：不能马上提回来': 'コウ：すぐには取り返せません',
  '还没有可悔的棋': '戻せる手がありません',
  '对局结束了，点「重新开始」吧': '対局は終わりました。「最初から」を押してください',
  '确定要重新开始吗？': '最初からやり直しますか？',

  '恭喜！你赢了': 'おめでとう！あなたの勝ちです',
  '这局电脑赢了': '今回はコンピュータの勝ちです',
  '{side}（你）赢了 {n} 目，太棒了！':
    '{side}（あなた）が {n} 目勝ちました。すばらしい。',
  '{side}（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    '{side}（コンピュータ）が {n} 目勝ちました。気落ちしないで、もう一局試しましょう。',
  '黑棋胜': '黒の勝ち', '白棋胜': '白の勝ち', '和棋': '引き分け',
  '黑棋（你）赢了 {n} 目，太棒了！':
    '黒（あなた）が {n} 目勝ちました。すばらしい！',
  '白棋（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    '白（コンピュータ）が {n} 目勝ちました。気落ちしないで、もう一局試しましょう！',
  '黑棋赢了 {n} 目。': '黒が {n} 目勝ちました。',
  '白棋赢了 {n} 目。': '白が {n} 目勝ちました。',
  '双方目数相同。': '双方の地が同じです。',
  '双方连续虚手': '双方が連続でパス',
  '手动结束': '手動終了',
  '结束原因：{reason}': '終了理由：{reason}',
  '黑棋：{s} 子 + {t} 目 = <b>{total}</b>':
    '黒：{s} 子 + {t} 目 = <b>{total}</b>',
  '白棋：{s} 子 + {t} 目 + 贴目 {komi} = <b>{total}</b>':
    '白：{s} 子 + {t} 目 + コミ {komi} = <b>{total}</b>',

  '点目': '形勢判断',
  '当前点目': '現在の形勢判断',
  '黑棋': '黒', '白棋': '白',
  '形势接近，胜负难分': '形勢は互角に近く、まだ分かりません',
  '黑棋领先 {n} 目': '黒が {n} 目リード',
  '白棋领先 {n} 目': '白が {n} 目リード',
  '按中国规则估算：棋子 + 围住的空点，白棋含贴目 6.5。中盘仅供参考，死子请自行提掉。':
    '中国ルール（面積計算）による概算：石＋囲った空点、白にはコミ 6.5 を含みます。中盤の概算は参考程度に。死んでいる石は先に取ってください。',
  '电脑认输': 'コンピュータ投了',
  '电脑认输了': 'コンピュータが投了しました',
  '电脑判断形势已落后 {n} 目，主动认输。':
    'コンピュータは {n} 目劣勢と判断し、投了しました。',

  '用时': '時間',
  '本手': '今回の手',
  '上一步': '前の一手',
  '总用时': '合計時間',
  '每步耗时': '各手の所要時間',
  '黑': '黒', '白': '白'
});

/* ------------------------------- 한국어 ------------------------------- */
I18N.add('ko', {
  '围棋练习盘': '바둑 연습판',
  '死活题 · 打谱': '사활문제 · 기보',
  '围棋入门教程': '바둑 입문 가이드',

  '9 路': '9줄', '13 路': '13줄', '19 路': '19줄',

  '黑棋落子': '흑 차례입니다',
  '白棋落子': '백 차례입니다',
  '（电脑）': ' (컴퓨터)',
  '电脑思考中': '컴퓨터가 생각 중입니다',
  '思考中': '생각 중',
  '对局结束': '대국 종료',
  '对局已结束': '대국이 종료되었습니다',
  '对局已经结束了': '대국이 이미 끝났습니다',
  '让{n}子': '접바둑 {n}점',

  '黑方提子': '흑 따낸 돌',
  '白方提子': '백 따낸 돌',
  '总手数': '총 수순',

  '悔棋': '무르기',
  '虚手': '패스',
  '结束数子': '종국 후 계산',
  '重新开始': '다시 시작',
  '再来一局': '한 판 더',
  '看看棋盘': '바둑판 보기',

  '对局模式': '대국 모드',
  '双人对弈': '2인 대국',
  '与电脑对弈': '컴퓨터 대국',
  '选择执子': '돌 색 선택',
  '执黑': '흑번', '执白': '백번',
  '选择白棋时，电脑执黑先下。': '백을 선택하면 컴퓨터가 흑번으로 먼저 둡니다.',
  '让子棋中电脑执黑，摆好让子后你执白先走。':
    '접바둑에서는 컴퓨터가 흑번입니다. 접바둑 배치 후 당신이 백번으로 먼저 둡니다.',

  '让子（黑方先摆）': '접바둑 (흑이 먼저 놓음)',
  '不让': '안 둠',
  '让子数越多，电脑越吃力。9 路建议让 3～5 子。':
    '접바둑이 많을수록 유리합니다. 9줄은 3~5점을 권합니다.',
  '双人模式下，白棋先走（黑方已摆让子）。':
    '2인 대국에서는 백이 먼저 둡니다 (접바둑은 이미 배치됨).',

  '电脑棋力': '컴퓨터 실력',
  '入门': '입문', '初级': '초급', '中级': '중급', '高级': '고급',
  '棋力越高，电脑思考越久、下得越好。':
    '레벨이 높을수록 오래 생각하고 더 강하게 둡니다.',

  '落子点评': '수 해설',
  '开启': '켜기', '关闭': '끄기',
  '关闭点评': '닫기',
  '开启后，你每落一子都会告诉你这步棋的优点和缺点。':
    '켜면 둘 때마다 그 수의 장단점을 알려줍니다.',
  '落子后会告诉你这步棋的优缺点': '둔 수를 여기에서 해설합니다',
  '点评已关闭': '해설이 꺼져 있습니다',
  '点评失败': '해설 실패',
  '优点': '장점', '缺点': '단점',
  '这步棋没有明显问题，不过别处可能有更好的点。':
    '나쁜 수는 아니지만 다른 곳이 더 좋을 수 있습니다.',
  '这步棋很稳，没什么可挑的': '안정적인 수로 흠잡을 데 없습니다',

  '好棋': '좋은 수', '不错': '괜찮음', '一般': '보통', '有点亏': '조금 손해', '失误': '실수',
  '几乎是最好的选择': '거의 최선수입니다',
  '这步棋下得可以': '괜찮은 수입니다',
  '还行，但还有更好的点': '괜찮지만 더 좋은 자리가 있습니다',
  '这步棋有点可惜': '이 수는 조금 아쉽습니다',
  '这步棋亏得比较多': '이 수는 손해가 큽니다',

  '提掉对方 {n} 子': '상대 돌 {n}점을 따냈습니다',
  '提完之后自己还很安全': '따낸 뒤에도 안전합니다',
  '把自己被打吃的棋救出来了': '단수에 몰린 자기 돌을 살렸습니다',
  '打吃对方，对方只剩 1 口气': '단수! 상대는 활로가 1개 남았습니다',
  '和自己的棋连成一片': '자기 돌과 연결되었습니다',
  '占到了星位，是开局的好点': '화점을 차지했습니다. 초반의 좋은 자리입니다',
  '位置在三四线，进退都方便': '3~4선이라 공격과 수비 모두 좋습니다',
  '紧贴对方，限制了对方的发展': '상대에 붙어 발전을 제한했습니다',

  '自己只有 2 口气，有点危险': '활로가 2개뿐이라 조금 위험합니다',
  '这手棋自己只剩 1 口气，对方下一步就能提掉':
    '이 수는 자기 돌의 활로가 1개뿐이라 상대가 다음에 딸 수 있습니다',
  '下在一线（最边上），几乎围不到地': '첫째 줄이라 집을 거의 못 만듭니다',
  '下在二线，位置偏低，发展性差': '둘째 줄은 너무 낮아 발전성이 떨어집니다',
  '这是在填自己的空，等于白走一手': '자기 집을 메우는 수라 한 수 낭비입니다',
  '小心！对方下一手能吃掉你 {n} 子':
    '주의! 상대가 다음 수로 당신의 {n}점을 잡을 수 있습니다',
  '其实下在 {pos} 可以提掉对方 {n} 子':
    '사실 {pos}에 두면 상대 {n}점을 잡을 수 있습니다',
  '换个地方下在 {pos} 会更好': '{pos}에 두는 편이 더 좋았습니다',

  '这里不能落子': '여기에는 둘 수 없습니다',
  '不能自杀：这手棋自己没气':
    '자충수입니다: 그 수는 자기 돌에 활로가 없습니다',
  '打劫：不能马上提回来': '패: 바로 되따낼 수 없습니다',
  '还没有可悔的棋': '무를 수 있는 수가 없습니다',
  '对局结束了，点「重新开始」吧': '대국이 끝났습니다. 「다시 시작」을 누르세요',
  '确定要重新开始吗？': '다시 시작할까요?',

  '恭喜！你赢了': '축하합니다! 당신이 이겼습니다',
  '这局电脑赢了': '이번 판은 컴퓨터가 이겼습니다',
  '{side}（你）赢了 {n} 目，太棒了！':
    '{side}(당신)이 {n}집 이겼습니다. 훌륭합니다.',
  '{side}（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    '{side}(컴퓨터)가 {n}집 이겼습니다. 낙담하지 말고 다시 도전해 보세요.',
  '黑棋胜': '흑 승', '白棋胜': '백 승', '和棋': '무승부',
  '黑棋（你）赢了 {n} 目，太棒了！':
    '흑(당신)이 {n}집 이겼습니다. 훌륭해요!',
  '白棋（电脑）赢了 {n} 目。别灰心，再来一局试试！':
    '백(컴퓨터)이 {n}집 이겼습니다. 낙담하지 말고 다시 도전해 보세요!',
  '黑棋赢了 {n} 目。': '흑이 {n}집 이겼습니다.',
  '白棋赢了 {n} 目。': '백이 {n}집 이겼습니다.',
  '双方目数相同。': '양쪽 집이 같습니다.',
  '双方连续虚手': '양쪽 모두 연속 패스',
  '手动结束': '수동 종료',
  '结束原因：{reason}': '종료 이유: {reason}',
  '黑棋：{s} 子 + {t} 目 = <b>{total}</b>':
    '흑: {s}점 + {t}집 = <b>{total}</b>',
  '白棋：{s} 子 + {t} 目 + 贴目 {komi} = <b>{total}</b>':
    '백: {s}점 + {t}집 + 덤 {komi} = <b>{total}</b>',

  '点目': '형세 판단',
  '当前点目': '현재 형세 판단',
  '黑棋': '흑', '白棋': '백',
  '形势接近，胜负难分': '형세가 비슷해 우열을 가리기 어렵습니다',
  '黑棋领先 {n} 目': '흑이 {n}집 앞섭니다',
  '白棋领先 {n} 目': '백이 {n}집 앞섭니다',
  '按中国规则估算：棋子 + 围住的空点，白棋含贴目 6.5。中盘仅供参考，死子请自行提掉。':
    '중국 규칙(면적 계산) 기준 추정: 돌 + 둘러싼 빈 점, 백에는 덤 6.5 포함. 중반의 추정은 참고용이며 죽은 돌은 먼저 따내세요.',
  '电脑认输': '컴퓨터 기권',
  '电脑认输了': '컴퓨터가 기권했습니다',
  '电脑判断形势已落后 {n} 目，主动认输。':
    '컴퓨터가 {n}집 뒤진 것으로 판단해 기권했습니다.',

  '用时': '시간',
  '本手': '이번 수',
  '上一步': '이전 수',
  '总用时': '총 시간',
  '每步耗时': '수별 소요 시간',
  '黑': '흑', '白': '백'
});

/* ==========================================================================
   死活题 + 打谱页 / practice page
   ========================================================================== */

/* ------------------------------- English ------------------------------- */
I18N.add('en', {
  '围棋练习': 'Weiqi Practice',
  '围棋练习 · 死活题 & 打谱': 'Weiqi Practice · Life & Death & Records',
  '死活题': 'Life & Death',
  '打谱': 'Records',
  '去对弈': 'Play',
  '去下棋': 'Play',
  '入门教程': 'Tutorial',

  '第 1 / 16 题': 'Problem 1 / 16',
  '第 <span id="tsuNo">{i}</span> / {total} 题': 'Problem <span id="tsuNo">{i}</span> / {total}',
  '🏆 全部完成 <span style="color:#8ce8b0">{n} / {total}</span>':
    '🏆 All done <span style="color:#8ce8b0">{n} / {total}</span>',
  '一口气': 'One liberty',
  '两子的气': 'Two stones',
  '贴边角的白子': 'White in the corner',
  '边上的白子': 'White on the edge',
  '吃白 3 子': 'Capture 3 white stones',

  '黑先 · 吃掉': 'Black to play · capture the white group marked with',
  '红点': 'red dots',
  '标出的白棋': '',
  '黑先。把<span style="color:#ff8a80">红点</span>那串白棋的气全部堵住，就能吃掉它。':
    'Black to play. Fill all the liberties of the white group marked with ' +
    '<span style="color:#ff8a80">red dots</span> to capture it.',
  '点棋盘落子。把白棋的气全部堵住就成功。':
    'Tap the board to play. Fill every liberty to capture the white group.',

  '重来本题': 'Retry', '看提示': 'Hint',
  '上一题': 'Previous', '下一题': 'Next',
  '题目列表': 'Problems',

  '白子只剩最后一口气了，堵住它就吃掉。': 'The white stone has one liberty left — fill it.',
  '两颗白子连在一起，气也是共用的。它们还剩几口气？':
    'Two white stones share their liberties. How many are left?',
  '角上的棋子气最少。': 'Stones in the corner have the fewest liberties.',
  '边上的棋子只有三口气。': 'Stones on the edge have only three liberties.',
  '白棋有 2 口气。它想逃，你要一步步把气收紧。':
    'White has 2 liberties. It will try to run — squeeze them one by one.',
  '白棋有 3 口气。它想逃，你要一步步把气收紧。':
    'White has 3 liberties. It will try to run — squeeze them one by one.',

  '漂亮！白棋被吃掉了。': 'Nice! The white group is captured. ',
  '吃掉啦！': 'Captured! ',
  '好，白棋正在挣扎。继续紧气！还剩 {n} 手机会。':
    'White is struggling. Keep squeezing! {n} move(s) left.',
  '还剩 {n} 道题，点「下一题」继续。': '{n} problem(s) to go — tap "Next".',
  '全部 {n} 道题都做完了 —— 太棒了！': 'All {n} problems solved — brilliant!',
  '这步不行 —— 白棋跑掉了。点「重来本题」再想想。':
    'That does not work — White escapes. Tap "Retry" and think again.',
  '本题已经完成了，点「下一题」继续。': 'Already solved — tap "Next".',
  '本题走错了，点「重来本题」再试一次。': 'This one went wrong — tap "Retry".',
  '这里不能落子。': 'You cannot play here.',
  '提示：先看看白棋还剩几口气。': 'Hint: first count how many liberties White has.',
  '提示：试试在 <b>{pos}</b> 附近落子。': 'Hint: try playing near <b>{pos}</b>.',
  '16 道死活题全部做出来了，真棒！': 'All 16 problems solved. Wonderful!',
  '全部完成！': 'All done!',
  '再来一遍': 'Start over', '继续看题': 'Back to board',

  '当前局面': 'Position',
  '未载入棋谱': 'No record loaded',
  '载入 SGF 或点下面的示例': 'Load an SGF file or pick the sample below',
  '播放': 'Playback',
  '慢': 'Slow', '中': 'Mid', '快': 'Fast',
  '载入棋谱': 'Load a record',
  '点这里选 SGF 文件': 'Click to choose an SGF file',
  '也可以把文件拖进来': 'or drag the file here',
  '棋谱': 'Record',
  '（还没有载入棋谱）': '(no record loaded yet)',
  '{size} 路 · 共 {n} 手': '{size}×{size} · {n} moves',
  '· 开局': '· start',
  '当前第 {i} 手（{color}）': 'move {i} ({color})',
  '黑': 'Black', '白': 'White',
  '虚手': 'pass',
  '电脑自战一局（9 路 · 78 手）': 'Computer self-play (9×9 · 78 moves)',
  '电脑自战（9 路）': 'Computer self-play (9×9)',
  'SGF 解析失败：{msg}': 'Could not parse the SGF: {msg}',
  '这个 SGF 里没有找到落子记录。': 'No moves found in this SGF.'
});

/* ------------------------------- 日本語 ------------------------------- */
I18N.add('ja', {
  '围棋练习': '囲碁練習',
  '围棋练习 · 死活题 & 打谱': '囲碁練習 · 詰碁＆棋譜並べ',
  '死活题': '詰碁',
  '打谱': '棋譜並べ',
  '去对弈': '対局へ',
  '去下棋': '対局へ',
  '入门教程': '入門ガイド',

  '第 1 / 16 题': '第 1 / 16 問',
  '第 <span id="tsuNo">{i}</span> / {total} 题': '第 <span id="tsuNo">{i}</span> / {total} 問',
  '🏆 全部完成 <span style="color:#8ce8b0">{n} / {total}</span>':
    '🏆 全問クリア <span style="color:#8ce8b0">{n} / {total}</span>',
  '一口气': '残り1呼吸点',
  '两子的气': '二子の呼吸点',
  '贴边角的白子': '隅の白',
  '边上的白子': '辺の白',
  '吃白 3 子': '白3子を取る',

  '黑先 · 吃掉': '黒先 · 取るのは',
  '红点': '赤い点',
  '标出的白棋': 'の白石',
  '黑先。把<span style="color:#ff8a80">红点</span>那串白棋的气全部堵住，就能吃掉它。':
    '黒先。<span style="color:#ff8a80">赤い点</span>の白石の呼吸点をすべて塞げば取れます。',
  '点棋盘落子。把白棋的气全部堵住就成功。':
    '盤面をタップして打ってください。白の呼吸点をすべて塞げば成功です。',

  '重来本题': 'やり直す', '看提示': 'ヒント',
  '上一题': '前の問題', '下一题': '次の問題',
  '题目列表': '問題一覧',

  '白子只剩最后一口气了，堵住它就吃掉。': '白は残り1呼吸点。塞げば取れます。',
  '两颗白子连在一起，气也是共用的。它们还剩几口气？':
    '二つの白はつながっており、呼吸点は共有です。残りはいくつ？',
  '角上的棋子气最少。': '隅の石は呼吸点が最も少ないです。',
  '边上的棋子只有三口气。': '辺の石は呼吸点が3つしかありません。',
  '白棋有 2 口气。它想逃，你要一步步把气收紧。':
    '白の呼吸点は2つ。逃げようとするので、少しずつ詰めてください。',
  '白棋有 3 口气。它想逃，你要一步步把气收紧。':
    '白の呼吸点は3つ。逃げようとするので、少しずつ詰めてください。',

  '漂亮！白棋被吃掉了。': '見事！白を取れました。 ',
  '吃掉啦！': '取れました！ ',
  '好，白棋正在挣扎。继续紧气！还剩 {n} 手机会。':
    '白はもがいています。さらに詰めましょう！残り {n} 手です。',
  '还剩 {n} 道题，点「下一题」继续。': '残り {n} 問。「次の問題」で続けます。',
  '全部 {n} 道题都做完了 —— 太棒了！': '{n} 問すべてクリア —— すばらしい！',
  '这步不行 —— 白棋跑掉了。点「重来本题」再想想。':
    'この手では白が逃げます。「やり直す」でもう一度考えましょう。',
  '本题已经完成了，点「下一题」继续。': 'この問題はクリア済み。「次の問題」へ。',
  '本题走错了，点「重来本题」再试一次。': 'この問題は失敗。「やり直す」を押してください。',
  '这里不能落子。': 'ここには打てません。',
  '提示：先看看白棋还剩几口气。': 'ヒント：まず白の呼吸点を数えましょう。',
  '提示：试试在 <b>{pos}</b> 附近落子。': 'ヒント：<b>{pos}</b> の近くに打ってみましょう。',
  '16 道死活题全部做出来了，真棒！': '詰碁16問すべてクリア。素晴らしい！',
  '全部完成！': '全問クリア！',
  '再来一遍': 'もう一度', '继续看题': '盤面に戻る',

  '当前局面': '現在の局面',
  '未载入棋谱': '棋譜が読み込まれていません',
  '载入 SGF 或点下面的示例': 'SGF を読み込むか、下のサンプルを選んでください',
  '播放': '再生',
  '慢': '遅い', '中': '普通', '快': '速い',
  '载入棋谱': '棋譜を読み込む',
  '点这里选 SGF 文件': 'クリックして SGF ファイルを選択',
  '也可以把文件拖进来': 'ファイルをドラッグしても OK',
  '棋谱': '棋譜',
  '（还没有载入棋谱）': '（棋譜がまだありません）',
  '{size} 路 · 共 {n} 手': '{size}路盤 · 全 {n} 手',
  '· 开局': '· 開始局面',
  '当前第 {i} 手（{color}）': '第 {i} 手（{color}）',
  '黑': '黒', '白': '白',
  '虚手': 'パス',
  '电脑自战一局（9 路 · 78 手）': 'コンピュータの自戦（9路盤 · 78手）',
  '电脑自战（9 路）': 'コンピュータ自戦（9路盤）',
  'SGF 解析失败：{msg}': 'SGF の解析に失敗：{msg}',
  '这个 SGF 里没有找到落子记录。': 'この SGF には着手記録がありません。'
});

/* ------------------------------- 한국어 ------------------------------- */
I18N.add('ko', {
  '围棋练习': '바둑 연습',
  '围棋练习 · 死活题 & 打谱': '바둑 연습 · 사활문제 & 기보',
  '死活题': '사활문제',
  '打谱': '기보',
  '去对弈': '대국하기',
  '去下棋': '대국하기',
  '入门教程': '입문 가이드',

  '第 1 / 16 题': '1 / 16 문제',
  '第 <span id="tsuNo">{i}</span> / {total} 题': '<span id="tsuNo">{i}</span> / {total} 문제',
  '🏆 全部完成 <span style="color:#8ce8b0">{n} / {total}</span>':
    '🏆 모두 완료 <span style="color:#8ce8b0">{n} / {total}</span>',
  '一口气': '활로 하나',
  '两子的气': '두 점의 활로',
  '贴边角的白子': '귀의 백',
  '边上的白子': '변의 백',
  '吃白 3 子': '백 3점 잡기',

  '黑先 · 吃掉': '흑 선수 · 잡을 대상:',
  '红点': '빨간 점',
  '标出的白棋': ' 표시된 백',
  '黑先。把<span style="color:#ff8a80">红点</span>那串白棋的气全部堵住，就能吃掉它。':
    '흑 선수. <span style="color:#ff8a80">빨간 점</span>으로 표시된 백의 활로를 모두 막으면 잡을 수 있습니다.',
  '点棋盘落子。把白棋的气全部堵住就成功。':
    '바둑판을 눌러 수를 두세요. 백의 활로를 모두 막으면 성공입니다.',

  '重来本题': '다시 풀기', '看提示': '힌트',
  '上一题': '이전 문제', '下一题': '다음 문제',
  '题目列表': '문제 목록',

  '白子只剩最后一口气了，堵住它就吃掉。': '백이 활로가 하나 남았습니다. 막으면 잡습니다.',
  '两颗白子连在一起，气也是共用的。它们还剩几口气？':
    '두 백돌은 연결되어 활로를 공유합니다. 몇 개 남았을까요?',
  '角上的棋子气最少。': '귀의 돌은 활로가 가장 적습니다.',
  '边上的棋子只有三口气。': '변의 돌은 활로가 세 개뿐입니다.',
  '白棋有 2 口气。它想逃，你要一步步把气收紧。':
    '백의 활로는 2개입니다. 도망가려 하니 하나씩 줄여 나가세요.',
  '白棋有 3 口气。它想逃，你要一步步把气收紧。':
    '백의 활로는 3개입니다. 도망가려 하니 하나씩 줄여 나가세요.',

  '漂亮！白棋被吃掉了。': '멋져요! 백을 잡았습니다. ',
  '吃掉啦！': '잡았습니다! ',
  '好，白棋正在挣扎。继续紧气！还剩 {n} 手机会。':
    '백이 버티고 있습니다. 계속 조이세요! {n}수가 남았습니다.',
  '还剩 {n} 道题，点「下一题」继续。': '{n}문제 남았습니다. 「다음 문제」를 누르세요.',
  '全部 {n} 道题都做完了 —— 太棒了！': '{n}문제를 모두 풀었습니다 — 훌륭해요!',
  '这步不行 —— 白棋跑掉了。点「重来本题」再想想。':
    '이 수는 안 됩니다 — 백이 도망갑니다. 「다시 풀기」를 눌러 보세요.',
  '本题已经完成了，点「下一题」继续。': '이미 푼 문제입니다. 「다음 문제」를 누르세요.',
  '本题走错了，点「重来本题」再试一次。': '틀렸습니다. 「다시 풀기」를 눌러 보세요.',
  '这里不能落子。': '여기에는 둘 수 없습니다.',
  '提示：先看看白棋还剩几口气。': '힌트: 먼저 백의 활로를 세어 보세요.',
  '提示：试试在 <b>{pos}</b> 附近落子。': '힌트: <b>{pos}</b> 근처에 두어 보세요.',
  '16 道死活题全部做出来了，真棒！': '사활문제 16개를 모두 풀었습니다. 대단해요!',
  '全部完成！': '모두 완료!',
  '再来一遍': '처음부터', '继续看题': '바둑판 보기',

  '当前局面': '현재 국면',
  '未载入棋谱': '기보가 없습니다',
  '载入 SGF 或点下面的示例': 'SGF를 불러오거나 아래 예시를 선택하세요',
  '播放': '재생',
  '慢': '느리게', '中': '보통', '快': '빠르게',
  '载入棋谱': '기보 불러오기',
  '点这里选 SGF 文件': '클릭해서 SGF 파일 선택',
  '也可以把文件拖进来': '파일을 끌어다 놓아도 됩니다',
  '棋谱': '기보',
  '（还没有载入棋谱）': '(기보가 아직 없습니다)',
  '{size} 路 · 共 {n} 手': '{size}줄 · 총 {n}수',
  '· 开局': '· 초반',
  '当前第 {i} 手（{color}）': '{i}수째 ({color})',
  '黑': '흑', '白': '백',
  '虚手': '패스',
  '电脑自战一局（9 路 · 78 手）': '컴퓨터 자체 대국 (9줄 · 78수)',
  '电脑自战（9 路）': '컴퓨터 자체 대국 (9줄)',
  'SGF 解析失败：{msg}': 'SGF 해석 실패: {msg}',
  '这个 SGF 里没有找到落子记录。': '이 SGF에는 수순 기록이 없습니다.'
});

/* ==========================================================================
   教程页 / tutorial page（整块替换：段落里含 <b> 等标签）
   ========================================================================== */

/* -------------------------- tutorial: English -------------------------- */
I18N.add('en', {
  "围棋入门教程": "Weiqi Tutorial",
  "死活题 · 打谱": "Life &amp; Death · Records",
  "去下棋": "Play",
  "目录": "Contents",
  "1. 三分钟入门": "1. Three-minute intro",
  "2. 气：棋子的命": "2. Liberties: a stone's life",
  "3. 吃子": "3. Capturing",
  "4. 连接与分断": "4. Connecting and cutting",
  "连接": "Connect",
  "分断": "Cut",
  "5. 做眼与活棋": "5. Eyes and life",
  "6. 吃子四大技巧": "6. Four capturing techniques",
  "7. 打劫": "7. Ko",
  "8. 布局常识": "8. Opening basics",
  "9. 终局与数子": "9. Ending and counting",
  "10. 陪娃学棋建议": "10. Tips for teaching kids",
  "和孩子一起学围棋": "Learn Go with your child",
  "面向零基础的家长。按顺序读完这 10 节，你就能陪孩子下完一整盘棋了。": "For parents starting from zero. Read these 10 sections in order and you can finish a whole game with your child.",
  "<span class=\"num\">1</span>三分钟入门": "<span class=\"num\">1</span>Three-minute intro",
  "围棋的规则少得出奇，但变化多得吓人。先记住这四条，就可以开始下了：": "Go has astonishingly few rules but endless variation. Learn these four and you can start playing:",
  "<b>下在交叉点上</b>，不是格子里。": "Play on the <b>intersections</b>, not inside the squares.",
  "<b>黑棋先下，白棋后下</b>，一人一手，轮流来。": "<b>Black plays first, then White</b> — one move each, taking turns.",
  "<b>棋子落下就不能再移动</b>了（除非被对方吃掉拿走）。": "Once placed, <b>a stone never moves</b> (unless it is captured and removed).",
  "<b>最后谁占的地盘大，谁赢。</b>": "<b>Whoever surrounds more territory wins.</b>",
  "黑先白后，轮流落在交叉点上。数字表示落子顺序。": "Black first, then White, taking turns on the intersections. Numbers show the order of play.",
  "<b>给孩子这样讲：</b>“棋盘是一片空地，我们轮流修墙圈地。谁的围墙圈的地多，谁就赢。”": "<b>Tell your child this:</b> \"The board is an empty field. We take turns building fences to claim land. Whoever fences in more land wins.\"",
  "<span class=\"num\">2</span>气：棋子的命根子": "<span class=\"num\">2</span>Liberties: a stone's life",
  "紧挨着一颗棋子、<b>上 / 下 / 左 / 右</b>四个方向的空点，叫做这颗棋子的“<b>气</b>”。斜对角不算。": "The empty points directly <b>above, below, left and right</b> of a stone are its \"<b>liberties</b>\". Diagonals do not count.",
  "一颗棋子有多少气，取决于它在哪儿：": "How many liberties a stone has depends on where it sits:",
  "<b>中间</b>的棋子：<b>4 口气</b>": "A stone <b>in the middle</b>: <b>4 liberties</b>",
  "<b>边上</b>的棋子：<b>3 口气</b>": "A stone <b>on the side</b>: <b>3 liberties</b>",
  "<b>角上</b>的棋子：只有 <b>2 口气</b>": "A stone <b>in the corner</b>: only <b>2 liberties</b>",
  "连在一起的棋子，气是共享的": "Connected stones share their liberties",
  "两颗（或多颗）<b>紧紧相邻</b>的同色棋子会连成一块，它们的气合起来算。": "Two (or more) <b>touching</b> stones of the same colour form one group, and their liberties are counted together.",
  "两颗连着的白子，共有 <b>6 口气</b>（不是 4 口）": "Two connected white stones share <b>6 liberties</b> (not 4)",
  "<b>这是围棋最重要的概念。</b>后面所有的吃子、逃子、围地，都围着“气”转。孩子只要理解了“气”，围棋就入门一半了。": "<b>This is the most important idea in Go.</b> Every capture, escape and enclosure revolves around liberties. Once your child understands \"liberties\", they are halfway in.",
  "<span class=\"num\">3</span>吃子：把对手的子拿走": "<span class=\"num\">3</span>Capturing: taking stones off the board",
  "当一块棋的<b>气被对方全部堵住</b>（变成 0 口），这块棋就被“<b>提</b>”掉了 —— 从棋盘上拿走，收进对方的提子堆里。": "When a group's <b>liberties are all filled</b> (0 left), it is <b>captured</b> — removed from the board and kept as the opponent's prisoners.",
  "白子还剩 2 口气（圆圈处）": "White has 2 liberties left (circled)",
  "黑棋再堵一口，白子只剩 1 口气 —— 这叫“<b>打吃</b>”": "Black fills one more — White has 1 liberty left. This is called <b>atari</b>.",
  "黑棋堵上最后一口气，白子被<b>提掉</b>，空出来一个点": "Black fills the last liberty — White is <b>captured</b>, leaving an empty point.",
  "两条铁律": "Two iron rules",
  "<b>不能自杀：</b>如果一手棋下去，自己这块棋一口气都没有、又没提到对方，就是违规的（不能下）。": "<b>No suicide:</b> if a move leaves your own group with no liberties and captures nothing, it is illegal.",
  "<b>提子优先：</b>如果你这一手能提掉对方的子，哪怕自己只剩一口气，也<b>不算</b>自杀，是合法的。": "<b>Capturing takes priority:</b> if your move captures the opponent, it is <b>not</b> suicide even if your own stone has only one liberty left.",
  "<b>陪练玩法：</b>在 9 路盘上，让孩子执黑，你故意摆几颗白子只剩一口气，让他去找“打吃”。找对一次就表扬一次，兴趣就上来了。": "<b>Practice game:</b> on a 9×9 board let your child play Black. Place a few white stones with only one liberty and ask them to find the atari. Praise every correct answer and interest grows fast.",
  "<span class=\"num\">4</span>连接与分断": "<span class=\"num\">4</span>Connecting and cutting",
  "两块棋如果被对方切开，就各自为战、气也变少，很容易被吃掉。所以：<b>该连的要连，该断的要断</b>。": "If two groups are cut apart they must fight alone with fewer liberties, and are easily captured. So: <b>connect what should be connected, cut what should be cut</b>.",
  "白棋两块分开，中间是个断点": "Two white groups are separated — the gap between them is a cutting point.",
  "白棋下在中间 → <b>连成一块</b>，一起算气": "White plays between them → <b>one group</b>, liberties counted together.",
  "黑棋先占了要点，白棋被<b>上下分断</b>，两块都变弱": "Black takes the key point first — White is <b>cut in two</b> and both parts become weak.",
  "<b>口诀：</b>“棋从断处生”。看到对方有断点，就像看到衣服上的线头，一扯就开。": "<b>Sayings:</b> \"Fights begin at the cutting points.\" When you see a gap in the opponent's shape, it is like a loose thread on clothing — one pull and it opens.",
  "<span class=\"num\">5</span>做眼与活棋": "<span class=\"num\">5</span>Eyes and life",
  "围地只是目的，<b>先要保证自己不被吃</b>。围棋里判断一块棋能不能活，就看它有没有<b>两只真眼</b>。": "Territory is the goal, but <b>first make sure you cannot be captured</b>. Whether a group lives is decided by whether it has <b>two real eyes</b>.",
  "什么是眼？": "What is an eye?",
  "被自己棋子<b>四面包住</b>的空点，就是一只“眼”。对方不能往眼里下子（那是自杀），除非他能提掉你。": "An empty point <b>surrounded on all four sides</b> by your own stones is an \"eye\". The opponent cannot play inside it (that would be suicide) unless the move captures you.",
  "白棋围出 <b>1 只眼</b>。黒棋可以从外面收紧，最后填进来提掉白棋": "White has made <b>1 eye</b>. Black can tighten from outside, then fill it and capture White.",
  "白棋做出 <b>2 只眼</b>。<b>永远吃不掉了，这叫“活棋”</b>": "White has made <b>2 eyes</b>. <b>It can never be captured — this is called \"alive\".</b>",
  "为什么两只眼就死不了？": "Why are two eyes unkillable?",
  "因为对方<b>一次只能下一手棋</b>。他填你左边的眼，你就在右边还有一口气；他填右边的眼，你左边的眼又活了。他永远没法同时堵住两个。": "Because the opponent <b>can only play one move at a time</b>. If they fill your left eye, you still have a liberty on the right; if they fill the right eye, the left one comes alive again. They can never block both at once.",
  "<b>注意：</b>两只眼必须是<b>“真眼”</b>。如果眼是假的（对方可以合法下进来打吃你），那就不算。": "<b>Note:</b> the two eyes must be <b>real eyes</b>. If an eye is false (the opponent can legally play inside it to put you in atari), it does not count.",
  "<b>初学阶段只要记住一句话：</b>“被包围的时候，努力做出两只眼，就安全了。”": "<b>For beginners, one sentence is enough:</b> \"When surrounded, try to make two eyes and you are safe.\"",
  "<span class=\"num\">6</span>吃子四大技巧": "<span class=\"num\">6</span>Four capturing techniques",
  "① 打吃（叫吃）": "(1) Atari",
  "把对方一块棋逼到只剩一口气。这是最基础的攻击手段，对方必须应。": "Drive an opponent group down to one liberty. This is the most basic attacking tool, and the opponent must answer it.",
  "② 征子（扭羊头）": "(2) Ladder (shicho)",
  "对方一块棋只有两口气时，你连续打吃，把它一路赶到边上吃掉。这是新手最容易吃亏的招法。": "When an opponent group has only two liberties, keep playing atari and drive it all the way to the edge to capture it. This is the trick beginners lose the most to.",
  "白子只剩 1 口气（红圈）。它只能往那儿逃，黑棋再打吃，白棋再逃……一路被赶到边上吃掉": "White has 1 liberty left (red circle). It can only run that way; Black keeps playing atari and White is chased to the edge and captured.",
  "<b>重要：</b>征子之前一定要先看清楚 —— 白棋逃跑的路线上如果有白子接应，黑棋就会崩。9 路棋盘容易看清，19 路就要小心。": "<b>Important:</b> before starting a ladder, read it out — if White has a friendly stone on the escape route, Black collapses. Easy to see on 9×9, but be careful on 19×19.",
  "③ 枷吃（关）": "(3) Net (geta)",
  "不直接贴身打吃，而是从外面<b>封住逃跑方向</b>。比征子更稳，不怕对方接应。": "Instead of playing right next to the group, <b>block the escape route from outside</b>. More solid than a ladder and safe even if the opponent has support.",
  "黑棋在 (4,6)、(6,5) 这样“围”住，白棋跑不掉 —— 这叫枷吃": "Black \"surrounds\" with (4,6) and (6,5) — White cannot escape. This is the net.",
  "④ 倒扑": "(4) Snapback",
  "先故意送一颗子进对方嘴里，等对方提掉后，你反过来把他整块吃掉。": "Deliberately give the opponent a stone to take; after they capture it, you take their whole group back.",
  "白棋下在红圈处，能提掉黑两子 —— 但提完自己只剩一口气，黑棋再下 (4,4) 反把白棋全提。这就是<b>倒扑</b>": "White plays the red circle and captures two black stones — but then White has only one liberty, and Black plays (4,4) to take everything back. This is the <b>snapback</b>.",
  "<span class=\"num\">7</span>打劫": "<span class=\"num\">7</span>Ko",
  "围棋里有一种特殊的形状：<b>双方可以互相提掉对方同一颗子，来回无限循环</b>。这就是“劫”。": "Go has a special shape: <b>both sides can capture the same single stone back and forth forever</b>. This is called \"ko\".",
  "黑棋下 (4,5) 提掉白 (4,4)；接着白棋又能下 (4,4) 提掉黑 (4,5)……无限循环": "Black plays (4,5) and takes White (4,4); then White can play (4,4) and take Black (4,5)… forever.",
  "规则：打劫不能马上提回": "Rule: you cannot recapture immediately",
  "被提的一方，<b>不能立刻在同一处提回来</b>。必须先在棋盘<b>别的地方下一手</b>，如果对方应了，你下一手才能提回来。": "The side that was captured <b>cannot recapture at the same point immediately</b>. They must first play <b>somewhere else on the board</b>; if the opponent answers, then they may take the ko back.",
  "所以在实战中，打劫经常变成“<b>找劫材</b>”的博弈：我下一手威胁你，你如果不理我，我就在劫上提回来；你如果应了，我再提回劫。谁手里的劫材多，谁打赢这个劫。": "So in real games a ko becomes a battle of <b>ko threats</b>: I play a threat, if you ignore it I retake the ko; if you answer, I take the ko back. Whoever has more ko threats wins the ko.",
  "<b>对初学者：</b>打劫可以先放一放。记住“不能马上提回，要先走别处”就够了。我们的练习盘会自动阻止违规的提回。": "<b>For beginners:</b> you can leave ko for later. Just remember \"no immediate recapture — play elsewhere first\". Our practice board blocks illegal recaptures automatically.",
  "<span class=\"num\">8</span>布局常识：金角银边草肚皮": "<span class=\"num\">8</span>Opening basics: corners first",
  "空棋盘时该从哪儿下？记住这句口诀：": "Where should you play on an empty board? Remember this saying:",
  "金角 · 银边 · 草肚皮": "Corners are gold · sides are silver · the centre is straw",
  "<b>角</b>最值钱：两边有棋盘边线当天然围墙，围同样的地只要很少的棋子。": "The <b>corner</b> is worth the most: two board edges act as free walls, so very few stones enclose the same area.",
  "<b>边</b>次之：只有一条边线帮忙。": "The <b>side</b> comes next: only one edge helps you.",
  "<b>中腹</b>最费子：四面八方都要自己围，效率最低。": "The <b>centre</b> costs the most stones: you must surround it on all sides yourself — the least efficient.",
  "19 路棋盘上的“星位”。开局一般先占角（圆圈处），再向边上发展": "Star points on a 19×19 board. In the opening, take corners first (circles), then extend along the sides.",
  "开局的基本顺序": "Basic opening order",
  "<b>占空角</b>：角上星位、小目都行。": "<b>Take an empty corner</b>: a star point or a komoku both work.",
  "<b>挂角 / 守角</b>：去对方角上分一杯羹，或者加固自己的角。": "<b>Approach or enclose</b>: share the opponent's corner, or reinforce your own.",
  "<b>拆边</b>：向边上展开，把地盘连成片。": "<b>Extend along the side</b>: spread out and link your territory into a whole.",
  "然后再进入中盘的战斗。": "Then the middle-game fighting begins.",
  "下在第几线？": "Which line should you play on?",
  "<b>第二线</b>：太低，只顾眼前的小地，容易被压。": "The <b>second line</b>: too low — small territory, easily pressed down.",
  "<b>第三线</b>：好守地，常用。": "The <b>third line</b>: good for territory, commonly used.",
  "<b>第四线</b>：好发展，常用。": "The <b>fourth line</b>: good for development, commonly used.",
  "<b>第五线及以上</b>：太虚，容易落空。": "The <b>fifth line and above</b>: too loose — easy to end up with nothing.",
  "初学 9 路棋，直接占星位和中腹附近的开阔点就行，不用太纠结。": "When starting 9×9 games, just take star points and open points near the centre — no need to overthink it.",
  "<span class=\"num\">9</span>终局与数子": "<span class=\"num\">9</span>Ending and counting",
  "棋下到什么时候算完？当棋盘上再也找不到有价值的落点时，双方可以<b>连续虚手</b>（放弃一手）表示结束。": "When does the game end? When no worthwhile points remain, both sides may <b>pass in succession</b> to signal the end.",
  "怎么算谁赢": "How to decide the winner",
  "最直观的是<b>数子法</b>（中国规则）：": "The most intuitive is <b>area scoring</b> (Chinese rules):",
  "<b>先把死子拿掉。</b>双方确认哪些棋已经救不活了，拿掉后算对方的。": "<b>First remove the dead stones.</b> Both sides agree on which stones cannot be saved; they are removed and counted for the other side.",
  "<b>数自己的棋子 + 自己围住的空地</b>，加起来就是你的总地盘。": "<b>Count your own stones plus the empty points you surround</b> — the total is your territory.",
  "谁多谁赢。": "Whoever has more wins.",
  "<b>白棋要贴目。</b>因为黑棋先下有便宜，所以白棋最后要额外加上 6.5 目（相当于让黑棋 6.5 目）。": "<b>White gets komi.</b> Because Black moves first and gains an advantage, White receives an extra 6.5 points at the end.",
  "左上黑棋围住 5 个空点（小圈）→ 这 5 目算黑棋的；加上黑棋自己的棋子，就是黑棋的地盘": "Black surrounds 5 empty points in the upper left (small circles) → those 5 points count for Black; plus Black's own stones, that is Black's territory.",
  "练习盘上有「<b>结束数子</b>」按钮，点一下会自动帮你数完，告诉你是谁赢、赢多少目。<br>\n        <b>小提示：</b>数子前记得先把盘上明显的死子提干净，不然会算错。": "The practice board has an <b>End &amp; count</b> button — one tap counts everything for you and tells you who won and by how much.<br>\n        <b>Tip:</b> clear obvious dead stones off the board first, or the count will be wrong.",
  "<span class=\"num\">10</span>陪娃学棋的 10 条建议": "<span class=\"num\">10</span>10 tips for teaching kids",
  "<b>从 9 路盘开始。</b>19 路对初学者太大，一盘要下很久，孩子容易失去耐心。9 路一盘十几分钟，输赢反馈快。": "<b>Start on 9×9.</b> 19×19 is too big for beginners — one game takes forever and children lose patience. A 9×9 game takes about ten minutes and gives quick feedback.",
  "<b>先学气，再学吃子。</b>不要一上来就讲布局、目数。孩子最喜欢吃子，那就先玩“吃子游戏”。": "<b>Liberties first, capturing second.</b> Do not start with opening theory or counting. Children love capturing, so play \"capture games\" first.",
  "<b>用让子平衡实力。</b>练习盘可以给黑棋摆 2～9 颗让子。孩子能赢才有动力。9 路建议从让 4～5 子开始。": "<b>Balance strength with handicap stones.</b> The practice board can place 2–9 handicap stones for Black. Children need to win to stay motivated. On 9×9 start with 4–5 stones.",
  "<b>输棋时先共情，再复盘。</b>“这局输了有点难过吧？我看看……咦，这里如果走这里，是不是就能吃掉了？”": "<b>When they lose, empathise first, then review.</b> \"Losing this one stings, huh? Let me look… hey, if you had played here, could you have captured it?\"",
  "<b>每天 15 分钟，比周末 3 小时强。</b>围棋是手感，天天摸盘才长棋。": "<b>Fifteen minutes a day beats three hours on the weekend.</b> Go is a feel for the board — daily contact is what improves it.",
  "<b>只讲一个要点。</b>复盘时别一口气讲十个错误，挑最关键的一个说清楚就够了。": "<b>Review only one point.</b> Do not list ten mistakes at once — pick the single most important one and explain it clearly.",
  "<b>多用提问，少用断言。</b>“你数数这颗子还有几口气？”比直接说“这里要下”有效得多。": "<b>Ask more, assert less.</b> \"How many liberties does this stone have?\" works far better than \"Play here.\"",
  "<b>让孩子多讲。</b>下完棋让他说说“刚才那步你为什么这么下”。表达的过程就是在整理思路。": "<b>Let them talk.</b> After a game, ask them to explain \"why did you play that move?\" — putting it into words organises their thinking.",
  "<b>别急着纠正“不标准”的下法。</b>只要不违规、不自杀，先让他自己试错，吃几个亏就记住了。": "<b>Do not rush to correct \"unorthodox\" moves.</b> As long as it is legal and not suicide, let them try and fail — a few losses and they will remember.",
  "<b>陪着他一起学。</b>你也在进步，他会更有兴趣。可以一起做题、一起复盘、一起被电脑打败然后研究怎么赢回来。": "<b>Learn alongside them.</b> If you are improving too, they will be more interested. Solve problems together, review together, get beaten by the computer together, then figure out how to win it back.",
  "<b>一个小练习：</b>在 9 路盘上摆 3 颗白子，让孩子想办法全部吃掉。做出来就再加一颗。这比任何讲解都管用。": "<b>One small exercise:</b> place 3 white stones on a 9×9 board and let your child try to capture them all. When they succeed, add one more. This beats any explanation.",
  "看完了，去下一盘吧": "That is it — go and play a game",
  "建议从「9 路 · 让 5 子 · 初级」开始。<br>赢回来之后，再一步步把让子减掉。": "Start with <b>9×9 · handicap 5 · Easy</b>.<br>Once they win, reduce the handicap step by step.",
  "打开练习盘": "Open the practice board"
});

/* -------------------------- tutorial: 日本語 -------------------------- */
I18N.add('ja', {
  "围棋入门教程": "囲碁入門ガイド",
  "死活题 · 打谱": "詰碁・棋譜並べ",
  "去下棋": "対局へ",
  "目录": "目次",
  "1. 三分钟入门": "1. 3分でわかる基本",
  "2. 气：棋子的命": "2. 呼吸点：石の命",
  "3. 吃子": "3. 石を取る",
  "4. 连接与分断": "4. つなぎと切り",
  "连接": "つなぐ",
  "分断": "切る",
  "5. 做眼与活棋": "5. 眼と生き",
  "6. 吃子四大技巧": "6. 取りの四大テクニック",
  "7. 打劫": "7. コウ",
  "8. 布局常识": "8. 布石の基本",
  "9. 终局与数子": "9. 終局と計算",
  "10. 陪娃学棋建议": "10. 子どもと学ぶコツ",
  "和孩子一起学围棋": "子どもと一緒に囲碁を",
  "面向零基础的家长。按顺序读完这 10 节，你就能陪孩子下完一整盘棋了。": "まったくの初心者の親御さん向け。この10章を順に読めば、お子さんと一局打ち切れます。",
  "<span class=\"num\">1</span>三分钟入门": "<span class=\"num\">1</span>3分でわかる基本",
  "围棋的规则少得出奇，但变化多得吓人。先记住这四条，就可以开始下了：": "囲碁のルールは驚くほど少ないのに、変化は無限です。まずこの4つを覚えれば打てます：",
  "<b>下在交叉点上</b>，不是格子里。": "<b>線の交差点</b>に打ちます。マスの中ではありません。",
  "<b>黑棋先下，白棋后下</b>，一人一手，轮流来。": "<b>黒が先、次に白</b>。一手ずつ交互に打ちます。",
  "<b>棋子落下就不能再移动</b>了（除非被对方吃掉拿走）。": "置いた石は<b>動かせません</b>（相手に取られて取り除かれる場合を除く）。",
  "<b>最后谁占的地盘大，谁赢。</b>": "<b>より広い地を囲んだ方が勝ちです。</b>",
  "黑先白后，轮流落在交叉点上。数字表示落子顺序。": "黒から白へ、交差点に交互に打ちます。数字は着手順です。",
  "<b>给孩子这样讲：</b>“棋盘是一片空地，我们轮流修墙圈地。谁的围墙圈的地多，谁就赢。”": "<b>お子さんにはこう伝えましょう：</b>「盤は空き地。交代で塀を立てて土地を囲むんだよ。広く囲めた方が勝ち。」",
  "<span class=\"num\">2</span>气：棋子的命根子": "<span class=\"num\">2</span>呼吸点：石の命",
  "紧挨着一颗棋子、<b>上 / 下 / 左 / 右</b>四个方向的空点，叫做这颗棋子的“<b>气</b>”。斜对角不算。": "石に<b>上下左右</b>で接する空点を、その石の「<b>呼吸点（ダメ）</b>」といいます。斜めは数えません。",
  "一颗棋子有多少气，取决于它在哪儿：": "石の呼吸点の数は、置かれた場所で変わります：",
  "<b>中间</b>的棋子：<b>4 口气</b>": "<b>中央</b>の石：<b>4呼吸点</b>",
  "<b>边上</b>的棋子：<b>3 口气</b>": "<b>辺</b>の石：<b>3呼吸点</b>",
  "<b>角上</b>的棋子：只有 <b>2 口气</b>": "<b>隅</b>の石：たった<b>2呼吸点</b>",
  "连在一起的棋子，气是共享的": "つながった石は呼吸点を共有します",
  "两颗（或多颗）<b>紧紧相邻</b>的同色棋子会连成一块，它们的气合起来算。": "<b>隣接</b>した同色の石は一つの塊になり、呼吸点はまとめて数えます。",
  "两颗连着的白子，共有 <b>6 口气</b>（不是 4 口）": "つながった白2子の呼吸点は<b>6つ</b>（4つではない）",
  "<b>这是围棋最重要的概念。</b>后面所有的吃子、逃子、围地，都围着“气”转。孩子只要理解了“气”，围棋就入门一半了。": "<b>これが囲碁で一番大切な考え方です。</b>取り、逃げ、囲い、すべて呼吸点が関わります。お子さんが「呼吸点」を理解すれば、もう半分入門したようなものです。",
  "<span class=\"num\">3</span>吃子：把对手的子拿走": "<span class=\"num\">3</span>石を取る：相手の石を盤から外す",
  "当一块棋的<b>气被对方全部堵住</b>（变成 0 口），这块棋就被“<b>提</b>”掉了 —— 从棋盘上拿走，收进对方的提子堆里。": "塊の<b>呼吸点がすべて埋まると</b>（0になると）、その塊は<b>取られて</b>盤から外され、相手のアゲハマになります。",
  "白子还剩 2 口气（圆圈处）": "白は残り2呼吸点（丸印）",
  "黑棋再堵一口，白子只剩 1 口气 —— 这叫“<b>打吃</b>”": "黒がもう一つ塞ぐと、白は残り1呼吸点。これが「<b>アタリ</b>」です。",
  "黑棋堵上最后一口气，白子被<b>提掉</b>，空出来一个点": "黒が最後の呼吸点を塞ぐと、白は<b>取られて</b>空点が一つできます。",
  "两条铁律": "二つの鉄則",
  "<b>不能自杀：</b>如果一手棋下去，自己这块棋一口气都没有、又没提到对方，就是违规的（不能下）。": "<b>自殺手は禁止：</b>自分の塊の呼吸点がなくなり、相手も取れない手は打てません。",
  "<b>提子优先：</b>如果你这一手能提掉对方的子，哪怕自己只剩一口气，也<b>不算</b>自杀，是合法的。": "<b>取りが優先：</b>相手を取れる手なら、自分の石が残り1呼吸点でも自殺には<b>なりません</b>。",
  "<b>陪练玩法：</b>在 9 路盘上，让孩子执黑，你故意摆几颗白子只剩一口气，让他去找“打吃”。找对一次就表扬一次，兴趣就上来了。": "<b>練習法：</b>9路盤でお子さんに黒を持たせ、呼吸点が1つの白石をいくつか置いて「アタリ」を探させましょう。正解するたびに褒めれば、どんどん興味が湧きます。",
  "<span class=\"num\">4</span>连接与分断": "<span class=\"num\">4</span>つなぎと切り",
  "两块棋如果被对方切开，就各自为战、气也变少，很容易被吃掉。所以：<b>该连的要连，该断的要断</b>。": "二つの塊が切り離されると、それぞれ孤立して呼吸点も減り、取られやすくなります。つまり：<b>つなぐべきはつなぎ、切るべきは切る</b>。",
  "白棋两块分开，中间是个断点": "白の二つの塊が分かれています。間が切断点です。",
  "白棋下在中间 → <b>连成一块</b>，一起算气": "白が間に打つと → <b>一つの塊</b>になり、呼吸点をまとめて数えます。",
  "黑棋先占了要点，白棋被<b>上下分断</b>，两块都变弱": "黒が先に要点を占めると、白は<b>上下に分断</b>され、両方とも弱くなります。",
  "<b>口诀：</b>“棋从断处生”。看到对方有断点，就像看到衣服上的线头，一扯就开。": "<b>格言：</b>「碁は切りから生まれる」。相手の形に切れ目があれば、服のほつれ糸のようなもの。引けばほどけます。",
  "<span class=\"num\">5</span>做眼与活棋": "<span class=\"num\">5</span>眼と生き",
  "围地只是目的，<b>先要保证自己不被吃</b>。围棋里判断一块棋能不能活，就看它有没有<b>两只真眼</b>。": "地を囲むのが目的ですが、<b>まず取られないことが大事</b>。塊が生きるかどうかは<b>二つの本眼</b>があるかで決まります。",
  "什么是眼？": "眼とは？",
  "被自己棋子<b>四面包住</b>的空点，就是一只“眼”。对方不能往眼里下子（那是自杀），除非他能提掉你。": "自分の石に<b>四方を囲まれた</b>空点が「眼」です。相手は眼の中に打てません（自殺手になるため）。ただしあなたを取れる場合は別です。",
  "白棋围出 <b>1 只眼</b>。黒棋可以从外面收紧，最后填进来提掉白棋": "白は<b>眼が1つ</b>。黒は外から締め、最後に填めて白を取れます。",
  "白棋做出 <b>2 只眼</b>。<b>永远吃不掉了，这叫“活棋”</b>": "白は<b>眼が2つ</b>。<b>もう取られることはありません。これを「生き」といいます。</b>",
  "为什么两只眼就死不了？": "なぜ二つの眼なら死なない？",
  "因为对方<b>一次只能下一手棋</b>。他填你左边的眼，你就在右边还有一口气；他填右边的眼，你左边的眼又活了。他永远没法同时堵住两个。": "相手は<b>一度に一手しか打てない</b>からです。左の眼を埋めても右に呼吸点が残り、右を埋めても左の眼が生き返ります。同時に両方は塞げません。",
  "<b>注意：</b>两只眼必须是<b>“真眼”</b>。如果眼是假的（对方可以合法下进来打吃你），那就不算。": "<b>注意：</b>二つの眼は<b>「本眼」</b>でなければなりません。欠け眼（相手が合法に打ち込んでアタリにできる）は数えません。",
  "<b>初学阶段只要记住一句话：</b>“被包围的时候，努力做出两只眼，就安全了。”": "<b>初級のうちは、この一言だけで十分：</b>「囲まれたら、二つの眼を作れば安全」",
  "<span class=\"num\">6</span>吃子四大技巧": "<span class=\"num\">6</span>取りの四大テクニック",
  "① 打吃（叫吃）": "(1) アタリ",
  "把对方一块棋逼到只剩一口气。这是最基础的攻击手段，对方必须应。": "相手の塊を呼吸点1つまで追い込みます。最も基本的な攻めで、相手は必ず応じなければなりません。",
  "② 征子（扭羊头）": "(2) シチョウ",
  "对方一块棋只有两口气时，你连续打吃，把它一路赶到边上吃掉。这是新手最容易吃亏的招法。": "相手の塊の呼吸点が2つのとき、連続でアタリを打ち、端まで追い詰めて取ります。初心者が最も損をしやすい手筋です。",
  "白子只剩 1 口气（红圈）。它只能往那儿逃，黑棋再打吃，白棋再逃……一路被赶到边上吃掉": "白は残り1呼吸点（赤丸）。そこへ逃げるしかなく、黒がアタリを続けて端まで追い詰めて取ります。",
  "<b>重要：</b>征子之前一定要先看清楚 —— 白棋逃跑的路线上如果有白子接应，黑棋就会崩。9 路棋盘容易看清，19 路就要小心。": "<b>重要：</b>シチョウを始める前に必ず読み切ること。逃げ道に白の援軍があると黒が崩れます。9路盤なら見やすいですが、19路盤は注意。",
  "③ 枷吃（关）": "(3) ゲタ",
  "不直接贴身打吃，而是从外面<b>封住逃跑方向</b>。比征子更稳，不怕对方接应。": "ぴったり付かずに、外から<b>逃げ道を封じます</b>。シチョウより堅く、相手に援軍がいても安全です。",
  "黑棋在 (4,6)、(6,5) 这样“围”住，白棋跑不掉 —— 这叫枷吃": "黒が (4,6)、(6,5) と「囲う」と白は逃げられません。これがゲタです。",
  "④ 倒扑": "(4) ウッテガエシ",
  "先故意送一颗子进对方嘴里，等对方提掉后，你反过来把他整块吃掉。": "わざと相手に石を取らせ、取った後に相手の塊ごと取り返します。",
  "白棋下在红圈处，能提掉黑两子 —— 但提完自己只剩一口气，黑棋再下 (4,4) 反把白棋全提。这就是<b>倒扑</b>": "白が赤丸に打てば黒2子を取れますが、取った後は呼吸点が1つ。黒が (4,4) に打てば白を丸ごと取り返します。これが<b>ウッテガエシ</b>です。",
  "<span class=\"num\">7</span>打劫": "<span class=\"num\">7</span>コウ",
  "围棋里有一种特殊的形状：<b>双方可以互相提掉对方同一颗子，来回无限循环</b>。这就是“劫”。": "囲碁には特別な形があります：<b>互いに同じ一子を取り合って無限に繰り返せる</b>。これが「コウ」です。",
  "黑棋下 (4,5) 提掉白 (4,4)；接着白棋又能下 (4,4) 提掉黑 (4,5)……无限循环": "黒が (4,5) に打って白 (4,4) を取り、次に白が (4,4) に打って黒 (4,5) を取る……これが無限に続きます。",
  "规则：打劫不能马上提回": "ルール：すぐには取り返せない",
  "被提的一方，<b>不能立刻在同一处提回来</b>。必须先在棋盘<b>别的地方下一手</b>，如果对方应了，你下一手才能提回来。": "取られた側は<b>すぐに同じ場所で取り返せません</b>。まず盤の<b>別の場所に一手</b>打つ必要があり、相手が応じたら次に取り返せます。",
  "所以在实战中，打劫经常变成“<b>找劫材</b>”的博弈：我下一手威胁你，你如果不理我，我就在劫上提回来；你如果应了，我再提回劫。谁手里的劫材多，谁打赢这个劫。": "ですから実戦では、コウは<b>コウ材</b>の勝負になります。私が脅しを打ち、あなたが無視すればコウを取り返す。応じれば私がまた取り返す。コウ材が多い方がコウに勝ちます。",
  "<b>对初学者：</b>打劫可以先放一放。记住“不能马上提回，要先走别处”就够了。我们的练习盘会自动阻止违规的提回。": "<b>初心者の方へ：</b>コウは後回しで構いません。「すぐ取り返さず、まず別所に打つ」だけ覚えれば十分。練習盤は違反の取り返しを自動で防ぎます。",
  "<span class=\"num\">8</span>布局常识：金角银边草肚皮": "<span class=\"num\">8</span>布石の基本：まず隅から",
  "空棋盘时该从哪儿下？记住这句口诀：": "空盤ではどこから打つべきか。この格言を覚えましょう：",
  "金角 · 银边 · 草肚皮": "隅は金 · 辺は銀 · 中腹は草",
  "<b>角</b>最值钱：两边有棋盘边线当天然围墙，围同样的地只要很少的棋子。": "<b>隅</b>が一番得：盤の辺が二本、ただの壁になります。同じ地を少ない石で囲めます。",
  "<b>边</b>次之：只有一条边线帮忙。": "<b>辺</b>が次：味方は辺が一本だけです。",
  "<b>中腹</b>最费子：四面八方都要自己围，效率最低。": "<b>中腹</b>が最も石を使います：四方すべて自分で囲まねばならず、効率が最悪です。",
  "19 路棋盘上的“星位”。开局一般先占角（圆圈处），再向边上发展": "19路盤の星。序盤はまず隅（丸印）を占め、それから辺へ広がります。",
  "开局的基本顺序": "序盤の基本手順",
  "<b>占空角</b>：角上星位、小目都行。": "<b>空き隅を占める</b>：星でも小目でも構いません。",
  "<b>挂角 / 守角</b>：去对方角上分一杯羹，或者加固自己的角。": "<b>掛かり / 締まり</b>：相手の隅に割り込むか、自分の隅を固めます。",
  "<b>拆边</b>：向边上展开，把地盘连成片。": "<b>ヒラキ</b>：辺へ広げ、地を一つにつなげます。",
  "然后再进入中盘的战斗。": "その後、中盤の戦いに入ります。",
  "下在第几线？": "何線に打つ？",
  "<b>第二线</b>：太低，只顾眼前的小地，容易被压。": "<b>二線</b>：低すぎます。目先の小地だけ。押さえ込まれやすい。",
  "<b>第三线</b>：好守地，常用。": "<b>三線</b>：地を守るのに良く、よく使われます。",
  "<b>第四线</b>：好发展，常用。": "<b>四線</b>：発展に良く、よく使われます。",
  "<b>第五线及以上</b>：太虚，容易落空。": "<b>五線以上</b>：あまりに漠然として、空振りになりやすい。",
  "初学 9 路棋，直接占星位和中腹附近的开阔点就行，不用太纠结。": "9路盤のうちは、星と中腹寄りの広い点を取れば十分。あまり悩まなくて大丈夫です。",
  "<span class=\"num\">9</span>终局与数子": "<span class=\"num\">9</span>終局と計算",
  "棋下到什么时候算完？当棋盘上再也找不到有价值的落点时，双方可以<b>连续虚手</b>（放弃一手）表示结束。": "いつ終わるのか。もう価値のある点がなくなったら、双方が<b>連続でパス</b>して終局を知らせます。",
  "怎么算谁赢": "勝敗の決め方",
  "最直观的是<b>数子法</b>（中国规则）：": "最も分かりやすいのは<b>数子法</b>（中国ルール）です：",
  "<b>先把死子拿掉。</b>双方确认哪些棋已经救不活了，拿掉后算对方的。": "<b>まず死に石を取ります。</b>双方が救えない石を確認し、取り除いて相手のものにします。",
  "<b>数自己的棋子 + 自己围住的空地</b>，加起来就是你的总地盘。": "<b>自分の石と、自分が囲んだ空点を数えます</b>。合計があなたの地です。",
  "谁多谁赢。": "多い方が勝ちです。",
  "<b>白棋要贴目。</b>因为黑棋先下有便宜，所以白棋最后要额外加上 6.5 目（相当于让黑棋 6.5 目）。": "<b>白にはコミがあります。</b>黒が先に打つ分有利なので、最後に白へ 6.5 目を加えます。",
  "左上黑棋围住 5 个空点（小圈）→ 这 5 目算黑棋的；加上黑棋自己的棋子，就是黑棋的地盘": "左上で黒が5つの空点（小丸）を囲んでいます → この5目は黒のもの。黒の石と合わせて黒の地になります。",
  "练习盘上有「<b>结束数子</b>」按钮，点一下会自动帮你数完，告诉你是谁赢、赢多少目。<br>\n        <b>小提示：</b>数子前记得先把盘上明显的死子提干净，不然会算错。": "練習盤には「<b>終局して計算</b>」ボタンがあり、押すと自動で数えて勝敗と目数を教えてくれます。<br>\n        <b>ヒント：</b>明らかな死に石は先に取っておかないと計算を間違えます。",
  "<span class=\"num\">10</span>陪娃学棋的 10 条建议": "<span class=\"num\">10</span>子どもと学ぶ10のコツ",
  "<b>从 9 路盘开始。</b>19 路对初学者太大，一盘要下很久，孩子容易失去耐心。9 路一盘十几分钟，输赢反馈快。": "<b>9路盤から始める。</b>19路は初心者には広すぎ、一局が長すぎて子どもは飽きます。9路なら10分ほどで終わり、結果がすぐ返ってきます。",
  "<b>先学气，再学吃子。</b>不要一上来就讲布局、目数。孩子最喜欢吃子，那就先玩“吃子游戏”。": "<b>まず呼吸点、次に取り。</b>いきなり布石や目数の話をしないこと。子どもは取るのが大好きなので、まず「取りゲーム」を。",
  "<b>用让子平衡实力。</b>练习盘可以给黑棋摆 2～9 颗让子。孩子能赢才有动力。9 路建议从让 4～5 子开始。": "<b>置き石で実力を調整。</b>練習盤は黒に2〜9子の置き石を置けます。子どもは勝てないとやる気が出ません。9路なら4〜5子から始めましょう。",
  "<b>输棋时先共情，再复盘。</b>“这局输了有点难过吧？我看看……咦，这里如果走这里，是不是就能吃掉了？”": "<b>負けたときは、まず共感してから振り返り。</b>「負けて悔しいよね。どれどれ……あ、ここに打っていたら取れたんじゃない？」",
  "<b>每天 15 分钟，比周末 3 小时强。</b>围棋是手感，天天摸盘才长棋。": "<b>毎日15分の方が、週末3時間より効きます。</b>囲碁は盤の感覚。毎日触れてこそ伸びます。",
  "<b>只讲一个要点。</b>复盘时别一口气讲十个错误，挑最关键的一个说清楚就够了。": "<b>振り返りは一点だけ。</b>一度に10個のミスを並べないこと。一番大事な一つを選んで、それだけを丁寧に。",
  "<b>多用提问，少用断言。</b>“你数数这颗子还有几口气？”比直接说“这里要下”有效得多。": "<b>問いかけを多く、断定を少なく。</b>「この石の呼吸点はいくつ？」は「ここに打って」よりずっと効果的です。",
  "<b>让孩子多讲。</b>下完棋让他说说“刚才那步你为什么这么下”。表达的过程就是在整理思路。": "<b>子どもに話させる。</b>一局終えたら「さっきの手はなぜ？」と聞いてみましょう。言葉にする過程が考えを整理します。",
  "<b>别急着纠正“不标准”的下法。</b>只要不违规、不自杀，先让他自己试错，吃几个亏就记住了。": "<b>「型にはまらない」手をすぐ直さない。</b>反則でも自殺手でもなければ、まず自分で試させましょう。少し損をすれば覚えます。",
  "<b>陪着他一起学。</b>你也在进步，他会更有兴趣。可以一起做题、一起复盘、一起被电脑打败然后研究怎么赢回来。": "<b>一緒に学ぶ。</b>あなたも上達すれば、子どもはもっと興味を持ちます。一緒に問題を解き、一緒に振り返り、一緒にコンピュータに負けて、どう勝ち返すか研究しましょう。",
  "<b>一个小练习：</b>在 9 路盘上摆 3 颗白子，让孩子想办法全部吃掉。做出来就再加一颗。这比任何讲解都管用。": "<b>小さな練習：</b>9路盤に白石を3つ置き、全部取れるか挑戦させましょう。できたら一つ増やす。どんな説明より効きます。",
  "看完了，去下一盘吧": "以上です。さあ一局打ってみましょう",
  "建议从「9 路 · 让 5 子 · 初级」开始。<br>赢回来之后，再一步步把让子减掉。": "<b>9路盤・置き石5子・初級</b>から始めましょう。<br>勝てるようになったら、少しずつ置き石を減らします。",
  "打开练习盘": "練習盤を開く"
});

/* -------------------------- tutorial: 한국어 -------------------------- */
I18N.add('ko', {
  "围棋入门教程": "바둑 입문 가이드",
  "死活题 · 打谱": "사활문제 · 기보",
  "去下棋": "대국하기",
  "目录": "목차",
  "1. 三分钟入门": "1. 3분 입문",
  "2. 气：棋子的命": "2. 활로: 돌의 목숨",
  "3. 吃子": "3. 따내기",
  "4. 连接与分断": "4. 연결과 절단",
  "连接": "연결",
  "分断": "절단",
  "5. 做眼与活棋": "5. 두 눈과 삶",
  "6. 吃子四大技巧": "6. 따내기 네 가지 기술",
  "7. 打劫": "7. 패",
  "8. 布局常识": "8. 포석 기초",
  "9. 终局与数子": "9. 종국과 집 계산",
  "10. 陪娃学棋建议": "10. 아이와 바둑 두는 법",
  "和孩子一起学围棋": "아이와 함께 바둑을",
  "面向零基础的家长。按顺序读完这 10 节，你就能陪孩子下完一整盘棋了。": "바둑을 전혀 모르는 부모님을 위한 안내. 이 10개 장을 순서대로 읽으면 아이와 한 판을 끝까지 둘 수 있습니다.",
  "<span class=\"num\">1</span>三分钟入门": "<span class=\"num\">1</span>3분 입문",
  "围棋的规则少得出奇，但变化多得吓人。先记住这四条，就可以开始下了：": "바둑은 규칙이 놀랄 만큼 적지만 변화는 무궁무진합니다. 이 네 가지만 알면 바로 둘 수 있습니다:",
  "<b>下在交叉点上</b>，不是格子里。": "<b>교차점</b>에 둡니다. 칸 안이 아닙니다.",
  "<b>黑棋先下，白棋后下</b>，一人一手，轮流来。": "<b>흑이 먼저, 백이 다음</b> — 한 수씩 번갈아 둡니다.",
  "<b>棋子落下就不能再移动</b>了（除非被对方吃掉拿走）。": "한번 놓은 돌은 <b>움직일 수 없습니다</b> (상대에게 잡혀 들어내는 경우 제외).",
  "<b>最后谁占的地盘大，谁赢。</b>": "<b>더 많은 집을 둘러싼 쪽이 이깁니다.</b>",
  "黑先白后，轮流落在交叉点上。数字表示落子顺序。": "흑부터 백까지 교차점에 번갈아 둡니다. 숫자는 착수 순서입니다.",
  "<b>给孩子这样讲：</b>“棋盘是一片空地，我们轮流修墙圈地。谁的围墙圈的地多，谁就赢。”": "<b>아이에게 이렇게 말해 주세요:</b> \"바둑판은 빈 땅이야. 번갈아 울타리를 세워 땅을 차지하는 거야. 더 많이 둘러싼 사람이 이겨.\"",
  "<span class=\"num\">2</span>气：棋子的命根子": "<span class=\"num\">2</span>활로: 돌의 목숨",
  "紧挨着一颗棋子、<b>上 / 下 / 左 / 右</b>四个方向的空点，叫做这颗棋子的“<b>气</b>”。斜对角不算。": "돌의 <b>위·아래·왼쪽·오른쪽</b>에 바로 붙은 빈 점이 그 돌의 \"<b>활로</b>\"입니다. 대각선은 포함되지 않습니다.",
  "一颗棋子有多少气，取决于它在哪儿：": "돌의 활로 수는 어디에 놓였는지에 따라 달라집니다:",
  "<b>中间</b>的棋子：<b>4 口气</b>": "<b>중앙</b>의 돌: <b>활로 4개</b>",
  "<b>边上</b>的棋子：<b>3 口气</b>": "<b>변</b>의 돌: <b>활로 3개</b>",
  "<b>角上</b>的棋子：只有 <b>2 口气</b>": "<b>귀</b>의 돌: 단 <b>활로 2개</b>",
  "连在一起的棋子，气是共享的": "연결된 돌은 활로를 공유합니다",
  "两颗（或多颗）<b>紧紧相邻</b>的同色棋子会连成一块，它们的气合起来算。": "<b>맞닿은</b> 같은 색 돌은 한 덩어리가 되어 활로를 합쳐서 셉니다.",
  "两颗连着的白子，共有 <b>6 口气</b>（不是 4 口）": "연결된 백 두 점의 활로는 <b>6개</b> (4개가 아닙니다)",
  "<b>这是围棋最重要的概念。</b>后面所有的吃子、逃子、围地，都围着“气”转。孩子只要理解了“气”，围棋就入门一半了。": "<b>이것이 바둑에서 가장 중요한 개념입니다.</b> 따내기, 도망, 집 만들기 모두 활로와 연결됩니다. 아이가 \"활로\"를 이해하면 절반은 들어온 것입니다.",
  "<span class=\"num\">3</span>吃子：把对手的子拿走": "<span class=\"num\">3</span>따내기: 상대 돌을 들어내기",
  "当一块棋的<b>气被对方全部堵住</b>（变成 0 口），这块棋就被“<b>提</b>”掉了 —— 从棋盘上拿走，收进对方的提子堆里。": "한 덩어리의 <b>활로가 모두 막히면</b>(0개), 그 돌은 <b>따내져</b> 판에서 들어내고 상대의 사로잡은 돌이 됩니다.",
  "白子还剩 2 口气（圆圈处）": "백은 활로가 2개 남았습니다 (동그라미)",
  "黑棋再堵一口，白子只剩 1 口气 —— 这叫“<b>打吃</b>”": "흑이 하나 더 막으면 백은 활로 1개. 이것을 <b>단수</b>라고 합니다.",
  "黑棋堵上最后一口气，白子被<b>提掉</b>，空出来一个点": "흑이 마지막 활로를 막으면 백은 <b>따내져</b> 빈 점이 하나 생깁니다.",
  "两条铁律": "두 가지 철칙",
  "<b>不能自杀：</b>如果一手棋下去，自己这块棋一口气都没有、又没提到对方，就是违规的（不能下）。": "<b>자충수 금지:</b> 자기 덩어리에 활로가 없어지고 상대도 못 따내는 수는 둘 수 없습니다.",
  "<b>提子优先：</b>如果你这一手能提掉对方的子，哪怕自己只剩一口气，也<b>不算</b>自杀，是合法的。": "<b>따내기가 우선:</b> 상대를 따낼 수 있다면 자기 돌의 활로가 1개여도 자충수가 <b>아닙니다</b>.",
  "<b>陪练玩法：</b>在 9 路盘上，让孩子执黑，你故意摆几颗白子只剩一口气，让他去找“打吃”。找对一次就表扬一次，兴趣就上来了。": "<b>연습 놀이:</b> 9줄 판에서 아이가 흑을 잡게 하고, 활로가 1개뿐인 백돌을 몇 개 놓아 \"단수\"를 찾게 하세요. 맞힐 때마다 칭찬하면 흥미가 확 올라갑니다.",
  "<span class=\"num\">4</span>连接与分断": "<span class=\"num\">4</span>연결과 절단",
  "两块棋如果被对方切开，就各自为战、气也变少，很容易被吃掉。所以：<b>该连的要连，该断的要断</b>。": "두 덩어리가 잘리면 각자 싸워야 하고 활로도 줄어 잡히기 쉽습니다. 그래서: <b>이을 것은 잇고, 끊을 것은 끊습니다</b>.",
  "白棋两块分开，中间是个断点": "백 두 덩어리가 떨어져 있습니다. 사이가 절단점입니다.",
  "白棋下在中间 → <b>连成一块</b>，一起算气": "백이 사이에 두면 → <b>한 덩어리</b>가 되어 활로를 합쳐 셉니다.",
  "黑棋先占了要点，白棋被<b>上下分断</b>，两块都变弱": "흑이 먼저 요점을 차지하면 백은 <b>위아래로 절단</b>되어 둘 다 약해집니다.",
  "<b>口诀：</b>“棋从断处生”。看到对方有断点，就像看到衣服上的线头，一扯就开。": "<b>격언:</b> \"싸움은 끊는 곳에서 시작된다.\" 상대 모양에 틈이 보이면 옷의 실밥과 같아서 한 번 당기면 풀립니다.",
  "<span class=\"num\">5</span>做眼与活棋": "<span class=\"num\">5</span>두 눈과 삶",
  "围地只是目的，<b>先要保证自己不被吃</b>。围棋里判断一块棋能不能活，就看它有没有<b>两只真眼</b>。": "집을 만드는 것이 목적이지만 <b>먼저 잡히지 않아야 합니다</b>. 덩어리가 사는지는 <b>두 개의 진짜 눈</b>이 있는지로 결정됩니다.",
  "什么是眼？": "눈이란?",
  "被自己棋子<b>四面包住</b>的空点，就是一只“眼”。对方不能往眼里下子（那是自杀），除非他能提掉你。": "자기 돌로 <b>사방이 둘러싸인</b> 빈 점이 \"눈\"입니다. 상대는 눈 안에 둘 수 없습니다(자충수). 단, 당신을 따낼 수 있다면 예외입니다.",
  "白棋围出 <b>1 只眼</b>。黒棋可以从外面收紧，最后填进来提掉白棋": "백은 <b>눈이 1개</b>. 흑이 바깥에서 조인 뒤 메우면 백을 잡을 수 있습니다.",
  "白棋做出 <b>2 只眼</b>。<b>永远吃不掉了，这叫“活棋”</b>": "백은 <b>눈이 2개</b>. <b>절대 잡히지 않습니다. 이것이 \"사는 것\"입니다.</b>",
  "为什么两只眼就死不了？": "두 눈이면 왜 죽지 않을까?",
  "因为对方<b>一次只能下一手棋</b>。他填你左边的眼，你就在右边还有一口气；他填右边的眼，你左边的眼又活了。他永远没法同时堵住两个。": "상대는 <b>한 번에 한 수만 둘 수 있기</b> 때문입니다. 왼쪽 눈을 메워도 오른쪽에 활로가 남고, 오른쪽을 메우면 왼쪽 눈이 다시 살아납니다. 동시에 둘 다 막을 수 없습니다.",
  "<b>注意：</b>两只眼必须是<b>“真眼”</b>。如果眼是假的（对方可以合法下进来打吃你），那就不算。": "<b>주의:</b> 두 눈은 반드시 <b>진짜 눈</b>이어야 합니다. 가짜 눈(상대가 합법적으로 들어와 단수할 수 있는 곳)은 인정되지 않습니다.",
  "<b>初学阶段只要记住一句话：</b>“被包围的时候，努力做出两只眼，就安全了。”": "<b>초급 단계에서는 한 마디면 충분합니다:</b> \"둘러싸이면 두 눈을 만들면 안전해.\"",
  "<span class=\"num\">6</span>吃子四大技巧": "<span class=\"num\">6</span>따내기 네 가지 기술",
  "① 打吃（叫吃）": "(1) 단수",
  "把对方一块棋逼到只剩一口气。这是最基础的攻击手段，对方必须应。": "상대 덩어리를 활로 1개로 몰아갑니다. 가장 기본적인 공격이며 상대는 반드시 응수해야 합니다.",
  "② 征子（扭羊头）": "(2) 축",
  "对方一块棋只有两口气时，你连续打吃，把它一路赶到边上吃掉。这是新手最容易吃亏的招法。": "상대 덩어리의 활로가 2개일 때 계속 단수를 걸어 변까지 몰아 잡습니다. 초보자가 가장 많이 당하는 수법입니다.",
  "白子只剩 1 口气（红圈）。它只能往那儿逃，黑棋再打吃，白棋再逃……一路被赶到边上吃掉": "백은 활로가 1개(빨간 원). 그쪽으로 도망칠 수밖에 없고, 흑이 계속 단수를 걸어 변까지 몰아 잡습니다.",
  "<b>重要：</b>征子之前一定要先看清楚 —— 白棋逃跑的路线上如果有白子接应，黑棋就会崩。9 路棋盘容易看清，19 路就要小心。": "<b>중요:</b> 축을 걸기 전에 반드시 읽어야 합니다. 도망길에 백의 응원 돌이 있으면 흑이 무너집니다. 9줄은 보기 쉽지만 19줄은 조심하세요.",
  "③ 枷吃（关）": "(3) 씌움(네트)",
  "不直接贴身打吃，而是从外面<b>封住逃跑方向</b>。比征子更稳，不怕对方接应。": "바로 붙지 않고 바깥에서 <b>도망길을 막습니다</b>. 축보다 튼튼하고 상대 응원이 있어도 안전합니다.",
  "黑棋在 (4,6)、(6,5) 这样“围”住，白棋跑不掉 —— 这叫枷吃": "흑이 (4,6), (6,5)로 \"둘러싸면\" 백은 도망칠 수 없습니다. 이것이 씌움입니다.",
  "④ 倒扑": "(4) 되치기",
  "先故意送一颗子进对方嘴里，等对方提掉后，你反过来把他整块吃掉。": "일부러 상대에게 돌을 주고, 상대가 따낸 뒤 그 덩어리를 통째로 되따냅니다.",
  "白棋下在红圈处，能提掉黑两子 —— 但提完自己只剩一口气，黑棋再下 (4,4) 反把白棋全提。这就是<b>倒扑</b>": "백이 빨간 원에 두면 흑 2점을 따내지만, 그 뒤 백은 활로가 1개. 흑이 (4,4)에 두면 백을 통째로 되따냅니다. 이것이 <b>되치기</b>입니다.",
  "<span class=\"num\">7</span>打劫": "<span class=\"num\">7</span>패",
  "围棋里有一种特殊的形状：<b>双方可以互相提掉对方同一颗子，来回无限循环</b>。这就是“劫”。": "바둑에는 특별한 모양이 있습니다: <b>양쪽이 같은 한 점을 주고받으며 끝없이 되따낼 수 있는</b> 형태. 이것이 \"패\"입니다.",
  "黑棋下 (4,5) 提掉白 (4,4)；接着白棋又能下 (4,4) 提掉黑 (4,5)……无限循环": "흑이 (4,5)에 두어 백 (4,4)를 따내고, 다시 백이 (4,4)에 두어 흑 (4,5)를 딸 수 있습니다… 끝없이.",
  "规则：打劫不能马上提回": "규칙: 바로 되따낼 수 없습니다",
  "被提的一方，<b>不能立刻在同一处提回来</b>。必须先在棋盘<b>别的地方下一手</b>，如果对方应了，你下一手才能提回来。": "따낸 쪽은 <b>즉시 같은 자리에서 되따낼 수 없습니다</b>. 먼저 <b>판의 다른 곳에 한 수</b> 두어야 하고, 상대가 응수하면 그다음 되따낼 수 있습니다.",
  "所以在实战中，打劫经常变成“<b>找劫材</b>”的博弈：我下一手威胁你，你如果不理我，我就在劫上提回来；你如果应了，我再提回劫。谁手里的劫材多，谁打赢这个劫。": "그래서 실전에서 패는 <b>팻감</b> 싸움이 됩니다. 내가 팻감을 쓰고, 상대가 무시하면 패를 되따내고, 응수하면 다시 패를 되따냅니다. 팻감이 많은 쪽이 패를 이깁니다.",
  "<b>对初学者：</b>打劫可以先放一放。记住“不能马上提回，要先走别处”就够了。我们的练习盘会自动阻止违规的提回。": "<b>초보자에게:</b> 패는 나중에 배워도 됩니다. \"즉시 되따내기 금지, 먼저 다른 곳에 두기\"만 기억하세요. 연습판은 규칙 위반을 자동으로 막아 줍니다.",
  "<span class=\"num\">8</span>布局常识：金角银边草肚皮": "<span class=\"num\">8</span>포석 기초: 먼저 귀",
  "空棋盘时该从哪儿下？记住这句口诀：": "빈 판에서는 어디부터 둘까요? 이 격언을 기억하세요:",
  "金角 · 银边 · 草肚皮": "귀는 금 · 변은 은 · 중앙은 풀",
  "<b>角</b>最值钱：两边有棋盘边线当天然围墙，围同样的地只要很少的棋子。": "<b>귀</b>가 가장 이득: 판의 두 변이 공짜 벽이 되어 같은 집을 훨씬 적은 돌로 둘러쌀 수 있습니다.",
  "<b>边</b>次之：只有一条边线帮忙。": "<b>변</b>이 다음: 도와주는 변이 하나뿐입니다.",
  "<b>中腹</b>最费子：四面八方都要自己围，效率最低。": "<b>중앙</b>은 돌이 가장 많이 듭니다: 사방을 모두 스스로 둘러싸야 해서 효율이 가장 나쁩니다.",
  "19 路棋盘上的“星位”。开局一般先占角（圆圈处），再向边上发展": "19줄 판의 화점. 초반에는 먼저 귀(동그라미)를 차지하고, 그다음 변으로 넓혀 갑니다.",
  "开局的基本顺序": "초반의 기본 순서",
  "<b>占空角</b>：角上星位、小目都行。": "<b>빈 귀를 차지</b>: 화점이든 소목이든 좋습니다.",
  "<b>挂角 / 守角</b>：去对方角上分一杯羹，或者加固自己的角。": "<b>걸침 / 굳힘</b>: 상대 귀에 다가가거나 자기 귀를 굳힙니다.",
  "<b>拆边</b>：向边上展开，把地盘连成片。": "<b>벌림</b>: 변으로 넓혀 집을 하나로 잇습니다.",
  "然后再进入中盘的战斗。": "그다음 중반의 싸움이 시작됩니다.",
  "下在第几线？": "몇 선에 둘까?",
  "<b>第二线</b>：太低，只顾眼前的小地，容易被压。": "<b>둘째 선</b>: 너무 낮습니다. 눈앞의 작은 집만, 눌리기 쉽습니다.",
  "<b>第三线</b>：好守地，常用。": "<b>셋째 선</b>: 집을 지키기 좋아 자주 씁니다.",
  "<b>第四线</b>：好发展，常用。": "<b>넷째 선</b>: 발전에 좋아 자주 씁니다.",
  "<b>第五线及以上</b>：太虚，容易落空。": "<b>다섯째 선 이상</b>: 너무 허허해져 헛돌기 쉽습니다.",
  "初学 9 路棋，直接占星位和中腹附近的开阔点就行，不用太纠结。": "9줄을 처음 둘 때는 화점과 중앙 근처의 넓은 점을 차지하면 충분합니다. 너무 고민하지 마세요.",
  "<span class=\"num\">9</span>终局与数子": "<span class=\"num\">9</span>종국과 집 계산",
  "棋下到什么时候算完？当棋盘上再也找不到有价值的落点时，双方可以<b>连续虚手</b>（放弃一手）表示结束。": "언제 끝날까요? 더 둘 만한 곳이 없으면 양쪽이 <b>연속으로 패스</b>해 종료를 알립니다.",
  "怎么算谁赢": "승패를 가리는 법",
  "最直观的是<b>数子法</b>（中国规则）：": "가장 직관적인 것은 <b>집 계산법</b>(중국 룰)입니다:",
  "<b>先把死子拿掉。</b>双方确认哪些棋已经救不活了，拿掉后算对方的。": "<b>먼저 죽은 돌을 들어냅니다.</b> 양쪽이 살릴 수 없는 돌을 확인해 들어내고 상대 것으로 계산합니다.",
  "<b>数自己的棋子 + 自己围住的空地</b>，加起来就是你的总地盘。": "<b>자기 돌과 자기가 둘러싼 빈 점을 셉니다</b>. 합계가 당신의 집입니다.",
  "谁多谁赢。": "많은 쪽이 이깁니다.",
  "<b>白棋要贴目。</b>因为黑棋先下有便宜，所以白棋最后要额外加上 6.5 目（相当于让黑棋 6.5 目）。": "<b>백에게는 덤이 있습니다.</b> 흑이 먼저 두어 유리하므로 마지막에 백에게 6.5집을 더합니다.",
  "左上黑棋围住 5 个空点（小圈）→ 这 5 目算黑棋的；加上黑棋自己的棋子，就是黑棋的地盘": "왼쪽 위에서 흑이 빈 점 5개(작은 원)를 둘러쌌습니다 → 이 5집은 흑 것입니다. 흑의 돌과 합치면 흑의 집이 됩니다.",
  "练习盘上有「<b>结束数子</b>」按钮，点一下会自动帮你数完，告诉你是谁赢、赢多少目。<br>\n        <b>小提示：</b>数子前记得先把盘上明显的死子提干净，不然会算错。": "연습판에는 <b>종국 후 계산</b> 버튼이 있어 누르면 자동으로 세어 누가 얼마나 이겼는지 알려 줍니다.<br>\n        <b>팁:</b> 명백한 죽은 돌은 먼저 들어내야 계산이 틀리지 않습니다.",
  "<span class=\"num\">10</span>陪娃学棋的 10 条建议": "<span class=\"num\">10</span>아이와 배우는 10가지 팁",
  "<b>从 9 路盘开始。</b>19 路对初学者太大，一盘要下很久，孩子容易失去耐心。9 路一盘十几分钟，输赢反馈快。": "<b>9줄부터 시작하세요.</b> 19줄은 초보자에게 너무 커서 한 판이 오래 걸리고 아이는 지칩니다. 9줄은 10분 남짓이라 결과가 빨리 옵니다.",
  "<b>先学气，再学吃子。</b>不要一上来就讲布局、目数。孩子最喜欢吃子，那就先玩“吃子游戏”。": "<b>활로 먼저, 따내기 다음.</b> 처음부터 포석이나 집 계산을 말하지 마세요. 아이는 따내기를 좋아하니 먼저 \"따내기 놀이\"를 하세요.",
  "<b>用让子平衡实力。</b>练习盘可以给黑棋摆 2～9 颗让子。孩子能赢才有动力。9 路建议从让 4～5 子开始。": "<b>접바둑으로 실력을 맞추세요.</b> 연습판은 흑에게 2~9점 접바둑을 놓을 수 있습니다. 아이는 이겨야 의욕이 생깁니다. 9줄은 4~5점부터 시작하세요.",
  "<b>输棋时先共情，再复盘。</b>“这局输了有点难过吧？我看看……咦，这里如果走这里，是不是就能吃掉了？”": "<b>졌을 때는 먼저 공감하고, 그다음 복기하세요.</b> \"이번 판 져서 속상하지? 어디 보자… 여기 두었으면 따낼 수 있었겠는데?\"",
  "<b>每天 15 分钟，比周末 3 小时强。</b>围棋是手感，天天摸盘才长棋。": "<b>매일 15분이 주말 3시간보다 낫습니다.</b> 바둑은 감각이라 매일 만져야 늘어납니다.",
  "<b>只讲一个要点。</b>复盘时别一口气讲十个错误，挑最关键的一个说清楚就够了。": "<b>복기는 한 가지만.</b> 한 번에 열 가지 실수를 나열하지 말고, 가장 중요한 하나만 골라 설명하세요.",
  "<b>多用提问，少用断言。</b>“你数数这颗子还有几口气？”比直接说“这里要下”有效得多。": "<b>질문을 많이, 단정은 적게.</b> \"이 돌 활로 몇 개야?\"가 \"여기 둬\"보다 훨씬 효과적입니다.",
  "<b>让孩子多讲。</b>下完棋让他说说“刚才那步你为什么这么下”。表达的过程就是在整理思路。": "<b>아이가 말하게 하세요.</b> 한 판이 끝나면 \"아까 그 수는 왜 그렇게 뒀어?\"라고 물어보세요. 말로 하는 과정이 생각을 정리합니다.",
  "<b>别急着纠正“不标准”的下法。</b>只要不违规、不自杀，先让他自己试错，吃几个亏就记住了。": "<b>\"비정석\" 수를 급히 고치지 마세요.</b> 반칙이나 자충수가 아니라면 스스로 시행착오를 겪게 하세요. 몇 번 손해 보면 기억합니다.",
  "<b>陪着他一起学。</b>你也在进步，他会更有兴趣。可以一起做题、一起复盘、一起被电脑打败然后研究怎么赢回来。": "<b>함께 배우세요.</b> 부모도 늘면 아이의 흥미가 커집니다. 함께 문제를 풀고, 함께 복기하고, 함께 컴퓨터에게 지고 나서 어떻게 이길지 연구하세요.",
  "<b>一个小练习：</b>在 9 路盘上摆 3 颗白子，让孩子想办法全部吃掉。做出来就再加一颗。这比任何讲解都管用。": "<b>작은 연습:</b> 9줄 판에 백돌 3개를 놓고 아이가 모두 잡도록 해 보세요. 성공하면 하나 더 놓습니다. 어떤 설명보다 효과적입니다.",
  "看完了，去下一盘吧": "여기까지입니다. 이제 한 판 두러 가요",
  "建议从「9 路 · 让 5 子 · 初级」开始。<br>赢回来之后，再一步步把让子减掉。": "<b>9줄 · 접바둑 5점 · 초급</b>부터 시작하세요.<br>이기기 시작하면 접바둑을 조금씩 줄여 나갑니다.",
  "打开练习盘": "연습판 열기"
});

/* ==========================================================================
   页面标题等零散词条
   ========================================================================== */
I18N.add('en', {
  '围棋入门教程 · 和孩子一起学': 'Learn Go with Your Child',
  '围棋练习 · 死活题 & 打谱': 'Weiqi Practice · Life & Death & Records',
  '围棋练习盘': 'Weiqi Dojo'
});
I18N.add('ja', {
  '围棋入门教程 · 和孩子一起学': '子どもと一緒に囲碁を学ぶ',
  '围棋练习 · 死活题 & 打谱': '囲碁練習 · 詰碁＆棋譜並べ'
});
I18N.add('ko', {
  '围棋入门教程 · 和孩子一起学': '아이와 함께 바둑 배우기',
  '围棋练习 · 死活题 & 打谱': '바둑 연습 · 사활문제 & 기보'
});
