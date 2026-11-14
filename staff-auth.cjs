/* 后台员工登录：无状态验证码 + 签名会话。密钥/密码哈希从环境变量读，不进仓库。 */
const crypto = require('node:crypto');

const SECRET = process.env.STAFF_SECRET || 'boom-local-preview-only-secret';
const HASH = process.env.STAFF_PASSWORD_HASH || '';
const SALT = 'boom-staff-2026';

const b64u = (s) => Buffer.from(s).toString('base64url');
const unb64u = (s) => Buffer.from(String(s), 'base64url').toString('utf8');
function sign(payload) {
  const body = b64u(JSON.stringify(payload));
  return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}
function verify(token) {
  try {
    const [body, mac] = String(token).split('.');
    const want = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
    const a = Buffer.from(mac || ''), b = Buffer.from(want);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return JSON.parse(unb64u(body));
  } catch { return null; }
}
function passwordHash(plain) { return crypto.createHash('sha256').update(SALT + plain).digest('hex'); }
function checkPassword(plain) {
  if (!HASH) return false;
  const a = Buffer.from(passwordHash(plain)), b = Buffer.from(HASH);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function makeCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let answer = '';
  for (let i = 0; i < 4; i++) answer += chars[crypto.randomInt(chars.length)];
  const id = sign({ h: crypto.createHash('sha256').update(answer).digest('hex'), exp: Date.now() + 5 * 60 * 1000 });
  const colors = ['#8b3a2f', '#2f5d50', '#3b4a7a', '#7a4b2f'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="42" viewBox="0 0 104 42">
<rect width="104" height="42" fill="#f2ede4"/>
<path d="M0 ${10 + crypto.randomInt(22)} Q 52 ${crypto.randomInt(42)} 104 ${10 + crypto.randomInt(22)}" stroke="#c9bda9" fill="none" stroke-width="1"/>
<path d="M0 ${10 + crypto.randomInt(22)} Q 52 ${crypto.randomInt(42)} 104 ${10 + crypto.randomInt(22)}" stroke="#d8cbb8" fill="none" stroke-width="1"/>
${[...answer].map((c, i) => `<text x="${9 + i * 23}" y="${27 + (crypto.randomInt(7) - 3)}" font-family="monospace" font-size="22" font-weight="bold" fill="${colors[i % colors.length]}" transform="rotate(${crypto.randomInt(13) - 6} ${14 + i * 23} 21)">${c}</text>`).join('')}
</svg>`;
  return { id, svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') };
}
function checkCaptcha(id, text) {
  const p = verify(id || '');
  const h = crypto.createHash('sha256').update(String(text || '').trim().toUpperCase()).digest('hex');
  return !!(p && p.exp > Date.now() && p.h === h);
}
const USER = { id: 'staff-owner', username: 'admin', name: '站长', displayName: '站长', email: '', role: 'admin', disabled: false };
function login(input) {
  if (String(input.username || '').trim().toLowerCase() !== 'admin') throw new Error('用户名或密码不对');
  if (!checkPassword(String(input.password || ''))) throw new Error('用户名或密码不对');
  if (!checkCaptcha(input.captchaId, input.captchaText)) throw new Error('验证码不对或已过期，请换一张');
  const token = sign({ u: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 });
  const secure = process.env.STAFF_NO_SECURE === '1' ? '' : 'Secure; ';
  return { user: USER, cookie: 'boom_staff=' + token + '; HttpOnly; ' + secure + 'SameSite=Lax; Path=/; Max-Age=28800' };
}
function currentUser(cookieHeader) {
  const m = /(?:^|;\s*)boom_staff=([^;]+)/.exec(cookieHeader || '');
  const p = m && verify(m[1]);
  return p && p.u === 'admin' && p.exp > Date.now() ? USER : null;
}
const LOGOUT_COOKIE = 'boom_staff=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

module.exports = { makeCaptcha, checkCaptcha, login, currentUser, LOGOUT_COOKIE, USER, passwordHash };
