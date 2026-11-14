"""Batch 1 安全与索引整改：文件层修改（配合 worker 鉴权）。

只做四件事：
  1. 两个内部产品清单页加 noindex,nofollow 兜底（主要靠 worker 401 拦截）
  2. /zh/login/ 空壳页加 noindex,nofollow
  3. Sitemap 删除 301 的 /custom-stadium-cups/ 与 /zh/custom-stadium-cups/
  4. 打印修改前后摘要，便于验收
"""
import os, re, json

ROOT = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20"
SITE = os.path.join(ROOT, "github-latest", "boom-drinkware-live", "site")
ROBOTS = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">'
TARGETS = [
    ("byf-own-products-20261031/index.html", "内部产品清单 A"),
    ("own-models-20261031/index.html", "内部产品清单 B"),
    ("zh/login/index.html", "中文登录空壳页"),
]

changes = []
for rel, label in TARGETS:
    f = os.path.join(SITE, *rel.split("/"))
    s = open(f, encoding="utf-8", errors="replace").read()
    if re.search(r'<meta[^>]+name=["\']robots["\']', s, re.I):
        s2 = re.sub(r'<meta[^>]+name=["\']robots["\'][^>]*>', ROBOTS, s, count=1, flags=re.I)
        action = "替换原有 robots"
    elif "</head>" in s:
        s2 = s.replace("</head>", "  " + ROBOTS + "\n</head>", 1)
        action = "插入 robots"
    else:
        raise SystemExit("%s 没有 </head>，结构异常，停止" % rel)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2)
    has = ROBOTS in open(f, encoding="utf-8").read()
    changes.append((label, rel, action, "OK" if has else "FAIL"))

# Sitemap
sm_f = os.path.join(SITE, "sitemap.xml")
sm = open(sm_f, encoding="utf-8").read()
before = len(re.findall(r"<loc>", sm))
removed = []
for u in ["/custom-stadium-cups/", "/zh/custom-stadium-cups/"]:
    pat = r"<url><loc>https://www\.boomdrinkware\.com" + re.escape(u) + r"</loc>.*?</url>"
    if re.search(pat, sm, re.S):
        sm = re.sub(pat, "", sm, count=1, flags=re.S)
        removed.append(u)
open(sm_f, "w", encoding="utf-8").write(sm)
after = len(re.findall(r"<loc>", sm))

print("== 文件层修改 ==")
for c in changes:
    print("  %-14s %-40s %-14s %s" % c)
print("== Sitemap ==")
print("  URL 数 %d -> %d" % (before, after))
print("  已删除", removed)
left = [u for u in ["/custom-stadium-cups/", "/zh/custom-stadium-cups/"] if u in sm]
print("  残留", left or "无")

json.dump({"changes": changes, "sitemapBefore": before, "sitemapAfter": after, "removed": removed},
          open(os.path.join(ROOT, "batch0-20261114", "batch1-file-changes.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
