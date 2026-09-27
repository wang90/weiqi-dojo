/* 导出 go-site/i18n.js 里所有词条的 key，供 verify.py 使用
 * 用法：node i18n/dump-keys.js
 */
var fs = require('fs');
var path = require('path');
var HERE = __dirname;

global.window = global;
global.navigator = { language: 'en' };
global.localStorage = { getItem: function () { return 'en'; }, setItem: function () {} };
global.document = { readyState: 'loading', addEventListener: function () {}, documentElement: {} };

eval(fs.readFileSync(path.join(HERE, '..', 'i18n.js'), 'utf8'));

var out = {};
['en', 'ja', 'ko'].forEach(function (l) { out[l] = I18N.keys(l); });
fs.writeFileSync(path.join(HERE, 'keys.json'), JSON.stringify(out));
console.log('en=' + out.en.length + ' ja=' + out.ja.length + ' ko=' + out.ko.length +
            '  → i18n/keys.json');
