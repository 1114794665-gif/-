# SEO 第一批修复说明 — 2026-11-06

正式站点：https://www.boomdrinkware.com/ 。本批处理上线阻碍项，保留现有页面结构、产品正文与 URL。

| 项目 | 修复 | 验证 |
|---|---|---|
| 裸域名不可访问 | Pages 增加 boomdrinkware.com 绑定；新增代理 CNAME 到 evercup-free.pages.dev；Cloudflare Single Redirect 301 到 www，保留路径和查询参数 | HTTP/HTTPS 裸域名及带查询参数的 /products/ 实测 301 |
| 站点地图含无效索引目标 | 移除 EN/ZH custom-stadium-cups 两个 301 URL 和 hydro-dipping 两个 noindex URL | sitemap 由 492 减至 488；旧地址行为保留 |
| 语言标签错配 | 对有 EN/ZH 对应文件的 484 个页面统一静态 hreflang，首页恢复首页对应关系 | 全部 sitemap 页及额外 /zh/customization/ 对应页检查通过 |
| 中文变色工艺页元信息 | /zh/color-changing-ink/ 增加 self canonical，中文 title 和 description 与原有内容对应 | 线上 canonical 检查通过 |
| 手机询盘入口空白 | 独立移动端 Enquire/询盘短标签，恢复可见尺寸及固定定位；默认收起、点击展开 | 浏览器 320/390/768 屏宽和桌面检查；不提交询盘测试数据 |

Cloudflare 规则名称：`Apex to www — preserve path and query`。
匹配：`(http.host eq "boomdrinkware.com")`。
目标：`concat("https://www.boomdrinkware.com", http.request.uri.path)`。
状态：301；Preserve query string：开启。
规则 ID：`3ffb910010504f2aa135e22c21bf4c78`。此规则在 Cloudflare 控制台中管理，不属于 Pages `_redirects` 文件。现有邮箱 MX/SPF/DKIM 不变。

复查口径：488 个 sitemap URL 均为 200、唯一 self canonical、无 noindex；无重复 loc；hreflang 对应检查通过。不存在 URL 返回真实 404；历史 stadium 跳转仍为原目标。GA4 同意控制、单次浏览事件、仅成功询盘记转化和个人信息排除测试通过。509 个 HTML 文件对比确认正文无意外改动。

原审计的 P2 建议仍保留，不能将本批结果解读为全部 SEO 问题消失：内部旧链接直接化、compliance 静态预渲染、孤立内容入口、图片压缩、Product/Offer 富媒体资格及品牌/主体事实核实仍待下一批处理。询价产品不能为获取富媒体结果虚构价格；关键词搜索量、KD、CPC 和竞争对手排名继续等待人工提供 SEMrush 数据，未调用 SEMrush API 或开通付费服务。

上线检测不保证 Google 收录或排名。Google 重新抓取和 GSC 报表更新需要时间。
