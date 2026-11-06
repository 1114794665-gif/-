# SEO 第三批：索引范围与 Google 验证 — 2026-11-06

- 后台 11 个现有 HTML 页面添加 `noindex, nofollow` meta；`/admin` 与 `/admin/*` 增加同样的 X-Robots-Tag 响应头。
- robots.txt 去除后台抓取禁止行，让搜索引擎能够读取 noindex。后台既有访问方式和 API 授权不变；robots/noindex 都不属于访问控制或身份认证措施。
- Cloudflare Pages 生产备用域名与版本/分支预览域名添加 host 限定的 `X-Robots-Tag: noindex`。正式 boomdrinkware.com 域名不匹配这些 host 规则。
- `_headers` 作为可维护源文件提交，并由构建复制；Worker 仍只处理 `/api/*`，不扩大免费额度计费请求范围。
- sitemap 保持 488 个原有有效 URL，不新增或删除业务页面。

Search Console 账号：用户此前确认的 Ge Pan。2026-11-06 控制台概述显示索引数据处理中、无体验数据。重新提交同一个 sitemap.xml 地址后，Google 弹窗确认成功，报告已发现网页数由 492 更新为 488。该数值不是已收录数量。

官方依据：

- https://developers.cloudflare.com/pages/configuration/headers/ （域名限定及 pages.dev noindex 示例）
- https://developers.google.com/search/docs/crawling-indexing/block-indexing （搜索引擎需要能够抓取页面，才能读取 noindex）

品牌主体、证书覆盖范围、关键词月搜索量/KD/CPC/竞争排名仍待事实或人工导出数据；本批没有推测填写，也未调用 SEMrush API 或购买服务。
