# Google Search Console 与 GA4

配置日期：2026-11-06，中国时区。

## 管理入口

- Google 账号：panyuchen1985@gmail.com（用户已确认）。
- Search Console：`sc-domain:boomdrinkware.com`，DNS TXT 所有权已验证。请保留验证 TXT。
- 网站地图：`https://www.boomdrinkware.com/sitemap.xml`，Google 显示成功并发现 492 个网址；这不是已收录数量。
- GA4 账号：BOOM Drinkware，415185234。
- GA4 资源：BOOM Drinkware | www.boomdrinkware.com，562900852。
- 网站数据流：BOOM Drinkware Website，16283098439。
- 衡量 ID：`G-TZ491G135G`。
- 报告时区：中国（GMT+08:00）；币种：美元。
- Search Console 与上述网站数据流已关联。

## 统计口径

|事件|触发|含义|
|---|---|---|
|page_view|同意统计后的初次访问与页面路由变化|浏览|
|view_item|产品页面识别到型号|查看产品|
|rfq_start|首次填写询盘|开始填写，不是询盘成功|
|rfq_submit_attempt|提交表单|提交尝试，可能失败|
|generate_lead|服务端保存成功，且不是幂等重复提交|原始询盘，已标记关键事件|
|rfq_failed|提交未确认成功|失败诊断|
|contact_click|点击联系链接|联系意向，不是成功询盘|

不设询盘默认金额，不将询盘当作销售收入或合格线索。报表中测试访问和验收询盘不代表真实买家；验收日期为 2026-11-06。

## 同意与数据范围

仅正式主机 `www.boomdrinkware.com` 启用，pages.dev 与本地不发送数据。访客主动允许统计后才加载 Google 代码。拒绝后产品浏览和询盘仍可使用。

不发送姓名、邮箱、电话、公司、询盘正文、附件地址、完整查询参数。事件仅允许页面路径、语言、受限型号/数量和预设来源类别。网页标题和 referrer 使用受控值。Google Signals 与广告个性化关闭，可选账号共享关闭，自动增强型衡量关闭。

## 实现与验证

`site/data/growth-measurement-config.json` 为配置；`site/assets/growth-measurement-20261026.js` 为唯一全站适配器。已移除旧 GA4 占位块与“所有表单提交即成功询盘”的监听。首页表单、完整询盘、浮动询盘均依据保存回执发出成功信号。

本地检查通过：同意前无 Google 脚本、拒绝不加载、预览主机不加载、单次初始 page_view、失败不计 generate_lead、受限参数不含测试邮箱。

浏览器确认：同意前 Google 脚本为 0，适配器为 1；允许后加载正确衡量 ID；GA4 实时报告显示测试访问。

最终线上验收通过：新版脚本 `v=20261106-ga4d` 下，实时报告显示 page_view 1、rfq_start 1、rfq_submit_attempt 1、generate_lead 1；关键事件卡显示 generate_lead 1。首页表单收到服务端回执 `ENQ-9658c8ea-9a47-484e-aaae-aaac4cda1710`。先前缓存脚本下的测试回执为 `ENQ-f9aa6e94-fe3c-4c41-9d6f-9a8ad458036c`。两笔均为示例邮箱的合成测试，不是真实客户；网站数据库内的合成测试记录已清理，GA4 中验收产生的事件仍属于测试数据。

线上版本已部署至 Cloudflare，代码保存在 GitHub 的 `deploy/cloudflare-free` 分支。修改统计适配器或首页表单脚本时应同步更新 HTML 引用的版本参数，避免浏览器缓存旧脚本。

后续查看：Search Console 的“效果/网页”观察搜索词及索引；GA4“实时概览”检查当前访问，“获取流量”查看来源，“事件/关键事件”查看 generate_lead。新资源的常规报告存在处理延迟，实际接收以实时报告和询盘保存记录分别核对。

网站询盘保存与企业邮箱转发是不同链路；本次 GA4 配置不等于启用表单邮件通知。
