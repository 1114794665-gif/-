"""Batch 0 全站盘点：只读，不改任何线上页面。产出 batch0-raw.json 供制表使用。

数据来源：
  1. 审计底表《BOOM独立站全站SEO审计-20261114 副本.xlsx》01 全站URL清单（28 列）
  2. 本地 site 目录（与实际线上同源）：robots / hreflang / canonical / 面包屑 / 内链
  3. site/data：产品库 EVERCUP_LIBRARY、product-fields、redirects
"""
import os, re, json, html, hashlib
from datetime import datetime
import openpyxl

ROOT = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20"
SITE = os.path.join(ROOT, "github-latest", "boom-drinkware-live", "site")
XLSX = r"C:\Users\Administrator\Desktop\BOOM独立站全站SEO审计-20261114 副本.xlsx"
OUT = os.path.join(ROOT, "batch0-20261114", "batch0-raw.json")

os.makedirs(os.path.dirname(OUT), exist_ok=True)

# ---------- 1. 审计底表 ----------
wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ws = wb["01 全站URL清单"]
rows = list(ws.iter_rows(min_row=1, values_only=True))
hdr = [str(h) for h in rows[0]]
recs = []
for r in rows[1:]:
    if not r or not r[1]:
        continue
    recs.append({hdr[i]: r[i] for i in range(len(hdr)) if i < len(r)})
wb.close()

# ---------- 2. 数据层 ----------
shared = json.load(open(os.path.join(SITE, "data", "runtime-shared-niles-20261111.json"), encoding="utf-8"))
lib = shared.get("EVERCUP_LIBRARY_2061227", {})
products = lib.get("products", [])
by_route = {}
for p in products:
    by_route.setdefault(p.get("route", ""), []).append(p)
fields = json.load(open(os.path.join(SITE, "data", "product-fields.json"), encoding="utf-8"))
fields_by_sku = {}
for k, v in fields.items():
    fields_by_sku.setdefault(v.get("sku", ""), v)
redirects = json.load(open(os.path.join(SITE, "data", "redirects-20261029.json"), encoding="utf-8"))

sm = open(os.path.join(SITE, "sitemap.xml"), encoding="utf-8").read()
sitemap = set(u.replace("https://www.boomdrinkware.com", "") for u in re.findall(r"<loc>(.*?)</loc>", sm))

# ---------- 3. 逐页解析 ----------
def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def parse_page(url):
    rel = url.strip("/")
    f = os.path.join(SITE, *([rel] if rel else []), "index.html")
    if not os.path.isfile(f):
        return None
    s = open(f, encoding="utf-8", errors="replace").read()
    out = {"localFile": os.path.relpath(f, SITE).replace("\\", "/"), "bytes": len(s)}
    m = re.search(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']+)', s, re.I)
    out["robotsMeta"] = (m.group(1).strip() if m else "")
    m = re.search(r'<html[^>]+lang=["\']([^"\']+)', s, re.I)
    out["htmlLang"] = m.group(1) if m else ""
    out["hreflang"] = sorted(set(
        f'{a}={b}' for a, b in re.findall(
            r'<link[^>]+hreflang=["\']([^"\']+)["\'][^>]*href=["\']([^"\']+)', s, re.I)))
    # 面包屑：优先取面包屑容器文本
    bc = ""
    m = re.search(r'<(?:nav|div)[^>]*class=["\'][^"\']*breadcrumb[^"\']*["\'][^>]*>(.*?)</(?:nav|div)>', s, re.I | re.S)
    if m:
        bc = clean(m.group(1))
    out["breadcrumb"] = bc[:200]
    # 站内链接数（去重）
    hrefs = re.findall(r'<a[^>]+href=["\']([^"\']+)', s, re.I)
    internal = set()
    for h in hrefs:
        if h.startswith("/") and not h.startswith("//"):
            internal.add(h.split("#")[0])
        elif h.startswith("https://www.boomdrinkware.com"):
            internal.add(h.replace("https://www.boomdrinkware.com", "").split("#")[0])
    out["internalLinks"] = len(internal)
    out["internalTargets"] = sorted(internal)[:60]
    # 正文段数（粗略：<p> 且长度>40）
    ps = [clean(x) for x in re.findall(r"<p[^>]*>(.*?)</p>", s, re.I | re.S)]
    out["paragraphs"] = sum(1 for x in ps if len(x) > 40)
    out["textLen"] = len(clean(re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.I | re.S)))
    # 图片与 ALT
    imgs = re.findall(r"<img[^>]*>", s, re.I)
    out["imgCount"] = len(imgs)
    out["imgNoAlt"] = sum(1 for i in imgs if not re.search(r'\balt=["\'][^"\']+', i, re.I))
    # JSON-LD 类型
    out["jsonldTypes"] = sorted(set(re.findall(r'"@type"\s*:\s*"([^"]+)"', s)))
    return out

pages = []
for rec in recs:
    url = str(rec["URL"]).strip()
    info = parse_page(url) or {}
    # 产品信息
    prods = by_route.get(url, [])
    if not prods and url.startswith("/zh/"):
        prods = by_route.get(url[3:], [])
    p0 = prods[0] if prods else {}
    skus = sorted(set(p.get("sku", "") for p in prods if p.get("sku")))
    fld = fields_by_sku.get(p0.get("sku", ""), {}) if p0 else {}
    pages.append({
        "url": url,
        "lang": rec.get("语言") or "",
        "type": rec.get("页面类型") or "",
        "topic": rec.get("所属主题") or "",
        "parentCat": rec.get("上级分类") or "",
        "httpStatus": rec.get("HTTP状态") or "",
        "indexable": rec.get("允许索引") or "",
        "title": str(rec.get("Title") or "").strip(),
        "titleLen": rec.get("Title字符数") or 0,
        "desc": str(rec.get("Meta Description") or "").strip(),
        "descLen": rec.get("Description字符数") or 0,
        "h1": str(rec.get("H1") or "").strip(),
        "h1Count": rec.get("H1数量") or 0,
        "summary": str(rec.get("主要内容摘要") or "")[:300],
        "mainProducts": str(rec.get("页面主要产品") or "")[:200],
        "mainMaterial": str(rec.get("页面主要材质") or ""),
        "mainCraft": str(rec.get("页面主要工艺") or ""),
        "canonicalXlsx": str(rec.get("当前Canonical") or ""),
        "mainLinksXlsx": str(rec.get("当前主要内链目标") or "")[:300],
        "inbound": rec.get("站内入链数") or 0,
        "inSitemapXlsx": rec.get("是否在sitemap") or "",
        "inSitemapReal": url in sitemap,
        "gscImpr": rec.get("GSC展示") or 0,
        "gscClicks": rec.get("GSC点击") or 0,
        "ctr": rec.get("CTR") or 0,
        "avgPos": rec.get("平均排名") or 0,
        "note": str(rec.get("备注") or ""),
        # 产品维度
        "skus": skus,
        "sku": p0.get("sku", ""),
        "productName": p0.get("name", ""),
        "productNameZh": p0.get("zhName", ""),
        "category": p0.get("category", ""),
        "categoryRoute": p0.get("categoryRoute", ""),
        "group": p0.get("group", ""),
        "groupName": p0.get("groupName", ""),
        "groupZh": p0.get("groupZh", ""),
        "material": (p0.get("material") or (fld.get("materials") or [""])[0]),
        "capacity": p0.get("capacity", ""),
        "moq": fld.get("moq", ""),
        "processes": fld.get("processes", []),
        "redirectTo": redirects.get(url, ""),
        **info,
    })

raw = {
    "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
    "source": os.path.basename(XLSX),
    "counts": {
        "xlsxRows": len(recs),
        "pagesParsed": sum(1 for p in pages if p.get("localFile")),
        "sitemapUrls": len(sitemap),
        "libraryProducts": len(products),
        "pagesWithProductData": sum(1 for p in pages if p["skus"]),
    },
    "pages": pages,
}
json.dump(raw, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("已写出", OUT)
print(json.dumps(raw["counts"], ensure_ascii=False, indent=1))

# 快检
from collections import Counter
print("页面类型", Counter(p["type"] for p in pages).most_common(12))
print("缺本地文件", [p["url"] for p in pages if not p.get("localFile")][:10])
print("robots 非空", sum(1 for p in pages if p.get("robotsMeta")))
print("在 sitemap", sum(1 for p in pages if p["inSitemapReal"]))
print("工艺有值", sum(1 for p in pages if p["processes"]))
print("有 SKU", sum(1 for p in pages if p["skus"]))
