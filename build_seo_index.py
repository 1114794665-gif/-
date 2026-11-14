"""生成后台 SEO 编辑器的页面清单：以真正生效的文案为准（运行期数据优先）。"""
import json, re, glob, os, html, datetime

SITE = "site"
shared = json.load(open(f"{SITE}/data/runtime-shared-niles-20261111.json", encoding="utf-8"))
COLL = shared.get("BX_COLLECTIONS_3278913", {})
CAT = shared.get("BX_CATEGORIES_3274997", {})


def meta_attr(s, name, prop=None):
    pat = r'<meta[^>]+(?:name|property)=["\']' + re.escape(prop or name) + r'["\'][^>]*>'
    m = re.search(pat, s, re.I)
    if not m:
        return ""
    c = re.search(r'content=["\'](.*?)["\']', m.group(0), re.S)
    return html.unescape(c.group(1)) if c else ""


def runtime_meta(route):
    f = f"{SITE}/data/runtime-pages-niles-20261111{route}index.json"
    if not os.path.exists(f):
        return {}, ""
    try:
        d = json.load(open(f, encoding="utf-8"))
    except Exception:
        return {}, ""
    m = {}
    for layer in ("BX_METADATA_3825375", "REPAIR_PAGE_META_2868885", "WHOLE_PAGE_META_3116670"):
        e = d.get(layer, {}).get(route) if isinstance(d.get(layer), dict) else None
        if isinstance(e, dict):
            m.update({k: v for k, v in e.items() if k in ("title", "description", "meta")})
    h1 = ""
    e = d.get("BX_PAGES_3321510", {}).get(route) if isinstance(d.get("BX_PAGES_3321510"), dict) else None
    if isinstance(e, dict):
        h = re.search(r"<h1[^>]*>(.*?)</h1>", e.get("html", ""), re.S)
        if h:
            h1 = html.unescape(re.sub(r"<[^>]+>", "", h.group(1))).strip()
    return m, h1


def page_type(route):
    if "/products/" in route: return "product-zh" if route.startswith("/zh/") else "product"
    if route.startswith("/zh/"): return "page-zh"
    if any(x in route for x in ("/blog/", "/guides/", "/articles/")): return "article"
    return "page"


out = []
for f in glob.glob(f"{SITE}/**/index.html", recursive=True):
    rel = f.replace("\\", "/")[len(SITE):].rsplit("index.html", 1)[0]
    route = "/" + rel.lstrip("/")
    if "/admin/" in route or route.startswith("/_"):
        continue
    s = open(f, encoding="utf-8").read()
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    title = html.unescape(t.group(1).strip()) if t else ""
    desc = meta_attr(s, "description")
    h = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S)
    h1 = html.unescape(re.sub(r"<[^>]+>", "", h.group(1))).strip() if h else ""
    og = meta_attr(s, "og:image", "og:image") or "/og-default.png"
    rm, rh1 = runtime_meta(route)
    if rm.get("title"): title = rm["title"]
    if rm.get("description"): desc = rm["description"]
    if COLL.get(route, {}).get("title"): h1 = COLL[route]["title"]
    elif CAT.get(route, {}).get("title"): h1 = CAT[route]["title"]
    if rh1: h1 = rh1
    if not title and not desc and not h1:
        continue
    out.append(dict(route=route, pageType=page_type(route), title=title, meta=desc,
                    h1=h1, keyword="", ogImage=og))

out.sort(key=lambda x: x["route"])
p = f"{SITE}/data/seo-pages-index.json"
json.dump({"generatedAt": datetime.datetime.now().isoformat(timespec="seconds"), "pages": out},
          open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("页面清单", len(out), "写入", p, os.path.getsize(p) // 1024, "KB")
for r in out:
    if r["route"] in ("/custom-ice-buckets/", "/tasting-events-drinkware/", "/led-light-up-cups/"):
        print(" ", r["route"], "|", r["title"], "|", r["h1"])

# 初始化覆盖层
ov = f"{SITE}/data/seo-overrides.json"
if not os.path.exists(ov):
    json.dump({"version": 1, "updatedAt": "", "pages": {}}, open(ov, "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    print("初始化覆盖层", ov)
