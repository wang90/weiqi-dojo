#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统计各页面里需要翻译的中文文案"""
import re
import os
import json

ROOT = os.path.dirname(os.path.abspath(__file__))
FILES = ['index.html', 'go-practice.html', 'go-tutorial.html']
CJK = re.compile(r'[\u4e00-\u9fff]')


def html_texts(s):
    """HTML 里的文本节点内容（去掉 script/style）"""
    body = re.sub(r'<script[\s\S]*?</script>', '', s)
    body = re.sub(r'<style[\s\S]*?</style>', '', body)
    out = set()
    for m in re.finditer(r'>([^<>]+)<', body):
        t = m.group(1).strip()
        if t and CJK.search(t):
            out.add(t)
    return out


def js_strings(s):
    """<script> 里的中文字符串字面量"""
    out = set()
    for blk in re.findall(r'<script>([\s\S]*?)</script>', s):
        for m in re.finditer(r"'([^'\\\n]*)'|\"([^\"\\\n]*)\"", blk):
            v = m.group(1) if m.group(1) is not None else m.group(2)
            if v and CJK.search(v):
                out.add(v.strip())
    return out


def attrs(s):
    out = set()
    for m in re.finditer(r'(?:title|placeholder|aria-label)="([^"]+)"', s):
        if CJK.search(m.group(1)):
            out.add(m.group(1).strip())
    return out


total = {}
grand = 0
for f in FILES:
    p = os.path.join(ROOT, f)
    s = open(p, encoding='utf-8').read()
    t = html_texts(s) | js_strings(s) | attrs(s)
    total[f] = sorted(t)
    grand += len(t)
    print('%-22s 唯一中文串 %4d 条' % (f, len(t)))
    # 字符量
    chars = sum(len(x) for x in t)
    print('%-22s 合计字符   %4d' % ('', chars))

# 跨页重复的
allset = {}
for f in FILES:
    for x in total[f]:
        allset.setdefault(x, []).append(f)
dup = {k: v for k, v in allset.items() if len(v) > 1}
print('')
print('三页合计唯一串: %d 条（跨页重复 %d 条）' % (len(allset), len(dup)))
print('总字符量: %d' % sum(len(k) for k in allset))

json.dump({'per_file': total, 'unique': sorted(allset.keys())},
          open(os.path.join(ROOT, 'strings.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('已写入 strings.json')
