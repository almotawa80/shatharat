import json,os,shutil,re
OUT='dist'; os.makedirs(OUT+'/icons',exist_ok=True)
URL='https://shatharaat.com/'
# likes Worker URL (Cloudflare); empty hides the like buttons
import os
LIKES=os.environ.get('HIKAM_LIKES') or (open('likes/url.txt').read().strip() if os.path.exists('likes/url.txt') else '')
import hashlib
SEEDV=hashlib.sha1(open('seed.js','rb').read()).hexdigest()[:10]  # new sayings change the URL, so no cache keeps the old list
frag=open('index.html').read()
i=frag.index('<main id="app">')
head,body=frag[:i],frag[i:]
desc='شذرات: حكم وأمثال وطرائف من أقوال د. عبدالعزيز فيصل المطوع، تُقرأ وتُشارَك في بطاقات مزخرفة.'
meta=f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta property="og:type" content="website"><meta property="og:locale" content="ar_AR"><meta property="og:title" content="شذرات"><meta property="og:description" content="{desc}"><meta property="og:site_name" content="شذرات"><meta property="og:url" content="{URL}"><meta property="og:image" content="{URL}icons/og-image.png?v=3"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{URL}icons/og-image.png?v=3">
<link rel="canonical" href="{URL}"><link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#9b2c1f" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#1c1b19" media="(prefers-color-scheme: dark)"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="شذرات"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="64x64" href="icons/favicon-64.png">
<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<script src="config.js" defer></script>
<script src="seed.js?v={SEEDV}" defer></script>
<script>window.HIKAM_STATIC=true;window.HIKAM_LIKES='{LIKES}'</script>
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "519420ff1f074d8d8b0c7c8aeeff84ca"}}'></script>
<script>if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',function(){{navigator.serviceWorker.register('sw.js').catch(function(){{}})}});</script>
'''
head=head.replace('<meta name="description" content="شذرات: حكم وأمثال تُقرأ وتُشارَك في بطاقات مزخرفة.">',f'<meta name="description" content="{desc}">')
# seed.js is deferred so the page paints before the 1 MB list arrives; the app starts once it is there
assert body.count('<script>\n(function(){')==1 and body.rstrip().endswith('})();\n</script>')
body=body.replace('<script>\n(function(){','<script>\nfunction hikamApp(){\n(function(){',1)
body=body.rstrip()[:-len('</script>')]+'}\nif(window.HIKAM_SEED)hikamApp();else document.addEventListener("DOMContentLoaded",hikamApp);\n</script>'
open(OUT+'/index.html','w').write(meta+head+'</head>\n<body>\n'+body+'\n</body>\n</html>\n')
# the saying of the day for the next 60 days, chosen here so the prerendered masthead and the app agree
import datetime
def fnv(t):
    h=2166136261
    for ch in t.encode('utf-16-le').decode('utf-16-le'):
        for u in ([ord(ch)] if ord(ch)<0x10000 else [0xD800+((ord(ch)-0x10000)>>10),0xDC00+((ord(ch)-0x10000)&0x3FF)]):
            h^=u;h=(h*16777619)&0xFFFFFFFF
    return h
_seed=json.loads(open('seed.js').read().split('=',1)[1].strip().rstrip(';'))
pool=sorted([x for x in _seed if x['kind'] in ('hikma','mathal') and len(x['text'])<=200],key=lambda x:x['id'])
# Khalid's reviewed list of daily picks, one per day in order, a year without repeats
PICKS=None;PF='/mnt/project-files/sayings/daily_picks.json'
if os.path.exists(PF):
    _p=json.load(open(PF));_by={x['id']:x for x in _seed};_ids=[i for i in _p['ids'] if i in _by and i not in set(_p.get('dropped',[]))]
    if _ids and _p.get('status')=='approved': PICKS={'start':(datetime.date.fromisoformat(_p.get('start','2026-11-01'))-datetime.date(1970,1,1)).days,'ids':_ids}
VOTD={}
for d in range(-1,60):
    t=datetime.date.today()+datetime.timedelta(days=d);k=f'{t.year}-{t.month-1}-{t.day}'
    if PICKS: x=_by[PICKS['ids'][((t-datetime.date(1970,1,1)).days-PICKS['start'])%len(PICKS['ids'])]]
    else: x=pool[fnv(k)%len(pool)]
    VOTD[k]=[x['id'],x['kind'],x['text']]
html=open(OUT+'/index.html').read().replace('<script src="config.js" defer></script>','<script>window.HIKAM_VOTD='+json.dumps(VOTD,ensure_ascii=False,separators=(',',':'))+(';window.HIKAM_PICKS='+json.dumps(PICKS,separators=(',',':')) if PICKS else '')+'</script>\n<script src="config.js" defer></script>',1)
open(OUT+'/index.html','w').write(html)
import subprocess
if os.path.exists('tools/shell.js'):
    try: print(subprocess.run(['node','tools/shell.js',OUT],capture_output=True,text=True,timeout=120).stdout.strip())
    except Exception as e: print('shell skipped',e)
# self-hosted fonts (OFL), cached by the service worker for offline use
if os.path.isdir('fonts'): shutil.copytree('fonts',OUT+'/fonts',dirs_exist_ok=True)
shutil.copy('seed.js',OUT+'/seed.js')
if not os.path.exists(OUT+'/config.js'):
    open(OUT+'/config.js','w').write('''// بعد تجهيز Supabase ضع الرابط والمفتاح العام (anon) هنا. لا تضع مفتاح service_role أبدًا.
window.HIKAM_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  DEMO_LOGIN: false
};
''')
open(OUT+'/.nojekyll','w').write('')
open(OUT+'/sw.js','w').write('''// Network first, cache as fallback, so the app opens offline with the last version seen.
const C='hikam-v3';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','fonts/amiri-arabic-700-normal.woff2'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));
});
''')
json.dump({"name":"شذرات","short_name":"شذرات","lang":"ar","dir":"rtl","start_url":"./","scope":"./","display":"standalone","background_color":"#f4efe7","theme_color":"#9b2c1f",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},
 open(OUT+'/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
# data SQL
seed=json.loads(open('seed.js').read()[len('window.HIKAM_SEED='):-1])
q=lambda v:"'"+str(v).replace("'","''")+"'"
rows=[]
for i,x in enumerate(seed):
    rows.append(f"({q('m'+str(i+1))},{q(x['text'])},{q(x['kind'])},{q(x.get('topic',''))},{q(x.get('note',''))},{q(x.get('source',''))},{1759500000000-i*60000})")
open(OUT+'/supabase-data.sql','w').write('-- شذرات: إدخال الحكم ('+str(len(rows))+') بعد تشغيل supabase-setup.sql\ninsert into public.hikam_sayings (id,text,kind,topic,note,source,created) values\n'+',\n'.join(rows)+'\non conflict (id) do nothing;\n')
print(len(rows))

# one small static page per saying, so a shared link previews the saying itself
import html as _h
os.makedirs(OUT+'/s',exist_ok=True)
# per-saying preview images (tools/og.js) where they exist, the site image otherwise
OGD=next((d for d in ('og','../og') if os.path.exists(d+'/index.json')),None)  # _dev builds read the deployed og/ at the repo root
OGIDX=json.load(open(OGD+'/index.json')) if OGD else {}
if OGIDX:
    os.makedirs(OUT+'/og',exist_ok=True)
    for k in OGIDX:
        if os.path.exists(f'{OGD}/{k}.jpg') and os.path.abspath(OGD)!=os.path.abspath(OUT+'/og'): shutil.copy(f'{OGD}/{k}.jpg',OUT+f'/og/{k}.jpg')
    shutil.copy(OGD+'/index.json',OUT+'/og/index.json')
OGI=lambda i:f'{URL}og/{i}.jpg?v={OGIDX[i][:6]}' if i in OGIDX and os.path.exists(f'{OGD}/{i}.jpg') else f'{URL}icons/og-image.png?v=3'
seed=json.loads(open('seed.js').read().split('=',1)[1].strip().rstrip(';'))
for n,x in enumerate(seed):
    t=x['text'].strip();short=t if len(t)<=110 else t[:108].rsplit(' ',1)[0]+'…'
    T=_h.escape(short,quote=True);full=_h.escape(t);i=x.get('id') or f'm{n+1}'
    open(OUT+f'/s/{i}.html','w').write(f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{T} | شذرات</title><meta name="description" content="من أقوال د. عبدالعزيز فيصل المطوع · شذرات">
<meta property="og:type" content="article"><meta property="og:site_name" content="شذرات"><meta property="og:title" content="{T}"><meta property="og:description" content="من أقوال د. عبدالعزيز فيصل المطوع · شذرات"><meta property="og:url" content="{URL}s/{i}.html"><meta property="og:image" content="{OGI(i)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{URL}s/{i}.html"><link rel="icon" href="../icons/favicon-64.png"><meta http-equiv="refresh" content="0;url=../#s/{i}"><script>location.replace('../#s/{i}')</script></head>
<body style="font-family:serif;text-align:center;padding:40px"><p style="font-size:1.4rem">{full}</p><p><a href="../#s/{i}">افتح في شذرات</a></p></body></html>
''')
print('static pages',len(seed))
