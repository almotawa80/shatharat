/* شذرات — عامل الإعجابات على Cloudflare Workers + D1
   يحتاج ربط قاعدة D1 باسم DB. لا يخزّن أي بيانات شخصية: فقط رقم الحكمة ومعرّفًا عشوائيًا للجهاز. */
const ORIGINS = ['https://shatharaat.com', 'https://www.shatharaat.com'];
const SID = /^m\d{1,6}$/, DEV = /^[a-z0-9]{16,40}$/;
const DAILY_LIMIT = 300; // أقصى عدد إعجابات للجهاز في اليوم

function cors(req) {
  const o = req.headers.get('Origin') || '';
  const ok = ORIGINS.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  return {
    'Access-Control-Allow-Origin': ok ? o : ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
const json = (req, body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(req), ...extra } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
    try {
      // كل الأعداد: { counts: { m12: 4, ... } }
      if (req.method === 'GET' && path === '/counts') {
        const r = await env.DB.prepare('SELECT sid, COUNT(*) AS n FROM likes GROUP BY sid').all();
        const counts = {};
        for (const row of r.results) counts[row.sid] = row.n;
        return json(req, { counts }, 200, { 'Cache-Control': 'public, max-age=20' });
      }
      // الأكثر إعجابًا خلال مدة: /top?days=7&limit=6
      if (req.method === 'GET' && path === '/top') {
        const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 365);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 1), 20);
        const since = Math.floor(Date.now() / 1000) - days * 86400;
        const r = await env.DB.prepare('SELECT sid, COUNT(*) AS n FROM likes WHERE ts >= ? GROUP BY sid ORDER BY n DESC, MAX(ts) DESC LIMIT ?').bind(since, limit).all();
        return json(req, { top: r.results }, 200, { 'Cache-Control': 'public, max-age=60' });
      }
      // إعجاب أو إلغاؤه: { sid, dev, on }
      if (req.method === 'POST' && path === '/like') {
        const b = await req.json().catch(() => ({}));
        const sid = String(b.sid || ''), dev = String(b.dev || ''), on = !!b.on;
        if (!SID.test(sid) || !DEV.test(dev)) return json(req, { error: 'bad input' }, 400);
        const now = Math.floor(Date.now() / 1000);
        if (on) {
          const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE dev = ? AND ts >= ?').bind(dev, now - 86400).first();
          if (c && c.n >= DAILY_LIMIT) return json(req, { error: 'limit' }, 429);
          await env.DB.prepare('INSERT OR IGNORE INTO likes (sid, dev, ts) VALUES (?, ?, ?)').bind(sid, dev, now).run();
        } else {
          await env.DB.prepare('DELETE FROM likes WHERE sid = ? AND dev = ?').bind(sid, dev).run();
        }
        const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE sid = ?').bind(sid).first();
        return json(req, { sid, n: r ? r.n : 0, on });
      }
      return json(req, { ok: true, name: 'shatharat-likes' });
    } catch (e) {
      return json(req, { error: 'server' }, 500);
    }
  },
};
