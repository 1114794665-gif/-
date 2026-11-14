# -*- coding: utf-8 -*-
"""把 01 合模企业标换到全站（site/ 源目录 + cloudflare-dist/ 发布目录）。

用法：
  python apply_logo_20261114.py --dry    只统计，不写文件
  python apply_logo_20261114.py --apply  备份后写入

关键点：页头那个旧杯子标也写死在前端脚本里，页面加载后会被重新画出来，
所以不能只改 HTML —— 用一段统一样式盖住旧图形，再显示新标，脚本刷新也不受影响。
"""
import sys, re, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIRS = [ROOT / "site", ROOT / "cloudflare-dist"]
DRY = "--apply" not in sys.argv
BACKUP = ROOT / "_backup-20261114-logo.zip"

INK, CLAY, CREAM, MUTED = "#233F35", "#B65F40", "#F8F5EF", "#6B756C"
B = ("M24 14 H64 C82 14 92 23 92 37 C92 48 86 55 76 58.5 "
     "C89 61 98 70 98 83 C98 98 86 106 65 106 H24 Z "
     "M40 28 H62 C70 28 75 31 75 37.5 C75 44 70 47 62 47 H40 Z "
     "M40 72 H65 C75 72 81 77 81 84 C81 91 75 94 65 94 H40 Z")


def mark():
    return f'''<defs>
<clipPath id="bl"><rect x="0" y="0" width="60.5" height="120"/></clipPath>
<clipPath id="br"><rect x="63.5" y="0" width="60" height="120"/></clipPath>
</defs>
<path d="M62 8.5 V111.5" stroke="{MUTED}" stroke-width="1.1" stroke-dasharray="2 4" opacity=".85"/>
<path d="{B}" fill="{INK}" fill-rule="evenodd" clip-path="url(#bl)"/>
<path d="{B}" fill="{CLAY}" fill-rule="evenodd" clip-path="url(#br)"/>
<circle cx="62" cy="8.5" r="2.4" fill="{MUTED}"/>
<circle cx="62" cy="111.5" r="2.4" fill="{MUTED}"/>'''


def brand_logo_svg():
    """网站左上角专用：紧凑横版，显示 40px 高时主标约 21px，跟原来字号接近。"""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 56" width="340" height="56">'
            f'<svg x="0" y="0" width="56" height="56" viewBox="0 0 120 120">{mark()}</svg>'
            f'<text x="66" y="31" font-family="Georgia,\'Times New Roman\',serif" font-size="30" '
            f'font-weight="700" letter-spacing="0.2">'
            f'<tspan fill="{INK}">BOOM</tspan><tspan fill="{CLAY}"> Drinkware</tspan></text>'
            f'<text x="68" y="49" font-family="Arial,Helvetica,sans-serif" font-size="7.5" '
            f'font-weight="700" letter-spacing="1.4" fill="{MUTED}">'
            f'CUSTOM DRINKWARE   ·   OEM / ODM</text></svg>')


def icon_svg():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" '
            f'width="120" height="120" fill="none">{mark()}</svg>')


CSS_OLD = 'href="/assets/brand-boom-20261106.css"'
CSS_NEW = 'href="/assets/brand-boom-20261106.css?v=20261114-logo1"'
CSS_PAT = re.compile(r'href="/assets/brand-boom-20261106\.css(?:\?v=[^"\']*)?"')
FAV_PAT = re.compile(r'(?<![-\w])/logo\.svg\?v=[^"\'>\s]*')
FAV_NEW = "/logo.svg?v=20261114-logo1"

CSS_MARK = "/* BOOM 2026-11-14 logo01 */"
CSS_RULE = '''
/* BOOM 2026-11-14 logo01 — 01 合模企业标：盖住写死在页面与脚本里的旧杯子标 */
a[aria-label="BOOM Drinkware home"] > svg,
a[aria-label="BOOM Drinkware home"] > span { display:none !important; }
a[aria-label="BOOM Drinkware home"]::before,
a.brand::before {
  content:""; display:block; width:243px; max-width:58vw; height:40px;
  background:url("/brand-logo.svg?v=20261114-logo1") left center / contain no-repeat;
}
a.brand { font-size:0 !important; }
a.brand > svg { display:none !important; }
'''


def backup():
    targets = []
    for d in DIRS:
        for p in d.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() == ".html" or p.name == "brand-boom-20261106.css" or p.name == "logo.svg":
                targets.append(p)
    with zipfile.ZipFile(BACKUP, "w", zipfile.ZIP_DEFLATED) as z:
        for p in targets:
            z.write(p, str(p.relative_to(ROOT)).replace("\\", "/"))
    print(f"备份 {len(targets)} 个文件 -> {BACKUP.name} ({BACKUP.stat().st_size//1024} KB)")


def run():
    print("模式：", "试跑（不写入）" if DRY else "正式写入")
    if not DRY:
        backup()
    for d in DIRS:
        htmls = sorted(d.rglob("*.html"))
        n_css = n_fav = n_changed = 0
        no_css = []
        for p in htmls:
            t = p.read_text(encoding="utf-8", errors="ignore")
            orig = t
            a = len(CSS_PAT.findall(t))
            b = len(FAV_PAT.findall(t))
            if a:
                t = CSS_PAT.sub(CSS_NEW, t)
            if b:
                t = FAV_PAT.sub(FAV_NEW, t)
            n_css += a
            n_fav += b
            if "brand-boom-20261106.css" not in orig:
                no_css.append(str(p.relative_to(d)))
            if t != orig:
                n_changed += 1
                if not DRY:
                    p.write_text(t, encoding="utf-8")
        css = d / "assets" / "brand-boom-20261106.css"
        cur = css.read_text(encoding="utf-8", errors="ignore")
        need_css = CSS_MARK not in cur
        if need_css and not DRY:
            css.write_text(cur.rstrip() + "\n" + CSS_RULE, encoding="utf-8")
        for name, content in (("brand-logo.svg", brand_logo_svg()), ("logo.svg", icon_svg())):
            if not DRY:
                (d / name).write_text(content, encoding="utf-8")
        print(f"\n[{d.name}] HTML {len(htmls)} 个，改动 {n_changed} 个")
        print(f"  样式表版本标记 {n_css} 处，小图标版本标记 {n_fav} 处")
        print(f"  样式文件{'需追加' if need_css else '已含规则（跳过）'}；新增/覆盖 brand-logo.svg、logo.svg")
        print(f"  未引用品牌样式的页面 {len(no_css)} 个" + (f"，例：{no_css[:4]}" if no_css else ""))


if __name__ == "__main__":
    run()
