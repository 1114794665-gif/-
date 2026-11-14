/* Batch 1 鉴权单测：在本地直接调用 worker，验证拦截分支（不依赖线上）。 */
import worker from "./cloudflare-worker.js";

const SECRET = "test-secret-for-batch1";
const enc = new TextEncoder();
const b64u = (s) => Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function hmac(body, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  return Buffer.from(sig).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function token(exp) {
  const body = b64u(JSON.stringify({ u: "admin", exp }));
  return body + "." + (await hmac(body, SECRET));
}

const ASSET_BODY = "INTERNAL-PRODUCT-LIST-CONTENT";
let assetHits = 0;
const env = {
  STAFF_SECRET: SECRET,
  ASSETS: {
    fetch: async () => {
      assetHits++;
      return new Response(ASSET_BODY, { status: 200, headers: { "Content-Type": "text/html" } });
    },
  },
};
const ctx = {};

async function hit(path, cookie) {
  const h = cookie ? { Cookie: cookie } : {};
  const r = await worker.fetch(new Request("https://www.boomdrinkware.com" + path, { headers: h }), env, ctx);
  const t = await r.text();
  return { status: r.status, robots: r.headers.get("X-Robots-Tag") || "", hasContent: t.includes(ASSET_BODY), len: t.length };
}

const good = "boom_staff=" + (await token(Date.now() + 3600000));
const expired = "boom_staff=" + (await token(Date.now() - 1000));
const forged = "boom_staff=" + (await token(Date.now() + 3600000)).slice(0, -4) + "AAAA";

const cases = [
  ["内部页 A · 未登录", "/byf-own-products-20261031/", null, true],
  ["内部页 B · 未登录", "/own-models-20261031/", null, true],
  ["内部页 A · 直接访问 index.html", "/byf-own-products-20261031/index.html", null, true],
  ["内部页 A · 过期会话", "/byf-own-products-20261031/", expired, true],
  ["内部页 A · 篡改会话", "/byf-own-products-20261031/", forged, true],
  ["内部页 A · 正常登录", "/byf-own-products-20261031/", good, false],
  ["普通页面 · 不受影响", "/products/wine-glass-fish-bowl/", null, false],
];

let fail = 0;
for (const [name, path, cookie, shouldBlock] of cases) {
  const r = await hit(path, cookie);
  const ok = shouldBlock ? r.status === 401 && !r.hasContent : r.status === 200 && r.hasContent;
  if (!ok) fail++;
  console.log(
    (ok ? "PASS" : "FAIL") + "  " + name.padEnd(26) + " status=" + r.status +
    " 内容泄露=" + (r.hasContent ? "是" : "否") + " X-Robots=" + (r.robots || "无") + " 长度=" + r.len
  );
}
console.log("\n资产被真实读取次数：" + assetHits + "（未登录的 4 次不应计入）");
console.log(fail === 0 ? "全部通过" : "有 " + fail + " 项未通过");
process.exit(fail === 0 ? 0 : 1);
