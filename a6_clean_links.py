# -*- coding: utf-8 -*-
"""A6 停供六款：清理站内页面硬链接（干跑 / 实执行）
策略分三层：
  1) <article ... data-model="停供SKU"> ... </article>  整块删（卡片本体）
  2) <tr ... data-model="停供SKU"> ... </tr>            整行删（型号对比表行）
  3) 其余 <a href="停供URL">文字</a>                     转 <span> 保文字
闸门：每页 <a> 标签数的减少量不得超过该页被判定的链接实例数；语言切换器零命中。
"""
import os, re, json, sys

SITE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\github-latest\boom-drinkware-live\site"
BASE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\batch0-20261114"

SLUGS = ['16-oz-light-up-acrylic-shaker', 'custom-led-light-up-coasters',
         'multicolor-led-light-up-ice-cubes', 'electric-wine-opener-s-2',
         'rechargeable-wine-opener', 'rechargeable-wine-aerator-dispenser']
STOP_SKU = {'JBPJ-061', 'BD-003', 'FGB-003', 'KPQ-009', 'KPQ-011', 'JBPJ-073'}

# 命中路径的三种写法（带/不带尾斜杠、是否带锚点）
def hit_path(p):
    p = p.split('#')[0].split('?')[0].rstrip('/')
    for s in SLUGS:
        if p == '/products/' + s or p == '/zh/products/' + s:
            return True
    return False

TARGET_RE = re.compile(
    r'<a\b([^>]*?)href="(/zh)?/products/(?:' + '|'.join(re.escape(s) for s in SLUGS) + r')/?(#[^"]*)?"([^>]*)>(.*?)</a>',
    re.S | re.I)

ART_RE = re.compile(r'<article\b[^>]*data-model="([A-Z0-9\-]+)"[^>]*>.*?</article>', re.S)
ART_NOMODEL_RE = re.compile(r'<article\b(?![^>]*data-model=)[^>]*class="[^"]*ec-library-card[^"]*"[^>]*>.*?</article>', re.S)
TR_RE = re.compile(r'<tr\b[^>]*data-model="([A-Z0-9\-]+)"[^>]*>.*?</tr>', re.S)
CARD_SKU_RE = re.compile(r'<p class="(?:ec-library-model|led-model)">([A-Z0-9\-]+)</p>')
# 场景推荐列表项：<li><a ...><strong>SKU</strong>...</a></li> 或 <li><span><strong>SKU</strong>...</span></li>
LI_RE = re.compile(r'<li\b[^>]*>(?:(?!</li>).)*?</li>', re.S)
LI_SKU_RE = re.compile(r'<strong[^>]*>([A-Z]{2,5}-[0-9]{2,4})</strong>')
LI_TXT_SKU_RE = re.compile(r'\b([A-Z]{2,5}-[0-9]{2,4})\b')


def load_sources():
    d = json.load(open(os.path.join(BASE, '_inbound_detail.json'), encoding='utf-8'))
    return sorted({x['src'] for x in d if x['grp'] == 'A6' and x['type'] == '页面链接'})


def file_for(src):
    rel = src.strip('/').replace('/', os.sep)
    fp = os.path.join(SITE, rel, 'index.html')
    if os.path.exists(fp):
        return fp
    fp2 = os.path.join(SITE, rel)
    return fp2 if os.path.exists(fp2) else None


def process(html):
    """返回 (新html, 统计)"""
    st = {'article': 0, 'tr': 0, 'li': 0, 'a2span': 0, 'a_dropped': 0, 'a_in_block': 0, 'leftover': 0}

    def rep_art(m):
        if m.group(1) in STOP_SKU:
            st['article'] += 1
            st['a_in_block'] += len(re.findall(r'<a\b', m.group(0), re.I))
            return ''
        return m.group(0)

    def rep_tr(m):
        if m.group(1) in STOP_SKU:
            st['tr'] += 1
            st['a_in_block'] += len(re.findall(r'<a\b', m.group(0), re.I))
            return ''
        return m.group(0)

    html = ART_RE.sub(rep_art, html)

    def rep_card(m):
        skus = CARD_SKU_RE.findall(m.group(0))
        if any(s in STOP_SKU for s in skus):
            st['article'] += 1
            st['a_in_block'] += len(re.findall(r'<a\b', m.group(0), re.I))
            return ''
        return m.group(0)

    html = ART_NOMODEL_RE.sub(rep_card, html)
    html = TR_RE.sub(rep_tr, html)

    def rep_a(m):
        pre, zh, anchor, post, inner = m.group(1), m.group(2) or '', m.group(3) or '', m.group(4), m.group(5)
        # 纯按钮式空话链接：整块删
        text = re.sub(r'<[^>]+>', '', inner).strip()
        if re.fullmatch(r'(View Model\s*(&amp;|&)\s*Customization|View Model|查看型号.*|了解更多)', text, re.I) and '<img' not in inner:
            st['a_dropped'] += 1
            return ''
        # 其余：去链接，保文字
        cls = re.search(r'class="([^"]*)"', pre + ' ' + post)
        clsattr = ' class="%s"' % cls.group(1) if cls else ''
        st['a2span'] += 1
        return '<span%s>%s</span>' % (clsattr, inner)

    html = TARGET_RE.sub(rep_a, html)

    # 场景推荐列表项：SKU 命中停供 → 整条删除
    def rep_li(m):
        skus = LI_SKU_RE.findall(m.group(0))
        if not skus:
            skus = LI_TXT_SKU_RE.findall(re.sub(r'<[^>]+>', ' ', m.group(0))[:200])
        if any(s in STOP_SKU for s in skus):
            st['li'] += 1
            st['a_in_block'] += len(re.findall(r'<a\b', m.group(0), re.I))
            return ''
        return m.group(0)

    html = LI_RE.sub(rep_li, html)

    # 残留裸链接（如 srcset / JSON 中的 href）计数
    for s in SLUGS:
        st['leftover'] += html.count('/products/' + s)
        st['leftover'] += html.count('/zh/products/' + s)
    return html, st


def main():
    dry = '--apply' not in sys.argv
    srcs = load_sources()
    total = {'article': 0, 'tr': 0, 'li': 0, 'a2span': 0, 'a_dropped': 0, 'a_in_block': 0, 'leftover': 0}
    rows = []
    for src in srcs:
        fp = file_for(src)
        if not fp:
            rows.append({'src': src, 'err': 'NO_FILE'})
            continue
        raw = open(fp, encoding='utf-8', errors='replace').read()
        a_before = len(re.findall(r'<a\b', raw, re.I))
        out, st = process(raw)
        a_after = len(re.findall(r'<a\b', out, re.I))
        delta = a_before - a_after
        expect = st['a2span'] + st['a_dropped'] + st['a_in_block']
        gate = 'OK' if delta <= expect else 'FAIL'
        rows.append({'src': src, 'file': os.path.relpath(fp, SITE),
                     'a_before': a_before, 'a_after': a_after, 'delta': delta,
                     'expect': expect, 'gate': gate, **st})
        for k in total:
            total[k] += st[k]
        if not dry and gate == 'OK':
            open(fp, 'w', encoding='utf-8').write(out)
    print('模式:', 'DRY-RUN' if dry else 'APPLY')
    print('源页', len(srcs))
    print('article 块删除', total['article'], '| tr 行删除', total['tr'], '| li 列表项删除', total['li'],
          '| 块内 a 随之消失', total['a_in_block'],
          '| a→span', total['a2span'], '| 空话链接删除', total['a_dropped'],
          '| 处理完残留', total['leftover'])
    bad = [r for r in rows if r.get('gate') == 'FAIL' or r.get('err')]
    print('闸门失败/异常:', len(bad))
    for b in bad[:10]:
        print('   ', b)
    json.dump(rows, open(os.path.join(BASE, '_links_clean_report.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


main()
