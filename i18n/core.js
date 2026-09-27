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
