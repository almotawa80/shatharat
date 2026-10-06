/* Shatharat: likes + admin edits on Cloudflare Workers + D1.
   Needs a D1 binding named DB and a Secret named ADMIN_KEY (the admin password). No personal data is stored. */
const ORIGINS = ['https://shatharaat.com', 'https://www.shatharaat.com'];
const SID = /^[a-z][a-z0-9]{1,24}$/, DEV = /^[a-z0-9]{16,40}$/;
const DAILY_LIMIT = 300;
const KINDS = ['hikma', 'mathal', 'tarfa', 'ghazal'];

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

function same(a, b) {
  a = String(a || ''); b = String(b || '');
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

async function isAdmin(req, env, key) {
  const ip = req.headers.get('CF-Connecting-IP') || 'x', now = Math.floor(Date.now() / 1000);
  const f = await env.DB.prepare('SELECT COUNT(*) AS n FROM attempts WHERE ip = ? AND ts >= ?').bind(ip, now - 600).first();
  if (f && f.n >= 8) return 'limit';
  if (env.ADMIN_KEY && key && same(key, env.ADMIN_KEY)) return 'ok';
  await env.DB.prepare('INSERT INTO attempts (ip, ts) VALUES (?, ?)').bind(ip, now).run();
  return 'no';
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
    try {
      if (req.method === 'GET' && path === '/counts') {
        const r = await env.DB.prepare('SELECT sid, COUNT(*) AS n FROM likes GROUP BY sid').all();
        const counts = {};
        for (const row of r.results) counts[row.sid] = row.n;
        return json(req, { counts }, 200, { 'Cache-Control': 'public, max-age=20' });
      }
      if (req.method === 'GET' && path === '/top') {
        const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 365);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 1), 20);
        const since = Math.floor(Date.now() / 1000) - days * 86400;
        const r = await env.DB.prepare('SELECT sid, COUNT(*) AS n FROM likes WHERE ts >= ? GROUP BY sid ORDER BY n DESC, MAX(ts) DESC LIMIT ?').bind(since, limit).all();
        return json(req, { top: r.results }, 200, { 'Cache-Control': 'public, max-age=60' });
      }
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
      if (req.method === 'GET' && path === '/content') {
        const e = await env.DB.prepare('SELECT id, op, data FROM edits').all();
        const s = await env.DB.prepare('SELECT k, v FROM settings').all();
        const settings = {};
        for (const row of s.results) settings[row.k] = row.v;
        const edits = e.results.map(row => ({ id: row.id, op: row.op, data: row.data ? JSON.parse(row.data) : null }));
        return json(req, { edits, settings }, 200, { 'Cache-Control': 'no-cache' });
      }
      if (req.method === 'POST' && path.startsWith('/admin/')) {
        const b = await req.json().catch(() => ({}));
        const auth = await isAdmin(req, env, b.key);
        if (auth === 'limit') return json(req, { error: 'limit' }, 429);
        if (auth !== 'ok') return json(req, { error: 'auth' }, 401);
        const now = Math.floor(Date.now() / 1000);
        if (path === '/admin/login') return json(req, { ok: true });
        if (path === '/admin/save') {
          const items = Array.isArray(b.items) ? b.items.slice(0, 500) : [];
          const stmts = [];
          for (const x of items) {
            const id = str(x.id, 30), text = str(x.text, 4000);
            if (!SID.test(id) || !text) return json(req, { error: 'bad item' }, 400);
            const d = { id, text, kind: KINDS.includes(x.kind) ? x.kind : 'hikma', topic: str(x.topic, 100), note: str(x.note, 1500), created: +x.created || now * 1000 };
            stmts.push(env.DB.prepare('INSERT OR REPLACE INTO edits (id, op, data, ts) VALUES (?, ?, ?, ?)').bind(id, 'set', JSON.stringify(d), now));
          }
          if (stmts.length) await env.DB.batch(stmts);
          return json(req, { ok: true, saved: stmts.length });
        }
        if (path === '/admin/delete') {
          const id = str(b.id, 30);
          if (!SID.test(id)) return json(req, { error: 'bad id' }, 400);
          await env.DB.prepare('INSERT OR REPLACE INTO edits (id, op, data, ts) VALUES (?, ?, ?, ?)').bind(id, 'del', null, now).run();
          return json(req, { ok: true });
        }
        if (path === '/admin/settings') {
          const st = b.settings || {};
          for (const k of ['site', 'father', 'tagline']) {
            if (st[k] !== undefined) await env.DB.prepare('INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)').bind(k, str(st[k], 200)).run();
          }
          return json(req, { ok: true });
        }
      }
      return json(req, { ok: true, name: 'shatharat-likes' });
    } catch (e) {
      return json(req, { error: 'server' }, 500);
    }
  },
};
