#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建 go-site/i18n.js

组成：
  i18n/core.js           基础设施（t / DOM 替换 / 语言切换 / 词典容器）
  i18n/board.js          对弈页词条
  i18n/practice.js       死活题 + 打谱页词条
  i18n/tutorial.js       教程页词条（由 tutorial-text.py 生成）
  i18n/extra.js          页面标题等零散词条

用法：cd 仓库根 && python3 i18n/build.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = ROOT                      # 仓库根就是部署根

sys.path.insert(0, HERE)


def jstr(s):
    return json.dumps(s, ensure_ascii=False)


def gen_tutorial():
    """由 tutorial-text.py + blocks.json 生成 tutorial.js"""
    from importlib import import_module
    mod = import_module('tutorial-text')
    T = mod.T

    blocks = json.load(open(os.path.join(HERE, 'blocks.json'), encoding='utf-8'))

    missing = [i for i in range(1, len(blocks) + 1) if i not in T]
    if missing:
        print('⚠ 教程缺少译文的下标:', missing)

    parts = ['/* ==========================================================================',
             '   教程页 / tutorial page（整块替换：段落里含 <b> 等标签）',
             '   ========================================================================== */']

    for code, idx, name in (('en', 0, 'English'), ('ja', 1, '日本語'), ('ko', 2, '한국어')):
        rows = []
        for i, key in enumerate(blocks, 1):
            if i not in T:
                continue
            rows.append('  %s: %s' % (jstr(key), jstr(T[i][idx])))
        parts.append('')
        parts.append('/* -------------------------- tutorial: %s -------------------------- */' % name)
        parts.append("I18N.add('%s', {" % code)
        parts.append(',\n'.join(rows))
        parts.append('});')

    out = '\n'.join(parts) + '\n'
    open(os.path.join(HERE, 'tutorial.js'), 'w', encoding='utf-8').write(out)
    print('  tutorial.js 生成完成（%d 块 × 3 语言）' % len(blocks))
    return len(blocks)


def main():
    if not os.path.isdir(SITE):
        os.makedirs(SITE)

    gen_tutorial()

    pieces = ['core.js', 'board.js', 'practice.js', 'tutorial.js', 'extra.js']
    buf = []
    for p in pieces:
        fp = os.path.join(HERE, p)
        if not os.path.exists(fp):
            print('  ⚠ 缺少 %s' % p)
            continue
        buf.append(open(fp, encoding='utf-8').read())

    out = '\n'.join(buf)
    dst = os.path.join(SITE, 'i18n.js')
    open(dst, 'w', encoding='utf-8').write(out)
    print('  i18n.js 生成完成（%.1f KB）' % (len(out.encode('utf-8')) / 1024.0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
