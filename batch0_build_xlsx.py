"""Batch 0 交付：把盘点结果落成 7 份可审核的表（xlsx，一个工作簿 7 个 sheet）。

只读本地数据，不改任何线上页面。
"""
import os, re, json, html
from collections import Counter, defaultdict
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

ROOT = r"C:\Users\Administrator\WorkBuddy\2026-11-09-19-39-20"
RAW = os.path.join(ROOT, "batch0-20261114", "batch0-raw.json")
OUT = os.path.join(ROOT, "batch0-20261114", "BOOM-Batch0-盘点交付-20261114.xlsx")
SITE = os.path.join(ROOT, "github-latest", "boom-drinkware-live", "site")
XLSX_AUDIT = r"C:\Users\Administrator\Desktop\BOOM独立站全站SEO审计-20261114 副本.xlsx"

d = json.load(open(RAW, encoding="utf-8"))
P = d["pages"]
by_url = {p["url"]: p for p in P}
lib = json.load(open(os.path.join(SITE, "data", "runtime-shared-niles-20261111.json"), encoding="utf-8"))["EVERCUP_LIBRARY_2061227"]["products"]
fields = json.load(open(os.path.join(SITE, "data", "product-fields.json"), encoding="utf-8"))

# ---------- 样式 ----------
HEAD = PatternFill("solid", fgColor="1F3864")
HEADF = Font(color="FFFFFF", bold=True, size=10)
TITLEF = Font(bold=True, size=13, color="1F3864")
NOTEF = Font(size=9, color="8A5A00")
THIN = Side(style="thin", color="D9D9D9")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
STATUS_FILL = {
    "待负责人确认": PatternFill("solid", fgColor="FFF2CC"),
    "待老板核实": PatternFill("solid", fgColor="FCE4D6"),
    "数据缺失": PatternFill("solid", fgColor="F8CBAD"),
    "无需处理": PatternFill("solid", fgColor="E2EFDA"),
}

wb = openpyxl.Workbook()


def sheet(name, title, note, headers, widths, rows, freeze="A6"):
    ws = wb.create_sheet(name)
    ws["A1"] = title
    ws["A1"].font = TITLEF
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
    ws["A2"] = note
    ws["A2"].font = NOTEF
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers))
    ws.row_dimensions[2].height = 44
    for i, h in enumerate(headers, 1):
        c = ws.cell(row=5, column=i, value=h)
        c.fill = HEAD; c.font = HEADF; c.alignment = CENTER; c.border = BORDER
    for r, row in enumerate(rows, 6):
        for i, v in enumerate(row, 1):
            c = ws.cell(row=r, column=i, value=v)
            c.alignment = WRAP; c.border = BORDER; c.font = Font(size=10)
            if isinstance(v, str) and v in STATUS_FILL:
                c.fill = STATUS_FILL[v]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = freeze
    ws.auto_filter.ref = "A5:%s%d" % (get_column_letter(len(headers)), max(5, len(rows) + 5))
    return ws


# ================= 00 总览 =================
ws0 = wb.active
ws0.title = "00-盘点总览"
ws0["A1"] = "BOOM Drinkware · Batch 0 全站盘点总览"
ws0["A1"].font = Font(bold=True, size=16, color="1F3864")
lines = [
    ("盘点时间", d["generatedAt"]),
    ("数据依据", "《BOOM独立站全站SEO审计-20261114 副本.xlsx》01 全站URL清单（540 行）+ 本地站点同源文件解析"),
    ("页面总数", "540（审计表全部 URL 均在本地找到对应页面，0 缺失）"),
    ("Sitemap URL", "%d 条" % d["counts"]["sitemapUrls"]),
    ("产品库型号", "%d 个（SKU 级）" % d["counts"]["libraryProducts"]),
    ("有产品数据关联的页面", "%d 页" % d["counts"]["pagesWithProductData"]),
    ("", ""),
    ("⚠ 口径差异 1", "「/bar-accessories/ 下 95 个产品页」：本次实测 81 个英文产品页 + 81 个中文对应页。差 14 个，需负责人确认审计口径（是否含分类页/已合并款）。"),
    ("⚠ 数据缺口 1", "产品工艺（processes）字段：415 条产品记录里只有 1 条有值。B2 表「工艺」列只能标数据缺失，不得推断编造。"),
    ("⚠ 数据缺口 2", "7 个中文服务页（/zh/compliance/ 等）本地与线上均不存在，Sitemap 也没有，属于「待建」而非「待改」。"),
    ("⚠ 待核实", "证书页上的证书编号、有效期、专利号，必须老板书面确认后方可放开收录；本批次一律按「待老板核实」处理，不放开。"),
    ("", ""),
    ("⚠ 重要发现 1", "场景页合并要谨慎：6 个候选页面实测正文 4,194–5,529 字、21–32 段、36–45 条站内链接，都不是薄页。合并会丢内容，必须先出「内容迁入方案」再谈 301，不能只因名字像就并。"),
    ("⚠ 重要发现 2", "产品分类是被压平的：「酒具配件」下 81 个产品里，D 组（吧台小件）占 54 个，A 组只有 7 个。说明现在的层级把冰勺、开瓶器、酒塞、吧垫全塞进同一层，建议 D 组内部再分子类，而不是只分四组就完事。"),
    ("⚠ 重要发现 3", "5 个停售页面全部返回 200 且无 301/410，属于「停售但还挂在线上」。其中 1.5oz UV 变色杯在 429 个在售型号里找不到同容量同功能替代，大概率只能 410，不宜硬跳。"),
    ("⚠ 重要发现 4", "交期说法全站有 12 种：从「1–2 天」到「30–40 天」混用，出现最多的是「25–30 天」(26 处)、「3–5 天」(16 处)、「30–40 天」(12 处)。这不是 SEO 问题，是报价口径问题，必须先定唯一说法（打样几天、大货几天、开模另加几天），否则页面之间互相打脸。"),
    ("", ""),
    ("本批次边界", "只盘点、只出表；未修改任何线上页面、未执行任何 301/410、未动 Sitemap。"),
]
r = 3
for k, v in lines:
    ws0.cell(row=r, column=1, value=k).font = Font(bold=True, size=10)
    c = ws0.cell(row=r, column=2, value=v)
    c.alignment = Alignment(wrap_text=True, vertical="top"); c.font = Font(size=10)
    ws0.merge_cells(start_row=r, start_column=2, end_row=r, end_column=4)
    ws0.row_dimensions[r].height = 30
    r += 1
ws0.column_dimensions["A"].width = 24
for col in "BCD":
    ws0.column_dimensions[col].width = 40

# ================= 01 产品分类审核表 =================
GROUP_MAP = {
    "Ice Tools & Accessories": ("A", "Ice Buckets & Ice Service", "冰勺 / 冰夹 / 冰桶配套"),
    "Pitchers & Carafes": ("B", "Pitchers & Jugs", "壶 / 罐 / 醒酒壶"),
    "Cocktail Tools": ("C", "Cocktail Tools", "摇酒器 / 滤冰器 / 捣棒 / 吧勺"),
    "Coasters": ("D", "Bar Accessories & Small Barware", "杯垫"),
    "More Bar Accessories": ("D", "Bar Accessories & Small Barware", "其他吧台小件"),
    "Wine Stoppers": ("D", "Bar Accessories & Small Barware", "酒塞 / 香槟塞"),
    "Bottle Openers": ("D", "Bar Accessories & Small Barware", "开瓶器"),
    "Pourers & Sippers": ("D", "Bar Accessories & Small Barware", "倒酒嘴 / 引流嘴"),
    "Wine Openers & Corkscrews": ("D", "Bar Accessories & Small Barware", "开酒器 / 螺旋钻"),
    "Bar Mats": ("D", "Bar Accessories & Small Barware", "吧垫 / 沥水垫"),
    "Can & Bottle Sleeves": ("D", "Bar Accessories & Small Barware", "罐套 / 瓶套"),
    "Wine Aerators & Dispensers": ("D", "Bar Accessories & Small Barware", "醒酒器 / 分酒器"),
    "Serving Trays": ("D", "Bar Accessories & Small Barware", "服务托盘"),
    "Drink Markers & Charms": ("D", "Bar Accessories & Small Barware", "酒杯记号 / 挂饰"),
    "Silicone Straws": ("D", "Bar Accessories & Small Barware", "吸管"),
}
CAP_KW = {
    "A": ["ice", "scoop", "tong", "bucket", "chiller"],
    "B": ["pitcher", "jug", "carafe", "decanter"],
    "C": ["shaker", "strainer", "jigger", "muddler", "spoon", "cocktail", "mixer", "mortar"],
}
bar_en = [p for p in P if p["categoryRoute"] == "/bar-accessories/" and p["type"] == "产品详情页" and not p["url"].startswith("/zh/")]
bar_en.sort(key=lambda p: (GROUP_MAP.get(p["groupName"], ("Z", "未归类", ""))[0], p["url"]))
rows1 = []
for i, p in enumerate(bar_en, 1):
    gid, gname, sub = GROUP_MAP.get(p["groupName"], ("Z", "未归类（需人工判定）", ""))
    zh = by_url.get("/zh" + p["url"], {})
    name_l = ((p["productName"] or "") + " " + p["url"]).lower()
    conflict = gid != "Z" and any(k in name_l for k in CAP_KW.get(gid, [])) is False and gid in "ABC"
    conf = "低" if (gid == "Z" or conflict) else ("高" if gid in "ABC" else "中")
    rows1.append([
        "B%02d" % ((i - 1) // 15 + 1),
        i,
        p["url"],
        zh.get("url", "缺失"),
        p["productName"] or p["mainProducts"],
        p["sku"] or "—",
        p["parentCat"],
        p.get("breadcrumb", "")[:80],
        p["material"] or "数据缺失",
        p["groupName"] or "未分组",
        sub,
        p["capacity"] or "—",
        ("；".join(p["processes"]) if p["processes"] else "数据缺失"),
        gid + ". " + gname,
        "按产品库子类「%s」机械映射" % (p["groupName"] or "空"),
        conf,
        "是" if conf == "低" else "否",
        "待负责人确认",
    ])
sheet(
    "01-产品分类审核表",
    "表 1 · /bar-accessories/ 产品分类框架审核表（实测 81 个英文产品页）",
    "口径说明：审计表写「95 个产品页」，本次实测 81 个英文产品页（另有 81 个中文对应页），差 14 个待负责人确认。分组依据为产品库现有 groupName，属机械映射，置信度高的可直接批；标记「未归类」的必须人工判定。只改分类关系，不改产品 URL。每 15 个为一批，便于分批审。",
    ["审核批次", "序号", "英文 URL", "中文 URL", "产品名称", "SKU", "当前上级分类", "当前面包屑", "材质", "当前分组", "建议子类", "容量", "工艺", "建议主分类", "分类理由", "置信度", "是否需人工确认", "审批状态"],
    [10, 6, 42, 42, 40, 12, 12, 34, 14, 20, 30, 14, 16, 26, 26, 8, 12, 14],
    rows1,
)

# ================= 02 场景页合并审批表 =================
SCENES = [
    ("/backyard-bbq-cups/", "/camping-drinkware/", "合并候选"),
    ("/birthday-party-cups/", "/family-event-cups/", "合并候选"),
    ("/graduation-party-cups/", "/family-event-cups/", "合并候选"),
    ("/holiday-party-cups/", "/family-event-cups/", "合并候选"),
    ("/pool-party-cups/", "/beach-party-cups/", "合并候选"),
    ("/tailgate-party-cups/", "/sports-team-cups/", "合并候选"),
    ("/bachelorette-party-cups/", "", "保留"),
    ("/beach-party-cups/", "", "保留"),
    ("/camping-drinkware/", "", "保留"),
    ("/family-event-cups/", "", "保留"),
    ("/open-air-nightclub/", "", "保留"),
    ("/sports-team-cups/", "", "保留"),
    ("/wedding-cups/", "", "保留"),
    ("/yacht-party-cups/", "", "保留"),
]


def cover(p):
    if not p:
        return "页面不存在"
    return "正文 %d 字 / 段落 %d 段 / 站内链接 %d 条 / 图片 %d 张" % (
        p.get("textLen", 0), p.get("paragraphs", 0), p.get("internalLinks", 0), p.get("imgCount", 0))


rows2 = []
for src, dst, action in SCENES:
    s = by_url.get(src, {})
    t = by_url.get(dst, {}) if dst else {}
    zhs = by_url.get("/zh" + src, {})
    rows2.append([
        src,
        zhs.get("url", "缺失"),
        s.get("title", "")[:90],
        s.get("h1", "")[:60],
        cover(s),
        action,
        dst or "—",
        (t.get("h1", "") or "—")[:60],
        cover(t) if dst else "—",
        "需先核对目标页是否已覆盖原页主题词与产品组合，未核对不得 301" if dst else "保持独立，补差异化内容",
        "待负责人确认",
        "P1",
    ])
sheet(
    "02-14场景页合并审批表",
    "表 2 · 14 个场景页合并审批表（含中文对应页）",
    "本表只做审批，不执行任何跳转。判断依据是「目标页内容覆盖能力」，不是名称相似。目标页覆盖数据为实测正文/段落/内链/图片量；合并前必须把原页有价值内容迁入目标页，且英文旧链对英文新链、中文旧链对中文新链，禁止统一跳首页。",
    ["原页面（EN）", "原页面（ZH）", "当前 Title", "当前 H1", "原页内容体量", "建议动作", "建议合并到", "目标页 H1", "目标页内容体量", "前置条件 / 风险", "审批状态", "优先级"],
    [34, 34, 46, 34, 40, 12, 30, 34, 40, 46, 14, 8],
    rows2,
)

# ================= 03 停售产品替代表 =================
DEAD = [
    ("/products/1-5oz-blue-uv-reactive/", ["uv", "glow", "reactive"], 1.5, None),
    ("/products/16oz-cold-beverage-souvenir-cup/", ["souvenir", "cold cup", "stadium"], 16, None),
    ("/products/custom-plastic-shot-glass-2oz/", ["shot"], 2, None),
    ("/products/full-printed-cold-cup-16oz/", ["cold cup", "full print", "printed"], 16, None),
    ("/products/wine-glass-fish-bowl/", ["fish bowl", "goblet", "wine glass"], None, 20),
]


def cap_vals(p):
    s = (p.get("capacity") or "").lower()
    v = set()
    for m in re.findall(r"([\d.]+)\s*oz", s):
        v.add(float(m))
    for m in re.findall(r"([\d.]+)\s*ml", s):
        v.add(round(float(m) / 29.5735, 1))
    for m in re.findall(r"([\d.]+)\s*l(?:iter|itre)?\b", s):
        v.add(round(float(m) * 33.814, 1))
    return v


rows3 = []
for url, kws, target, minoz in DEAD:
    p = by_url.get(url, {})
    cands = []
    for q in lib:
        if q.get("route") == url:
            continue
        cv = cap_vals(q)
        if target is not None:
            ok = any(abs(v - target) <= max(1.0, target * 0.2) for v in cv)
        else:
            ok = any(v >= minoz for v in cv)
        if not ok:
            continue
        txt = ((q.get("name") or "") + " " + (q.get("groupName") or "") + " " + (q.get("route") or "")).lower()
        kw = sum(3 for k in kws if k in txt)
        cands.append((kw, q, sorted(cv)))
    cands.sort(key=lambda x: (-x[0], x[1]["route"]))
    cands = cands[:3]
    if cands and cands[0][0] >= 3:
        best = cands[0][1]
        act = "301 → %s" % best["route"]
        conf = "中"
        need = "是（容量已匹配，仍需确认形态与材质是否可替代）"
    elif cands:
        best = cands[0][1]
        act = "410 或人工指定（仅容量接近，功能/材质不匹配）"
        conf = "低"
        need = "是（无同功能替代，需人工决策）"
    else:
        best = None
        act = "410（产品库无同容量候选）"
        conf = "低"
        need = "是（需人工指定替代或确认 410）"
    detail = "；".join("%s（%s，%s，语义%d分）" % (q["sku"], q["capacity"] or "无容量", q["material"] or "无材质", s) for s, q, _ in cands) or "产品库无同容量候选"
    rows3.append([
        url,
        "/zh" + url,
        p.get("productName") or p.get("title", "")[:50],
        p.get("httpStatus", ""),
        p.get("h1", "")[:50],
        (p.get("title", "")[:70]),
        best["route"] if best else "—",
        detail,
        act,
        conf,
        need,
        "待负责人确认",
    ])
sheet(
    "03-5停售产品替代表",
    "表 3 · 5 个停售产品替代型号映射表",
    "现状：5 个页面线上均返回 200，且都没有 301/410，属于「停售但仍可访问」。替代候选由产品库 429 个在售型号按「名称关键词 + 容量」打分得出，只是候选，不是结论——必须人工确认同容量、同形态、同材质后才能执行 301。英文旧链跳英文新链，中文旧链跳中文新链，禁止统一跳首页。",
    ["旧 URL（EN）", "旧 URL（ZH）", "旧产品名", "当前状态", "当前 H1", "当前 Title", "首选替代", "候选与匹配依据", "建议动作", "置信度", "是否需人工确认", "审批状态"],
    [40, 40, 44, 10, 40, 46, 44, 60, 40, 8, 30, 14],
    rows3,
)

# ================= 04 13 组关键词冲突表 =================
wb_a = openpyxl.load_workbook(XLSX_AUDIT, read_only=True, data_only=True)
ws4 = wb_a["04 页面竞争与关键词冲突"]
rows4_raw = list(ws4.iter_rows(min_row=2, values_only=True))
# 同主题产品页数，用于补支撑页
topic_pages = defaultdict(list)
for p in P:
    if p["type"] == "产品详情页" and not p["url"].startswith("/zh/"):
        topic_pages[p["topic"]].append(p["url"])
rows4 = []
for r in rows4_raw:
    if not r or not r[0]:
        continue
    topic = str(r[1] or "")
    support = [u for k, v in topic_pages.items() if topic.split(" ")[0][:2] and topic.split(" ")[0][:2] in k for u in v][:6]
    rows4.append([
        r[0], r[1], r[2], str(r[3] or "").replace("\n", " / "), r[4], r[5],
        str(r[6] or "")[:260], r[7], str(r[8] or "")[:300], r[9],
        " / ".join(support) if support else "需按主题词检索",
        "待负责人确认",
    ])
wb_a.close()
sheet(
    "04-13关键词冲突表",
    "表 4 · 13 组主题关键词冲突与页面分工表",
    "来源：审计表 04 页面竞争与关键词冲突（13 组）。本表补充了「支撑页」列并从全站产品页反查同主题页面。规则：先定主页面与内容分工，不自动合并重复主题；涉及 301/删除必须单独提交审批。",
    ["组号", "主题词", "冲突类型", "竞争入口页（非产品页）", "同主题产品页数(英)", "展示合计", "现状证据", "建议主页面", "处理动作", "优先级", "支撑页（实测反查）", "审批状态"],
    [8, 26, 22, 40, 12, 10, 50, 34, 50, 8, 46, 14],
    rows4,
)

# ================= 05 中文服务页建设表 =================
SERVICE = [
    ("/zh/compliance/", "/compliance/", "验厂与合规资料怎么给、给到什么程度"),
    ("/zh/packaging/", "/packaging/", "包装形式、外箱、唛头、装箱量"),
    ("/zh/tooling/", "/tooling/", "开模费用、模具归属、改模与保养"),
    ("/zh/manufacturing-process/", "/manufacturing-process/", "从原料到成品的工序与产能"),
    ("/zh/product-development/", "/product-development/", "三条开发路径：来图、改款、全新开发"),
    ("/zh/quality-control/", "/quality-control/", "检验节点、抽检标准、测试项目"),
    ("/zh/how-to-work-with-us/", "/how-to-work-with-us/", "从询盘到交付的完整合作流程"),
]
rows5 = []
for i, (zh, en, topic) in enumerate(SERVICE, 1):
    e = by_url.get(en, {})
    rows5.append([
        i, zh, en, "不存在（目录、页面、Sitemap 均无）",
        e.get("h1", "")[:60], e.get("title", "")[:80],
        "%d 字 / %d 段" % (e.get("textLen", 0), e.get("paragraphs", 0)),
        topic,
        "「%s」的中文版" % (e.get("h1", "")[:40] or en),
        "独立中文 Title + 独立 Meta + 唯一 H1；正文按英文页专业本地化，不机翻",
        "服务流程 / 交付内容 / 客户需提供资料 / 相关内链 / 询盘入口",
        "自指 canonical；hreflang 中英双向互指；zh-CN；禁止 /zh/zh/",
        "P1", "待建（需英文页内容定稿后开工）",
    ])
sheet(
    "05-7中文服务页建设表",
    "表 5 · 7 个中文服务页面建设表",
    "实测结论：这 7 个中文页在本地目录、线上、Sitemap 中均不存在，属于「新建」而不是「修改」。英文对应页全部 200 且内容完整，可作为本地化来源。开工前需确认：中文是「服务页」定位还是「招商页」定位，直接决定标题与正文语气。",
    ["序号", "目标中文 URL", "英文来源页", "当前状态", "英文页 H1", "英文页 Title", "英文页体量", "页面主题", "建议中文 H1（草案）", "内容要求", "必备板块", "技术要求", "优先级", "状态"],
    [6, 36, 32, 26, 40, 46, 16, 34, 44, 44, 44, 40, 8, 22],
    rows5,
)

# ================= 06 证书公开信息表 =================
cert = open(os.path.join(SITE, "certificates", "index.html"), encoding="utf-8").read()
plain = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", "", cert, flags=re.S))))
CERT_ROWS = [
    ("ISO 9001:2015 质量管理体系", "80682025Q1503R05", "2025-12-11 签发 / 有效期至 2028-12-10", "北京坤标检验认证有限公司（V.BRZ）", "深圳市宏润新材料科技有限公司", "吹塑产品（塑料杯）的生产与销售，不含需取得许可资质的产品"),
    ("ISO 14001:2015 环境管理体系", "80682025E0828R05", "2025-12-11 签发 / 有效期至 2028-12-10", "北京坤标检验认证有限公司（V.BRZ）", "深圳市宏润新材料科技有限公司", "吹塑塑料制品生产与销售相关的环境管理活动"),
    ("实用新型专利 · 可拆卸酒杯", "ZL 2022 2 1579532.1 / 授权公告号 CN 218246685 U", "2022-06-22 申请 / 2023-01-10 授权 / 期限十年", "国家知识产权局", "深圳市宏润新材料科技有限公司（发明人 翟斯峰）", "杯身与杯座可拆卸连接结构"),
    ("实用新型专利 · 一种可拆卸式塑料高脚杯", "授权公告号 CN 213488223 U", "2020-12-04 申请 / 2021-06-22 授权", "国家知识产权局", "深圳市宏润新材料科技有限公司", "杯身坐入杯座顶部容腔形成可拆卸连接"),
]
rows6 = []
for name, no, valid, issuer, holder, scope in CERT_ROWS:
    inpage = "是" if (no.split(" / ")[0][:12] in plain) else "页面未找到该编号"
    rows6.append([
        name, no, valid, issuer, holder, scope,
        inpage, "noindex, nofollow, nosnippet, noimageindex",
        "保持 noindex 直到老板书面确认；确认后改 index,follow 并加入 Sitemap",
        "不公开完整扫描件；不提供 PDF 直链；完整件走内部权限",
        "待老板核实",
    ])
rows6.append([
    "其余 7 份文件（成品检测报告 / 原料报告等）", "页面称共 11 份文件", "未逐份列明", "—", "—",
    "页面只做了分组介绍，未逐份给出编号与有效期",
    "未列明", "noindex, nofollow",
    "需老板提供每份报告的编号与有效期后才能公开列示",
    "只能写「可提供」，不得写具体编号",
    "待老板核实",
])
sheet(
    "06-证书公开信息表",
    "表 6 · 证书与检测报告公开信息表",
    "红线：本表信息全部抄自现有证书页正文，我没有新增、推断或补全任何编号与日期。核对项「页面是否找到该编号」用于确认页面自洽。在老板书面确认这些编号与有效期真实有效之前，两个证书页继续保持 noindex，不得放开收录、不得加入 Sitemap。",
    ["证书/文件名称", "编号", "有效期 / 关键日期", "发证机构", "持有人", "适用范围", "页面自洽核对", "当前 robots", "建议动作", "公开边界", "核实状态"],
    [34, 40, 34, 30, 30, 44, 16, 28, 46, 40, 14],
    rows6,
)

# ================= 07 MOQ / 打样 / 交期冲突表 =================
rows_conflict, rows_missing = [], []
for p in P:
    if p["type"] != "产品详情页" or p["url"].startswith("/zh/") or not p["skus"]:
        continue
    page_moq = ""
    lf = p.get("localFile")
    if lf:
        s = open(os.path.join(SITE, *lf.split("/")), encoding="utf-8", errors="replace").read()
        # 只有「MOQ 后紧跟数字」或「MOQ + 数字 + 单位」才算页面真的写了 MOQ，
        # 避免把「Review price, MOQ, packing, 3-5 days」这类话术里的 3 当成 MOQ。
        vals = []
        for m in re.finditer(r"MOQ\s*[:：]\s*(\d[\d,]{0,6})|MOQ\s+(\d[\d,]{0,6})\s*(?:pcs|pieces|件|个)", s, re.I):
            vals.append((m.group(1) or m.group(2)).replace(",", ""))
        if vals:
            page_moq = ",".join(sorted(set(vals)))
    data_moq = str(p.get("moq", "") or "")
    if not data_moq and not page_moq:
        continue
    nums = [x for x in page_moq.split(",") if x]
    if page_moq and data_moq and data_moq not in nums:
        rows_conflict.append([p["url"], p["sku"], (p["productName"] or "")[:50], data_moq, page_moq, "数据层 %s，页面写 %s" % (data_moq, page_moq), "待负责人确认"])
    elif page_moq and not data_moq:
        rows_conflict.append([p["url"], p["sku"], (p["productName"] or "")[:50], "—", page_moq, "页面有数字，数据层缺", "待负责人确认"])
    elif data_moq and not page_moq:
        rows_missing.append([p["url"], p["sku"], (p["productName"] or "")[:50], data_moq, "—", "页面未写 MOQ，采购信息缺失", "待补（需真实 MOQ）"])

# 全站交期/打样口径扫描（记录出现次数与首个页面）
lead = {}
for p in P:
    lf = p.get("localFile")
    if not lf:
        continue
    s = open(os.path.join(SITE, *lf.split("/")), encoding="utf-8", errors="replace").read()
    for m in re.findall(r"(\d{1,2})\s*[–\-~to]{0,4}\s*(\d{1,2})\s*(?:working\s*)?days", s, re.I):
        k = "%s–%s 天" % m
        if k not in lead:
            lead[k] = [0, p["url"]]
        lead[k][0] += 1

rows7 = [["A 数字冲突"] + r for r in rows_conflict]
rows7.append(["B 页面缺采购信息", "合计 %d 个产品页" % len(rows_missing), "—", "—", "—", "数据层有 MOQ、页面正文没写出来", "待补（需真实 MOQ）"])
rows7 += [["B 页面缺采购信息"] + r for r in rows_missing]
for k, (n, u) in sorted(lead.items(), key=lambda x: -x[1][0])[:12]:
    rows7.append(["C 交期口径", "全站 %d 处（示例 %s）" % (n, u), "—", "—", "—", "页面写「%s」" % k, "口径待统一，需负责人定唯一说法"])

sheet(
    "07-MOQ打样交期冲突表",
    "表 7 · MOQ、打样与交期冲突表（分三段）",
    "A 段：%s。B 段：%d 个产品页数据层有 MOQ、但页面正文没写出来——任务书要求产品页具备真实采购信息，这批要补，补之前必须先确认真实 MOQ。C 段：全站交期说法共 %d 种，混用严重，负责人需定唯一说法。本表不改任何数字。" % (
        "未发现数据层与页面数字互相打架的硬冲突（0 条）" if not rows_conflict else "数据层与页面 MOQ 数字不一致，共 %d 条，必须逐条定口径" % len(rows_conflict),
        len(rows_missing), len(lead)),
    ["分段", "页面 URL", "SKU", "产品名", "数据层 MOQ", "页面实际写的 MOQ", "说明", "处理状态"],
    [16, 46, 12, 40, 14, 22, 34, 20],
    rows7,
)

wb.save(OUT)
print("已生成", OUT)
print("sheet 列表", wb.sheetnames)
print("行数", {ws.title: ws.max_row - 5 for ws in wb.worksheets})
