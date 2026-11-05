# Cloudflare 免费部署

此分支用于Cloudflare Pages，不运行app.mjs、install.sh或宝塔Nginx。

构建命令：`node build-cloudflare.cjs`
输出目录：`cloudflare-dist`
生产分支：`deploy/cloudflare-free`

Cloudflare Pages绑定D1数据库，变量名为DB。先在D1控制台执行cloudflare-schema.sql。没有DB绑定时接口返回503，不会假装收件成功。

静态页面及图片使用Pages，询盘API使用Pages Functions和D1。附件限制：最多5个，每个2MB，总计5MB；保存为私有D1分块，不创建公开附件地址。邮件通知仍未配置；销售需在D1控制台查看enquiries表与附件表。正式接流量前须确定每日收件巡检和备份负责人。

免费额度并非无限。保持Workers Free，不开通Workers Paid或R2订阅；超过免费额度可能请求失败。Pages免费文件数量20000、单文件25MiB，本次4424文件、最大约4.1MB满足该两项限制。当前配额以Cloudflare控制台和官方文档为准。

上线前依次验证：产品旧链接重定向；询盘默认收起；数据库真实写入；附件字节；重复提交；未授权提交被拒；pages.dev域名访问与自有域名SEO配置。临时pages.dev只做测试，自有域名未绑定前不要宣称正式域名上线。

本地测试：node:sqlite适配验证会话、保存、附件字节、幂等去重、无token拒绝通过。最终仍需部署后验证Cloudflare D1真实执行。
