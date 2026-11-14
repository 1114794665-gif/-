# -*- coding: utf-8 -*-
"""清 JSON-LD 里指向停供六款的 ListItem（结构化数据版的「列表推荐」）"""
import os, re, json, sys

SITE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\github-latest\boom-drinkware-live\site"
BASE = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20\batch0-20261114"
SLUGS = ['16-oz-light-up-acrylic-shaker', 'custom-led-light-up-coasters',
         'multicolor-led-light-up-ice-cubes', 'electric-wine-opener-s-2',
         'rechargeable-wine-opener', 'rechargeable-wine-aerator-dispenser']
STOP_SKU = {'JBPJ-061', 'BD-003', 'FGB-003', 'KPQ-009', 'KPQ-011', 'JBPJ-073'}


def is_stop_url(v):
    if not isinstance(v, str):
        return False
    p = v.split('#')[0].rstrip('/')
    return any(p.endswith('/products/' + s) or p.endswith('/zh/products/' + s) for s in SLUGS)


def clean(o):
    """递归删条目，返回 (新对象, 删除数)"""
    n = 0
    if isinstance(o, list):
        out = []
        for x in o:
            y, k = clean(x)
            if isinstance(y, dict) and (is_stop_url(y.get('url')) or y.get('sku') in STOP_SKU):
                n += k + 1
                continue
            out.append(y)
            n += k
        # 重排 position
        for i, x in enumerate(out, 1):
            if isinstance(x, dict) and '@type' in x and x.get('@type') == 'ListItem' and 'position' in x:
                x['position'] = i
        return out, n
    if isinstance(o, dict):
        if is_stop_url(o.get('url')):
            return None, 1
        out = {}
        for k2, v in o.items():
            y, k = clean(v)
            out[k2] = y
            n += k
        # numberOfItems 跟随
        if 'itemListElement' in out and isinstance(out['itemListElement'], list):
            out['numberOfItems'] = len(out['itemListElement'])
        return out, n
    return o, 0


LD_RE = re.compile(r'(<script[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)', re.S)


def main():
    apply = '--apply' in sys.argv
    report = []
    tot = 0
    for root, ds, fs in os.walk(SITE):
        ds[:] = [d for d in ds if d not in ('node_modules', '.git')]
        for f in fs:
            if f != 'index.html':
                continue
            fp = os.path.join(root, f)
            rel = os.path.relpath(fp, SITE).replace('\\', '/')
            if any(('/products/' + s + '/index.html') in rel for s in SLUGS):
                continue
            raw = open(fp, encoding='utf-8', errors='replace').read()
            cnt = {'n': 0}
            changed = [False]

            def rep(m):
                head, body, tail = m.group(1), m.group(2), m.group(3)
                try:
                    obj = json.loads(body)
                except Exception:
                    return m.group(0)
                new, k = clean(obj)
                if k:
                    cnt['n'] += k
                    changed[0] = True
                    return head + json.dumps(new, ensure_ascii=False, separators=(',', ':')) + tail
                return m.group(0)

            out = LD_RE.sub(rep, raw)
            if cnt['n']:
                tot += cnt['n']
                report.append({'file': rel, 'removed': cnt['n']})
                if apply:
                    open(fp, 'w', encoding='utf-8').write(out)
    print('模式:', 'APPLY' if apply else 'DRY-RUN')
    print('命中文件', len(report), '| 删除条目', tot)
    for r in report:
        print('  %-56s -%d' % (r['file'], r['removed']))
    json.dump(report, open(os.path.join(BASE, '_jsonld_clean.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


main()
