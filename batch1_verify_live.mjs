/* Batch 1 线上验收：对着正式站跑，不用代码成功代替线上验证。
   覆盖：内部页未登录必拦 / 登录后可读 / 空壳登录页 noindex / Sitemap / 普通页不受影响 / 三页定稿未破。 */
import fs from "node:fs";

const BASE = "https://www.boomdrinkware.com";
const SECRET = JSON.parse(fs.readFileSync(".secrets/staff.json", "utf8")).secret;
const enc = new TextEncoder();
const b64u = (s) => Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function hmac(body, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  return Buffer.from(sig).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const body = b64u(JSON.stringify({ u: "admin", exp: Date.now() + 3600000 }));
const COOKIE = "boom_staff=" + body + "." + (await hmac(body, SECRET));

async function get(path, cookie) {
  const r = await fetch(BASE + path, { headers: cookie ? { Cookie: cookie } : {}, redirect: "manual" });
  return { status: r.status, robots: r.headers.get("x-robots-tag") || "", text: await r.text() };
}

let fail = 0;
const check = (ok, label, detail) => {
  if (!ok) fail++;
  console.log((ok ? "PASS  " : "FAIL  ") + label.padEnd(38) + detail);
};

// 1. 内部页未登录
for (const p of ["/byf-own-products-20261031/", "/own-models-20261031/", "/byf-own-products-20261031/index.html"]) {
  const r = await get(p);
  const leak = /BYF 自供产品清单|站内在架/.test(r.text);
  check(r.status === 401 && !leak, "内部页未登录必拦 " + p, "status=" + r.status + " 泄露=" + (leak ? "是" : "否") + " robots=" + (r.robots || "无"));
}
// 2. 登录后可读
{
  const r = await get("/byf-own-products-20261031/", COOKIE);
  check(r.status === 200 && /BYF 自供产品清单|站内在架/.test(r.text), "内部页登录后可读", "status=" + r.status + " 长度=" + r.text.length + " robots=" + (r.robots || "无"));
}
// 3. 空壳登录页
{
  const r = await get("/zh/login/");
  const ni = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(r.text);
  check(r.status === 200 && ni, "/zh/login/ 已 noindex", "status=" + r.status + " meta-noindex=" + ni);
}
// 4. Sitemap
{
  const r = await get("/sitemap.xml");
  const n = (r.text.match(/<loc>/g) || []).length;
  check(r.status === 200 && n === 505 && !/custom-stadium-cups/.test(r.text), "Sitemap 条数与清理", "条数=" + n + " 含stadium=" + /custom-stadium-cups/.test(r.text));
}
// 5. 普通页不受影响
{
  const r = await get("/products/wine-glass-fish-bowl/");
  check(r.status === 200 && !r.robots, "普通产品页不受影响", "status=" + r.status + " X-Robots=" + (r.robots || "无"));
}
// 6. 三页定稿未破
const want = {
  "/custom-ice-buckets/": ["Custom Printed Ice Buckets for Bars & Brands | BOOM", "Custom Printed Plastic Ice Buckets for Bars & Brands"],
  "/tasting-events-drinkware/": ["Plastic Tasting Cups | Sizes, Materials & Custom Print | BOOM", "Plastic Tasting Cups for Events, Bars & Brands"],
  "/led-light-up-cups/": ["Custom LED Party Cups | Bold Glow, Branded Design | BOOM", "Custom LED Party Cups with Branded Designs"],
};
for (const [p, [t, h]] of Object.entries(want)) {
  const r = await get(p);
  const plain = r.text.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const okT = plain.includes("<title>" + t.split("&")[0].slice(0, 30));
  const okH = plain.includes(h);
  check(r.status === 200 && okT && okH, "三页定稿未破 " + p, "status=" + r.status + " title=" + (okT ? "对" : "错") + " h1=" + (okH ? "对" : "错"));
}
// 7. 首页
{
  const r = await get("/");
  check(r.status === 200, "首页正常", "status=" + r.status + " 长度=" + r.text.length);
}

console.log("\n" + (fail === 0 ? "线上验收全部通过" : "有 " + fail + " 项未通过"));
process.exit(fail === 0 ? 0 : 1);
