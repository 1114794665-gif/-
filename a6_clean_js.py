# -*- coding: utf-8 -*-
"""A6：清理打包 JS 里内联的停供产品数据（v3）
三阶段：① JS 字符串里的 HTML 片段 → 删 <a> 整块
        ② 字典键值对 "url":{...} → 整体删
        ③ 对象含 route/url 字段 → 字符串感知配平整体删
落盘前 node --check 验证。
"""
import os, re, sys, json, subprocess, shutil

SITE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\github-latest\boom-drinkware-live\site"
SLUGS = ['16-oz-light-up-acrylic-shaker', 'custom-led-light-up-coasters',
         'multicolor-led-light-up-ice-cubes', 'electric-wine-opener-s-2',
         'rechargeable-wine-opener', 'rechargeable-wine-aerator-dispenser']
ALT = '|'.join(re.escape(s) for s in SLUGS)
HIT_RE = re.compile(r'(?:/zh)?/products/(?:' + ALT + r')(?![\w-])')
# JS 字符串里的 HTML 链接（href 被转义成 \"）
A_HTML_RE = re.compile(
    r'<a\b(?:(?!>).)*?href=\\?"(?:/zh)?/products/(?:' + ALT + r')/?\\?"(?:(?!>).)*>'
    r'(?:(?!</a>).)*</a>', re.S)

TARGETS = [
    'assets/index-factory-specialist-e774d853ebc4.js',
    'assets/index-buyer-experience-20261026.speed-20261107.js',
    'assets/index-public-copy-7ba7f97d2523.speed-20261107-niles-16f788a0e9b4-niles-ff8f28dc96ff-niles-ff8f28dc96ff.js',
    'assets/sourcing-note-20261112.js',
]


def match_brace(s, i):
    depth, in_str, esc, n = 0, None, False, len(s)
    while i < n:
        ch = s[i]
        if in_str:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == in_str:
                in_str = None
        else:
            if ch in '"\'':
                in_str = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def eat_comma(s, a, b):
    i = b + 1
    while i < len(s) and s[i] in ' \t\r\n':
        i += 1
    if i < len(s) and s[i] == ',':
        return (a, i)
    j = a - 1
    while j >= 0 and s[j] in ' \t\r\n':
        j -= 1
    if j >= 0 and s[j] == ',':
        return (j, b)
    return (a, b)


def span_for(s, h):
    # ② 字典键：命中点前是 " 且整个 URL 被引号包住，后面跟 :{
    if h > 0 and s[h - 1] == '"':
        endq = s.find('"', h)
        if endq > 0:
            j = endq + 1
            while j < len(s) and s[j] in ' \t\r\n':
                j += 1
            if j < len(s) and s[j] in ',]':
                # 数组里的字符串元素，删该元素
                return (h - 1, endq)
            if j < len(s) and s[j] == ':':
                k = j + 1
                while k < len(s) and s[k] in ' \t\r\n':
                    k += 1
                if k < len(s) and s[k] == '{':
                    e = match_brace(s, k)
                    if e > 0:
                        return (h - 1, e)
    # ③ 对象：向前找最近 '{'
    k = h - 1
    limit = max(0, h - 1500)
    while k > limit:
        if s[k] == '{':
            e = match_brace(s, k)
            if e > h and (e - k) <= 3500:
                return (k, e)
        k -= 1
    return None


def process(path, apply=False):
    s = open(path, encoding='utf-8', errors='replace').read()
    h0 = len(HIT_RE.findall(s))

    # ① HTML 片段
    s2, n_a = A_HTML_RE.subn('', s)

    # ②③ 对象
    hits = [m.start() for m in HIT_RE.finditer(s2)]
    spans, miss = [], 0
    for h in hits:
        sp = span_for(s2, h)
        if sp:
            spans.append(eat_comma(s2, sp[0], sp[1]))
        else:
            miss += 1
    spans = sorted(set(spans))
    keep = []
    for a, b in spans:
        if keep and a <= keep[-1][1]:
            keep[-1] = (keep[-1][0], max(keep[-1][1], b))
        else:
            keep.append((a, b))
    out, last = [], 0
    for a, b in keep:
        a = max(a, last)
        out.append(s2[last:a])
        last = b + 1
    out.append(s2[last:])
    ns = ''.join(out)

    res = {'hits': h0, 'a_removed': n_a, 'deleted': len(keep), 'miss': miss,
           'left': len(HIT_RE.findall(ns))}
    if apply and (n_a or keep):
        tmp = path + '.check.js'
        open(tmp, 'w', encoding='utf-8').write(ns)
        r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
        if r.returncode != 0:
            os.remove(tmp)
            res['error'] = (r.stderr or '').strip()[:200]
            return res
        shutil.move(tmp, path)
        res['written'] = True
    return res


def main():
    apply = '--apply' in sys.argv
    print('模式:', 'APPLY' if apply else 'DRY-RUN')
    for t in TARGETS:
        fp = os.path.join(SITE, t)
        if not os.path.exists(fp):
            print('  MISS', t)
            continue
        r = process(fp, apply)
        print('  %-56s 命中%-3d 删HTML链接%-3d 删对象%-3d 未定位%-2d 剩余%-3d %s'
              % (t.split('/')[-1][:54], r.get('hits', 0), r.get('a_removed', 0),
                 r.get('deleted', 0), r.get('miss', 0), r.get('left', 0),
                 ('ERR ' + r['error']) if 'error' in r else ''))


main()
