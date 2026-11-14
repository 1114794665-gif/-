# -*- coding: utf-8 -*-
"""A6 数据层清理：JSON 结构对象删除 + page-content 里的 HTML 片段清理
product-families.json 单独处理（涉及同页子型号存废，待负责人确认），本脚本跳过。
"""
import os, re, json, sys, importlib.util

ROOT = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\github-latest\boom-drinkware-live"
SITE = os.path.join(ROOT, 'site')
BASE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\batch0-20261114"

SLUGS = ['16-oz-light-up-acrylic-shaker', 'custom-led-light-up-coasters',
         'multicolor-led-light-up-ice-cubes', 'electric-wine-opener-s-2',
         'rechargeable-wine-opener', 'rechargeable-wine-aerator-dispenser']
STOP_SKU = {'JBPJ-061', 'BD-003', 'FGB-003', 'KPQ-009', 'KPQ-011', 'JBPJ-073'}

# 复用 HTML 清理逻辑
spec = importlib.util.spec_from_file_location('cl', os.path.join(ROOT, 'a6_clean_links.py'))
cl = importlib.util.module_from_spec(spec)
src = open(os.path.join(ROOT, 'a6_clean_links.py'), encoding='utf-8').read().split('def main()')[0]
exec(compile(src, 'a6_clean_links.py', 'exec'), cl.__dict__)

CONTAINER_KEYS = ('products', 'items', 'children', 'pages', 'list', 'variants', 'models', 'records')


def stop_url(v):
    if not isinstance(v, str):
        return False
    p = v.split('#')[0].rstrip('/')
    return any(p.endswith('/products/' + s) or p.endswith('/zh/products/' + s) for s in SLUGS)


def is_stop_obj(o):
    if not isinstance(o, dict):
        return False
    for k in ('route', 'url', 'path', 'href', 'link', 'canonical'):
        if stop_url(o.get(k)):
            return True
    for k in ('sku', 'model', 'modelSku', 'model_sku'):
        if o.get(k) in STOP_SKU:
            return True
    # 产品级判据：有规格字段 + 文本里出现停供型号
    if any(k in o for k in ('moq', 'material', 'capacity')):
        blob = ' '.join(str(v) for v in o.values() if isinstance(v, str))
        if any(s in blob for s in STOP_SKU):
            return True
    return False


def strip(o, path, log):
    if isinstance(o, list):
        out = []
        for i, x in enumerate(o):
            y, removed = strip(x, path + '[%d]' % i, log)
            if removed == 'DEL':
                continue
            out.append(y)
        return out, 0
    if isinstance(o, dict):
        if is_stop_obj(o):
            log.append(path or '/')
            return None, 'DEL'
        out = {}
        for k, v in o.items():
            # 键本身就是「停供页 + 锚点」或停供 SKU → 整个键删
            if k in STOP_SKU or stop_url(k.split('#')[0]):
                log.append(path + '/' + k)
                continue
            y, r = strip(v, path + '/' + k, log)
            if r == 'DEL':
                continue
            out[k] = y
        return out, 0
    return o, 0


def strip_html_fields(o, log, key=''):
    """把 JSON 里的 html 字符串片段按页面规则清理"""
    if isinstance(o, dict):
        for k, v in list(o.items()):
            if isinstance(v, str) and '<' in v and len(v) > 60 and '</' in v:
                out, st = cl.process(v)
                n = st['article'] + st['tr'] + st['li'] + st['a2span'] + st['a_dropped']
                if n:
                    o[k] = out
                    log.append({'html': n, 'key': key + '/' + k, 'st': st})
            else:
                strip_html_fields(v, log, key + '/' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            strip_html_fields(v, log, key + '[%d]' % i)


JSON_TARGETS = [
    'data/product-fields.json',
    'data/product-media-20261027.json',
    'data/product-series-20261029.json',
    'data/runtime-shared-niles-20261111.json',
    'data/seo-pages-index.json',
    'assets/cms-pages.json',
]


def main():
    apply = '--apply' in sys.argv
    summary = []

    files = list(JSON_TARGETS)
    for sub in ('data/product-scenarios', 'data/runtime-pages-niles-20261111'):
        for root, ds, fs in os.walk(os.path.join(SITE, sub)):
            for f in fs:
                if f.endswith('.json'):
                    files.append(os.path.relpath(os.path.join(root, f), SITE).replace('\\', '/'))

    for rel in files:
        fp = os.path.join(SITE, rel)
        if not os.path.exists(fp):
            continue
        raw = open(fp, encoding='utf-8').read()
        try:
            d = json.loads(raw)
        except Exception as e:
            summary.append({'file': rel, 'err': str(e)[:60]})
            continue
        log = []
        new, _ = strip(d, '', log)
        hlog = []
        strip_html_fields(new, hlog)
        if log or hlog:
            hn = sum(x['html'] for x in hlog)
            summary.append({'file': rel, 'removed': len(log), 'html_fix': hn, 'paths': log[:6]}
                           if log else {'file': rel, 'removed': 0, 'html_fix': hn})
            if apply:
                open(fp, 'w', encoding='utf-8').write(
                    json.dumps(new, ensure_ascii=False, separators=(',', ':')))

    # page-content：html 字段走 HTML 清理
    pcd = os.path.join(SITE, 'data/page-content')
    if os.path.isdir(pcd):
        for f in sorted(os.listdir(pcd)):
            if not f.endswith('.json'):
                continue
            fp = os.path.join(pcd, f)
            raw = open(fp, encoding='utf-8').read()
            try:
                d = json.loads(raw)
            except Exception:
                continue
            h = d.get('html')
            if not isinstance(h, str) or not h:
                continue
            out, st = cl.process(h)
            n = st['article'] + st['tr'] + st['a2span'] + st['a_dropped']
            if n:
                summary.append({'file': 'data/page-content/' + f, 'html_fix': n,
                                'leftover': sum(out.count('/products/' + s) for s in SLUGS)})
                if apply:
                    d['html'] = out
                    open(fp, 'w', encoding='utf-8').write(
                        json.dumps(d, ensure_ascii=False, separators=(',', ':')))

    print('模式:', 'APPLY' if apply else 'DRY-RUN')
    tot_j = sum(x.get('removed', 0) for x in summary)
    tot_h = sum(x.get('html_fix', 0) for x in summary)
    print('JSON 文件命中', sum(1 for x in summary if 'removed' in x), '| 删除对象', tot_j)
    print('page-content 命中', sum(1 for x in summary if 'html_fix' in x), '| 修 HTML 处', tot_h)
    for x in summary:
        if 'err' in x:
            print('  ERR', x['file'], x['err'])
        else:
            print('  %-52s 删对象%-3d 修HTML%-3d %s'
                  % (x['file'], x.get('removed', 0), x.get('html_fix', 0), x.get('paths', [])[:2]))
    json.dump(summary, open(os.path.join(BASE, '_data_clean_report.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


main()
