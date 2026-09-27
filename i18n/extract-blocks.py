#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""提取「整块可翻译元素」的 innerHTML（用于教程页的段落）"""
import re, os, json, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CJK = re.compile(r'[\u4e00-\u9fff]')

# 可整体替换的标签
BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'td', 'th', 'blockquote', 'div', 'a', 'button', 'span']
INLINE = {'b', 'i', 'em', 'strong', 'span', 'br', 'code', 'small', 'u'}


def strip_scripts(s):
    s = re.sub(r'<script[\s\S]*?</script>', '', s)
    s = re.sub(r'<style[\s\S]*?</style>', '', s)
    return s


def find_block(s, tag, start=0):
    """返回 (inner_start, inner_end, open_end) 或 None"""
    m = re.compile(r'<%s(\s[^>]*)?>' % tag, re.I).search(s, start)
    if not m:
        return None
    inner_start = m.end()
    depth = 1
    i = inner_start
    pat = re.compile(r'<(/?)%s(\s[^>]*)?>' % tag, re.I)
    while i < len(s):
        mm = pat.search(s, i)
        if not mm:
            return None
        if mm.group(1):
            depth -= 1
            if depth == 0:
                return (inner_start, mm.start(), m.start(), mm.end())
        else:
            depth += 1
        i = mm.end()
    return None


def is_inline_only(html):
    """只含文本和行内标签，没有块级子元素"""
    tags = set(t.lower() for t in re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)', html))
    return tags.issubset(INLINE)


def extract_blocks(html):
    s = strip_scripts(html)
    out = []
    for tag in BLOCK_TAGS:
        pos = 0
        while True:
            r = find_block(s, tag, pos)
            if not r:
                break
            inner_start, inner_end, open_start, close_end = r
            inner = s[inner_start:inner_end]
            hit = CJK.search(inner) and is_inline_only(inner) and len(inner.strip()) > 1
            if hit:
                out.append(inner.strip())
                pos = close_end          # 命中就整块跳过
            else:
                pos = inner_start        # 没命中则继续往里找嵌套元素
    return out


def main():
    p = os.path.join(ROOT, 'go-tutorial.html')
    s = open(p, encoding='utf-8').read()
    blocks = extract_blocks(s)
    blocks = sorted(set(blocks), key=lambda x: s.index(x))
    print('教程页整块文案: %d 条, 共 %d 字符' % (len(blocks), sum(len(b) for b in blocks)))
    json.dump(blocks, open(os.path.join(ROOT, 'blocks.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('已写入 blocks.json')
    for i, b in enumerate(blocks[:20], 1):
        print('%3d| %s' % (i, b[:100]))


if __name__ == '__main__':
    main()
