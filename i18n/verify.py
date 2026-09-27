#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静态模拟 i18n 的 DOM 替换流程，找出漏翻的中文"""
import re, os, json, sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = ROOT
CJK = re.compile(r'[\u4e00-\u9fff]')
INLINE = {'b', 'i', 'em', 'strong', 'span', 'br', 'code', 'small', 'u'}
SKIP = {'script', 'style', 'noscript'}


# ---------- 1. 从 i18n.js 里取出词条 key ----------
def load_keys():
    d = json.load(open(os.path.join(HERE, 'keys.json'), encoding='utf-8'))
    return {k: set(v) for k, v in d.items()}


# ---------- 2. 极简 HTML 树 ----------
class Node:
    def __init__(self, tag=None, text=None):
        self.tag = tag
        self.text = text
        self.kids = []
        self.attrs = {}


class Parser(HTMLParser):
    VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source'}

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node('#root')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag)
        n.attrs = dict(attrs)
        self.stack[-1].kids.append(n)
        if tag not in self.VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        n = Node(tag)
        n.attrs = dict(attrs)
        self.stack[-1].kids.append(n)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].kids.append(Node(None, data))

    def handle_entityref(self, name):
        self.stack[-1].kids.append(Node(None, '&%s;' % name))

    def handle_charref(self, name):
        self.stack[-1].kids.append(Node(None, '&#%s;' % name))


def inner_html(n):
    if n.tag is None:
        return n.text or ''
    out = []
    for k in n.kids:
        if k.tag is None:
            out.append(k.text or '')
        else:
            a = ''.join(' %s="%s"' % (k2, v2) for k2, v2 in k.attrs.items())
            out.append('<%s%s>' % (k.tag, a))
            if k.tag not in Parser.VOID:
                out.append(inner_html(k))
                out.append('</%s>' % k.tag)
    return ''.join(out)


def inline_only(n):
    for k in n.kids:
        if k.tag is not None and k.tag not in INLINE:
            return False
    return True


# ---------- 3. 按 JS 的逻辑走一遍 ----------
def walk(n, keys, lang, miss):
    if n.tag in SKIP:
        return
    if n.tag is not None and inline_only(n):
        html = inner_html(n).strip()
        if html and CJK.search(html):
            if html in keys[lang]:
                return                       # 整块替换命中，子节点不再单独翻
    if n.tag is None:
        t = (n.text or '').strip()
        if t and CJK.search(t) and t not in keys[lang]:
            miss.add(t)
        return
    for k in n.kids:
        walk(k, keys, lang, miss)


def main():
    keys = load_keys()
    print('词条数： en=%d  ja=%d  ko=%d' %
          (len(keys['en']), len(keys['ja']), len(keys['ko'])))
    print()

    total = 0
    for f in ['index.html', 'go-practice.html', 'go-tutorial.html']:
        html = open(os.path.join(SITE, f), encoding='utf-8').read()
        p = Parser()
        p.feed(html)
        print('=' * 8, f)
        for lang in ['en', 'ja', 'ko']:
            miss = set()
            walk(p.root, keys, lang, miss)
            total += len(miss)
            if miss:
                print('  %s 漏翻 %d 处：' % (lang, len(miss)))
                for s in sorted(miss, key=len, reverse=True)[:12]:
                    print('      | %s' % s[:88])
            else:
                print('  %s 全部覆盖 ✓' % lang)
    print()
    print('★ 漏翻总计 %d 处' % total)
    return 0 if total == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
